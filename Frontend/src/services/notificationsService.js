import reservasService from './reservasService';
import { enrichReservasWithDetails, normalizeStatus } from '../utils/reservasUtils';

class NotificationsService {
  constructor() {
    this.listeners = [];
    this.notifications = [];
    this.unreadCount = 0;
    this.currentReadStoreKey = null;
    this.currentLegacyReadStoreKey = null;
    // Control de solicitudes para evitar 429
    this.inFlight = false;
    this.lastFetchAt = 0;
    this.cooldownUntil = 0;
    this.minIntervalMs = 120000; // mínimo 120s entre llamadas reales
  }

  _getGlobalCooldownRemaining() {
    try {
      const until = typeof window !== 'undefined' && window.__apiGlobalRegistry ? window.__apiGlobalRegistry.cooldownUntil : 0;
      const now = Date.now();
      return until && until > now ? (until - now) : 0;
    } catch {
      return 0;
    }
  }

  // Obtener notificaciones de reservas filtradas por rol
  async getReservationNotifications(currentUserId, userRole, opts = {}) {
    try {
      const now = Date.now();
      const force = !!(opts && opts.force);
      // Respetar cooldown si hubo 429 previamente
      const globalRemaining = this._getGlobalCooldownRemaining();
      if ((this.cooldownUntil && now < this.cooldownUntil) || globalRemaining > 0) {
        // Retornar datos en caché sin golpear la API
        return this.notifications;
      }

      // Evitar llamadas concurrentes
      if (this.inFlight) {
        return this.notifications;
      }

      // Evitar sobre-solicitudes si se llama demasiado seguido
      if (!force && (now - this.lastFetchAt < this.minIntervalMs)) {
        return this.notifications;
      }

      this.inFlight = true;
      this.lastFetchAt = now;

      let response;
      // Elegir endpoint según rol para evitar 403
      switch (userRole?.toLowerCase()) {
        case 'administrador':
        case 'admin':
        case 'guardia':
          response = await reservasService.getReservas();
          break;
        case 'instructor':
          // Los instructores solo pueden consultar sus propias reservas
          response = await reservasService.getMyReservas(currentUserId);
          break;
        default:
          response = { success: true, data: [] };
      }
      
      if (response.success && response.data) {
        let filteredReservations = [];
        
        // Filtrar según el rol del usuario (datos ya respetan permisos)
        switch (userRole?.toLowerCase()) {
          case 'administrador':
          case 'admin':
            filteredReservations = response.data;
            // No notificar al admin sobre reservas que él mismo creó (ruido)
            filteredReservations = filteredReservations.filter(r => {
              const normalized = normalizeStatus(r.status || r.estado);
              const createdBy = r.createdBy || r.creadoPor; // compat
              // Suprimir notificaciones de creación propias principalmente en estado pendiente
              const isSelfCreation = createdBy && String(createdBy) === String(currentUserId);
              const isPending = normalized === 'PENDING';
              return !(isSelfCreation && isPending);
            });
            break;
          case 'instructor':
            // Instructores: mostrar solo reservas aprobadas o rechazadas
            filteredReservations = (response.data || []).filter(reserva => {
              const normalized = normalizeStatus(reserva.status || reserva.estado);
              return normalized === 'APPROVED' || normalized === 'REJECTED';
            });
            break;
          case 'guardia':
            filteredReservations = response.data.filter(reserva => {
              const estado = (reserva.estado || reserva.status || '').toLowerCase();
              return estado === 'pendiente' || estado === 'en_proceso' || estado === 'activa';
            });
            break;
          default:
            filteredReservations = [];
        }
        
        // Enriquecer con datos de usuario y ambiente para evitar 'desconocido'
        const enrichedReservations = await enrichReservasWithDetails(filteredReservations, { id: currentUserId });

        // Ordenar por fecha de creación (más recientes primero)
        const sortedReservations = enrichedReservations.sort((a, b) => 
          new Date(b.createdAt || b.fechaCreacion) - new Date(a.createdAt || a.fechaCreacion)
        );

        // Cargar set de notificaciones leídas desde almacenamiento persistente por usuario/rol
        const readKey = this._getReadStoreKey(currentUserId, userRole);
        const legacyKey = this._getLegacyReadStoreKey(currentUserId);
        this.currentReadStoreKey = readKey;
        this.currentLegacyReadStoreKey = legacyKey;
        const readSet = this._loadReadSetWithFallback(readKey, legacyKey);

        // Convertir a formato de notificación con información específica por rol
        const notifications = sortedReservations.map(reserva => {
          const isOwn = String(reserva.userId || reserva.usuario?.id) === String(currentUserId);
          let title = 'Nueva reserva';
          const userNameRaw = reserva.usuario?.nombre || reserva.nombre;
          const ambienteName = reserva.ambiente?.nombre || reserva.ambiente || 'ambiente';
          const role = (userRole || '').toLowerCase();
          const userName = role === 'instructor'
            ? (isOwn ? 'Tú' : (userNameRaw || 'Colega'))
            : (userNameRaw || 'Usuario');
          let message = `${userName} ha realizado una reserva en ${ambienteName}`;
          
          // Personalizar mensaje según el rol
          const normalized = normalizeStatus(reserva.status || reserva.estado);
          switch (userRole?.toLowerCase()) {
            case 'administrador':
            case 'admin':
              title = 'Gestión de Reserva';
              if (normalized === 'CANCELLED' && !!reserva.approvedBy) {
                title = 'Reserva cancelada tras aprobación';
                message = `El instructor ${userName} canceló su reserva aprobada en ${ambienteName}`;
              } else {
                message = `Reserva de ${userName} en ${ambienteName} - Estado: ${reserva.estado || reserva.status || 'Pendiente'}`;
              }
              break;
              
            case 'instructor':
              title = isOwn ? 'Tu Reserva' : 'Nueva Reserva de Colega';
              message = isOwn ? `Reservaste ${ambienteName}` : `Colega reservó ${ambienteName}`;
              break;
              
            case 'guardia':
              title = 'Reserva para Supervisión';
              message = `Reserva ${reserva.estado || reserva.status || 'pendiente'} en ${ambienteName}`;
              break;
          }
          
          // Mantener estado de lectura si ya existe
          const existing = this.notifications.find(n => n.id === reserva._id);
          const wasRead = existing ? !!existing.read : false;
          const wasReadPersisted = readSet.has(reserva._id);

          // Usar updatedAt para eventos de cambio de estado
          const ts = (normalized === 'CANCELLED' || normalized === 'APPROVED' || normalized === 'REJECTED')
            ? new Date(reserva.updatedAt || reserva.fechaActualizacion || reserva.createdAt || reserva.fechaCreacion)
            : new Date(reserva.createdAt || reserva.fechaCreacion);
          return {
            id: reserva._id,
            type: 'reservation',
            title,
            message,
            data: reserva,
            timestamp: ts,
            read: wasRead || wasReadPersisted,
            userRole: userRole // Agregar rol para referencia
          };
        });
        
        this.notifications = notifications;
        this.updateUnreadCount();
        this.notifyListeners();
        
        this.inFlight = false;
        return notifications;
      }
      
      this.inFlight = false;
      return [];
    } catch (error) {
      // Si el backend respondió con límite de tasa, activar cooldown
      const status429 = (error && error.status === 429) || (typeof error?.message === 'string' && error.message.includes('429'));
      if (!status429) {
        console.error('Error fetching reservation notifications:', error);
      }
      if (status429) {
        // Intentar respetar un cooldown de 60s (si no conocemos Retry-After)
        const retryMs = (error && error.retryAfterMs) ? error.retryAfterMs : 60_000;
        this.cooldownUntil = Date.now() + retryMs;
        try {
          if (typeof window !== 'undefined') {
            window.__apiGlobalRegistry = window.__apiGlobalRegistry || { inFlight: new Map(), cache: new Map(), cooldownUntil: 0, defaultCacheTtlMs: 60000 };
            window.__apiGlobalRegistry.cooldownUntil = Date.now() + retryMs;
          }
        } catch { /* noop */ }
        // En 429 devolvemos datos actuales y NO lanzamos para evitar ruido
        return this.notifications;
      }
      this.inFlight = false;
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
      // Persistir estado leído
      if (this.currentReadStoreKey) {
        const readSet = this._loadReadSetWithFallback(this.currentReadStoreKey, this.currentLegacyReadStoreKey);
        readSet.add(notificationId);
        this._saveReadSet(this.currentReadStoreKey, readSet, this.currentLegacyReadStoreKey);
      }
      this.updateUnreadCount();
      this.notifyListeners();
    }
  }

