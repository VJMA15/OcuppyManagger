import { Router, Response, NextFunction } from 'express';
import { body, param, query } from 'express-validator';
import {
  crearEntrega,
  obtenerEntregas,
  obtenerEntregaPorId,
  devolverEntrega,
  cancelarEntrega,
  obtenerEntregasPorJornada,
  obtenerEntregasVencidas,
  obtenerEstadisticasEntregas,
  verificarEntregaPorCodigo
} from '../controllers/entrega.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Validaciones para crear entrega
const validarCrearEntrega = [
  body('ambiente')
    .notEmpty()
    .withMessage('El ambiente es obligatorio')
    .isMongoId()
    .withMessage('ID de ambiente inválido'),
  body('instructor')
    .notEmpty()
    .withMessage('El instructor es obligatorio')
    .isMongoId()
    .withMessage('ID de instructor inválido'),
  body('jornada')
    .notEmpty()
    .withMessage('La jornada es obligatoria')
    .isIn(['mañana', 'tarde', 'noche'])
    .withMessage('Jornada debe ser: mañana, tarde o noche'),
  body('observacionesEntrega')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Las observaciones no pueden exceder 500 caracteres'),
  body('equiposEntregados')
    .optional()
    .isArray()
    .withMessage('Los equipos entregados deben ser un array'),
  body('equiposEntregados.*.nombre')
    .optional()
    .notEmpty()
    .withMessage('El nombre del equipo es obligatorio'),
  body('equiposEntregados.*.cantidad')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un número entero mayor a 0'),
  body('equiposEntregados.*.estado')
    .optional()
    .notEmpty()
    .withMessage('El estado del equipo es obligatorio')
];

// Validaciones para devolver entrega
const validarDevolverEntrega = [
  param('id')
    .isMongoId()
    .withMessage('ID de entrega inválido'),
  body('observacionesDevolucion')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Las observaciones no pueden exceder 500 caracteres')
];

// Validaciones para cancelar entrega
const validarCancelarEntrega = [
  param('id')
    .isMongoId()
    .withMessage('ID de entrega inválido'),
  body('motivo')
    .optional()
    .isLength({ max: 500 })
    .withMessage('El motivo no puede exceder 500 caracteres')
];

// Validaciones para obtener entrega por ID
const validarObtenerEntregaPorId = [
  param('id')
    .isMongoId()
    .withMessage('ID de entrega inválido')
];

// Validaciones para obtener entregas por jornada
const validarObtenerEntregasPorJornada = [
  param('jornada')
    .isIn(['mañana', 'tarde', 'noche'])
    .withMessage('Jornada debe ser: mañana, tarde o noche'),
  query('fecha')
    .optional()
    .isISO8601()
    .withMessage('Formato de fecha inválido (usar YYYY-MM-DD)')
];

// Validaciones para obtener entregas con filtros
const validarObtenerEntregas = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100'),
  query('estado')
    .optional()
    .isIn(['pendiente', 'entregado', 'devuelto', 'cancelado'])
    .withMessage('Estado inválido'),
  query('jornada')
    .optional()
    .isIn(['mañana', 'tarde', 'noche'])
    .withMessage('Jornada debe ser: mañana, tarde o noche'),
  query('instructor')
    .optional()
    .isMongoId()
    .withMessage('ID de instructor inválido'),
  query('ambiente')
    .optional()
    .isMongoId()
    .withMessage('ID de ambiente inválido'),
  query('fechaInicio')
    .optional()
    .isISO8601()
    .withMessage('Formato de fecha de inicio inválido'),
  query('fechaFin')
    .optional()
    .isISO8601()
    .withMessage('Formato de fecha de fin inválido'),
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('El término de búsqueda debe tener entre 1 y 100 caracteres')
];

// Validaciones para estadísticas
const validarEstadisticas = [
  query('fechaInicio')
    .optional()
    .isISO8601()
    .withMessage('Formato de fecha de inicio inválido'),
  query('fechaFin')
    .optional()
    .isISO8601()
    .withMessage('Formato de fecha de fin inválido')
];

// Validaciones para verificar código
const validarVerificarCodigo = [
  param('codigo')
    .isLength({ min: 6, max: 6 })
    .withMessage('El código debe tener exactamente 6 caracteres')
    .isAlphanumeric()
    .withMessage('El código solo puede contener letras y números')
];

// ==================== RUTAS ====================

// Crear nueva entrega (solo guardias y administradores)
router.post('/',
  authenticateToken,
  requireRole(['guardia', 'admin']),
  validarCrearEntrega,
  crearEntrega
);

// Obtener todas las entregas con filtros (todos los roles autenticados)
router.get('/',
  authenticateToken,
  validarObtenerEntregas,
  obtenerEntregas
);

// Obtener entregas por jornada (guardias y administradores)
router.get('/jornada/:jornada',
  authenticateToken,
  requireRole(['guardia', 'admin']),
  validarObtenerEntregasPorJornada,
  obtenerEntregasPorJornada
);

// Obtener entregas vencidas (guardias y administradores)
router.get('/vencidas',
  authenticateToken,
  requireRole(['guardia', 'admin']),
  obtenerEntregasVencidas
);

// Obtener estadísticas de entregas (administradores)
router.get('/estadisticas',
  authenticateToken,
  requireRole(['admin']),
  validarEstadisticas,
  obtenerEstadisticasEntregas
);

// Verificar entrega por código (público - para instructores)
router.get('/verificar/:codigo',
  validarVerificarCodigo,
  verificarEntregaPorCodigo
);

// Obtener entrega específica por ID (todos los roles autenticados)
router.get('/:id',
  authenticateToken,
  validarObtenerEntregaPorId,
  obtenerEntregaPorId
);

// Marcar entrega como devuelta (solo guardias y administradores)
router.patch('/:id/devolver',
  authenticateToken,
  requireRole(['guardia', 'admin']),
  validarDevolverEntrega,
  devolverEntrega
);

// Cancelar entrega (solo guardias y administradores)
router.patch('/:id/cancelar',
  authenticateToken,
  requireRole(['guardia', 'admin']),
  validarCancelarEntrega,
  cancelarEntrega
);

// ==================== RUTAS ESPECÍFICAS PARA INSTRUCTORES ====================

// Obtener mis entregas (solo instructores)
router.get('/instructor/mis-entregas',
  authenticateToken,
  requireRole(['instructor']),
  (req: any, res: Response, next: NextFunction) => {
    // Agregar el ID del instructor a los query params
    req.query.instructor = req.user.id;
    next();
  },
  validarObtenerEntregas,
  obtenerEntregas
);

// ==================== RUTAS ESPECÍFICAS PARA GUARDIAS ====================

// Obtener entregas de mi turno (solo guardias)
router.get('/guardia/mi-turno',
  authenticateToken,
  requireRole(['guardia']),
  (req: any, res: Response, next: NextFunction) => {
    // Determinar jornada actual basada en la hora
    const hora = new Date().getHours();
    let jornada;
    
    if (hora >= 6 && hora < 14) {
      jornada = 'mañana';
    } else if (hora >= 14 && hora < 22) {
      jornada = 'tarde';
    } else {
      jornada = 'noche';
    }
    
    req.params.jornada = jornada;
    next();
  },
  obtenerEntregasPorJornada
);

// Obtener entregas que he realizado (solo guardias)
router.get('/guardia/mis-entregas',
  authenticateToken,
  requireRole(['guardia']),
  (req: any, res: Response, next: NextFunction) => {
    // Filtrar por el guardia actual
    req.query.guardia = req.user.id;
    next();
  },
  validarObtenerEntregas,
  obtenerEntregas
);

export default router;