const mongoose = require('mongoose');

const ambienteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del ambiente es obligatorio'],
    unique: true,
    trim: true
  },
  descripcion: String,
  capacidad: {
    type: Number,
    required: [true, 'La capacidad es obligatoria'],
    min: [1, 'La capacidad debe ser al menos 1']
  },
  tipo: {
    type: String,
    enum: ['aula', 'laboratorio', 'auditorio', 'oficina', 'otro'],
    required: [true, 'El tipo de ambiente es obligatorio']
  },
  estado: {
    type: String,
    enum: ['disponible', 'en_mantenimiento', 'no_disponible'],
    default: 'disponible'
  },
  recursos: [{
    nombre: String,
    cantidad: Number
  }],
  ubicacion: String,
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

module.exports = mongoose.model('Ambiente', ambienteSchema);
