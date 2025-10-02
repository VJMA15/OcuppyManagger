import { Router } from 'express';
import { ReservationController } from '../controllers/reservation.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const reservationController = new ReservationController();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Rutas para reservas
router.post('/', reservationController.createReservation.bind(reservationController));
router.get('/', requireRole(['admin', 'guardia', 'instructor']), reservationController.getReservations.bind(reservationController));
router.get('/my-reservations', reservationController.getMyReservations.bind(reservationController));
router.patch('/:id/approve', requireRole(['admin', 'guardia', 'instructor']), reservationController.approveReservation.bind(reservationController));
router.patch('/:id/reject', requireRole(['admin', 'guardia', 'instructor']), reservationController.rejectReservation.bind(reservationController));
router.patch('/:id/cancel', reservationController.cancelReservation.bind(reservationController));

// Eliminar reservas rechazadas
// Importante: definir rutas específicas ANTES de las rutas con parámetros para evitar colisiones
router.delete('/rejected', requireRole(['admin', 'guardia']), reservationController.deleteRejectedReservations.bind(reservationController));
router.delete('/:id', requireRole(['admin', 'guardia']), reservationController.deleteReservation.bind(reservationController));

export default router;