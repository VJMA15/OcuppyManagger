import { Types } from 'mongoose';

export interface CreateReservationDto {
  // ID del usuario autenticado; se inyecta en el controlador
  userId: string | Types.ObjectId;
  // ID del ambiente
  environmentId: string;
  // Fecha normalizada al inicio del día (00:00)
  reservationDate: Date;
  // Jornada requerida
  jornada: 'mañana' | 'tarde' | 'noche';
  // Permitir que el cliente no los envíe; el servicio los calcula según la jornada
  startDate?: string | Date;
  endDate?: string | Date;
  // Propósito de la reserva
  purpose: string;
  // Equipos opcionales
  equipment?: {
    type: string;
    quantity: number;
  }[];
}