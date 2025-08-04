const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/user.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Middleware de autenticación
exports.authenticate = catchAsync(async (req, res, next) => {
  let token;
  
  // Extraer token del header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return next(new AppError('Token de acceso requerido', 401));
  }
  
  // Verificar token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  
  // Verificar si el usuario existe
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('El usuario ya no existe', 401));
  }
  
  // Verificar si cambió la contraseña
  if (currentUser.cambioPassword(decoded.iat)) {
    return next(new AppError('Contraseña cambiada recientemente. Inicia sesión nuevamente', 401));
  }
  
  req.user = currentUser;
  next();
});

// Middleware para verificar roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('No tienes permisos para esta acción', 403));
    }
    next();
  };
};