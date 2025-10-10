import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Users, Building2, Calendar, Clock, BookOpen, X, User, AlertCircle, FileText, CheckCircle, Plus } from 'lucide-react';
import { useAmbientes } from '../hooks/useAmbientes';
import { useAuthContext } from '../contexts/auth-context';
import { useTheme } from '../hooks/use-theme';
import Modal from '../components/ui/Modal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Estado mejorado para el formulario del modal
  const [reservaForm, setReservaForm] = useState({
    fecha: '',
    jornada: '',
    proposito: '',
    observaciones: ''
  });
  const [modalErrors, setModalErrors] = useState({});
  const [isModalSubmitting, setIsModalSubmitting] = useState(false);

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
      jornada: '',
      proposito: '',
      observaciones: ''
    });
    setModalErrors({});
  };

  const handleReservaSubmit = async (e) => {
    e.preventDefault();
    setIsModalSubmitting(true);
    setModalErrors({});

    try {
      // Validaciones básicas
      const errors = {};
      if (!reservaForm.fecha) errors.fecha = 'La fecha es requerida';
      if (!reservaForm.jornada) errors.jornada = 'La jornada es requerida';
      if (!reservaForm.proposito.trim()) errors.proposito = 'El propósito es requerido';

      if (Object.keys(errors).length > 0) {
        setModalErrors(errors);
        setIsModalSubmitting(false);
        return;
      }

      const reservaData = {
        ambienteId: selectedAmbiente._id,
        instructorId: user.id,
        fecha: reservaForm.fecha,
        jornada: reservaForm.jornada,
        proposito: reservaForm.proposito.trim(),
        observaciones: reservaForm.observaciones.trim()
      };

      const response = await reservationsService.createReservation(reservaData);
      
      if (response.success) {
        // Resetear formulario y cerrar modal
        setReservaForm({
          fecha: '',
          jornada: '',
          proposito: '',
          observaciones: ''
        });
        setShowReservaModal(false);
        setSelectedAmbiente(null);
        setShowSuccessModal(true);
      } else {
        setModalErrors({ general: response.message || 'Error al crear la reserva' });
      }
      
    } catch (error) {
      console.error('Error al crear reserva:', error);
      setModalErrors({ general: 'Error al crear la reserva. Intente nuevamente.' });
    } finally {
      setIsModalSubmitting(false);
    }
  };

  // Filtrar ambientes
  const filteredAmbientes = ambientes.filter(ambiente => {
    const matchesSearch = ambiente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ambiente.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || ambiente.tipo.toLowerCase() === filterType.toLowerCase();
    const matchesStatus = !filterStatus || ambiente.estado === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Renderizar modal de reserva
  const renderReservaModal = () => {
    if (!showReservaModal || !selectedAmbiente) return null;

    // Definir jornadas igual que en el formulario de admin
    const jornadas = [
      { value: "06:00-12:00", label: "Mañana (6:00 AM - 12:00 PM)" },
      { value: "12:30-18:00", label: "Tarde (12:30 PM - 6:00 PM)" },
      { value: "18:30-22:00", label: "Noche (6:30 PM - 10:00 PM)" }
    ];

    const getAmbienteIcon = (tipo) => {
      switch (tipo) {
        case 'Aula': return '🏫';
        case 'Laboratorio': return '🔬';
        case 'Auditorio': return '🎭';
        case 'Conferencia': return '💼';
        case 'Reunión': return '👥';
        case 'Taller': return '🔧';
        default: return '🏢';
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Nueva Reserva</h2>
                <p className="text-blue-100">
                  Reserva un ambiente para tu actividad
                </p>
              </div>
              <button
                onClick={() => {
                  setShowReservaModal(false);
                  setSelectedAmbiente(null);
                  setReservaForm({
                    fecha: '',
                    jornada: '',
                    proposito: '',
                    observaciones: ''
                  });
                  setModalErrors({});
                }}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              
              {/* Formulario Principal */}
              <div className="xl:col-span-3">
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Información de la Reserva
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Completa los datos para crear tu reserva
                  </p>
                </div>

                {modalErrors.general && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className="text-red-700 dark:text-red-400">{modalErrors.general}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleReservaSubmit} className="space-y-6">
                  {/* Información Personal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Nombre Completo
                      </label>
                      <Input
                        type="text"
                        value={user?.nombre || ''}
                        readOnly
                        disabled
                        className="bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed text-gray-600 dark:text-gray-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <FileText className="w-4 h-4 inline mr-2" />
                        Número de Documento
                      </label>
                      <Input
                        type="text"
                        value={user?.cc || ''}
                        readOnly
                        disabled
                        className="bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed text-gray-600 dark:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Ambiente Seleccionado */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      <Building2 className="inline w-4 h-4 mr-2" />
                      Ambiente Seleccionado
                    </label>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-4">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">
                          {getAmbienteIcon(selectedAmbiente.tipo)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 dark:text-white">
                            {selectedAmbiente.nombre}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {selectedAmbiente.tipo} • Capacidad: {selectedAmbiente.capacidad} personas
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-500">
                            📍 {selectedAmbiente.ubicacion}
                          </p>
                        </div>
                        <CheckCircle className="w-6 h-6 text-blue-500" />
                      </div>
                    </div>
                  </div>

                  {/* Fecha y Jornada */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <Calendar className="inline w-4 h-4 mr-2" />
                        Fecha de Reserva
                      </label>
                      <Input
                        type="date"
                        value={reservaForm.fecha}
                        onChange={(e) => setReservaForm(prev => ({ ...prev, fecha: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className={modalErrors.fecha ? 'border-red-300' : ''}
                        required
                      />
                      {modalErrors.fecha && (
                        <p className="mt-1 text-sm text-red-600">{modalErrors.fecha}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <Clock className="inline w-4 h-4 mr-2" />
                        Jornada
                      </label>
                      <select
                        value={reservaForm.jornada}
                        onChange={(e) => setReservaForm(prev => ({ ...prev, jornada: e.target.value }))}
                        className={`w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-blue-400 transition-all duration-200 ${
                          modalErrors.jornada ? 'border-red-300' : ''
                        }`}
                        required
                      >
                        <option value="">Selecciona una jornada</option>
                        {jornadas.map((jornada, index) => (
                          <option 
                            key={`jornada-${index}-${jornada.value}`} 
                            value={jornada.value}
                          >
                            {jornada.label}
                          </option>
                        ))}
                      </select>
                      {modalErrors.jornada && (
                        <p className="mt-1 text-sm text-red-600">{modalErrors.jornada}</p>
                      )}
                    </div>
                  </div>

                  {/* Motivo */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <FileText className="inline w-4 h-4 mr-2" />
                      Motivo de la Reserva
                    </label>
                    <textarea
                      value={reservaForm.proposito}
                      onChange={(e) => setReservaForm(prev => ({ ...prev, proposito: e.target.value }))}
                      rows={4}
                      className={`w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-blue-400 transition-all duration-200 resize-none ${
                        modalErrors.proposito ? 'border-red-300' : ''
                      }`}
                      placeholder="Describe el motivo de tu reserva..."
                      required
                    />
                    {modalErrors.proposito && (
                      <p className="mt-1 text-sm text-red-600">{modalErrors.proposito}</p>
                    )}
                  </div>

                  {/* Observaciones */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <FileText className="inline w-4 h-4 mr-2" />
                      Observaciones (Opcional)
                    </label>
                    <textarea
                      value={reservaForm.observaciones}
                      onChange={(e) => setReservaForm(prev => ({ ...prev, observaciones: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-blue-400 transition-all duration-200 resize-none"
                      placeholder="Información adicional o requerimientos especiales..."
                    />
                  </div>

                  {/* Botones */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowReservaModal(false);
                        setSelectedAmbiente(null);
                        setReservaForm({
                          fecha: '',
                          jornada: '',
                          proposito: '',
                          observaciones: ''
                        });
                        setModalErrors({});
                      }}
                      className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isModalSubmitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 disabled:bg-blue-400 disabled:border-blue-400"
                    >
                      {isModalSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Procesando...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Plus className="w-4 h-4" />
                          Crear Reserva
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Panel Lateral */}
              <div className="xl:col-span-1 space-y-6">
                {/* Información de Jornadas */}
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-900/80 dark:border-slate-700">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Jornadas Disponibles
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-600 dark:text-slate-400">Mañana</span>
                        <span className="font-medium text-slate-900 dark:text-white">6:00 AM - 12:00 PM</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-600 dark:text-slate-400">Tarde</span>
                        <span className="font-medium text-slate-900 dark:text-white">12:30 PM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-600 dark:text-slate-400">Noche</span>
                        <span className="font-medium text-slate-900 dark:text-white">6:30 PM - 10:00 PM</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Políticas */}
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-900/80 dark:border-slate-700">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Políticas de Reserva
                    </h3>
                    <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Reservas con 24h de anticipación</span>
                      </div>
                      <div className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Máximo 4 horas por reserva</span>
                      </div>
                      <div className="flex items-start gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span>Cancelar con 2h de anticipación</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isModalSubmitting ? 'Procesando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </form>
      </Modal>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-slate-600">Cargando ambientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Error al cargar ambientes</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Gestión de Ambientes</h1>
                <p className="text-slate-100 opacity-90 mt-1">Panel de control para instructores CTPGA</p>
              </div>
            </div>
          </div>
          
          {/* Barra de búsqueda y filtros */}
          <div className="p-4 md:p-6 border-b border-slate-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nombre o ubicación..."
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">Todos los tipos</option>
                  <option value="aula">Aula</option>
                  <option value="laboratorio">Laboratorio</option>
                  <option value="taller">Taller</option>
                  <option value="auditorio">Auditorio</option>
                </select>
                
                <select
                  className="px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Todos los estados</option>
                  <option value="disponible">Disponible</option>
                  <option value="ocupado">Ocupado</option>
                  <option value="mantenimiento">Mantenimiento</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de ambientes */}
        {filteredAmbientes.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No se encontraron ambientes</h3>
            <p className="text-slate-600">
              {searchTerm || filterType || filterStatus
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay ambientes disponibles en este momento'
              }
            </p>
            {(searchTerm || filterType || filterStatus) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('');
                  setFilterStatus('');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-4"
              >
                <X className="-ml-1 mr-2 h-4 w-4" />
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAmbientes.map((ambiente) => (
              <Card key={ambiente._id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold text-slate-900">
                        {ambiente.nombre}
                      </CardTitle>
                      <CardDescription className="flex items-center text-slate-600 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {ambiente.ubicacion}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[ambiente.estado] || statusStyles.inactivo}`}>
                        {ambiente.estado}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeStyles[ambiente.tipo] || typeStyles.otro}`}>
                        {ambiente.tipo}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-slate-600">
                      <Users className="h-4 w-4 mr-2" />
                      Capacidad: {ambiente.capacidad} personas
                    </div>
                    
                    {ambiente.descripcion && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {ambiente.descripcion}
                      </p>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAmbienteClick(ambiente)}
                        className="flex-1"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Ver detalles
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleReservarClick(ambiente)}
                        disabled={ambiente.estado !== 'disponible'}
                        className="flex-1"
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Reservar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modales */}
        {renderReservaModal()}

        {/* Modal de detalles */}
        {showModal && selectedAmbiente && (
          <Modal
            isOpen={showModal}
            onClose={handleCloseModal}
            title={selectedAmbiente.nombre}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[selectedAmbiente.estado] || statusStyles.inactivo}`}>
                  {selectedAmbiente.estado}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${typeStyles[selectedAmbiente.tipo] || typeStyles.otro}`}>
                  {selectedAmbiente.tipo}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Ubicación</h4>
                  <p className="text-gray-600">{selectedAmbiente.ubicacion}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Capacidad</h4>
                  <p className="text-gray-600">{selectedAmbiente.capacidad} personas</p>
                </div>
              </div>
              
              {selectedAmbiente.descripcion && (
                <div>
                  <h4 className="font-medium text-gray-900">Descripción</h4>
                  <p className="text-gray-600">{selectedAmbiente.descripcion}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    handleCloseModal();
                    handleReservarClick(selectedAmbiente);
                  }}
                  disabled={selectedAmbiente.estado !== 'disponible'}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    selectedAmbiente.estado === 'disponible'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Calendar className="h-4 w-4 mr-2 inline" />
                  Reservar
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Modal de éxito */}
        {showSuccessModal && (
          <Modal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            title="¡Reserva exitosa!"
          >
            <div className="text-center py-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">
                Tu reserva ha sido creada exitosamente. Recibirás una confirmación por email.
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Cerrar
              </button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default InstructorAmbientesPage;