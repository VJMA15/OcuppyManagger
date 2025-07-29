const express = require('express');
const ambienteController = require('../controllers/ambiente.controller');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// Rutas públicas
router.get('/', ambienteController.obtenerAmbientes);
router.get('/:id', ambienteController.obtenerAmbiente);
router.get('/:id/disponibilidad', ambienteController.verificarDisponibilidad);

// Comentado temporalmente para desarrollo
// router.use(authController.protect);

// Rutas que eran protegidas (temporalmente públicas)
router.post('/', ambienteController.crearAmbiente);

router
  .route('/:id')
  .patch(ambienteController.actualizarAmbiente)
  .delete(ambienteController.eliminarAmbiente);

module.exports = router;
