import { Router } from 'express';
import { ReservationController } from '../controllers/reservation.controller';

const router = Router();
const reservationController = new ReservationController();

// Rutas para reservas
router.post('/', reservationController.createReservation.bind(reservationController));
router.get('/', reservationController.getReservations.bind(reservationController));
router.get('/my-reservations', reservationController.getMyReservations.bind(reservationController));
router.patch('/:id/approve', reservationController.approveReservation.bind(reservationController));
router.patch('/:id/reject', reservationController.rejectReservation.bind(reservationController));

export default router;