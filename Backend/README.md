# OcuppyManagger
Este es un proyecto final en el cual estamos trabajando mi equipo y yo, el cual consiste en un administrador de ambientes con el cual se puedan realizar solicitudes para poder reservar un ambiente o auditorio para cierto dia y asi hacer uso de él de manera eficiente, sin la preocupacion de que se tengan que retirar por otros eventos pendientes.

## Configuración de correo (Nodemailer)

Para que los administradores reciban notificaciones por email cuando:
- un instructor crea una reserva, y
- alguien envía una solicitud de registro,

configura las siguientes variables de entorno en el backend (`.env`):

- `EMAIL_HOST` (ej: `smtp.gmail.com`)
- `EMAIL_PORT` (ej: `587`)
- `EMAIL_USERNAME` (cuenta SMTP)
- `EMAIL_PASSWORD` (contraseña o App Password)
- `EMAIL_FROM` (remitente, ej: `no-reply@tuapp.com`)
- `EMAIL_FROM_NAME` (nombre remitente, ej: `OccupyManager`)
- `CLIENT_URL` (URL del frontend, ej: `http://localhost:5173`)

Opcional (selección de proveedor):
- `EMAIL_PROVIDER` uno de: `smtp` (por defecto), `brevo`, `sendgrid`, `mailgun`, `ses`, `gmail_relay`.
- Variables específicas según el proveedor (puedes sobreescribir `EMAIL_HOST/PORT/SECURE` si lo necesitas):
  - Brevo (Sendinblue): `BREVO_SMTP_USER` (ej: `apikey`), `BREVO_SMTP_PASS` (tu SMTP key). Host por defecto: `smtp-relay.brevo.com:587`.
  - SendGrid: `SENDGRID_API_KEY` (password), opcional `SENDGRID_SMTP_USER` (por defecto `apikey`). Host: `smtp.sendgrid.net:587`.
  - Mailgun: `MAILGUN_SMTP_USER` (ej: `postmaster@tu-dominio`), `MAILGUN_SMTP_PASS`. Host: `smtp.mailgun.org:587`.
  - AWS SES: `SES_SMTP_USER`, `SES_SMTP_PASS`, opcional `SES_REGION` (por defecto `us-east-1`). Host: `email-smtp.<region>.amazonaws.com:587`.
  - Gmail SMTP Relay: `EMAIL_PROVIDER=gmail_relay`. Puede funcionar sin autenticación (IP autorizada/TLS). Si tu dominio requiere usuario, usa `GMAIL_RELAY_USER` y `GMAIL_RELAY_PASS`. Host: `smtp-relay.gmail.com:587`.

Notas:
- Se envían correos a todos los usuarios con rol `admin` activos en la base de datos.
- Los enlaces del correo apuntan a `${CLIENT_URL}/admin/reservas` y `${CLIENT_URL}/admin/solicitudes` para revisión.
- Para Gmail, habilita “App Passwords” y usa el password de la app en `EMAIL_PASSWORD`.
 - Si tu organización restringe Gmail SMTP (Workspace), usa `EMAIL_PROVIDER=gmail_relay` con IP autorizada o selecciona un proveedor transaccional (`brevo`, `sendgrid`, `mailgun`, `ses`).

### Ejemplos de .env por proveedor

Brevo:
```
EMAIL_PROVIDER=brevo
BREVO_SMTP_USER=apikey
BREVO_SMTP_PASS=<tu_smtp_key>
EMAIL_FROM=no-reply@tu-dominio.com
EMAIL_FROM_NAME=OccupyManager
ADMIN_EMAIL=admin@tu-dominio.com
EMAIL_DEBUG=true
CLIENT_URL=http://localhost:5173
```

SendGrid:
```
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=<tu_api_key>
EMAIL_FROM=no-reply@tu-dominio.com
EMAIL_FROM_NAME=OccupyManager
ADMIN_EMAIL=admin@tu-dominio.com
EMAIL_DEBUG=true
CLIENT_URL=http://localhost:5173
```

Gmail SMTP Relay sin auth (IP autorizada):
```
EMAIL_PROVIDER=gmail_relay
EMAIL_FROM=no-reply@tu-dominio.com
EMAIL_FROM_NAME=OccupyManager
ADMIN_EMAIL=admin@tu-dominio.com
EMAIL_DEBUG=true
CLIENT_URL=http://localhost:5173
```
