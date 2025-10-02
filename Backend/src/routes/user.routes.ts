import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  getUserProfile
} from '../controllers/user.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';
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

// Validaciones para crear usuario
const validateCreateUser = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2 })
    .withMessage('El nombre debe tener al menos 2 caracteres'),
  body('cc')
    .notEmpty()
    .withMessage('La cédula es requerida')
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
    .isIn(['admin', 'instructor', 'guardia'])
    .withMessage('El rol debe ser: admin, instructor o guardia')
];

// Validaciones para actualizar usuario
const validateUpdateUser = [
  body('nombre')
    .optional()
    .isLength({ min: 2 })
    .withMessage('El nombre debe tener al menos 2 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['admin', 'instructor', 'guardia', 'usuario'])
    .withMessage('El rol debe ser: admin, instructor, guardia o usuario')
];

// Validaciones para actualizar rol
const validateUpdateRole = [
  body('role')
    .isIn(['admin', 'instructor', 'guardia', 'usuario'])
    .withMessage('El rol debe ser: admin, instructor, guardia o usuario')
];

// ==================== RUTAS PROTEGIDAS ====================

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener perfil del usuario autenticado
router.get('/profile', getUserProfile);

// ==================== RUTAS DE ADMINISTRADOR ====================

// Obtener todos los usuarios (admin e instructor)
router.get('/', requireRole(['admin', 'instructor']), getAllUsers);

// Obtener un usuario específico (admin e instructor)
router.get('/:id', requireRole(['admin', 'instructor']), getUser);

// Crear nuevo usuario (solo admin)
router.post('/', requireRole(['admin']), validateCreateUser, handleValidationErrors, createUser);

// Actualizar usuario (solo admin)
router.put('/:id', requireRole(['admin']), validateUpdateUser, handleValidationErrors, updateUser);

// Eliminar usuario (solo admin)
router.delete('/:id', requireRole(['admin']), deleteUser);

// Actualizar rol de usuario (solo admin)
router.patch('/:id/role', requireRole(['admin']), validateUpdateRole, handleValidationErrors, updateUserRole);

export default router;