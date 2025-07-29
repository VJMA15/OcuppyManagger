const AppError = require('../utils/appError');

// Función para manejar errores de validación de Mongoose
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Datos de entrada no válidos. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Función para manejar errores de duplicados en la base de datos
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Valor duplicado: ${value}. Por favor, utilice otro valor.`;
  return new AppError(message, 400);
};

// Función para manejar errores de validación de JWT
const handleJWTError = () =>
  new AppError('Token no válido. Por favor, inicie sesión de nuevo.', 401);

// Función para manejar tokens JWT expirados
const handleJWTExpiredError = () =>
  new AppError('Su sesión ha expirado. Por favor, inicie sesión de nuevo.', 401);

// Función para enviar errores detallados en desarrollo
const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // B) RENDERED WEBSITE
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: '¡Algo salió mal!',
    msg: err.message,
  });
};

// Función para enviar errores en producción
const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operacional, error de confianza: enviar mensaje al cliente
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) Error de programación o desconocido: no enviar detalles al cliente
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Enviar mensaje genérico
    return res.status(500).json({
      status: 'error',
      message: '¡Algo salió muy mal!',
    });
  }

  // B) RENDERED WEBSITE
  // A) Operacional, error de confianza: enviar mensaje al cliente
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: '¡Algo salió mal!',
      msg: err.message,
    });
  }
  // B) Error de programación o desconocido: no enviar detalles al cliente
  // 1) Log error
  console.error('ERROR 💥', err);
  // 2) Enviar mensaje genérico
  return res.status(err.statusCode).render('error', {
    title: '¡Algo salió mal!',
    msg: 'Por favor, inténtelo de nuevo más tarde.',
  });
};

// Manejador de errores global
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;

    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
