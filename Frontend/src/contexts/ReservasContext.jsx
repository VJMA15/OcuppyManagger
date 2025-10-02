import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '@/services/api';
import reservationsService from '@/services/reservationsService';
import { enrichReservasWithDetails } from '@/utils/reservasUtils';

const ReservasContext = createContext();

export const useReservasContext = () => {
  const context = useContext(ReservasContext);
  if (!context) {
    throw new Error('useReservasContext debe ser usado dentro de ReservasProvider');
  }
  return context;
};

export const ReservasProvider = ({ children }) => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener reservas desde la API
  const fetchReservas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [Context] Cargando reservas...');
      const response = await reservationsService.getReservations();
      console.log('📥 [Context] Respuesta de reservas:', response);
      
      if (response.success) {
        console.log('✅ [Context] Reservas cargadas:', response.data);
        // Enriquecer las reservas con datos de usuarios y ambientes
        const enrichedReservas = await enrichReservasWithDetails(response.data || []);
        console.log('✨ [Context] Reservas enriquecidas:', enrichedReservas);
        setReservas(enrichedReservas);
      } else {
        console.error('❌ [Context] Error en respuesta:', response.message);
        setError(response.message || 'Error al cargar reservas');
        setReservas([]);
      }
    } catch (err) {
      console.error('💥 [Context] Error fetching reservas:', err);
      setError('Error de conexión');
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar reservas (útil después de aprobar/rechazar)
  const refreshReservas = async () => {
    console.log('🔄 [Context] Refrescando reservas...');
    await fetchReservas();
  };

  // Función para actualizar una reserva localmente (optimistic update)
  const updateReservaLocal = (id, updatedData) => {
    setReservas(prev => 
      prev.map(reserva => 
        reserva._id === id ? { ...reserva, ...updatedData } : reserva
      )
    );
  };

  // Cargar reservas al montar el contexto
  useEffect(() => {
    fetchReservas();
  }, []);

  // Funciones de utilidad
  const getReservaById = (id) => reservas.find(r => r._id === id);
  const getReservasByUser = (userId) => reservas.filter(r => r.userId === userId);
  const getReservasByEstado = (estado) => reservas.filter(r => r.status === estado);
  
  // Estadísticas calculadas
  const stats = {
    total: reservas.length,
    pendientes: reservas.filter(r => r.status === 'PENDING').length,
    aprobadas: reservas.filter(r => r.status === 'APPROVED').length,
    rechazadas: reservas.filter(r => r.status === 'REJECTED').length,
    canceladas: reservas.filter(r => r.status === 'CANCELLED').length
  };

  const value = {
    // Datos
    reservas,
    loading,
    error,
    stats,
    
    // Funciones
    fetchReservas,
    refreshReservas,
    updateReservaLocal,
    
    // Utilidades
    getReservaById,
    getReservasByUser,
    getReservasByEstado
  };

  return (
    <ReservasContext.Provider value={value}>
      {children}
    </ReservasContext.Provider>
  );
};

export default ReservasContext;