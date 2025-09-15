import { API_CONFIG } from '../config/api';
import authService from './auth';

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.defaultHeaders = API_CONFIG.DEFAULT_HEADERS;
    this.timeout = API_CONFIG.TIMEOUT;
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

    console.log('🌐 API Request:', {
      url,
      method: options.method || 'GET',
      headers: config.headers,
      timeout: this.timeout
    });

    try {
      const controller = new AbortController();
      
      // Configurar timeout
      const timeoutId = setTimeout(() => {
        console.log('⏰ Request timeout, aborting...');
        controller.abort();
      }, this.timeout);
      
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: config.headers,
        body: options.body,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      console.log('✅ API Response:', {
        status: response.status,
        ok: response.ok,
        url: response.url
      });

      // Manejar errores HTTP
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 API Data:', data);
      return data;
    } catch (error) {
      console.error('❌ API Error:', error);
      
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