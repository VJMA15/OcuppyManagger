const mongoose = require('mongoose');

const bitacoraSchema = new mongoose.Schema({
  accion: {
    type: String,
    required: [true, 'La acción es obligatoria'],
    trim: true
  },
  entidad: {
    type: String,
    required: [true, 'La entidad es obligatoria'],
    enum: ['Usuario', 'Ambiente', 'Reserva', 'Registro', 'Sistema']
  },
  entidadId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  usuario: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  detalles: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ip: String,
  userAgent: String
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento de las consultas
bitacoraSchema.index({ entidad: 1, entidadId: 1 });
bitacoraSchema.index({ usuario: 1 });
bitacoraSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Bitacora', bitacoraSchema);
