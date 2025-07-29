const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

// Ruta de registro
router.post('/register', authController.register);

// Ruta de login
router.post('/login', authController.login);

// Obtener perfil del usuario actual
router.get('/me', authController.protect, authController.getMe);

module.exports = router;
