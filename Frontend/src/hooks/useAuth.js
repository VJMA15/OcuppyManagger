import { useState, useEffect } from 'react';
import apiService from '@/services/api';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si hay datos guardados al cargar
  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const userData = localStorage.getItem('user');
      
      if (isLoggedIn && userData) {
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
      console.log('🔍 Verificando usuario con CC:', cc);
      
      const response = await apiService.verifyUser(cc, password);
      
      if (response.status === 'success' && response.data?.user) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        
        // ✅ AGREGAR ESTA LÍNEA:
        localStorage.setItem('isAdmin', response.data.user.role === 'admin' ? 'true' : 'false');
        
        console.log('✅ Usuario verificado exitosamente');
        return { success: true, user: response.data.user };
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (err) {
      console.error('❌ Error en verificación:', err);
      
      let errorMessage = 'Error al verificar usuario';
      
      if (err.message.includes('404') || err.message.includes('no encontrado')) {
        errorMessage = 'Usuario no encontrado';
      } else if (err.message.includes('401') || err.message.includes('incorrecta')) {
        errorMessage = 'Contraseña incorrecta';
      }
      
      setError(errorMessage);
      setIsAuthenticated(false);
      setUser(null);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
    // ✅ AGREGAR ESTA LÍNEA:
    localStorage.removeItem('isAdmin');
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    logout,
  };
};

export default useAuth;