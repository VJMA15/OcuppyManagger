// Servicio para gestión de ambientes - USANDO PROXY DE VITE
import authService from './auth';

class AmbientesService {
  constructor() {
    // Usar proxy de Vite en lugar de peticiones directas
    this.baseURL = '';
  }

  async request(endpoint, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(), // Usar el servicio de auth centralizado
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data,
        message: data.message
      };
    } catch (error) {
      // No loguear 429 para evitar ruido durante cooldown
      const is429 = (error && error.status === 429) || (typeof error?.message === 'string' && error.message.includes('429'));
      if (!is429) {
        console.error('API Error:', error);
      }
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Obtener todos los ambientes
  async getAmbientes() {
    return this.request('/api/v1/ambientes');
  }

  // Obtener ambiente por ID
  async getAmbienteById(id) {
    return this.request(`/api/v1/ambientes/${id}`);
  }

  // Crear nuevo ambiente
  async createAmbiente(ambienteData) {
    return this.request('/api/v1/ambientes', {
      method: 'POST',
      body: ambienteData,
    });
  }

  // Actualizar ambiente
  async updateAmbiente(id, ambienteData) {
    return this.request(`/api/v1/ambientes/${id}`, {
      method: 'PUT',
      body: ambienteData,
    });
  }

  // Eliminar ambiente
  async deleteAmbiente(id) {
    return this.request(`/api/v1/ambientes/${id}`, {
      method: 'DELETE',
    });
  }

  // Verificar disponibilidad de ambiente
  async checkAvailability(environmentId, startDate, endDate) {
    return this.request('/api/v1/ambientes/verificar-disponibilidad', {
      method: 'POST',
      body: {
        environmentId,
        startDate,
        endDate,
      },
    });
  }

  // Obtener horarios de ambiente
  async getAmbienteSchedule(environmentId, date) {
    return this.request(`/api/v1/ambientes/${environmentId}/horarios`, {
      method: 'POST',
      body: { date },
    });
  }
}

const ambientesService = new AmbientesService();
export default ambientesService;