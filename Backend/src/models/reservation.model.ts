import { Schema, model } from 'mongoose';
import { ReservationDocument, ReservationStatus, EquipmentType } from '../types/reservation.types';

// ... existing code ...
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
  // Fecha de la reserva (solo día, normalizada a medianoche) para restricciones por jornada
  reservationDate: {
    type: Date,
    required: true
  },
  // Jornada de la reserva
  jornada: {
    type: String,
    enum: ['mañana', 'tarde', 'noche'],
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
  ,
  completedAt: {
    type: Date
  },
  expiredAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
reservationSchema.index({ userId: 1, startDate: 1 });
reservationSchema.index({ environmentId: 1, startDate: 1, endDate: 1 });
reservationSchema.index({ status: 1 });
// Evitar más de una reserva pendiente por usuario
reservationSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

// Índice único compuesto para evitar reservas duplicadas por ambiente-fecha-jornada
// Único solo para reservas aprobadas, permitiendo múltiples pendientes
reservationSchema.index(
  { environmentId: 1, reservationDate: 1, jornada: 1 },
  { unique: true, partialFilterExpression: { status: 'approved' } }
);

export const ReservationModel = model<ReservationDocument>('Reservation', reservationSchema);