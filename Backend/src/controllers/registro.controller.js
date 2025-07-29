const Registro = require('../models/registro.model');
const Reserva = require('../models/reserva.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.registrarEntrada = catchAsync(async (req, res, next) => {
  const { reservaId } = req.params;
  
  // Verificar que la reserva existe y está aprobada
  const reserva = await Reserva.findOne({
    _id: reservaId,
    estado: 'aprobada',
    usuario: req.user.id,
  });

  if (!reserva) {
    return next(new AppError('No se encontró una reserva aprobada con ese ID', 404));
  }

  // Verificar que no haya un registro activo para esta reserva
  const registroActivo = await Registro.findOne({
    reserva: reservaId,
    estado: 'activo',
  });

  if (registroActivo) {
    return next(new AppError('Ya existe un registro activo para esta reserva', 400));
  }

  // Crear nuevo registro de entrada
  const nuevoRegistro = await Registro.create({
    usuario: req.user.id,
    ambiente: reserva.ambiente,
    reserva: reservaId,
    fechaHoraEntrada: Date.now(),
    estado: 'activo',
    creadoPor: req.user.id,
  });

  res.status(201).json({
    status: 'success',
    data: {
      registro: nuevoRegistro,
    },
  });
});

exports.registrarSalida = catchAsync(async (req, res, next) => {
  const { registroId } = req.params;
  
  // Buscar registro activo
  const registro = await Registro.findOne({
    _id: registroId,
    estado: 'activo',
  });

  if (!registro) {
    return next(new AppError('No se encontró un registro activo con ese ID', 404));
  }

  // Verificar que el usuario sea el propietario o un administrador
  if (registro.usuario.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('No tiene permiso para registrar la salida de este ambiente', 403));
  }

  // Actualizar registro con fecha de salida
  registro.fechaHoraSalida = Date.now();
  registro.estado = 'finalizado';
  await registro.save();

  res.status(200).json({
    status: 'success',
    data: {
      registro,
    },
  });
});

// Obtener todos los registros (solo admin e instructores)
exports.obtenerTodosLosRegistros = catchAsync(async (req, res, next) => {
  let filter = {};
  
  // Filtrar por fechas si se proporcionan
  if (req.query.fechaInicio && req.query.fechaFin) {
    filter.fechaHoraEntrada = {
      $gte: new Date(req.query.fechaInicio),
      $lte: new Date(req.query.fechaFin),
    };
  }

  const registros = await Registro.find(filter)
    .populate('usuario', 'nombre email')
    .populate('ambiente', 'nombre tipo')
    .populate('reserva', 'motivo')
    .sort('-fechaHoraEntrada');

  res.status(200).json({
    status: 'success',
    results: registros.length,
    data: {
      registros,
    },
  });
});

// Obtener los registros del usuario actual
exports.obtenerRegistros = catchAsync(async (req, res, next) => {
  // Como la autenticación está deshabilitada temporalmente, no filtramos por usuario
  const filter = {};
  
  // Filtrar por fechas si se proporcionan
  if (req.query.fechaInicio && req.query.fechaFin) {
    filter.fechaHoraEntrada = {
      $gte: new Date(req.query.fechaInicio),
      $lte: new Date(req.query.fechaFin),
    };
  }

  const registros = await Registro.find(filter)
    .populate('usuario', 'nombre email')
    .populate('ambiente', 'nombre tipo')
    .populate('reserva', 'motivo')
    .sort('-fechaHoraEntrada');

  res.status(200).json({
    status: 'success',
    results: registros.length,
    data: {
      registros,
    },
  });
});

exports.obtenerRegistrosPorAmbiente = catchAsync(async (req, res, next) => {
  const { ambienteId } = req.params;
  
  let filter = { ambiente: ambienteId };
  
  // Si no es admin, solo puede ver sus propios registros
  if (req.user.role !== 'admin') {
    filter.usuario = req.user.id;
  }

  // Filtrar por fechas si se proporcionan
  if (req.query.fechaInicio && req.query.fechaFin) {
    filter.fechaHoraEntrada = {
      $gte: new Date(req.query.fechaInicio),
      $lte: new Date(req.query.fechaFin),
    };
  }

  const registros = await Registro.find(filter)
    .populate('usuario', 'nombre email')
    .populate('reserva', 'motivo')
    .sort('-fechaHoraEntrada');

  res.status(200).json({
    status: 'success',
    results: registros.length,
    data: {
      registros,
    },
  });
});

exports.obtenerRegistro = catchAsync(async (req, res, next) => {
  let query = Registro.findById(req.params.id)
    .populate('usuario', 'nombre email')
    .populate('ambiente', 'nombre tipo')
    .populate('reserva', 'motivo');

  // Si no es admin, solo puede ver sus propios registros
  if (req.user.role !== 'admin') {
    query = query.where('usuario').equals(req.user.id);
  }

  const registro = await query;

  if (!registro) {
    return next(new AppError('No se encontró ningún registro con ese ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      registro,
    },
  });
});

exports.actualizarRegistro = catchAsync(async (req, res, next) => {
  // Solo admin puede actualizar registros
  if (req.user.role !== 'admin') {
    return next(new AppError('No tiene permiso para actualizar registros', 403));
  }

  const registro = await Registro.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  )
    .populate('usuario', 'nombre email')
    .populate('ambiente', 'nombre tipo')
    .populate('reserva', 'motivo');

  if (!registro) {
    return next(new AppError('No se encontró ningún registro con ese ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      registro,
    },
  });
});

// Crear un nuevo registro manualmente
exports.crearRegistro = catchAsync(async (req, res, next) => {
  // Crear el registro con los datos proporcionados
  const nuevoRegistro = await Registro.create({
    ...req.body,
    fechaHoraEntrada: req.body.fechaHoraEntrada || Date.now(),
    estado: req.body.estado || 'activo'
  });

  // Poblar los campos de referencia
  await nuevoRegistro.populate([
    { path: 'usuario', select: 'nombre email' },
    { path: 'ambiente', select: 'nombre tipo' },
    { path: 'reserva', select: 'motivo' }
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      registro: nuevoRegistro
    }
  });
});

// Eliminar un registro
exports.eliminarRegistro = catchAsync(async (req, res, next) => {
  // Solo admin puede eliminar registros
  if (req.user.role !== 'admin') {
    return next(new AppError('No tiene permiso para eliminar registros', 403));
  }

  const registro = await Registro.findByIdAndDelete(req.params.id);

  if (!registro) {
    return next(new AppError('No se encontró ningún registro con ese ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
