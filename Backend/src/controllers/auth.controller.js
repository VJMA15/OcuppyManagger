const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/user.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  user.password = undefined;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    nombre: req.body.nombre,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Verificar si el email y la contraseña existen
  if (!email || !password) {
    return next(new AppError('Por favor ingrese email y contraseña', 400));
  }

  // 2) Verificar si el usuario existe y la contraseña es correcta
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.compararPassword(password, user.password))) {
    return next(new AppError('Email o contraseña incorrectos', 401));
  }

  // 3) Si todo está bien, enviar el token al cliente
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Obtener el token y verificar si existe
  let token;
  console.log('Headers recibidos:', req.headers);
  console.log('Cookies recibidas:', req.cookies);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  console.log('Token extraído:', token);

  if (!token) {
    return next(
      new AppError('No está autorizado para acceder a esta ruta', 401)
    );
  }

  // 2) Verificar el token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log('Token decodificado:', decoded);

  // 3) Verificar si el usuario aún existe
  const currentUser = await User.findById(decoded.id);
  console.log('Usuario encontrado:', currentUser);

  if (!currentUser) {
    return next(
      new AppError('El usuario perteneciente a este token ya no existe', 401)
    );
  }

  // 4) Verificar si el usuario cambió la contraseña después de que se emitió el token
  if (currentUser.cambioPassword(decoded.iat)) {
    return next(
      new AppError('El usuario cambió la contraseña recientemente. Por favor inicie sesión de nuevo.', 401)
    );
  }

  // CONCEDE ACCESO A LA RUTA PROTEGIDA
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'instructor']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('No tiene permiso para realizar esta acción', 403)
      );
    }
    next();
  };
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Obtener el usuario de la colección
  const user = await User.findById(req.user.id).select('+password');

  // 2) Verificar si la contraseña actual es correcta
  if (!(await user.compararPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Tu contraseña actual es incorrecta', 401));
  }

  // 3) Si es correcta, actualizar la contraseña
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  await user.save();
  // User.findByIdAndUpdate NO funcionará porque no ejecutará los middlewares de validación y el hook de pre-save

  // 4) Iniciar sesión al usuario, enviar JWT
  createSendToken(user, 200, res);
});

// Obtener el perfil del usuario actual
exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});
