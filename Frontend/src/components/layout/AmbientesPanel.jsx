import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

const AmbientesPanel = ({ ambientes, isLoading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ambientes Disponibles</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sena"></div>
            <span className="ml-2 text-slate-600 dark:text-slate-400">Cargando ambientes...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {ambientes.map(ambiente => (
              <div key={ambiente._id || ambiente.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      {ambiente.nombre}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {ambiente.tipo} • {ambiente.capacidad}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      ambiente.disponible ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-xs ${
                      ambiente.disponible 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {ambiente.disponible ? 'Disponible' : 'Ocupado'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AmbientesPanel;