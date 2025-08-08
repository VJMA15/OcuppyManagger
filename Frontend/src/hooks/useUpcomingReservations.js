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
      
      // Datos simulados
      const mockReservations = [
        {
          id: '1',
          environmentName: 'Sala de Conferencias A',
          startDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // En 2 horas
          endDate: new Date(Date.now() + 4 * 60 * 60 * 1000), // En 4 horas
          purpose: 'Reunión de equipo',
          userName: 'Juan Pérez'
        },
        {
          id: '2',
          environmentName: 'Laboratorio B',
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
          endDate: new Date(Date.now() + 26 * 60 * 60 * 1000),
          purpose: 'Práctica de laboratorio',
          userName: 'María García'
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