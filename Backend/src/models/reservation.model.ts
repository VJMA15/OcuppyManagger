import { Schema, model, Document } from 'mongoose';
import { ReservationStatus, EquipmentType, ReservationDocument } from '../types/reservation.types';

// Define the Reservation interface locally
interface Reservation {
  userId: Schema.Types.ObjectId;
  environmentId: Schema.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: ReservationStatus;
  purpose: string;
  equipment?: Array<{
    type: EquipmentType;
    quantity: number;
  }>;
  approvedBy?: Schema.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
}

const equipmentSchema = new Schema({
  type: {
    type: String,
    enum: Object.values(EquipmentType),
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const reservationSchema = new Schema<ReservationDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  environmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Ambiente',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(ReservationStatus),
    default: ReservationStatus.PENDING
  },
  purpose: {
    type: String,
    required: true,
    maxlength: 500
  },
  equipment: [equipmentSchema],
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
reservationSchema.index({ userId: 1, startDate: 1 });
reservationSchema.index({ environmentId: 1, startDate: 1, endDate: 1 });
reservationSchema.index({ status: 1 });

export const ReservationModel = model<ReservationDocument>('Reservation', reservationSchema);