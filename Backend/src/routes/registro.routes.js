const express = require('express');
const registroController = require('../controllers/registro.controller');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// Autenticación comentada temporalmente para desarrollo
// router.use(authController.protect);

/**
 * @swagger
 * tags:
 *   name: Registros
 *   description: Endpoints para gestión de registros de entrada/salida
 */

// Rutas de registros (temporalmente sin autenticación)
router.get('/', registroController.obtenerRegistros);
router.get('/:id', registroController.obtenerRegistro);
router.post('/', registroController.crearRegistro);
router.patch('/:id', registroController.actualizarRegistro);
router.delete('/:id', registroController.eliminarRegistro);

module.exports = router;
