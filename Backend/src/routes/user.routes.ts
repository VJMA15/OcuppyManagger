import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  getUserProfile,
  updateUserPasswordAdmin
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

// Validaciones para actualizar contraseña (solo admin)
const validateUpdatePassword = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  body('passwordConfirm')
    .optional()
    .custom((value, { req }) => {
      if (typeof value !== 'undefined' && value !== req.body.password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
];

// ==================== RUTAS PROTEGIDAS ====================

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener perfil del usuario autenticado
router.get('/profile', getUserProfile);

// ==================== RUTAS DE ADMINISTRADOR ====================

// Obtener todos los usuarios (solo admin)
router.get('/', requireRole(['admin']), getAllUsers);

// Obtener un usuario específico (solo admin)
router.get('/:id', requireRole(['admin']), param('id').isMongoId().withMessage('ID inválido'), handleValidationErrors, getUser);

// Crear nuevo usuario (solo admin)
router.post('/', requireRole(['admin']), validateCreateUser, handleValidationErrors, createUser);

// Actualizar usuario (solo admin)
router.put('/:id', requireRole(['admin']), param('id').isMongoId().withMessage('ID inválido'), validateUpdateUser, handleValidationErrors, updateUser);

// Eliminar usuario (solo admin)
router.delete('/:id', requireRole(['admin']), param('id').isMongoId().withMessage('ID inválido'), handleValidationErrors, deleteUser);

// Actualizar rol de usuario (solo admin)
router.patch('/:id/role', requireRole(['admin']), param('id').isMongoId().withMessage('ID inválido'), validateUpdateRole, handleValidationErrors, updateUserRole);

// Actualizar contraseña de usuario (solo admin)
router.patch('/:id/password', requireRole(['admin']), param('id').isMongoId().withMessage('ID inválido'), validateUpdatePassword, handleValidationErrors, updateUserPasswordAdmin);

export default router;