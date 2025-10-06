// React JSX runtime moderno no requiere default import
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
  
  // Handlers
  onFilterChange,
  onAprobar,
  onRechazar,
  onCreateReserva,
  onEliminar,
  onToggleSelect,
  onToggleSelectAll,
  onDeleteSelected,
  onBack,
  
  // Helper functions
  getStatusColor,
  getStatusIcon
}) => {
  // Calcular si todas las visibles están seleccionadas
  const visibleIds = (filteredReservas || []).map(r => String(r._id || r.id));
  const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds?.includes(id));
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
            <div className="flex items-center gap-2">
              <button
                onClick={onDeleteSelected}
                disabled={!selectedIds || selectedIds.length === 0}
                className={`px-4 py-2 border ${selectedIds && selectedIds.length > 0 ? 'border-red-300 text-red-700 bg-white hover:bg-red-50' : 'border-slate-200 text-slate-400 bg-white'} rounded-lg transition-all duration-200 flex items-center gap-2`}
                title="Eliminar reservas seleccionadas (solo rechazadas)"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar seleccionadas
              </button>
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
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="all">Todas las reservas</option>
              <option value="pendiente">Pendientes</option>
              <option value="aprobada">Aprobadas</option>
              <option value="rechazada">Rechazadas</option>
            </select>
          </div>
        </div>

        {/* Reservas Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-sena focus:ring-sena"
                          checked={allSelected}
                          onChange={onToggleSelectAll}
                          aria-label="Seleccionar todas las visibles"
                        />
                        Seleccionar
                      </div>
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
                        {/* Checkbox selección (selecciona cualquiera; solo se eliminarán las rechazadas) */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {/** Normalizar estado para consistencia UI **/}
                          {(() => {
                            const normalizedStatus = normalizeStatus(reserva.status ?? reserva.estado);
                            const isDeletable = ['REJECTED','APPROVED','CANCELLED'].includes(normalizedStatus);
                            return (
                          <input
                            type="checkbox"
                            className={`h-4 w-4 rounded focus:ring-sena ${isDeletable ? 'border-slate-300 text-sena' : 'border-slate-200 text-slate-300'}`}
                            checked={selectedIds?.includes(String(reserva._id || reserva.id)) || false}
                            onChange={() => onToggleSelect(String(reserva._id || reserva.id))}
                            aria-label="Seleccionar reserva"
                            title="Solo se eliminarán reservas Aprobadas, Rechazadas o Canceladas"
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
                                {reserva.usuario?.documento || reserva.documento || (reserva.usuario?.rol || reserva.rol || reserva.usuario?.role || reserva.role || 'Usuario')}
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
                            const normalizedStatus = normalizeStatus(reserva.status ?? reserva.estado);
                            return (
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(normalizedStatus)}`}>
                                {getStatusIcon(normalizedStatus)}
                                {translateStatus(normalizedStatus)}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {normalizeStatus(reserva.status ?? reserva.estado) === 'PENDING' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => onAprobar(reserva._id || reserva.id)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Aprobar
                              </button>
                              <button
                                onClick={() => onRechazar(reserva._id || reserva.id)}
                                className="inline-flex items-center px-3 py-1 border border-red-300 text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Rechazar
                              </button>
                            </div>
                          )}
                          {normalizeStatus(reserva.status ?? reserva.estado) === 'REJECTED' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => onEliminar(reserva._id || reserva.id)}
                                className="inline-flex items-center px-3 py-1 border border-red-300 text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Eliminar
                              </button>
                            </div>
                          )}
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