"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarEntregaPorCodigo = exports.obtenerEstadisticasEntregas = exports.obtenerEntregasVencidas = exports.obtenerEntregasPorJornada = exports.cancelarEntrega = exports.devolverEntrega = exports.obtenerEntregaPorId = exports.obtenerEntregas = exports.crearEntrega = void 0;
const express_validator_1 = require("express-validator");
const mongoose_1 = __importDefault(require("mongoose"));
const entrega_model_1 = __importDefault(require("../models/entrega.model"));
const ambiente_model_1 = __importDefault(require("../models/ambiente.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
// Crear nueva entrega
const crearEntrega = async (req, res) => {
    try {
        // Validar errores de entrada
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Datos de entrada inválidos',
                errors: errors.array()
            });
        }
        const { ambiente, instructor, jornada, observacionesEntrega, equiposEntregados } = req.body;
        // Verificar que el ambiente existe
        const ambienteExiste = await ambiente_model_1.default.findById(ambiente);
        if (!ambienteExiste) {
            return res.status(404).json({
                success: false,
                message: 'Ambiente no encontrado'
            });
        }
        // Verificar que el instructor existe
        const instructorExiste = await user_model_1.default.findById(instructor);
        if (!instructorExiste || instructorExiste.role !== 'instructor') {
            return res.status(404).json({
                success: false,
                message: 'Instructor no encontrado o rol inválido'
            });
        }
        // Verificar que no existe una entrega activa para este ambiente en esta jornada
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const mañana = new Date(hoy);
        mañana.setDate(mañana.getDate() + 1);
        const entregaExistente = await entrega_model_1.default.findOne({
            ambiente,
            jornada,
            fechaEntrega: {
                $gte: hoy,
                $lt: mañana
            },
            estado: { $in: ['pendiente', 'entregado'] },
            activo: true
        });
        if (entregaExistente) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una entrega activa para este ambiente en esta jornada'
            });
        }
        // Crear la entrega
        const nuevaEntrega = new entrega_model_1.default({
            ambiente,
            instructor,
            guardia: req.user?.id,
            jornada,
            fechaEntrega: new Date(),
            horaEntrega: new Date().toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit'
            }),
            observacionesEntrega,
            equiposEntregados: equiposEntregados || [],
            estado: 'entregado' // Se marca como entregado inmediatamente
        });
        await nuevaEntrega.save();
        res.status(201).json({
            success: true,
            message: 'Entrega registrada exitosamente',
            data: nuevaEntrega
        });
    }
    catch (error) {
        console.error('Error al crear entrega:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};
exports.crearEntrega = crearEntrega;
// Obtener todas las entregas con filtros
const obtenerEntregas = async (req, res) => {
    try {
        const { page = 1, limit = 10, estado, jornada, instructor, ambiente, fechaInicio, fechaFin, search, guardia } = req.query;
        // Construir filtros
        const filtros = { activo: true };
        if (estado)
            filtros.estado = estado;
        if (jornada)
            filtros.jornada = jornada;
        if (instructor)
            filtros.instructor = instructor;
        if (ambiente)
            filtros.ambiente = ambiente;
        if (guardia)
            filtros.guardia = guardia;
        // Filtro por fechas
        if (fechaInicio || fechaFin) {
            filtros.fechaEntrega = {};
            if (fechaInicio)
                filtros.fechaEntrega.$gte = new Date(fechaInicio);
            if (fechaFin)
                filtros.fechaEntrega.$lte = new Date(fechaFin);
        }
        // Filtro de búsqueda
        if (search) {
            filtros.$or = [
                { observacionesEntrega: { $regex: search, $options: 'i' } },
                { observacionesDevolucion: { $regex: search, $options: 'i' } },
                { codigoVerificacion: { $regex: search, $options: 'i' } }
            ];
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const [entregas, total] = await Promise.all([
            entrega_model_1.default.find(filtros)
                .sort({ fechaEntrega: -1 })
                .skip(skip)
                .limit(limitNum),
            entrega_model_1.default.countDocuments(filtros)
        ]);
        const totalPages = Math.ceil(total / limitNum);
        res.json({
            success: true,
            data: entregas,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: totalPages
            }
        });
    }
    catch (error) {
        console.error('Error al obtener entregas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};
exports.obtenerEntregas = obtenerEntregas;
// Obtener entrega por ID
const obtenerEntregaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de entrega inválido'
            });
        }
        const entrega = await entrega_model_1.default.findById(id);
        if (!entrega || !entrega.activo) {
            return res.status(404).json({
                success: false,
                message: 'Entrega no encontrada'
            });
        }
        res.json({
            success: true,
            data: entrega
        });
    }
    catch (error) {
        console.error('Error al obtener entrega:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};
exports.obtenerEntregaPorId = obtenerEntregaPorId;
// Marcar entrega como devuelta
const devolverEntrega = async (req, res) => {
    try {
        const { id } = req.params;
        const { observacionesDevolucion } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de entrega inválido'
            });
        }
        const entrega = await entrega_model_1.default.findById(id);
        if (!entrega || !entrega.activo) {
            return res.status(404).json({
                success: false,
                message: 'Entrega no encontrada'
            });
        }
        if (entrega.estado !== 'entregado') {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden devolver entregas que estén en estado "entregado"'
            });
        }
        await entrega.marcarComoDevuelto(req.user.id, observacionesDevolucion);
        res.json({
            success: true,
            message: 'Entrega marcada como devuelta exitosamente',
            data: entrega
        });
    }
    catch (error) {
        console.error('Error al devolver entrega:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};
exports.devolverEntrega = devolverEntrega;
// Cancelar entrega
const cancelarEntrega = async (req, res) => {
    try {
        const { id } = req.params;
        const { motivo } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de entrega inválido'
            });
        }
        const entrega = await entrega_model_1.default.findById(id);
        if (!entrega || !entrega.activo) {
            return res.status(404).json({
                success: false,
                message: 'Entrega no encontrada'
            });
        }
        if (entrega.estado === 'devuelto' || entrega.estado === 'cancelado') {
            return res.status(400).json({
                success: false,
                message: 'No se puede cancelar una entrega que ya está devuelta o cancelada'
            });
        }
        await entrega.cancelarEntrega(motivo);
        res.json({
            success: true,
            message: 'Entrega cancelada exitosamente',
            data: entrega
        });
    }
    catch (error) {
        console.error('Error al cancelar entrega:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};
exports.cancelarEntrega = cancelarEntrega;
// Obtener entregas por jornada
const obtenerEntregasPorJornada = async (req, res) => {
    try {
        const { jornada } = req.params;
        const { fecha } = req.query;
        const fechaConsulta = fecha ? new Date(fecha) : new Date();
        const entregas = await entrega_model_1.default.obtenerEntregasPorJornada(jornada, fechaConsulta);
        res.json({
            success: true,
            data: entregas,
            meta: {
                jornada,
                fecha: fechaConsulta.toISOString().split('T')[0],
                total: entregas.length
            }
        });
    }
    catch (error) {
        console.error('Error al obtener entregas por jornada:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};
exports.obtenerEntregasPorJornada = obtenerEntregasPorJornada;
// Obtener entregas vencidas
const obtenerEntregasVencidas = async (req, res) => {
    try {
        const entregas = await entrega_model_1.default.obtenerEntregasVencidas();
        res.json({
            success: true,
            data: entregas,
            meta: {
                total: entregas.length,
                mensaje: 'Entregas con más de 8 horas sin devolver'
            }
        });
    }
    catch (error) {
        console.error('Error al obtener entregas vencidas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};
exports.obtenerEntregasVencidas = obtenerEntregasVencidas;
// Obtener estadísticas de entregas
const obtenerEstadisticasEntregas = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        // Fechas por defecto: último mes
        const fin = fechaFin ? new Date(fechaFin) : new Date();
        const inicio = fechaInicio ? new Date(fechaInicio) : new Date(fin.getTime() - 30 * 24 * 60 * 60 * 1000);
        const estadisticas = await entrega_model_1.default.obtenerEstadisticasEntregas(inicio, fin);
        // Obtener estadísticas adicionales
        const totalEntregas = await entrega_model_1.default.countDocuments({
            fechaEntrega: { $gte: inicio, $lte: fin },
            activo: true
        });
        const entregasVencidas = await entrega_model_1.default.countDocuments({
            estado: 'entregado',
            fechaEntrega: {
                $gte: inicio,
                $lte: fin,
                $lt: new Date(Date.now() - 8 * 60 * 60 * 1000) // Más de 8 horas
            },
            activo: true
        });
        const promedioTiempoDevolucion = await entrega_model_1.default.aggregate([
            {
                $match: {
                    estado: 'devuelto',
                    fechaEntrega: { $gte: inicio, $lte: fin },
                    fechaDevolucion: { $exists: true },
                    activo: true
                }
            },
            {
                $project: {
                    tiempoDevolucion: {
                        $divide: [
                            { $subtract: ['$fechaDevolucion', '$fechaEntrega'] },
                            1000 * 60 * 60 // Convertir a horas
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    promedioHoras: { $avg: '$tiempoDevolucion' }
                }
            }
        ]);
        res.json({
            success: true,
            data: {
                estadisticasPorEstado: estadisticas,
                resumen: {
                    totalEntregas,
                    entregasVencidas,
                    promedioTiempoDevolucion: promedioTiempoDevolucion[0]?.promedioHoras || 0
                },
                periodo: {
                    inicio: inicio.toISOString().split('T')[0],
                    fin: fin.toISOString().split('T')[0]
                }
            }
        });
    }
    catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};
exports.obtenerEstadisticasEntregas = obtenerEstadisticasEntregas;
// Verificar entrega por código
const verificarEntregaPorCodigo = async (req, res) => {
    try {
        const { codigo } = req.params;
        const entrega = await entrega_model_1.default.findOne({
            codigoVerificacion: codigo.toUpperCase(),
            activo: true
        });
        if (!entrega) {
            return res.status(404).json({
                success: false,
                message: 'Código de verificación no encontrado'
            });
        }
        res.json({
            success: true,
            data: {
                entrega: {
                    _id: entrega._id,
                    ambiente: entrega.ambiente,
                    instructor: entrega.instructor,
                    estado: entrega.estado,
                    fechaEntrega: entrega.fechaEntrega,
                    horaEntrega: entrega.horaEntrega,
                    jornada: entrega.jornada,
                    codigoVerificacion: entrega.codigoVerificacion
                }
            }
        });
    }
    catch (error) {
        console.error('Error al verificar código:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};
exports.verificarEntregaPorCodigo = verificarEntregaPorCodigo;
//# sourceMappingURL=entrega.controller.js.map