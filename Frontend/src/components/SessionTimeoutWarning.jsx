import React from 'react';
import { AlertTriangle, Clock, RefreshCw, LogOut } from 'lucide-react';
import useSessionTimeout from '../hooks/useSessionTimeout';

const SessionTimeoutWarning = () => {
  const {
    isWarningVisible,
    remainingTime,
    extendSession,
    logout,
    hideWarning
  } = useSessionTimeout();

  if (!isWarningVisible) {
    return null;
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Overlay de fondo */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        {/* Modal de advertencia */}
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
          {/* Header */}
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Sesión por expirar
              </h3>
            </div>
          </div>

          {/* Contenido */}
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Tu sesión expirará por inactividad. ¿Deseas continuar?
            </p>
            
            {/* Contador regresivo */}
            <div className="flex items-center justify-center bg-amber-50 rounded-lg p-4 mb-4">
              <Clock className="h-5 w-5 text-amber-600 mr-2" />
              <span className="text-2xl font-mono font-bold text-amber-700">
                {remainingTime ? formatTime(remainingTime) : '1:00'}
              </span>
              <span className="text-sm text-amber-600 ml-2">restante</span>
            </div>

            {/* Barra de progreso */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-amber-500 h-2 rounded-full transition-all duration-1000 ease-linear"
                style={{ 
                  width: `${remainingTime ? (remainingTime / 60) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Botón continuar sesión */}
            <button
              onClick={extendSession}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Continuar sesión
            </button>
            
            {/* Botón cerrar sesión */}
            <button
              onClick={logout}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </button>
          </div>

          {/* Botón cerrar (X) */}
          <button
            onClick={hideWarning}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>


    </>
  );
};

export default SessionTimeoutWarning;