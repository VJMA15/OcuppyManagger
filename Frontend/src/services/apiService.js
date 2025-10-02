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

  // Método principal para hacer peticiones con interceptor automático
  async makeRequest(url, options = {}) {
    const headers = this.getHeaders();
    const config = {
      method: 'GET',
      headers,
      ...options,
    };

    console.log(`🚀 [ApiService] Haciendo petición a: ${url}`);
    console.log(`📋 [ApiService] Headers:`, headers);
    console.log(`⚙️ [ApiService] Config:`, config);

    try {
      const response = await fetch(`${this.baseURL}${url}`, config);
      
      console.log(`📊 [ApiService] Respuesta recibida:`, {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });

      // Si recibimos 401 (Unauthorized), intentar renovar el token
      if (response.status === 401) {
        console.log('🔄 [ApiService] Token expirado (401), intentando renovar...');
        
        try {
          // Intentar renovar el token
          const refreshResponse = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authService.getToken()}`
            }
          });

          console.log(`🔄 [ApiService] Respuesta de renovación:`, {
            status: refreshResponse.status,
            statusText: refreshResponse.statusText
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            console.log('✅ [ApiService] Token renovado exitosamente');
            
            // Actualizar el token en el servicio de autenticación
            if (refreshData.token) {
              authService.setToken(refreshData.token);
              console.log('💾 [ApiService] Nuevo token guardado');
              
              // Reintentar la petición original con el nuevo token
              const newHeaders = this.getHeaders();
              const retryConfig = {
                ...config,
                headers: newHeaders
              };
              
              console.log('🔄 [ApiService] Reintentando petición original con nuevo token...');
              const retryResponse = await fetch(`${this.baseURL}${url}`, retryConfig);
              
              console.log(`📊 [ApiService] Respuesta del reintento:`, {
                status: retryResponse.status,
                statusText: retryResponse.statusText
              });
              
              return retryResponse;
            }
          } else {
            console.log('❌ [ApiService] Error al renovar token, limpiando sesión...');
            // Si no se puede renovar el token, limpiar la sesión
            authService.logout();
            window.location.href = '/login';
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          }
        } catch (refreshError) {
          console.error('❌ [ApiService] Error en renovación de token:', refreshError);
          authService.logout();
          window.location.href = '/login';
          throw new Error('Error al renovar la sesión. Por favor, inicia sesión nuevamente.');
        }
      }

      // Si recibimos 403 (Forbidden), es un problema de permisos, no de token
      if (response.status === 403) {
        console.error('🚫 [ApiService] Error 403 - Permisos insuficientes');
        console.error('🔍 [ApiService] Detalles del usuario:', authService.getUser());
        console.error('🔍 [ApiService] Token actual:', authService.getToken()?.substring(0, 20) + '...');
        
        const errorData = await response.text();
        console.error('📄 [ApiService] Respuesta del servidor:', errorData);
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('❌ [ApiService] Error en petición:', error);
      throw error;
    }
  }

  // Método de petición con manejo de errores mejorado
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: 'GET',
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await Promise.race([
        fetch(url, config),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), this.timeout)
        ),
      ]);

      if (!response.ok) {
        // Si es un error 401, intentar renovar el token automáticamente
        if (response.status === 401) {
          console.log('🔄 Token expirado, intentando renovar automáticamente...');
          
          try {
            // Intentar renovar el token directamente usando fetch
            const refreshResponse = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authService.getToken()}`
              }
            });
            
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              
              if (refreshData.success && refreshData.token) {
                // Actualizar el token en el servicio de autenticación
                authService.setToken(refreshData.token);
                
                // Reintentar la petición original con el nuevo token
                const newConfig = {
                  ...config,
                  headers: this.getHeaders() // Obtener headers actualizados con el nuevo token
                };
                
                console.log('🔄 Reintentando petición original...');
                const retryResponse = await fetch(url, newConfig);
                
                if (!retryResponse.ok) {
                  throw new Error(`HTTP error! status: ${retryResponse.status}`);
                }
                
                return retryResponse;
              } else {
                throw new Error('Token de renovación inválido');
              }
            } else {
              throw new Error('Error al renovar token');
            }
          } catch (refreshError) {
            console.error('❌ Error al renovar token:', refreshError);
            // Limpiar sesión si falla la renovación
            authService.logout();
            throw new Error('Error al renovar la sesión. Por favor, inicia sesión nuevamente.');
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      return response;
    } catch (error) {
      console.error('❌ API Request failed:', error);
      throw error;
    }
  }

  // Manejar errores de autenticación
  handleAuthError() {
    console.log('🔓 Limpiando sesión por error de autenticación...');
    
    // Limpiar tokens y datos de usuario
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userRole');
    
    // Redirigir al login después de un breve delay
    setTimeout(() => {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }, 1000);
  }

  // Métodos HTTP básicos
  async get(endpoint) {
    const response = await this.request(endpoint, { method: 'GET' });
    return response.json();
  }

  async post(endpoint, data) {
    const response = await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async put(endpoint, data) {
    const response = await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async patch(endpoint, data) {
    const response = await this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async delete(endpoint) {
    const response = await this.request(endpoint, { method: 'DELETE' });
    return response.json();
  }
}

export default ApiService;