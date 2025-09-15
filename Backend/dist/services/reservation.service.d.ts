import { CreateReservationDto, UpdateReservationDto } from '../dto';
export declare class ReservationService {
    createReservation(data: CreateReservationDto): Promise<any>;
    getReservations(filters?: any): Promise<any[]>;
    getReservationById(id: string): Promise<any | null>;
    updateReservation(id: string, data: UpdateReservationDto): Promise<any | null>;
    deleteReservation(id: string): Promise<boolean>;
    approveReservation(id: string, approvedBy: string): Promise<any | null>;
    rejectReservation(id: string, reason: string): Promise<any | null>;
    private validateAvailability;
}
//# sourceMappingURL=reservation.service.d.ts.map