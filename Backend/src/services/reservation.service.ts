import { ReservationModel } from '../models/reservation.model';
import { Reservation, ReservationStatus, ReservationDocument } from '../types/reservation.types';
import { CreateReservationDto, UpdateReservationDto } from '../dto';

export class ReservationService {
  // Normaliza estado desde 'status' (inglés) o 'estado' (español) a minúsculas inglés
  private normalizeStatusLegacy(reservation: any): string | null {
    const raw = String(
      reservation?.status ?? reservation?.estado ?? ''
    )
      .trim()
      .toLowerCase();
    if (!raw) return null;
    const map: Record<string, string> = {
      pending: ReservationStatus.PENDING,
      pendiente: ReservationStatus.PENDING,
      approved: ReservationStatus.APPROVED,
      aprobada: ReservationStatus.APPROVED,
      aprobado: ReservationStatus.APPROVED,
      aceptada: ReservationStatus.APPROVED,
      aceptado: ReservationStatus.APPROVED,
      rejected: ReservationStatus.REJECTED,
      rechazada: ReservationStatus.REJECTED,
      rechazado: ReservationStatus.REJECTED,
      cancelled: ReservationStatus.CANCELLED,
      canceled: ReservationStatus.CANCELLED,
      cancelada: ReservationStatus.CANCELLED,
      completed: ReservationStatus.COMPLETED,
      completada: ReservationStatus.COMPLETED
    };
    return map[raw] || raw;
  }
  async createReservation(data: CreateReservationDto): Promise<ReservationDocument> {
    // Validar disponibilidad
    await this.validateAvailability(data.environmentId, data.startDate, data.endDate);
    
    const reservation = new ReservationModel(data);
    return await reservation.save();
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
      const reservations = await query.exec();
      
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
      return reservation;
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
      return reservation;
    } catch (error) {
      console.error('❌ [ReservationService] Error in updateReservation:', error);
      throw error;
    }
  }

  async deleteReservation(id: string): Promise<ReservationDocument | null> {
    console.log('🔍 [ReservationService] deleteReservation called with id:', id);
    
    try {
      // Primero obtener la reserva para validar el estado
      const existing = await ReservationModel.findById(id);
      if (!existing) {
        console.log('❌ [ReservationService] Reservation not found for deletion with id:', id);
        return null;
      }

      const normalized = this.normalizeStatusLegacy(existing);
      if (
        normalized !== ReservationStatus.REJECTED &&
        normalized !== ReservationStatus.APPROVED &&
        normalized !== ReservationStatus.CANCELLED
      ) {
        console.log('⚠️ [ReservationService] Attempt to delete reservation with non-deletable status:', {
          id,
          status: existing.status,
          estado: (existing as any).estado,
          normalized
        });
        throw new Error('Solo se pueden eliminar reservas con estado REJECTED, APPROVED o CANCELLED');
      }

      const reservation = await ReservationModel.findByIdAndDelete(id);
      
      if (!reservation) {
        console.log('❌ [ReservationService] Reservation not found for deletion with id:', id);
        return null;
      }
      
      console.log('✅ [ReservationService] Reservation deleted successfully:', reservation._id);
      return reservation;
    } catch (error) {
      console.error('❌ [ReservationService] Error in deleteReservation:', error);
      throw error;
    }
  }

  async deleteRejectedReservations(): Promise<{ deletedCount: number }> {
    console.log('🔍 [ReservationService] deleteRejectedReservations called');
    try {
      // Soporta documentos legado con campo 'estado: rechazad(a/o)'
      const result = await ReservationModel.deleteMany({
        $or: [
          { status: ReservationStatus.REJECTED },
          { estado: 'rechazada' },
          { estado: 'rechazado' }
        ]
      } as any);
      console.log('✅ [ReservationService] Rejected reservations deleted:', result.deletedCount || 0);
      return { deletedCount: result.deletedCount || 0 };
    } catch (error) {
      console.error('❌ [ReservationService] Error in deleteRejectedReservations:', error);
      throw error;
    }
  }

  async approveReservation(id: string, approvedBy: string): Promise<ReservationDocument | null> {
    return await ReservationModel.findByIdAndUpdate(
      id,
      {
        status: ReservationStatus.APPROVED,
        approvedBy,
        approvedAt: new Date()
      },
      { new: true }
    );
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

  private async validateAvailability(
    environmentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    const conflictingReservation = await ReservationModel.findOne({
      environmentId,
      status: { $in: [ReservationStatus.PENDING, ReservationStatus.APPROVED] },
      $or: [
        {
          startDate: { $lte: startDate },
          endDate: { $gt: startDate }
        },
        {
          startDate: { $lt: endDate },
          endDate: { $gte: endDate }
        },
        {
          startDate: { $gte: startDate },
          endDate: { $lte: endDate }
        }
      ]
    });

    if (conflictingReservation) {
      throw new Error('El ambiente no está disponible en el horario solicitado');
    }
  }
}