const express = require('express');
const reservaController = require('../controllers/reserva.controller');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// Autenticación comentada temporalmente para desarrollo
// router.use(authController.protect);

/**
 * @swagger
 * tags:
 *   name: Reservas
 *   description: Endpoints para gestión de reservas
 */

// Rutas de reservas (temporalmente sin autenticación)
router.get('/mis-reservas', reservaController.obtenerReservas);
router.get('/:id', reservaController.obtenerReserva);
router.post('/', reservaController.crearReserva);
router.patch('/:id/cancelar', reservaController.cancelarReserva);
router.get('/', reservaController.obtenerTodasLasReservas);

router
  .route('/:id')
  .patch(reservaController.actualizarReserva)
  .delete(reservaController.eliminarReserva);

module.exports = router;
