import mongoose, { Document, Schema } from 'mongoose';
import { Ambiente } from '../types/index';

// Fix the interface conflict by omitting _id from Ambiente
export interface AmbienteDocument extends Omit<Ambiente, '_id'>, Document {}

const ambienteSchema = new Schema<AmbienteDocument>({
  nombre: {
    type: String,
    required: [true, 'El nombre del ambiente es obligatorio'],
    unique: true,
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  capacidad: {
    type: Number,
    required: [true, 'La capacidad es obligatoria'],
    min: [1, 'La capacidad debe ser al menos 1']
  },
  tipo: {
    type: String,
    enum: ['Aula', 'Laboratorio', 'Auditorio', 'Oficina', 'Otro'],
    required: [true, 'El tipo de ambiente es obligatorio']
  },
  estado: {
    type: String,
    enum: ['Disponible', 'En mantenimiento', 'No disponible'],
    default: 'Disponible'
  },
  equipos: {
    type: Number,
    default: 0,
    min: [0, 'El número de equipos no puede ser negativo']
  },
  ubicacion: {
    type: String,
    trim: true
  },
  servicios: [{
    type: String,
    trim: true
  }],
  horario: {
    type: String,
    default: '8:00 AM - 6:00 PM'
  },
  responsable: {
    type: String,
    trim: true
  },
  recursos: [{
    nombre: String,
    cantidad: Number
  }],
  horarioDisponible: {
    dias: [{
      type: String,
      enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }],
    horaInicio: String,
    horaFin: String
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model<AmbienteDocument>('Ambiente', ambienteSchema);