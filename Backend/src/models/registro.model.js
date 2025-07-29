const mongoose = require('mongoose');

const registroSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es obligatorio']
  },
  ambiente: {
    type: mongoose.Schema.ObjectId,
    ref: 'Ambiente',
    required: [true, 'El ambiente es obligatorio']
  },
  reserva: {
    type: mongoose.Schema.ObjectId,
    ref: 'Reserva',
    required: [true, 'La reserva es obligatoria']
  },
  fechaHoraEntrada: {
    type: Date,
    default: Date.now
  },
  fechaHoraSalida: Date,
  estado: {
    type: String,
    enum: ['activo', 'finalizado', 'anulado'],
    default: 'activo'
  },
  observaciones: String,
  creadoPor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento de las consultas
registroSchema.index({ usuario: 1 });
registroSchema.index({ ambiente: 1 });
registroSchema.index({ reserva: 1 });
registroSchema.index({ estado: 1 });

module.exports = mongoose.model('Registro', registroSchema);
