const User = require('../models/user.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const bcrypt = require('bcryptjs');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Crear un nuevo usuario (solo admin)
exports.createUser = catchAsync(async (req, res, next) => {
  // 1) Extraer los datos del cuerpo de la solicitud
  const { nombre, email, password, role } = req.body;

  // 2) Verificar si el usuario ya existe
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError('Ya existe un usuario con este correo electrónico', 400));
  }

  // 3) Crear el nuevo usuario
  const newUser = await User.create({
    nombre,
    email,
    password,
    role: role || 'instructor', // Valor por defecto si no se especifica
  });

  // 4) No devolver la contraseña en la respuesta
  newUser.password = undefined;

  // 5) Enviar respuesta
  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  console.log('Obteniendo todos los usuarios...');
  try {
    const users = await User.find();
    console.log(`Se encontraron ${users.length} usuarios`);
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    next(error);
  }
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new AppError('No se encontró ningún usuario con ese ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// Actualizar usuario (solo admin)
exports.updateUser = catchAsync(async (req, res, next) => {
  // 1) Obtener el usuario
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new AppError('No se encontró ningún usuario con ese ID', 404));
  }

  // 2) Filtrar campos no permitidos
  const filteredBody = filterObj(req.body, 'nombre', 'email', 'role');
  
  // 3) Actualizar el usuario
  const updatedUser = await User.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  // 4) Enviar respuesta
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// Eliminar usuario (solo admin)
exports.deleteUser = catchAsync(async (req, res, next) => {
  // 1) Obtener el usuario
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new AppError('No se encontró ningún usuario con ese ID', 404));
  }

  // 2) Eliminar el usuario (borrado lógico)
  user.activo = false;
  await user.save({ validateBeforeSave: false });

  // 3) Enviar respuesta
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Crear error si el usuario intenta actualizar la contraseña
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'Esta ruta no es para actualizar contraseñas. Por favor use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtrar campos no permitidos
  const filteredBody = filterObj(
    req.body,
    'nombre',
    'email',
    'foto'
  );

  // 3) Actualizar el documento del usuario
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { activo: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError('No se encontró ningún usuario con ese ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No se encontró ningún usuario con ese ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { activo: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
