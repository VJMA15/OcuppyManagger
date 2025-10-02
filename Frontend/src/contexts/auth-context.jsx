import PropTypes from 'prop-types';
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth';
import apiService from '../services/api';
import sessionManager from '../services/sessionManager';
import { API_CONFIG } from '../config/api';

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
        throw new Error(response.error || 'Credenciales inválidas');
      }
    } catch (error) {
      console.error('❌ Error en login desde contexto:', error);
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

  // Renovar token automáticamente
  const refreshToken = async () => {
    try {
      console.log('🔄 Intentando renovar token...');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success && data.token) {
        // Actualizar token en el servicio de auth
        authService.setToken(data.token);
        
        // Si hay datos de usuario actualizados, actualizarlos también
        if (data.user) {
          const updatedUser = { ...user, ...data.user };
          setUser(updatedUser);
          authService.setUser(updatedUser);
        }
        
        console.log('✅ Token renovado exitosamente');
        return { success: true, token: data.token };
      } else {
        throw new Error(data.error || 'Error al renovar token');
      }
    } catch (error) {
      console.error('❌ Error al renovar token:', error);
      
      // Si falla la renovación, cerrar sesión
      logout();
      
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
    refreshToken
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