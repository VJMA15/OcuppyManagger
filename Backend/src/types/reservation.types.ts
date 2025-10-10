import { Document, Schema } from 'mongoose';

export interface Reservation {
  userId: Schema.Types.ObjectId;
  environmentId: Schema.Types.ObjectId;
  reservationDate: Date; // fecha normalizada (día)
  jornada: 'mañana' | 'tarde' | 'noche';
  startDate: Date;
  endDate: Date;
  status: ReservationStatus;
  purpose: string;
  equipment?: Equipment[];
  approvedBy?: Schema.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  completedAt?: Date;
  expiredAt?: Date;
}

// Tipo para el documento de MongoDB
export interface ReservationDocument extends Reservation, Document {
  createdAt: Date;
  updatedAt: Date;
}

export enum ReservationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  EXPIRED = 'expired'
}

export interface Equipment {
  type: EquipmentType;
  quantity: number;
}

export enum EquipmentType {
  PROJECTOR = 'PROJECTOR',
  COMPUTER = 'COMPUTER',
  SOUND_SYSTEM = 'SOUND_SYSTEM',
  MICROPHONE = 'MICROPHONE',
  VIDEO_BEAM = 'VIDEO_BEAM',
  DIGITAL_BOARD = 'DIGITAL_BOARD'
}