import { Schema, model } from 'mongoose';
import { ReservationHistoryDocument, ReservationStatus } from '../types/reservation.types';

const reservationHistorySchema = new Schema<ReservationHistoryDocument>({
  originalId: { type: Schema.Types.ObjectId, ref: 'Reservation', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  environmentId: { type: Schema.Types.ObjectId, ref: 'Ambiente', required: true },
  reservationDate: { type: Date, required: true },
  jornada: { type: String, enum: ['mañana', 'tarde', 'noche'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: Object.values(ReservationStatus), required: true },
  purpose: { type: String, required: true },
  equipment: [
    {
      type: { type: String, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  completedAt: { type: Date },
  expiredAt: { type: Date },

  // Metadatos de eliminación
  deletedAt: { type: Date, required: true },
  deletedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

// Índices para consultas frecuentes sobre historial
reservationHistorySchema.index({ deletedAt: 1 });
reservationHistorySchema.index({ userId: 1, deletedAt: 1 });
reservationHistorySchema.index({ environmentId: 1, deletedAt: 1 });
reservationHistorySchema.index({ status: 1, deletedAt: 1 });

export const ReservationHistoryModel = model<ReservationHistoryDocument>('ReservationHistory', reservationHistorySchema);

export default ReservationHistoryModel;