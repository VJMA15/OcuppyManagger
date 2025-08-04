const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  cc: {
    type: String,
    required: [true, 'La cédula de ciudadanía es obligatoria'],
    unique: true,
    trim: true,
    match: [/^\d{8,12}$/, 'La cédula debe tener entre 8 y 12 dígitos']
  },
  email: {
    type: String,
    required: [true, 'El correo es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un correo válido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  role: {
    type: String,
    enum: ['admin', 'instructor', 'estudiante'],
    default: 'estudiante'
  },
  activo: {
    type: Boolean,
    default: true,
    select: false
  }
}, {
  timestamps: true
});

// Encriptar contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Método para comparar contraseñas
userSchema.methods.compararPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para verificar si el usuario cambió la contraseña después de que se emitió el token
userSchema.methods.cambioPassword = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // False significa que NO cambió la contraseña
  return false;
};

// Middleware para establecer passwordChangedAt cuando se actualiza la contraseña
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  
  // Restar 1 segundo para asegurar que el token se emita después de que se haya cambiado la contraseña
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

module.exports = mongoose.model('User', userSchema);
