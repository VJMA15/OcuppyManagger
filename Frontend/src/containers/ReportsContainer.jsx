import React from 'react';
import {
  ArrowLeft,
  Search,
  Download,
  Trash2,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  User,
  Calendar,
  Eye,
  CheckSquare,
  Square
} from 'lucide-react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
  StatCard,
  Modal
} from '@/components/ui';
import ReportDetailModal from '@/components/modals/ReportDetailModal';

const ReportsContainer = ({
  // Navigation
  navigate,
  
  // Data
  reports,
  stats,
  ambientes,
  
  // Search and filters
  searchTerm,
  setSearchTerm,
  filterTipo,
  setFilterTipo,
  filterAmbiente,
  setFilterAmbiente,
  
  // Selection
  selectedReports,
  handleSelectReport,
  handleSelectAll,
  
  // Actions
  handleViewDetails,
  handleDeleteReport,
  handleBulkDelete,
  
  // Modals
  selectedReport,
  showDetailModal,
  handleCloseDetailModal,
  
  showDeleteModal,
  reportToDelete,
  handleCloseDeleteModal,
  confirmDeleteReport,
  
  showBulkDeleteModal,
  handleCloseBulkDeleteModal,
  confirmBulkDelete,
  
  // Helper functions
  formatDate,
  getTipoIcon,
  getTipoText
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 dark:bg-slate-900/80 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Informes de Uso
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Historial completo de uso de ambientes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedReports.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar ({selectedReports.length})
                </button>
              )}
              <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:bg-slate-900/80 dark:border-slate-700/50 p-8">
          
          {/* Quick Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <StatCard
              title="Total Informes"
              value={stats.total}
              icon={FileText}
              color="slate"
            />
            <StatCard
              title="Completadas"
              value={stats.completadas}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              title="Canceladas"
              value={stats.canceladas}
              icon={XCircle}
              color="red"
            />
            <StatCard
              title="Rechazadas"
              value={stats.rechazadas}
              icon={AlertCircle}
              color="orange"
            />
            <StatCard
              title="Ambientes"
              value={stats.ambientes}
              icon={Building2}
              color="blue"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por usuario, ambiente o motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-sena-light transition-all duration-200"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-sena-light transition-all duration-200"
              >
                <option value="todos">Todos los tipos</option>
                <option value="completada">Completadas</option>
                <option value="cancelada">Canceladas</option>
                <option value="rechazada">Rechazadas</option>
              </select>
              <select
                value={filterAmbiente}
                onChange={(e) => setFilterAmbiente(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-sena-light transition-all duration-200"
              >
                <option value="todos">Todos los ambientes</option>
                {ambientes.map(ambiente => (
                  <option key={ambiente} value={ambiente}>{ambiente}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reports Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <button
                        onClick={handleSelectAll}
                        className="flex items-center justify-center w-4 h-4"
                      >
                        {selectedReports.length === reports.length && reports.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-sena" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>
                      <User className="inline w-4 h-4 mr-2" />
                      Usuario
                    </TableHead>
                    <TableHead>
                      <Building2 className="inline w-4 h-4 mr-2" />
                      Ambiente
                    </TableHead>
                    <TableHead>
                      <Calendar className="inline w-4 h-4 mr-2" />
                      Fecha/Jornada
                    </TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <FileText className="w-12 h-12 text-slate-400 mb-4" />
                          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                            No hay informes
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 mb-4">
                            {searchTerm || filterTipo !== "todos" || filterAmbiente !== "todos"
                              ? "No se encontraron informes con los filtros aplicados."
                              : "Los informes se generan automáticamente cuando se completan, cancelan o rechazan reservas."
                            }
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.map((report) => {
                      const tipoInfo = getTipoIcon(report.tipo);
                      const TipoIcon = tipoInfo.icon;
                      
                      return (
                        <TableRow key={report.id}>
                          <TableCell>
                            <button
                              onClick={() => handleSelectReport(report.id)}
                              className="flex items-center justify-center w-4 h-4"
                            >
                              {selectedReports.includes(report.id) ? (
                                <CheckSquare className="w-4 h-4 text-sena" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-white">
                                {report.usuario.nombre}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {report.usuario.documento}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-slate-900 dark:text-white">
                              {report.ambiente}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm text-slate-900 dark:text-white">
                                {report.fechaReserva}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {report.jornada || 'N/A'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${tipoInfo.bg} ${tipoInfo.color}`}>
                              <TipoIcon className="w-3 h-3" />
                              {getTipoText(report.tipo)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewDetails(report)}
                                className="p-2 text-slate-600 hover:text-sena dark:text-slate-400 dark:hover:text-sena-light transition-colors"
                                title="Ver detalles"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteReport(report)}
                                className="p-2 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                                title="Eliminar informe"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <ReportDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
        report={selectedReport}
        formatDate={formatDate}
        getTipoIcon={getTipoIcon}
        getTipoText={getTipoText}
      />

      {/* Delete Modal */}
      {showDeleteModal && reportToDelete && (
        <Modal isOpen={showDeleteModal} onClose={handleCloseDeleteModal} title="Eliminar Informe">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400">
                ¿Estás seguro de que quieres eliminar este informe?
              </p>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <strong>Usuario:</strong> {reportToDelete.usuario.nombre}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <strong>Ambiente:</strong> {reportToDelete.ambiente}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <strong>Fecha:</strong> {reportToDelete.fechaReserva}
            </p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={handleCloseDeleteModal}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDeleteReport}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </Modal>
      )}

      {/* Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <Modal isOpen={showBulkDeleteModal} onClose={handleCloseBulkDeleteModal} title="Eliminar Informes">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400">
                ¿Estás seguro de que quieres eliminar {selectedReports.length} informe{selectedReports.length !== 1 ? 's' : ''}?
              </p>
            </div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700 dark:text-red-300">
              ⚠️ Esta acción no se puede deshacer. Los informes se eliminarán permanentemente.
            </p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={handleCloseBulkDeleteModal}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmBulkDelete}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Eliminar {selectedReports.length}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ReportsContainer;