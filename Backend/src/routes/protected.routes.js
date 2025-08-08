const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const reservaController = require('../controllers/reserva.controller');

const router = express.Router();

// ANTES: Rutas protegidas con JWT
// router.use(authenticate);

// DESPUÉS: Sin autenticación por ahora
const express = require('express');
const reservaController = require('../controllers/reserva.controller');

const router = express.Router();

// Rutas sin autenticación (temporalmente)
router.get('/reservas', reservaController.obtenerReservas);
router.post('/reservas', reservaController.crearReserva);
router.delete('/reservas/:id', reservaController.eliminarReserva);

module.exports = router;