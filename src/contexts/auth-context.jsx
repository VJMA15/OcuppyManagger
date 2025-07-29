import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Verificar si ya está autenticado al cargar
    return localStorage.getItem("isAdmin") === "true";
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar estado de autenticación al montar
    const checkAuth = () => {
      const authStatus = localStorage.getItem("isAdmin") === "true";
      setIsAuthenticated(authStatus);
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = () => {
    console.log('🔐 Función login llamada');
    localStorage.setItem("isAdmin", "true");
    setIsAuthenticated(true);
    console.log('✅ Usuario autenticado correctamente');
  };

  const logout = () => {
    console.log('🚪 Función logout llamada');
    localStorage.removeItem("isAdmin");
    setIsAuthenticated(false);
    console.log('✅ Usuario desautenticado correctamente');
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout,
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