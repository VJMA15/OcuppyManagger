import React from 'react';
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
import { Button, Card, CardContent } from "@/components/ui";

const VerReservasContainer = ({
  // Data
  reservas,
  filteredReservas,
  loading,
  error,
  filter,
  
  // Handlers
  onFilterChange,
  onAprobar,
  onRechazar,
  onCreateReserva,
  onBack,
  
  // Helper functions
  getStatusColor,
  getStatusIcon
}) => {
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Cargando reservas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">Error: {error}</div>
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
                onClick={onBack}
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
            <button
              onClick={onCreateReserva}
              className="px-4 py-2 bg-gradient-to-r from-sena to-sena-dark hover:from-sena-dark hover:to-sena text-white rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nueva Reserva
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <select
              value={filter}
              onChange={(e) => onFilterChange(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="all">Todas las reservas</option>
              <option value="pendiente">Pendientes</option>
              <option value="aprobada">Aprobadas</option>
              <option value="rechazada">Rechazadas</option>
            </select>
          </div>
        </div>

        {/* Reservas Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Ambiente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredReservas.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">
                        No hay reservas para mostrar
                      </td>
                    </tr>
                  ) : (
                    filteredReservas.map((reserva) => (
                      <tr key={reserva._id || reserva.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="w-5 h-5 text-slate-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-white">
                                {reserva.nombre || reserva.usuario}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {reserva.documento || reserva.cc}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building2 className="w-5 h-5 text-slate-400 mr-3" />
                            <div className="text-sm text-slate-900 dark:text-white">
                              {reserva.ambiente}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="w-5 h-5 text-slate-400 mr-3" />
                            <div>
                              <div className="text-sm text-slate-900 dark:text-white">
                                {reserva.fecha}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {reserva.hora} ({reserva.duracion}h)
                              </div>
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
                                onClick={() => onAprobar(reserva._id || reserva.id)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Aprobar
                              </button>
                              <button
                                onClick={() => onRechazar(reserva._id || reserva.id)}
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
          </CardContent>
        </Card>

        {/* Footer Info */}
        {filteredReservas.length > 0 && (
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <FileText className="w-4 h-4" />
                <span>Mostrando {filteredReservas.length} de {reservas.length} reservas</span>
              </div>
              <button
                onClick={onCreateReserva}
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
  );
};

export default VerReservasContainer;