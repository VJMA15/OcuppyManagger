import authService from './auth';
import { API_CONFIG } from '@/config/api';

// Servicio singleton para SSE (Server-Sent Events)
// Permite conectar a /api/v1/events/stream y suscribirse a eventos
// conocidos: 'reservas.updated', 'solicitudes.changed', 'historial.changed', 'connected', 'error'
const realtime = {
  _es: null,
  _listeners: new Map(), // eventName -> Set(handler)
  _channels: new Set(),
  _lastConnectedAt: 0,

  connect(opts = {}) {
    const desiredChannels = Array.isArray(opts.channels) && opts.channels.length
      ? opts.channels.map((c) => String(c).trim()).filter(Boolean)
      : ['reservas','solicitudes','historial'];

    const desiredSet = new Set(desiredChannels);
    const token = authService.getToken();

    // No conectar si no hay autenticación válida
    if (!token || !authService.isTokenValid()) {
      return null;
    }

    // Si ya hay conexión y los canales coinciden, no reconectar innecesariamente
    if (this._es && this._es.readyState !== 2 /* CLOSED */) {
      // Evitar reconexión si los canales solicitados son un subconjunto de los actuales
      const isSubset = desiredChannels.every((c) => this._channels.has(c));
      if (isSubset) {
        // Mantener la conexión existente, no cerrar para evitar net::ERR_ABORTED en DevTools
        return this._es;
      }
      // Canales diferentes y no subconjunto: cerrar y reconectar con la unión
      desiredSet.forEach((c) => this._channels.add(c));
      this._reconnect(token);
      return this._es;
    }

    // Inicializar canales y crear EventSource
    this._channels = desiredSet;
    const channelsParam = encodeURIComponent(Array.from(this._channels).join(','));
    const sseBase = (API_CONFIG.SSE_BASE_URL ?? API_CONFIG.BASE_URL ?? '').replace(/\/$/, '');
    const qs = `channels=${channelsParam}` + (token ? `&token=${encodeURIComponent(token)}` : '') + `&ts=${Date.now()}`;
    const url = `${sseBase}/api/v1/events/stream?${qs}`;

    try {
      this._es = new EventSource(url, { withCredentials: false });
      this._attachCoreListeners();
      this._lastConnectedAt = Date.now();
      return this._es;
    } catch (err) {
      console.error('Error creando EventSource:', err);
      return null;
    }
  },

  _reconnect(token) {
    this.disconnect();
    const channelsParam = encodeURIComponent(Array.from(this._channels).join(','));
    const sseBase = (API_CONFIG.SSE_BASE_URL ?? API_CONFIG.BASE_URL ?? '').replace(/\/$/, '');
    const qs = `channels=${channelsParam}` + (token ? `&token=${encodeURIComponent(token)}` : '') + `&ts=${Date.now()}`;
    const url = `${sseBase}/api/v1/events/stream?${qs}`;
    try {
      this._es = new EventSource(url, { withCredentials: false });
      this._attachCoreListeners();
      this._lastConnectedAt = Date.now();
    } catch (err) {
      console.error('Error reconectando EventSource:', err);
    }
  },

  disconnect() {
    try {
      if (this._es) {
        this._es.close();
      }
    } catch (_) {}
    this._es = null;
  },

  // Suscripción a eventos del bus SSE
  on(eventName, handler) {
    if (!this._listeners.has(eventName)) {
      this._listeners.set(eventName, new Set());
      // Crear puente desde SSE hacia nuestro dispatcher la primera vez
      if (this._es) {
        this._es.addEventListener(eventName, (ev) => {
          let payload = null;
          try { payload = JSON.parse(ev.data); } catch { payload = { raw: ev.data }; }
          this._dispatch(eventName, payload);
        });
      }
    }
    this._listeners.get(eventName).add(handler);
  },

  off(eventName, handler) {
    const set = this._listeners.get(eventName);
    if (set) {
      set.delete(handler);
      if (set.size === 0) {
        this._listeners.delete(eventName);
      }
    }
  },

  _attachCoreListeners() {
    if (!this._es) return;
    if (!this._lastWarnAt) this._lastWarnAt = 0;
    // Eventos básicos
    this._es.onopen = () => {
      this._dispatch('open', { ts: Date.now() });
    };
    this._es.onerror = (err) => {
      // EventSource intentará reconectar automáticamente (el backend envía retry: 3000)
      try {
        // En algunos navegadores, err no contiene detalle; emitimos estado y URL para depuración
        const status = this._es ? this._es.readyState : 2;
        const stateMap = { 0: 'CONNECTING', 1: 'OPEN', 2: 'CLOSED' };
        const now = Date.now();
        if (now - this._lastWarnAt > 10000) { // throttling 10s
          console.warn('[SSE] onerror', { readyState: stateMap[status] });
          this._lastWarnAt = now;
        }
      } catch (_) {}
      this._dispatch('error', { error: String(err), ts: Date.now() });
    };
    // Conectar listeners para eventos conocidos
    const knownEvents = ['connected','reservas.updated','solicitudes.changed','historial.changed','error'];
    knownEvents.forEach((evt) => {
      try {
        this._es.addEventListener(evt, (ev) => {
          let payload = null;
          try { payload = JSON.parse(ev.data); } catch { payload = { raw: ev.data }; }
          this._dispatch(evt, payload);
          // Si el backend envía un error de autenticación, evitar reconexiones inútiles
          if (evt === 'error' && payload && typeof payload.message === 'string') {
            const msg = payload.message.toLowerCase();
            if (msg.includes('token') && (msg.includes('requerido') || msg.includes('inválido'))) {
              // No hacemos nada especial; el stream queda abierto por backend
              // El flujo normal de la app gestionará el logout si aplica
            }
          }
        });
      } catch (_) {}
    });
  },

  _dispatch(eventName, payload) {
    const listeners = this._listeners.get(eventName);
    if (!listeners || listeners.size === 0) return;
    for (const handler of Array.from(listeners)) {
      try { handler(payload); } catch (err) { console.error('Listener error', err); }
    }
  },

  isConnected() {
    return !!this._es && this._es.readyState === 1; // OPEN
  },

  getStatus() {
    const rs = this._es ? this._es.readyState : 2;
    const map = { 0: 'CONNECTING', 1: 'OPEN', 2: 'CLOSED' };
    return { readyState: map[rs], channels: Array.from(this._channels), lastConnectedAt: this._lastConnectedAt };
  }
};

export default realtime;