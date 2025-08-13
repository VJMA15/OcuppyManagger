import { useState, useEffect } from 'react';

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
      
      // Simular llamada a API para obtener reservas próximas
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // CORRECCIÓN: Datos simulados con formato correcto para UpcomingReservations
      const mockReservations = [
        {
          nombre: 'Juan Pérez',
          documento: '12345678',
          ambiente: 'Sala de Conferencias A',
          fecha: new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleDateString(),
          hora: 'Mañana (6:00 AM - 12:00 PM)',
          motivo: 'Reunión de equipo'
        },
        {
          nombre: 'María García',
          documento: '87654321',
          ambiente: 'Laboratorio B',
          fecha: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(),
          hora: 'Tarde (12:00 PM - 6:00 PM)',
          motivo: 'Práctica de laboratorio'
        },
        {
          nombre: 'Carlos López',
          documento: '11223344',
          ambiente: 'Aula 101',
          fecha: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          hora: 'Noche (6:00 PM - 10:00 PM)',
          motivo: 'Clase de programación'
        }
      ];
      
      setUpcomingReservations(mockReservations);
      
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