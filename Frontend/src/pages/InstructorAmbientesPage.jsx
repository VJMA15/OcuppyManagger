import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Users, Building2, Calendar, Clock, BookOpen, X } from 'lucide-react';
import { useAmbientes } from '../hooks/useAmbientes';
import { useAuthContext } from '../contexts/auth-context';
import { useTheme } from '../hooks/use-theme';
import Modal from '../components/ui/Modal';
import reservationsService from '../services/reservationsService';

// Estilos personalizados para los botones de estado (modo claro y oscuro)
const statusStyles = {
  disponible: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
  ocupado: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
  mantenimiento: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
  inactivo: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700'
};

// Estilos para los tipos de ambiente (modo claro y oscuro)
const typeStyles = {
  aula: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-800',
  laboratorio: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-200 border-purple-200 dark:border-purple-800',
  taller: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200 border-amber-200 dark:border-amber-800',
  auditorio: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-200 border-rose-200 dark:border-rose-800',
  otro: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'
};

// Componente para cada tarjeta de ambiente
const AmbienteCard = React.memo(({ ambiente, onAmbienteClick, onReservaSubmit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localReservaForm, setLocalReservaForm] = useState({
    fecha: '',
    jornada: '',
    proposito: '',
    observaciones: ''
  });
  
  const handleToggleExpanded = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      // Reset form when opening
      setLocalReservaForm({
        fecha: '',
        jornada: '',
        proposito: '',
        observaciones: ''
      });
    }
  };
  
  const handleLocalReservaSubmit = (e) => {
    e.preventDefault();
    onReservaSubmit(e, ambiente, localReservaForm);
    setIsExpanded(false);
    setLocalReservaForm({
      fecha: '',
      jornada: '',
      proposito: '',
      observaciones: ''
    });
  };
  
  return (
    <div
      key={ambiente._id}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-slate-100 dark:border-gray-700 hover:border-slate-200 dark:hover:border-gray-600"
      onClick={() => onAmbienteClick(ambiente)}
    >
      <div className="relative">
        <div className="h-36 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
          <Building2 className="h-12 w-12 text-slate-400 dark:text-gray-500" />
        </div>
        <div className="absolute top-4 right-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
            statusStyles[ambiente.estado] || statusStyles.inactivo
          }`}>
            {ambiente.estado.charAt(0).toUpperCase() + ambiente.estado.slice(1)}
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{ambiente.nombre}</h3>
            <p className="text-slate-500 dark:text-gray-400 text-sm mt-1 flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1.5 text-slate-400 dark:text-gray-500" />
              {ambiente.ubicacion}
            </p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            typeStyles[ambiente.tipo?.toLowerCase()] || typeStyles.otro
          }`}>
            {ambiente.tipo}
          </span>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <div className="p-2 bg-slate-50 dark:bg-gray-700 rounded-lg mr-3">
                <Users className="h-4 w-4 text-slate-500 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-gray-400">Capacidad</p>
                <p className="font-medium text-slate-800 dark:text-gray-200">{ambiente.capacidad} personas</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="p-2 bg-slate-50 dark:bg-gray-700 rounded-lg mr-3">
                <BookOpen className="h-4 w-4 text-slate-500 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-gray-400">Tipo</p>
                <p className="font-medium text-slate-800 dark:text-gray-200">{ambiente.tipo}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleToggleExpanded}
            disabled={ambiente.estado !== 'disponible'}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors ${
              ambiente.estado === 'disponible'
                ? isExpanded
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                  : 'bg-green-700 text-white hover:bg-green-800 shadow-sm hover:shadow-md'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isExpanded ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cerrar
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Reservar
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Formulario inline de reserva */}
      {isExpanded && (
        <div className="mt-4 p-4 bg-slate-50 dark:bg-gray-700 rounded-lg border-t border-slate-200 dark:border-gray-600">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
              Reservar {ambiente.nombre}
            </h4>
            <div className="flex items-center text-sm text-slate-600 dark:text-gray-300">
              <MapPin className="h-4 w-4 mr-1" />
              {ambiente.ubicacion} • Capacidad: {ambiente.capacidad} personas
            </div>
          </div>
          
          <form onSubmit={handleLocalReservaSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-1">
                  Fecha *
                </label>
                <input
                  type="date"
                  className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={localReservaForm.fecha}
                  onChange={(e) => setLocalReservaForm({...localReservaForm, fecha: e.target.value})}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-1">
                  Jornada *
                </label>
                <select
                  className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={localReservaForm.jornada}
                  onChange={(e) => setLocalReservaForm({...localReservaForm, jornada: e.target.value})}
                  required
                >
                  <option value="">Seleccionar jornada</option>
                  <option value="mañana">Mañana (6:00 - 12:00)</option>
                  <option value="tarde">Tarde (12:00 - 18:00)</option>
                  <option value="noche">Noche (18:00 - 22:00)</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-1">
                Propósito *
              </label>
              <input
                type="text"
                placeholder="Ej: Clase de programación"
                className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={localReservaForm.proposito}
                onChange={(e) => setLocalReservaForm({...localReservaForm, proposito: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-1">
                Observaciones
              </label>
              <textarea
                rows={3}
                placeholder="Observaciones adicionales..."
                className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                value={localReservaForm.observaciones}
                onChange={(e) => setLocalReservaForm({...localReservaForm, observaciones: e.target.value})}
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                  type="button"
                  onClick={handleToggleExpanded}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 transition-colors duration-150"
                >
                  Cancelar
                </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-green-700 border border-transparent rounded-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 transition-colors duration-150"
              >
                Confirmar Reserva
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Solo re-renderizar si el ambiente cambia
  return prevProps.ambiente._id === nextProps.ambiente._id;
});

const InstructorAmbientesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { ambientes, loading, error } = useAmbientes();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedAmbiente, setSelectedAmbiente] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReservaModal, setShowReservaModal] = useState(false);
  // Estado removido: expandedReservaCard ya no es necesario
  const [reservaForm, setReservaForm] = useState({
    fecha: '',
    jornada: '',
    proposito: '',
    observaciones: ''
  });

  // Filtrar ambientes
  const filteredAmbientes = ambientes.filter(ambiente => {
    const matchesSearch = ambiente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ambiente.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === '' || ambiente.tipo === filterType;
    const matchesStatus = filterStatus === '' || ambiente.estado === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Obtener tipos únicos para el filtro
  const tiposUnicos = [...new Set(ambientes.map(ambiente => ambiente.tipo))];

  const handleAmbienteClick = (ambiente) => {
    setSelectedAmbiente(ambiente);
    setShowModal(true);
  };

  const handleReservarClick = (ambiente, useModal = true) => {
    setSelectedAmbiente(ambiente);
    if (useModal) {
      setShowReservaModal(true);
    } else {
      setExpandedReservaCard(ambiente._id);
    }
  };

  // Función removida: handleToggleInlineReserva ya no es necesaria

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAmbiente(null);
  };

  const handleCloseReservaModal = () => {
    setShowReservaModal(false);
    setSelectedAmbiente(null);
    setReservaForm({
      fecha: '',
      jornada: '',
      proposito: '',
      observaciones: ''
    });
  };

  const handleReservaSubmit = async (e, ambiente = null, formData = null) => {
    e.preventDefault();
    
    const targetAmbiente = ambiente || selectedAmbiente;
    const targetFormData = formData || reservaForm;
    
    if (!targetAmbiente) {
      alert('Por favor selecciona un ambiente');
      return;
    }

    try {
      await apiService.post('/api/v1/reservas', {
        ambienteId: targetAmbiente._id,
        instructorId: user.id,
        ...targetFormData
      });
      alert('Reserva creada exitosamente');
      
      // Cerrar modal o formulario inline según corresponda
      if (showReservaModal) {
        handleCloseReservaModal();
      }
    } catch (error) {
      alert('Error al crear la reserva: ' + error.message);
    }
  };

  // Renderizar el componente de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-sena-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Cargando ambientes...</p>
        </div>
      </div>
    );
  }

  // Renderizar mensaje de error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl p-8 shadow-lg border border-red-200">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold text-lg">Error al cargar ambientes</p>
          <p className="text-red-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-green-700 to-green-800 p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Gestión de Ambientes</h1>
                <p className="text-slate-100 dark:text-gray-300 opacity-90 mt-1">Panel de control para instructores CTPGA</p>
              </div>
            </div>
          </div>
          
          {/* Barra de búsqueda y filtros */}
          <div className="p-4 md:p-6 border-b border-slate-100 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nombre o ubicación..."
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-700 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-150"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-4 w-4 text-slate-400 dark:text-gray-500" />
                  </div>
                  <select
                    className="appearance-none bg-white border border-gray-300 text-gray-700 pl-10 pr-8 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="">Todos los tipos</option>
                    {tiposUnicos.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-4 w-4 text-slate-400 dark:text-gray-500" />
                  </div>
                  <select
                    className="appearance-none bg-white border border-gray-300 text-gray-700 pl-10 pr-8 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">Todos los estados</option>
                    <option value="disponible">Disponible</option>
                    <option value="ocupado">Ocupado</option>
                    <option value="mantenimiento">En mantenimiento</option>
                  </select>
                </div>
                
                {(searchTerm || filterType || filterStatus) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterType('');
                      setFilterStatus('');
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-gray-300 hover:text-green-800 dark:hover:text-green-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lista de ambientes */}
        {filteredAmbientes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAmbientes.map(ambiente => (
               <AmbienteCard
                 key={ambiente._id}
                 ambiente={ambiente}
                 onAmbienteClick={handleAmbienteClick}
                 onReservaSubmit={handleReservaSubmit}
               />
             ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
            <div className="text-center p-12">
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-slate-50 dark:bg-gray-700 mb-4">
                <Search className="h-10 w-10 text-slate-300 dark:text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No se encontraron ambientes</h3>
              <p className="text-slate-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                No hay ambientes que coincidan con los filtros actuales. Intenta con otros criterios de búsqueda.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('');
                  setFilterStatus('');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800"
              >
                <X className="-ml-1 mr-2 h-4 w-4" />
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de reserva */}
      {showReservaModal && (
        <Modal isOpen={showReservaModal} onClose={handleCloseReservaModal}>
          <div className="relative">
            <button
              onClick={handleCloseReservaModal}
              className="absolute top-0 right-0 -mt-2 -mr-2 p-2 text-slate-400 hover:text-slate-500 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                <Calendar className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Nueva reserva</h2>
              <p className="text-slate-500 dark:text-gray-400 mb-6">
                Completa el formulario para reservar <span className="font-medium text-slate-900 dark:text-white">{selectedAmbiente?.nombre}</span>
              </p>
            </div>
            <form onSubmit={handleReservaSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">
                  Fecha de la reserva <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-slate-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="date"
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={reservaForm.fecha}
                    onChange={(e) => setReservaForm({...reservaForm, fecha: e.target.value})}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">
                  Jornada <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-slate-400 dark:text-gray-500" />
                  </div>
                  <select
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={reservaForm.jornada}
                    onChange={(e) => setReservaForm({...reservaForm, jornada: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar jornada</option>
                    <option value="mañana">Mañana (6:00 - 12:00)</option>
                    <option value="tarde">Tarde (12:00 - 18:00)</option>
                    <option value="noche">Noche (18:00 - 22:00)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">
                  Propósito <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookOpen className="h-5 w-5 text-slate-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Clase de programación"
                    value={reservaForm.proposito}
                    onChange={(e) => setReservaForm({...reservaForm, proposito: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">
                  Observaciones
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3">
                    <svg className="h-5 w-5 text-slate-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <textarea
                    rows={3}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Alguna observación adicional..."
                    value={reservaForm.observaciones}
                    onChange={(e) => setReservaForm({...reservaForm, observaciones: e.target.value})}
                  />
                </div>
              </div>
              <div className="pt-2">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800"
                    onClick={handleCloseReservaModal}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 dark:focus:ring-offset-gray-800 transition-colors duration-150"
                  >
                    Confirmar reserva
                  </button>
                </div>
              </div>
              <div className="mt-6 border-t border-slate-200 dark:border-gray-700 pt-4">
                <p className="text-xs text-slate-500 dark:text-gray-400 text-center">
                  Al hacer clic en "Confirmar reserva", aceptas los términos y condiciones de uso de los espacios del CTPGA.
                </p>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InstructorAmbientesPage;
