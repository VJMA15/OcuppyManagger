import { useState, useEffect } from 'react';
import reservationsService from '@/services/reservationsService';
import { normalizeStatus, enrichReservasWithDetails } from '@/utils/reservasUtils';

/**
 * Hook para obtener y manejar reservas próximas
 */
export const useUpcomingReservations = () => {
  const [upcomingReservations, setUpcomingReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUpcomingReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      // Obtener reservas reales desde el backend
      const response = await reservationsService.getReservations();

      if (response?.success && Array.isArray(response.data)) {
        const hoy = new Date();

        // Enriquecer reservas con nombres reales de usuario y ambiente
        const enriched = await enrichReservasWithDetails(response.data || []);

        // Mapear y filtrar próximas reservas (fecha en futuro y estados relevantes)
        const mapped = enriched
          .map((reserva) => {
            const fechaRaw = reserva.fecha || reserva.startDate || reserva.fechaReserva || reserva.date;
            const fechaDate = fechaRaw ? new Date(fechaRaw) : null;

            // Campos comunes normalizados según el backend
            const nombre = reserva.userName || reserva.usuario?.nombre || reserva.nombre || 'Usuario desconocido';
            const documento = reserva.userCC || reserva.usuario?.documento || reserva.documento || 'N/A';
            const ambiente = reserva.environmentName || reserva.ambiente?.nombre || reserva.ambienteNombre || reserva.ambiente || 'Ambiente';
            const motivo = reserva.purpose || reserva.motivo || '';

            // Jornada: usar valor textual si viene, o clasificar por hora
            let jornadaTxt = reserva.jornada || '';
            if (!jornadaTxt) {
              // Si vienen startTime/endTime tipo 'HH:MM', calcular etiqueta
              const horaInicio = reserva.startTime || (reserva.startDate ? new Date(reserva.startDate).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false }) : null);
              if (horaInicio) {
                const h = parseInt(String(horaInicio).split(':')[0]);
                if (h >= 6 && h < 12) jornadaTxt = 'mañana';
                else if (h >= 12 && h < 18) jornadaTxt = 'tarde';
                else jornadaTxt = 'noche';
              }
            }

            // Estado normalizado
            const statusNormalized = normalizeStatus(reserva.status ?? reserva.estado);

            return {
              nombre,
              documento,
              ambiente,
              fecha: fechaDate ? fechaDate.toLocaleDateString('es-CO') : 'Fecha no disponible',
              hora: jornadaTxt || (reserva.startTime && reserva.endTime ? `${reserva.startTime} - ${reserva.endTime}` : ''),
              jornada: jornadaTxt,
              motivo,
              estado: statusNormalized, // Guardamos canónico en inglés
              _fechaDate: fechaDate
            };
          })
          .filter((r) => {
            if (!r._fechaDate) return false;
            const esFuturo = r._fechaDate >= new Date(hoy.setHours(0,0,0,0));
            const estadoValido = ['PENDING','APPROVED','ACTIVE','IN_PROCESS'].includes(r.estado);
            return esFuturo && estadoValido;
          })
          .sort((a, b) => a._fechaDate - b._fechaDate)
          .slice(0, 10); // limitar a 10 próximas

        setUpcomingReservations(mapped);
      } else {
        setUpcomingReservations([]);
      }
      
    } catch (err) {
      setError(err.message);
      console.error('❌ Error al obtener reservas próximas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingReservations();
    
    // Actualizar cada 10 minutos
    const interval = setInterval(fetchUpcomingReservations, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const refreshReservations = () => {
    fetchUpcomingReservations();
  };

  return {
    upcomingReservations,
    loading,
    error,
    refreshReservations
  };
};

export default useUpcomingReservations;