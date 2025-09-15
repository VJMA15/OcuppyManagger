import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interfaz para el documento User
export interface IUser extends Document {
  nombre: string;
  cc: string;
  email: string;
  password: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  role: 'admin' | 'instructor' | 'guardia';
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Métodos de instancia
  compararPassword(candidatePassword: string): Promise<boolean>;
  cambioPassword(JWTTimestamp: number): boolean;
  createPasswordResetToken(): string;
}

const userSchema = new Schema<IUser>({
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
    enum: ['admin', 'instructor', 'guardia'],
    default: 'instructor'
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
userSchema.methods.compararPassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para verificar si el usuario cambió la contraseña después de que se emitió el token
userSchema.methods.cambioPassword = function(this: any, JWTTimestamp: number): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      (this.passwordChangedAt.getTime() / 1000).toString(),
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
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

// Método para crear token de reset de contraseña
userSchema.methods.createPasswordResetToken = function(): string {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutos

  return resetToken;
};

const User = mongoose.model<IUser>('User', userSchema);
export default User;