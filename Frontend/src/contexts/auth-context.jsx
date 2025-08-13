import PropTypes from 'prop-types';
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '@/services/auth';
import apiService from '@/services/api';

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

  // Login
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await apiService.login(credentials);
      
      if (response.success && response.token) {
        // Guardar token y datos del usuario
        const loginSuccess = authService.login(response.token, response.user);
        
        if (loginSuccess) {
          setUser(response.user);
          setIsAuthenticated(true);
          return { success: true, user: response.user };
        } else {
          throw new Error('Error al guardar la sesión');
        }
      } else {
        throw new Error(response.message || 'Credenciales inválidas');
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        message: error.message || 'Error de conexión' 
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