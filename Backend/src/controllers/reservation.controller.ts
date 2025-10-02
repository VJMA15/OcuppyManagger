import { Request, Response } from 'express';
import { ReservationService } from '../services/reservation.service';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { ReservationStatus } from '../types/reservation.types';
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
      
      const reservationData: CreateReservationDto = {
        ...req.body,
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
      res.status(400).json({
        success: false,
        message: errorMessage
      });
    }
  }

  async getReservations(req: Request, res: Response) {
    console.log('🔍 [ReservationController] getReservations endpoint called');
    console.log('📊 [ReservationController] Request query:', JSON.stringify(req.query, null, 2));
    console.log('👤 [ReservationController] User from token:', req.user ? { id: req.user.id, role: req.user.role } : 'No user');
    
    try {
      // Construir filtros basados en los parámetros de consulta
      const filters: any = {};
      
      console.log('🔧 [ReservationController] Building filters...');
      
      if (req.query.status) {
        filters.status = req.query.status;
        console.log('🔍 [ReservationController] Added status filter:', req.query.status);
      }
      
      if (req.query.userId) {
        filters.userId = req.query.userId;
        console.log('🔍 [ReservationController] Added userId filter:', req.query.userId);
      }
      
      if (req.query.environmentId) {
        filters.environmentId = req.query.environmentId;
        console.log('🔍 [ReservationController] Added environmentId filter:', req.query.environmentId);
      }
      
      console.log('✅ [ReservationController] Final filters:', JSON.stringify(filters, null, 2));
      
      // Llamar al servicio
      console.log('⏳ [ReservationController] Calling reservationService.getReservations...');
      const reservations = await this.reservationService.getReservations(filters);
      
      console.log('✅ [ReservationController] Service call successful');
      console.log(`📈 [ReservationController] Returning ${reservations.length} reservations`);
      
      res.status(200).json({
        success: true,
        data: reservations,
        count: reservations.length
      });
      
    } catch (error) {
      console.error('❌ [ReservationController] Error in getReservations:', error);
      console.error('❌ [ReservationController] Error name:', error instanceof Error ? error.name : 'Unknown');
      console.error('❌ [ReservationController] Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ [ReservationController] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      res.status(500).json({
        success: false,
        message: 'Error al obtener las reservas',
        error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : 'Internal server error'
      });
    }
  }

  async cancelReservation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id || (req as any).user?._id;
      const userRole = (req as any).user?.role;

      console.log('🔍 [CancelReservation] Datos del usuario:', {
        userId,
        userRole,
        userObject: (req as any).user
      });

      // Verificar que la reserva existe
      const existingReservation = await this.reservationService.getReservationById(id);
      
      if (!existingReservation) {
        return res.status(404).json({
          success: false,
          message: 'Reserva no encontrada'
        });
      }

      console.log('🔍 [CancelReservation] Datos de la reserva:', {
        reservationId: existingReservation._id,
        reservationUserId: existingReservation.userId,
        reservationUserIdString: existingReservation.userId.toString()
      });

      // Verificar que el usuario puede cancelar esta reserva (es el propietario o es admin/guardia/instructor)
      const isOwner = existingReservation.userId.toString() === userId?.toString();
      const isAdminOrGuard = userRole === 'admin' || userRole === 'guardia';
      const isInstructor = userRole === 'instructor';

      console.log('🔍 [CancelReservation] Verificación de permisos:', {
        isOwner,
        isAdminOrGuard,
        isInstructor,
        comparison: `${existingReservation.userId.toString()} === ${userId?.toString()}`
      });

      // Los instructores pueden cancelar sus propias reservas, los admin/guardia pueden cancelar cualquiera
      if (!isOwner && !isAdminOrGuard) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para cancelar esta reserva'
        });
      }

      // Verificar que la reserva se puede cancelar (no está ya cancelada o completada)
      if (existingReservation.status === ReservationStatus.CANCELLED) {
        return res.status(400).json({
          success: false,
          message: 'La reserva ya está cancelada'
        });
      }

      const reservation = await this.reservationService.updateReservation(id, { 
        status: ReservationStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledBy: userId
      });
      
      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: 'Reserva no encontrada'
        });
      }

      // Registrar en bitácora
      await Bitacora.registrarAccion(
        userId || 'sistema',
        'CANCELAR_RESERVA',
        'reserva',
        id,
        JSON.stringify({
          reservaId: id,
          usuarioSolicitante: reservation.userId,
          ambiente: reservation.environmentId,
          fechaReserva: reservation.startDate,
          fechaCancelacion: new Date(),
          canceladoPor: userId
        }),
        req.ip
      );
      
      res.json({
        success: true,
        data: reservation,
        message: 'Reserva cancelada exitosamente'
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
      // Obtener el userId del token JWT autenticado
      const userId = (req as any).user?.id || (req as any).user?.userId;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Usuario no autenticado correctamente'
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

  async deleteReservation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id || (req as any).user?._id || 'sistema';

      // Obtener reserva y validar estado en el servicio
      const deleted = await this.reservationService.deleteReservation(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Reserva no encontrada'
        });
      }

      // Registrar en bitácora
      await Bitacora.registrarAccion(
        userId,
        'ELIMINAR_RESERVA',
        'reserva',
        id,
        JSON.stringify({
          reservaId: id,
          usuarioSolicitante: deleted.userId,
          ambiente: deleted.environmentId,
          estadoPrevio: deleted.status,
          fechaEliminacion: new Date()
        }),
        req.ip
      );

      res.json({
        success: true,
        message: 'Reserva eliminada exitosamente',
        data: deleted
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      const statusCode = errorMessage.includes('estado') || errorMessage.includes('REJECTED') || errorMessage.includes('APPROVED') ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        message: errorMessage
      });
    }
  }

  async deleteRejectedReservations(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id || 'sistema';
      const result = await this.reservationService.deleteRejectedReservations();

      // Registrar en bitácora
      await Bitacora.registrarAccion(
        userId,
        'ELIMINAR_RESERVAS_RECHAZADAS_MASIVO',
        'reserva',
        'masivo',
        JSON.stringify({
          eliminadas: result.deletedCount,
          fechaEliminacion: new Date()
        }),
        req.ip
      );

      res.json({
        success: true,
        message: `Se eliminaron ${result.deletedCount} reservas rechazadas`,
        data: result
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({
        success: false,
        message: errorMessage
      });
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
}