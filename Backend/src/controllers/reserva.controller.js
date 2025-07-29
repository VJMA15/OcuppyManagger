const Reserva = require('../models/reserva.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email'); // Importar la función para enviar correos

// Función para verificar disponibilidad de ambiente
const verificarDisponibilidad = async (ambienteId, fechaInicio, fechaFin, reservaId = null) => {
  const query = {
    ambiente: ambienteId,
    $or: [
      { fechaInicio: { $lt: fechaFin, $gte: fechaInicio } },
      { fechaFin: { $gt: fechaInicio, $lte: fechaFin } },
      {
        $and: [
          { fechaInicio: { $lte: fechaInicio } },
          { fechaFin: { $gte: fechaFin } },
        ],
      },
    ],
    estado: { $in: ['pendiente', 'aprobada'] },
  };

  if (reservaId) {
    query._id = { $ne: reservaId };
  }

  const reservasExistentes = await Reserva.find(query);
  return reservasExistentes.length === 0;
};

exports.crearReserva = catchAsync(async (req, res, next) => {
  const { ambiente, fechaInicio, fechaFin } = req.body;
  
  // Verificar disponibilidad
  const disponible = await verificarDisponibilidad(ambiente, fechaInicio, fechaFin);
  
  if (!disponible) {
    return next(new AppError('El ambiente no está disponible en el rango de fechas seleccionado', 400));
  }

  const nuevaReserva = await Reserva.create({
    ...req.body,
    usuario: req.user ? req.user._id : undefined, // si tienes autenticación
    estado: req.user.role === 'admin' ? 'aprobada' : 'pendiente',
    aprobadoPor: req.user.role === 'admin' ? req.user.id : null,
    fechaAprobacion: req.user.role === 'admin' ? Date.now() : null,
  });

  // Enviar correo al administrador
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: 'Nueva reserva realizada',
    text: `Se ha realizado una nueva reserva por el usuario ${req.user ? req.user.email : 'desconocido'}.
Ambiente: ${nuevaReserva.ambiente}
Fecha inicio: ${nuevaReserva.fechaInicio}
Fecha fin: ${nuevaReserva.fechaFin}
Motivo: ${nuevaReserva.motivo}
Por favor, revisa y aprueba o rechaza la reserva en el sistema.`,
  });

  res.status(201).json({
    status: 'success',
    data: {
      reserva: nuevaReserva,
    },
  });
});

// Obtener todas las reservas (solo admin e instructores)
exports.obtenerTodasLasReservas = catchAsync(async (req, res, next) => {
  const reservas = await Reserva.find()
    .populate('usuario', 'nombre email')
    .populate('ambiente', 'nombre capacidad tipo');

  res.status(200).json({
    status: 'success',
    results: reservas.length,
    data: {
      reservas,
    },
  });
});

// Obtener las reservas del usuario actual
exports.obtenerReservas = catchAsync(async (req, res, next) => {
  const reservas = await Reserva.find({ usuario: req.user.id })
    .populate('usuario', 'nombre email')
    .populate('ambiente', 'nombre capacidad tipo');

  res.status(200).json({
    status: 'success',
    results: reservas.length,
    data: {
      reservas,
    },
  });
});

exports.obtenerReserva = catchAsync(async (req, res, next) => {
  let query = Reserva.findById(req.params.id)
    .populate('usuario', 'nombre email')
    .populate('ambiente', 'nombre capacidad tipo');

  // Si no es admin, solo puede ver sus propias reservas
  if (req.user.role !== 'admin') {
    query = query.where('usuario').equals(req.user.id);
  }

  const reserva = await query;

  if (!reserva) {
    return next(new AppError('No se encontró ninguna reserva con ese ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      reserva,
    },
  });
});

// Actualizar una reserva (solo admin)
exports.actualizarReserva = catchAsync(async (req, res, next) => {
  // Verificar si la reserva existe y el usuario tiene permiso
  let reserva = await Reserva.findById(req.params.id);
  
  if (!reserva) {
    return next(new AppError('No se encontró ninguna reserva con ese ID', 404));
  }

  // Verificar si el usuario es el propietario o un admin
  if (reserva.usuario.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('No tienes permiso para actualizar esta reserva', 403));
  }

  // Si se está actualizando el estado a 'aprobada' o 'rechazada', registrar quién lo hizo
  if (req.body.estado && ['aprobada', 'rechazada'].includes(req.body.estado) && req.user.role === 'admin') {
    req.body.aprobadoPor = req.user.id;
    req.body.fechaAprobacion = Date.now();
  }

  // Actualizar la reserva
  reserva = await Reserva.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      reserva,
    },
  });
});

// Cancelar una reserva
exports.cancelarReserva = catchAsync(async (req, res, next) => {
  const reserva = await Reserva.findById(req.params.id);
  
  if (!reserva) {
    return next(new AppError('No se encontró ninguna reserva con ese ID', 404));
  }

  // Verificar si el usuario es el propietario o un admin
  if (reserva.usuario.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('No tienes permiso para cancelar esta reserva', 403));
  }

  // Solo se pueden cancelar reservas pendientes o aprobadas
  if (!['pendiente', 'aprobada'].includes(reserva.estado)) {
    return next(new AppError('No se puede cancelar una reserva que ya ha sido completada o cancelada', 400));
  }

  // Actualizar el estado a 'cancelada'
  reserva.estado = 'cancelada';
  await reserva.save();

  res.status(200).json({
    status: 'success',
    data: {
      reserva,
    },
  });
});

// Eliminar una reserva (solo admin)
exports.eliminarReserva = catchAsync(async (req, res, next) => {
  const reserva = await Reserva.findByIdAndDelete(req.params.id);
  
  if (!reserva) {
    return next(new AppError('No se encontró ninguna reserva con ese ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// El método cancelarReserva ya está definido anteriormente

exports.obtenerReservasPorAmbiente = catchAsync(async (req, res, next) => {
  const { ambienteId } = req.params;
  const { fechaInicio, fechaFin } = req.query;

  if (!fechaInicio || !fechaFin) {
    return next(new AppError('Por favor proporcione fecha de inicio y fecha de fin', 400));
  }

  const reservas = await Reserva.find({
    ambiente: ambienteId,
    $or: [
      { fechaInicio: { $lt: new Date(fechaFin), $gte: new Date(fechaInicio) } },
      { fechaFin: { $gt: new Date(fechaInicio), $lte: new Date(fechaFin) } },
      {
        $and: [
          { fechaInicio: { $lte: new Date(fechaInicio) } },
          { fechaFin: { $gte: new Date(fechaFin) } },
        ],
      },
    ],
    estado: { $in: ['pendiente', 'aprobada'] },
  });

  res.status(200).json({
    status: 'success',
    results: reservas.length,
    data: {
      reservas,
    },
  });
});
