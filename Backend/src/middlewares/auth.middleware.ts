import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';

// Extender la interfaz Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Middleware de autenticación
export const authenticateToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;
  
  // Extraer token del header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return next(new AppError('Token de acceso requerido', 401));
  }
  
  // Verificar token
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; iat: number };
  
  // Verificar si el usuario existe
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('El usuario ya no existe', 401));
  }
  
  // Verificar si cambió la contraseña
  if (currentUser.cambioPassword && currentUser.cambioPassword(decoded.iat)) {
    return next(new AppError('Contraseña cambiada recientemente. Inicia sesión nuevamente', 401));
  }
  
  // Normalizar el campo de rol para documentos legados que usan 'rol'
  (currentUser as any).role = (currentUser as any).role || (currentUser as any).rol;

  req.user = currentUser;
  next();
});

// Middleware para verificar roles
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('No tienes permisos para esta acción', 403));
    }
    next();
  };
};

// Middleware para requerir roles específicos
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Usuario no autenticado', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new AppError('No tienes permisos para esta acción', 403));
    }
    
    next();
  };
};

// Exportaciones compatibles con CommonJS (para compatibilidad)
export const authenticate = authenticateToken;
export const authorize = authorizeRoles;

// Exportación por defecto
export default {
  authenticateToken,
  authorizeRoles,
  requireRole,
  authenticate,
  authorize
};