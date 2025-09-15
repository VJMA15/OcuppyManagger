import { useEffect, useState, useCallback } from 'react';
import sessionManager from '../services/sessionManager';
import authService from '../services/auth';

/**
 * Hook personalizado para gestionar el timeout de sesión
 * Proporciona estado y métodos para manejar la sesión automática
 */
export const useSessionTimeout = () => {
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Callback para mostrar advertencia
  const handleWarning = useCallback(() => {
    setIsWarningVisible(true);
    setRemainingTime(60); // 1 minuto restante
    
    // Countdown de 60 segundos
    const countdown = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Limpiar countdown si se oculta la advertencia
    return () => clearInterval(countdown);
  }, []);

  // Callback para timeout de sesión
  const handleTimeout = useCallback(() => {
    setIsWarningVisible(false);
    setIsSessionActive(false);
    setRemainingTime(null);
  }, []);

  // Extender sesión manualmente
  const extendSession = useCallback(() => {
    sessionManager.extendSession();
    setIsWarningVisible(false);
    setRemainingTime(null);
  }, []);

  // Cerrar sesión manualmente
  const logout = useCallback(() => {
    authService.logout();
    window.location.href = '/login';
  }, []);

  // Ocultar advertencia
  const hideWarning = useCallback(() => {
    setIsWarningVisible(false);
    setRemainingTime(null);
  }, []);

  useEffect(() => {
    // Verificar si hay una sesión activa
    const checkSession = () => {
      const active = authService.isAuthenticated() && sessionManager.isSessionActive();
      setIsSessionActive(active);
    };

    // Configurar callbacks del sessionManager
    sessionManager.setWarningCallback(handleWarning);
    sessionManager.setTimeoutCallback(handleTimeout);

    // Verificar sesión inicial
    checkSession();

    // Verificar sesión periódicamente
    const interval = setInterval(checkSession, 1000);

    return () => {
      clearInterval(interval);
      // Limpiar callbacks
      sessionManager.setWarningCallback(null);
      sessionManager.setTimeoutCallback(null);
    };
  }, [handleWarning, handleTimeout]);

  return {
    isWarningVisible,
    remainingTime,
    isSessionActive,
    extendSession,
    logout,
    hideWarning
  };
};

export default useSessionTimeout;