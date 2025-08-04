const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// Comentar todas las rutas JWT
/*
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updateMyPassword', authController.protect, authController.updatePassword);
*/

// Mantener solo la ruta de verificación simple
router.post('/verify', authController.verifyUser);

// router.post('/signup', authController.signup);
// router.post('/login', authController.login);
// router.get('/logout', authController.logout);
// router.get('/user/:cc', authController.protect, authController.getUser);

module.exports = router;
