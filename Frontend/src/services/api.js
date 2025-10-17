import authService from './auth';
import { API_CONFIG } from '../config/api';

// Base URL parametrizada por entorno (VITE_API_BASE_URL)
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || '';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    // Registro global compartido para deduplicación/caché/cooldown
    if (typeof window !== 'undefined') {
      if (!window.__apiGlobalRegistry) {
        window.__apiGlobalRegistry = {
          inFlight: new Map(),
          cache: new Map(),
          cooldownUntil: 0,
          defaultCacheTtlMs: 60000, // 60s
        };
      }
      this.registry = window.__apiGlobalRegistry;
    } else {
      this.registry = {
        inFlight: new Map(),
        cache: new Map(),
        cooldownUntil: 0,
        defaultCacheTtlMs: 60000,
      };
    }
  }

  // Método para hacer requests con JWT
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const method = (options.method || 'GET').toUpperCase();
    const key = `${method}:${url}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(), // Incluir JWT automáticamente
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      // Respetar cooldown global si está activo
      const now = Date.now();
      if (this.registry.cooldownUntil && now < this.registry.cooldownUntil) {
        const cached = this.registry.cache.get(key);
        if (cached && cached.expiresAt > now) {
          return cached.data;
        }
        const err = new Error('HTTP error! status: 429 (cooldown active)');
        err.status = 429;
        err.retryAfterMs = this.registry.cooldownUntil - now;
        throw err;
      }

      // Deduplicar peticiones en curso al mismo recurso
      if (this.registry.inFlight.has(key)) {
        return await this.registry.inFlight.get(key);
      }

      // Servir caché fresca para GET
      if (method === 'GET') {
        const cached = this.registry.cache.get(key);
        if (cached && cached.expiresAt > now) {
          return cached.data;
        }
      }

      const fetchPromise = fetch(url, config);
      this.registry.inFlight.set(key, fetchPromise.then(async (response) => {
        
        // Si el token ha expirado (401), cerrar sesión sin redirección imperativa
        if (response.status === 401) {
          authService.logout();
          const err = new Error('Sesión expirada o no autorizado');
          err.status = 401;
          throw err;
        }

        const contentType = response.headers.get('content-type') || '';
        let data = null;

        if (!response.ok) {
          if (contentType.includes('application/json')) {
            data = await response.json().catch(() => null);
          } else {
            const text = await response.text().catch(() => '');
            try { data = JSON.parse(text); } catch { data = { raw: text }; }
          }
          const message = (data && (data.message || data.error)) || `HTTP error! status: ${response.status}`;
          const err = new Error(message);
          err.status = response.status;
          const retryAfter = response.headers.get('Retry-After');
          if (retryAfter) {
            const trimmed = retryAfter.trim();
            let raMs = 60000;
            if (/^\d+$/.test(trimmed)) {
              raMs = parseInt(trimmed, 10) * 1000; // delta-seconds
            } else {
              const dateMs = Date.parse(trimmed);
              if (!Number.isNaN(dateMs)) {
                const delta = dateMs - Date.now();
                raMs = delta > 0 ? delta : 60000;
              }
            }
            err.retryAfterMs = raMs;
            this.registry.cooldownUntil = Date.now() + raMs;
          } else if (response.status === 429) {
            err.retryAfterMs = 60000;
            this.registry.cooldownUntil = Date.now() + 60000;
          }
          throw err;
        }

        if (contentType.includes('application/json')) {
          data = await response.json().catch(() => null);
        } else {
          const text = await response.text().catch(() => '');
          try { data = JSON.parse(text); } catch { data = { raw: text }; }
        }
        // Cachear respuestas GET brevemente
        if (method === 'GET') {
          this.registry.cache.set(key, {
            data,
            expiresAt: Date.now() + this.registry.defaultCacheTtlMs,
          });
        }
        return data;
      }).finally(() => {
        this.registry.inFlight.delete(key);
      }));

      const result = await this.registry.inFlight.get(key);
      return result;
    } catch (error) {
      // Evitar spam de logs cuando el cooldown/rate limit está activo
      const is429 = (error && error.status === 429) || (typeof error?.message === 'string' && error.message.includes('429'));
      if (!is429) {
        console.error(`Error en ${endpoint}:`, error);
      }
      // Reempaquetar AbortError u otros si aplica
      throw error;
    }
  }

  // Login (no requiere JWT)
  async login(credentials) {
    try {
      // Normalizar credenciales
      const normalized = {
        cc: typeof credentials?.cc === 'string' ? credentials.cc.trim() : String(credentials?.cc || '').trim(),
        password: typeof credentials?.password === 'string' ? credentials.password.trim() : String(credentials?.password || '').trim(),
      };
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.VERIFY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(normalized),
      });

      const data = await response.json();
      
      if (!response.ok) {
        const status = response.status;
        if (status === 401 || status === 404) {
          return { success: false, error: 'C.C o contraseña incorrecta' };
        }
        if (status === 429) {
          return { success: false, error: 'En pausa por límite de tasa. Reintentar automáticamente.' };
        }
        // Para otros códigos, devolver mensaje del servidor si existe
        const validationMsg = Array.isArray(data?.errors) ? data.errors.map((e) => e.msg).join('. ') : null;
        const serverMsg = data?.message || data?.error;
        const msg = validationMsg || serverMsg || `Error en login (HTTP ${status})`;
        return { success: false, error: msg };
      }

      return data;
    } catch (error) {
      const is429 = (error && error.status === 429) || (typeof error?.message === 'string' && error.message.includes('429'));
      if (!is429) {
        console.error('Error en login:', error);
      }
      throw error;
    }
  }

  // Registro de usuarios
  async signup(userData) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        const validationMsg = Array.isArray(data?.errors) ? data.errors.map((e) => e.msg).join('. ') : null;
        const serverMsg = data?.message || data?.error;
        throw new Error(validationMsg || serverMsg || 'Error en registro');
      }

      return data;
    } catch (error) {
      console.error('Error en signup:', error);
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      await this.request('/api/v1/auth/logout', { method: 'POST' });
      return { success: true };
    } catch (error) {
      console.error('Error en logout:', error);
      return { success: false, message: error.message };
    }
  }

  // Métodos HTTP básicos
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  async post(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
      ...options
    });
  }

  async put(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data,
      ...options
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }

  // Métodos protegidos que requieren JWT
  async getAmbientes() {
    return this.request('/api/v1/ambientes');
  }

  async getReservas() {
    return this.request('/api/v1/reservas');
  }

  async createReserva(reservaData) {
    return this.request('/api/v1/reservas', {
      method: 'POST',
      body: reservaData,
    });
  }

  async getDashboardStats() {
    return this.request('/api/v1/dashboard/stats');
  }
}

export default new ApiService();