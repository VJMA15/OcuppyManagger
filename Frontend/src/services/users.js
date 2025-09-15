import { API_CONFIG } from '../config/api';
import authService from './auth';

class UsersService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Obtener headers con autenticación
  getHeaders() {
    return {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...authService.getAuthHeaders()
    };
  }

  // Obtener todos los usuarios
  async getAllUsers() {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.USERS.ALL}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener usuarios');
      }

      if (data.success) {
        console.log('✅ Usuarios obtenidos exitosamente');
        return { success: true, users: data.data.users };
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('❌ Error al obtener usuarios:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener usuario por ID
  async getUserById(id) {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.USERS.BY_ID(id)}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener usuario');
      }

      if (data.success) {
        console.log('✅ Usuario obtenido exitosamente');
        return { success: true, user: data.data.user };
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('❌ Error al obtener usuario:', error);
      return { success: false, error: error.message };
    }
  }

  // Crear nuevo usuario
  async createUser(userData) {
    try {
      // Remover passwordConfirm antes de enviar al backend
      const { passwordConfirm, ...dataToSend } = userData;
      
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Error al crear usuario');
      }

      if (data.success) {
        console.log('✅ Usuario creado exitosamente');
        return { success: true, user: data.user, token: data.token, message: 'Usuario creado exitosamente' };
      } else {
        throw new Error(data.error || 'Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('❌ Error al crear usuario:', error);
      return { success: false, error: error.message };
    }
  }

  // Actualizar usuario
  async updateUser(id, userData) {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.USERS.BY_ID(id)}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar usuario');
      }

      if (data.success) {
        console.log('✅ Usuario actualizado exitosamente');
        return { success: true, user: data.data.user, message: 'Usuario actualizado exitosamente' };
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('❌ Error al actualizar usuario:', error);
      return { success: false, error: error.message };
    }
  }

  // Eliminar usuario
  async deleteUser(id) {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.USERS.BY_ID(id)}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar usuario');
      }

      console.log('✅ Usuario eliminado exitosamente');
      return { success: true, message: 'Usuario eliminado exitosamente' };
    } catch (error) {
      console.error('❌ Error al eliminar usuario:', error);
      return { success: false, error: error.message };
    }
  }

  // Verificar conexión con el backend
  async checkConnection() {
    try {
      const response = await fetch(`${this.baseURL}/users`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return response.ok;
    } catch (error) {
      console.error('❌ Error de conexión con backend de usuarios:', error);
      return false;
    }
  }
}

// Crear instancia única del servicio
const usersService = new UsersService();
export default usersService;