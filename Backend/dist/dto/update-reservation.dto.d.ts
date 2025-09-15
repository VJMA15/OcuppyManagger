export interface UpdateReservationDto {
    startDate?: Date;
    endDate?: Date;
    purpose?: string;
    equipment?: {
        type: string;
        quantity: number;
    }[];
    status?: string;
}
//# sourceMappingURL=update-reservation.dto.d.ts.map