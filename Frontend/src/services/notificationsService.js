import reservasService from './reservasService';

class NotificationsService {
  constructor() {
    this.listeners = [];
    this.notifications = [];
    this.unreadCount = 0;
  }

  // Obtener notificaciones de reservas (excluyendo las del usuario actual)
  async getReservationNotifications(currentUserId) {
    try {
      const response = await reservasService.getReservas();
      
      if (response.success && response.data) {
        // Filtrar reservas que no sean del usuario actual
        const otherUsersReservations = response.data.filter(reserva => {
          return reserva.userId?._id !== currentUserId && reserva.userId?.cc !== currentUserId;
        });
        
        // Ordenar por fecha de creación (más recientes primero)
        const sortedReservations = otherUsersReservations.sort((a, b) => 
          new Date(b.createdAt || b.fechaCreacion) - new Date(a.createdAt || a.fechaCreacion)
        );
        
        // Convertir a formato de notificación
        const notifications = sortedReservations.map(reserva => ({
          id: reserva._id,
          type: 'reservation',
          title: 'Nueva reserva',
          message: `${reserva.userId?.nombre || 'Usuario'} ha realizado una reserva`,
          data: reserva,
          timestamp: new Date(reserva.createdAt || reserva.fechaCreacion),
          read: false
        }));
        
        this.notifications = notifications;
        this.updateUnreadCount();
        this.notifyListeners();
        
        return notifications;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching reservation notifications:', error);
      throw error;
    }
  }

  // Obtener contador de notificaciones no leídas
  getUnreadCount() {
    return this.unreadCount;
  }

  // Marcar notificación como leída
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.updateUnreadCount();
      this.notifyListeners();
    }
  }

  // Marcar todas las notificaciones como leídas
  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.updateUnreadCount();
    this.notifyListeners();
  }

  // Actualizar contador de no leídas
  updateUnreadCount() {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }

  // Suscribirse a cambios en las notificaciones
  subscribe(callback) {
    this.listeners.push(callback);
    
    // Retornar función para desuscribirse
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notificar a todos los listeners
  notifyListeners() {
    this.listeners.forEach(callback => {
      callback({
        notifications: this.notifications,
        unreadCount: this.unreadCount
      });
    });
  }

  // Obtener todas las notificaciones
  getNotifications() {
    return this.notifications;
  }

  // Limpiar todas las notificaciones
  clearAll() {
    this.notifications = [];
    this.unreadCount = 0;
    this.notifyListeners();
  }

  // Agregar nueva notificación manualmente
  addNotification(notification) {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
      ...notification
    };
    
    this.notifications.unshift(newNotification);
    this.updateUnreadCount();
    this.notifyListeners();
    
    return newNotification;
  }

  // Eliminar notificación
  removeNotification(notificationId) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.updateUnreadCount();
    this.notifyListeners();
  }
}

const notificationsService = new NotificationsService();
export default notificationsService;