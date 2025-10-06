import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Filter, Search, Plus, Eye, Edit, Trash2, ArrowLeft, Building2, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/auth-context';
import reservationsService from '@/services/reservationsService';
import { Button, Card, CardContent } from '@/components/ui';

const MisReservasPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todas');
  const [filterFecha, setFilterFecha] = useState('todas');
  
  // Estados para el modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reservaToCancel, setReservaToCancel] = useState(null);

  useEffect(() => {
    fetchMisReservas();
  }, []);

  const fetchMisReservas = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await reservationsService.getMyReservations();
      if (response.success) {
        setReservas(response.data || []);
      } else {
        setError(response.message || 'Error al cargar las reservas');
        setReservas([]);
      }
    } catch (err) {
      console.error('Error fetching reservas:', err);
      setError('Error al cargar las reservas');
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarReserva = (reservaId, event) => {
    // Prevenir la propagación del evento
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Mostrar modal de confirmación personalizado
    setReservaToCancel(reservaId);
    setShowConfirmModal(true);
  };

  const confirmCancelReserva = async () => {
    if (!reservaToCancel) return;

    try {
      const response = await reservationsService.cancelReservation(reservaToCancel);
      if (response.success) {
        // Refrescar las reservas para obtener datos actualizados
        await fetchMisReservas();
        setShowConfirmModal(false);
        setReservaToCancel(null);
      } else {
        setError(response.message || 'Error al cancelar la reserva');
      }
    } catch (err) {
      console.error('Error al cancelar reserva:', err);
      setError('Error al cancelar la reserva');
    }
  };

  const cancelCancelReserva = () => {
    setShowConfirmModal(false);
    setReservaToCancel(null);
  };

  const getEstadoColor = (estado) => {
    const estadoLower = estado?.toLowerCase();
    switch (estadoLower) {
      case 'pending':
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'approved':
      case 'aprobada':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'active':
      case 'activa':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'rejected':
      case 'rechazada':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'cancelled':
      case 'cancelada':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
      case 'completed':
      case 'completada':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const getEstadoLabel = (estado) => {
    const estadoLower = estado?.toLowerCase();
    switch (estadoLower) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobada';
      case 'active': return 'Activa';
      case 'rejected': return 'Rechazada';
      case 'cancelled': return 'Cancelada';
      case 'completed': return 'Completada';
      default: return estado?.charAt(0).toUpperCase() + estado?.slice(1) || 'Sin estado';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredReservas = reservas.filter(reserva => {
    const matchesSearch = 
      reserva.environmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reserva.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reserva.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEstado = filterEstado === 'todas' || reserva.status?.toLowerCase() === filterEstado.toLowerCase();
    
    let matchesFecha = true;
    if (filterFecha !== 'todas') {
      const today = new Date();
      const reservaDate = new Date(reserva.startDate || reserva.fecha);
      
      switch (filterFecha) {
        case 'hoy':
          matchesFecha = reservaDate.toDateString() === today.toDateString();
          break;
        case 'semana':
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          matchesFecha = reservaDate >= today && reservaDate <= weekFromNow;
          break;
        case 'mes':
          matchesFecha = reservaDate.getMonth() === today.getMonth() && 
                        reservaDate.getFullYear() === today.getFullYear();
          break;
      }
    }
    
    return matchesSearch && matchesEstado && matchesFecha;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/instructor')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  Mis Reservas
                </h1>
                <p className="text-slate-600 dark:text-slate-400">Gestiona tus reservas de ambientes</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/instructor/nueva-reserva')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nueva Reserva
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-900/80 dark:border-slate-700 mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por ambiente, propósito o usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Filter by Estado */}
              <div>
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="todas">Todos los estados</option>
                  <option value="pending">Pendientes</option>
                  <option value="approved">Aprobadas</option>
                  <option value="active">Activas</option>
                  <option value="completed">Completadas</option>
                  <option value="cancelled">Canceladas</option>
                  <option value="rejected">Rechazadas</option>
                </select>
              </div>

              {/* Filter by Fecha */}
              <div>
                <select
                  value={filterFecha}
                  onChange={(e) => setFilterFecha(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="todas">Todas las fechas</option>
                  <option value="hoy">Hoy</option>
                  <option value="semana">Esta semana</option>
                  <option value="mes">Este mes</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reservas List */}
        <div className="space-y-4">
          {filteredReservas.length > 0 ? (
            filteredReservas.map((reserva) => (
              <Card key={reserva._id} className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-900/80 dark:border-slate-700">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          {reserva.environmentName || 'Ambiente no especificado'}
                        </h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getEstadoColor(reserva.status)}`}>
                          {getEstadoLabel(reserva.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(reserva.startDate || reserva.fecha)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {formatTime(reserva.startDate)} - {formatTime(reserva.endDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{reserva.userName || user?.name || 'Usuario'}</span>
                        </div>
                      </div>

                      {reserva.purpose && (
                        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                          <p className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                            <FileText className="h-4 w-4 mt-0.5 text-slate-500" />
                            <span><strong>Propósito:</strong> {reserva.purpose}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4 lg:mt-0 lg:ml-6">
                      {(reserva.status?.toLowerCase() === 'pending' || reserva.status?.toLowerCase() === 'approved') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(event) => handleCancelarReserva(reserva._id, event)}
                          className="text-red-700 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-900/80 dark:border-slate-700">
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No tienes reservas
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {searchTerm || filterEstado !== 'todas' || filterFecha !== 'todas'
                    ? 'No se encontraron reservas con los filtros aplicados.'
                    : 'Aún no has creado ninguna reserva. ¡Crea tu primera reserva!'}
                </p>
                <Button
                  onClick={() => navigate('/instructor/nueva-reserva')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Crear Primera Reserva
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de confirmación personalizado */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white text-center mb-2">
              Cancelar Reserva
            </h3>
            
            <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
              ¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.
            </p>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={cancelCancelReserva}
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                No, mantener
              </Button>
              <Button
                variant="destructive"
                onClick={confirmCancelReserva}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Sí, cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisReservasPage;