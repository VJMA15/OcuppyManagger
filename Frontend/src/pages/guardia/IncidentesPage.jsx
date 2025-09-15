import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, XCircle, Search, Filter, Plus, AlertCircle, User, Calendar, Clock as ClockIcon, Edit, Trash2, Eye } from 'lucide-react';
import { Building2 } from 'lucide-react';
import { useGuardia } from '@/contexts/GuardiaContext';

const IncidentesPage = () => {
  const { incidentesData, updateIncidentesData } = useGuardia();
  const [searchTerm, setSearchTerm] = useState(incidentesData.filtros?.searchTerm || '');
  const [filterStatus, setFilterStatus] = useState(incidentesData.filtros?.filterStatus || 'todos');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'view'
  const [selectedIncidente, setSelectedIncidente] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'media',
    ubicacion: '',
    ambiente: ''
  });

  // Datos de ejemplo para los incidentes (inicializar desde contexto si existe)
  const [incidentes, setIncidentes] = useState(incidentesData.incidentes.length > 0 ? incidentesData.incidentes : [
    {
      id: 1,
      titulo: 'Fuga de agua en el baño',
      descripcion: 'Hay una fuga en el lavamanos del baño de profesores',
      fecha: '2023-11-15',
      hora: '09:30',
      estado: 'pendiente',
      prioridad: 'alta',
      reportadoPor: 'Juan Pérez',
      ubicacion: 'Bloque A - Piso 2',
      ambiente: 'Aula 203'
    },
    {
      id: 2,
      titulo: 'Aire acondicionado dañado',
      descripcion: 'El aire acondicionado no enfría correctamente',
      fecha: '2023-11-14',
      hora: '14:15',
      estado: 'en_proceso',
      prioridad: 'media',
      reportadoPor: 'María Gómez',
      ubicacion: 'Bloque B - Piso 1',
      ambiente: 'Laboratorio de Computación'
    },
    {
      id: 3,
      titulo: 'Silla rota',
      descripcion: 'Una silla en el salón tiene una pata quebrada',
      fecha: '2023-11-13',
      hora: '11:45',
      estado: 'resuelto',
      prioridad: 'baja',
      reportadoPor: 'Carlos Ruiz',
      ubicacion: 'Bloque C - Piso 3',
      ambiente: 'Aula 305'
    }
  ]);

  // Actualizar contexto cuando cambien los datos
  useEffect(() => {
    updateIncidentesData({
      incidentes,
      filtros: { searchTerm, filterStatus },
      loading: false
    });
  }, [incidentes, searchTerm, filterStatus, updateIncidentesData]);

  // Funciones para manejar incidentes
  const handleCreateIncidente = () => {
    setModalType('create');
    setSelectedIncidente(null);
    setFormData({
      titulo: '',
      descripcion: '',
      prioridad: 'media',
      ubicacion: '',
      ambiente: ''
    });
    setShowModal(true);
  };

  const handleEditIncidente = (incidente) => {
    setModalType('edit');
    setSelectedIncidente(incidente);
    setFormData({
      titulo: incidente.titulo,
      descripcion: incidente.descripcion,
      prioridad: incidente.prioridad,
      ubicacion: incidente.ubicacion,
      ambiente: incidente.ambiente
    });
    setShowModal(true);
  };

  const handleViewIncidente = (incidente) => {
    setModalType('view');
    setSelectedIncidente(incidente);
    setShowModal(true);
  };

  const handleSaveIncidente = () => {
    if (modalType === 'create') {
      const newIncidente = {
        id: Date.now(),
        ...formData,
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        estado: 'pendiente',
        reportadoPor: 'Usuario Actual' // En una app real, esto vendría del contexto de usuario
      };
      setIncidentes([...incidentes, newIncidente]);
    } else if (modalType === 'edit') {
      setIncidentes(incidentes.map(inc => 
        inc.id === selectedIncidente.id 
          ? { ...inc, ...formData }
          : inc
      ));
    }
    setShowModal(false);
  };

  const handleResolverIncidente = (id) => {
    setIncidentes(incidentes.map(inc => 
      inc.id === id 
        ? { ...inc, estado: 'resuelto' }
        : inc
    ));
  };

  const handleDeleteIncidente = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este incidente?')) {
      setIncidentes(incidentes.filter(inc => inc.id !== id));
    }
  };

  const filteredIncidentes = incidentes.filter(incidente => {
    const matchesSearch = incidente.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incidente.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'todos' || incidente.estado === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusStyles = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'en_proceso':
        return 'bg-slate-50 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      case 'resuelto':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-gray-50 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
  };

  const getPriorityStyles = (prioridad) => {
    switch (prioridad) {
      case 'alta':
        return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      case 'media':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300';
      case 'baja':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300';
      default:
        return 'bg-gray-50 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 px-6 py-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl shadow-sm">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestión de Incidentes</h2>
                <p className="text-slate-600 dark:text-slate-400">Reporte y seguimiento de incidentes en los ambientes</p>
              </div>
            </div>
            <button 
              onClick={handleCreateIncidente}
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-medium rounded-lg shadow-sm transition-colors duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Incidente
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar incidentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-sena-500 focus:border-transparent dark:bg-slate-700 dark:text-white placeholder-slate-400 transition-all duration-200"
              />
            </div>
            <div className="w-full md:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-sena-500 focus:border-transparent dark:bg-slate-700 dark:text-white appearance-none"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en_proceso">En proceso</option>
                  <option value="resuelto">Resuelto</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de incidentes */}
      <div className="space-y-4">
        {filteredIncidentes.length > 0 ? (
          filteredIncidentes.map((incidente) => (
            <div 
              key={incidente.id}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {incidente.titulo}
                      </h3>
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getPriorityStyles(incidente.prioridad)}`}>
                        {incidente.prioridad.charAt(0).toUpperCase() + incidente.prioridad.slice(1)}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      {incidente.descripcion}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        <span>{incidente.reportadoPor}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4" />
                        <span>{incidente.ubicacion}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{incidente.fecha}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ClockIcon className="w-4 h-4" />
                        <span>{incidente.hora}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center md:items-start gap-3">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusStyles(incidente.estado)}`}>
                      {incidente.estado === 'en_proceso' ? 'En Proceso' : 
                       incidente.estado === 'pendiente' ? 'Pendiente' : 'Resuelto'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleViewIncidente(incidente)}
                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditIncidente(incidente)}
                        className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                        title="Editar incidente"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {incidente.estado !== 'resuelto' && (
                        <button 
                          onClick={() => handleResolverIncidente(incidente.id)}
                          className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Marcar como resuelto"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteIncidente(incidente.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Eliminar incidente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl shadow border border-slate-200 dark:border-slate-700">
            <div className="bg-slate-100 dark:bg-slate-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
              No se encontraron incidentes
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {searchTerm || filterStatus !== 'todos' 
                ? 'No hay incidentes que coincidan con los filtros actuales.'
                : 'No hay incidentes reportados en este momento.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal para crear/editar incidente */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {modalType === 'create' ? 'Nuevo Incidente' : 
                   modalType === 'edit' ? 'Editar Incidente' : 'Detalles del Incidente'}
                </h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {modalType === 'view' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título</label>
                    <p className="text-slate-900 dark:text-white font-medium">{selectedIncidente?.titulo}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
                    <p className="text-slate-600 dark:text-slate-400">{selectedIncidente?.descripcion}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prioridad</label>
                      <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${getPriorityStyles(selectedIncidente?.prioridad)}`}>
                        {selectedIncidente?.prioridad?.charAt(0).toUpperCase() + selectedIncidente?.prioridad?.slice(1)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estado</label>
                      <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getStatusStyles(selectedIncidente?.estado)}`}>
                        {selectedIncidente?.estado === 'en_proceso' ? 'En Proceso' : 
                         selectedIncidente?.estado === 'pendiente' ? 'Pendiente' : 'Resuelto'}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ubicación</label>
                      <p className="text-slate-600 dark:text-slate-400">{selectedIncidente?.ubicacion}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reportado por</label>
                      <p className="text-slate-600 dark:text-slate-400">{selectedIncidente?.reportadoPor}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha</label>
                      <p className="text-slate-600 dark:text-slate-400">{selectedIncidente?.fecha}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hora</label>
                      <p className="text-slate-600 dark:text-slate-400">{selectedIncidente?.hora}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveIncidente} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Título *</label>
                    <input
                      type="text"
                      value={formData.titulo}
                      onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sena-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Descripción *</label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sena-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Prioridad *</label>
                      <select
                        value={formData.prioridad}
                        onChange={(e) => setFormData({...formData, prioridad: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sena-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        required
                      >
                        <option value="">Seleccionar prioridad</option>
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ubicación *</label>
                      <input
                        type="text"
                        value={formData.ubicacion}
                        onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sena-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Reportado por *</label>
                    <input
                      type="text"
                      value={formData.reportadoPor}
                      onChange={(e) => setFormData({...formData, reportadoPor: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sena-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-sena-600 to-sena-700 hover:from-sena-700 hover:to-sena-800 text-white font-medium rounded-lg shadow-sm transition-colors duration-200"
                    >
                      {modalType === 'create' ? 'Crear Incidente' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentesPage;
