import { Document, Schema } from 'mongoose';

export interface Reservation {
  userId: Schema.Types.ObjectId;
  environmentId: Schema.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: ReservationStatus;
  purpose: string;
  equipment: Equipment[];
  approvedBy?: Schema.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
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
  COMPLETED = 'completed'
}

export interface Equipment {
  type: EquipmentType;
  quantity: number;
}

export enum EquipmentType {
  PROJECTOR = 'projector',
  COMPUTER = 'computer',
  SOUND_SYSTEM = 'sound_system',
  MICROPHONE = 'microphone',
  VIDEO_BEAM = 'video_beam',
  DIGITAL_BOARD = 'digital_board'
}