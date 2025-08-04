import { useState, useEffect } from 'react';
import apiService from '@/services/api';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si el usuario está autenticado al cargar
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (cc, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.loginWithCC(cc, password);
      
      if (response.data?.token) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
      setIsAuthenticated(false);
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.warn('Error durante logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const getCurrentUser = () => {
    return user;
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    logout,
    getCurrentUser
  };
};

export default useAuth; 