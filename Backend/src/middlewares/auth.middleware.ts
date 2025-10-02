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
  
  console.log('🔐 [Auth Middleware] Iniciando autenticación...');
  console.log('🔐 [Auth Middleware] Headers:', req.headers.authorization);
  console.log('🔐 [Auth Middleware] Cookies:', req.cookies);
  
  // Extraer token del header Authorization o cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('🔐 [Auth Middleware] Token encontrado en Authorization header');
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
    console.log('🔐 [Auth Middleware] Token encontrado en cookie jwt');
  } else if (req.cookies.token) {
    token = req.cookies.token;
    console.log('🔐 [Auth Middleware] Token encontrado en cookie token');
  } else if (req.cookies.auth_token) {
    token = req.cookies.auth_token;
    console.log('🔐 [Auth Middleware] Token encontrado en cookie auth_token');
  }
  
  if (!token) {
    console.log('❌ [Auth Middleware] No se encontró token');
    return next(new AppError('Token de acceso requerido', 401));
  }
  
  try {
    // Verificar token
    console.log('🔐 [Auth Middleware] Verificando token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; iat: number; role?: string };
    console.log('🔐 [Auth Middleware] Token decodificado:', { id: decoded.id, role: decoded.role });
    
    // Verificar si el usuario existe
    const currentUser = await User.findById(decoded.id).select('+activo');
    if (!currentUser) {
      console.log('❌ [Auth Middleware] Usuario no encontrado en BD');
      return next(new AppError('El usuario ya no existe', 401));
    }
    
    console.log('🔐 [Auth Middleware] Usuario encontrado:', {
      id: currentUser._id,
      nombre: currentUser.nombre,
      role: currentUser.role,
      activo: currentUser.activo
    });
    
    // Verificar si el usuario está activo
    if (!currentUser.activo) {
      console.log('❌ [Auth Middleware] Usuario inactivo');
      return next(new AppError('Tu cuenta ha sido desactivada', 401));
    }
    
    // Verificar si cambió la contraseña
    if (currentUser.cambioPassword && currentUser.cambioPassword(decoded.iat)) {
      console.log('❌ [Auth Middleware] Contraseña cambiada recientemente');
      return next(new AppError('Contraseña cambiada recientemente. Inicia sesión nuevamente', 401));
    }
    
    // Asegurar que el rol esté disponible
    req.user = {
      ...currentUser.toObject(),
      id: currentUser._id, // Asegurar que el id esté disponible
      role: currentUser.role // Asegurar que el rol esté disponible
    };
    
    console.log('✅ [Auth Middleware] Usuario autenticado exitosamente:', {
      id: req.user._id,
      nombre: req.user.nombre,
      role: req.user.role,
      activo: req.user.activo
    });
    
    next();
  } catch (error) {
    console.log('❌ [Auth Middleware] Error al verificar token:', error instanceof Error ? error.message : 'Unknown error');
    return next(new AppError('Token inválido o expirado', 401));
  }
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
      console.log('❌ [RequireRole] Usuario no autenticado');
      return next(new AppError('Usuario no autenticado', 401));
    }
    
    console.log('🔍 [RequireRole] Verificando permisos:', {
      usuarioId: req.user._id,
      usuarioNombre: req.user.nombre,
      rolUsuario: req.user.role,
      rolesRequeridos: roles,
      tienePermiso: roles.includes(req.user.role)
    });
    
    if (!roles.includes(req.user.role)) {
      console.log('❌ [RequireRole] Acceso denegado - Rol insuficiente');
      return next(new AppError('No tienes permisos para esta acción', 403));
    }
    
    console.log('✅ [RequireRole] Acceso autorizado');
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