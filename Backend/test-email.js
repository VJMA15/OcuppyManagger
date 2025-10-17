// Simple script para probar envío de correo usando la utilidad de nodemailer
// Uso: node test-email.js [to] [subject] [message]

require('dotenv').config();
// Registrar ts-node para poder importar archivos .ts desde ./src
require('ts-node/register');

const path = require('path');

async function main() {
  // Cargar función desde util TS
  const emailUtil = require(path.join(__dirname, 'src', 'utils', 'email'));
  const sendEmail = emailUtil.sendEmail || (emailUtil.default && emailUtil.default.sendEmail);
  if (!sendEmail) {
    console.error('❌ No se pudo cargar sendEmail desde src/utils/email.ts');
    process.exit(1);
  }

  const toArg = process.argv[2];
  const subjectArg = process.argv[3];
  const messageArg = process.argv[4];

  const to = toArg || process.env.ADMIN_EMAIL || process.env.EMAIL_FROM;
  const subject = subjectArg || 'Prueba de correo - OccupyManager';
  const message = messageArg || 'Este es un correo de prueba enviado desde test-email.js';

  if (!to) {
    console.error('❌ No hay destinatario. Pasa un correo como primer argumento o define ADMIN_EMAIL/EMAIL_FROM en .env');
    process.exit(1);
  }

  console.log('📧 Enviando correo de prueba con configuración actual...');
  console.log({
    provider: process.env.EMAIL_PROVIDER || 'smtp',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE,
    user: process.env.EMAIL_USERNAME || process.env.EMAIL_USER,
    from: process.env.EMAIL_FROM,
    to,
    subject
  });

  try {
    await sendEmail({ email: to, subject, message });
    console.log('✅ Correo de prueba enviado (revisa tu bandeja o logs)');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error enviando correo de prueba:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

main();