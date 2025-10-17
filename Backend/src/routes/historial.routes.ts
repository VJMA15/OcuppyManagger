import { Router } from 'express';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';
import { ReservationHistoryController } from '../controllers/reservationHistory.controller';

const router = Router();
const controller = new ReservationHistoryController();

// Todas las rutas requieren autenticación y rol admin/guardia
router.use(authenticateToken);
router.use(requireRole(['admin', 'guardia']));

router.get('/', controller.getHistory.bind(controller));
router.get('/:id', controller.getHistoryById.bind(controller));
router.delete('/:id', controller.deleteById.bind(controller));
router.delete('/', controller.clearHistory.bind(controller));

export default router;