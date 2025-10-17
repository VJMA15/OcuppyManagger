import { ReservationModel } from '../models/reservation.model';
import { Reservation, ReservationDocument, ReservationHistoryDocument, ReservationHistory } from '../types/reservation.types';
import { ReservationHistoryModel } from '../models/reservation-history.model';
import { CreateReservationDto, UpdateReservationDto } from '../dto';

// Import ReservationStatus from types to ensure consistency
import { ReservationStatus } from '../types/reservation.types';

export class ReservationService {
  async createReservation(data: CreateReservationDto): Promise<ReservationDocument> {
    // Normalizar reservationDate al inicio del día
    const reservationDate = new Date(data.reservationDate || data.startDate);
    reservationDate.setHours(0, 0, 0, 0);

    // Calcular/usar rango de horas y jornada
    let startDate = data.startDate ? new Date(data.startDate) : null;
    let endDate = data.endDate ? new Date(data.endDate) : null;

    // Si no vienen startDate/endDate, calcularlos según la jornada provista
    if (!startDate || !endDate) {
      // Validación de jornada cuando no se especifican horas personalizadas
      if (!data.jornada || !['mañana', 'tarde', 'noche'].includes(data.jornada)) {
        throw new Error('La jornada es requerida y debe ser válida (mañana, tarde o noche)');
      }

      startDate = new Date(reservationDate);
      endDate = new Date(reservationDate);
      switch (data.jornada) {
        case 'mañana':
          startDate.setHours(6, 0, 0, 0);
          endDate.setHours(12, 0, 0, 0);
          break;
        case 'tarde':
          startDate.setHours(12, 30, 0, 0);
          endDate.setHours(18, 0, 0, 0);
          break;
        case 'noche':
          startDate.setHours(18, 30, 0, 0);
          endDate.setHours(22, 0, 0, 0);
          break;
      }
    }

    // Derivar jornada si no se proporcionó explícitamente pero hay horario personalizado
    let jornada: 'mañana' | 'tarde' | 'noche' = (data.jornada as any);
    if (!jornada || !['mañana', 'tarde', 'noche'].includes(jornada)) {
      const hour = startDate.getHours();
      if (hour >= 6 && hour < 12) {
        jornada = 'mañana';
      } else if (hour >= 12 && hour < 18) {
        jornada = 'tarde';
      } else {
        jornada = 'noche';
      }
    }

    // Validar que el usuario no tenga una reserva pendiente
    const existingPending = await ReservationModel.findOne({
      userId: data.userId as any,
      status: ReservationStatus.PENDING
    });
    if (existingPending) {
      const err = new Error('Ya tienes una reserva pendiente. Cancélala o espera a que sea aprobada/rechazada antes de crear otra.');
      throw err;
    }

    // Validar disponibilidad por jornada + fecha (usando la jornada calculada/derivada)
    await this.validateAvailabilityByShift(data.environmentId, reservationDate, jornada);

    const reservation = new ReservationModel({
      ...data,
      jornada,
      reservationDate,
      startDate,
      endDate,
    });
    return await (reservation.save() as Promise<ReservationDocument>);
  }

