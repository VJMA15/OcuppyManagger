export interface UpdateReservationDto {
    startDate?: Date;
    endDate?: Date;
    purpose?: string;
    equipment?: {
        type: string;
        quantity: number;
    }[];
    status?: string;
    cancelledAt?: Date;
    cancelledBy?: string;
    approvedBy?: string;
    approvedAt?: Date;
    rejectionReason?: string;
}
//# sourceMappingURL=update-reservation.dto.d.ts.map