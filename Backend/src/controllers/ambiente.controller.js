const Ambiente = require('../models/ambiente.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.crearAmbiente = catchAsync(async (req, res, next) => {
  const nuevoAmbiente = await Ambiente.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      ambiente: nuevoAmbiente,
    },
  });
});

exports.obtenerAmbientes = catchAsync(async (req, res, next) => {
  const ambientes = await Ambiente.find({ activo: true });

  res.status(200).json({
    status: 'success',
    results: ambientes.length,
    data: {
      ambientes,
    },
  });
});

exports.obtenerAmbiente = catchAsync(async (req, res, next) => {
  const ambiente = await Ambiente.findById(req.params.id);

  if (!ambiente) {
    return next(new AppError('No se encontró ningún ambiente con ese ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      ambiente,
    },
  });
});

exports.actualizarAmbiente = catchAsync(async (req, res, next) => {
  const ambiente = await Ambiente.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!ambiente) {
    return next(new AppError('No se encontró ningún ambiente con ese ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      ambiente,
    },
  });
});

exports.eliminarAmbiente = catchAsync(async (req, res, next) => {
  const ambiente = await Ambiente.findByIdAndUpdate(
    req.params.id,
    { activo: false },
    { new: true }
  );

  if (!ambiente) {
    return next(new AppError('No se encontró ningún ambiente con ese ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.verificarDisponibilidad = catchAsync(async (req, res, next) => {
  const { fechaInicio, fechaFin } = req.query;
  
  if (!fechaInicio || !fechaFin) {
    return next(
      new AppError('Por favor proporcione fecha de inicio y fecha de fin', 400)
    );
  }

  const ambientesDisponibles = await Ambiente.find({
    $and: [
      { activo: true },
      {
        $or: [
          { 'horarioDisponible.dias': { $exists: false } },
          {
            'horarioDisponible.dias': {
              $in: [
                new Date(fechaInicio).toLocaleDateString('es-ES', { weekday: 'long' })
              ],
            },
          },
        ],
      },
    ],
  });

  res.status(200).json({
    status: 'success',
    results: ambientesDisponibles.length,
    data: {
      ambientes: ambientesDisponibles,
    },
  });
});
