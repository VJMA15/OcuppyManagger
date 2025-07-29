const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  ambiente: {
    type: mongoose.Schema.ObjectId,
    ref: 'Ambiente',
    required: [true, 'El ambiente es obligatorio']
  },
  usuario: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es obligatorio']
  },
  fechaInicio: {
    type: Date,
    required: [true, 'La fecha de inicio es obligatoria']
  },
  fechaFin: {
    type: Date,
    required: [true, 'La fecha de fin es obligatoria']
  },
  motivo: {
    type: String,
    required: [true, 'El motivo es obligatorio'],
    trim: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'aprobada', 'rechazada', 'cancelada', 'finalizada'],
    default: 'pendiente'
  },
  aprobadoPor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  fechaAprobacion: Date,
  comentarios: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejorar el rendimiento de las consultas
reservaSchema.index({ ambiente: 1, fechaInicio: 1, fechaFin: 1 });
reservaSchema.index({ usuario: 1 });

module.exports = mongoose.model('Reserva', reservaSchema);
