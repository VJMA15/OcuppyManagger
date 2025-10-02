import authService from './auth';

// Configuración para usar proxy de Vite
const API_BASE_URL = '';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Método para hacer requests con JWT
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
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
      const response = await fetch(url, config);
      
      // Si el token ha expirado (401), redirigir a página de autenticación
      if (response.status === 401) {
        authService.logout();
        window.location.href = '/auth-required';
        throw new Error('Sesión expirada o no autorizado');
      }

      // Verificar si la respuesta tiene contenido antes de intentar parsear JSON
      const contentType = response.headers.get('content-type');
      let data = null;
      
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        if (text.trim()) {
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            throw new Error(`Invalid JSON response: ${text}`);
          }
        } else {
          data = { success: false, message: 'Empty response from server' };
        }
      } else {
        // Si no es JSON, obtener como texto
        const text = await response.text();
        data = { success: false, message: text || `HTTP error! status: ${response.status}` };
      }
      
      if (!response.ok) {
        throw new Error(data?.message || 'Error en la petición');
      }

      return data;
    } catch (error) {
      console.error(`Error en ${endpoint}:`, error);
      throw error;
    }
  }

  // Login (no requiere JWT)
  async login(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error en login');
      }

      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  // Registro de usuarios
  async signup(userData) {
    try {
      const response = await fetch(`${this.baseURL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error en registro');
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