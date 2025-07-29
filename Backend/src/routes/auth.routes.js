const express = require('express');
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints para autenticación y gestión de usuarios
 */

// Rutas públicas de autenticación
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Esta ruta requiere autenticación para funcionar
router.get('/me', authController.protect, authController.getMe);

module.exports = router;
