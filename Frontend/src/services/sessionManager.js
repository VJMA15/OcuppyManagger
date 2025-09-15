// Importación dinámica para evitar dependencia circular
// import authService from './auth';

class SessionManager {
  constructor() {
    this.timeout = 5 * 60 * 1000; // 5 minutos en milisegundos
    this.warningTime = 1 * 60 * 1000; // Advertir 1 minuto antes
    this.timer = null;
    this.warningTimer = null;
    this.isActive = false;
    this.onWarning = null;
    this.onTimeout = null;
    
    // Eventos que indican actividad del usuario
    this.activityEvents = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];
    
    this.init();
  }

  init() {
    // No inicializar automáticamente para evitar dependencia circular
    // El authService se encargará de iniciar la sesión cuando sea necesario
    console.log('📋 SessionManager inicializado');
  }

  startSession() {
    this.isActive = true;
    this.bindEvents();
    this.resetTimer();
    console.log('🔐 Sesión iniciada - Timeout automático en 5 minutos');
  }

  stopSession() {
    this.isActive = false;
    this.unbindEvents();
    this.clearTimers();
    console.log('🔓 Gestión de sesión detenida');
  }

  bindEvents() {
    this.activityEvents.forEach(event => {
      document.addEventListener(event, this.handleActivity.bind(this), true);
    });
  }

  unbindEvents() {
    this.activityEvents.forEach(event => {
      document.removeEventListener(event, this.handleActivity.bind(this), true);
    });
  }

  handleActivity() {
    if (!this.isActive) return;
    
    // Resetear el timer cada vez que hay actividad
    this.resetTimer();
  }

  resetTimer() {
    this.clearTimers();
    
    // Timer de advertencia (4 minutos)
    this.warningTimer = setTimeout(() => {
      this.showWarning();
    }, this.timeout - this.warningTime);
    
    // Timer de cierre de sesión (5 minutos)
    this.timer = setTimeout(() => {
      this.handleTimeout();
    }, this.timeout);
  }

  clearTimers() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }

  showWarning() {
    console.log('⚠️ Advertencia: La sesión expirará en 1 minuto por inactividad');
    
    // Mostrar notificación visual
    this.showNotification(
      'Sesión por expirar',
      'Tu sesión expirará en 1 minuto por inactividad. Mueve el mouse o presiona una tecla para mantenerla activa.',
      'warning'
    );
    
    // Callback personalizado si existe
    if (this.onWarning && typeof this.onWarning === 'function') {
      this.onWarning();
    }
  }

  handleTimeout() {
    console.log('⏰ Sesión cerrada por inactividad (5 minutos)');
    
    // Mostrar notificación de cierre
    this.showNotification(
      'Sesión cerrada',
      'Tu sesión ha sido cerrada por inactividad. Serás redirigido al login.',
      'error'
    );
    
    // Callback personalizado si existe
    if (this.onTimeout && typeof this.onTimeout === 'function') {
      this.onTimeout();
    }
    
    // Cerrar sesión después de un breve delay para mostrar la notificación
    setTimeout(() => {
      this.logout();
    }, 2000);
  }

  async logout() {
    // Detener la gestión de sesión
    this.stopSession();
    
    try {
      // Importación dinámica para evitar dependencia circular
      const { default: authService } = await import('./auth');
      
      // Cerrar sesión usando el servicio de auth
      authService.logout();
      
      // Redirigir al login
      window.location.href = '/login';
      
      console.log('🔓 Sesión cerrada por timeout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Redirigir de todas formas
      window.location.href = '/login';
    }
  }

  showNotification(title, message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `session-notification session-notification-${type}`;
    notification.innerHTML = `
      <div class="session-notification-content">
        <h4>${title}</h4>
        <p>${message}</p>
        <button onclick="this.parentElement.parentElement.remove()" class="session-notification-close">×</button>
      </div>
    `;
    
    // Estilos inline para la notificación
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#fee' : type === 'warning' ? '#fff3cd' : '#d4edda'};
      border: 1px solid ${type === 'error' ? '#f5c6cb' : type === 'warning' ? '#ffeaa7' : '#c3e6cb'};
      color: ${type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#155724'};
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      max-width: 350px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    // Estilos para el contenido
    const content = notification.querySelector('.session-notification-content');
    content.style.cssText = `
      position: relative;
    `;
    
    const title_el = notification.querySelector('h4');
    title_el.style.cssText = `
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
    `;
    
    const message_el = notification.querySelector('p');
    message_el.style.cssText = `
      margin: 0;
      font-size: 14px;
      line-height: 1.4;
    `;
    
    const closeBtn = notification.querySelector('.session-notification-close');
    closeBtn.style.cssText = `
      position: absolute;
      top: -5px;
      right: -5px;
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: inherit;
      opacity: 0.7;
    `;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Auto-remover después de 10 segundos (excepto errores)
    if (type !== 'error') {
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 10000);
    }
  }

  // Métodos para configurar callbacks personalizados
  setWarningCallback(callback) {
    this.onWarning = callback;
  }

  setTimeoutCallback(callback) {
    this.onTimeout = callback;
  }

  // Método para extender la sesión manualmente
  extendSession() {
    if (this.isActive) {
      this.resetTimer();
      console.log('🔄 Sesión extendida manualmente');
    }
  }

  // Método para obtener el tiempo restante
  getRemainingTime() {
    // Esta es una aproximación, no es exacta
    return this.timeout;
  }

  // Método para verificar si la sesión está activa
  isSessionActive() {
    return this.isActive;
  }
}

// Crear instancia singleton
const sessionManager = new SessionManager();

export default sessionManager;