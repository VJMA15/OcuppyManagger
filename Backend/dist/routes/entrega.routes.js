"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const entrega_controller_1 = require("../controllers/entrega.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Validaciones para crear entrega
const validarCrearEntrega = [
    (0, express_validator_1.body)('ambiente')
        .notEmpty()
        .withMessage('El ambiente es obligatorio')
        .isMongoId()
        .withMessage('ID de ambiente inválido'),
    (0, express_validator_1.body)('instructor')
        .notEmpty()
        .withMessage('El instructor es obligatorio')
        .isMongoId()
        .withMessage('ID de instructor inválido'),
    (0, express_validator_1.body)('jornada')
        .notEmpty()
        .withMessage('La jornada es obligatoria')
        .isIn(['mañana', 'tarde', 'noche'])
        .withMessage('Jornada debe ser: mañana, tarde o noche'),
    (0, express_validator_1.body)('observacionesEntrega')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Las observaciones no pueden exceder 500 caracteres'),
    (0, express_validator_1.body)('equiposEntregados')
        .optional()
        .isArray()
        .withMessage('Los equipos entregados deben ser un array'),
    (0, express_validator_1.body)('equiposEntregados.*.nombre')
        .optional()
        .notEmpty()
        .withMessage('El nombre del equipo es obligatorio'),
    (0, express_validator_1.body)('equiposEntregados.*.cantidad')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La cantidad debe ser un número entero mayor a 0'),
    (0, express_validator_1.body)('equiposEntregados.*.estado')
        .optional()
        .notEmpty()
        .withMessage('El estado del equipo es obligatorio')
];
// Validaciones para devolver entrega
const validarDevolverEntrega = [
    (0, express_validator_1.param)('id')
        .isMongoId()
        .withMessage('ID de entrega inválido'),
    (0, express_validator_1.body)('observacionesDevolucion')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Las observaciones no pueden exceder 500 caracteres')
];
// Validaciones para cancelar entrega
const validarCancelarEntrega = [
    (0, express_validator_1.param)('id')
        .isMongoId()
        .withMessage('ID de entrega inválido'),
    (0, express_validator_1.body)('motivo')
        .optional()
        .isLength({ max: 500 })
        .withMessage('El motivo no puede exceder 500 caracteres')
];
// Validaciones para obtener entrega por ID
const validarObtenerEntregaPorId = [
    (0, express_validator_1.param)('id')
        .isMongoId()
        .withMessage('ID de entrega inválido')
];
// Validaciones para obtener entregas por jornada
const validarObtenerEntregasPorJornada = [
    (0, express_validator_1.param)('jornada')
        .isIn(['mañana', 'tarde', 'noche'])
        .withMessage('Jornada debe ser: mañana, tarde o noche'),
    (0, express_validator_1.query)('fecha')
        .optional()
        .isISO8601()
        .withMessage('Formato de fecha inválido (usar YYYY-MM-DD)')
];
// Validaciones para obtener entregas con filtros
const validarObtenerEntregas = [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número entero mayor a 0'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe ser un número entre 1 y 100'),
    (0, express_validator_1.query)('estado')
        .optional()
        .isIn(['pendiente', 'entregado', 'devuelto', 'cancelado'])
        .withMessage('Estado inválido'),
    (0, express_validator_1.query)('jornada')
        .optional()
        .isIn(['mañana', 'tarde', 'noche'])
        .withMessage('Jornada debe ser: mañana, tarde o noche'),
    (0, express_validator_1.query)('instructor')
        .optional()
        .isMongoId()
        .withMessage('ID de instructor inválido'),
    (0, express_validator_1.query)('ambiente')
        .optional()
        .isMongoId()
        .withMessage('ID de ambiente inválido'),
    (0, express_validator_1.query)('fechaInicio')
        .optional()
        .isISO8601()
        .withMessage('Formato de fecha de inicio inválido'),
    (0, express_validator_1.query)('fechaFin')
        .optional()
        .isISO8601()
        .withMessage('Formato de fecha de fin inválido'),
    (0, express_validator_1.query)('search')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('El término de búsqueda debe tener entre 1 y 100 caracteres')
];
// Validaciones para estadísticas
const validarEstadisticas = [
    (0, express_validator_1.query)('fechaInicio')
        .optional()
        .isISO8601()
        .withMessage('Formato de fecha de inicio inválido'),
    (0, express_validator_1.query)('fechaFin')
        .optional()
        .isISO8601()
        .withMessage('Formato de fecha de fin inválido')
];
// Validaciones para verificar código
const validarVerificarCodigo = [
    (0, express_validator_1.param)('codigo')
        .isLength({ min: 6, max: 6 })
        .withMessage('El código debe tener exactamente 6 caracteres')
        .isAlphanumeric()
        .withMessage('El código solo puede contener letras y números')
];
// ==================== RUTAS ====================
// Crear nueva entrega (solo guardias y administradores)
router.post('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requireRole)(['guardia', 'admin']), validarCrearEntrega, entrega_controller_1.crearEntrega);
// Obtener todas las entregas con filtros (todos los roles autenticados)
router.get('/', auth_middleware_1.authenticateToken, validarObtenerEntregas, entrega_controller_1.obtenerEntregas);
// Obtener entregas por jornada (guardias y administradores)
router.get('/jornada/:jornada', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requireRole)(['guardia', 'admin']), validarObtenerEntregasPorJornada, entrega_controller_1.obtenerEntregasPorJornada);
// Obtener entregas vencidas (guardias y administradores)
router.get('/vencidas', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requireRole)(['guardia', 'admin']), entrega_controller_1.obtenerEntregasVencidas);
// Obtener estadísticas de entregas (administradores)
router.get('/estadisticas', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requireRole)(['admin']), validarEstadisticas, entrega_controller_1.obtenerEstadisticasEntregas);
// Verificar entrega por código (público - para instructores)
router.get('/verificar/:codigo', validarVerificarCodigo, entrega_controller_1.verificarEntregaPorCodigo);
// Obtener entrega específica por ID (todos los roles autenticados)
router.get('/:id', auth_middleware_1.authenticateToken, validarObtenerEntregaPorId, entrega_controller_1.obtenerEntregaPorId);
// Marcar entrega como devuelta (solo guardias y administradores)
router.patch('/:id/devolver', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requireRole)(['guardia', 'admin']), validarDevolverEntrega, entrega_controller_1.devolverEntrega);
// Cancelar entrega (solo guardias y administradores)
router.patch('/:id/cancelar', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requireRole)(['guardia', 'admin']), validarCancelarEntrega, entrega_controller_1.cancelarEntrega);
// ==================== RUTAS ESPECÍFICAS PARA INSTRUCTORES ====================
// Obtener mis entregas (solo instructores)
router.get('/instructor/mis-entregas', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requireRole)(['instructor']), (req, res, next) => {
    // Agregar el ID del instructor a los query params
    req.query.instructor = req.user.id;
    next();
}, validarObtenerEntregas, entrega_controller_1.obtenerEntregas);
// ==================== RUTAS ESPECÍFICAS PARA GUARDIAS ====================
// Obtener entregas de mi turno (solo guardias)
router.get('/guardia/mi-turno', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requireRole)(['guardia']), (req, res, next) => {
    // Determinar jornada actual basada en la hora
    const hora = new Date().getHours();
    let jornada;
    if (hora >= 6 && hora < 14) {
        jornada = 'mañana';
    }
    else if (hora >= 14 && hora < 22) {
        jornada = 'tarde';
    }
    else {
        jornada = 'noche';
    }
    req.params.jornada = jornada;
    next();
}, entrega_controller_1.obtenerEntregasPorJornada);
// Obtener entregas que he realizado (solo guardias)
router.get('/guardia/mis-entregas', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requireRole)(['guardia']), (req, res, next) => {
    // Filtrar por el guardia actual
    req.query.guardia = req.user.id;
    next();
}, validarObtenerEntregas, entrega_controller_1.obtenerEntregas);
exports.default = router;
//# sourceMappingURL=entrega.routes.js.map