const express = require('express');
const bitacoraController = require('../controllers/bitacora.controller');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// Autenticación comentada temporalmente para desarrollo
// router.use(authController.protect);
// router.use(authController.restrictTo('admin'));

/**
 * @swagger
 * tags:
 *   name: Bitácora
 *   description: Endpoints para consulta de bitácora del sistema
 */

// Rutas de bitácora (temporalmente sin autenticación)
router.get('/', bitacoraController.obtenerRegistros);
router.get('/:id', bitacoraController.obtenerRegistro);
router.post('/', bitacoraController.crearRegistro);
router.delete('/:id', bitacoraController.eliminarRegistro);

module.exports = router;
