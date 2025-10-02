import { useState, useEffect } from 'react';
import { Calendar, Clock, Search, Filter, User, CheckCircle, XCircle, MoreVertical, AlertCircle, MapPin, Users as UsersIcon, Plus, Edit, Trash2, Eye, FileText, Edit3, Building2, Sun } from 'lucide-react';
import { useGuardia } from '@/contexts/GuardiaContext';

const EntregaAmbientesPage = () => {
  const { reservasData, updateReservasData } = useGuardia();
  const [searchTerm, setSearchTerm] = useState(reservasData.filtros?.searchTerm || '');
  const [filterEstado, setFilterEstado] = useState(reservasData.filtros?.filterEstado || 'disponibles');
  const [filterJornada, setFilterJornada] = useState(reservasData.filtros?.filterJornada || 'todas');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('entregar'); // 'entregar', 'view'
  const [selectedEntrega, setSelectedEntrega] = useState(null);
  const [formData, setFormData] = useState({
    instructor: '',
    ambiente: '',
    jornada: '',
    // Datos que se llenan automáticamente al seleccionar ambiente
    capacidad: '',
    ubicacion: '',
    tipo: '',
    equipamiento: ''
  });

  // Datos de ambientes disponibles
  const ambientesDisponibles = [
    {
      id: 'aula-203',
      nombre: 'Aula 203',
      tipo: 'Aula',
      capacidad: 30,
      ubicacion: 'Bloque A - Piso 2',
      equipamiento: 'Proyector, Computador, Tablero inteligente'
    },
    {
      id: 'lab-electronica',
      nombre: 'Laboratorio de Electrónica',
      tipo: 'Laboratorio',
      capacidad: 20,
      ubicacion: 'Bloque C - Piso 3',
      equipamiento: 'Equipos de medición, Protoboards, Componentes electrónicos'
    },
    {
      id: 'sala-reuniones',
      nombre: 'Sala de Reuniones',
      tipo: 'Sala de Reuniones',
      capacidad: 15,
      ubicacion: 'Bloque B - Piso 1',
      equipamiento: 'Mesa de conferencias, Proyector, Sistema de audio'
    },
    {
      id: 'auditorio',
      nombre: 'Auditorio Principal',
      tipo: 'Auditorio',
      capacidad: 100,
      ubicacion: 'Bloque Central',
      equipamiento: 'Sistema de sonido profesional, Proyector HD, Escenario'
    }
  ];

  // Datos de entregas realizadas
  const [entregas, setEntregas] = useState(reservasData.data || [
    {
      id: 1,
      instructor: 'Juan Pérez',
      ambiente: 'Aula 203',
      jornada: 'mañana',
      fecha: '2023-11-16',
      horaEntrega: '08:00',
      estado: 'entregado',
      capacidad: 30,
      ubicacion: 'Bloque A - Piso 2',
      tipo: 'Aula',
      equipamiento: 'Proyector, Computador, Tablero inteligente'
    },
    {
      id: 2,
      instructor: 'María Gómez',
      ambiente: 'Sala de Reuniones',
      jornada: 'mañana',
      fecha: '2023-11-16',
      horaEntrega: '10:00',
      estado: 'entregado',
      capacidad: 15,
      ubicacion: 'Bloque B - Piso 1',
      tipo: 'Sala de Reuniones',
      equipamiento: 'Mesa de conferencias, Proyector, Sistema de audio'
    },
    {
      id: 3,
      instructor: 'Carlos Ruiz',
      ambiente: 'Laboratorio de Electrónica',
      jornada: 'tarde',
      fecha: '2023-11-16',
      horaEntrega: '14:00',
      estado: 'entregado',
      capacidad: 20,
      ubicacion: 'Bloque C - Piso 3',
      tipo: 'Laboratorio',
      equipamiento: 'Equipos de medición, Protoboards, Componentes electrónicos'
    }
  ]);

  // Función para manejar el cambio de ambiente y llenar datos automáticamente
  const handleAmbienteChange = (ambienteNombre) => {
    const ambienteSeleccionado = ambientesDisponibles.find(amb => amb.nombre === ambienteNombre);
    
    if (ambienteSeleccionado) {
      setFormData(prev => ({
        ...prev,
        ambiente: ambienteNombre,
        capacidad: ambienteSeleccionado.capacidad,
        ubicacion: ambienteSeleccionado.ubicacion,
        tipo: ambienteSeleccionado.tipo,
        equipamiento: ambienteSeleccionado.equipamiento
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        ambiente: ambienteNombre,
        capacidad: '',
        ubicacion: '',
        tipo: '',
        equipamiento: ''
      }));
    }
  };

  // useEffect para actualizar el contexto con entregas y filtros
  useEffect(() => {
    updateReservasData({
      data: entregas,
      filtros: { searchTerm, filterEstado, filterJornada }
    });
  }, [entregas, searchTerm, filterEstado, filterJornada, updateReservasData]);

  // useEffect para restaurar filtros desde el contexto al montar el componente
  useEffect(() => {
    if (reservasData.filtros) {
      setSearchTerm(reservasData.filtros.searchTerm || '');
      setFilterEstado(reservasData.filtros.filterEstado || 'disponibles');
      setFilterJornada(reservasData.filtros.filterJornada || 'todas');
    }
  }, []);

  // Filtrar entregas
  const entregasFiltradas = entregas.filter(entrega => {
    const matchesSearch = entrega.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entrega.ambiente.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEstado = filterEstado === 'todas' || 
                         (filterEstado === 'disponibles' && entrega.estado !== 'entregado') ||
                         (filterEstado === 'entregados' && entrega.estado === 'entregado');
    const matchesJornada = filterJornada === 'todas' || entrega.jornada === filterJornada;
    
    return matchesSearch && matchesEstado && matchesJornada;
  });

  // Obtener ambientes disponibles para una jornada específica
  const getAmbientesDisponibles = (jornada) => {
    if (!jornada) return ambientesDisponibles;
    
    const ambientesEntregados = entregas
      .filter(entrega => entrega.jornada === jornada && entrega.estado === 'entregado')
      .map(entrega => entrega.ambiente);
    
    return ambientesDisponibles.filter(ambiente => !ambientesEntregados.includes(ambiente.nombre));
  };

  // Funciones de manejo
  const handleEntregarAmbiente = () => {
    setModalType('entregar');
    setSelectedEntrega(null);
    setFormData({
      instructor: '',
      ambiente: '',
      jornada: '',
      capacidad: '',
      ubicacion: '',
      tipo: '',
      equipamiento: ''
    });
    setShowModal(true);
  };

  const handleViewEntrega = (entrega) => {
    setModalType('view');
    setSelectedEntrega(entrega);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (modalType === 'entregar') {
      const nuevaEntrega = {
        id: Date.now(),
        ...formData,
        fecha: new Date().toISOString().split('T')[0],
        horaEntrega: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        estado: 'entregado',
        capacidad: parseInt(formData.capacidad)
      };
      setEntregas([...entregas, nuevaEntrega]);
    }
    
    setShowModal(false);
  };

  const handleDevolverAmbiente = (id) => {
    if (window.confirm('¿Confirmar devolución del ambiente?')) {
      setEntregas(entregas.filter(entrega => entrega.id !== id));
    }
  };




  const getEstadoStyles = (estado) => {
    switch (estado) {
      case 'entregado':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300';
      case 'disponible':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
      default:
        return 'bg-gray-50 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400';
    }
  };

  const getTipoStyles = (tipo) => {
    switch (tipo) {
      case 'Aula':
        return 'bg-slate-50 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300';
      case 'Laboratorio':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300';
      case 'Sala de Reuniones':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300';
      case 'Auditorio':
        return 'bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300';
      default:
        return 'bg-gray-50 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400';
    }
  };

  const getJornadaStyles = (jornada) => {
    switch (jornada) {
      case 'mañana':
        return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'tarde':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300';
      case 'noche':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300';
      default:
        return 'bg-gray-50 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400';
    }
  };

  // Función para formatear la fecha en formato legible
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 px-6 py-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl shadow-sm">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Entrega de Ambientes</h2>
                <p className="text-slate-600 dark:text-slate-400">Control de entrega y devolución de ambientes académicos</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-4">
              <button
                onClick={handleEntregarAmbiente}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border border-slate-600"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Entregar Ambiente</span>
              </button>
              <div className="flex items-center bg-white dark:bg-slate-700 rounded-lg p-1 border border-slate-200 dark:border-slate-600">
                <span className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-600 mx-2"></div>
                <span className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por instructor o ambiente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white placeholder-slate-400 transition-all duration-200"
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white appearance-none"
                >
                  <option value="disponibles">Disponibles</option>
                  <option value="entregado">Entregados</option>
                  <option value="todos">Todos los estados</option>
                </select>
              </div>
            </div>
            <div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select
                  value={filterJornada}
                  onChange={(e) => setFilterJornada(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white appearance-none"
                >
                  <option value="todas">Todas las jornadas</option>
                  <option value="mañana">Mañana</option>
                  <option value="tarde">Tarde</option>
                  <option value="noche">Noche</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de reservas */}
      <div className="space-y-4">
        {entregasFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {entregasFiltradas.map((entrega) => (
              <div 
                key={entrega.id}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                            {entrega.ambiente}
                          </h3>
                          <div className="flex items-center gap-2 mb-4">
                            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getTipoStyles(entrega.tipo)}`}>
                              {entrega.tipo}
                            </span>
                            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getJornadaStyles(entrega.jornada)}`}>
                              {entrega.jornada.charAt(0).toUpperCase() + entrega.jornada.slice(1)}
                            </span>
                            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getEstadoStyles(entrega.estado)}`}>
                              {entrega.estado.charAt(0).toUpperCase() + entrega.estado.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleViewEntrega(entrega)}
                            className="p-1.5 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {entrega.estado === 'entregado' && (
                            <button 
                              onClick={() => handleDevolverAmbiente(entrega.id)}
                              className="p-1.5 text-green-500 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                              title="Devolver ambiente"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Instructor</p>
                            <p className="text-slate-900 dark:text-white font-medium">{entrega.instructor || 'No asignado'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-1">
                              <Clock className="w-3 h-3 mr-1" />
                              {entrega.horaEntrega || 'Pendiente'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Ubicación</p>
                            <p className="text-slate-900 dark:text-white font-medium">{entrega.ubicacion}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-1">
                              <UsersIcon className="w-3 h-3 mr-1" />
                              Capacidad: {entrega.capacidad} personas
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Fecha</p>
                            <p className="text-slate-900 dark:text-white font-medium">
                              {formatDate(entrega.fechaEntrega)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Equipamiento</p>
                            <p className="text-slate-900 dark:text-white font-medium">
                              {entrega.equipamiento || 'Básico'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Jornada: {entrega.jornada}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {entrega.estado === 'entregado' && entrega.horaEntrega && (
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-green-800 dark:text-green-300">Ambiente entregado:</p>
                              <p className="text-sm text-green-700 dark:text-green-400">Hora de entrega: {entrega.horaEntrega}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-48 flex-shrink-0">
                      {entrega.estado === 'disponible' && (
                        <button 
                          onClick={() => handleEntregarAmbiente()}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Entregar
                        </button>
                      )}
                      {entrega.estado === 'entregado' && (
                        <button 
                          onClick={() => handleDevolverAmbiente(entrega.id)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Devolver
                          </button>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl shadow border border-slate-200 dark:border-slate-700">
            <div className="bg-slate-100 dark:bg-slate-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
              No se encontraron entregas
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {searchTerm || filterEstado !== 'todos' || filterJornada !== 'todas'
                ? 'No hay entregas que coincidan con los filtros actuales.'
                : 'No hay entregas de ambientes para mostrar en este momento.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal para crear/editar/ver reservas */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="relative p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-600 dark:bg-slate-700 rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {modalType === 'create' && 'Entrega de Ambiente'}
                    {modalType === 'view' && 'Detalles de la Entrega'}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {modalType === 'create' && 'Complete la información para entregar el ambiente al instructor'}
                    {modalType === 'view' && 'Información completa de la entrega seleccionada'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {modalType === 'view' ? (
                <div className="space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Información de la Entrega
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          Ambiente
                        </label>
                        <p className="text-slate-900 dark:text-white font-medium">{selectedEntrega?.ambiente}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Instructor
                        </label>
                        <p className="text-slate-900 dark:text-white font-medium">{selectedEntrega?.instructor || 'No asignado'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          Ubicación
                        </label>
                        <p className="text-slate-900 dark:text-white font-medium">{selectedEntrega?.ubicacion}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Fecha de Entrega
                        </label>
                        <p className="text-slate-900 dark:text-white font-medium">{selectedEntrega?.fechaEntrega}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Hora de Entrega
                        </label>
                        <p className="text-slate-900 dark:text-white font-medium">{selectedEntrega?.horaEntrega || 'Pendiente'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                          <Sun className="w-4 h-4" />
                          Jornada
                        </label>
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getJornadaStyles(selectedEntrega?.jornada)}`}>
                          {selectedEntrega?.jornada?.charAt(0).toUpperCase() + selectedEntrega?.jornada?.slice(1)}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Estado
                        </label>
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getEstadoStyles(selectedEntrega?.estado)}`}>
                          {selectedEntrega?.estado?.charAt(0).toUpperCase() + selectedEntrega?.estado?.slice(1)}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          Tipo de Ambiente
                        </label>
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getTipoStyles(selectedEntrega?.tipo)}`}>
                          {selectedEntrega?.tipo}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                          <UsersIcon className="w-4 h-4" />
                          Capacidad
                        </label>
                        <p className="text-slate-900 dark:text-white font-medium">{selectedEntrega?.capacidad} personas</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                          <Settings className="w-4 h-4" />
                          Equipamiento
                        </label>
                        <p className="text-slate-900 dark:text-white font-medium">{selectedEntrega?.equipamiento || 'Básico'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Información básica */}
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Información Básica
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                          <Edit3 className="w-4 h-4" />
                          Título *
                        </label>
                        <input
                          type="text"
                          value={formData.titulo}
                          onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                          placeholder="Título de la reserva"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          Ambiente *
                        </label>
                        <select
                          value={formData.ambiente}
                          onChange={(e) => handleAmbienteChange(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                          required
                        >
                          <option value="">Seleccionar ambiente</option>
                          <option value="Laboratorio 1">Laboratorio 1</option>
                          <option value="Laboratorio 2">Laboratorio 2</option>
                          <option value="Aula 101">Aula 101</option>
                          <option value="Aula 102">Aula 102</option>
                          <option value="Sala de Conferencias">Sala de Conferencias</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Docente *
                        </label>
                        <input
                          type="text"
                          value={formData.docente}
                          onChange={(e) => setFormData({...formData, docente: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                          placeholder="Nombre del docente"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Fecha *
                        </label>
                        <input
                          type="date"
                          value={formData.fecha}
                          onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Horarios */}
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Horarios
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Hora de Inicio *
                        </label>
                        <input
                          type="time"
                          value={formData.horaInicio}
                          onChange={(e) => setFormData({...formData, horaInicio: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Hora de Fin *
                        </label>
                        <input
                          type="time"
                          value={formData.horaFin}
                          onChange={(e) => setFormData({...formData, horaFin: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Configuración */}
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Filter className="w-5 h-5" />
                      Configuración
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Estado
                        </label>
                        <select
                          value={formData.estado}
                          onChange={(e) => setFormData({...formData, estado: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="activa">Activa</option>
                          <option value="cancelada">Cancelada</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                          <Filter className="w-4 h-4" />
                          Tipo *
                        </label>
                        <select
                          value={formData.tipo}
                          onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                          required
                        >
                          <option value="">Seleccionar tipo</option>
                          <option value="clase">Clase</option>
                          <option value="Taller">Taller</option>
                          <option value="reunion">Reunión</option>
                          <option value="evento">Evento</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                          <UsersIcon className="w-4 h-4" />
                          Capacidad *
                        </label>
                        <input
                          type="number"
                          value={formData.capacidad}
                          onChange={(e) => setFormData({...formData, capacidad: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                          placeholder="Número máximo de personas"
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                          <UsersIcon className="w-4 h-4" />
                          Participantes
                        </label>
                        <input
                          type="number"
                          value={formData.participantes}
                          onChange={(e) => setFormData({...formData, participantes: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                          placeholder="Número de participantes"
                          min="0"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          Ubicación *
                        </label>
                        <input
                          type="text"
                          value={formData.ubicacion}
                          onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                          placeholder="Ubicación específica del ambiente"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 -mx-6 -mb-6 px-6 py-4 rounded-b-2xl">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white px-8 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                    >
                      {modalType === 'create' ? (
                        <>
                          <Plus className="w-4 h-4" />
                          Crear Reserva
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Guardar Cambios
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
              
              {modalType === 'view' && (
                <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 -mx-6 -mb-6 px-6 py-4 rounded-b-2xl">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntregaAmbientesPage;
