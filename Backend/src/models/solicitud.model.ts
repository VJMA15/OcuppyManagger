import mongoose, { Document, Schema } from 'mongoose';

export interface ISolicitud extends Document {
  fullName: string;
  documentNumber: string;
  email: string;
  requestedRole: 'instructor' | 'guardia' | 'admin';
  trainingCenter?: string;
  justification: string;
  status: 'pendiente' | 'aprobada' | 'rechazada';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  decisionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const solicitudSchema = new Schema<ISolicitud>({
  fullName: {
    type: String,
    required: [true, 'El nombre completo es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres']
  },
  documentNumber: {
    type: String,
    required: [true, 'El número de documento es obligatorio'],
    trim: true,
    match: [/^\d{6,15}$/, 'El documento debe tener entre 6 y 15 dígitos']
  },
  email: {
    type: String,
    required: [true, 'El correo electrónico es obligatorio'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un correo válido']
  },
  requestedRole: {
    type: String,
    enum: ['instructor', 'guardia', 'admin'],
    required: [true, 'El rol solicitado es obligatorio']
  },
  trainingCenter: {
    type: String,
    required: false,
    trim: true
  },
  justification: {
    type: String,
    required: [true, 'La justificación es obligatoria'],
    trim: true,
    maxlength: [1000, 'La justificación no puede exceder 1000 caracteres']
  },
  status: {
    type: String,
    enum: ['pendiente', 'aprobada', 'rechazada'],
    default: 'pendiente'
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  decisionReason: String
}, {
  timestamps: true,
  collection: 'solicitudes'
});

solicitudSchema.index({ status: 1, createdAt: -1 });
solicitudSchema.index({ email: 1 });
solicitudSchema.index({ documentNumber: 1 });

const Solicitud = mongoose.model<ISolicitud>('Solicitud', solicitudSchema);
export default Solicitud;