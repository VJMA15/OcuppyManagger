import { Request, Response } from 'express';
import { ReservationService } from '../services/reservation.service';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import User from '../models/user.model';
import Bitacora from '../models/bitacora.model';

export class ReservationController {
  private reservationService = new ReservationService();

  async createReservation(req: Request, res: Response) {
    try {
      // Obtener el usuario autenticado desde el middleware de autenticación
      // Asumiendo que tienes middleware que agrega user al request
      const userCC = (req as any).user?.cc || req.body.userCC;
      
      if (!userCC) {
        return res.status(400).json({
          success: false,
          message: 'Usuario no autenticado o CC no proporcionado'
        });
      }
      
      // Buscar usuario por CC
      const user = await User.findOne({ cc: userCC });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado en el sistema'
        });
      }
      
      // Normalizar fecha (puede venir como 'fecha' desde el frontend)
      const rawDate = (req.body.reservationDate || req.body.fecha || req.body.startDate);
      const normalizedDate = rawDate ? new Date(rawDate) : null;
      if (!normalizedDate) {
        return res.status(400).json({
          success: false,
          message: 'La fecha de la reserva es requerida'
        });
      }
      normalizedDate.setHours(0, 0, 0, 0);

      const reservationData: CreateReservationDto = {
        ...req.body,
        reservationDate: normalizedDate,
        userId: user._id // Usar el ObjectId del usuario autenticado
      };

      const reservation = await this.reservationService.createReservation(reservationData);
      
      res.status(201).json({
        success: true,
        data: reservation,
        message: 'Reserva creada exitosamente'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      const isDuplicate = (error as any)?.code === 11000;
      const isPendingLimit = typeof errorMessage === 'string' && errorMessage.toLowerCase().includes('reserva pendiente');
      const statusCode = isDuplicate || isPendingLimit ? 409 : 400; // 400 para disponibilidad, 409 para conflicto de pendiente
      res.status(statusCode).json({
        success: false,
        message: isDuplicate
          ? 'Ya tienes una reserva pendiente. Cancélala o espera a que se resuelva.'
          : errorMessage
      });
    }
  }

  async getReservations(req: Request, res: Response) {
    try {
      const filters = this.buildFilters(req.query);
      const reservations = await this.reservationService.getReservations(filters);
      
      res.json({
        success: true,
        data: reservations
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  }

  async getMyReservations(req: Request, res: Response) {
    try {
      // Ahora el userId debe venir como parámetro de query
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId es requerido'
        });
      }

      const reservations = await this.reservationService.getReservations({
        userId: userId as string
      });
      
      res.json({
        success: true,
        data: reservations
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  }

  async approveReservation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { approvedBy } = req.body; // El ID del aprobador viene del frontend
      
      if (!approvedBy) {
        return res.status(400).json({
          success: false,
          message: 'approvedBy es requerido'
        });
      }

      const reservation = await this.reservationService.approveReservation(
        id,
        approvedBy
      );
      
      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: 'Reserva no encontrada'
        });
      }

      // Registrar en bitácora
      await Bitacora.registrarAccion(
        approvedBy,
        'APROBAR_RESERVA',
        'reserva',
        id,
        JSON.stringify({
          reservaId: id,
          usuarioSolicitante: reservation.userId,
          ambiente: reservation.environmentId,
          fechaReserva: reservation.startDate,
          fechaAprobacion: new Date()
        }),
        req.ip
      );
      
      res.json({
        success: true,
        data: reservation,
        message: 'Reserva aprobada exitosamente'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  }

  async rejectReservation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'reason es requerido'
        });
      }

      const reservation = await this.reservationService.rejectReservation(
        id,
        reason
      );
      
      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: 'Reserva no encontrada'
        });
      }

      // Registrar en bitácora
      await Bitacora.registrarAccion(
        (req as any).user?.id || 'sistema',
        'RECHAZAR_RESERVA',
        'reserva',
        id,
        JSON.stringify({
          reservaId: id,
          usuarioSolicitante: reservation.userId,
          ambiente: reservation.environmentId,
          fechaReserva: reservation.startDate,
          motivoRechazo: reason,
          fechaRechazo: new Date()
        }),
        req.ip
      );
      
      res.json({
        success: true,
        data: reservation,
        message: 'Reserva rechazada exitosamente'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  }

  async cancelReservation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      // Obtener usuario autenticado
      const currentUser = (req as any).user;
      if (!currentUser) {
        return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
      }

      // Buscar reserva para validar permisos y estado
      const reservation = await this.reservationService.getReservationById(id);
      if (!reservation) {
        return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
      }

      // Validar estado
      if (reservation.status === 'cancelled') {
        return res.status(400).json({ success: false, message: 'La reserva ya está cancelada' });
      }
      if (reservation.status === 'completed') {
        return res.status(400).json({ success: false, message: 'No se puede cancelar una reserva completada' });
      }

      // Permitir cancelar si es admin/guardia o dueño de la reserva
      const isPrivileged = ['admin', 'guardia'].includes(currentUser.role);
      const isOwner = String(reservation.userId) === String(currentUser._id || currentUser.id);
      if (!isPrivileged && !isOwner) {
        return res.status(403).json({ success: false, message: 'No tienes permisos para cancelar esta reserva' });
      }

      const cancelled = await this.reservationService.cancelReservation(id, reason);

      // Registrar en bitácora
      try {
        await Bitacora.registrarAccion(
          currentUser._id?.toString() || currentUser.id || 'sistema',
          'reserva_cancelada',
          'reserva',
          id,
          JSON.stringify({
            reservaId: id,
            usuarioSolicitante: reservation.userId,
            ambiente: reservation.environmentId,
            fechaReserva: reservation.startDate,
            motivoCancelacion: reason || '',
            fechaCancelacion: new Date()
          }),
          req.ip,
          req.get('User-Agent') || ''
        );
      } catch (bitErr) {
        console.error('Error registrando cancelación en bitácora:', bitErr);
      }

      res.json({ success: true, data: cancelled, message: 'Reserva cancelada exitosamente' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ success: false, message: errorMessage });
    }
  }

  async deleteReservation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      if (!currentUser) {
        return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
      }

      const reservation = await this.reservationService.getReservationById(id);
      if (!reservation) {
        return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
      }

      // Permisos: admin/guardia pueden eliminar cualquiera; el dueño puede eliminar sus reservas
      const isPrivileged = ['admin', 'guardia'].includes(currentUser.role);
      const isOwner = String(reservation.userId) === String(currentUser._id || currentUser.id);
      if (!isPrivileged && !isOwner) {
        return res.status(403).json({ success: false, message: 'No tienes permisos para eliminar esta reserva' });
      }

      // Estados permitidos para eliminar desde la UI: REJECTED, CANCELLED, APPROVED
      const normalizedStatus = String(reservation.status).toUpperCase();
      if (!['REJECTED','CANCELLED','APPROVED'].includes(normalizedStatus)) {
        return res.status(400).json({ success: false, message: 'Solo se pueden eliminar reservas aprobadas, rechazadas o canceladas' });
      }

      const deleted = await this.reservationService.deleteReservation(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Reserva no encontrada para eliminar' });
      }

      return res.json({ success: true, data: deleted, message: 'Reserva eliminada exitosamente' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return res.status(500).json({ success: false, message: errorMessage });
    }
  }

  async deleteRejectedReservations(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      if (!currentUser) {
        return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
      }

      // Solo admin o guardia pueden eliminar rechazadas en lote
      if (!['admin','guardia'].includes(currentUser.role)) {
        return res.status(403).json({ success: false, message: 'No tienes permisos para eliminar reservas rechazadas' });
      }

      const result = await this.reservationService.deleteRejectedReservations();
      return res.json({ success: true, deletedCount: result.deletedCount, message: `Eliminadas ${result.deletedCount} reservas rechazadas` });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return res.status(500).json({ success: false, message: errorMessage });
    }
  }

  private buildFilters(query: any) {
    const filters: any = {};
    
    if (query.status) filters.status = query.status;
    if (query.environmentId) filters.environmentId = query.environmentId;
    if (query.userId) filters.userId = query.userId;
    if (query.startDate && query.endDate) {
      filters.startDate = {
        $gte: new Date(query.startDate),
        $lte: new Date(query.endDate)
      };
    }
    
    return filters;
  }

  async getAvailability(req: Request, res: Response) {
    try {
      const { environmentId, date } = req.query as { environmentId?: string; date?: string };
      if (!environmentId || !date) {
        return res.status(400).json({
          success: false,
          message: 'Parámetros requeridos: environmentId y date'
        });
      }
      const availability = await this.reservationService.getDailyAvailability(environmentId, new Date(date));
      res.json({ success: true, data: availability });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ success: false, message: errorMessage });
    }
  }
}