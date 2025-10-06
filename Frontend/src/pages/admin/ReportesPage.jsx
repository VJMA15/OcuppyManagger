import { useState, useEffect } from 'react';
import { useReportes } from '../../hooks/useReportes';
import { useAuthContext } from '../../contexts/auth-context';
import {
  BarChart3,
  FileText,
  Download,
  Calendar,
  Filter,
  Eye,
  FileSpreadsheet,
  TrendingUp,
  Users,
  Building,
  Package,
  Clock,
  AlertCircle,
  RefreshCw,
  PieChart
} from 'lucide-react';
import { PieChart as CustomPieChart, BarChart as CustomBarChart, LineChart as CustomLineChart } from '../../components/charts';

const ReportesPage = () => {
  const { user } = useAuthContext();
  const {
    loading,
    error,
    estadisticasGenerales,
    reporteReservas,
    reporteEntregas,
    reporteUsoAmbientes,
    filtros,
    formatosDisponibles,
    estadosReservas,
    estadosEntregas,
    jornadas,
    opcionesRangoFechas,
    obtenerEstadisticasGenerales,
    generarReporteReservas,
    generarReporteEntregas,
    generarReporteUsoAmbientes,
    obtenerMisReportesReservas,
    obtenerMisReportesEntregas,
    obtenerEstadisticasMiTurno,
    actualizarFiltros,
    limpiarFiltros,
    limpiarError,
    establecerRangoFechas,
    validarPermisos
  } = useReportes();
  
  // Estados locales
  const [tipoReporte, setTipoReporte] = useState('estadisticas');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [datosVisualizacion, setDatosVisualizacion] = useState(null);
  
  // Cargar estadísticas generales al montar el componente
  useEffect(() => {
    if (validarPermisos('estadisticas-generales')) {
      obtenerEstadisticasGenerales();
    } else if (validarPermisos('estadisticas-turno')) {
      obtenerEstadisticasMiTurno();
    }
  }, []);
  
  // Manejar cambio de tipo de reporte
  const handleTipoReporteChange = (tipo) => {
    setTipoReporte(tipo);
    limpiarError();
    setDatosVisualizacion(null);
  };
  
  // Manejar generación de reportes
  const handleGenerarReporte = async () => {
    try {
      limpiarError();
      
      switch (tipoReporte) {
        case 'estadisticas':
          if (validarPermisos('estadisticas-generales')) {
            await obtenerEstadisticasGenerales();
          } else if (validarPermisos('estadisticas-turno')) {
            await obtenerEstadisticasMiTurno();
          }
          break;
        case 'reservas':
          if (user.rol === 'instructor') {
            const datos = await obtenerMisReportesReservas();
            setDatosVisualizacion(datos);
          } else {
            const datos = await generarReporteReservas();
            setDatosVisualizacion(datos);
          }
          break;
        case 'entregas':
          if (user.rol === 'instructor') {
            const datos = await obtenerMisReportesEntregas();
            setDatosVisualizacion(datos);
          } else {
            const datos = await generarReporteEntregas();
            setDatosVisualizacion(datos);
          }
          break;
        case 'uso-ambientes':
          const datos = await generarReporteUsoAmbientes();
          setDatosVisualizacion(datos);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Error al generar reporte:', err);
    }
  };
  
  // Manejar descarga de archivos
  const handleDescargar = async (formato) => {
    try {
      const parametros = { ...filtros, formato };
      
      switch (tipoReporte) {
        case 'reservas':
          if (user.rol === 'instructor') {
            await obtenerMisReportesReservas(parametros);
          } else {
            await generarReporteReservas(parametros);
          }
          break;
        case 'entregas':
          if (user.rol === 'instructor') {
            await obtenerMisReportesEntregas(parametros);
          } else {
            await generarReporteEntregas(parametros);
          }
          break;
        case 'uso-ambientes':
          await generarReporteUsoAmbientes(parametros);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Error al descargar reporte:', err);
    }
  };
  
  // Renderizar tarjetas de estadísticas
  const renderEstadisticasCards = () => {
    if (!estadisticasGenerales) return null;
    
    const { totales, reservas, entregas } = estadisticasGenerales;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 backdrop-blur-sm rounded-xl shadow-lg border border-primary/20 dark:border-primary/30 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-dark dark:text-primary-light">Total Ambientes</p>
              <p className="text-3xl font-bold text-primary dark:text-primary-light">{totales?.ambientes || 0}</p>
            </div>
            <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
              <Building className="h-8 w-8 text-primary dark:text-primary-light" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-success/5 to-success/10 dark:from-success/10 dark:to-success/20 backdrop-blur-sm rounded-xl shadow-lg border border-success/20 dark:border-success/30 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-success-dark dark:text-success-light">Total Usuarios</p>
              <p className="text-3xl font-bold text-success dark:text-success-light">{totales?.usuarios || 0}</p>
            </div>
            <div className="p-3 bg-success/10 dark:bg-success/20 rounded-xl">
              <Users className="h-8 w-8 text-success dark:text-success-light" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-accent/5 to-accent/10 dark:from-accent/10 dark:to-accent/20 backdrop-blur-sm rounded-xl shadow-lg border border-accent/20 dark:border-accent/30 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-accent-dark dark:text-accent-light">Reservas del Período</p>
              <p className="text-3xl font-bold text-accent dark:text-accent-light">{totales?.reservas || 0}</p>
            </div>
            <div className="p-3 bg-accent/10 dark:bg-accent/20 rounded-xl">
              <Calendar className="h-8 w-8 text-accent dark:text-accent-light" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 dark:from-secondary/10 dark:to-secondary/20 backdrop-blur-sm rounded-xl shadow-lg border border-secondary/20 dark:border-secondary/30 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-dark dark:text-secondary-light">Entregas del Período</p>
              <p className="text-3xl font-bold text-secondary dark:text-secondary-light">{totales?.entregas || 0}</p>
            </div>
            <div className="p-3 bg-secondary/10 dark:bg-secondary/20 rounded-xl">
              <Package className="h-8 w-8 text-secondary dark:text-secondary-light" />
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Renderizar filtros
  const renderFiltros = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </h3>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {mostrarFiltros ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
        
        {mostrarFiltros && (
          <div className="space-y-4">
            {/* Rango de fechas predefinido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rango de fechas
              </label>
              <div className="flex flex-wrap gap-2">
                {opcionesRangoFechas.map((opcion) => (
                  <button
                    key={opcion.value}
                    onClick={() => establecerRangoFechas(opcion.value)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 rounded-md transition-colors"
                  >
                    {opcion.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Fechas personalizadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha inicio
                </label>
                <input
                  type="date"
                  value={filtros.fechaInicio}
                  onChange={(e) => actualizarFiltros({ fechaInicio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha fin
                </label>
                <input
                  type="date"
                  value={filtros.fechaFin}
                  onChange={(e) => actualizarFiltros({ fechaFin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Filtros específicos por tipo de reporte */}
            {tipoReporte === 'reservas' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={filtros.estado}
                    onChange={(e) => actualizarFiltros({ estado: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {estadosReservas.map((estado) => (
                      <option key={estado.value} value={estado.value}>
                        {estado.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            {tipoReporte === 'entregas' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={filtros.estado}
                    onChange={(e) => actualizarFiltros({ estado: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {estadosEntregas.map((estado) => (
                      <option key={estado.value} value={estado.value}>
                        {estado.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jornada
                  </label>
                  <select
                    value={filtros.jornada}
                    onChange={(e) => actualizarFiltros({ jornada: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {jornadas.map((jornada) => (
                      <option key={jornada.value} value={jornada.value}>
                        {jornada.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            {/* Botones de acción */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleGenerarReporte}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                Generar Reporte
              </button>
              
              <button
                onClick={limpiarFiltros}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Renderizar opciones de descarga
  const renderOpcionesDescarga = () => {
    if (tipoReporte === 'estadisticas') return null;
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Download className="h-5 w-5 mr-2" />
          Descargar Reporte
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleDescargar('excel')}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Descargar Excel
          </button>
          <button
            onClick={() => handleDescargar('pdf')}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
          >
            <FileText className="h-4 w-4 mr-2" />
            Descargar PDF
          </button>
        </div>
      </div>
    );
  };
  
  // Renderizar gráficos
  const renderGraficos = () => {
    if (!datosVisualizacion) return null;
    
    const datos = datosVisualizacion.reservas || datosVisualizacion.entregas || datosVisualizacion.ambientes || [];
    
    if (!Array.isArray(datos) || datos.length === 0) {
      return null;
    }

    switch (tipoReporte) {
      case 'reservas':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <CustomPieChart
              data={estadisticasGenerales?.reservasPorEstado || []}
              title="Reservas por Estado"
              nameKey="_id"
              dataKey="count"
            />
            <CustomBarChart
              data={datos.slice(0, 10)}
              title="Top 10 Ambientes Más Reservados"
              nameKey="ambiente.nombre"
              dataKey="totalReservas"
              color="#3B82F6"
            />
          </div>
        );
      case 'entregas':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <CustomPieChart
              data={estadisticasGenerales?.entregasPorEstado || []}
              title="Entregas por Estado"
              nameKey="_id"
              dataKey="count"
            />
            <CustomBarChart
              data={datos.slice(0, 10)}
              title="Top 10 Ambientes Más Utilizados"
              nameKey="ambiente.nombre"
              dataKey="totalEntregas"
              color="#10B981"
            />
          </div>
        );
      case 'uso-ambientes':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <CustomBarChart
              data={datos.slice(0, 10)}
              title="Uso de Ambientes (Top 10)"
              nameKey="nombre"
              dataKey="totalReservas"
              color="#F59E0B"
            />
            <CustomBarChart
              data={datos.slice(0, 10)}
              title="Porcentaje de Uso"
              nameKey="nombre"
              dataKey="porcentajeUso"
              color="#8B5CF6"
            />
          </div>
        );
      default:
        return null;
    }
  };

  // Renderizar tabla de datos
  const renderTablaDatos = () => {
    if (!datosVisualizacion) return null;
    
    const datos = datosVisualizacion.reservas || datosVisualizacion.entregas || datosVisualizacion.ambientes || [];
    
    if (!Array.isArray(datos) || datos.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500 text-center">No hay datos para mostrar</p>
        </div>
      );
    }
    
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <h3 className="text-lg font-semibold text-primary">
            Resultados del Reporte ({datos.length} registros)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-primary-lighter/50">
              <tr>
                {tipoReporte === 'reservas' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Ambiente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Horario</th>
                  </>
                )}
                {tipoReporte === 'entregas' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Código</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Ambiente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Instructor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Jornada</th>
                  </>
                )}
                {tipoReporte === 'uso-ambientes' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Ambiente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Reservas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Horas Utilizadas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">% Uso</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {datos.slice(0, 50).map((item, index) => (
                <tr key={index} className="hover:bg-primary/5 transition-colors duration-200">
                  {tipoReporte === 'reservas' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(item.fechaReserva).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {item.ambiente?.nombre || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {item.usuario?.nombre || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          item.estado === 'aprobada' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          item.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          item.estado === 'rechazada' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}>
                          {item.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(item.horaInicio).toLocaleTimeString()} - {new Date(item.horaFin).toLocaleTimeString()}
                      </td>
                    </>
                  )}
                  {tipoReporte === 'entregas' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-100">
                        {item.codigoEntrega}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(item.fechaEntrega).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {item.ambiente?.nombre || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {item.instructor?.nombre || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          item.estado === 'entregado' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          item.estado === 'devuelto' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          item.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}>
                          {item.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {item.jornada}
                      </td>
                    </>
                  )}
                  {tipoReporte === 'uso-ambientes' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {item.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {item.tipo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {item.totalReservas}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {Math.round(item.horasUtilizadas * 100) / 100}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {Math.round(item.porcentajeUso * 100) / 100}%
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {datos.length > 50 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Mostrando los primeros 50 registros de {datos.length} total. 
              Descarga el reporte completo para ver todos los datos.
            </p>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-lighter dark:from-gray-900 dark:to-primary-dark/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary dark:text-primary-light flex items-center">
            <BarChart3 className="h-8 w-8 mr-3 text-primary dark:text-primary-light" />
            Reportes y Estadísticas
          </h1>
          <p className="text-primary-dark dark:text-primary-light/80 mt-2">
            Genera reportes detallados y visualiza estadísticas del sistema
          </p>
        </div>
        
        {/* Selector de tipo de reporte */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50 p-6 mb-6">
          <h2 className="text-xl font-semibold text-primary dark:text-primary-light mb-4">Tipo de Reporte</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {validarPermisos('estadisticas-generales') && (
              <button
                onClick={() => handleTipoReporteChange('estadisticas')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  tipoReporte === 'estadisticas'
                    ? 'border-primary bg-primary/10 text-primary shadow-lg dark:border-primary-light dark:bg-primary-light/10 dark:text-primary-light'
                    : 'border-gray-200 hover:border-primary/50 hover:bg-primary/5 dark:border-gray-600 dark:hover:border-primary-light/50 dark:hover:bg-primary-light/5'
                }`}
              >
                <TrendingUp className={`h-8 w-8 mx-auto mb-2 ${
                  tipoReporte === 'estadisticas' ? 'text-primary dark:text-primary-light' : 'text-gray-500 dark:text-gray-400'
                }`} />
                <div className="text-sm font-medium dark:text-gray-200">Estadísticas Generales</div>
              </button>
            )}
            
            {(validarPermisos('reporte-reservas') || validarPermisos('mis-reportes')) && (
              <button
                onClick={() => handleTipoReporteChange('reservas')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  tipoReporte === 'reservas'
                    ? 'border-red-300 bg-red-50 text-red-600 dark:border-red-400/70 dark:bg-red-900/20 dark:text-red-300 shadow-lg'
                    : 'border-gray-200 dark:border-gray-600 hover:border-red-300/50 hover:bg-red-50/50 dark:hover:border-red-400/40 dark:hover:bg-red-900/10'
                }`}
              >
                <Calendar className={`h-8 w-8 mx-auto mb-2 ${
                  tipoReporte === 'reservas' ? 'text-red-600 dark:text-red-300' : 'text-gray-500 dark:text-gray-400'
                }`} />
                <div className={`text-sm font-medium ${
                  tipoReporte === 'reservas' ? 'dark:text-red-300' : 'dark:text-gray-300'
                }`}>
                  {user.rol === 'instructor' ? 'Mis Reservas' : 'Reporte de Reservas'}
                </div>
              </button>
            )}
            
            {(validarPermisos('reporte-entregas') || validarPermisos('mis-reportes')) && (
              <button
                onClick={() => handleTipoReporteChange('entregas')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  tipoReporte === 'entregas'
                    ? 'border-secondary bg-secondary/10 text-secondary dark:border-secondary/70 dark:bg-secondary/20 dark:text-secondary-light shadow-lg'
                    : 'border-gray-200 dark:border-gray-600 hover:border-secondary/50 hover:bg-secondary/5 dark:hover:border-secondary/40 dark:hover:bg-secondary/10'
                }`}
              >
                <Package className={`h-8 w-8 mx-auto mb-2 ${
                  tipoReporte === 'entregas' ? 'text-secondary dark:text-secondary-light' : 'text-gray-500 dark:text-gray-400'
                }`} />
                <div className={`text-sm font-medium ${
                  tipoReporte === 'entregas' ? 'dark:text-secondary-light' : 'dark:text-gray-300'
                }`}>
                  {user.rol === 'instructor' ? 'Mis Entregas' : 'Reporte de Entregas'}
                </div>
              </button>
            )}
            
            {validarPermisos('reporte-uso-ambientes') && (
              <button
                onClick={() => handleTipoReporteChange('uso-ambientes')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  tipoReporte === 'uso-ambientes'
                    ? 'border-success bg-success/10 text-success dark:border-success/70 dark:bg-success/20 dark:text-success-light shadow-lg'
                    : 'border-gray-200 dark:border-gray-600 hover:border-success/50 hover:bg-success/5 dark:hover:border-success/40 dark:hover:bg-success/10'
                }`}
              >
                <Building className={`h-8 w-8 mx-auto mb-2 ${
                  tipoReporte === 'uso-ambientes' ? 'text-success dark:text-success-light' : 'text-gray-500 dark:text-gray-400'
                }`} />
                <div className={`text-sm font-medium ${
                  tipoReporte === 'uso-ambientes' ? 'dark:text-success-light' : 'dark:text-gray-300'
                }`}>Uso de Ambientes</div>
              </button>
            )}
          </div>
        </div>
        
        {/* Error */}
        {error && (
          <div className="bg-gradient-to-r from-danger/10 to-danger/5 dark:from-red-900/20 dark:to-red-800/10 border border-danger/30 dark:border-red-700/50 rounded-xl p-4 mb-6 backdrop-blur-sm">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-danger dark:text-red-400 mr-2" />
              <span className="text-danger-dark dark:text-red-300 font-medium">{error}</span>
            </div>
          </div>
        )}
        
        {/* Estadísticas generales */}
        {tipoReporte === 'estadisticas' && renderEstadisticasCards()}
        
        {/* Filtros */}
        {tipoReporte !== 'estadisticas' && renderFiltros()}
        
        {/* Opciones de descarga */}
        {renderOpcionesDescarga()}
        
        {/* Gráficos */}
        {renderGraficos()}
        
        {/* Tabla de datos */}
        {renderTablaDatos()}
        
        {/* Loading */}
        {loading && (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50 p-8">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-primary dark:text-primary-light mr-3" />
              <span className="text-primary-dark dark:text-primary-light/80 font-medium">Generando reporte...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportesPage;