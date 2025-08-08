import { ReservationModel } from '../models/reservation.model';
import { Reservation, ReservationStatus } from '../types/reservation.types';
import { CreateReservationDto, UpdateReservationDto } from '../dto';

export class ReservationService {
  async createReservation(data: CreateReservationDto): Promise<any> {
    // Validar disponibilidad
    await this.validateAvailability(data.environmentId, data.startDate, data.endDate);
    
    const reservation = new ReservationModel(data);
    return await reservation.save();
  }

  async getReservations(filters?: any): Promise<any[]> {
    // Eliminamos los populate() ya que los modelos referenciados no existen
    return await ReservationModel
      .find(filters)
      .sort({ createdAt: -1 });
  }

  async getReservationById(id: string): Promise<any | null> {
    // Eliminamos los populate() ya que los modelos referenciados no existen
    return await ReservationModel.findById(id);
  }

  async updateReservation(id: string, data: UpdateReservationDto): Promise<any | null> {
    return await ReservationModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteReservation(id: string): Promise<boolean> {
    const result = await ReservationModel.findByIdAndDelete(id);
    return !!result;
  }

  async approveReservation(id: string, approvedBy: string): Promise<any | null> {
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

  async rejectReservation(id: string, reason: string): Promise<any | null> {
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