import PropTypes from 'prop-types';
import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth';
import apiService from '../services/api';
import sessionManager from '../services/sessionManager';

const AuthContext = createContext();

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const checkAuth = () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = authService.getUser();
          const tokenData = authService.getUserFromToken();
          
          setUser({ ...userData, ...tokenData });
          setIsAuthenticated(true);
          
          // Iniciar el gestor de sesión para sesiones existentes
          sessionManager.startSession();
          console.log('🔄 Sesión existente detectada, iniciando gestión de timeout');
        } else {
          // Token inválido o expirado
          authService.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Suscripción a eventos globales de autenticación
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
    };
    const handleLogin = (e) => {
      const detailUser = e?.detail?.user || authService.getUser();
      setUser(detailUser);
      setIsAuthenticated(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:logout', handleLogout);
      window.addEventListener('auth:login', handleLogin);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth:logout', handleLogout);
        window.removeEventListener('auth:login', handleLogin);
      }
    };
  }, []);

  // Login con backend real
  const login = async (credentials) => {
    try {
      setLoading(true);
      
      // Usar el nuevo método de autenticación con backend real
      const response = await authService.loginWithBackend(credentials.cc, credentials.password);
      
      if (response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        console.log('🔐 Login exitoso desde contexto');
        return { success: true, user: response.user };
      } else {
        // No lanzar: devolver mensaje amigable
        const message = response.error || 'C.C o contraseña incorrecta';
        return { success: false, message };
      }
    } catch (error) {
      // Evitar ruido si es 429
      const is429 = (error && error.status === 429) || (typeof error?.message === 'string' && error.message.includes('429'));
      if (!is429) {
        console.error('❌ Error en login desde contexto:', error);
      }
      return { 
        success: false, 
        message: error.message || 'Error de conexión con el servidor' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Actualizar datos del usuario
  const updateUser = (userData) => {
    authService.setUser(userData);
    setUser(userData);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;