  // Marcar todas las notificaciones como leídas
  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    // Persistir todas como leídas
    if (this.currentReadStoreKey) {
      const readSet = this._loadReadSetWithFallback(this.currentReadStoreKey, this.currentLegacyReadStoreKey);
      this.notifications.forEach(n => readSet.add(n.id));
      this._saveReadSet(this.currentReadStoreKey, readSet, this.currentLegacyReadStoreKey);
    }
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

  // Helpers de persistencia
  _getReadStoreKey(currentUserId, userRole) {
    const uid = String(currentUserId || 'anonymous');
    const role = String(userRole || 'unknown').toLowerCase();
    return `notif_read_${uid}_${role}`;
  }

  _getLegacyReadStoreKey(currentUserId) {
    const uid = String(currentUserId || 'anonymous');
    return `notif_read_${uid}`;
  }

  _loadReadSetWithFallback(key, legacyKey) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const arr = JSON.parse(raw);
        return new Set(Array.isArray(arr) ? arr : []);
      }
      if (legacyKey) {
        const legacyRaw = localStorage.getItem(legacyKey);
        const arr2 = legacyRaw ? JSON.parse(legacyRaw) : [];
        return new Set(Array.isArray(arr2) ? arr2 : []);
      }
    } catch {
      // noop
    }
    return new Set();
  }

  _saveReadSet(key, set, legacyKey) {
    try {
      const serialized = JSON.stringify(Array.from(set));
      localStorage.setItem(key, serialized);
      // Guardar también en clave legacy para compatibilidad hacia atrás
      if (legacyKey) {
        localStorage.setItem(legacyKey, serialized);
      }
    } catch {
      // noop
    }
  }
}

const notificationsService = new NotificationsService();
export default notificationsService;