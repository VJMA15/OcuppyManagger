"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ambienteSchema = new mongoose_1.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del ambiente es obligatorio'],
        unique: true,
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    capacidad: {
        type: Number,
        required: [true, 'La capacidad es obligatoria'],
        min: [1, 'La capacidad debe ser al menos 1']
    },
    tipo: {
        type: String,
        enum: ['Aula', 'Laboratorio', 'Auditorio', 'Oficina', 'Otro'],
        required: [true, 'El tipo de ambiente es obligatorio']
    },
    estado: {
        type: String,
        enum: ['Disponible', 'En mantenimiento', 'No disponible'],
        default: 'Disponible'
    },
    equipos: {
        type: Number,
        default: 0,
        min: [0, 'El número de equipos no puede ser negativo']
    },
    ubicacion: {
        type: String,
        trim: true
    },
    servicios: [{
            type: String,
            trim: true
        }],
    horario: {
        type: String,
        default: '8:00 AM - 6:00 PM'
    },
    responsable: {
        type: String,
        trim: true
    },
    recursos: [{
            nombre: String,
            cantidad: Number
        }],
    horarioDisponible: {
        dias: [{
                type: String,
                enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
            }],
        horaInicio: String,
        horaFin: String
    },
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('Ambiente', ambienteSchema);
//# sourceMappingURL=ambiente.model.js.map