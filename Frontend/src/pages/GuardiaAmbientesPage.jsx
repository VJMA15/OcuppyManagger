import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Users, Eye, CheckCircle, XCircle, Building2, Shield, AlertTriangle, Clock, UserCheck } from 'lucide-react';
import { useAmbientes } from '../hooks/useAmbientes';
import { useAuthContext } from '../contexts/auth-context';
import { Modal } from '../components/ui';
import apiService from '../services/api';

const GuardiaAmbientesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { ambientes, loading, error } = useAmbientes();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedAmbiente, setSelectedAmbiente] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showIncidenciaModal, setShowIncidenciaModal] = useState(false);
  const [incidenciaForm, setIncidenciaForm] = useState({
    tipo: '',
    descripcion: '',
    prioridad: 'media'
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

  const handleReportarIncidencia = (ambiente) => {
    setSelectedAmbiente(ambiente);
    setShowIncidenciaModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAmbiente(null);
  };

  const handleCloseIncidenciaModal = () => {
    setShowIncidenciaModal(false);
    setSelectedAmbiente(null);
    setIncidenciaForm({
      tipo: '',
      descripcion: '',
      prioridad: 'media'
    });
  };

  const handleIncidenciaSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.post('/incidencias', {
        ambienteId: selectedAmbiente._id,
        guardiaId: user.id,
        ...incidenciaForm
      });
      alert('Incidencia reportada exitosamente');
      handleCloseIncidenciaModal();
    } catch (error) {
      alert('Error al reportar incidencia: ' + error.message);
    }
  };

  const handleCambiarEstado = async (ambienteId, nuevoEstado) => {
    try {
      await apiService.patch(`/ambientes/${ambienteId}`, {
        estado: nuevoEstado,
        modificadoPor: user.id
      });
      alert('Estado del ambiente actualizado');
      // Recargar ambientes
      window.location.reload();
    } catch (error) {
      alert('Error al cambiar estado: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
      {/* Header para Guardias */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
                <Shield className="w-6 h-6" />
                <span className="font-semibold text-lg">Panel de Guardia</span>
              </div>
              <h1 className="text-4xl font-bold mb-4">Monitoreo de Ambientes</h1>
              <p className="text-xl opacity-90 mb-8 max-w-2xl">
                Bienvenido {user?.nombre}. Controla el acceso y estado de los ambientes de la institución.
              </p>
            </div>
            <div className="hidden lg:flex flex-col gap-4">
              <button 
                onClick={() => navigate('/incidencias')}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 flex items-center gap-2"
              >
                <AlertTriangle className="w-5 h-5" />
                Ver Incidencias
              </button>
              <button 
                onClick={() => navigate('/registros-acceso')}
                className="bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-200 flex items-center gap-2"
              >
                <UserCheck className="w-5 h-5" />
                Registros de Acceso
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
                  className="w-full pl-12 pr-6 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 text-lg placeholder-slate-400"
                />
              </div>
              
              {/* Filtros */}
              <div className="flex gap-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-6 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 text-lg bg-white"
                >
                  <option value="">Todos los tipos</option>
                  {tiposUnicos.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-6 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 text-lg bg-white"
                >
                  <option value="">Todos los estados</option>
                  <option value="Disponible">Disponible</option>
                  <option value="Ocupado">Ocupado</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                </select>
              </div>
            </div>
            
            {/* Estadísticas de monitoreo */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{filteredAmbientes.filter(a => a.estado === 'Disponible').length}</p>
                  <p className="text-slate-600">Disponibles</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{filteredAmbientes.filter(a => a.estado === 'Ocupado').length}</p>
                  <p className="text-slate-600">Ocupados</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{filteredAmbientes.filter(a => a.estado === 'Mantenimiento').length}</p>
                  <p className="text-slate-600">En mantenimiento</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{filteredAmbientes.length}</p>
                  <p className="text-slate-600">Total monitoreados</p>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de ambientes con controles de guardia */}
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
                      <div className="flex items-center gap-2">
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                          {ambiente.estado}
                        </span>
                        <Clock className="w-4 h-4" />
                      </div>
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
                  
                  {/* Controles de estado rápidos */}
                  <div className="mb-6">
                    <p className="text-sm font-medium text-slate-700 mb-3">Cambiar estado:</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCambiarEstado(ambiente._id, 'Disponible')}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          ambiente.estado === 'Disponible'
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-green-50'
                        }`}
                      >
                        Disponible
                      </button>
                      <button
                        onClick={() => handleCambiarEstado(ambiente._id, 'Ocupado')}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          ambiente.estado === 'Ocupado'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-red-50'
                        }`}
                      >
                        Ocupado
                      </button>
                      <button
                        onClick={() => handleCambiarEstado(ambiente._id, 'Mantenimiento')}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          ambiente.estado === 'Mantenimiento'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-yellow-50'
                        }`}
                      >
                        Mantto.
                      </button>
                    </div>
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAmbienteClick(ambiente)}
                      className="flex-1 bg-gradient-to-r from-slate-500 to-slate-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-slate-600 hover:to-slate-700 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Monitorear
                    </button>
                    <button
                      onClick={() => handleReportarIncidencia(ambiente)}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Incidencia
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de monitoreo del ambiente */}
      {selectedAmbiente && showModal && (
        <Modal
          show={showModal}
          onClose={handleCloseModal}
          title={`Monitoreo - ${selectedAmbiente.nombre}`}
          size="xl"
        >
          {/* Contenido específico para guardias con información de acceso, reservas activas, etc. */}
        </Modal>
      )}

      {/* Modal de reporte de incidencia */}
      {selectedAmbiente && showIncidenciaModal && (
        <Modal
          show={showIncidenciaModal}
          onClose={handleCloseIncidenciaModal}
          title={`Reportar Incidencia - ${selectedAmbiente.nombre}`}
          size="lg"
        >
          <form onSubmit={handleIncidenciaSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de incidencia</label>
              <select
                value={incidenciaForm.tipo}
                onChange={(e) => setIncidenciaForm({...incidenciaForm, tipo: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              >
                <option value="">Seleccionar tipo</option>
                <option value="Daño en equipos">Daño en equipos</option>
                <option value="Problema eléctrico">Problema eléctrico</option>
                <option value="Limpieza requerida">Limpieza requerida</option>
                <option value="Acceso no autorizado">Acceso no autorizado</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Prioridad</label>
              <select
                value={incidenciaForm.prioridad}
                onChange={(e) => setIncidenciaForm({...incidenciaForm, prioridad: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Descripción detallada</label>
              <textarea
                value={incidenciaForm.descripcion}
                onChange={(e) => setIncidenciaForm({...incidenciaForm, descripcion: e.target.value})}
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Describe la incidencia en detalle..."
                required
              />
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleCloseIncidenciaModal}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Reportar Incidencia
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default GuardiaAmbientesPage;