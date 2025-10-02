import { API_CONFIG } from '../config/api';
import authService from './auth';

class ApiClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Configurar headers con autenticación
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...authService.getAuthHeaders(),
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Verificar si la respuesta tiene contenido JSON antes de intentar parsear
        const contentType = response.headers.get('content-type');
        let errorData = {};
        
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text();
          if (text.trim()) {
            try {
              errorData = JSON.parse(text);
            } catch (parseError) {
              console.error('Error parsing error JSON:', parseError);
              errorData = { message: text };
            }
          }
        } else {
          const text = await response.text();
          errorData = { message: text || `HTTP error! status: ${response.status}` };
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, { 
      method: 'POST', 
      body: data,
      ...options 
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, { 
      method: 'PUT', 
      body: data,
      ...options 
    });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, { 
      method: 'PATCH', 
      body: data,
      ...options 
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

const apiClient = new ApiClient();
export default apiClient;