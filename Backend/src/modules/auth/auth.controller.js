const jwt = require('jsonwebtoken');
const User = require('../users/user.model');
const { promisify } = require('util');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');

// Crear y firmar token JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Crear y enviar token
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  // Eliminar la contraseña del output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // 1) Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'El correo electrónico ya está en uso',
      });
    }

    // 2) Crear nuevo usuario
    const newUser = await User.create({
      name,
      email,
      password,
      role: role || 'instructor', // Rol por defecto
    });

    // 3) Enviar token
    createSendToken(newUser, 201, res);
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Verificar si el correo y la contraseña existen
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Por favor proporcione correo electrónico y contraseña',
      });
    }

    // 2) Verificar si el usuario existe y la contraseña es correcta
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password, user.password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Correo electrónico o contraseña incorrectos',
      });
    }

    // 3) Si todo está bien, enviar token al cliente
    createSendToken(user, 200, res);
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Middleware para proteger rutas
exports.protect = async (req, res, next) => {
  try {
    let token;
    // 1) Obtener el token y verificar si está allí
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No estás autenticado. Por favor, inicia sesión para obtener acceso.',
      });
    }

    // 2) Verificar token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Verificar si el usuario aún existe
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'El usuario al que pertenece este token ya no existe.',
      });
    }

    // 4) Otorgar acceso a la ruta protegida
    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Token inválido o expirado. Por favor, inicia sesión nuevamente.',
    });
  }
};

// Obtener perfil del usuario actual
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// Obtener perfil del usuario actual
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new AppError('No se encontró el usuario', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Restringir rutas a ciertos roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('No tienes permiso para realizar esta acción', 403)
      );
    }
    next();
  };
};
