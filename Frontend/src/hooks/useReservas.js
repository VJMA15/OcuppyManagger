import { useState, useEffect } from 'react';

/**
 * Hook para manejar las reservas del sistema
 * Proporciona lista de reservas y funciones CRUD
 */
const useReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener reservas desde la API
  const fetchReservas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos simulados que coinciden con la estructura esperada
      const mockReservas = [
        {
          id: '1',
          userId: 'user123',
          environmentId: 'env456',
          fechaInicio: '2024-01-15T09:00:00Z',
          fechaFin: '2024-01-15T11:00:00Z',
          estado: 'pendiente',
          proposito: 'Reunión de equipo',
          equipamiento: ['proyector'],
          fechaCreacion: '2024-01-10T10:00:00Z'
        },
        {
          id: '2',
          userId: 'user789',
          environmentId: 'env123',
          fechaInicio: '2024-01-16T14:00:00Z',
          fechaFin: '2024-01-16T16:00:00Z',
          estado: 'aprobada',
          proposito: 'Presentación de proyecto',
          equipamiento: ['computadora', 'proyector'],
          fechaCreacion: '2024-01-11T15:30:00Z',
          fechaAprobacion: '2024-01-12T09:00:00Z',
          aprobadoPor: 'admin123'
        },
        {
          id: '3',
          userId: 'user456',
          environmentId: 'env789',
          fechaInicio: '2024-01-17T10:00:00Z',
          fechaFin: '2024-01-17T12:00:00Z',
          estado: 'rechazada',
          proposito: 'Capacitación',
          equipamiento: [],
          fechaCreacion: '2024-01-12T14:00:00Z',
          fechaRechazo: '2024-01-13T10:00:00Z',
          motivoRechazo: 'Conflicto de horarios'
        },
        {
          id: '4',
          userId: 'user321',
          environmentId: 'env456',
          fechaInicio: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Hace 30 min
          fechaFin: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // En 30 min
          estado: 'aprobada',
          proposito: 'Reunión activa',
          equipamiento: ['proyector'],
          fechaCreacion: '2024-01-14T08:00:00Z',
          fechaAprobacion: '2024-01-14T09:00:00Z',
          aprobadoPor: 'admin123'
        }
      ];
      
      setReservas(mockReservas);
      
    } catch (err) {
      setError(err.message);
      console.error('❌ Error al obtener reservas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para crear una nueva reserva
  const crearReserva = async (nuevaReserva) => {
    try {
      setLoading(true);
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const reservaConId = {
        ...nuevaReserva,
        id: Date.now().toString(),
        estado: 'pendiente',
        fechaCreacion: new Date().toISOString()
      };
      
      setReservas(prev => [...prev, reservaConId]);
      
      return reservaConId;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar una reserva
  const actualizarReserva = async (id, datosActualizados) => {
    try {
      setLoading(true);
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setReservas(prev => 
        prev.map(reserva => 
          reserva.id === id 
            ? { ...reserva, ...datosActualizados }
            : reserva
        )
      );
      
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para aprobar una reserva
  const aprobarReserva = async (id, aprobadoPor) => {
    await actualizarReserva(id, {
      estado: 'aprobada',
      fechaAprobacion: new Date().toISOString(),
      aprobadoPor
    });
  };

  // Función para rechazar una reserva
  const rechazarReserva = async (id, motivoRechazo) => {
    await actualizarReserva(id, {
      estado: 'rechazada',
      fechaRechazo: new Date().toISOString(),
      motivoRechazo
    });
  };

  // Función para eliminar una reserva
  const eliminarReserva = async (id) => {
    try {
      setLoading(true);
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setReservas(prev => prev.filter(reserva => reserva.id !== id));
      
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cargar reservas al montar el componente
  useEffect(() => {
    fetchReservas();
  }, []);

  // Función para refrescar datos
  const refrescar = () => {
    fetchReservas();
  };

  return {
    reservas,
    loading,
    error,
    crearReserva,
    actualizarReserva,
    aprobarReserva,
    rechazarReserva,
    eliminarReserva,
    refrescar
  };
};

export default useReservas;