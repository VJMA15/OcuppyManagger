import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '@/services/api';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing user data:', error);
          logout();
        }
      }
    };
    
    checkAuth();
  }, []);

  const login = async (cc, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Iniciando sesión con CC:', cc);
      
      const response = await apiService.login({ cc, password });
      
      if (response.success && response.user) {
        const userData = response.user;
        const token = response.token;
        
        // Guardar en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Actualizar estado
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
        
        setIsLoading(false);
        
        // 🎯 REDIRECCIÓN BASADA EN ROL usando navigate
        if (userRole === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/ambientes', { replace: true });
        }
        
        return { success: true, user: userData };
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (err) {
      console.error('❌ Error en login:', err);
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (err.message.includes('404') || err.message.includes('no encontrado')) {
        errorMessage = 'Usuario no encontrado';
      } else if (err.message.includes('401') || err.message.includes('incorrecta')) {
        errorMessage = 'Contraseña incorrecta';
      } else if (err.message.includes('Credenciales inválidas')) {
        errorMessage = 'Cédula o contraseña incorrecta';
      }
      
      setError(errorMessage);
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    // Limpiar API service
    apiService.logout();
    
    // Limpiar estados locales
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
    
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userRole');
    
    // Redirigir al login
    navigate('/login', { replace: true });
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    logout
  };
};

export default useAuth;