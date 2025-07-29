import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  FileText,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock as ClockIcon,
  CalendarCheck,
  BarChart3,
  TrendingUp,
  Users,
  MapPin
} from "lucide-react";
import { useReportGeneration } from "@/hooks/useReportGeneration";

export default function Reports() {
  const navigate = useNavigate();
  const { reports } = useReportGeneration();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterAmbiente, setFilterAmbiente] = useState("todos");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Obtener lista única de ambientes para el filtro
  const ambientes = [...new Set(reports.map(r => r.ambiente))];

  // Filtrar informes
  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.usuario.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.usuario.documento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.ambiente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.motivo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = filterTipo === "todos" || report.tipo === filterTipo;
    const matchesAmbiente = filterAmbiente === "todos" || report.ambiente === filterAmbiente;
    
    return matchesSearch && matchesTipo && matchesAmbiente;
  });

  // Estadísticas
  const stats = {
    total: reports.length,
    completadas: reports.filter(r => r.tipo === 'completada').length,
    canceladas: reports.filter(r => r.tipo === 'cancelada').length,
    rechazadas: reports.filter(r => r.tipo === 'rechazada').length,
    ambientes: ambientes.length
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para obtener el icono según el tipo
  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'completada':
        return { icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' };
      case 'cancelada':
        return { icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' };
      case 'rechazada':
        return { icon: AlertCircle, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' };
      default:
        return { icon: ClockIcon, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' };
    }
  };

  // Función para obtener el texto del tipo
  const getTipoText = (tipo) => {
    switch (tipo) {
      case 'completada':
        return 'Completada';
      case 'cancelada':
        return 'Cancelada';
      case 'rechazada':
        return 'Rechazada';
      default:
        return 'Pendiente';
    }
  };

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
              <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:bg-slate-900/80 dark:border-slate-700/50 p-8">
          
          {/* Estadísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Informes</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-sena" />
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Completadas</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.completadas}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400">Canceladas</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.canceladas}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400">Rechazadas</p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.rechazadas}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Ambientes</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.ambientes}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Filtros */}
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

          {/* Tabla de Informes */}
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <User className="inline w-4 h-4 mr-2" />
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <Building2 className="inline w-4 h-4 mr-2" />
                      Ambiente
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <Calendar className="inline w-4 h-4 mr-2" />
                      Fecha/Hora
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
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
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((report) => {
                      const tipoInfo = getTipoIcon(report.tipo);
                      const TipoIcon = tipoInfo.icon;
                      
                      return (
                        <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-white">
                                {report.usuario.nombre}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {report.usuario.documento}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900 dark:text-white">
                              {report.ambiente}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
          <div>
                              <div className="text-sm text-slate-900 dark:text-white">
                                {report.fechaReserva}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {report.horaInicio} ({report.duracion}h)
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${tipoInfo.bg} ${tipoInfo.color}`}>
                              <TipoIcon className="w-3 h-3" />
                              {getTipoText(report.tipo)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                setSelectedReport(report);
                                setShowDetailModal(true);
                              }}
                              className="p-2 text-slate-600 hover:text-sena dark:text-slate-400 dark:hover:text-sena-light transition-colors"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalles */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Detalles del Informe
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>
            
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
                    <p className="font-medium text-slate-900 dark:text-white">{selectedReport.usuario.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Documento</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedReport.usuario.documento}</p>
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
                    <p className="font-medium text-slate-900 dark:text-white">{selectedReport.ambiente}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Fecha</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedReport.fechaReserva}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Hora Inicio</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedReport.horaInicio}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Duración</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedReport.duracion} horas</p>
                  </div>
                  {selectedReport.motivo && (
                    <div className="col-span-2">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Motivo</p>
                      <p className="font-medium text-slate-900 dark:text-white">{selectedReport.motivo}</p>
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
                     {(() => {
                       const tipoInfo = getTipoIcon(selectedReport.tipo);
                       const TipoIcon = tipoInfo.icon;
                       return (
                         <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${tipoInfo.bg} ${tipoInfo.color}`}>
                           <TipoIcon className="w-3 h-3" />
                           {getTipoText(selectedReport.tipo)}
                         </span>
                       );
                     })()}
                   </div>
                  
                  {selectedReport.fechaAprobacion && (
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Aprobada por</p>
                      <p className="font-medium text-slate-900 dark:text-white">{selectedReport.aprobadaPor}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(selectedReport.fechaAprobacion)}</p>
                    </div>
                  )}
                  
                  {selectedReport.fechaCompletacion && (
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Completada</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(selectedReport.fechaCompletacion)}</p>
                    </div>
                  )}
                  
                  {selectedReport.fechaCancelacion && (
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Cancelada</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(selectedReport.fechaCancelacion)}</p>
                      {selectedReport.motivoCancelacion && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">Motivo: {selectedReport.motivoCancelacion}</p>
                      )}
                    </div>
                  )}
                  
                  {selectedReport.fechaRechazo && (
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Rechazada</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(selectedReport.fechaRechazo)}</p>
                      {selectedReport.motivoRechazo && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">Motivo: {selectedReport.motivoRechazo}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Fecha de Generación */}
              <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Informe generado el {formatDate(selectedReport.fecha)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
