"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = exports.updateUserRole = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUser = exports.getAllUsers = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const appError_1 = __importDefault(require("../utils/appError"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Obtener todos los usuarios
exports.getAllUsers = (0, catchAsync_1.default)(async (req, res, next) => {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    // Construir filtros
    const filters = {};
    if (search) {
        filters.$or = [
            { nombre: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }
    if (role) {
        filters.role = role;
    }
    // Calcular paginación
    const skip = (Number(page) - 1) * Number(limit);
    // Obtener usuarios con paginación
    const users = await user_model_1.default.find(filters)
        .select('-password -passwordResetToken -passwordResetExpires')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));
    // Contar total de usuarios
    const total = await user_model_1.default.countDocuments(filters);
    res.status(200).json({
        success: true,
        data: {
            users,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                totalUsers: total,
                hasNextPage: skip + users.length < total,
                hasPrevPage: Number(page) > 1
            }
        }
    });
});
// Obtener un usuario específico
exports.getUser = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const user = await user_model_1.default.findById(id).select('-password -passwordResetToken -passwordResetExpires');
    if (!user) {
        return next(new appError_1.default('Usuario no encontrado', 404));
    }
    res.status(200).json({
        success: true,
        data: { user }
    });
});
// Crear nuevo usuario
exports.createUser = (0, catchAsync_1.default)(async (req, res, next) => {
    const { nombre, email, password, rol, telefono, documento } = req.body;
    // Verificar si el email ya existe
    const existingUser = await user_model_1.default.findOne({ email });
    if (existingUser) {
        return next(new appError_1.default('Ya existe un usuario con este email', 400));
    }
    // Hashear la contraseña
    const hashedPassword = await bcryptjs_1.default.hash(password, 12);
    // Crear el usuario
    const newUser = await user_model_1.default.create({
        nombre,
        email,
        password: hashedPassword,
        rol,
        telefono,
        documento,
        activo: true
    });
    // Remover la contraseña de la respuesta
    const userResponse = newUser.toObject();
    const { password: _, ...userWithoutPassword } = userResponse;
    res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: { user: userWithoutPassword }
    });
});
// Actualizar usuario
exports.updateUser = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const { nombre, email, rol, telefono, documento, activo } = req.body;
    // Verificar si el usuario existe
    const user = await user_model_1.default.findById(id);
    if (!user) {
        return next(new appError_1.default('Usuario no encontrado', 404));
    }
    // Si se está actualizando el email, verificar que no exista otro usuario con ese email
    if (email && email !== user.email) {
        const existingUser = await user_model_1.default.findOne({ email });
        if (existingUser) {
            return next(new appError_1.default('Ya existe un usuario con este email', 400));
        }
    }
    // Actualizar campos
    const updateData = {};
    if (nombre)
        updateData.nombre = nombre;
    if (email)
        updateData.email = email;
    if (rol)
        updateData.rol = rol;
    if (telefono !== undefined)
        updateData.telefono = telefono;
    if (documento !== undefined)
        updateData.documento = documento;
    if (activo !== undefined)
        updateData.activo = activo;
    const updatedUser = await user_model_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password -passwordResetToken -passwordResetExpires');
    res.status(200).json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: { user: updatedUser }
    });
});
// Eliminar usuario
exports.deleteUser = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    // Verificar si el usuario existe
    const user = await user_model_1.default.findById(id);
    if (!user) {
        return next(new appError_1.default('Usuario no encontrado', 404));
    }
    // No permitir eliminar el propio usuario
    if (req.user && req.user.id === id) {
        return next(new appError_1.default('No puedes eliminar tu propia cuenta', 400));
    }
    // Eliminar el usuario
    await user_model_1.default.findByIdAndDelete(id);
    res.status(200).json({
        success: true,
        message: 'Usuario eliminado exitosamente'
    });
});
// Actualizar rol de usuario
exports.updateUserRole = (0, catchAsync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const { rol } = req.body;
    // Verificar si el usuario existe
    const user = await user_model_1.default.findById(id);
    if (!user) {
        return next(new appError_1.default('Usuario no encontrado', 404));
    }
    // No permitir cambiar el rol del propio usuario
    if (req.user && req.user.id === id) {
        return next(new appError_1.default('No puedes cambiar tu propio rol', 400));
    }
    // Actualizar el rol
    const updatedUser = await user_model_1.default.findByIdAndUpdate(id, { rol }, { new: true, runValidators: true }).select('-password -passwordResetToken -passwordResetExpires');
    res.status(200).json({
        success: true,
        message: 'Rol de usuario actualizado exitosamente',
        data: { user: updatedUser }
    });
});
// Obtener perfil del usuario autenticado
exports.getUserProfile = (0, catchAsync_1.default)(async (req, res, next) => {
    const user = await user_model_1.default.findById(req.user?.id).select('-password -passwordResetToken -passwordResetExpires');
    if (!user) {
        return next(new appError_1.default('Usuario no encontrado', 404));
    }
    res.status(200).json({
        success: true,
        data: { user }
    });
});
//# sourceMappingURL=user.controller.js.map