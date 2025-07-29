class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Captura el stack trace sin incluir el constructor en el stack
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
