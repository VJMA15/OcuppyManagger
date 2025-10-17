"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = exports.requireRole = exports.authorizeRoles = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const appError_1 = __importDefault(require("../utils/appError"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
// Middleware de autenticación
exports.authenticateToken = (0, catchAsync_1.default)(async (req, res, next) => {
    let token;
    console.log('🔐 [Auth Middleware] Iniciando autenticación...');
    console.log('🔐 [Auth Middleware] Headers:', req.headers.authorization);
    console.log('🔐 [Auth Middleware] Cookies:', req.cookies);
    // Extraer token del header Authorization o cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        console.log('🔐 [Auth Middleware] Token encontrado en Authorization header');
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
        console.log('🔐 [Auth Middleware] Token encontrado en cookie jwt');
    }
    else if (req.cookies.token) {
        token = req.cookies.token;
        console.log('🔐 [Auth Middleware] Token encontrado en cookie token');
    }
    else if (req.cookies.auth_token) {
        token = req.cookies.auth_token;
        console.log('🔐 [Auth Middleware] Token encontrado en cookie auth_token');
    }
    if (!token) {
        console.log('❌ [Auth Middleware] No se encontró token');
        return next(new appError_1.default('Token de acceso requerido', 401));
    }
    try {
        // Verificar token
        console.log('🔐 [Auth Middleware] Verificando token...');
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log('🔐 [Auth Middleware] Token decodificado:', { id: decoded.id, role: decoded.role });
        // Verificar si el usuario existe
        const currentUser = await user_model_1.default.findById(decoded.id).select('+activo');
        if (!currentUser) {
            console.log('❌ [Auth Middleware] Usuario no encontrado en BD');
            return next(new appError_1.default('El usuario ya no existe', 401));
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
            return next(new appError_1.default('Tu cuenta ha sido desactivada', 401));
        }
        // Verificar si cambió la contraseña
        if (currentUser.cambioPassword && currentUser.cambioPassword(decoded.iat)) {
            console.log('❌ [Auth Middleware] Contraseña cambiada recientemente');
            return next(new appError_1.default('Contraseña cambiada recientemente. Inicia sesión nuevamente', 401));
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
    }
    catch (error) {
        console.log('❌ [Auth Middleware] Error al verificar token:', error instanceof Error ? error.message : 'Unknown error');
        return next(new appError_1.default('Token inválido o expirado', 401));
    }
});
// Middleware para verificar roles
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new appError_1.default('No tienes permisos para esta acción', 403));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
// Middleware para requerir roles específicos
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            console.log('❌ [RequireRole] Usuario no autenticado');
            return next(new appError_1.default('Usuario no autenticado', 401));
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
            return next(new appError_1.default('No tienes permisos para esta acción', 403));
        }
        console.log('✅ [RequireRole] Acceso autorizado');
        next();
    };
};
exports.requireRole = requireRole;
// Exportaciones compatibles con CommonJS (para compatibilidad)
exports.authenticate = exports.authenticateToken;
exports.authorize = exports.authorizeRoles;
// Exportación por defecto
exports.default = {
    authenticateToken: exports.authenticateToken,
    authorizeRoles: exports.authorizeRoles,
    requireRole: exports.requireRole,
    authenticate: exports.authenticate,
    authorize: exports.authorize
};
//# sourceMappingURL=auth.middleware.js.map