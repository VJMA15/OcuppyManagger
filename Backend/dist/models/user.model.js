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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    cc: {
        type: String,
        required: [true, 'La cédula de ciudadanía es obligatoria'],
        unique: true,
        trim: true,
        match: [/^\d{8,12}$/, 'La cédula debe tener entre 8 y 12 dígitos']
    },
    email: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un correo válido']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
        select: false
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    role: {
        type: String,
        enum: ['admin', 'instructor', 'guardia'],
        default: 'instructor'
    },
    activo: {
        type: Boolean,
        default: true,
        select: false
    }
}, {
    timestamps: true
});
// Encriptar contraseña antes de guardar
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    this.password = await bcryptjs_1.default.hash(this.password, 12);
    next();
});
// Método para comparar contraseñas
userSchema.methods.compararPassword = async function (candidatePassword) {
    return await bcryptjs_1.default.compare(candidatePassword, this.password);
};
// Método para verificar si el usuario cambió la contraseña después de que se emitió el token
userSchema.methods.cambioPassword = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt((this.passwordChangedAt.getTime() / 1000).toString(), 10);
        return JWTTimestamp < changedTimestamp;
    }
    // False significa que NO cambió la contraseña
    return false;
};
// Middleware para establecer passwordChangedAt cuando se actualiza la contraseña
userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew)
        return next();
    // Restar 1 segundo para asegurar que el token se emita después de que se haya cambiado la contraseña
    this.passwordChangedAt = new Date(Date.now() - 1000);
    next();
});
// Método para crear token de reset de contraseña
userSchema.methods.createPasswordResetToken = function () {
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutos
    return resetToken;
};
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
//# sourceMappingURL=user.model.js.map