import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '@/services/api';
import reservationsService from '@/services/reservationsService';
import { enrichReservasWithDetails } from '@/utils/reservasUtils';

// Normalizar estado de reserva a valores estándar del backend
const normalizeStatus = (raw) => {
  const s = String(raw || '').trim().toUpperCase();
  const map = {
    PENDIENTE: 'PENDING',
    APROBADA: 'APPROVED',
    APROBADO: 'APPROVED',
    RECHAZADA: 'REJECTED',
    RECHAZADO: 'REJECTED',
    CANCELADA: 'CANCELLED',
    CANCELADO: 'CANCELLED',
    FINALIZADA: 'COMPLETED',
    FINALIZADO: 'COMPLETED',
    EXPIRADA: 'EXPIRED',
    EXPIRADO: 'EXPIRED'
  };
  if (['PENDING','APPROVED','REJECTED','CANCELLED','COMPLETED','EXPIRED'].includes(s)) return s;
  return map[s] || null;
};

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
  const [isFetching, setIsFetching] = useState(false);
  const [lastFetchAt, setLastFetchAt] = useState(0);
  const minIntervalMs = 15000; // mínimo 15s entre cargas para evitar ráfagas
  const getGlobalCooldownRemaining = () => {
    try {
      const until = typeof window !== 'undefined' && window.__apiGlobalRegistry ? window.__apiGlobalRegistry.cooldownUntil : 0;
      const now = Date.now();
      return until && until > now ? (until - now) : 0;
    } catch {
      return 0;
    }
  };

  // Función para obtener reservas desde la API
  // Permite forzar la recarga inmediata tras acciones (approve/reject/delete)
  const fetchReservas = useCallback(async (opts = {}) => {
    const force = !!opts.force;
    const soft = !!opts.soft; // en modo "soft" no activamos loading, evitamos parpadeos de UI
    // Evitar solicitudes concurrentes y ráfagas muy seguidas
    if (isFetching) return;
    const now = Date.now();
    if (!force && (now - lastFetchAt < minIntervalMs)) return;
    // Respetar cooldown global para evitar golpear la API durante 429
    const globalCooldownMs = getGlobalCooldownRemaining();
    if (!force && globalCooldownMs > 0) {
      // Mostrar mensaje amigable y evitar conteos de segundos muy grandes
      const secs = Math.floor(globalCooldownMs / 1000);
      if (secs <= 120) {
        setError(`En pausa por límite de tasa. Reintento en ${secs}s`);
      } else {
        const mins = Math.ceil(secs / 60);
        setError(`En pausa por límite de tasa. Reintentaremos automáticamente (~${mins} min).`);
      }
      // Intentar servir datos cacheados sin golpear la red
      try {
        setIsFetching(true);
        const response = await reservationsService.getReservations();
        if (response?.success) {
          const enrichedReservas = await enrichReservasWithDetails(response.data || []);
          setReservas(enrichedReservas);
          setError(null);
          // Guardar snapshot local para cargas en frío
          try { localStorage.setItem('reservas:last', JSON.stringify(enrichedReservas)); } catch {}
        }
      } catch (err) {
        // Si el cliente devuelve 429 por cooldown y no hay caché, mantenemos estado actual
      } finally {
        setIsFetching(false);
        setLastFetchAt(Date.now());
      }
      return;
    }
    try {
      if (!soft) setLoading(true);
      setError(null);
      setIsFetching(true);
      
      console.log('🔄 [Context] Cargando reservas...');
      const response = await reservationsService.getReservations();
      console.log('📥 [Context] Respuesta de reservas:', response);
      
      if (response.success) {
        console.log('✅ [Context] Reservas cargadas:', response.data);
        // Enriquecer las reservas con datos de usuarios y ambientes
        const enrichedReservas = await enrichReservasWithDetails(response.data || []);
        console.log('✨ [Context] Reservas enriquecidas:', enrichedReservas);
        setReservas(enrichedReservas);
        // Guardar snapshot local para mostrar datos durante cooldown
        try { localStorage.setItem('reservas:last', JSON.stringify(enrichedReservas)); } catch {}
      } else {
        console.error('❌ [Context] Error en respuesta:', response.message);
        setError(response.message || 'Error al cargar reservas');
        setReservas([]);
      }
    } catch (err) {
      const is429 = (err && err.status === 429) || (typeof err?.message === 'string' && err.message.includes('429'));
      if (is429) {
        // No loguear 429 para evitar ruido
        setError('En pausa por límite de tasa. Reintentaremos automáticamente.');
        // Mantener reservas actuales para no vaciar la UI durante el cooldown
      } else {
        console.error('💥 [Context] Error fetching reservas:', err);
        setError('Error de conexión');
        setReservas([]);
      }
    } finally {
      setLastFetchAt(Date.now());
      setIsFetching(false);
      if (!soft) setLoading(false);
    }
  }, [isFetching, lastFetchAt]);

  // Hidratar con snapshot local al montar para evitar pantallas vacías durante cooldown
  useEffect(() => {
    try {
      const raw = localStorage.getItem('reservas:last');
      if (raw) {
        const snapshot = JSON.parse(raw);
        if (Array.isArray(snapshot)) {
          setReservas(snapshot);
        }
      }
    } catch {}
  }, []);

  // Función para refrescar reservas (útil después de aprobar/rechazar)
  const refreshReservas = useCallback(async (opts = {}) => {
    console.log('🔄 [Context] Refrescando reservas...');
    // Por defecto usar modo "soft" para no mostrar pantalla de carga completa
    await fetchReservas({ force: true, soft: true, ...opts });
  }, [fetchReservas]);

  // Función para actualizar una reserva localmente (optimistic update)
  const updateReservaLocal = (id, updatedData) => {
    setReservas(prev => 
      prev.map(reserva => 
        reserva._id === id ? { ...reserva, ...updatedData } : reserva
      )
    );
  };

  // Eliminar una reserva localmente (optimistic delete)
  const removeReservaLocal = (id) => {
    setReservas(prev => prev.filter(reserva => String(reserva._id) !== String(id) && String(reserva.id) !== String(id)));
  };

  // Cargar reservas al montar el contexto - SIN fetchReservas en dependencias
  useEffect(() => {
    fetchReservas();
  }, []); // Array vacío para evitar bucles infinitos

  // Funciones de utilidad
  const getReservaById = (id) => reservas.find(r => r._id === id);
  const getReservasByUser = (userId) => reservas.filter(r => r.userId === userId);
  const getReservasByEstado = (estado) => reservas.filter(r => normalizeStatus(r.status ?? r.estado) === estado);
  
  // Estadísticas calculadas
  const stats = {
    total: reservas.length,
    pendientes: reservas.filter(r => normalizeStatus(r.status ?? r.estado) === 'PENDING').length,
    aprobadas: reservas.filter(r => normalizeStatus(r.status ?? r.estado) === 'APPROVED').length,
    rechazadas: reservas.filter(r => normalizeStatus(r.status ?? r.estado) === 'REJECTED').length
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
    removeReservaLocal,
    
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

export { ReservasContext as default };