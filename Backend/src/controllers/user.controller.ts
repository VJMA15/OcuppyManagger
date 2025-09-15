import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import bcrypt from 'bcryptjs';

// Obtener todos los usuarios
export const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { page = 1, limit = 10, search = '', role = '' } = req.query;
  
  // Construir filtros
  const filters: any = {};
  
  if (search) {
    filters.$or = [
      { nombre: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (role) {
    filters.role = role;
  }
  
  // Calcular paginación
  const skip = (Number(page) - 1) * Number(limit);
  
  // Obtener usuarios con paginación
  const users = await User.find(filters)
    .select('-password -passwordResetToken -passwordResetExpires')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));
  
  // Contar total de usuarios
  const total = await User.countDocuments(filters);
  
  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalUsers: total,
        hasNextPage: skip + users.length < total,
        hasPrevPage: Number(page) > 1
      }
    }
  });
});

// Obtener un usuario específico
export const getUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  const user = await User.findById(id).select('-password -passwordResetToken -passwordResetExpires');
  
  if (!user) {
    return next(new AppError('Usuario no encontrado', 404));
  }
  
  res.status(200).json({
    success: true,
    data: { user }
  });
});

// Crear nuevo usuario
export const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('📝 Datos recibidos en createUser:', req.body);
  console.log('📝 Campo cc específicamente:', req.body.cc, 'tipo:', typeof req.body.cc);
  const { nombre, cc, email, password, passwordConfirm, role } = req.body;
  console.log('📝 Variables extraídas - cc:', cc, 'nombre:', nombre);
  
  // Verificar si el email ya existe
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Ya existe un usuario con este email', 400));
  }
  
  // Verificar si la CC ya existe
  const existingUserByCC = await User.findOne({ cc });
  if (existingUserByCC) {
    return next(new AppError('Ya existe un usuario con esta cédula', 400));
  }
  
  // Hashear la contraseña
  const hashedPassword = await bcrypt.hash(password, 12);
  
  // Crear el usuario
  const newUser = await User.create({
    nombre,
    cc,
    email,
    password: hashedPassword,
    role,
    activo: true
  });
  
  // Remover la contraseña de la respuesta
  const userResponse = newUser.toObject();
  const { password: _, ...userWithoutPassword } = userResponse;
  
  res.status(201).json({
    success: true,
    message: 'Usuario creado exitosamente',
    data: { user: userWithoutPassword }
  });
});

// Actualizar usuario
export const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { nombre, email, rol, telefono, documento, activo } = req.body;
  
  // Verificar si el usuario existe
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('Usuario no encontrado', 404));
  }
  
  // Si se está actualizando el email, verificar que no exista otro usuario con ese email
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Ya existe un usuario con este email', 400));
    }
  }
  
  // Actualizar campos
  const updateData: any = {};
  if (nombre) updateData.nombre = nombre;
  if (email) updateData.email = email;
  if (rol) updateData.rol = rol;
  if (telefono !== undefined) updateData.telefono = telefono;
  if (documento !== undefined) updateData.documento = documento;
  if (activo !== undefined) updateData.activo = activo;
  
  const updatedUser = await User.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password -passwordResetToken -passwordResetExpires');
  
  res.status(200).json({
    success: true,
    message: 'Usuario actualizado exitosamente',
    data: { user: updatedUser }
  });
});

// Eliminar usuario
export const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  // Verificar si el usuario existe
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('Usuario no encontrado', 404));
  }
  
  // No permitir eliminar el propio usuario
  if (req.user && req.user.id === id) {
    return next(new AppError('No puedes eliminar tu propia cuenta', 400));
  }
  
  // Eliminar el usuario
  await User.findByIdAndDelete(id);
  
  res.status(200).json({
    success: true,
    message: 'Usuario eliminado exitosamente'
  });
});

// Actualizar rol de usuario
export const updateUserRole = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { rol } = req.body;
  
  // Verificar si el usuario existe
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('Usuario no encontrado', 404));
  }
  
  // No permitir cambiar el rol del propio usuario
  if (req.user && req.user.id === id) {
    return next(new AppError('No puedes cambiar tu propio rol', 400));
  }
  
  // Actualizar el rol
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { rol },
    { new: true, runValidators: true }
  ).select('-password -passwordResetToken -passwordResetExpires');
  
  res.status(200).json({
    success: true,
    message: 'Rol de usuario actualizado exitosamente',
    data: { user: updatedUser }
  });
});

// Obtener perfil del usuario autenticado
export const getUserProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user?.id).select('-password -passwordResetToken -passwordResetExpires');
  
  if (!user) {
    return next(new AppError('Usuario no encontrado', 404));
  }
  
  res.status(200).json({
    success: true,
    data: { user }
  });
});