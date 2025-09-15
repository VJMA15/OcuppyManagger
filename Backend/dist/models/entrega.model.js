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
const entregaSchema = new mongoose_1.Schema({
    // Información básica de la entrega
    ambiente: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Ambiente',
        required: [true, 'El ambiente es obligatorio']
    },
    instructor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El instructor es obligatorio']
    },
    guardia: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El guardia que entrega es obligatorio']
    },
    // Información de la entrega
    fechaEntrega: {
        type: Date,
        required: [true, 'La fecha de entrega es obligatoria']
    },
    horaEntrega: {
        type: String,
        required: [true, 'La hora de entrega es obligatoria']
    },
    jornada: {
        type: String,
        enum: ['mañana', 'tarde', 'noche'],
        required: [true, 'La jornada es obligatoria']
    },
    // Estado de la entrega
    estado: {
        type: String,
        enum: ['pendiente', 'entregado', 'devuelto', 'cancelado'],
        default: 'pendiente'
    },
    // Información de devolución
    fechaDevolucion: {
        type: Date
    },
    horaDevolucion: {
        type: String
    },
    guardiaDevolucion: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Observaciones y notas
    observacionesEntrega: {
        type: String,
        maxlength: [500, 'Las observaciones no pueden exceder 500 caracteres']
    },
    observacionesDevolucion: {
        type: String,
        maxlength: [500, 'Las observaciones no pueden exceder 500 caracteres']
    },
    // Información adicional
    equiposEntregados: [{
            nombre: String,
            cantidad: Number,
            estado: String
        }],
    // Firma digital o código de verificación
    codigoVerificacion: {
        type: String,
        unique: true
    },
    // Metadatos
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Índices para mejorar el rendimiento
entregaSchema.index({ ambiente: 1, fechaEntrega: 1 });
entregaSchema.index({ instructor: 1, estado: 1 });
entregaSchema.index({ guardia: 1, fechaEntrega: -1 });
entregaSchema.index({ estado: 1, jornada: 1 });
entregaSchema.index({ codigoVerificacion: 1 });
// Virtual para calcular duración de la entrega
entregaSchema.virtual('duracionEntrega').get(function () {
    if (this.fechaDevolucion && this.fechaEntrega) {
        const diff = this.fechaDevolucion.getTime() - this.fechaEntrega.getTime();
        return Math.floor(diff / (1000 * 60 * 60)); // Horas
    }
    return null;
});
// Virtual para verificar si está vencida (más de 8 horas sin devolver)
entregaSchema.virtual('estaVencida').get(function () {
    if (this.estado === 'entregado' && this.fechaEntrega) {
        const ahora = new Date();
        const diff = ahora.getTime() - this.fechaEntrega.getTime();
        const horas = diff / (1000 * 60 * 60);
        return horas > 8; // Más de 8 horas
    }
    return false;
});
// Middleware pre-save para generar código de verificación
entregaSchema.pre('save', function (next) {
    if (this.isNew && !this.codigoVerificacion) {
        // Generar código único de 6 dígitos
        this.codigoVerificacion = Math.random().toString(36).substr(2, 6).toUpperCase();
    }
    next();
});
// Middleware para popular referencias automáticamente
entregaSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'ambiente',
        select: 'nombre tipo capacidad ubicacion equipos servicios'
    }).populate({
        path: 'instructor',
        select: 'nombre email cc'
    }).populate({
        path: 'guardia',
        select: 'nombre email'
    }).populate({
        path: 'guardiaDevolucion',
        select: 'nombre email'
    });
    next();
});
// Métodos estáticos
entregaSchema.statics.obtenerEntregasPorJornada = function (jornada, fecha = new Date()) {
    const inicioDelDia = new Date(fecha);
    inicioDelDia.setHours(0, 0, 0, 0);
    const finDelDia = new Date(fecha);
    finDelDia.setHours(23, 59, 59, 999);
    return this.find({
        jornada,
        fechaEntrega: {
            $gte: inicioDelDia,
            $lte: finDelDia
        },
        activo: true
    });
};
entregaSchema.statics.obtenerEntregasVencidas = function () {
    const hace8Horas = new Date();
    hace8Horas.setHours(hace8Horas.getHours() - 8);
    return this.find({
        estado: 'entregado',
        fechaEntrega: { $lt: hace8Horas },
        activo: true
    });
};
entregaSchema.statics.obtenerEstadisticasEntregas = function (fechaInicio, fechaFin) {
    return this.aggregate([
        {
            $match: {
                fechaEntrega: {
                    $gte: fechaInicio,
                    $lte: fechaFin
                },
                activo: true
            }
        },
        {
            $group: {
                _id: '$estado',
                count: { $sum: 1 },
                ambientes: { $addToSet: '$ambiente' }
            }
        }
    ]);
};
// Métodos de instancia
entregaSchema.methods.marcarComoEntregado = function () {
    this.estado = 'entregado';
    this.fechaEntrega = new Date();
    this.horaEntrega = new Date().toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit'
    });
    return this.save();
};
entregaSchema.methods.marcarComoDevuelto = function (guardiaId, observaciones = '') {
    this.estado = 'devuelto';
    this.fechaDevolucion = new Date();
    this.horaDevolucion = new Date().toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit'
    });
    this.guardiaDevolucion = new mongoose_1.default.Types.ObjectId(guardiaId);
    this.observacionesDevolucion = observaciones;
    return this.save();
};
entregaSchema.methods.cancelarEntrega = function (motivo = '') {
    this.estado = 'cancelado';
    this.observacionesEntrega = motivo;
    return this.save();
};
const Entrega = mongoose_1.default.model('Entrega', entregaSchema);
exports.default = Entrega;
//# sourceMappingURL=entrega.model.js.map