  async getReservations(filters: any = {}): Promise<ReservationDocument[]> {
    console.log('🔍 [ReservationService] getReservations called with filters:', JSON.stringify(filters, null, 2));
    
    try {
      console.log('📊 [ReservationService] Attempting to query ReservationModel...');
      
      // Verificar que el modelo esté disponible
      if (!ReservationModel) {
        console.error('❌ [ReservationService] ReservationModel is undefined');
        throw new Error('ReservationModel is not available');
      }
      
      console.log('✅ [ReservationService] ReservationModel is available');
      
      // Construir la consulta
      const query = ReservationModel.find(filters);
      console.log('🔍 [ReservationService] Query built:', query.getQuery());
      
      // Ejecutar la consulta
      console.log('⏳ [ReservationService] Executing query...');
      const reservations = await (query.exec() as Promise<ReservationDocument[]>);
      
      console.log('✅ [ReservationService] Query executed successfully');
      console.log(`📈 [ReservationService] Found ${reservations.length} reservations`);
      
      return reservations;
    } catch (error) {
      console.error('❌ [ReservationService] Error in getReservations:', error);
      console.error('❌ [ReservationService] Error name:', error instanceof Error ? error.name : 'Unknown');
      console.error('❌ [ReservationService] Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ [ReservationService] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  }

  async getReservationById(id: string): Promise<ReservationDocument | null> {
    console.log('🔍 [ReservationService] getReservationById called with id:', id);
    
    try {
      console.log('📊 [ReservationService] Attempting to find reservation by ID...');
      const reservation = await ReservationModel.findById(id);
      
      if (!reservation) {
        console.log('❌ [ReservationService] Reservation not found with id:', id);
        return null;
      }
      
      console.log('✅ [ReservationService] Reservation found:', reservation._id);
      return reservation as ReservationDocument | null;
    } catch (error) {
      console.error('❌ [ReservationService] Error in getReservationById:', error);
      throw error;
    }
  }

  async updateReservation(id: string, updateData: any): Promise<ReservationDocument | null> {
    console.log('🔍 [ReservationService] updateReservation called with id:', id);
    console.log('📝 [ReservationService] Update data:', JSON.stringify(updateData, null, 2));
    
    try {
      const reservation = await ReservationModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!reservation) {
        console.log('❌ [ReservationService] Reservation not found for update with id:', id);
        return null;
      }
      
      console.log('✅ [ReservationService] Reservation updated successfully:', reservation._id);
      return reservation as ReservationDocument | null;
    } catch (error) {
      console.error('❌ [ReservationService] Error in updateReservation:', error);
      throw error;
    }
  }

  async deleteReservation(id: string, deletedBy: string): Promise<ReservationDocument | null> {
    console.log('🔍 [ReservationService] deleteReservation called with id:', id);
    
    try {
      // Buscar la reserva primero para archivarla
      const reservation = await ReservationModel.findById(id);
      
      if (!reservation) {
        console.log('❌ [ReservationService] Reservation not found for deletion with id:', id);
        return null;
      }

      // Crear registro en historial antes de eliminar
      const historyPayload: Omit<ReservationHistory, 'createdAt' | 'updatedAt'> = {
        originalId: reservation._id as any,
        userId: reservation.userId as any,
        environmentId: reservation.environmentId as any,
        reservationDate: reservation.reservationDate as any,
        jornada: reservation.jornada as any,
        startDate: reservation.startDate as any,
        endDate: reservation.endDate as any,
        status: reservation.status as any,
        purpose: reservation.purpose as any,
        equipment: (reservation.equipment as any[]) || [],
        approvedBy: reservation.approvedBy as any,
        approvedAt: reservation.approvedAt as any,
        rejectionReason: reservation.rejectionReason as any,
        completedAt: reservation.completedAt as any,
        expiredAt: reservation.expiredAt as any,
        deletedAt: new Date(),
        deletedBy: deletedBy as any
      };

      await ReservationHistoryModel.create(historyPayload as any);

      // Eliminar la reserva después de archivar
      await ReservationModel.findByIdAndDelete(id);

      console.log('✅ [ReservationService] Reservation archived and deleted successfully:', reservation._id);
      return reservation as ReservationDocument | null;
    } catch (error) {
      console.error('❌ [ReservationService] Error in deleteReservation:', error);
      throw error;
    }
  }

  async deleteRejectedReservations(deletedBy: string): Promise<{ deletedCount: number }> {
    // Obtener todas las reservas rechazadas para archivarlas
    const rejected = await ReservationModel.find({ status: ReservationStatus.REJECTED });

    if (!rejected || rejected.length === 0) {
      return { deletedCount: 0 };
    }

    const now = new Date();
    const historyDocs: Omit<ReservationHistory, 'createdAt' | 'updatedAt'>[] = rejected.map((r) => ({
      originalId: r._id as any,
      userId: r.userId as any,
      environmentId: r.environmentId as any,
      reservationDate: r.reservationDate as any,
      jornada: r.jornada as any,
      startDate: r.startDate as any,
      endDate: r.endDate as any,
      status: r.status as any,
      purpose: r.purpose as any,
      equipment: (r.equipment as any[]) || [],
      approvedBy: r.approvedBy as any,
      approvedAt: r.approvedAt as any,
      rejectionReason: r.rejectionReason as any,
      completedAt: r.completedAt as any,
      expiredAt: r.expiredAt as any,
      deletedAt: now,
      deletedBy: deletedBy as any
    }));

    await ReservationHistoryModel.insertMany(historyDocs as any[]);

    const result = await ReservationModel.deleteMany({ _id: { $in: rejected.map(r => r._id) } });
    return { deletedCount: (result as any)?.deletedCount || rejected.length };
  }

  async approveReservation(id: string, approvedBy: string): Promise<ReservationDocument | null> {
    const approved = await ReservationModel.findByIdAndUpdate(
      id,
      {
        status: ReservationStatus.APPROVED,
        approvedBy,
        approvedAt: new Date()
      },
      { new: true }
    ) as ReservationDocument | null;

    // Si se aprueba una reserva, rechazar automáticamente las pendientes de la misma jornada y fecha
    if (approved) {
      await ReservationModel.updateMany(
        {
          environmentId: approved.environmentId,
          reservationDate: approved.reservationDate,
          jornada: approved.jornada,
          status: ReservationStatus.PENDING
        },
        {
          $set: {
            status: ReservationStatus.REJECTED,
            rejectionReason: 'Rechazada automáticamente por aprobación en la misma jornada'
          }
        }
      );
    }

    return approved;
  }

  async rejectReservation(id: string, reason: string): Promise<ReservationDocument | null> {
    return await ReservationModel.findByIdAndUpdate(
      id,
      {
        status: ReservationStatus.REJECTED,
        rejectionReason: reason
      },
      { new: true }
    );
  }

  async cancelReservation(id: string, reason?: string): Promise<ReservationDocument | null> {
    // Cancelar establece el estado en CANCELLED y opcionalmente guarda el motivo en rejectionReason
    const updated = await ReservationModel.findByIdAndUpdate(
      id,
      {
        status: ReservationStatus.CANCELLED,
        // Reutilizamos rejectionReason para almacenar el motivo de cancelación
        ...(reason ? { rejectionReason: reason } : {})
      },
      { new: true }
    );

    return updated as ReservationDocument | null;
  }

  // Validación por ambiente-fecha-jornada
  private async validateAvailabilityByShift(
    environmentId: string,
    reservationDate: Date,
    jornada: 'mañana' | 'tarde' | 'noche'
  ): Promise<void> {
    // Solo bloquear si existe una reserva APROBADA para esa jornada y fecha
    const conflictingReservation = await ReservationModel.findOne({
      environmentId,
      reservationDate,
      jornada,
      status: ReservationStatus.APPROVED
    });

    if (conflictingReservation) {
      // Lanzar error con el mensaje requerido
      const err = new Error('El ambiente ya está reservado para esta jornada en la fecha seleccionada.');
      // Para que el controlador responda 400 sin stack noise, solo mensaje
      throw err;
    }
  }

  // Obtener disponibilidad diaria por jornada
  async getDailyAvailability(environmentId: string, date: Date) {
    const reservationDate = new Date(date);
    reservationDate.setHours(0, 0, 0, 0);

    // Solo considerar reservadas las jornadas con estado APROBADO
    const reservations = await ReservationModel.find({
      environmentId,
      reservationDate,
      status: ReservationStatus.APPROVED
    }).select('jornada').exec() as ReservationDocument[];

    const occupied = new Set(reservations.map(r => r.jornada));
    return {
      date: reservationDate.toISOString().split('T')[0],
      mañana: occupied.has('mañana'),
      tarde: occupied.has('tarde'),
      noche: occupied.has('noche'),
      fullyOccupied: occupied.size === 3
    };
  }
}