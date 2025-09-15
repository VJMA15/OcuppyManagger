export interface CreateReservationDto {
    userId: string;
    environmentId: string;
    startDate: Date;
    endDate: Date;
    purpose: string;
    equipment?: {
        type: string;
        quantity: number;
    }[];
}
//# sourceMappingURL=create-reservation.dto.d.ts.map