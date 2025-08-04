import React, { useState } from 'react';
import { Trash2, Database, RefreshCw } from 'lucide-react';
import { clearTestData } from '@/utils/clearAuth';

const DevTools = () => {
  const [showTools, setShowTools] = useState(false);

  const handleClearTestData = () => {
    clearTestData();
    window.location.reload();
  };

  // Solo mostrar en desarrollo
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!showTools && (
        <button
          onClick={() => setShowTools(true)}
          className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all duration-200"
          title="Herramientas de desarrollo"
        >
          <Database className="w-5 h-5" />
        </button>
      )}

      {showTools && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 min-w-[200px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Dev Tools
            </h3>
            <button
              onClick={() => setShowTools(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={handleClearTestData}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
              Limpiar datos de prueba
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Recargar página
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevTools; 