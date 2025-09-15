"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendWelcomeEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (options) => {
    // 1) Crear un transporter
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false, // true para 465, false para otros puertos
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    // 2) Definir las opciones del email
    const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || 'OccupyManager'} <${process.env.EMAIL_FROM || process.env.EMAIL_USERNAME}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || options.message
    };
    // 3) Enviar el email
    await transporter.sendMail(mailOptions);
};
exports.sendEmail = sendEmail;
// Función para enviar email de bienvenida
const sendWelcomeEmail = async (email, nombre) => {
    const message = `
    ¡Hola ${nombre}!
    
    Bienvenido a OccupyManager. Tu cuenta ha sido creada exitosamente.
    
    Puedes iniciar sesión en: ${process.env.CLIENT_URL || 'http://localhost:3000'}/login
    
    Si tienes alguna pregunta, no dudes en contactarnos.
    
    Saludos,
    El equipo de OccupyManager
  `;
    await (0, exports.sendEmail)({
        email,
        subject: 'Bienvenido a OccupyManager',
        message
    });
};
exports.sendWelcomeEmail = sendWelcomeEmail;
// Función para enviar email de reset de contraseña
const sendPasswordResetEmail = async (email, resetURL) => {
    const message = `
    Has solicitado restablecer tu contraseña.
    
    Haz clic en el siguiente enlace para restablecer tu contraseña:
    ${resetURL}
    
    Este enlace es válido por 10 minutos.
    
    Si no solicitaste este cambio, ignora este email.
    
    Saludos,
    El equipo de OccupyManager
  `;
    await (0, exports.sendEmail)({
        email,
        subject: 'Restablece tu contraseña - OccupyManager',
        message
    });
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
exports.default = {
    sendEmail: exports.sendEmail,
    sendWelcomeEmail: exports.sendWelcomeEmail,
    sendPasswordResetEmail: exports.sendPasswordResetEmail
};
//# sourceMappingURL=email.js.map