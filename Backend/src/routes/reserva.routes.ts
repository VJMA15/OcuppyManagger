import { Router } from 'express';
import { ReservationController } from '../controllers/reservation.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const reservationController = new ReservationController();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Rutas para reservas
router.post('/', reservationController.createReservation.bind(reservationController));
router.get('/', requireRole(['admin', 'guardia']), reservationController.getReservations.bind(reservationController));
router.get('/my-reservations', reservationController.getMyReservations.bind(reservationController));
// Disponibilidad diaria por jornada
router.get('/availability', reservationController.getAvailability.bind(reservationController));
router.patch('/:id/approve', requireRole(['admin', 'guardia']), reservationController.approveReservation.bind(reservationController));
router.patch('/:id/reject', requireRole(['admin', 'guardia']), reservationController.rejectReservation.bind(reservationController));
// Cancelar reserva: permitido para el dueño o roles privilegiados (validado en el controlador)
router.patch('/:id/cancel', reservationController.cancelReservation.bind(reservationController));

// Eliminar reserva individual (permisos validados en el controlador)
router.delete('/:id', reservationController.deleteReservation.bind(reservationController));

// Eliminar todas las reservas rechazadas (solo admin/guardia)
router.delete('/rejected', requireRole(['admin','guardia']), reservationController.deleteRejectedReservations.bind(reservationController));

export default router;