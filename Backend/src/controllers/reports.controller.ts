import { Request, Response } from 'express';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { ReservationModel } from '../models/reservation.model';
import Entrega from '../models/entrega.model';
import Ambiente from '../models/ambiente.model';
import User from '../models/user.model';
import mongoose from 'mongoose';

export class ReportsController {
  /**
   * Obtener estadísticas generales del sistema
   */
  getGeneralStats = catchAsync(async (req: Request, res: Response) => {
    const { fechaInicio, fechaFin } = req.query;
    
    // Construir filtro de fechas
    const dateFilter: any = {};
    if (fechaInicio || fechaFin) {
      dateFilter.createdAt = {};
      if (fechaInicio) dateFilter.createdAt.$gte = new Date(fechaInicio as string);
      if (fechaFin) dateFilter.createdAt.$lte = new Date(fechaFin as string);
    }

    // Obtener estadísticas en paralelo
    const [totalAmbientes, totalUsuarios, totalReservas, totalEntregas, reservasPorEstado, entregasPorEstado] = await Promise.all([
      Ambiente.countDocuments({ activo: true }),
      User.countDocuments({ activo: true }),
      ReservationModel.countDocuments(dateFilter),
      Entrega.countDocuments(dateFilter),
      ReservationModel.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$estado', count: { $sum: 1 } } }
      ]),
      Entrega.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$estado', count: { $sum: 1 } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalAmbientes,
        totalUsuarios,
        totalReservas,
        totalEntregas,
        reservasPorEstado,
        entregasPorEstado
      }
    });
  });

  /**
   * Generar reporte de reservas
   */
  generateReservationsReport = catchAsync(async (req: Request, res: Response) => {
    const { fechaInicio, fechaFin, estado, ambiente, usuario, formato = 'json' } = req.query;
    
    // Construir filtros
    const filters: any = {};
    
    if (fechaInicio || fechaFin) {
      filters.startDate = {};
      if (fechaInicio) filters.startDate.$gte = new Date(fechaInicio as string);
      if (fechaFin) filters.startDate.$lte = new Date(fechaFin as string);
    }
    
    if (estado) filters.status = estado;
    if (ambiente) filters.environmentId = new mongoose.Types.ObjectId(ambiente as string);
    if (usuario) filters.userId = new mongoose.Types.ObjectId(usuario as string);

    // Obtener reservas con populate
    const reservas = await ReservationModel.find(filters)
      .populate('userId', 'nombre email')
      .populate('environmentId', 'nombre codigo tipo')
      .populate('approvedBy', 'nombre')
      .sort({ startDate: -1 })
      .lean();

    // Estadísticas del reporte
    const estadisticas = {
      total: reservas.length,
      porEstado: reservas.reduce((acc: any, reserva: any) => {
        acc[reserva.status] = (acc[reserva.status] || 0) + 1;
        return acc;
      }, {}),
      porAmbiente: reservas.reduce((acc: any, reserva: any) => {
        const nombreAmbiente = reserva.environmentId?.nombre || 'Sin ambiente';
        acc[nombreAmbiente] = (acc[nombreAmbiente] || 0) + 1;
        return acc;
      }, {})
    };

    if (formato === 'json') {
      res.status(200).json({
        success: true,
        data: {
          reservas,
          estadisticas,
          filtros: { fechaInicio, fechaFin, estado, ambiente, usuario }
        }
      });
    } else {
      // TODO: Implementar exportación a Excel/PDF
      res.status(501).json({
        success: false,
        message: 'Exportación a Excel/PDF no implementada aún'
      });
    }
  });

  /**
   * Generar reporte de entregas
   */
  generateDeliveriesReport = catchAsync(async (req: Request, res: Response) => {
    const { fechaInicio, fechaFin, estado, ambiente, usuario, formato = 'json' } = req.query;
    
    // Construir filtros
    const filters: any = {};
    
    if (fechaInicio || fechaFin) {
      filters.fechaEntrega = {};
      if (fechaInicio) filters.fechaEntrega.$gte = new Date(fechaInicio as string);
      if (fechaFin) filters.fechaEntrega.$lte = new Date(fechaFin as string);
    }
    
    if (estado) filters.estado = estado;
    if (ambiente) filters.ambiente = new mongoose.Types.ObjectId(ambiente as string);
    if (usuario) filters.usuario = new mongoose.Types.ObjectId(usuario as string);

    // Obtener entregas con populate
    const entregas = await Entrega.find(filters)
      .populate('usuario', 'nombre email')
      .populate('ambiente', 'nombre codigo tipo')
      .populate('entregadoPor', 'nombre')
      .sort({ fechaEntrega: -1 })
      .lean();

    // Estadísticas del reporte
    const estadisticas = {
      total: entregas.length,
      porEstado: entregas.reduce((acc: any, entrega: any) => {
        acc[entrega.estado] = (acc[entrega.estado] || 0) + 1;
        return acc;
      }, {}),
      porAmbiente: entregas.reduce((acc: any, entrega: any) => {
        const nombreAmbiente = entrega.ambiente?.nombre || 'Sin ambiente';
        acc[nombreAmbiente] = (acc[nombreAmbiente] || 0) + 1;
        return acc;
      }, {})
    };

    if (formato === 'json') {
      res.status(200).json({
        success: true,
        data: {
          entregas,
          estadisticas,
          filtros: { fechaInicio, fechaFin, estado, ambiente, usuario }
        }
      });
    } else {
      // TODO: Implementar exportación a Excel/PDF
      res.status(501).json({
        success: false,
        message: 'Exportación a Excel/PDF no implementada aún'
      });
    }
  });

  /**
   * Generar reporte de uso de ambientes
   */
  generateEnvironmentUsageReport = catchAsync(async (req: Request, res: Response) => {
    const { fechaInicio, fechaFin, formato = 'json' } = req.query;
    
    // Construir filtro de fechas
    const dateFilter: any = {};
    if (fechaInicio || fechaFin) {
      dateFilter.fechaReserva = {};
      if (fechaInicio) dateFilter.fechaReserva.$gte = new Date(fechaInicio as string);
      if (fechaFin) dateFilter.fechaReserva.$lte = new Date(fechaFin as string);
    }

    // Obtener uso de ambientes
    const usoAmbientes = await ReservationModel.aggregate([
      { $match: { ...dateFilter, estado: { $in: ['aprobada', 'completada'] } } },
      {
        $lookup: {
          from: 'ambientes',
          localField: 'ambiente',
          foreignField: '_id',
          as: 'ambienteInfo'
        }
      },
      { $unwind: '$ambienteInfo' },
      {
        $group: {
          _id: '$ambiente',
          nombre: { $first: '$ambienteInfo.nombre' },
          codigo: { $first: '$ambienteInfo.codigo' },
          tipo: { $first: '$ambienteInfo.tipo' },
          totalReservas: { $sum: 1 },
          horasUsadas: {
            $sum: {
              $divide: [
                { $subtract: ['$horaFin', '$horaInicio'] },
                1000 * 60 * 60 // Convertir a horas
              ]
            }
          }
        }
      },
      { $sort: { totalReservas: -1 } }
    ]);

    // Calcular porcentaje de uso (asumiendo 8 horas disponibles por día)
    const diasEnRango = fechaInicio && fechaFin 
      ? Math.ceil((new Date(fechaFin as string).getTime() - new Date(fechaInicio as string).getTime()) / (1000 * 60 * 60 * 24))
      : 30; // Default 30 días
    
    const horasDisponiblesPorAmbiente = diasEnRango * 8; // 8 horas por día
    
    const usoConPorcentaje = usoAmbientes.map((ambiente: any) => ({
      ...ambiente,
      porcentajeUso: (ambiente.horasUsadas / horasDisponiblesPorAmbiente) * 100
    }));

    if (formato === 'json') {
      res.status(200).json({
        success: true,
        data: {
          usoAmbientes: usoConPorcentaje,
          resumen: {
            totalAmbientes: usoAmbientes.length,
            totalReservas: usoAmbientes.reduce((sum: number, amb: any) => sum + amb.totalReservas, 0),
            totalHorasUsadas: usoAmbientes.reduce((sum: number, amb: any) => sum + amb.horasUsadas, 0)
          },
          filtros: { fechaInicio, fechaFin }
        }
      });
    } else {
      // TODO: Implementar exportación a Excel/PDF
      res.status(501).json({
        success: false,
        message: 'Exportación a Excel/PDF no implementada aún'
      });
    }
  });

  /**
   * Obtener reportes de reservas del instructor actual
   */
  getMyReservationsReport = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { fechaInicio, fechaFin, formato = 'json' } = req.query;
    
    // Construir filtros
    const filters: any = { usuario: new mongoose.Types.ObjectId(userId) };
    
    if (fechaInicio || fechaFin) {
      filters.fechaReserva = {};
      if (fechaInicio) filters.fechaReserva.$gte = new Date(fechaInicio as string);
      if (fechaFin) filters.fechaReserva.$lte = new Date(fechaFin as string);
    }

    const reservas = await ReservationModel.find(filters)
      .populate('ambiente', 'nombre codigo tipo')
      .populate('aprobadoPor', 'nombre')
      .sort({ fechaReserva: -1 })
      .lean();

    const estadisticas = {
      total: reservas.length,
      porEstado: reservas.reduce((acc: any, reserva: any) => {
        acc[reserva.estado] = (acc[reserva.estado] || 0) + 1;
        return acc;
      }, {})
    };

    if (formato === 'json') {
      res.status(200).json({
        success: true,
        data: {
          reservas,
          estadisticas,
          filtros: { fechaInicio, fechaFin }
        }
      });
    } else {
      // TODO: Implementar exportación a Excel/PDF
      res.status(501).json({
        success: false,
        message: 'Exportación a Excel/PDF no implementada aún'
      });
    }
  });

  /**
   * Obtener reportes de entregas del instructor actual
   */
  getMyDeliveriesReport = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { fechaInicio, fechaFin, formato = 'json' } = req.query;
    
    // Construir filtros
    const filters: any = { usuario: new mongoose.Types.ObjectId(userId) };
    
    if (fechaInicio || fechaFin) {
      filters.fechaEntrega = {};
      if (fechaInicio) filters.fechaEntrega.$gte = new Date(fechaInicio as string);
      if (fechaFin) filters.fechaEntrega.$lte = new Date(fechaFin as string);
    }

    const entregas = await Entrega.find(filters)
      .populate('ambiente', 'nombre codigo tipo')
      .populate('entregadoPor', 'nombre')
      .sort({ fechaEntrega: -1 })
      .lean();

    const estadisticas = {
      total: entregas.length,
      porEstado: entregas.reduce((acc: any, entrega: any) => {
        acc[entrega.estado] = (acc[entrega.estado] || 0) + 1;
        return acc;
      }, {})
    };

    if (formato === 'json') {
      res.status(200).json({
        success: true,
        data: {
          entregas,
          estadisticas,
          filtros: { fechaInicio, fechaFin }
        }
      });
    } else {
      // TODO: Implementar exportación a Excel/PDF
      res.status(501).json({
        success: false,
        message: 'Exportación a Excel/PDF no implementada aún'
      });
    }
  });

  /**
   * Obtener estadísticas del turno actual (para guardias)
   */
  getMyShiftStats = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const hoy = new Date();
    const inicioDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const finDelDia = new Date(inicioDelDia.getTime() + 24 * 60 * 60 * 1000);

    // Obtener estadísticas del día actual
    const [reservasHoy, entregasHoy, reservasPendientes] = await Promise.all([
      ReservationModel.countDocuments({
        createdAt: { $gte: inicioDelDia, $lt: finDelDia }
      }),
      Entrega.countDocuments({
        createdAt: { $gte: inicioDelDia, $lt: finDelDia }
      }),
      ReservationModel.countDocuments({
        estado: 'pendiente'
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        reservasHoy,
        entregasHoy,
        reservasPendientes,
        fecha: hoy.toISOString().split('T')[0]
      }
    });
  });
}