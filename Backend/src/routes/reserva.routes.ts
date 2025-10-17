import { Router } from 'express';
import { ReservationController } from '../controllers/reservation.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const reservationController = new ReservationController();

// Disponibilidad diaria por jornada (pública)
router.get('/availability', reservationController.getAvailability.bind(reservationController));

// Rutas para reservas (protegidas según rol)
router.post('/', authenticateToken, reservationController.createReservation.bind(reservationController));
router.get('/', authenticateToken, requireRole(['admin', 'guardia']), reservationController.getReservations.bind(reservationController));
router.get('/my-reservations', authenticateToken, reservationController.getMyReservations.bind(reservationController));
router.patch('/:id/approve', authenticateToken, requireRole(['admin', 'guardia']), reservationController.approveReservation.bind(reservationController));
router.patch('/:id/reject', authenticateToken, requireRole(['admin', 'guardia']), reservationController.rejectReservation.bind(reservationController));
// Cancelar reserva: permitido para el dueño o roles privilegiados (validado en el controlador)
router.patch('/:id/cancel', authenticateToken, reservationController.cancelReservation.bind(reservationController));

// Eliminar reserva individual (permisos validados en el controlador)
router.delete('/:id', authenticateToken, reservationController.deleteReservation.bind(reservationController));

// Eliminar todas las reservas rechazadas (solo admin/guardia)
router.delete('/rejected', authenticateToken, requireRole(['admin','guardia']), reservationController.deleteRejectedReservations.bind(reservationController));

export default router;