import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

const InfoPanel = () => {
  return (
    <>
      {/* Información de Horarios */}
      <Card>
        <CardHeader>
          <CardTitle>Horarios de Atención</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Lunes - Viernes</span>
              <span className="font-medium text-slate-900 dark:text-white">7:00 AM - 10:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Sábados</span>
              <span className="font-medium text-slate-900 dark:text-white">8:00 AM - 6:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Domingos</span>
              <span className="font-medium text-slate-900 dark:text-white">Cerrado</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Políticas */}
      <Card>
        <CardHeader>
          <CardTitle>Políticas de Reserva</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Reservas con 24h de anticipación</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Máximo 4 horas por reserva</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <span>Cancelar con 2h de anticipación</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default InfoPanel;