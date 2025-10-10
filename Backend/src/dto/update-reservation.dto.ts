export interface UpdateReservationDto {
  reservationDate?: Date;
  jornada?: 'mañana' | 'tarde' | 'noche';
  startDate?: Date;
  endDate?: Date;
  purpose?: string;
  equipment?: {
    type: string;
    quantity: number;
  }[];
  status?: string;
}