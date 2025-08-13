import authService from './auth';
import apiMock from './api-mock';

const USE_MOCK = true; // Cambiar a false cuando uses API real
const API_BASE_URL = 'http://localhost:3001/api';

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
      
      // Si el token ha expirado (401), cerrar sesión
      if (response.status === 401) {
        authService.logout();
        window.location.href = '/login';
        throw new Error('Sesión expirada');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error en la petición');
      }

      return data;
    } catch (error) {
      console.error(`Error en ${endpoint}:`, error);
      throw error;
    }
  }

  // Login (no requiere JWT)
  async login(credentials) {
    if (USE_MOCK) {
      return apiMock.login(credentials);
    }
    
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
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

  // Logout
  async logout() {
    if (USE_MOCK) {
      return apiMock.logout();
    }
    
    try {
      await this.request('/auth/logout', { method: 'POST' });
      return { success: true };
    } catch (error) {
      console.error('Error en logout:', error);
      return { success: false, message: error.message };
    }
  }

  // Métodos protegidos que requieren JWT
  async getAmbientes() {
    if (USE_MOCK) {
      return apiMock.getAmbientes();
    }
    return this.request('/ambientes');
  }

  async getReservas() {
    if (USE_MOCK) {
      return apiMock.getReservas();
    }
    return this.request('/reservas');
  }

  async createReserva(reservaData) {
    if (USE_MOCK) {
      return apiMock.createReserva(reservaData);
    }
    return this.request('/reservas', {
      method: 'POST',
      body: reservaData,
    });
  }

  async getDashboardStats() {
    if (USE_MOCK) {
      return apiMock.getDashboardStats();
    }
    return this.request('/dashboard/stats');
  }
}

export default new ApiService();