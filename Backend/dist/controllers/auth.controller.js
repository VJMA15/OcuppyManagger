"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePassword = exports.resetPassword = exports.forgotPassword = exports.refreshToken = exports.logout = exports.verify = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const user_model_1 = __importDefault(require("../models/user.model"));
const appError_1 = __importDefault(require("../utils/appError"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const email_1 = require("../utils/email");
// Generar JWT token
const signToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};
// Crear y enviar token
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 7) * 24 * 60 * 60 * 1000),
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
exports.register = (0, catchAsync_1.default)(async (req, res, next) => {
    const { nombre, cc, email, password, role = 'instructor' } = req.body;
    // Verificar si el usuario ya existe
    const existingUser = await user_model_1.default.findOne({ email });
    if (existingUser) {
        return next(new appError_1.default('Ya existe un usuario con este email', 400));
    }
    // Verificar si la CC ya existe
    const existingUserByCC = await user_model_1.default.findOne({ cc });
    if (existingUserByCC) {
        return next(new appError_1.default('Ya existe un usuario con esta cédula', 400));
    }
    // Crear nuevo usuario
    const newUser = await user_model_1.default.create({
        nombre,
        cc,
        email,
        password,
        role
    });
    createSendToken(newUser, 201, res);
});
// Login de usuario
exports.login = (0, catchAsync_1.default)(async (req, res, next) => {
    const { email, password } = req.body;
    // Verificar si email y password existen
    if (!email || !password) {
        return next(new appError_1.default('Por favor proporciona email y contraseña', 400));
    }
    // Verificar si el usuario existe y la contraseña es correcta
    const user = await user_model_1.default.findOne({ email }).select('+password +activo');
    if (!user || !(await user.compararPassword(password))) {
        return next(new appError_1.default('Email o contraseña incorrectos', 401));
    }
    // Verificar si el usuario está activo
    if (!user.activo) {
        return next(new appError_1.default('Tu cuenta ha sido desactivada. Contacta al administrador', 401));
    }
    createSendToken(user, 200, res);
});
// Verificar usuario con CC (para el frontend)
exports.verify = (0, catchAsync_1.default)(async (req, res, next) => {
    const { cc, password } = req.body;
    // Verificar si cc y password existen
    if (!cc || !password) {
        return next(new appError_1.default('Por favor proporciona CC y contraseña', 400));
    }
    // Verificar si el usuario existe y la contraseña es correcta
    const user = await user_model_1.default.findOne({ cc }).select('+password +activo +role');
    if (!user || !(await user.compararPassword(password))) {
        return next(new appError_1.default('CC o contraseña incorrectos', 401));
    }
    // Verificar si el usuario está activo
    if (!user.activo) {
        return next(new appError_1.default('Tu cuenta ha sido desactivada. Contacta al administrador', 401));
    }
    createSendToken(user, 200, res);
});
// Logout de usuario
const logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        message: 'Sesión cerrada exitosamente'
    });
};
exports.logout = logout;
// Refrescar token
exports.refreshToken = (0, catchAsync_1.default)(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        return next(new appError_1.default('No estás logueado', 401));
    }
    // Verificar token
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    // Verificar si el usuario existe
    const currentUser = await user_model_1.default.findById(decoded.id);
    if (!currentUser) {
        return next(new appError_1.default('El usuario ya no existe', 401));
    }
    // Verificar si el usuario está activo
    if (!currentUser.activo) {
        return next(new appError_1.default('Tu cuenta ha sido desactivada', 401));
    }
    createSendToken(currentUser, 200, res);
});
// Recuperar contraseña
exports.forgotPassword = (0, catchAsync_1.default)(async (req, res, next) => {
    // Obtener usuario basado en el email
    const user = await user_model_1.default.findOne({ email: req.body.email });
    if (!user) {
        return next(new appError_1.default('No existe usuario con ese email', 404));
    }
    // Generar token de reset aleatorio
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    // Enviar por email
    try {
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;
        await (0, email_1.sendEmail)({
            email: user.email,
            subject: 'Token de recuperación de contraseña (válido por 10 min)',
            message: `¿Olvidaste tu contraseña? Envía una petición PATCH con tu nueva contraseña a: ${resetURL}.\nSi no solicitaste esto, ignora este email.`
        });
        res.status(200).json({
            success: true,
            message: 'Token enviado al email'
        });
    }
    catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new appError_1.default('Hubo un error enviando el email. Intenta de nuevo más tarde', 500));
    }
});
// Resetear contraseña
exports.resetPassword = (0, catchAsync_1.default)(async (req, res, next) => {
    // Obtener usuario basado en el token
    const hashedToken = crypto_1.default
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    const user = await user_model_1.default.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    // Si el token no ha expirado y hay usuario, establecer nueva contraseña
    if (!user) {
        return next(new appError_1.default('Token inválido o expirado', 400));
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
exports.updatePassword = (0, catchAsync_1.default)(async (req, res, next) => {
    // Obtener usuario de la colección
    const user = await user_model_1.default.findById(req.user.id).select('+password');
    // Verificar si la contraseña actual es correcta
    if (!(await user.compararPassword(req.body.currentPassword))) {
        return next(new appError_1.default('Tu contraseña actual es incorrecta', 401));
    }
    // Si es así, actualizar contraseña
    user.password = req.body.newPassword;
    await user.save();
    // Log usuario in, enviar JWT
    createSendToken(user, 200, res);
});
// Exportaciones por defecto
exports.default = {
    register: exports.register,
    login: exports.login,
    verify: exports.verify,
    logout: exports.logout,
    refreshToken: exports.refreshToken,
    forgotPassword: exports.forgotPassword,
    resetPassword: exports.resetPassword,
    updatePassword: exports.updatePassword
};
//# sourceMappingURL=auth.controller.js.map