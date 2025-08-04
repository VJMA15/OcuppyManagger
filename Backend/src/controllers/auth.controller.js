const User = require('../models/user.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Verificar usuario (autenticación simplificada)
exports.verifyUser = async (req, res, next) => {
  const { cc, password } = req.body;

  // 1) Verificar si el C.C y la contraseña existen
  if (!cc || !password) {
    return next(new AppError('Por favor ingrese C.C y contraseña', 400));
  }

  // 2) Buscar usuario en la base de datos
  const user = await User.findOne({ cc }).select('+password');

  if (!user) {
    return next(new AppError('Usuario no encontrado', 404));
  }

  // 3) Verificar contraseña
  const isPasswordCorrect = await user.compararPassword(password);
  
  if (!isPasswordCorrect) {
    return next(new AppError('Contraseña incorrecta', 401));
  }

  // 4) Usuario verificado exitosamente
  user.password = undefined; // No enviar la contraseña
  
  res.status(200).json({
    status: 'success',
    message: 'Usuario verificado correctamente',
    data: {
      user: {
        id: user._id,
        nombre: user.nombre,
        cc: user.cc,
        email: user.email,
        role: user.role
      }
    }
  });
};

// Obtener información del usuario por CC
exports.getUserByCC = catchAsync(async (req, res, next) => {
  const { cc } = req.params;
  
  const user = await User.findOne({ cc });
  
  if (!user) {
    return next(new AppError('Usuario no encontrado', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});