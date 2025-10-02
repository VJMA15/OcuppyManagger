import reservasService from './reservasService';

class NotificationsService {
  constructor() {
    this.listeners = [];
    this.notifications = [];
    this.unreadCount = 0;
  }

  // Obtener notificaciones de reservas filtradas por rol
  async getReservationNotifications(currentUserId, userRole) {
    try {
      const response = await reservasService.getReservas();
      
      if (response.success && response.data) {
        let filteredReservations = [];
        
        // Filtrar según el rol del usuario
        switch (userRole?.toLowerCase()) {
          case 'administrador':
          case 'admin':
            // Los administradores ven todas las reservas
            filteredReservations = response.data;
            break;
            
          case 'instructor':
            // Los instructores solo ven reservas aprobadas o rechazadas (no pendientes)
            filteredReservations = response.data.filter(reserva => {
              const estado = reserva.estado?.toLowerCase();
              const isNotOwnReservation = reserva.userId?._id !== currentUserId && reserva.userId?.cc !== currentUserId;
              return isNotOwnReservation && (estado === 'aprobada' || estado === 'rechazada');
            });
            break;
            
          case 'guardia':
            // Los guardias ven reservas que requieren supervisión o están en proceso
            filteredReservations = response.data.filter(reserva => {
              const estado = reserva.estado?.toLowerCase();
              return estado === 'pendiente' || estado === 'en_proceso' || estado === 'activa';
            });
            break;
            
          default:
            // Otros roles no ven notificaciones de reservas
            filteredReservations = [];
        }
        
        // Ordenar por fecha de creación (más recientes primero)
        const sortedReservations = filteredReservations.sort((a, b) => 
          new Date(b.createdAt || b.fechaCreacion) - new Date(a.createdAt || a.fechaCreacion)
        );
        
        // Convertir a formato de notificación con información específica por rol
        const notifications = sortedReservations.map(reserva => {
          let title = 'Nueva reserva';
          let message = `${reserva.userId?.nombre || 'Usuario'} ha realizado una reserva`;
          
          // Personalizar mensaje según el rol
          switch (userRole?.toLowerCase()) {
            case 'administrador':
            case 'admin':
              title = 'Gestión de Reserva';
              message = `Reserva de ${reserva.userId?.nombre || 'Usuario'} - Estado: ${reserva.estado || 'Pendiente'}`;
              break;
              
            case 'instructor':
              title = 'Estado de Reserva';
              const estado = reserva.estado?.toLowerCase();
              if (estado === 'aprobada') {
                message = `Tu colega ${reserva.userId?.nombre || 'Usuario'} tuvo su reserva APROBADA en ${reserva.ambienteId?.nombre || 'un ambiente'}`;
              } else if (estado === 'rechazada') {
                message = `Tu colega ${reserva.userId?.nombre || 'Usuario'} tuvo su reserva RECHAZADA en ${reserva.ambienteId?.nombre || 'un ambiente'}`;
              } else {
                message = `Reserva de ${reserva.userId?.nombre || 'Colega'} - Estado: ${reserva.estado}`;
              }
              break;
              
            case 'guardia':
              title = 'Reserva para Supervisión';
              message = `Reserva ${reserva.estado || 'pendiente'} en ${reserva.ambienteId?.nombre || 'ambiente'}`;
              break;
          }
          
          return {
            id: reserva._id,
            type: 'reservation',
            title,
            message,
            data: reserva,
            timestamp: new Date(reserva.createdAt || reserva.fechaCreacion),
            read: false,
            userRole: userRole // Agregar rol para referencia
          };
        });
        
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