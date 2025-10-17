import nodemailer from 'nodemailer';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  from?: string; // override del remitente si se requiere
}

// Helper para normalizar booleanos desde env
const toBool = (val?: string) => val === 'true' || val === '1';
// Helper para enmascarar valores sensibles al loguear
const mask = (val?: string) => {
  if (!val) return '';
  const s = String(val);
  const at = s.indexOf('@');
  if (at > 0) {
    const name = s.slice(0, at);
    const domain = s.slice(at);
    const maskedName = name.length <= 2 ? name[0] + '*' : name.slice(0, 2) + '***';
    return `${maskedName}${domain}`;
  }
  return s.length <= 2 ? s[0] + '*' : s.slice(0, 2) + '***';
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // 1) Resolver configuración SMTP/EMAIL y proveedor
  const provider = (process.env.EMAIL_PROVIDER || process.env.EMAIL_TRANSPORT || '').toLowerCase();
  let host = process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
  let secureEnv = process.env.EMAIL_SECURE || process.env.SMTP_SECURE;
  let secure = toBool(secureEnv) || false;
  let port = parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || (secure ? '465' : '587'));
  let user: string | undefined = process.env.EMAIL_USERNAME || process.env.EMAIL_USER || process.env.SMTP_USER;
  let pass: string | undefined = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const fromEmail = options.from || process.env.EMAIL_FROM || process.env.SMTP_FROM || user || process.env.ADMIN_EMAIL;
  const fromName = process.env.EMAIL_FROM_NAME || process.env.SMTP_FROM_NAME || 'OccupyManager';
  const debugEnabled = toBool(process.env.EMAIL_DEBUG);

  // Defaults por proveedor (puedes sobreescribir con EMAIL_HOST/PORT/SECURE)
  let authRequired = true;
  if (provider === 'brevo') {
    host = process.env.EMAIL_HOST || 'smtp-relay.brevo.com';
    port = parseInt(process.env.EMAIL_PORT || '587');
    secure = toBool(process.env.EMAIL_SECURE) || false;
    user = process.env.BREVO_SMTP_USER || user || 'apikey';
    pass = process.env.BREVO_SMTP_PASS || pass; // usa tu SMTP key de Brevo
  } else if (provider === 'sendgrid') {
    host = process.env.EMAIL_HOST || 'smtp.sendgrid.net';
    port = parseInt(process.env.EMAIL_PORT || '587');
    secure = toBool(process.env.EMAIL_SECURE) || false;
    user = process.env.SENDGRID_SMTP_USER || user || 'apikey';
    pass = process.env.SENDGRID_API_KEY || process.env.SENDGRID_SMTP_PASS || pass; // API key como password
  } else if (provider === 'mailgun') {
    host = process.env.EMAIL_HOST || 'smtp.mailgun.org';
    port = parseInt(process.env.EMAIL_PORT || '587');
    secure = toBool(process.env.EMAIL_SECURE) || false;
    user = process.env.MAILGUN_SMTP_USER || user; // ej: postmaster@tu-dominio
    pass = process.env.MAILGUN_SMTP_PASS || pass;
  } else if (provider === 'ses') {
    const region = process.env.SES_REGION || 'us-east-1';
    host = process.env.EMAIL_HOST || `email-smtp.${region}.amazonaws.com`;
    port = parseInt(process.env.EMAIL_PORT || '587');
    secure = toBool(process.env.EMAIL_SECURE) || false;
    user = process.env.SES_SMTP_USER || user;
    pass = process.env.SES_SMTP_PASS || pass;
  } else if (provider === 'gmail_relay' || provider === 'smtp_relay') {
    host = process.env.EMAIL_HOST || 'smtp-relay.gmail.com';
    port = parseInt(process.env.EMAIL_PORT || '587');
    secure = toBool(process.env.EMAIL_SECURE) || false;
    const relayUser = process.env.GMAIL_RELAY_USER || process.env.SMTP_RELAY_USER;
    const relayPass = process.env.GMAIL_RELAY_PASS || process.env.SMTP_RELAY_PASS;
    if (relayUser && relayPass) {
      user = relayUser;
      pass = relayPass;
      authRequired = true;
    } else {
      // Gmail SMTP Relay puede funcionar sin autenticación (IP autorizada / TLS)
      user = undefined;
      pass = undefined;
      authRequired = false;
    }
  }

  if (authRequired && (!user || !pass)) {
    // Sin credenciales, el envío fallará en la mayoría de proveedores (excepto relay sin auth)
    throw new Error('Faltan credenciales SMTP: defina usuario y contraseña según el proveedor seleccionado.');
  }

  // 2) Crear transporter
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: authRequired ? { user: user as string, pass: pass as string } : undefined,
    logger: debugEnabled,
    debug: debugEnabled
  });

  // 3) Definir las opciones del email
  const mailOptions = {
    from: `${fromName} <${fromEmail}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || options.message,
    ...(options.replyTo ? { replyTo: options.replyTo } : {}),
    ...(options.cc ? { cc: options.cc } : {}),
    ...(options.bcc ? { bcc: options.bcc } : {})
  } as any;

  // Logging de configuración y envío si debug está habilitado
  if (debugEnabled) {
    console.log('📧 [EmailDebug] SMTP config', {
      host,
      port,
      secure,
      user: mask(user),
      fromEmail: mask(fromEmail),
      fromName,
      provider: provider || 'smtp',
      to: options.email,
      subject: options.subject
    });
  }

  // 4) Enviar el email
  try {
    const info: any = await transporter.sendMail(mailOptions);
    if (debugEnabled) {
      console.log('📧 [EmailDebug] sendMail info', {
        messageId: info?.messageId,
        accepted: info?.accepted,
        rejected: info?.rejected,
        response: info?.response
      });
    }
  } catch (err: any) {
    if (debugEnabled) {
      console.error('❌ [EmailDebug] sendMail error', {
        code: err?.code,
        command: err?.command,
        response: err?.response,
        message: err?.message
      });
    }
    throw err;
  }
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