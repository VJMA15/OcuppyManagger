import { useState, useEffect, useCallback } from 'react';
import { useReservasContext } from '@/contexts/ReservasContext';
import { formatearFecha, normalizeStatus } from '@/utils/reservasUtils';

/**
 * Hook para obtener y manejar reservas próximas
 */
export const useUpcomingReservations = () => {
  const { reservas, loading: loadingReservas, error: errorReservas, refreshReservas } = useReservasContext();
  const [upcomingReservations, setUpcomingReservations] = useState([]);

  // Determinar jornada a partir de hora en formato HH:MM
  const getJornadaFromHora = (hora) => {
    if (!hora) return null;
    const hStr = String(hora).trim();
    const match = hStr.match(/^(\d{1,2}):(\d{2})/);
    const hour = match ? parseInt(match[1], 10) : null;
    if (hour == null || isNaN(hour)) return null;
    if (hour >= 6 && hour < 12) return 'Mañana';
    if (hour >= 12 && hour < 18) return 'Tarde';
    return 'Noche';
  };

  // Formatear HH:MM a AM/PM
  const formatClock = (hhmm) => {
    if (!hhmm) return null;
    try {
      const [hRaw, mRaw] = String(hhmm).split(':');
      const h = parseInt(hRaw, 10);
      const m = parseInt(mRaw, 10) || 0;
      if (isNaN(h)) return String(hhmm);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (_) {
      return String(hhmm);
    }
  };

  // Formatea etiqueta de hora preferenciando hora específica
  const formatHourLabel = (reserva) => {
    const { jornada, hora, horaInicio, horaFin, startDate, endDate } = reserva || {};

    // Caso 1: rango explícito HH:MM - HH:MM
    if (horaInicio && horaFin) {
      const j = getJornadaFromHora(horaInicio) || (jornada || '').charAt(0).toUpperCase() + (jornada || '').slice(1).toLowerCase();
      const start = formatClock(horaInicio);
      const end = formatClock(horaFin);
      if (j) return `${j} (${start} - ${end})`;
      return `${start} - ${end}`;
    }

    // Caso 2: hora única
    if (hora) {
      const j = getJornadaFromHora(hora) || (jornada || '').charAt(0).toUpperCase() + (jornada || '').slice(1).toLowerCase();
      const h = /AM|PM/i.test(String(hora)) ? String(hora) : formatClock(hora);
      return j ? `${j} (${h})` : h;
    }

    // Caso 3: usar startDate/endDate si existen
    try {
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const opts = { hour: '2-digit', minute: '2-digit', hour12: true };
        return `${start.toLocaleTimeString('es-CO', opts)} - ${end.toLocaleTimeString('es-CO', opts)}`;
      }
    } catch (_) {}

    // Caso 4: fallback a jornada conocida
    const jLower = (jornada || '').toLowerCase();
    if (jLower === 'mañana') return 'Mañana (6:00 AM - 12:00 PM)';
    if (jLower === 'tarde') return 'Tarde (12:00 PM - 6:00 PM)';
    if (jLower === 'noche') return 'Noche (6:00 PM - 10:00 PM)';

    return 'Horario no especificado';
  };

  // Parseo robusto de fecha a inicio del día
  const parseDateToStartOfDay = (r) => {
    const base = r?.startDate || r?.reservationDate || r?.fecha;
    if (!base) return null;
    if (base instanceof Date) {
      return new Date(base.getFullYear(), base.getMonth(), base.getDate());
    }
    const s = String(base).trim();
    // ISO YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return new Date(`${s}T00:00:00`);
    }
    // DD/MM/YYYY
    const mDMY = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (mDMY) {
      const [_, dd, mm, yyyy] = mDMY;
      return new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
    }
    // Spanish "15 de octubre de 2025"
    const months = {
      'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
      'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
    };
    const mSpan = s.toLowerCase().match(/(\d{1,2})\s+de\s+([a-záéíóú]+)\s+de\s+(\d{4})/i);
    if (mSpan) {
      const day = parseInt(mSpan[1], 10);
      const monName = mSpan[2].normalize('NFD').replace(/[^\w\s]/g, '');
      const year = parseInt(mSpan[3], 10);
      const monIndex = months[monName] ?? months[monName.replace('é','e').replace('í','i').replace('ó','o').replace('ú','u')];
      if (typeof monIndex === 'number') {
        return new Date(year, monIndex, day);
      }
    }
    // Fallback
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  useEffect(() => {
    const now = new Date();
    const startOfTomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0, 0
    );

    // Proteger si no hay reservas aún
    if (!Array.isArray(reservas)) {
      setUpcomingReservations([]);
      return;
    }

    const filtered = reservas
      // Solo reservas válidas y no canceladas/rechazadas/completadas
      .filter(r => {
        const st = normalizeStatus(r.status ?? r.estado);
        return st === 'APPROVED' || st === 'PENDING';
      })
      // A partir de mañana
      .filter(r => {
        const dt = parseDateToStartOfDay(r);
        if (!dt) return false;
        return dt >= startOfTomorrow;
      })
      // Ordenar por fecha de inicio ascendente
      .sort((a, b) => {
        const adt = parseDateToStartOfDay(a);
        const bdt = parseDateToStartOfDay(b);
        const ad = adt ? adt.getTime() : 0;
        const bd = bdt ? bdt.getTime() : 0;
        return ad - bd;
      })
      // Mapear al formato esperado por el componente
      .map(r => {
        const nombre = r.nombre || r.userName || r.usuario?.nombre || 'Usuario desconocido';
        const documento = r.documento || r.userCC || r.usuario?.documento || 'N/A';
        const ambiente = r.ambiente?.nombre || r.ambienteNombre || r.environmentName || 'Ambiente desconocido';
        const fechaMostrar = formatearFecha(r.reservationDate || r.startDate || r.fecha);
        const horaMostrar = formatHourLabel(r);
        const motivo = r.motivo || r.purpose || '';
        return { nombre, documento, ambiente, fecha: fechaMostrar, hora: horaMostrar, motivo };
      });

    setUpcomingReservations(filtered);
  }, [reservas]);

  const refresh = useCallback(() => {
    // Usar el refresco suave del contexto para evitar parpadeos
    refreshReservas({ force: true, soft: true });
  }, [refreshReservas]);

  return {
    upcomingReservations,
    loading: !!loadingReservas,
    error: errorReservas,
    refreshReservations: refresh
  };
};

export default useUpcomingReservations;