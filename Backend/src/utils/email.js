const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Crear el transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Puedes cambiar a otro proveedor si lo deseas
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2) Definir las opciones del email
  const mailOptions = {
    from: 'Occupy Manager <no-reply@occupymanager.com>',
    to: options.to,
    subject: options.subject,
    text: options.text,
    // html: options.html, // Si quieres enviar HTML
  };

  // 3) Enviar el email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail; 