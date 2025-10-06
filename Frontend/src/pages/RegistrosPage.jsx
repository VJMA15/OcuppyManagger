import { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  User, 
  Building2, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Plus,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/auth-context';
import useRegistros from '@/hooks/useRegistros';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

const RegistrosPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const {
    registros,
    loading,
    error,
    fetchRegistros,
    registrarEntrada,
    registrarSalida,
    getRegistrosActivos,
    getRegistrosFinalizados,
    totalRegistros,
    registrosActivos,
    registrosFinalizados
  } = useRegistros();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterFecha, setFilterFecha] = useState('hoy');
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filtrar registros
  const filteredRegistros = registros.filter(registro => {
    const matchesSearch = 
      registro.usuario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.ambiente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.reserva?.motivo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEstado = filterEstado === 'todos' || registro.estado === filterEstado;
    
    let matchesFecha = true;
    if (filterFecha !== 'todos') {
      const fechaRegistro = new Date(registro.fechaHoraEntrada);
      const hoy = new Date();
      
      switch (filterFecha) {
        case 'hoy':
          matchesFecha = fechaRegistro.toDateString() === hoy.toDateString();
          break;
        case 'semana':
          const inicioSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay()));
          matchesFecha = fechaRegistro >= inicioSemana;
          break;
        case 'mes':
          matchesFecha = fechaRegistro.getMonth() === hoy.getMonth() && 
                        fechaRegistro.getFullYear() === hoy.getFullYear();
          break;
      }
    }
    
    return matchesSearch && matchesEstado && matchesFecha;
  });

  const handleVerDetalle = (registro) => {
    setSelectedRegistro(registro);
    setShowModal(true);
  };

  const handleRegistrarSalida = async (registroId) => {
    const result = await registrarSalida(registroId);
    if (result.success) {
      // Actualizar la lista
      fetchRegistros();
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'activo':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'finalizado':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'finalizado':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Registros de Entrada/Salida</h1>
              <p className="text-gray-600 dark:text-gray-300">Gestiona los registros de acceso a los ambientes</p>
            </div>
          </div>
          
          {user?.role === 'admin' && (
            <Button
              onClick={() => navigate('/dashboard/registros/nuevo')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuevo Registro
            </Button>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Registros</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalRegistros}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Registros Activos</p>
                <p className="text-2xl font-bold text-green-600">{registrosActivos}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Registros Finalizados</p>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">{registrosFinalizados}</p>
              </div>
              <XCircle className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por usuario, ambiente o motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="finalizado">Finalizados</option>
            </select>
            
            <select
              value={filterFecha}
              onChange={(e) => setFilterFecha(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="todos">Todas las fechas</option>
              <option value="hoy">Hoy</option>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mes</option>
            </select>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de registros */}
      <Card>
        <CardHeader>
          <CardTitle>Registros ({filteredRegistros.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : filteredRegistros.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron registros</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ambiente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Entrada
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Salida
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredRegistros.map((registro) => (
                    <tr key={registro._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {registro.usuario?.nombre || 'Usuario desconocido'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {registro.usuario?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {registro.ambiente?.nombre || 'Ambiente desconocido'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {registro.ambiente?.tipo}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {formatearFecha(registro.fechaHoraEntrada)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {registro.fechaHoraSalida ? (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {formatearFecha(registro.fechaHoraSalida)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">En curso</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getEstadoIcon(registro.estado)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(registro.estado)}`}>
                            {registro.estado === 'activo' ? 'Activo' : 'Finalizado'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVerDetalle(registro)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Ver
                          </Button>
                          
                          {registro.estado === 'activo' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRegistrarSalida(registro._id)}
                              className="flex items-center gap-1"
                            >
                              <XCircle className="w-4 h-4" />
                              Salida
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalle */}
      {showModal && selectedRegistro && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detalle del Registro</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(false)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Usuario</label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedRegistro.usuario?.nombre}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Ambiente</label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedRegistro.ambiente?.nombre}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Fecha de Entrada</label>
                <p className="text-sm text-gray-900 dark:text-white">{formatearFecha(selectedRegistro.fechaHoraEntrada)}</p>
              </div>
              
              {selectedRegistro.fechaHoraSalida && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Fecha de Salida</label>
                  <p className="text-sm text-gray-900 dark:text-white">{formatearFecha(selectedRegistro.fechaHoraSalida)}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Estado</label>
                <div className="flex items-center mt-1">
                  {getEstadoIcon(selectedRegistro.estado)}
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(selectedRegistro.estado)}`}>
                    {selectedRegistro.estado === 'activo' ? 'Activo' : 'Finalizado'}
                  </span>
                </div>
              </div>
              
              {selectedRegistro.reserva && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Motivo de Reserva</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedRegistro.reserva.motivo}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <Button onClick={() => setShowModal(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrosPage;