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
    // Extraer token del header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new appError_1.default('Token de acceso requerido', 401));
    }
    // Verificar token
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    // Verificar si el usuario existe
    const currentUser = await user_model_1.default.findById(decoded.id);
    if (!currentUser) {
        return next(new appError_1.default('El usuario ya no existe', 401));
    }
    // Verificar si cambió la contraseña
    if (currentUser.cambioPassword && currentUser.cambioPassword(decoded.iat)) {
        return next(new appError_1.default('Contraseña cambiada recientemente. Inicia sesión nuevamente', 401));
    }
    req.user = currentUser;
    next();
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
            return next(new appError_1.default('Usuario no autenticado', 401));
        }
        if (!roles.includes(req.user.role)) {
            return next(new appError_1.default('No tienes permisos para esta acción', 403));
        }
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