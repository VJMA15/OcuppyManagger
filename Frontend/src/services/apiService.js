import { API_CONFIG } from '../config/api';
import authService from './auth';

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.defaultHeaders = API_CONFIG.DEFAULT_HEADERS;
    this.timeout = API_CONFIG.TIMEOUT;
    // Registro global compartido para deduplicación, caché y cooldown
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

  // Configurar headers con autenticación
  getHeaders() {
    return {
      ...this.defaultHeaders,
      ...authService.getAuthHeaders(),
    };
  }

  // Método base para hacer peticiones
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };
    const method = options.method || 'GET';
    const key = `${method}:${url}`;

    console.log('🌐 API Request:', {
      url,
      method,
      headers: config.headers,
      timeout: this.timeout
    });

    try {
      // Respetar cooldown global si existe (ej. tras 429)
      const now = Date.now();
      if (this.registry.cooldownUntil && now < this.registry.cooldownUntil) {
        // Intentar servir desde caché si disponible
        const cached = this.registry.cache.get(key);
        if (cached && cached.expiresAt > now) {
          return cached.data;
        }
        // Si no hay caché, evitamos golpear la API
        const err = new Error('HTTP error! status: 429 (cooldown active)');
        err.status = 429;
        err.retryAfterMs = this.registry.cooldownUntil - now;
        throw err;
      }

      // Devolver misma promesa si hay una petición en curso al mismo endpoint
      if (this.registry.inFlight.has(key)) {
        return await this.registry.inFlight.get(key);
      }

      // Servir caché para GET si está fresco
      if (method === 'GET') {
        const cached = this.registry.cache.get(key);
        if (cached && cached.expiresAt > now) {
          return cached.data;
        }
      }

      const controller = new AbortController();
      
      // Configurar timeout
      const timeoutId = setTimeout(() => {
        console.log('⏰ Request timeout, aborting...');
        controller.abort();
      }, this.timeout);
      
      const fetchPromise = fetch(url, {
        method: options.method || 'GET',
        headers: config.headers,
        body: options.body,
        signal: controller.signal,
      });

      // Registrar promesa en vuelo
      this.registry.inFlight.set(key, fetchPromise.then(async (response) => {
        clearTimeout(timeoutId);

        console.log('✅ API Response:', {
          status: response.status,
          ok: response.ok,
          url: response.url
        });

        const contentType = response.headers.get('content-type') || '';

        // Manejar errores HTTP con parseo seguro
        if (!response.ok) {
          let errorPayload = null;
          if (contentType.includes('application/json')) {
            errorPayload = await response.json().catch(() => null);
          } else {
            const text = await response.text().catch(() => '');
            try { errorPayload = JSON.parse(text); } catch { errorPayload = { raw: text }; }
          }
          const message = (errorPayload && (errorPayload.message || errorPayload.error)) || `HTTP error! status: ${response.status}`;
          const err = new Error(message);
          err.status = response.status;
          // Respetar Retry-After si está presente
          const retryAfter = response.headers.get('Retry-After');
          if (retryAfter) {
            const trimmed = retryAfter.trim();
            let raMs = 60000; // fallback por defecto
            if (/^\d+$/.test(trimmed)) {
              // Formato delta-seconds
              raMs = parseInt(trimmed, 10) * 1000;
            } else {
              // Formato fecha HTTP, ej: Wed, 21 Oct 2015 07:28:00 GMT
              const dateMs = Date.parse(trimmed);
              if (!Number.isNaN(dateMs)) {
                const delta = dateMs - Date.now();
                raMs = delta > 0 ? delta : 60000;
              }
            }
            err.retryAfterMs = raMs;
            // Activar cooldown global
            this.registry.cooldownUntil = Date.now() + raMs;
          } else if (response.status === 429) {
            // Si no hay Retry-After, establecer 60s por defecto
            err.retryAfterMs = 60000;
            this.registry.cooldownUntil = Date.now() + 60000;
          }
          throw err;
        }

        // Parseo del cuerpo con detección de tipo
        let data = null;
        if (contentType.includes('application/json')) {
          data = await response.json().catch(() => null);
        } else {
          const text = await response.text().catch(() => '');
          try { data = JSON.parse(text); } catch { data = { raw: text }; }
        }

        console.log('📦 API Data:', data);

        // Guardar en caché para GET
        if (method === 'GET') {
          const ttl = this.registry.defaultCacheTtlMs || 60000;
          this.registry.cache.set(key, {
            data,
            expiresAt: Date.now() + ttl,
          });
        }

        return data;
      }).finally(() => {
        // Limpiar registro inFlight
        this.registry.inFlight.delete(key);
      }));

      const result = await this.registry.inFlight.get(key);
      return result;
    } catch (error) {
      // Suprimir ruido de logs para 429 (cooldown activo)
      const is429 = (error && error.status === 429) || (typeof error?.message === 'string' && error.message.includes('429'));
      if (!is429) {
        console.error('❌ API Error:', error);
      }
      
      if (error.name === 'AbortError') {
        throw new Error('La solicitud tardó demasiado tiempo. Verifica tu conexión.');
      }
      
      // Manejar errores de red
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Error de conexión. Verifica que el servidor esté ejecutándose.');
      }
      
      throw error;
    }
  }

  // Métodos HTTP básicos
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Método de prueba de conexión
  async testConnection() {
    try {
      const response = await this.get('/');
      return {
        success: true,
        data: response,
        message: 'Conexión exitosa con el backend'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error de conexión con el backend'
      };
    }
  }
}

export default ApiService;