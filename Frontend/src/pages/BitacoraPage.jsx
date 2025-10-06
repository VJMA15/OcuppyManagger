import { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  User, 
  Activity, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  ArrowLeft,
  AlertCircle,
  Clock,
  Database,
  Shield,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/auth-context';
import useBitacora from '@/hooks/useBitacora';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

const BitacoraPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const {
    bitacora,
    loading,
    error,
    fetchBitacora,
    getBitacoraReciente,
    getAccionesMasComunes,
    getUsuariosMasActivos,
    totalRegistros,
    registrosHoy
  } = useBitacora();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAccion, setFilterAccion] = useState('todas');
  const [filterEntidad, setFilterEntidad] = useState('todas');
  const [filterFecha, setFilterFecha] = useState('hoy');
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEstadisticas, setShowEstadisticas] = useState(false);

  // Verificar permisos de administrador
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Filtrar registros de bitácora
  const filteredBitacora = bitacora.filter(registro => {
    const matchesSearch = 
      registro.accion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.entidad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.usuario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.detalles?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAccion = filterAccion === 'todas' || registro.accion === filterAccion;
    const matchesEntidad = filterEntidad === 'todas' || registro.entidad === filterEntidad;
    
    let matchesFecha = true;
    if (filterFecha !== 'todas') {
      const fechaRegistro = new Date(registro.createdAt);
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
    
    return matchesSearch && matchesAccion && matchesEntidad && matchesFecha;
  });

  const handleVerDetalle = (registro) => {
    setSelectedRegistro(registro);
    setShowModal(true);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getAccionIcon = (accion) => {
    switch (accion?.toLowerCase()) {
      case 'crear':
      case 'create':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'actualizar':
      case 'update':
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
      case 'eliminar':
      case 'delete':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      case 'login':
      case 'logout':
        return <div className="w-2 h-2 bg-purple-500 rounded-full"></div>;
      case 'aprobar_reserva':
        return <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>;
      case 'rechazar_reserva':
        return <div className="w-2 h-2 bg-orange-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
    }
  };

  const getAccionColor = (accion) => {
    switch (accion?.toLowerCase()) {
      case 'crear':
      case 'create':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'actualizar':
      case 'update':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
      case 'eliminar':
      case 'delete':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      case 'login':
      case 'logout':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200';
      case 'aprobar_reserva':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200';
      case 'rechazar_reserva':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  // Obtener acciones únicas para el filtro
  const accionesUnicas = [...new Set(bitacora.map(r => r.accion))].filter(Boolean);
  const entidadesUnicas = [...new Set(bitacora.map(r => r.entidad))].filter(Boolean);

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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bitácora del Sistema</h1>
              <p className="text-gray-600 dark:text-gray-300">Registro de auditoría y actividades del sistema</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEstadisticas(!showEstadisticas)}
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              {showEstadisticas ? 'Ocultar' : 'Mostrar'} Estadísticas
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Registros</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalRegistros}</p>
              </div>
              <Database className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Registros Hoy</p>
                <p className="text-2xl font-bold text-green-600">{registrosHoy}</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Entidades</p>
                <p className="text-2xl font-bold text-purple-600">{entidadesUnicas.length}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Acciones</p>
                <p className="text-2xl font-bold text-orange-600">{accionesUnicas.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas detalladas */}
      {showEstadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Más Comunes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getAccionesMasComunes().slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getAccionIcon(item.accion)}
                      <span className="text-sm font-medium">{item.accion}</span>
                    </div>
                    <span className="text-sm text-gray-600">{item.cantidad}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Usuarios Más Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getUsuariosMasActivos().slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{item.nombre}</span>
                    </div>
                    <span className="text-sm text-gray-600">{item.cantidad}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <Input
                placeholder="Buscar en bitácora..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filterAccion}
              onChange={(e) => setFilterAccion(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="todas">Todas las acciones</option>
              <option value="APROBAR_RESERVA">Reservas Aprobadas</option>
              <option value="RECHAZAR_RESERVA">Reservas Rechazadas</option>
              <optgroup label="Otras acciones">
                {accionesUnicas.filter(accion => !['APROBAR_RESERVA', 'RECHAZAR_RESERVA'].includes(accion)).map(accion => (
                  <option key={accion} value={accion}>{accion}</option>
                ))}
              </optgroup>
            </select>
            
            <select
              value={filterEntidad}
              onChange={(e) => setFilterEntidad(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="todas">Todas las entidades</option>
              <option value="reserva">Reservas</option>
              <optgroup label="Otras entidades">
                {entidadesUnicas.filter(entidad => entidad !== 'reserva').map(entidad => (
                  <option key={entidad} value={entidad}>{entidad}</option>
                ))}
              </optgroup>
            </select>
            
            <select
              value={filterFecha}
              onChange={(e) => setFilterFecha(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="todas">Todas las fechas</option>
              <option value="hoy">Hoy</option>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mes</option>
            </select>
            
            <Button
              variant="outline"
              onClick={() => fetchBitacora()}
              className="flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de registros */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Bitácora ({filteredBitacora.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : filteredBitacora.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No se encontraron registros</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fecha/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Entidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      IP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredBitacora.map((registro) => (
                    <tr key={registro._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {formatearFecha(registro.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {registro.usuario?.nombre || 'Sistema'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {registro.usuario?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getAccionIcon(registro.accion)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getAccionColor(registro.accion)}`}>
                            {registro.accion}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">{registro.entidad}</span>
                        {registro.entidadId && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">ID: {registro.entidadId}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{registro.ip || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVerDetalle(registro)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </Button>
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Fecha y Hora</label>
                  <p className="text-sm text-gray-900 dark:text-white">{formatearFecha(selectedRegistro.createdAt)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Usuario</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedRegistro.usuario?.nombre || 'Sistema'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Acción</label>
                  <div className="flex items-center mt-1">
                    {getAccionIcon(selectedRegistro.accion)}
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getAccionColor(selectedRegistro.accion)}`}>
                      {selectedRegistro.accion}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Entidad</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedRegistro.entidad}</p>
                </div>
              </div>
              
              {selectedRegistro.entidadId && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">ID de Entidad</label>
                  <p className="text-sm text-gray-900 dark:text-white font-mono">{selectedRegistro.entidadId}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Dirección IP</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedRegistro.ip || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">User Agent</label>
                  <p className="text-sm text-gray-900 dark:text-white truncate" title={selectedRegistro.userAgent}>
                    {selectedRegistro.userAgent || 'N/A'}
                  </p>
                </div>
              </div>
              
              {selectedRegistro.detalles && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Detalles</label>
                  {(selectedRegistro.accion === 'APROBAR_RESERVA' || selectedRegistro.accion === 'RECHAZAR_RESERVA') ? (
                    <div className="mt-1 p-4 bg-gray-50 dark:bg-gray-700 rounded-md space-y-3">
                      {selectedRegistro.detalles.reservaId && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">ID de Reserva:</span>
                          <span className="text-sm text-gray-900 dark:text-white font-mono">{selectedRegistro.detalles.reservaId}</span>
                        </div>
                      )}
                      {selectedRegistro.detalles.usuarioSolicitante && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Usuario Solicitante:</span>
                          <span className="text-sm text-gray-900 dark:text-white">{selectedRegistro.detalles.usuarioSolicitante}</span>
                        </div>
                      )}
                      {selectedRegistro.detalles.ambiente && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Ambiente:</span>
                          <span className="text-sm text-gray-900 dark:text-white">{selectedRegistro.detalles.ambiente}</span>
                        </div>
                      )}
                      {selectedRegistro.detalles.fechaReserva && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Fecha de Reserva:</span>
                          <span className="text-sm text-gray-900 dark:text-white">{formatearFecha(selectedRegistro.detalles.fechaReserva)}</span>
                        </div>
                      )}
                      {selectedRegistro.detalles.fechaAprobacion && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Fecha de Aprobación:</span>
                          <span className="text-sm text-gray-900 dark:text-white">{formatearFecha(selectedRegistro.detalles.fechaAprobacion)}</span>
                        </div>
                      )}
                      {selectedRegistro.detalles.fechaRechazo && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Fecha de Rechazo:</span>
                          <span className="text-sm text-gray-900 dark:text-white">{formatearFecha(selectedRegistro.detalles.fechaRechazo)}</span>
                        </div>
                      )}
                      {selectedRegistro.detalles.motivoRechazo && (
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Motivo de Rechazo:</span>
                          <p className="text-sm text-gray-900 dark:text-white mt-1 p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-4 border-red-400">
                            {selectedRegistro.detalles.motivoRechazo}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                        {typeof selectedRegistro.detalles === 'string' 
                          ? selectedRegistro.detalles 
                          : JSON.stringify(selectedRegistro.detalles, null, 2)
                        }
                      </pre>
                    </div>
                  )}
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

export default BitacoraPage;