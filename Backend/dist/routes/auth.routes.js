"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const express_validator_2 = require("express-validator");
const router = (0, express_1.Router)();
// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_2.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array()
        });
    }
    next();
};
// Validaciones para registro
const validateRegister = [
    (0, express_validator_1.body)('nombre')
        .notEmpty()
        .withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    (0, express_validator_1.body)('cc')
        .notEmpty()
        .withMessage('La cédula de ciudadanía es requerida')
        .matches(/^\d{8,12}$/)
        .withMessage('La cédula debe tener entre 8 y 12 dígitos'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(['admin', 'instructor', 'guardia'])
        .withMessage('Rol inválido')
];
// Validaciones para login
const validateLogin = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('La contraseña es requerida')
];
// Validaciones para verify (con CC)
const validateVerify = [
    (0, express_validator_1.body)('cc')
        .notEmpty()
        .withMessage('La cédula es requerida')
        .isLength({ min: 6, max: 15 })
        .withMessage('La cédula debe tener entre 6 y 15 caracteres'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('La contraseña es requerida')
];
// Validaciones para cambio de contraseña
const validateUpdatePassword = [
    (0, express_validator_1.body)('currentPassword')
        .notEmpty()
        .withMessage('La contraseña actual es requerida'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 6 })
        .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número')
];
// Validaciones para recuperar contraseña
const validateForgotPassword = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail()
];
// Validaciones para resetear contraseña
const validateResetPassword = [
    (0, express_validator_1.body)('token')
        .notEmpty()
        .withMessage('El token es requerido'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número')
];
// ==================== RUTAS PÚBLICAS ====================
// Registro de usuario
router.post('/register', validateRegister, handleValidationErrors, auth_controller_1.register);
// Login de usuario
router.post('/login', validateLogin, handleValidationErrors, auth_controller_1.login);
// Verificar usuario con cédula
router.post('/verify', validateVerify, handleValidationErrors, auth_controller_1.verify);
// Recuperar contraseña
router.post('/forgot-password', validateForgotPassword, handleValidationErrors, auth_controller_1.forgotPassword);
// Resetear contraseña
router.post('/reset-password', validateResetPassword, handleValidationErrors, auth_controller_1.resetPassword);
// Refrescar token
router.post('/refresh-token', auth_controller_1.refreshToken);
// ==================== RUTAS PROTEGIDAS ====================
// Logout (requiere autenticación)
router.post('/logout', auth_middleware_1.authenticateToken, auth_controller_1.logout);
// Cambiar contraseña (requiere autenticación)
router.patch('/update-password', auth_middleware_1.authenticateToken, validateUpdatePassword, handleValidationErrors, auth_controller_1.updatePassword);
// Verificar token (para validar sesión)
router.get('/verify-token', auth_middleware_1.authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Token válido',
        user: req.user
    });
});
// Obtener perfil del usuario autenticado
router.get('/me', auth_middleware_1.authenticateToken, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map