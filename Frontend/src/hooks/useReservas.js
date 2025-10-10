import { useState, useEffect, useCallback } from 'react';
import apiService from '@/services/api';

/**
 * Hook para manejar las reservas del sistema
 * Proporciona lista de reservas y funciones CRUD
 */
const useReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener reservas desde la API
  const fetchReservas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando reservas...');
      const response = await apiService.getReservas();
      console.log('📥 Respuesta de reservas:', response);
      
      if (response.success) {
        console.log('✅ Reservas cargadas:', response.data);
        setReservas(response.data || []);
      } else {
        console.error('❌ Error en respuesta:', response.message);
        setError(response.message || 'Error al cargar reservas');
        setReservas([]);
      }
    } catch (err) {
      console.error('💥 Error fetching reservas:', err);
      setError('Error de conexión');
      setReservas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar reservas al montar el componente - SIN fetchReservas en dependencias
  useEffect(() => {
    fetchReservas();
  }, []); // Array vacío para evitar bucles infinitos

  // Función para crear una nueva reserva
  const createReserva = async (nuevaReserva) => {
    try {
      setLoading(true);
      const response = await apiService.createReserva(nuevaReserva);
      
      if (response.success) {
        await fetchReservas(); // Recargar la lista
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      console.error('Error creating reserva:', err);
      return { success: false, message: 'Error de conexión' };
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar una reserva
  const updateReserva = async (id, datosActualizados) => {
    try {
      setLoading(true);
      // Aquí iría la llamada a la API para actualizar
      // Por ahora, actualizamos localmente
      setReservas(prev => 
        prev.map(reserva => 
          reserva.id === id ? { ...reserva, ...datosActualizados } : reserva
        )
      );
      return { success: true };
    } catch (err) {
      console.error('Error updating reserva:', err);
      return { success: false, message: 'Error al actualizar reserva' };
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar una reserva
  const deleteReserva = async (id) => {
    try {
      setLoading(true);
      // Aquí iría la llamada a la API para eliminar
      // Por ahora, eliminamos localmente
      setReservas(prev => prev.filter(reserva => reserva.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting reserva:', err);
      return { success: false, message: 'Error al eliminar reserva' };
    } finally {
      setLoading(false);
    }
  };

  return {
    reservas,
    loading,
    error,
    fetchReservas,
    createReserva,
    updateReserva,
    deleteReserva,
    // Funciones de utilidad
    getReservaById: (id) => reservas.find(r => r.id === id),
    getReservasByUser: (userId) => reservas.filter(r => r.userId === userId),
    getReservasByEstado: (estado) => reservas.filter(r => r.estado === estado)
  };
};

export default useReservas;