"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reservation_controller_1 = require("../controllers/reservation.controller");
const router = (0, express_1.Router)();
const reservationController = new reservation_controller_1.ReservationController();
// Rutas para reservas
router.post('/', reservationController.createReservation.bind(reservationController));
router.get('/', reservationController.getReservations.bind(reservationController));
router.get('/my-reservations', reservationController.getMyReservations.bind(reservationController));
router.patch('/:id/approve', reservationController.approveReservation.bind(reservationController));
exports.default = router;
//# sourceMappingURL=reserva.routes.js.map