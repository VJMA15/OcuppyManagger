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

      const contentType = response.headers.get('content-type') || '';
      let data = null;
      if (contentType.includes('application/json')) {
        data = await response.json().catch(() => null);
      } else {
        const text = await response.text().catch(() => '');
        try { data = JSON.parse(text); } catch { data = { raw: text }; }
      }

      if (!response.ok) {
        const status = response.status;
        // Mensajes amigables sin lanzar para casos comunes
        if (status === 401 || status === 404) {
          return { success: false, error: 'C.C o contraseña incorrecta' };
        }
        if (status === 429) {
          // Evitar ruido de consola y devolver mensaje de pausa
          return { success: false, error: 'En pausa por límite de tasa. Reintentar automáticamente.' };
        }
        throw new Error(data?.error || 'Error en el login');
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
      // Suprimir logs para 429
      const is429 = (error && error.status === 429) || (typeof error?.message === 'string' && error.message.includes('429'));
      if (!is429) {
        console.error('❌ Error en login:', error);
      }
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

      const contentType2 = response.headers.get('content-type') || '';
      let data2 = null;
      if (contentType2.includes('application/json')) {
        data2 = await response.json().catch(() => null);
      } else {
        const text = await response.text().catch(() => '');
        try { data2 = JSON.parse(text); } catch { data2 = { raw: text }; }
      }
      if (!response.ok) {
        throw new Error((data2 && (data2.message || data2.error)) || 'Error en el registro');
      }

      if (data2 && data2.status === 'success') {
        console.log('✅ Registro exitoso');
        return { success: true, message: data2.message };
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