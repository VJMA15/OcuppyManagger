"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarDisponibilidad = exports.eliminarAmbiente = exports.actualizarAmbiente = exports.obtenerAmbiente = exports.obtenerAmbientes = exports.crearAmbiente = void 0;
const ambiente_model_1 = __importDefault(require("../models/ambiente.model"));
const crearAmbiente = async (req, res) => {
    try {
        const ambienteData = {
            ...req.body,
            capacidad: parseInt(req.body.capacidad.toString()),
            equipos: parseInt(req.body.equipos.toString()),
            servicios: Array.isArray(req.body.servicios)
                ? req.body.servicios
                : req.body.servicios.split(',').map((s) => s.trim())
        };
        const ambiente = new ambiente_model_1.default(ambienteData);
        await ambiente.save();
        const response = {
            success: true,
            data: ambiente.toObject(),
            message: 'Ambiente creado exitosamente'
        };
        res.status(201).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: error.message
        };
        res.status(400).json(response);
    }
};
exports.crearAmbiente = crearAmbiente;
const obtenerAmbientes = async (req, res) => {
    try {
        const ambientes = await ambiente_model_1.default.find();
        const response = {
            success: true,
            data: ambientes
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: error.message
        };
        res.status(500).json(response);
    }
};
exports.obtenerAmbientes = obtenerAmbientes;
const obtenerAmbiente = async (req, res) => {
    try {
        const ambiente = await ambiente_model_1.default.findById(req.params.id);
        if (!ambiente) {
            const response = {
                success: false,
                error: 'Ambiente no encontrado'
            };
            res.status(404).json(response);
            return;
        }
        const response = {
            success: true,
            data: ambiente
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: error.message
        };
        res.status(500).json(response);
    }
};
exports.obtenerAmbiente = obtenerAmbiente;
const actualizarAmbiente = async (req, res) => {
    try {
        const ambienteData = {
            ...req.body,
            capacidad: parseInt(req.body.capacidad.toString()),
            equipos: parseInt(req.body.equipos.toString()),
            servicios: Array.isArray(req.body.servicios)
                ? req.body.servicios
                : req.body.servicios.split(',').map((s) => s.trim())
        };
        const ambiente = await ambiente_model_1.default.findByIdAndUpdate(req.params.id, ambienteData, { new: true, runValidators: true });
        if (!ambiente) {
            const response = {
                success: false,
                error: 'Ambiente no encontrado'
            };
            res.status(404).json(response);
            return;
        }
        const response = {
            success: true,
            data: ambiente,
            message: 'Ambiente actualizado exitosamente'
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: error.message
        };
        res.status(400).json(response);
    }
};
exports.actualizarAmbiente = actualizarAmbiente;
const eliminarAmbiente = async (req, res) => {
    try {
        const ambiente = await ambiente_model_1.default.findByIdAndDelete(req.params.id);
        if (!ambiente) {
            const response = {
                success: false,
                error: 'Ambiente no encontrado'
            };
            res.status(404).json(response);
            return;
        }
        const response = {
            success: true,
            message: 'Ambiente eliminado exitosamente'
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: error.message
        };
        res.status(500).json(response);
    }
};
exports.eliminarAmbiente = eliminarAmbiente;
const verificarDisponibilidad = async (req, res) => {
    try {
        const { ambienteId, fechaInicio, fechaFin } = req.body;
        // Aquí deberías implementar la lógica para verificar disponibilidad
        // Por ejemplo, consultar reservas existentes en el rango de fechas
        const response = {
            success: true,
            data: true, // true si está disponible, false si no
            message: 'Verificación de disponibilidad completada'
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: error.message
        };
        res.status(500).json(response);
    }
};
exports.verificarDisponibilidad = verificarDisponibilidad;
//# sourceMappingURL=ambiente.controller.js.map