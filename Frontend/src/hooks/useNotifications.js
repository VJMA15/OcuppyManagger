import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/contexts/auth-context';
import notificationsService from '@/services/notificationsService';

export const useNotifications = () => {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para cargar notificaciones
  const loadNotifications = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await notificationsService.getReservationNotifications(user.id || user.cc);
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

  // Limpiar todas las notificaciones
  const clearAll = useCallback(() => {
    notificationsService.clearAll();
  }, []);

  // Refrescar notificaciones
  const refresh = useCallback(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Suscribirse a cambios en el servicio de notificaciones
  useEffect(() => {
    const unsubscribe = notificationsService.subscribe((data) => {
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    });

    return unsubscribe;
  }, []);

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        loadNotifications();
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [loadNotifications, user]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    actions: {
      markAsRead,
      markAllAsRead,
      clearAll,
      refresh,
      loadNotifications
    }
  };
};

export default useNotifications;