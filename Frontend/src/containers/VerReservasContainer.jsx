import React from 'react';
import {
  Calendar,
  Clock,
  User,
  FileText,
  Building2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  ArrowLeft,
  Plus,
  Trash2
} from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { normalizeStatus, translateStatus } from "@/utils/reservasUtils";

const VerReservasContainer = ({
  // Data
  reservas,
  filteredReservas,
  loading,
  error,
  filter,
  selectedIds,
  pendingIds,
  
  // Handlers
  onFilterChange,
  onAprobar,
  onRechazar,
  onEliminar,
  onToggleSelect,
  onToggleSelectAll,
  onDeleteSelected,
  onCreateReserva,
  onBack,
  
  // Helper functions
  getStatusColor,
  getStatusIcon
}) => {
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Cargando reservas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 dark:bg-slate-900/80 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Gestión de Reservas
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Administra y supervisa todas las reservas
                </p>
              </div>
            </div>
            <button
              onClick={onCreateReserva}
              className="px-4 py-2 bg-gradient-to-r from-sena to-sena-dark hover:from-sena-dark hover:to-sena text-white rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nueva Reserva
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <select
              value={filter}
              onChange={(e) => onFilterChange(e.target.value)}
              id="filter-select"
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="all">Todas las reservas</option>
              <option value="pendiente">Pendientes</option>
              <option value="aprobada">Aprobadas</option>
              <option value="rechazada">Rechazadas</option>
            </select>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={onDeleteSelected}
                className="px-3 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={!selectedIds || selectedIds.length === 0}
              >
                Eliminar seleccionadas
              </button>
            </div>
          </div>
        </div>

        {/* Reservas Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        onChange={onToggleSelectAll}
                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-600"
                        title="Seleccionar visibles"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Ambiente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredReservas.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">
                        No hay reservas para mostrar
                      </td>
                    </tr>
                  ) : (
                    filteredReservas.map((reserva) => (
                      <tr key={reserva._id || reserva.id}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {(() => {
                            const st = normalizeStatus(reserva.status || reserva.estado);
                            const idStr = String(reserva._id || reserva.id);
                            const isDeletable = ['APPROVED','REJECTED','CANCELLED'].includes(st);
                            return (
                              <input
                                type="checkbox"
                                checked={selectedIds?.includes(idStr) || false}
                                onChange={() => onToggleSelect(idStr)}
                                disabled={!isDeletable}
                                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600"
                                title={isDeletable ? 'Seleccionar' : 'Solo se seleccionan aprobadas/rechazadas/canceladas'}
                              />
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="w-5 h-5 text-slate-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-white">
                                {reserva.usuario?.nombre || reserva.nombre || 'Usuario desconocido'}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {reserva.usuario?.documento || reserva.documento || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building2 className="w-5 h-5 text-slate-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-white">
                                {reserva.ambiente?.nombre || reserva.ambienteNombre || 'Ambiente desconocido'}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {reserva.ambiente?.tipo || 'N/A'} - {reserva.ambiente?.ubicacion || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="w-5 h-5 text-slate-400 mr-3" />
                            <div>
                              <div className="text-sm text-slate-900 dark:text-white">
                                {new Date(reserva.startDate || reserva.fecha).toLocaleDateString('es-CO')}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {new Date(reserva.startDate || reserva.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })} - 
                                {new Date(reserva.endDate || reserva.fechaFin).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(() => {
                            const st = normalizeStatus(reserva.status || reserva.estado);
                            return (
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(st)}`}>
                                {getStatusIcon(st)}
                                {translateStatus(st)}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {(() => {
                            const st = normalizeStatus(reserva.status || reserva.estado);
                            const idVal = reserva._id || reserva.id;
                            if (st === 'PENDING') {
                              return (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => onAprobar(idVal)}
                                    disabled={pendingIds?.includes(String(idVal))}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50"
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Aprobar
                                  </button>
                                  <button
                                    onClick={() => onRechazar(idVal)}
                                    disabled={pendingIds?.includes(String(idVal))}
                                    className="inline-flex items-center px-3 py-1 border border-red-300 text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors disabled:opacity-50"
                                  >
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Rechazar
                                  </button>
                                </div>
                              );
                            }
                            if (['APPROVED','REJECTED','CANCELLED'].includes(st)) {
                              return (
                                <button
                                  onClick={() => onEliminar(idVal)}
                                  disabled={pendingIds?.includes(String(idVal))}
                                  className="inline-flex items-center px-3 py-1 border border-slate-300 text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
                                  title="Eliminar esta reserva"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Eliminar
                                </button>
                              );
                            }
                            return null;
                          })()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        {filteredReservas.length > 0 && (
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <FileText className="w-4 h-4" />
                <span>Mostrando {filteredReservas.length} de {reservas.length} reservas</span>
              </div>
              <button
                onClick={onCreateReserva}
                className="px-4 py-2 bg-gradient-to-r from-sena to-sena-dark hover:from-sena-dark hover:to-sena text-white rounded-lg transition-all duration-200 flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Nueva Reserva
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerReservasContainer;