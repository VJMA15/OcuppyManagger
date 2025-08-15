import React from 'react';
import { X, User, Building2, Calendar, Clock, FileText } from 'lucide-react';
import { Modal, Button } from '@/components/ui';

const ReportDetailModal = ({ show, onClose, report, formatDate, getTipoIcon, getTipoText }) => {
  if (!report) return null;

  const { icon: TipoIcon, color, bg } = getTipoIcon(report.tipo);

  return (
    <Modal show={show} onClose={onClose} title="Detalles del Informe" size="lg">
      <div className="space-y-6">
        {/* Header con estado */}
        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className={`w-12 h-12 ${bg} rounded-lg flex items-center justify-center`}>
            <TipoIcon className={`w-6 h-6 ${color}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {getTipoText(report.tipo)}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {formatDate(report.fecha)}
            </p>
          </div>
        </div>

        {/* Información del usuario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Usuario</span>
            </div>
            <div className="pl-6">
              <p className="font-medium text-slate-900 dark:text-white">{report.usuario.nombre}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{report.usuario.documento}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Ambiente</span>
            </div>
            <div className="pl-6">
              <p className="font-medium text-slate-900 dark:text-white">{report.ambiente}</p>
            </div>
          </div>
        </div>

        {/* Detalles de la reserva */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Detalles de la Reserva</span>
          </div>
          <div className="pl-6 space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium">Jornada:</span> {report.jornada}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium">Duración:</span> {report.duracion}
            </p>
          </div>
        </div>

        {/* Motivo */}
        {report.motivo && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Motivo</span>
            </div>
            <div className="pl-6">
              <p className="text-sm text-slate-600 dark:text-slate-400">{report.motivo}</p>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReportDetailModal;