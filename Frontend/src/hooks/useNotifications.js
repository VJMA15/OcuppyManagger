import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/contexts/auth-context';
import notificationsService from '@/services/notificationsService';
import realtime from '@/services/realtime';

export const useNotifications = () => {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Preferencia local: notificaciones de reservas habilitadas/deshabilitadas
  const [notifEnabled, setNotifEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('notifications');
      return saved ? !!JSON.parse(saved).reservas : true;
    } catch {
      return true;
    }
  });

  const getGlobalCooldownRemaining = () => {
    try {
      const until = typeof window !== 'undefined' && window.__apiGlobalRegistry ? window.__apiGlobalRegistry.cooldownUntil : 0;
      const now = Date.now();
      return until && until > now ? (until - now) : 0;
    } catch {
      return 0;
    }
  };

  // Escuchar cambios globales en preferencias para sincronizar el hook
  useEffect(() => {
    const handler = () => {
      try {
        const saved = localStorage.getItem('notifications');
        const enabled = saved ? !!JSON.parse(saved).reservas : true;
        setNotifEnabled(enabled);
        if (!enabled) {
          // Limpiar estado cuando se desactivan
          setNotifications([]);
          setUnreadCount(0);
        } else {
          // Forzar recarga inmediata al reactivar
          loadNotifications(true);
        }
      } catch (_) {}
    };

    window.addEventListener('notificationsPrefChanged', handler);
    window.addEventListener('appPrefsChanged', handler);
    return () => {
      window.removeEventListener('notificationsPrefChanged', handler);
      window.removeEventListener('appPrefsChanged', handler);
    };
  }, [/* deps */]);

  // Función para cargar notificaciones
  const loadNotifications = useCallback(async (force = false) => {
    if (!user) return;
    // Respetar preferencia del usuario
    if (!notifEnabled) return;
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
        user.rol || user.role,
        { force }
      );
      // El servicio notificará a los listeners y actualizará el estado vía suscripción
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err.message || 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  }, [user, loading, notifEnabled]);

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
    if (notifEnabled) {
      loadNotifications();
    }
  }, []); // Array vacío para evitar bucles infinitos

  // Cargar notificaciones cuando cambie el usuario o la preferencia
  useEffect(() => {
    if (user && notifEnabled) {
      loadNotifications();
    } else if (!notifEnabled) {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, notifEnabled, loadNotifications]);

  // Auto-refresh cada 120 segundos
  useEffect(() => {
    if (!notifEnabled) return;
    const interval = setInterval(() => {
      if (user) {
        loadNotifications();
      }
    }, 120000); // 120 segundos

    return () => clearInterval(interval);
  }, [user, notifEnabled, loadNotifications]);

  // Suscripción SSE para refrescar notificaciones en tiempo real
  useEffect(() => {
    if (!user || !notifEnabled) return;
    // Conectar a canales relevantes
    realtime.connect({ channels: ['reservas','solicitudes'] });
    const onReservasUpdated = () => {
      // Forzar actualización inmediata de notificaciones
      loadNotifications(true);
    };
    const onSolicitudesChanged = () => {
      loadNotifications(true);
    };
    realtime.on('reservas.updated', onReservasUpdated);
    realtime.on('solicitudes.changed', onSolicitudesChanged);
    return () => {
      realtime.off('reservas.updated', onReservasUpdated);
      realtime.off('solicitudes.changed', onSolicitudesChanged);
    };
  }, [user, notifEnabled, loadNotifications]);

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