import API_CONFIG from '@/config/api';

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.defaultHeaders = API_CONFIG.DEFAULT_HEADERS;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Configurar headers básicos (sin token)
  getHeaders() {
    return {
      ...this.defaultHeaders,
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

    // En el método request, alrededor de la línea 60-75:
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
        throw new Error(`La solicitud tardó más de ${this.timeout/1000} segundos. Verifica tu conexión y que el servidor esté funcionando.`);
      }
      
      // Manejar errores de red
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Error de conexión. Verifica que el servidor esté ejecutándose en http://localhost:5000');
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

  // ===== MÉTODOS DE AUTENTICACIÓN SIMPLIFICADA =====
  
  // Método simplificado para verificar usuario
  async verifyUser(cc, password) {
    const response = await this.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY, { cc, password });
    
    if (response.status === 'success' && response.data?.user) {
      // Guardar datos del usuario en localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('isLoggedIn', 'true');
      
      // Guardar rol específicamente
      const userRole = response.data.user.role || response.data.user.rol || 'usuario';
      localStorage.setItem('isAdmin', userRole === 'admin' ? 'true' : 'false');
      localStorage.setItem('userRole', userRole);
      
      console.log('✅ Usuario autenticado:', {
        nombre: response.data.user.nombre,
        rol: userRole,
        isAdmin: userRole === 'admin'
      });
    }
    
    return response;
  }

  // Verificar si está "logueado" (datos guardados)
  isAuthenticated() {
    return localStorage.getItem('isLoggedIn') === 'true' && localStorage.getItem('user');
  }

  // Obtener datos del usuario guardados
  getUser() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  // Limpiar datos de autenticación
  logout() {
    // Limpiar todos los datos de autenticación
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    
    console.log('🔓 API: Datos de autenticación limpiados');
  }

  // ===== MÉTODOS PARA AMBIENTES =====
  // ===== MÉTODOS PARA AMBIENTES =====
  async getAmbientes() {
    return this.get(API_CONFIG.ENDPOINTS.AMBIENTES.ALL);
  }
  
  async getAmbienteById(id) {
    return this.get(API_CONFIG.ENDPOINTS.AMBIENTES.BY_ID(id));
  }
  
  async createAmbiente(ambienteData) {
    return this.post(API_CONFIG.ENDPOINTS.AMBIENTES.CREATE, ambienteData);
  }
  
  async updateAmbiente(id, ambienteData) {
    return this.put(API_CONFIG.ENDPOINTS.AMBIENTES.UPDATE(id), ambienteData);
  }
  
  async deleteAmbiente(id) {
    return this.delete(API_CONFIG.ENDPOINTS.AMBIENTES.DELETE(id));
  }

  // ===== MÉTODOS PARA RESERVAS =====
  // ===== MÉTODOS PARA RESERVAS =====
  async getReservas() {
    return this.get(API_CONFIG.ENDPOINTS.RESERVAS.ALL);
  }
  
  async getReservaById(id) {
    return this.get(API_CONFIG.ENDPOINTS.RESERVAS.BY_ID(id));
  }
  
  async createReserva(reservaData) {
    return this.post(API_CONFIG.ENDPOINTS.RESERVAS.CREATE, reservaData);
  }
  
  async updateReserva(id, reservaData) {
    return this.put(API_CONFIG.ENDPOINTS.RESERVAS.UPDATE(id), reservaData);
  }
  
  async deleteReserva(id) {
    return this.delete(API_CONFIG.ENDPOINTS.RESERVAS.DELETE(id));
  }
  
  async getMyReservas() {
    return this.get(API_CONFIG.ENDPOINTS.RESERVAS.MY_RESERVAS);
  }

  // ===== MÉTODOS PARA USUARIOS =====
  async getUsers() {
    return this.get(API_CONFIG.ENDPOINTS.USERS.ALL);
  }

  async getUserById(id) {
    return this.get(API_CONFIG.ENDPOINTS.USERS.BY_ID(id));
  }

  async getUserProfile() {
    return this.get(API_CONFIG.ENDPOINTS.USERS.PROFILE);
  }

  // ===== MÉTODOS PARA REGISTROS =====
  async getRegistros() {
    return this.get(API_CONFIG.ENDPOINTS.REGISTROS.ALL);
  }

  async getRegistroById(id) {
    return this.get(API_CONFIG.ENDPOINTS.REGISTROS.BY_ID(id));
  }

  async createRegistro(registroData) {
    return this.post(API_CONFIG.ENDPOINTS.REGISTROS.CREATE, registroData);
  }

  // ===== MÉTODOS PARA BITÁCORA =====
  async getBitacora() {
    return this.get(API_CONFIG.ENDPOINTS.BITACORA.ALL);
  }

  async getBitacoraById(id) {
    return this.get(API_CONFIG.ENDPOINTS.BITACORA.BY_ID(id));
  }

  // ===== MÉTODO DE PRUEBA DE CONEXIÓN =====
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

// Crear instancia única del servicio
const apiService = new ApiService();

export default apiService;

// Mantener todo como está actualmente
// Agregar comentario: "// DEPRECATED: Use specific services instead"