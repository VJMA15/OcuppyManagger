import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import sessionManager from './sessionManager';
import { API_CONFIG } from '../config/api';

class AuthService {
  constructor() {
    this.TOKEN_KEY = 'auth_token';
    this.USER_KEY = 'user_data';
  }

  // Guardar token en cookie segura
  setToken(token) {
    try {
      Cookies.set(this.TOKEN_KEY, token, {
        expires: 7, // 7 días
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        httpOnly: false // Para acceso desde JS
      });
      return true;
    } catch (error) {
      console.error('Error al guardar token:', error);
      return false;
    }
  }

  // Obtener token
  getToken() {
    return Cookies.get(this.TOKEN_KEY);
  }

  // Verificar si el token es válido
  isTokenValid() {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Cambiar jwt.decode por jwtDecode
      const decoded = jwtDecode(token);
      if (!decoded || !decoded.exp) return false;
      
      // Verificar si el token ha expirado
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      console.error('Error al verificar token:', error);
      return false;
    }
  }

  // Decodificar token y obtener datos del usuario
  getUserFromToken() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      return decoded;
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }

  // Guardar datos del usuario
  setUser(userData) {
    try {
      Cookies.set(this.USER_KEY, JSON.stringify(userData), {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    } catch (error) {
      console.error('Error al guardar datos del usuario:', error);
    }
  }

  // Obtener datos del usuario
  getUser() {
    try {
      const userData = Cookies.get(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      return null;
    }
  }

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    return this.isTokenValid() && this.getUser() !== null;
  }

  // Cerrar sesión
  logout() {
    // Detener el gestor de sesión
    sessionManager.stopSession();
    
    Cookies.remove(this.TOKEN_KEY);
    Cookies.remove(this.USER_KEY);
    
    console.log('🔓 Sesión cerrada correctamente');
  }

  // Login con token
  login(token, userData) {
    if (this.setToken(token)) {
      this.setUser(userData);
      
      // Iniciar el gestor de sesión automáticamente
      sessionManager.startSession();
      
      console.log('🔐 Sesión iniciada con gestión automática de timeout');
      return true;
    }
    return false;
  }

  // Obtener headers de autorización para requests
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Login con backend real
  async loginWithBackend(cc, password) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.VERIFY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cc, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en el login');
      }

      if (data.success && data.user) {
        // Guardar datos del usuario
        const userData = data.user;
        this.setUser(userData);
        
        // Usar el token JWT del backend
        if (data.token) {
          this.setToken(data.token);
        }
        
        // Iniciar gestión de sesión
        sessionManager.startSession();
        
        console.log('🔐 Login exitoso con backend');
        return { success: true, user: userData };
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      return { success: false, error: error.message };
    }
  }

  // Registro con backend real
  async registerWithBackend(userData) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro');
      }

      if (data.status === 'success') {
        console.log('✅ Registro exitoso');
        return { success: true, message: data.message };
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('❌ Error en registro:', error);
      return { success: false, error: error.message };
    }
  }

  // Verificar conexión con backend
  async checkBackendConnection() {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api/v1', '')}`, {
        method: 'GET',
        timeout: 3000,
      });
      return response.ok;
    } catch (error) {
      console.error('❌ Backend no disponible:', error);
      return false;
    }
  }
}

export default new AuthService();