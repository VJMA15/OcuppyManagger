import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Solicitud from '../models/solicitud.model';
import User from '../models/user.model';
import catchAsync from '../utils/catchAsync';
import { AuthenticatedRequest } from '../types/index';
import { BitacoraController } from './bitacora.controller';
import { emitEvent, Events } from '../services/eventBus';
import NotificationService from '../services/notification.service';

// Utilidad simple para generar una contraseña temporal segura
const generateTempPassword = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@$%&';
  const length = 10;
  let pass = '';
  for (let i = 0; i < length; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass;
};

export class SolicitudController {
  private notificationService = new NotificationService();
  // Crear nueva solicitud de acceso (público)
  crearSolicitud = catchAsync(async (req: Request, res: Response) => {
    const { fullName, documentNumber, email, requestedRole, trainingCenter, justification } = req.body;

    // Validación básica adicional
    if (!fullName || !documentNumber || !email || !requestedRole || !justification) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios'
      });
    }

    // Validar rol solicitado permitido en esta vía
    const allowedRoles = ['instructor', 'admin'];
    if (!allowedRoles.includes(String(requestedRole))) {
      return res.status(400).json({
        success: false,
        message: 'Rol solicitado inválido. Solo instructor o admin'
      });
    }

    // Verificar si ya existe usuario con el mismo email o cc
    const existingUser = await User.findOne({ $or: [{ email }, { cc: documentNumber }] }).select('_id');
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un usuario registrado con este email o documento'
      });
    }

    // Evitar solicitudes duplicadas pendientes para mismo email/cc
    const existingPending = await Solicitud.findOne({
      status: 'pendiente',
      $or: [{ email }, { documentNumber }]
    }).select('_id');
    if (existingPending) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una solicitud pendiente para este correo o documento'
      });
    }

    const solicitud = await Solicitud.create({
      fullName,
      documentNumber,
      email,
      requestedRole,
      // trainingCenter es opcional
      ...(trainingCenter ? { trainingCenter } : {}),
      justification
    });

    res.status(201).json({
      success: true,
      message: 'Solicitud creada exitosamente',
      data: solicitud
    });
    // Notificar por correo a administradores sobre la nueva solicitud
    try {
      await this.notificationService.notifySolicitudCreatedForAdmins({
        fullName,
        documentNumber,
        email,
        requestedRole,
        trainingCenter,
        justification
      });
    } catch (err) {
      console.error('❌ [SolicitudController] Error notificando solicitud por correo:', err instanceof Error ? err.message : err);
    }
    try {
      emitEvent('solicitudes', Events.SOLICITUDES_CHANGED, { action: 'created', id: String((solicitud as any)?._id) });
    } catch (_) {}
  });

  // Listar solicitudes con filtros (admin/guardia)
  obtenerSolicitudes = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const {
      status,
      search,
      startDate,
      endDate,
      page = '1',
      limit = '20',
      role,                // 'instructor' | 'guardia'
      center,              // trainingCenter (texto)
      reviewer,            // reviewedBy (ObjectId)
      dateField = 'created', // 'created' | 'reviewed'
      sort = 'createdAt:desc' // "campo:orden" (createdAt|reviewedAt):(asc|desc)
    } = req.query as any;

    const query: any = {};

    // Filtro por estado (acepta lista separada por comas)
    if (status) {
      const allowed = ['pendiente', 'aprobada', 'rechazada'];
      const statuses = String(status)
        .split(',')
        .map(s => s.trim())
        .filter(s => allowed.includes(s));
      if (statuses.length > 0) query.status = { $in: statuses };
    }

    // Búsqueda textual amplia
    if (search) {
      const s = String(search).trim();
      query.$or = [
        { fullName: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { documentNumber: { $regex: s, $options: 'i' } },
        { trainingCenter: { $regex: s, $options: 'i' } },
        { justification: { $regex: s, $options: 'i' } }
      ];
    }

    // Filtro por rol solicitado
    if (role && ['instructor', 'guardia', 'admin'].includes(String(role))) {
      query.requestedRole = role;
    }

    // Filtro por centro de formación
    if (center) {
      query.trainingCenter = { $regex: String(center).trim(), $options: 'i' };
    }

    // Filtro por revisor (ObjectId)
    if (reviewer && mongoose.isValidObjectId(String(reviewer))) {
      query.reviewedBy = new mongoose.Types.ObjectId(String(reviewer));
    }

    // Rango de fechas sobre el campo seleccionado
    const dateFieldParam = String(dateField);
    const dateFieldName = dateFieldParam === 'reviewed' ? 'reviewedAt' : 'createdAt';
    if (startDate || endDate) {
      query[dateFieldName] = {};
      if (startDate) query[dateFieldName].$gte = new Date(String(startDate));
      if (endDate) query[dateFieldName].$lte = new Date(String(endDate));
    }

    // Paginación
    const pageNum = Math.max(parseInt(String(page), 10), 1);
    const limitNum = Math.min(Math.max(parseInt(String(limit), 10), 1), 100);
    const skip = (pageNum - 1) * limitNum;

    // Ordenamiento configurable
    const [sortFieldRaw, sortDirRaw] = String(sort).split(':');
    const sortField = ['createdAt', 'reviewedAt'].includes(sortFieldRaw) ? sortFieldRaw : dateFieldName;
    const sortDir = sortDirRaw === 'asc' ? 1 : -1;
    const sortObj: any = { [sortField]: sortDir };

    const [items, total] = await Promise.all([
      Solicitud.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate('reviewedBy', 'nombre email role'),
      Solicitud.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: items,
      results: items.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  });

  // Obtener solicitud por ID
  obtenerSolicitudPorId = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const solicitud = await Solicitud.findById(id).populate('reviewedBy', 'nombre email role');
    if (!solicitud) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }
    res.json({ success: true, data: solicitud });
  });

  // Aprobar solicitud: crea usuario y marca la solicitud
  aprobarSolicitud = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const reviewerId = req.user?.id;

    const solicitud = await Solicitud.findById(id);
    if (!solicitud) return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    if (solicitud.status !== 'pendiente') {
      return res.status(400).json({ success: false, message: 'La solicitud ya fue revisada' });
    }

    // No permitir aprobación si ya existe usuario
    const existingUser = await User.findOne({ $or: [{ email: solicitud.email }, { cc: solicitud.documentNumber }] }).select('_id');
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Ya existe un usuario con este email o documento' });
    }

    const tempPassword = generateTempPassword();
    const newUser = await User.create({
      nombre: solicitud.fullName,
      cc: solicitud.documentNumber,
      email: solicitud.email,
      password: tempPassword,
      role: solicitud.requestedRole,
      activo: true
    });

    solicitud.status = 'aprobada';
    solicitud.reviewedBy = reviewerId ? new mongoose.Types.ObjectId(reviewerId) : undefined;
    solicitud.reviewedAt = new Date();
    solicitud.decisionReason = 'Aprobada y usuario creado';
    await solicitud.save();

    // Registrar en bitácora (best-effort)
    if (reviewerId) {
      await BitacoraController.registrarAccion(
        reviewerId,
        'usuario_creado',
        'solicitud',
        String(solicitud._id),
        `Aprobada solicitud para ${solicitud.fullName} (rol: ${solicitud.requestedRole})`
      );
    }

    res.json({
      success: true,
      message: 'Solicitud aprobada y usuario creado exitosamente',
      data: {
        solicitud,
        usuario: {
          id: newUser._id,
          nombre: newUser.nombre,
          email: newUser.email,
          role: newUser.role,
          cc: newUser.cc,
          tempPassword // se recomienda forzar cambio de contraseña al primer login
        }
      }
    });
    // Notificar por correo al solicitante con la contraseña temporal
    try {
      await this.notificationService.notifySolicitudApprovedToUser(
        { fullName: solicitud.fullName, email: solicitud.email, requestedRole: solicitud.requestedRole },
        tempPassword,
        { email: req.user?.email }
      );
    } catch (err) {
      console.error('❌ [SolicitudController] Error notificando aprobación de solicitud al usuario:', err instanceof Error ? err.message : err);
    }
    try {
      emitEvent('solicitudes', Events.SOLICITUDES_CHANGED, { action: 'approved', id: String((solicitud as any)?._id) });
    } catch (_) {}
  });

  // Rechazar solicitud
  rechazarSolicitud = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;
    const reviewerId = req.user?.id;

    const solicitud = await Solicitud.findById(id);
    if (!solicitud) return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    if (solicitud.status !== 'pendiente') {
      return res.status(400).json({ success: false, message: 'La solicitud ya fue revisada' });
    }

    solicitud.status = 'rechazada';
    solicitud.reviewedBy = reviewerId ? new mongoose.Types.ObjectId(reviewerId) : undefined;
    solicitud.reviewedAt = new Date();
    solicitud.decisionReason = reason || 'Solicitud rechazada';
    await solicitud.save();

    if (reviewerId) {
      await BitacoraController.registrarAccion(
        reviewerId,
        'reserva_rechazada',
        'solicitud',
        String(solicitud._id),
        `Solicitud rechazada: ${reason || 'sin motivo especificado'}`
      );
    }

    res.json({ success: true, message: 'Solicitud rechazada exitosamente', data: solicitud });
    // Notificar por correo al solicitante informando el rechazo
    try {
      await this.notificationService.notifySolicitudRejectedToUser(
        { fullName: solicitud.fullName, email: solicitud.email, requestedRole: solicitud.requestedRole },
        reason || 'Solicitud rechazada',
        { email: req.user?.email }
      );
    } catch (err) {
      console.error('❌ [SolicitudController] Error notificando rechazo de solicitud al usuario:', err instanceof Error ? err.message : err);
    }
    try {
      emitEvent('solicitudes', Events.SOLICITUDES_CHANGED, { action: 'rejected', id: String((solicitud as any)?._id) });
    } catch (_) {}
  });

  // Estadísticas simples por estado
  obtenerEstadisticas = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const stats = await Solicitud.aggregate([
      { $group: { _id: '$status', total: { $sum: 1 } } }
    ]);
    const format: Record<string, number> = { pendiente: 0, aprobada: 0, rechazada: 0 };
    stats.forEach(s => { format[s._id] = s.total; });
    res.json({ success: true, data: format });
  });
}

export default new SolicitudController();