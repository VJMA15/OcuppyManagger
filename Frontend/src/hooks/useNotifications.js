import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/contexts/auth-context';
import notificationsService from '@/services/notificationsService';

export const useNotifications = () => {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const getGlobalCooldownRemaining = () => {
    try {
      const until = typeof window !== 'undefined' && window.__apiGlobalRegistry ? window.__apiGlobalRegistry.cooldownUntil : 0;
      const now = Date.now();
      return until && until > now ? (until - now) : 0;
    } catch {
      return 0;
    }
  };

  // Función para cargar notificaciones
  const loadNotifications = useCallback(async () => {
    if (!user) return;
    // Evitar solicitudes si ya hay una en curso o la pestaña está oculta
    if (loading) return;
    if (typeof document !== 'undefined' && document.hidden) {
      return;
    }
    // Respetar cooldown global
    const globalCooldownMs = getGlobalCooldownRemaining();
    if (globalCooldownMs > 0) {
      // Saltar silenciosamente durante el cooldown para evitar 429
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Pasar tanto el ID como el rol del usuario
      await notificationsService.getReservationNotifications(
        user._id || user.id || user.userId || user.cc,
        user.rol || user.role
      );
      // El servicio notificará a los listeners y actualizará el estado vía suscripción
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err.message || 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Marcar notificación como leída
  const markAsRead = useCallback((notificationId) => {
    notificationsService.markAsRead(notificationId);
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(() => {
    notificationsService.markAllAsRead();
  }, []);

  // Eliminar una notificación
  const removeNotification = useCallback((notificationId) => {
    notificationsService.removeNotification(notificationId);
  }, []);

  // Limpiar todas las notificaciones
  const clearAll = useCallback(() => {
    notificationsService.clearAll();
  }, []);

  // Suscribirse a cambios del servicio de notificaciones
  useEffect(() => {
    const unsubscribe = notificationsService.subscribe(({ notifications, unreadCount }) => {
      setNotifications(notifications || []);
      setUnreadCount(unreadCount || 0);
    });

    // Inicializar estado con valores actuales del servicio
    setNotifications(notificationsService.getNotifications());
    setUnreadCount(notificationsService.getUnreadCount());

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Cargar notificaciones al montar el componente - SIN loadNotifications en dependencias
  useEffect(() => {
    loadNotifications();
  }, []); // Array vacío para evitar bucles infinitos

  // Cargar notificaciones cuando cambie el usuario - SIN loadNotifications en dependencias
  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, loadNotifications]);

  // Auto-refresh cada 120 segundos - SIN loadNotifications en dependencias
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        loadNotifications();
      }
    }, 120000); // 120 segundos

    return () => clearInterval(interval);
  }, [user, loadNotifications]);

  // Alias explícito para refresh (evitar posible colisión con nombres globales)
  const doRefresh = useCallback(() => {
    return loadNotifications();
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    actions: {
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll,
      refresh: doRefresh,
      loadNotifications
    }
  };
};

export default useNotifications;