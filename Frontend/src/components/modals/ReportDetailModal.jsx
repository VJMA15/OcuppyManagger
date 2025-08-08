import React from 'react';
import { User, Calendar, BarChart3, X } from 'lucide-react';
import { Modal } from '@/components/ui';

const ReportDetailModal = ({ 
  isOpen, 
  onClose, 
  report, 
  formatDate, 
  getTipoIcon, 
  getTipoText 
}) => {
  if (!report) return null;

  const tipoInfo = getTipoIcon(report.tipo);
  const TipoIcon = tipoInfo.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Informe" size="lg">
      <div className="space-y-6">
        {/* Información del Usuario */}
        <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
          <h4 className="font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            Información del Usuario
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Nombre</p>
              <p className="font-medium text-slate-900 dark:text-white">{report.usuario.nombre}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Documento</p>
              <p className="font-medium text-slate-900 dark:text-white">{report.usuario.documento}</p>
            </div>
          </div>
        </div>

        {/* Información de la Reserva */}
        <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
          <h4 className="font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Detalles de la Reserva
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Ambiente</p>
              <p className="font-medium text-slate-900 dark:text-white">{report.ambiente}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Fecha</p>
              <p className="font-medium text-slate-900 dark:text-white">{report.fechaReserva}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Jornada</p>
              <p className="font-medium text-slate-900 dark:text-white">{report.jornada || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Duración</p>
              <p className="font-medium text-slate-900 dark:text-white">{report.duracion} horas</p>
            </div>
            {report.motivo && (
              <div className="col-span-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">Motivo</p>
                <p className="font-medium text-slate-900 dark:text-white">{report.motivo}</p>
              </div>
            )}
          </div>
        </div>

        {/* Información del Estado */}
        <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
          <h4 className="font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Estado y Fechas
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${tipoInfo.bg} ${tipoInfo.color}`}>
                <TipoIcon className="w-3 h-3" />
                {getTipoText(report.tipo)}
              </span>
            </div>
            
            {report.fechaAprobacion && (
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Aprobada por</p>
                <p className="font-medium text-slate-900 dark:text-white">{report.aprobadaPor}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(report.fechaAprobacion)}</p>
              </div>
            )}
            
            {report.fechaCompletacion && (
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Completada</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(report.fechaCompletacion)}</p>
              </div>
            )}
            
            {report.fechaCancelacion && (
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Cancelada</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(report.fechaCancelacion)}</p>
                {report.motivoCancelacion && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">Motivo: {report.motivoCancelacion}</p>
                )}
              </div>
            )}
            
            {report.fechaRechazo && (
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Rechazada</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(report.fechaRechazo)}</p>
                {report.motivoRechazo && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">Motivo: {report.motivoRechazo}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Fecha de Generación */}
        <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Informe generado el {formatDate(report.fecha)}
        </div>
      </div>
    </Modal>
  );
};

export default ReportDetailModal;