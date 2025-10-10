"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const user_controller_1 = require("../controllers/user.controller");
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
// Validaciones para crear usuario
const validateCreateUser = [
    (0, express_validator_1.body)('nombre')
        .notEmpty()
        .withMessage('El nombre es requerido')
        .isLength({ min: 2 })
        .withMessage('El nombre debe tener al menos 2 caracteres'),
    (0, express_validator_1.body)('cc')
        .notEmpty()
        .withMessage('La cédula es requerida')
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
        .isIn(['admin', 'instructor', 'guardia'])
        .withMessage('El rol debe ser: admin, instructor o guardia')
];
// Validaciones para actualizar usuario
const validateUpdateUser = [
    (0, express_validator_1.body)('nombre')
        .optional()
        .isLength({ min: 2 })
        .withMessage('El nombre debe tener al menos 2 caracteres'),
    (0, express_validator_1.body)('email')
        .optional()
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail(),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(['admin', 'instructor', 'guardia', 'usuario'])
        .withMessage('El rol debe ser: admin, instructor, guardia o usuario')
];
// Validaciones para actualizar rol
const validateUpdateRole = [
    (0, express_validator_1.body)('role')
        .isIn(['admin', 'instructor', 'guardia', 'usuario'])
        .withMessage('El rol debe ser: admin, instructor, guardia o usuario')
];
// ==================== RUTAS PROTEGIDAS ====================
// Todas las rutas requieren autenticación
router.use(auth_middleware_1.authenticateToken);
// Obtener perfil del usuario autenticado
router.get('/profile', user_controller_1.getUserProfile);
// ==================== RUTAS DE ADMINISTRADOR ====================
// Obtener todos los usuarios (admin e instructor)
router.get('/', (0, auth_middleware_1.requireRole)(['admin', 'instructor']), user_controller_1.getAllUsers);
// Obtener un usuario específico (admin e instructor)
router.get('/:id', (0, auth_middleware_1.requireRole)(['admin', 'instructor']), user_controller_1.getUser);
// Crear nuevo usuario (solo admin)
router.post('/', (0, auth_middleware_1.requireRole)(['admin']), validateCreateUser, handleValidationErrors, user_controller_1.createUser);
// Actualizar usuario (solo admin)
router.put('/:id', (0, auth_middleware_1.requireRole)(['admin']), validateUpdateUser, handleValidationErrors, user_controller_1.updateUser);
// Eliminar usuario (solo admin)
router.delete('/:id', (0, auth_middleware_1.requireRole)(['admin']), user_controller_1.deleteUser);
// Actualizar rol de usuario (solo admin)
router.patch('/:id/role', (0, auth_middleware_1.requireRole)(['admin']), validateUpdateRole, handleValidationErrors, user_controller_1.updateUserRole);
exports.default = router;
//# sourceMappingURL=user.routes.js.map