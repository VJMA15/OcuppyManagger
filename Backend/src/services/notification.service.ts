import User from '../models/user.model';
import Ambiente from '../models/ambiente.model';
import { ReservationDocument } from '../types/reservation.types';
import { sendEmail } from '../utils/email';

export class NotificationService {
  /** Obtiene correos de administradores activos */
  private async getAdminRecipients(): Promise<{ email: string; nombre: string }[]> {
    const admins = await User.find({ role: 'admin', activo: true }).select('email nombre').lean();
    const recipients = admins.filter(a => !!a.email) as any;

    // Fallback/extra: incluir ADMIN_EMAIL desde .env si existe
    const envAdminEmail = (process.env.ADMIN_EMAIL || '').trim();
    if (envAdminEmail) {
      const exists = recipients.some((r: any) => String(r.email).toLowerCase() === envAdminEmail.toLowerCase());
      if (!exists) {
        recipients.push({ email: envAdminEmail, nombre: 'Administrador' } as any);
      }
    }

    return recipients;
  }

  /** Envía correo a admins cuando se crea una reserva */
  async notifyReservationCreatedForAdmins(reservation: ReservationDocument, instructor?: { nombre?: string; email?: string }): Promise<void> {
    try {
      const recipients = await this.getAdminRecipients();
      if (!recipients.length) {
        console.warn('⚠️ [NotificationService] No hay administradores activos para notificar.');
        return;
      }

      const ambiente = await Ambiente.findById(reservation.environmentId).select('nombre').lean();
      const fecha = new Date(reservation.reservationDate || reservation.startDate);
      const fechaStr = fecha.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
      const jornada = reservation.jornada || 'sin jornada';

      const appUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const reviewUrl = `${appUrl}/admin/reservas`;

      const subject = `Nueva reserva pendiente - ${ambiente?.nombre || 'Ambiente'} (${fechaStr}, ${jornada})`;
      const html = `
        <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#0f172a">
          <h2 style="margin:0 0 8px">Nueva reserva creada</h2>
          <p style="margin:0 0 12px">Se ha creado una nueva reserva y requiere revisión.</p>
          <table style="border-collapse:collapse; width:100%; max-width:560px">
            <tbody>
              <tr><td style="padding:6px 0; width:180px; color:#475569">Instructor</td><td style="padding:6px 0">${instructor?.nombre || 'Desconocido'}</td></tr>
              ${instructor?.email ? `<tr><td style=\"padding:6px 0; width:180px; color:#475569\">Email instructor</td><td style=\"padding:6px 0\">${instructor.email}</td></tr>` : ''}
              <tr><td style="padding:6px 0; width:180px; color:#475569">Ambiente</td><td style="padding:6px 0">${ambiente?.nombre || String(reservation.environmentId)}</td></tr>
              <tr><td style="padding:6px 0; width:180px; color:#475569">Fecha</td><td style="padding:6px 0">${fechaStr}</td></tr>
              <tr><td style="padding:6px 0; width:180px; color:#475569">Jornada</td><td style="padding:6px 0">${jornada}</td></tr>
              ${reservation.purpose ? `<tr><td style="padding:6px 0; width:180px; color:#475569">Propósito</td><td style="padding:6px 0">${reservation.purpose}</td></tr>` : ''}
            </tbody>
          </table>
          <p style="margin:16px 0 8px">Puedes revisar y aprobar/rechazar esta reserva en:</p>
          <p style="margin:0"><a href="${reviewUrl}" style="color:#2563eb; text-decoration:none">${reviewUrl}</a></p>
          <hr style="margin:20px 0; border:none; border-top:1px solid #e2e8f0" />
          <small style="color:#64748b">OccupyManager • Notificación automática</small>
        </div>
      `;

      // Enviar a todos los admins individualmente para evitar campos BCC
      await Promise.all(
        recipients.map(r => sendEmail({ email: r.email, subject, message: subject, html, replyTo: instructor?.email }))
      );

      console.log(`✉️ [NotificationService] Notificados ${recipients.length} admins sobre nueva reserva.`);
    } catch (err) {
      console.error('❌ [NotificationService] Error enviando notificación de reserva:', err instanceof Error ? err.message : err);
    }
  }

  /** Envía correo a admins cuando se crea una solicitud de registro */
  async notifySolicitudCreatedForAdmins(solicitud: { fullName: string; documentNumber: string; email: string; requestedRole: string; trainingCenter?: string; justification: string }): Promise<void> {
    try {
      const recipients = await this.getAdminRecipients();
      if (!recipients.length) {
        console.warn('⚠️ [NotificationService] No hay administradores activos para notificar (solicitudes).');
        return;
      }

      const appUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const reviewUrl = `${appUrl}/admin/solicitudes`;

      const subject = `Nueva solicitud de registro - ${solicitud.fullName} (${solicitud.requestedRole})`;
      const html = `
        <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#0f172a">
          <h2 style="margin:0 0 8px">Nueva solicitud de registro</h2>
          <p style="margin:0 0 12px">Una persona ha enviado una solicitud para registrarse en el sistema.</p>
          <table style="border-collapse:collapse; width:100%; max-width:560px">
            <tbody>
              <tr><td style="padding:6px 0; width:180px; color:#475569">Nombre</td><td style="padding:6px 0">${solicitud.fullName}</td></tr>
              <tr><td style="padding:6px 0; width:180px; color:#475569">Documento</td><td style="padding:6px 0">${solicitud.documentNumber}</td></tr>
              <tr><td style="padding:6px 0; width:180px; color:#475569">Email</td><td style="padding:6px 0">${solicitud.email}</td></tr>
              <tr><td style="padding:6px 0; width:180px; color:#475569">Rol solicitado</td><td style="padding:6px 0">${solicitud.requestedRole}</td></tr>
              ${solicitud.trainingCenter ? `<tr><td style="padding:6px 0; width:180px; color:#475569">Centro de formación</td><td style="padding:6px 0">${solicitud.trainingCenter}</td></tr>` : ''}
              <tr><td style="padding:6px 0; width:180px; color:#475569">Justificación</td><td style="padding:6px 0">${solicitud.justification}</td></tr>
            </tbody>
          </table>
          <p style="margin:16px 0 8px">Revisa y aprueba/rechaza esta solicitud en:</p>
          <p style="margin:0"><a href="${reviewUrl}" style="color:#2563eb; text-decoration:none">${reviewUrl}</a></p>
          <hr style="margin:20px 0; border:none; border-top:1px solid #e2e8f0" />
          <small style="color:#64748b">OccupyManager • Notificación automática</small>
        </div>
      `;

      await Promise.all(
        recipients.map(r => sendEmail({ email: r.email, subject, message: subject, html, replyTo: solicitud.email }))
      );

      console.log(`✉️ [NotificationService] Notificados ${recipients.length} admins sobre nueva solicitud.`);
    } catch (err) {
      console.error('❌ [NotificationService] Error enviando notificación de solicitud:', err instanceof Error ? err.message : err);
    }
  }

  /** Notifica al solicitante cuando su solicitud es aprobada (incluye contraseña temporal) */
  async notifySolicitudApprovedToUser(solicitud: { fullName: string; email: string; requestedRole: string }, tempPassword: string, reviewer?: { nombre?: string; email?: string }): Promise<void> {
    try {
      const appUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const loginUrl = `${appUrl}/login`;
      const subject = `Solicitud aprobada - Acceso concedido (${solicitud.requestedRole})`;
      const html = `
        <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#0f172a">
          <h2 style="margin:0 0 8px">¡Tu solicitud ha sido aprobada!</h2>
          <p style="margin:0 0 12px">Hola ${solicitud.fullName}, tu cuenta ha sido creada con el rol <strong>${solicitud.requestedRole}</strong>.</p>
          <p style="margin:0 0 12px">Usa la siguiente contraseña temporal para iniciar sesión. Por seguridad, se te pedirá cambiarla al ingresar:</p>
          <div style="padding:12px 16px; background:#f1f5f9; border:1px solid #e2e8f0; border-radius:8px; display:inline-block; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">
            ${tempPassword}
          </div>
          <p style="margin:16px 0 8px">Puedes acceder en:</p>
          <p style="margin:0"><a href="${loginUrl}" style="color:#2563eb; text-decoration:none">${loginUrl}</a></p>
          ${reviewer?.nombre ? `<p style="margin:16px 0 0; color:#64748b">Aprobado por: ${reviewer.nombre}${reviewer.email ? ` (${reviewer.email})` : ''}</p>` : ''}
          <hr style="margin:20px 0; border:none; border-top:1px solid #e2e8f0" />
          <small style="color:#64748b">OccupyManager • Notificación automática</small>
        </div>
      `;
      await sendEmail({ email: solicitud.email, subject, message: subject, html, replyTo: reviewer?.email });
    } catch (err) {
      console.error('❌ [NotificationService] Error enviando aprobación de solicitud al usuario:', err instanceof Error ? err.message : err);
    }
  }

  /** Notifica al solicitante cuando su solicitud es rechazada */
  async notifySolicitudRejectedToUser(solicitud: { fullName: string; email: string; requestedRole: string }, reason: string, reviewer?: { nombre?: string; email?: string }): Promise<void> {
    try {
      const subject = `Solicitud rechazada - ${solicitud.requestedRole}`;
      const html = `
        <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#0f172a">
          <h2 style="margin:0 0 8px">Tu solicitud ha sido rechazada</h2>
          <p style="margin:0 0 12px">Hola ${solicitud.fullName}, tu solicitud para el rol <strong>${solicitud.requestedRole}</strong> fue rechazada.</p>
          <p style="margin:0 0 12px">Motivo:</p>
          <div style="padding:12px 16px; background:#fef3c7; border:1px solid #fde68a; border-radius:8px;">${reason || 'Sin motivo especificado'}</div>
          ${reviewer?.nombre ? `<p style="margin:16px 0 0; color:#64748b">Revisado por: ${reviewer.nombre}${reviewer.email ? ` (${reviewer.email})` : ''}</p>` : ''}
          <hr style="margin:20px 0; border:none; border-top:1px solid #e2e8f0" />
          <small style="color:#64748b">OccupyManager • Notificación automática</small>
        </div>
      `;
      await sendEmail({ email: solicitud.email, subject, message: subject, html, replyTo: reviewer?.email });
    } catch (err) {
      console.error('❌ [NotificationService] Error enviando rechazo de solicitud al usuario:', err instanceof Error ? err.message : err);
    }
  }

  /** Notifica al usuario cuando su reserva es aprobada */
  async notifyReservationApprovedToUser(reservation: ReservationDocument): Promise<void> {
    try {
      const user = await User.findById(reservation.userId).select('email nombre').lean();
      if (!user?.email) {
        console.warn('⚠️ [NotificationService] Reserva aprobada pero el usuario no tiene email.');
        return;
      }

      const ambiente = await Ambiente.findById(reservation.environmentId).select('nombre').lean();
      const fecha = new Date(reservation.reservationDate || reservation.startDate);
      const fechaStr = fecha.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
      const jornada = reservation.jornada || 'sin jornada';

      const subject = `Reserva aprobada - ${ambiente?.nombre || 'Ambiente'} (${fechaStr}, ${jornada})`;
      const html = `
        <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#0f172a">
          <h2 style="margin:0 0 8px">Tu reserva ha sido aprobada</h2>
          <p style="margin:0 0 12px">Hola ${user.nombre || 'Usuario'}, tu reserva fue aprobada.</p>
          <table style="border-collapse:collapse; width:100%; max-width:560px">
            <tbody>
              <tr><td style="padding:6px 0; width:180px; color:#475569">Ambiente</td><td style="padding:6px 0">${ambiente?.nombre || String(reservation.environmentId)}</td></tr>
              <tr><td style="padding:6px 0; width:180px; color:#475569">Fecha</td><td style="padding:6px 0">${fechaStr}</td></tr>
              <tr><td style="padding:6px 0; width:180px; color:#475569">Jornada</td><td style="padding:6px 0">${jornada}</td></tr>
              ${reservation.purpose ? `<tr><td style=\"padding:6px 0; width:180px; color:#475569\">Propósito</td><td style=\"padding:6px 0\">${reservation.purpose}</td></tr>` : ''}
            </tbody>
          </table>
          <p style="margin:16px 0 8px">Gracias por usar OccupyManager.</p>
          <hr style="margin:20px 0; border:none; border-top:1px solid #e2e8f0" />
          <small style="color:#64748b">OccupyManager • Notificación automática</small>
        </div>
      `;
      await sendEmail({ email: user.email, subject, message: subject, html });
    } catch (err) {
      console.error('❌ [NotificationService] Error enviando aprobación de reserva al usuario:', err instanceof Error ? err.message : err);
    }
  }

  /** Notifica al usuario cuando su reserva es rechazada */
  async notifyReservationRejectedToUser(reservation: ReservationDocument): Promise<void> {
    try {
      const user = await User.findById(reservation.userId).select('email nombre').lean();
      if (!user?.email) {
        console.warn('⚠️ [NotificationService] Reserva rechazada pero el usuario no tiene email.');
        return;
      }

      const ambiente = await Ambiente.findById(reservation.environmentId).select('nombre').lean();
      const fecha = new Date(reservation.reservationDate || reservation.startDate);
      const fechaStr = fecha.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
      const jornada = reservation.jornada || 'sin jornada';

      const subject = `Reserva rechazada - ${ambiente?.nombre || 'Ambiente'} (${fechaStr}, ${jornada})`;
      const reason = reservation.rejectionReason || 'Sin motivo especificado';
      const html = `
        <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#0f172a">
          <h2 style="margin:0 0 8px">Tu reserva ha sido rechazada</h2>
          <p style="margin:0 0 12px">Hola ${user.nombre || 'Usuario'}, tu reserva fue rechazada.</p>
          <table style="border-collapse:collapse; width:100%; max-width:560px">
            <tbody>
              <tr><td style="padding:6px 0; width:180px; color:#475569">Ambiente</td><td style="padding:6px 0">${ambiente?.nombre || String(reservation.environmentId)}</td></tr>
              <tr><td style="padding:6px 0; width:180px; color:#475569">Fecha</td><td style="padding:6px 0">${fechaStr}</td></tr>
              <tr><td style="padding:6px 0; width:180px; color:#475569">Jornada</td><td style="padding:6px 0">${jornada}</td></tr>
              ${reservation.purpose ? `<tr><td style=\"padding:6px 0; width:180px; color:#475569\">Propósito</td><td style=\"padding:6px 0\">${reservation.purpose}</td></tr>` : ''}
            </tbody>
          </table>
          <p style="margin:12px 0">Motivo del rechazo:</p>
          <div style="padding:12px 16px; background:#fef3c7; border:1px solid #fde68a; border-radius:8px;">${reason}</div>
          <hr style="margin:20px 0; border:none; border-top:1px solid #e2e8f0" />
          <small style="color:#64748b">OccupyManager • Notificación automática</small>
        </div>
      `;
      await sendEmail({ email: user.email, subject, message: subject, html });
    } catch (err) {
      console.error('❌ [NotificationService] Error enviando rechazo de reserva al usuario:', err instanceof Error ? err.message : err);
    }
  }
}

export default NotificationService;