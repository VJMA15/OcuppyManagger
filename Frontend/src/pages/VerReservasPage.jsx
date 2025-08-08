import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Building2, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  ArrowLeft,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiService from "@/services/api";
import { Button, Card, CardContent } from "@/components/ui";

const VerReservasPage = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getReservas();
        setReservas(response.data || []);
      } catch (err) {
        console.error('Error fetching reservas:', err);
        setError('Error al cargar las reservas');
        setReservas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'aprobada':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rechazada':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'aprobada':
        return <CheckCircle className="w-4 h-4" />;
      case 'rechazada':
        return <XCircle className="w-4 h-4" />;
      case 'pendiente':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleAprobar = async (id) => {
    try {
      await apiService.updateReserva(id, { estado: 'aprobada' });
      setReservas(prev => 
        prev.map(reserva => 
          reserva._id === id ? { ...reserva, estado: 'aprobada' } : reserva
        )
      );
    } catch (err) {
      console.error('Error al aprobar reserva:', err);
      setError('Error al aprobar la reserva');
    }
  };

  const handleRechazar = async (id) => {
    try {
      await apiService.updateReserva(id, { estado: 'rechazada' });
      setReservas(prev => 
        prev.map(reserva => 
          reserva._id === id ? { ...reserva, estado: 'rechazada' } : reserva
        )
      );
    } catch (err) {
      console.error('Error al rechazar reserva:', err);
      setError('Error al rechazar la reserva');
    }
  };

  const handleCreateReserva = () => {
    navigate('/reserva');
  };

  const filteredReservas = reservas.filter(reserva => {
    if (filter === 'all') return true;
    return reserva.estado === filter;
  });

  // Estadísticas
  const stats = {
    total: reservas.length,
    pendientes: reservas.filter(r => r.estado === 'pendiente').length,
    aprobadas: reservas.filter(r => r.estado === 'aprobada').length,
    rechazadas: reservas.filter(r => r.estado === 'rechazada').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Cargando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 dark:bg-slate-900/80 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Gestión de Reservas
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Administra y supervisa todas las reservas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateReserva}
                className="px-4 py-2 bg-gradient-to-r from-sena to-sena-dark hover:from-sena-dark hover:to-sena text-white rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                Nueva Reserva
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:bg-slate-900/80 dark:border-slate-700/50 p-8">
          
          {/* Estadísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Reservas</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                </div>
                <Calendar className="w-8 h-8 text-sena" />
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.pendientes}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Aprobadas</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.aprobadas}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400">Rechazadas</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.rechazadas}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-4 mb-6">
            <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Filtrar por estado:
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white transition-all duration-200"
            >
              <option value="all">Todas</option>
              <option value="pendiente">Pendientes</option>
              <option value="aprobada">Aprobadas</option>
              <option value="rechazada">Rechazadas</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 dark:text-red-400">{error}</span>
              </div>
            </div>
          )}

          {/* Tabla de Reservas */}
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <User className="inline w-4 h-4 mr-2" />
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <Building2 className="inline w-4 h-4 mr-2" />
                      Ambiente
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <Calendar className="inline w-4 h-4 mr-2" />
                      Fecha/Hora
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredReservas.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <Calendar className="w-12 h-12 text-slate-400 mb-4" />
                          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                            No hay reservas para mostrar
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400">
                            {filter === 'all' 
                              ? 'Aún no se han creado reservas en el sistema'
                              : `No hay reservas con estado "${filter}"`
                            }
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredReservas.map(reserva => (
                      <tr key={reserva._id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {reserva.nombre}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {reserva.documento}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900 dark:text-white">
                            {reserva.ambiente}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-slate-900 dark:text-white">
                              {reserva.fecha}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {reserva.hora} ({reserva.duracion}h)
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reserva.estado)}`}>
                            {getStatusIcon(reserva.estado)}
                            {reserva.estado === 'pendiente' ? 'Pendiente' : 
                             reserva.estado === 'aprobada' ? 'Aprobada' : 'Rechazada'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {reserva.estado === 'pendiente' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAprobar(reserva._id)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Aprobar
                              </button>
                              <button
                                onClick={() => handleRechazar(reserva._id)}
                                className="inline-flex items-center px-3 py-1 border border-red-300 text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Rechazar
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Información adicional */}
          {filteredReservas.length > 0 && (
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <FileText className="w-4 h-4" />
                  <span>Mostrando {filteredReservas.length} de {reservas.length} reservas</span>
                </div>
                <button
                  onClick={handleCreateReserva}
                  className="px-4 py-2 bg-gradient-to-r from-sena to-sena-dark hover:from-sena-dark hover:to-sena text-white rounded-lg transition-all duration-200 flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Reserva
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerReservasPage;