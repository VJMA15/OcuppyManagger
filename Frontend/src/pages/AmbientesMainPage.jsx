import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin, Users, Eye, CheckCircle, XCircle, X, Building2, Star } from 'lucide-react';
import { useAmbientes } from '../hooks/useAmbientes';
import { Modal } from '../components/ui';

const AmbientesMainPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { ambientes, loading, error } = useAmbientes();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedAmbiente, setSelectedAmbiente] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Detectar si está en modo guest
  const isGuestMode = searchParams.get('mode') === 'guest';

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
    if (isGuestMode) {
      setSelectedAmbiente(ambiente);
      setShowModal(true);
    } else {
      navigate(`/ambientes/${ambiente._id}`);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAmbiente(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-sena border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Cargando ambientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl p-8 shadow-lg border border-red-200">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold text-lg">Error al cargar ambientes</p>
          <p className="text-red-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Guest Mode Header */}
      {isGuestMode && (
        <div className="bg-gradient-to-r from-sena to-sena-soft-600 text-white py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
                <Building2 className="w-6 h-6" />
                <span className="font-semibold text-lg">Vista de Invitado</span>
              </div>
              <h1 className="text-4xl font-bold mb-4">Explora Nuestros Ambientes</h1>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Descubre todos los espacios disponibles en nuestra institución. Para realizar reservas y acceder a funcionalidades completas, solicita tu cuenta de usuario.
              </p>
              <button 
                onClick={() => window.location.href = '/'}
                className="bg-white text-sena px-8 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                ← Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className={`${isGuestMode ? 'pt-12' : 'pt-12'} px-6 pb-12`}>
        <div className="max-w-7xl mx-auto">
          {/* Header para usuarios autenticados */}
          {!isGuestMode && (
            <div className="mb-12 text-center">
              <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full mb-6 shadow-lg">
                <Building2 className="w-6 h-6 text-sena" />
                <span className="font-semibold text-sena">Gestión de Ambientes</span>
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4">Ambientes Disponibles</h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">Gestiona y reserva los ambientes de la institución de manera eficiente</p>
            </div>
          )}

          {/* Filtros y búsqueda mejorados */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-12">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Barra de búsqueda mejorada */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar ambientes por nombre o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-sena/20 focus:border-sena transition-all duration-200 text-lg placeholder-slate-400"
                />
              </div>
              
              {/* Filtros mejorados */}
              <div className="flex gap-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-6 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-sena/20 focus:border-sena transition-all duration-200 text-lg bg-white"
                >
                  <option value="">Todos los tipos</option>
                  {tiposUnicos.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-6 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-sena/20 focus:border-sena transition-all duration-200 text-lg bg-white"
                >
                  <option value="">Todos los estados</option>
                  <option value="Disponible">Disponible</option>
                  <option value="Ocupado">Ocupado</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                </select>
              </div>
            </div>
            
            {/* Estadísticas rápidas */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-sena">{filteredAmbientes.length}</p>
                  <p className="text-slate-600">Ambientes encontrados</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{filteredAmbientes.filter(a => a.estado === 'Disponible').length}</p>
                  <p className="text-slate-600">Disponibles</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{tiposUnicos.length}</p>
                  <p className="text-slate-600">Tipos diferentes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de ambientes mejorado */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAmbientes.map((ambiente) => (
              <div
                key={ambiente._id}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Header de la tarjeta con gradiente */}
                <div className={`p-6 bg-gradient-to-r ${
                  ambiente.estado === 'Disponible' 
                    ? 'from-green-500 to-emerald-600' 
                    : ambiente.estado === 'Ocupado'
                    ? 'from-red-500 to-rose-600'
                                       : 'from-green-600 to-green-700'
                } text-white relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold leading-tight">
                        {ambiente.nombre}
                      </h3>
                      <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                        {ambiente.estado}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white/90">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{ambiente.ubicacion}</span>
                    </div>
                  </div>
                </div>
                
                {/* Contenido de la tarjeta */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-slate-900">{ambiente.capacidad}</p>
                      <p className="text-sm text-slate-600">personas</p>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <Filter className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-lg font-semibold text-slate-900">{ambiente.tipo}</p>
                      <p className="text-sm text-slate-600">tipo</p>
                    </div>
                  </div>
                  
                  {/* Servicios destacados */}
                  {ambiente.servicios && ambiente.servicios.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm font-medium text-slate-700 mb-2">Servicios destacados:</p>
                      <div className="flex flex-wrap gap-2">
                        {ambiente.servicios.slice(0, 3).map((servicio, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs font-medium">
                            {servicio}
                          </span>
                        ))}
                        {ambiente.servicios.length > 3 && (
                          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-xs font-medium">
                            +{ambiente.servicios.length - 3} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleAmbienteClick(ambiente)}
                    className="w-full bg-gradient-to-r from-sena to-sena-soft-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-sena-soft-600 hover:to-sena transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <Eye className="w-5 h-5" />
                    {isGuestMode ? 'Ver Información Completa' : 'Ver Detalles'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Mensaje cuando no hay resultados */}
          {filteredAmbientes.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 max-w-md mx-auto">
                <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No se encontraron ambientes</h3>
                <p className="text-slate-600">Intenta ajustar los filtros de búsqueda</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal mejorado para guest mode */}
      {isGuestMode && selectedAmbiente && (
        <Modal
          show={showModal}
          onClose={handleCloseModal}
          title="Información del Ambiente"
          size="xl"
        >
          <div className="space-y-8">
            {/* Header del modal con imagen de fondo */}
            <div className="relative bg-gradient-to-r from-sena to-sena-soft-600 rounded-xl p-6 text-white overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-3">
                  {selectedAmbiente.nombre}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <MapPin className="w-4 h-4" />
                    {selectedAmbiente.ubicacion}
                  </span>
                  <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Filter className="w-4 h-4" />
                    {selectedAmbiente.tipo}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedAmbiente.estado === 'Disponible'
                      ? 'bg-green-500 text-white'
                      : selectedAmbiente.estado === 'Ocupado'
                      ? 'bg-red-500 text-white'
                      : 'bg-yellow-500 text-white'
                  }`}>
                    {selectedAmbiente.estado}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Información principal en tarjetas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Capacidad */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500 rounded-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">Capacidad</h3>
                </div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {selectedAmbiente.capacidad}
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">personas máximo</p>
              </div>
              
              {/* Estado del ambiente */}
              <div className={`rounded-xl p-6 border ${
                selectedAmbiente.estado === 'Disponible'
                  ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700'
                  : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-lg ${
                    selectedAmbiente.estado === 'Disponible' ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {selectedAmbiente.estado === 'Disponible' ? 
                      <CheckCircle className="w-6 h-6 text-white" /> : 
                      <XCircle className="w-6 h-6 text-white" />
                    }
                  </div>
                  <h3 className={`font-semibold ${
                    selectedAmbiente.estado === 'Disponible' 
                      ? 'text-green-900 dark:text-green-100' 
                      : 'text-red-900 dark:text-red-100'
                  }`}>Estado</h3>
                </div>
                <p className={`text-2xl font-bold ${
                  selectedAmbiente.estado === 'Disponible' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {selectedAmbiente.estado}
                </p>
                <p className={`text-sm mt-1 ${
                  selectedAmbiente.estado === 'Disponible' 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {selectedAmbiente.estado === 'Disponible' ? 'Listo para reservar' : 'No disponible'}
                </p>
              </div>
              
              {/* Tipo de ambiente */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-500 rounded-lg">
                    <Filter className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100">Tipo</h3>
                </div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {selectedAmbiente.tipo}
                </p>
                <p className="text-purple-700 dark:text-purple-300 text-sm mt-1">de ambiente</p>
              </div>
            </div>
            
            {/* Descripción */}
            {selectedAmbiente.descripcion && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 text-lg">Descripción</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {selectedAmbiente.descripcion}
                </p>
              </div>
            )}
            
            {/* Servicios y Equipos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Servicios */}
              {selectedAmbiente.servicios && selectedAmbiente.servicios.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 text-lg flex items-center gap-2">
                    <div className="p-2 bg-teal-500 rounded-lg">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    Equipos Disponibles
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedAmbiente.servicios.map((servicio, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-700">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{servicio}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Equipos */}
              {selectedAmbiente.equipos && selectedAmbiente.equipos.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 text-lg flex items-center gap-2">
                    <div className="p-2 bg-teal-500 rounded-lg">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    Equipos Disponibles
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedAmbiente.equipos.map((equipo, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-700">
                        <div className="w-3 h-3 bg-teal-500 rounded-full flex-shrink-0"></div>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{equipo}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Mensaje para invitados mejorado */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-xl mb-2">
                      ¿Necesitas reservar este ambiente?
                    </h4>
                    <p className="text-blue-100 leading-relaxed">
                      Para realizar reservas y acceder a todas las funcionalidades del sistema, solicita tu cuenta de usuario a través de los canales oficiales de la institución. Nuestro equipo te ayudará con el proceso de registro.
                    </p>
                    <div className="mt-4 p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                      <p className="text-sm font-medium">💡 Tip: Contacta al administrador del sistema para obtener acceso completo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AmbientesMainPage;