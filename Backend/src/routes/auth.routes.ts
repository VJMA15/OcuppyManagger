import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  verify,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  updatePassword
} from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// Middleware para manejar errores de validación
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
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
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('cc')
    .notEmpty()
    .withMessage('La cédula de ciudadanía es requerida')
    .matches(/^\d{8,12}$/)
    .withMessage('La cédula debe tener entre 8 y 12 dígitos'),
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  body('role')
    .optional()
    .isIn(['admin', 'instructor', 'guardia'])
    .withMessage('Rol inválido')
];

// Validaciones para login
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

// Validaciones para verify (con CC)
const validateVerify = [
  body('cc')
    .notEmpty()
    .withMessage('La cédula es requerida')
    .isLength({ min: 6, max: 15 })
    .withMessage('La cédula debe tener entre 6 y 15 caracteres'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

// Validaciones para cambio de contraseña
const validateUpdatePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número')
];

// Validaciones para recuperar contraseña
const validateForgotPassword = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
];

// Validaciones para resetear contraseña
const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('El token es requerido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número')
];

// ==================== RUTAS PÚBLICAS ====================

// Registro de usuario
router.post('/register', validateRegister, handleValidationErrors, register);

// Login de usuario
router.post('/login', validateLogin, handleValidationErrors, login);

// Verificar usuario con cédula
router.post('/verify', validateVerify, handleValidationErrors, verify);

// Recuperar contraseña
router.post('/forgot-password', validateForgotPassword, handleValidationErrors, forgotPassword);

// Resetear contraseña
router.post('/reset-password', validateResetPassword, handleValidationErrors, resetPassword);

// Refrescar token
router.post('/refresh-token', refreshToken);

// ==================== RUTAS PROTEGIDAS ====================

// Logout (requiere autenticación)
router.post('/logout', authenticateToken, logout);

// Cambiar contraseña (requiere autenticación)
router.patch('/update-password', authenticateToken, validateUpdatePassword, handleValidationErrors, updatePassword);

// Verificar token (para validar sesión)
router.get('/verify-token', authenticateToken, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Token válido',
    user: req.user
  });
});

// Obtener perfil del usuario autenticado
router.get('/me', authenticateToken, (req: Request, res: Response) => {
  res.json({
    success: true,
    user: req.user
  });
});

export default router;