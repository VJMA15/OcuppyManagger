import { ReservationDocument } from '../types/reservation.types';
import { CreateReservationDto } from '../dto';
export declare class ReservationService {
    private normalizeStatusLegacy;
    createReservation(data: CreateReservationDto): Promise<ReservationDocument>;
    getReservations(filters?: any): Promise<ReservationDocument[]>;
    getReservationById(id: string): Promise<ReservationDocument | null>;
    updateReservation(id: string, updateData: any): Promise<ReservationDocument | null>;
    deleteReservation(id: string): Promise<ReservationDocument | null>;
    deleteRejectedReservations(): Promise<{
        deletedCount: number;
    }>;
    approveReservation(id: string, approvedBy: string): Promise<ReservationDocument | null>;
    rejectReservation(id: string, reason: string): Promise<ReservationDocument | null>;
    private validateAvailability;
}
//# sourceMappingURL=reservation.service.d.ts.map