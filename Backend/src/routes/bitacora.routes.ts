import { Router } from 'express';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';
import bitacoraController from '../controllers/bitacora.controller';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Obtener todos los registros de bitácora
router.get('/', bitacoraController.obtenerBitacora);

// Obtener estadísticas de bitácora (solo admin) - debe ir antes de /:id
router.get('/estadisticas', requireRole(['admin']), bitacoraController.obtenerEstadisticas);

// Obtener bitácora por entidad - debe ir antes de /:id
router.get('/entidad/:entidad', bitacoraController.obtenerBitacoraPorEntidad);

// Crear nuevo registro de bitácora
router.post('/', bitacoraController.crearBitacora);

// Obtener registro de bitácora por ID - debe ir al final
router.get('/:id', bitacoraController.obtenerBitacoraPorId);

// Limpiar registros antiguos (solo admin)
router.delete('/limpiar', requireRole(['admin']), bitacoraController.limpiarRegistrosAntiguos);

export default router;