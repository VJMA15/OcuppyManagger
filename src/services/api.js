import API_CONFIG from '@/config/api';

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.defaultHeaders = API_CONFIG.DEFAULT_HEADERS;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Obtener token de localStorage
  getToken() {
    return localStorage.getItem('token');
  }

  // Configurar headers con token si existe
  // Comentar el método que envía tokens automáticamente
  getHeaders() {
    // const token = this.getToken();
    return {
      ...this.defaultHeaders,
      // ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Comentar el método getToken
  // getToken() {
  //   return localStorage.getItem('token');
  // }

  // Método base para hacer peticiones
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      timeout: this.timeout,
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      // Manejar errores HTTP
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  // Métodos HTTP
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

  // Métodos específicos para autenticación
  async login(credentials) {
    const response = await this.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  }

  async loginWithCC(cc, password) {
    const credentials = { cc, password };
    return this.login(credentials);
  }

  async logout() {
    try {
      await this.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {});
    } catch (error) {
      console.warn('Error during logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    return !!this.getToken();
  }

  // Obtener información del usuario
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

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