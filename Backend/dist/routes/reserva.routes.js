"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reservation_controller_1 = require("../controllers/reservation.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const reservationController = new reservation_controller_1.ReservationController();
// Aplicar middleware de autenticación a todas las rutas
router.use(auth_middleware_1.authenticateToken);
// Rutas para reservas
router.post('/', reservationController.createReservation.bind(reservationController));
router.get('/', (0, auth_middleware_1.requireRole)(['admin', 'guardia', 'instructor']), reservationController.getReservations.bind(reservationController));
router.get('/my-reservations', reservationController.getMyReservations.bind(reservationController));
router.patch('/:id/approve', (0, auth_middleware_1.requireRole)(['admin', 'guardia', 'instructor']), reservationController.approveReservation.bind(reservationController));
router.patch('/:id/reject', (0, auth_middleware_1.requireRole)(['admin', 'guardia', 'instructor']), reservationController.rejectReservation.bind(reservationController));
router.patch('/:id/cancel', reservationController.cancelReservation.bind(reservationController));
// Eliminar reservas rechazadas
// Importante: definir rutas específicas ANTES de las rutas con parámetros para evitar colisiones
router.delete('/rejected', (0, auth_middleware_1.requireRole)(['admin', 'guardia']), reservationController.deleteRejectedReservations.bind(reservationController));
router.delete('/:id', (0, auth_middleware_1.requireRole)(['admin', 'guardia']), reservationController.deleteReservation.bind(reservationController));
exports.default = router;
//# sourceMappingURL=reserva.routes.js.map