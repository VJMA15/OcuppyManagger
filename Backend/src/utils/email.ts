import nodemailer from 'nodemailer';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // 1) Crear un transporter
  const transporter = nodemailer.createTransport({
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

// Función para enviar email de bienvenida
export const sendWelcomeEmail = async (email: string, nombre: string): Promise<void> => {
  const message = `
    ¡Hola ${nombre}!
    
    Bienvenido a OccupyManager. Tu cuenta ha sido creada exitosamente.
    
    Puedes iniciar sesión en: ${process.env.CLIENT_URL || 'http://localhost:3000'}/login
    
    Si tienes alguna pregunta, no dudes en contactarnos.
    
    Saludos,
    El equipo de OccupyManager
  `;

  await sendEmail({
    email,
    subject: 'Bienvenido a OccupyManager',
    message
  });
};

// Función para enviar email de reset de contraseña
export const sendPasswordResetEmail = async (email: string, resetURL: string): Promise<void> => {
  const message = `
    Has solicitado restablecer tu contraseña.
    
    Haz clic en el siguiente enlace para restablecer tu contraseña:
    ${resetURL}
    
    Este enlace es válido por 10 minutos.
    
    Si no solicitaste este cambio, ignora este email.
    
    Saludos,
    El equipo de OccupyManager
  `;

  await sendEmail({
    email,
    subject: 'Restablece tu contraseña - OccupyManager',
    message
  });
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail
};