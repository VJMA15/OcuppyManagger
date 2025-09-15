import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Users, Building2, Calendar, Clock, BookOpen, X } from 'lucide-react';
import { useAmbientes } from '../hooks/useAmbientes';
import { useAuthContext } from '../contexts/auth-context';
import { Modal } from '../components/ui';
import apiService from '../services/api';

// Estilos personalizados para los botones de estado
const statusStyles = {
  disponible: 'bg-green-100 text-green-800 border-green-200',
  ocupado: 'bg-red-100 text-red-800 border-red-200',
  mantenimiento: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  inactivo: 'bg-gray-100 text-gray-800 border-gray-200'
};

// Estilos para los tipos de ambiente
const typeStyles = {
  aula: 'bg-blue-50 text-blue-700 border-blue-200',
  laboratorio: 'bg-purple-50 text-purple-700 border-purple-200',
  taller: 'bg-amber-50 text-amber-700 border-amber-200',
  auditorio: 'bg-rose-50 text-rose-700 border-rose-200',
  otro: 'bg-gray-50 text-gray-700 border-gray-200'
};

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
  const [reservaForm, setReservaForm] = useState({
    fecha: '',
    horaInicio: '',
    horaFin: '',
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

  const handleReservarClick = (ambiente) => {
    setSelectedAmbiente(ambiente);
    setShowReservaModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAmbiente(null);
  };

  const handleCloseReservaModal = () => {
    setShowReservaModal(false);
    setSelectedAmbiente(null);
    setReservaForm({
      fecha: '',
      horaInicio: '',
      horaFin: '',
      proposito: '',
      observaciones: ''
    });
  };

  const handleReservaSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.post('/reservas', {
        ambienteId: selectedAmbiente._id,
        instructorId: user.id,
        ...reservaForm
      });
      alert('Reserva creada exitosamente');
      handleCloseReservaModal();
    } catch (error) {
      alert('Error al crear la reserva: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-slate-200">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-sena-600 border-t-transparent"></div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Cargando ambientes</h3>
          <p className="text-slate-500 text-sm">Estamos preparando todo para ti</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-red-100 overflow-hidden">
          <div className="bg-red-50 p-4 border-b border-red-100 flex items-center">
            <XCircle className="w-6 h-6 text-red-500 mr-2" />
            <h3 className="text-red-700 font-semibold">Error al cargar ambientes</h3>
          </div>
          <div className="p-6">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-sena-600 hover:bg-sena-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Función para renderizar el contenido principal
  const renderMainContent = () => {
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header para Instructores */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
                <BookOpen className="w-6 h-6" />
                <span className="font-semibold text-lg">Panel de Instructor</span>
              </div>
              <h1 className="text-4xl font-bold mb-4">Gestión de Ambientes</h1>
              <p className="text-xl opacity-90 mb-8 max-w-2xl">
                Bienvenido {user?.nombre}. Reserva y gestiona ambientes para tus clases y actividades académicas.
              </p>
            </div>
            <div className="hidden lg:flex flex-col gap-4">
              <button 
                onClick={() => navigate('/mis-reservas')}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 flex items-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Mis Reservas
              </button>
              <button 
                onClick={() => navigate('/crear-reserva')}
                className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nueva Reserva
              </button>
            </div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative">
              <input
                  type="text"
                  placeholder="Buscar por nombre o ubicación..."
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sena-500 focus:border-transparent transition duration-150"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-4 w-4 text-slate-400" />
                  </div>
                  <select
                    className="appearance-none bg-white border border-slate-300 text-slate-700 pl-10 pr-8 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-sena-500 focus:border-transparent cursor-pointer"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="">Todos los tipos</option>
                    {tiposUnicos.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none -rotate-90" />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Sliders className="h-4 w-4 text-slate-400" />
                  </div>
                  <select
                    className="appearance-none bg-white border border-slate-300 text-slate-700 pl-10 pr-8 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-sena-500 focus:border-transparent cursor-pointer"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">Todos los estados</option>
                    <option value="disponible">Disponible</option>
                    <option value="ocupado">Ocupado</option>
                    <option value="mantenimiento">En mantenimiento</option>
                  </select>
                  <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none -rotate-90" />
                </div>
                
                {(searchTerm || filterType || filterStatus) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterType('');
                      setFilterStatus('');
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-sena-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Grid de ambientes */}
        {filteredAmbientes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAmbientes.map((ambiente) => (
              <div
                key={ambiente._id}
                className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-slate-100 hover:border-slate-200"
              >
                {/* Encabezado de la tarjeta */}
                <div className="relative">
                  <div className="h-36 bg-gradient-to-r from-slate-100 to-slate-200 flex items-center justify-center">
                    <Building2 className="h-12 w-12 text-slate-400" />
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[ambiente.estado] || statusStyles.inactivo}`}>
                      {ambiente.estado.charAt(0).toUpperCase() + ambiente.estado.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Cuerpo de la tarjeta */}
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-sena-600 transition-colors">
                        {ambiente.nombre}
                      </h3>
                      <p className="text-slate-500 text-sm mt-1 flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                        {ambiente.ubicacion}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeStyles[ambiente.tipo?.toLowerCase()] || typeStyles.otro}`}>
                      {ambiente.tipo}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-slate-50 rounded-lg mr-3">
                          <Users className="h-4 w-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Capacidad</p>
                          <p className="font-medium text-slate-800">{ambiente.capacidad} personas</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="p-2 bg-slate-50 rounded-lg mr-3">
                          <BookOpen className="h-4 w-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Tipo</p>
                          <p className="font-medium text-slate-800">{ambiente.tipo}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between items-center">
                    <button
                      onClick={() => handleAmbienteClick(ambiente)}
                      className="text-sm font-medium text-sena-600 hover:text-sena-700 flex items-center group-hover:underline"
                    >
                      Ver detalles
                      <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReservarClick(ambiente);
                      }}
                      disabled={ambiente.estado !== 'disponible'}
                      className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors ${
                        ambiente.estado === 'disponible'
                          ? 'bg-sena-600 text-white hover:bg-sena-700 shadow-sm hover:shadow-md'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Reservar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="text-center p-12">
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-slate-50 mb-4">
                <Search className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">No se encontraron ambientes</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-6">
                No hay ambientes que coincidan con los filtros actuales. Intenta con otros criterios de búsqueda.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('');
                  setFilterStatus('');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sena-600 hover:bg-sena-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sena-500"
              >
                <X className="-ml-1 mr-2 h-4 w-4" />
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  };

  // Función para renderizar el modal de reserva
  const renderReservaModal = () => {
    if (!showReservaModal) return null;
    
    return (
      <Modal isOpen={showReservaModal} onClose={handleCloseReservaModal}>
        <div className="relative">
          <button
            onClick={handleCloseReservaModal}
            className="absolute top-0 right-0 -mt-2 -mr-2 p-2 text-slate-400 hover:text-slate-500"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-sena-100 mb-4">
              <Calendar className="h-8 w-8 text-sena-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Nueva reserva</h2>
            <p className="text-slate-500 mb-6">
              Completa el formulario para reservar <span className="font-medium text-slate-900">{selectedAmbiente?.nombre}</span>
            </p>
          </div>
          <form onSubmit={handleReservaSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Fecha de la reserva <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="date"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sena-500 focus:border-transparent"
                  value={reservaForm.fecha}
                  onChange={(e) => setReservaForm({...reservaForm, fecha: e.target.value})}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Hora de inicio <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="time"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sena-500 focus:border-transparent"
                    value={reservaForm.horaInicio}
                    onChange={(e) => setReservaForm({...reservaForm, horaInicio: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Hora de fin <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="time"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sena-500 focus:border-transparent"
                    value={reservaForm.horaFin}
                    onChange={(e) => setReservaForm({...reservaForm, horaFin: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Propósito <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BookOpen className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sena-500 focus:border-transparent"
                  placeholder="Ej: Clase de programación"
                  value={reservaForm.proposito}
                  onChange={(e) => setReservaForm({...reservaForm, proposito: e.target.value})}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Observaciones
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <textarea
                  rows={3}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sena-500 focus:border-transparent"
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
                  className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sena-500"
                  onClick={handleCloseReservaModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sena-600 hover:bg-sena-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sena-500 transition-colors duration-150"
                >
                  Confirmar reserva
                </button>
              </div>
            </div>
            <div className="mt-6 border-t border-slate-200 pt-4">
              <p className="text-xs text-slate-500 text-center">
                Al hacer clic en "Confirmar reserva", aceptas los términos y condiciones de uso de los espacios del CTPGA.
              </p>
            </div>
          </form>
        </div>
      </Modal>
    );
  };

  // Renderizar el componente completo
  return (
    <>
      {renderMainContent()}
      {renderReservaModal()}
    </>
  );
};

export default InstructorAmbientesPage;