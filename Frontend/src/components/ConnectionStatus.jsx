import React from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';
import useApiConnection from '@/hooks/useApiConnection';

const ConnectionStatus = () => {
  const { isConnected, isLoading, error, testConnection } = useApiConnection();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600"></div>
        <span className="text-xs text-yellow-700 dark:text-yellow-300">Conectando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 rounded-lg">
        <WifiOff className="w-3 h-3 text-red-600" />
        <span className="text-xs text-red-700 dark:text-red-300">Sin conexión</span>
        <button
          onClick={testConnection}
          className="text-xs text-red-600 dark:text-red-400 hover:underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg">
        <Wifi className="w-3 h-3 text-green-600" />
        <span className="text-xs text-green-700 dark:text-green-300">Conectado</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
      <AlertCircle className="w-3 h-3 text-slate-600" />
      <span className="text-xs text-slate-600 dark:text-slate-400">Desconocido</span>
    </div>
  );
};

export default ConnectionStatus; 