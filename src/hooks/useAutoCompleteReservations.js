import { useEffect } from 'react';

export const useAutoCompleteReservations = () => {
  useEffect(() => {
    const checkAndCompleteReservations = () => {
      try {
        const stored = localStorage.getItem("reservas");
        if (!stored) return;
        
        const reservas = JSON.parse(stored);
        const ahora = new Date();
        let hasChanges = false;
        
        const reservasActualizadas = reservas.map(reserva => {
          if (reserva.estado === "aprobada" && reserva.fecha && reserva.hora) {
            const fechaHora = new Date(reserva.fecha + 'T' + reserva.hora);
            const duracion = reserva.duracion ? parseFloat(reserva.duracion) * 60 * 60 * 1000 : 60 * 60 * 1000; // 1 hora por defecto
            const fechaFin = new Date(fechaHora.getTime() + duracion);
            
            // Si la reserva ya pasó su hora de finalización, marcarla como completada
            if (ahora > fechaFin) {
              hasChanges = true;
              const reservaCompletada = {
                ...reserva,
                estado: "completada",
                fechaCompletacion: ahora.toISOString()
              };
              
              // Disparar evento para generar informe automático
              window.dispatchEvent(new CustomEvent('reserva-completed', {
                detail: { reserva: reservaCompletada }
              }));
              
              return reservaCompletada;
            }
          }
          return reserva;
        });
        
        if (hasChanges) {
          localStorage.setItem("reservas", JSON.stringify(reservasActualizadas));
          // Disparar evento para notificar cambios
          window.dispatchEvent(new Event("reservas-updated"));
        }
      } catch (error) {
        console.error("Error al verificar reservas automáticamente:", error);
      }
    };
    
    // Verificar inmediatamente al montar
    checkAndCompleteReservations();
    
    // Verificar cada minuto
    const interval = setInterval(checkAndCompleteReservations, 60000);
    
    return () => clearInterval(interval);
  }, []);
}; 