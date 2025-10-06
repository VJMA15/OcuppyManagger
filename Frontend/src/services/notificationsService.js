import reservationsService from './reservationsService';
import { enrichReservasWithDetails } from '@/utils/reservasUtils';

// Helper para traducir estados al español de forma consistente
const toSpanishStatus = (statusRaw) => {
  const s = (statusRaw || '').toString().toLowerCase();
  switch (s) {
    case 'approved':
    case 'aprobada':
      return 'Aprobada';
    case 'pending':
    case 'pendiente':
      return 'Pendiente';
    case 'rejected':
    case 'rechazada':
      return 'Rechazada';
    case 'cancelled':
    case 'cancelada':
      return 'Cancelada';
    case 'active':
    case 'activa':
      return 'Activa';
    default:
      return statusRaw || 'Pendiente';
  }
};

class NotificationsService {
  constructor() {
    this.listeners = [];
    this.notifications = [];
    this.unreadCount = 0;
    // Lista de IDs descartados (cerrados) que no deben reaparecer
    this.dismissedIds = this.loadDismissed();
    // Lista de IDs marcados como leídos que debe persistir entre recargas
    this.readIds = this.loadRead();

    // Sincronizar cambios de descartes entre pestañas/ventanas
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'notifications_dismissed') {
          try {
            this.dismissedIds = e.newValue ? JSON.parse(e.newValue) : [];
          } catch {
            this.dismissedIds = [];
          }
          // Aplicar filtrado al estado actual visible
          this.notifications = this.notifications.filter(n => !this.dismissedIds.includes(n.id));
          this.updateUnreadCount();
          this.notifyListeners();
        }
      });
    }
  }

  // Cargar IDs descartados desde localStorage
  loadDismissed() {
    try {
      const raw = localStorage.getItem('notifications_dismissed');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  // Persistir IDs descartados
  persistDismissed() {
    try {
      localStorage.setItem('notifications_dismissed', JSON.stringify(this.dismissedIds));
    } catch (e) {
      // Silenciar errores de almacenamiento
    }
  }

  // Cargar IDs leídos desde localStorage
  loadRead() {
    try {
      const raw = localStorage.getItem('notifications_read');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  // Persistir IDs leídos
  persistRead() {
    try {
      localStorage.setItem('notifications_read', JSON.stringify(this.readIds));
    } catch (e) {
      // Silenciar errores
    }
  }

  // Limpiar descartes (p.ej. al hacer logout)
  clearDismissed() {
    this.dismissedIds = [];
    try {
      localStorage.removeItem('notifications_dismissed');
    } catch (e) {
      // Silenciar errores
    }
  }

  // Obtener notificaciones de reservas filtradas por rol
  async getReservationNotifications(currentUserId, userRole) {
    try {
      const response = await reservationsService.getReservations();
      
      if (response.success && response.data) {
        // Enriquecer reservas con datos de usuario y ambiente para mostrar información completa
        const enriched = await enrichReservasWithDetails(response.data || []);
        let filteredReservations = [];
        
        // Filtrar según el rol del usuario
        switch (userRole?.toLowerCase()) {
          case 'administrador':
          case 'admin':
            // Los administradores ven todas las reservas
            filteredReservations = enriched;
            break;
            
          case 'instructor':
            // Los instructores solo ven reservas aprobadas o rechazadas (no pendientes)
            filteredReservations = enriched.filter(reserva => {
              const estado = (reserva.estado || reserva.status || '').toLowerCase();
              const isNotOwnReservation = reserva.usuario?.id !== currentUserId && reserva.usuario?.documento !== currentUserId;
              return isNotOwnReservation && (estado === 'aprobada' || estado === 'rechazada');
            });
            break;
            
          case 'guardia':
            // Los guardias ven reservas que requieren supervisión o están en proceso
            filteredReservations = enriched.filter(reserva => {
              const estado = (reserva.estado || reserva.status || '').toLowerCase();
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
        const notificationsRaw = sortedReservations.map(reserva => {
          let title = 'Nueva reserva';
          const nombreAutor = reserva.usuario?.nombre || reserva.nombre || 'Usuario';
          const nombreAmbiente = reserva.ambiente?.nombre || reserva.ambienteNombre || 'ambiente';
          const estadoLabel = toSpanishStatus(reserva.estado || reserva.status || 'pendiente');
          let message = `${nombreAutor} ha realizado una reserva`;
          
          // Personalizar mensaje según el rol
          switch (userRole?.toLowerCase()) {
            case 'administrador':
            case 'admin':
              title = 'Gestión de Reserva';
              message = `Reserva de ${nombreAutor} — Estado: ${estadoLabel}`;
              break;
              
            case 'instructor': {
              title = 'Estado de Reserva';
              const estado = (reserva.estado || reserva.status || '').toLowerCase();
              if (estado === 'aprobada') {
                message = `Tu colega ${nombreAutor} tuvo su reserva Aprobada en ${nombreAmbiente}`;
              } else if (estado === 'rechazada') {
                message = `Tu colega ${nombreAutor} tuvo su reserva Rechazada en ${nombreAmbiente}`;
              } else {
                message = `Reserva de ${nombreAutor} — Estado: ${estadoLabel}`;
              }
              break;
            }
              
            case 'guardia':
              title = 'Reserva para Supervisión';
              message = `Reserva ${estadoLabel} en ${nombreAmbiente}`;
              break;
          }
          
          return {
            id: reserva._id,
            type: 'reservation',
            title,
            message,
            data: reserva,
            timestamp: new Date(reserva.createdAt || reserva.fechaCreacion),
            read: this.readIds.includes(reserva._id),
            userRole: userRole // Agregar rol para referencia
          };
        });
        // Filtrar notificaciones que ya fueron descartadas (cerradas)
        const notifications = notificationsRaw.filter(n => !this.dismissedIds.includes(n.id));
        
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
      if (notificationId && !this.readIds.includes(notificationId)) {
        this.readIds.push(notificationId);
        this.persistRead();
      }
      this.updateUnreadCount();
      this.notifyListeners();
    }
  }

  // Marcar todas las notificaciones como leídas
  markAllAsRead() {
    const ids = this.notifications.map(n => n.id).filter(Boolean);
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    // Unir y persistir IDs leídos
    const set = new Set([...(this.readIds || []), ...ids]);
    this.readIds = Array.from(set);
    this.persistRead();
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
    // Descartar permanentemente todas las notificaciones actuales
    const currentIds = this.notifications.map(n => n.id).filter(Boolean);
    const set = new Set([...this.dismissedIds, ...currentIds]);
    this.dismissedIds = Array.from(set);
    this.persistDismissed();

    // Limpiar visibles
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
    // Agregar a descartadas para que no reaparezca al recargar
    if (notificationId && !this.dismissedIds.includes(notificationId)) {
      this.dismissedIds.push(notificationId);
      this.persistDismissed();
    }

    // Remover de la lista visible
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.updateUnreadCount();
    this.notifyListeners();
  }
}

const notificationsService = new NotificationsService();
export default notificationsService;