const Bitacora = require('../models/bitacora.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.registrarAccion = async (usuarioId, accion, entidad, entidadId, detalles = {}, req = null) => {
  try {
    await Bitacora.create({
      accion,
      entidad,
      entidadId,
      usuario: usuarioId,
      detalles,
      ip: req ? req.ip : null,
      userAgent: req ? req.get('user-agent') : null,
    });
  } catch (error) {
    console.error('Error al registrar en bitácora:', error);
  }
};

exports.obtenerBitacora = catchAsync(async (req, res, next) => {
  // Solo admin puede ver la bitácora
  if (req.user.role !== 'admin') {
    return next(new AppError('No tiene permiso para ver la bitácora', 403));
  }

  const filter = {};
  
  // Filtrar por entidad si se proporciona
  if (req.query.entidad) {
    filter.entidad = req.query.entidad;
  }
  
  // Filtrar por ID de entidad si se proporciona
  if (req.query.entidadId) {
    filter.entidadId = req.query.entidadId;
  }
  
  // Filtrar por usuario si se proporciona
  if (req.query.usuarioId) {
    filter.usuario = req.query.usuarioId;
  }
  
  // Filtrar por fechas si se proporcionan
  if (req.query.fechaInicio && req.query.fechaFin) {
    filter.createdAt = {
      $gte: new Date(req.query.fechaInicio),
      $lte: new Date(req.query.fechaFin),
    };
  }

  const bitacora = await Bitacora.find(filter)
    .populate('usuario', 'nombre email')
    .sort('-createdAt')
    .limit(100); // Limitar a 100 registros por defecto

  res.status(200).json({
    status: 'success',
    results: bitacora.length,
    data: {
      bitacora,
    },
  });
});

exports.obtenerBitacoraPorEntidad = catchAsync(async (req, res, next) => {
  // Solo admin puede ver la bitácora
  if (req.user.role !== 'admin') {
    return next(new AppError('No tiene permiso para ver la bitácora', 403));
  }

  const { entidad, entidadId } = req.params;
  
  const bitacora = await Bitacora.find({
    entidad,
    entidadId,
  })
    .populate('usuario', 'nombre email')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: bitacora.length,
    data: {
      bitacora,
    },
  });
});

// Middleware para registrar acciones en la bitácora
exports.registrarAccionMiddleware = (accion, entidad, getEntidadId = null) => {
  return catchAsync(async (req, res, next) => {
    // Guardar referencia a la función original
    const originalJson = res.json;
    
    // Sobrescribir el método json
    res.json = function (data) {
      // Registrar la acción después de que se complete la solicitud
      process.nextTick(async () => {
        try {
          let entidadId = null;
          
          // Obtener el ID de la entidad según la función proporcionada
          if (typeof getEntidadId === 'function') {
            entidadId = getEntidadId(req, data);
          } else if (req.params.id) {
            entidadId = req.params.id;
          } else if (data.data && data.data._id) {
            entidadId = data.data._id;
          } else if (data._id) {
            entidadId = data._id;
          }
          
          if (entidadId) {
            await exports.registrarAccion(
              req.user ? req.user.id : null,
              accion,
              entidad,
              entidadId,
              {
                metodo: req.method,
                ruta: req.originalUrl,
                body: req.body,
                params: req.params,
                query: req.query,
              },
              req
            );
          }
        } catch (error) {
          console.error('Error al registrar acción en bitácora:', error);
        }
      });
      
      // Llamar a la función original
      return originalJson.call(this, data);
    };
    
    next();
  });
};

// Obtener todos los registros de bitácora
exports.obtenerRegistros = catchAsync(async (req, res, next) => {
  // Solo admin puede ver la bitácora
  if (req.user && req.user.role !== 'admin') {
    return next(new AppError('No tiene permiso para ver la bitácora', 403));
  }

  const bitacora = await Bitacora.find()
    .populate('usuario', 'nombre email')
    .sort('-createdAt')
    .limit(100); // Limitar a 100 registros por defecto

  res.status(200).json({
    status: 'success',
    results: bitacora.length,
    data: {
      bitacora
    }
  });
});

// Obtener un registro específico de bitácora
exports.obtenerRegistro = catchAsync(async (req, res, next) => {
  // Solo admin puede ver la bitácora
  if (req.user && req.user.role !== 'admin') {
    return next(new AppError('No tiene permiso para ver la bitácora', 403));
  }

  const registro = await Bitacora.findById(req.params.id)
    .populate('usuario', 'nombre email');

  if (!registro) {
    return next(new AppError('No se encontró el registro de bitácora', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      registro
    }
  });
});

// Crear un nuevo registro de bitácora manualmente
exports.crearRegistro = catchAsync(async (req, res, next) => {
  // Solo admin puede crear registros manualmente
  if (req.user && req.user.role !== 'admin') {
    return next(new AppError('No tiene permiso para crear registros de bitácora', 403));
  }

  const registro = await Bitacora.create({
    ...req.body,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  await registro.populate('usuario', 'nombre email');

  res.status(201).json({
    status: 'success',
    data: {
      registro
    }
  });
});

// Eliminar un registro de bitácora
exports.eliminarRegistro = catchAsync(async (req, res, next) => {
  // Solo admin puede eliminar registros
  if (req.user && req.user.role !== 'admin') {
    return next(new AppError('No tiene permiso para eliminar registros de bitácora', 403));
  }

  const registro = await Bitacora.findByIdAndDelete(req.params.id);

  if (!registro) {
    return next(new AppError('No se encontró el registro de bitácora', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
