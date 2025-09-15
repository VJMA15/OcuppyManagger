import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Filter, Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/auth-context';
import reservationsService from '../services/reservationsService';

const MisReservasPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todas');
  const [filterFecha, setFilterFecha] = useState('todas');

  useEffect(() => {
    fetchMisReservas();
  }, []);

  const fetchMisReservas = async () => {
    try {
      setLoading(true);
      if (!user?.id) {
        setError('Usuario no autenticado');
        return;
      }
      
      const response = await reservationsService.getMyReservations(user.id);
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

  const getEstadoColor = (estado) => {
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
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredReservas = reservas.filter(reserva => {
    const matchesSearch = 
      reserva.ambiente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reserva.proposito?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEstado = filterEstado === 'todas' || reserva.estado === filterEstado;
    
    let matchesFecha = true;
    if (filterFecha !== 'todas') {
      const today = new Date();
      const reservaDate = new Date(reserva.fecha);
      
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
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {reserva.ambiente || 'Ambiente no especificado'}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getEstadoColor(reserva.estado)}`}>
                        {reserva.estado?.charAt(0).toUpperCase() + reserva.estado?.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(reserva.fecha)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{reserva.horaInicio} - {reserva.horaFin}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{reserva.proposito || 'Sin propósito especificado'}</span>
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
                    {reserva.estado === 'pendiente' && (
                      <button
                        onClick={() => handleCancelarReserva(reserva._id)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Cancelar
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