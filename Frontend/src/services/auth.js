import Cookies from 'js-cookie';
// Remover esta línea problemática:
// import jwt from 'jsonwebtoken';

// Usar solo jwt-decode para el frontend
import { jwtDecode } from 'jwt-decode';

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
    Cookies.remove(this.TOKEN_KEY);
    Cookies.remove(this.USER_KEY);
  }

  // Login con token
  login(token, userData) {
    if (this.setToken(token)) {
      this.setUser(userData);
      return true;
    }
    return false;
  }

  // Obtener headers de autorización para requests
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export default new AuthService();