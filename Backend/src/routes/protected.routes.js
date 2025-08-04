const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const reservaController = require('../controllers/reserva.controller');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authenticate);

// Rutas que requieren autenticación
router.get('/reservas', reservaController.getReservas);
router.post('/reservas', reservaController.createReserva);

// Rutas que requieren rol específico
router.delete('/reservas/:id', authorize('admin'), reservaController.deleteReserva);

module.exports = router;