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
  // Usuario que creó la reserva (p. ej., admin/guardia creando a nombre de un instructor)
  createdBy?: Schema.Types.ObjectId;
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

// ==================== HISTORIAL DE RESERVAS ====================

export interface ReservationHistory extends Reservation {
  originalId: Schema.Types.ObjectId; // ID de la reserva original
  deletedAt: Date; // fecha de eliminación
  deletedBy: Schema.Types.ObjectId; // usuario que ejecutó la eliminación
}

export interface ReservationHistoryDocument extends ReservationHistory, Document {
  createdAt: Date; // timestamp de creación del registro en historial
  updatedAt: Date;
}