import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const reportsController = new ReportsController();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Rutas para estadísticas generales (admin, guardia e instructor)
router.get('/estadisticas', 
  requireRole(['admin', 'guardia', 'instructor']), 
  reportsController.getGeneralStats
);

// Rutas para reportes de reservas
router.get('/reservas', 
  requireRole(['admin', 'guardia', 'instructor']), 
  reportsController.generateReservationsReport
);

// Rutas para reportes de entregas
router.get('/entregas', 
  requireRole(['admin', 'guardia', 'instructor']), 
  reportsController.generateDeliveriesReport
);

// Rutas para reportes de uso de ambientes
router.get('/uso-ambientes', 
  requireRole(['admin', 'guardia', 'instructor']), 
  reportsController.generateEnvironmentUsageReport
);

// Rutas específicas para instructores
router.get('/instructor/mis-reservas', 
  requireRole(['instructor', 'admin']), 
  reportsController.getMyReservationsReport
);

router.get('/instructor/mis-entregas', 
  requireRole(['instructor', 'admin']), 
  reportsController.getMyDeliveriesReport
);

// Rutas específicas para guardias
router.get('/guardia/mi-turno', 
  requireRole(['guardia', 'admin']), 
  reportsController.getMyShiftStats
);

export default router;