import { Router } from 'express';
import solicitudController from '../controllers/solicitud.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Rutas públicas
router.post('/', solicitudController.crearSolicitud);

// Rutas protegidas (admin y guardia para gestionar solicitudes)
router.get('/', authenticateToken, requireRole(['admin', 'guardia']), solicitudController.obtenerSolicitudes);
router.get('/estadisticas', authenticateToken, requireRole(['admin', 'guardia']), solicitudController.obtenerEstadisticas);
router.get('/:id', authenticateToken, requireRole(['admin', 'guardia']), solicitudController.obtenerSolicitudPorId);
router.patch('/:id/approve', authenticateToken, requireRole(['admin']), solicitudController.aprobarSolicitud);
router.patch('/:id/reject', authenticateToken, requireRole(['admin']), solicitudController.rechazarSolicitud);

export default router;