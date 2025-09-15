import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/user.model';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { sendEmail } from '../utils/email';

// Generar JWT token
const signToken = (id: string) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
};

// Crear y enviar token
const createSendToken = (user: any, statusCode: number, res: Response) => {
  const token = signToken(user._id);
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRES_IN!) || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res.cookie('jwt', token, cookieOptions);

  // Remover password del output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      nombre: user.nombre,
      cc: user.cc,
      email: user.email,
      role: user.role,
      activo: user.activo,
      fechaCreacion: user.fechaCreacion
    }
  });
};

// Registro de usuario
export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { nombre, cc, email, password, role = 'instructor' } = req.body;

  // Verificar si el usuario ya existe
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Ya existe un usuario con este email', 400));
  }

  // Verificar si la CC ya existe
  const existingUserByCC = await User.findOne({ cc });
  if (existingUserByCC) {
    return next(new AppError('Ya existe un usuario con esta cédula', 400));
  }

  // Crear nuevo usuario
  const newUser = await User.create({
    nombre,
    cc,
    email,
    password,
    role
  });

  createSendToken(newUser, 201, res);
});

// Login de usuario
export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Verificar si email y password existen
  if (!email || !password) {
    return next(new AppError('Por favor proporciona email y contraseña', 400));
  }

  // Verificar si el usuario existe y la contraseña es correcta
  const user = await User.findOne({ email }).select('+password +activo');

  if (!user || !(await user.compararPassword(password))) {
    return next(new AppError('Email o contraseña incorrectos', 401));
  }

  // Verificar si el usuario está activo
  if (!user.activo) {
    return next(new AppError('Tu cuenta ha sido desactivada. Contacta al administrador', 401));
  }

  createSendToken(user, 200, res);
});

// Verificar usuario con CC (para el frontend)
export const verify = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { cc, password } = req.body;

  // Verificar si cc y password existen
  if (!cc || !password) {
    return next(new AppError('Por favor proporciona CC y contraseña', 400));
  }

  // Verificar si el usuario existe y la contraseña es correcta
  const user = await User.findOne({ cc }).select('+password +activo +role');

  if (!user || !(await user.compararPassword(password))) {
    return next(new AppError('CC o contraseña incorrectos', 401));
  }

  // Verificar si el usuario está activo
  if (!user.activo) {
    return next(new AppError('Tu cuenta ha sido desactivada. Contacta al administrador', 401));
  }

  createSendToken(user, 200, res);
});

// Logout de usuario
export const logout = (req: Request, res: Response) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  });
};

// Refrescar token
export const refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('No estás logueado', 401));
  }

  // Verificar token
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
  
  // Verificar si el usuario existe
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('El usuario ya no existe', 401));
  }

  // Verificar si el usuario está activo
  if (!currentUser.activo) {
    return next(new AppError('Tu cuenta ha sido desactivada', 401));
  }

  createSendToken(currentUser, 200, res);
});

// Recuperar contraseña
export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Obtener usuario basado en el email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No existe usuario con ese email', 404));
  }

  // Generar token de reset aleatorio
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Enviar por email
  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: 'Token de recuperación de contraseña (válido por 10 min)',
      message: `¿Olvidaste tu contraseña? Envía una petición PATCH con tu nueva contraseña a: ${resetURL}.\nSi no solicitaste esto, ignora este email.`
    });

    res.status(200).json({
      success: true,
      message: 'Token enviado al email'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Hubo un error enviando el email. Intenta de nuevo más tarde', 500));
  }
});

// Resetear contraseña
export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Obtener usuario basado en el token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // Si el token no ha expirado y hay usuario, establecer nueva contraseña
  if (!user) {
    return next(new AppError('Token inválido o expirado', 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Actualizar changedPasswordAt property para el usuario
  // Log del usuario in, enviar JWT
  createSendToken(user, 200, res);
});

// Actualizar contraseña para usuario logueado
export const updatePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Obtener usuario de la colección
  const user = await User.findById(req.user.id).select('+password');

  // Verificar si la contraseña actual es correcta
  if (!(await user!.compararPassword(req.body.currentPassword))) {
    return next(new AppError('Tu contraseña actual es incorrecta', 401));
  }

  // Si es así, actualizar contraseña
  user!.password = req.body.newPassword;
  await user!.save();

  // Log usuario in, enviar JWT
  createSendToken(user, 200, res);
});

// Exportaciones por defecto
export default {
  register,
  login,
  verify,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  updatePassword
};