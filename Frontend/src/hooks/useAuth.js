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
        const userData = response.data.user;
        
        setIsAuthenticated(true);
        setUser(userData);
        
        // Asegurar que el rol se guarde correctamente
        const userRole = userData.role || userData.rol || 'usuario';
        localStorage.setItem('isAdmin', userRole === 'admin' ? 'true' : 'false');
        localStorage.setItem('userRole', userRole);
        
        console.log('✅ Usuario verificado exitosamente:', {
          nombre: userData.nombre,
          rol: userRole,
          isAdmin: userRole === 'admin'
        });
        
        return { success: true, user: userData };
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
    console.log('🔓 Iniciando logout completo...');
    
    // 1. Limpiar servicio API
    apiService.logout();
    
    // 2. Limpiar estados locales
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
    
    // 3. Limpiar localStorage
    localStorage.clear();
    
    console.log('✅ Logout completo ejecutado');
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