// Script TS para probar envío de correo usando la utilidad de nodemailer
// Uso: npx ts-node Backend/test-email.ts [to] [subject] [message]

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '.env') });
import { sendEmail } from './src/utils/email';

async function main() {
  const toArg = process.argv[2];
  const subjectArg = process.argv[3];
  const messageArg = process.argv[4];

  const to = toArg || process.env.ADMIN_EMAIL || process.env.EMAIL_FROM;
  const subject = subjectArg || 'Prueba de correo - OccupyManager';
  const message = messageArg || 'Este es un correo de prueba enviado desde test-email.ts';

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
  } catch (err: any) {
    console.error('❌ Error enviando correo de prueba:', err?.message || err);
    process.exit(1);
  }
}

main();