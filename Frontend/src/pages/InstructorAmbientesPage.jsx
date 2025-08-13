import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Users, Eye, CheckCircle, XCircle, Building2, Calendar, Clock, Plus, BookOpen } from 'lucide-react';
import { useAmbientes } from '../hooks/useAmbientes';
import { useAuthContext } from '../contexts/auth-context';
import { Modal } from '../components/ui';
import apiService from '../services/api';

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
        </div>
      </div>

      {/* Contenido principal */}
      <div className="pt-12 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Filtros y búsqueda */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-12">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Barra de búsqueda */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar ambientes por nombre o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg placeholder-slate-400"
                />
              </div>
              
              {/* Filtros */}
              <div className="flex gap-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-6 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg bg-white"
                >
                  <option value="">Todos los tipos</option>
                  {tiposUnicos.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-6 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg bg-white"
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{filteredAmbientes.length}</p>
                  <p className="text-slate-600">Ambientes encontrados</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{filteredAmbientes.filter(a => a.estado === 'Disponible').length}</p>
                  <p className="text-slate-600">Disponibles</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{tiposUnicos.length}</p>
                  <p className="text-slate-600">Tipos diferentes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">0</p>
                  <p className="text-slate-600">Mis reservas hoy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de ambientes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAmbientes.map((ambiente) => (
              <div
                key={ambiente._id}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Header de la tarjeta */}
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
                  
                  {/* Botones de acción */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAmbienteClick(ambiente)}
                      className="flex-1 bg-gradient-to-r from-slate-500 to-slate-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-slate-600 hover:to-slate-700 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Detalles
                    </button>
                    {ambiente.estado === 'Disponible' && (
                      <button
                        onClick={() => handleReservarClick(ambiente)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        Reservar
                      </button>
                    )}
                  </div>
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

      {/* Modal de detalles del ambiente */}
      {selectedAmbiente && showModal && (
        <Modal
          show={showModal}
          onClose={handleCloseModal}
          title="Información del Ambiente"
          size="xl"
        >
          {/* ... contenido similar al modal de guest pero con opciones de instructor ... */}
        </Modal>
      )}

      {/* Modal de reserva */}
      {selectedAmbiente && showReservaModal && (
        <Modal
          show={showReservaModal}
          onClose={handleCloseReservaModal}
          title={`Reservar ${selectedAmbiente.nombre}`}
          size="lg"
        >
          <form onSubmit={handleReservaSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Fecha</label>
                <input
                  type="date"
                  value={reservaForm.fecha}
                  onChange={(e) => setReservaForm({...reservaForm, fecha: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Hora de inicio</label>
                <input
                  type="time"
                  value={reservaForm.horaInicio}
                  onChange={(e) => setReservaForm({...reservaForm, horaInicio: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Hora de fin</label>
                <input
                  type="time"
                  value={reservaForm.horaFin}
                  onChange={(e) => setReservaForm({...reservaForm, horaFin: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Propósito</label>
                <select
                  value={reservaForm.proposito}
                  onChange={(e) => setReservaForm({...reservaForm, proposito: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Seleccionar propósito</option>
                  <option value="Clase teórica">Clase teórica</option>
                  <option value="Clase práctica">Clase práctica</option>
                  <option value="Evaluación">Evaluación</option>
                  <option value="Reunión">Reunión</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Observaciones</label>
              <textarea
                value={reservaForm.observaciones}
                onChange={(e) => setReservaForm({...reservaForm, observaciones: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Observaciones adicionales (opcional)"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleCloseReservaModal}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Reserva
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default InstructorAmbientesPage;