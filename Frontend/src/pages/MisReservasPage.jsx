import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Filter, Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/auth-context';
import reservationsService from '../services/reservationsService';
import { enrichReservasWithDetails } from '../utils/reservasUtils';

const MisReservasPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('pendiente');
  const [filterFecha, setFilterFecha] = useState('todas');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    // Esperar a que el usuario esté disponible para cargar
    if (user?.id) {
      fetchMisReservas();
    } else {
      // Si aún no hay usuario, no marcar error ni bloquear la UI
      setLoading(false);
    }
  }, [user?.id]);

  const fetchMisReservas = async () => {
    try {
      setLoading(true);
      // No establecer error si el usuario aún no está listo
      if (!user?.id) {
        return;
      }
      setError('');
      
      const response = await reservationsService.getMyReservations(user.id);
      if (response.success) {
        const enriched = await enrichReservasWithDetails(response.data || []);
        setReservas(enriched);
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

  const handleCancelarReserva = async (reservaId) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    try {
      const response = await reservationsService.cancelReservation(reservaId);
      if (response.success) {
        setReservas(prev => 
          prev.map(reserva => 
            reserva._id === reservaId ? { ...reserva, status: 'CANCELLED' } : reserva
          )
        );
      } else {
        setError(response.message || 'Error al cancelar la reserva');
      }
    } catch (err) {
      console.error('Error al cancelar reserva:', err);
      setError('Error al cancelar la reserva');
    }
  };

  const canDelete = (reserva) => {
    const estado = normalizeEstado(reserva.estado || reserva.status);
    return ['rechazada', 'cancelada', 'aprobada'].includes(estado);
  };

  const handleEliminarReserva = async (reservaId) => {
    if (!window.confirm('¿Eliminar esta reserva? Esta acción no se puede deshacer.')) return;
    try {
      const response = await reservationsService.deleteReservation(reservaId);
      if (response?.success !== false) {
        setReservas(prev => prev.filter(r => String(r._id || r.id) !== String(reservaId)));
        setSelectedIds(prev => prev.filter(id => String(id) !== String(reservaId)));
      } else {
        setError(response.message || 'No se pudo eliminar la reserva');
      }
    } catch (err) {
      console.error('Error al eliminar reserva:', err);
      setError('Error al eliminar la reserva');
    }
  };

  const toggleSelect = (reservaId) => {
    setSelectedIds(prev => {
      const idStr = String(reservaId);
      return prev.includes(idStr) ? prev.filter(id => id !== idStr) : [...prev, idStr];
    });
  };

  const handleEliminarSeleccionadas = async () => {
    try {
      setError('');
      if (selectedIds.length === 0) return;

      const selectedSet = new Set(selectedIds.map(String));
      let deletableSelectedIds = reservas
        .filter(r => selectedSet.has(String(r._id || r.id)))
        .filter(r => canDelete(r))
        .map(r => String(r._id || r.id));

      if (deletableSelectedIds.length === 0) {
        setError('Selecciona reservas aprobadas, rechazadas o canceladas para eliminar');
        return;
      }

      const response = await reservationsService.deleteReservationsBulk(deletableSelectedIds);
      if (response?.successCount > 0) {
        const removed = new Set((response.deletedIds || []).map(String));
        setReservas(prev => prev.filter(r => !removed.has(String(r._id || r.id))));
        setSelectedIds(prev => prev.filter(id => !removed.has(String(id))));
      }
      if (response?.failureCount > 0) {
        setError(response.message || 'Algunas reservas no pudieron eliminarse');
      }
    } catch (err) {
      console.error('Error al eliminar seleccionadas:', err);
      setError('Error al eliminar seleccionadas');
    }
  };

  const normalizeEstado = (estadoRaw) => {
    const e = String(estadoRaw || '').toLowerCase();
    switch (e) {
      case 'pending':
      case 'pendiente':
        return 'pendiente';
      case 'approved':
      case 'aprobada':
        return 'aprobada';
      case 'active':
      case 'activa':
        return 'activa';
      case 'rejected':
      case 'rechazada':
        return 'rechazada';
      case 'cancelled':
      case 'cancelada':
        return 'cancelada';
      case 'completed':
      case 'completada':
        return 'completada';
      default:
        return e || 'pendiente';
    }
  };

  const getEstadoColor = (estadoRaw) => {
    const estado = normalizeEstado(estadoRaw);
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'aprobada':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'activa':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rechazada':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelada':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'completada':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no especificada';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Hora no especificada';
    try {
      const d = new Date(dateString);
      const hours = d.getHours();
      const minutes = d.getMinutes();
      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      const hh = String(hours12).padStart(2, '0');
      const mm = String(minutes).padStart(2, '0');
      return `${hh}:${mm} ${period}`;
    } catch (e) {
      return 'Hora inválida';
    }
  };

  const getAmbienteNombre = (reserva) => {
    return (
      reserva?.ambiente?.nombre ||
      reserva?.ambiente ||
      reserva?.ambienteNombre ||
      reserva?.ambienteId?.nombre ||
      reserva?.environment?.nombre ||
      reserva?.environmentName ||
      'Ambiente no especificado'
    );
  };

  // (Se mantiene la función normalizeEstado definida más arriba)

  const getFechaReserva = (reserva) => {
    return reserva?.fecha || reserva?.startDate || null;
  };

  const getHoraRango = (reserva) => {
    // Si se definió la jornada, mostrar rango estándar por jornada
    const jornadasMap = {
      'mañana': { inicio: '06:00', fin: '12:00' },
      'tarde': { inicio: '12:30', fin: '18:00' },
      'noche': { inicio: '18:30', fin: '22:00' }
    };
    if (reserva?.jornada && jornadasMap[reserva.jornada]) {
      const j = jornadasMap[reserva.jornada];
      return `${j.inicio} - ${j.fin}`;
    }

    if (reserva?.horaInicio && reserva?.horaFin) {
      return `${reserva.horaInicio} - ${reserva.horaFin}`;
    }
    const start = reserva?.startDate ? new Date(reserva.startDate) : null;
    const end = reserva?.endDate ? new Date(reserva.endDate) : null;
    const fmt = (d) => (d ? d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '');
    if (start && end) return `${fmt(start)} - ${fmt(end)}`;
    if (start) return fmt(start);
    return 'Horario no especificado';
  };

  const filteredReservas = reservas.filter(reserva => {
    const matchesSearch = 
      getAmbienteNombre(reserva)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reserva.proposito || reserva.purpose || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const estadoNorm = normalizeEstado(reserva.estado || reserva.status);
    // Por defecto ("todas"), ocultar rechazadas a menos que el usuario seleccione explícitamente "rechazada"
    const matchesEstado = filterEstado === 'todas'
      ? estadoNorm !== 'rechazada'
      : estadoNorm === filterEstado;
    
    let matchesFecha = true;
    if (filterFecha !== 'todas') {
      const today = new Date();
      const reservaDateRaw = getFechaReserva(reserva);
      const reservaDate = reservaDateRaw ? new Date(reservaDateRaw) : null;
      if (!reservaDate) return false;
      
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Reservas</h1>
              <p className="text-gray-600 dark:text-gray-400">Gestiona tus reservas de ambientes</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/reserva')}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nueva Reserva
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por ambiente o propósito..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Filter by Estado */}
            <div>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="todas">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="aprobada">Aprobadas</option>
                <option value="activa">Activas</option>
                <option value="completada">Completadas</option>
                <option value="cancelada">Canceladas</option>
                <option value="rechazada">Rechazadas</option>
              </select>
            </div>

            {/* Filter by Fecha */}
            <div>
              <select
                value={filterFecha}
                onChange={(e) => setFilterFecha(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="todas">Todas las fechas</option>
                <option value="hoy">Hoy</option>
                <option value="semana">Esta semana</option>
                <option value="mes">Este mes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk actions (arriba del listado) */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Seleccionadas: {selectedIds.length}
          </div>
          <button
            onClick={handleEliminarSeleccionadas}
            disabled={selectedIds.length === 0}
            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-500 disabled:text-gray-200 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-5 w-5 mr-2" />
            Eliminar seleccionadas
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Reservas List */}
        <div className="space-y-4">
          {filteredReservas.length > 0 ? (
            filteredReservas.map((reserva) => (
              <div key={reserva._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        checked={selectedIds.includes(String(reserva._id || reserva.id))}
                        onChange={() => toggleSelect(reserva._id || reserva.id)}
                        aria-label="Seleccionar reserva"
                      />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {getAmbienteNombre(reserva)}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getEstadoColor(reserva.estado || reserva.status)}`}>
                        {normalizeEstado(reserva.estado || reserva.status).charAt(0).toUpperCase() + normalizeEstado(reserva.estado || reserva.status).slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(getFechaReserva(reserva))}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(reserva.createdAt || reserva.fechaCreacion || reserva.timestamp)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{reserva.proposito || reserva.purpose || 'Sin propósito especificado'}</span>
                      </div>
                    </div>

                    {reserva.observaciones && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>Observaciones:</strong> {reserva.observaciones}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 lg:mt-0 lg:ml-6">
                    {['pendiente','aprobada'].includes(normalizeEstado(reserva.estado || reserva.status)) && (
                      <button
                        onClick={() => handleCancelarReserva(reserva._id)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Cancelar
                      </button>
                    )}
                    {canDelete(reserva) && (
                      <button
                        onClick={() => handleEliminarReserva(reserva._id)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No tienes reservas
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || filterEstado !== 'todas' || filterFecha !== 'todas'
                  ? 'No se encontraron reservas con los filtros aplicados.'
                  : 'Aún no has creado ninguna reserva. ¡Crea tu primera reserva!'}
              </p>
              <button
                onClick={() => navigate('/dashboard/reserva')}
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Crear Primera Reserva
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MisReservasPage;