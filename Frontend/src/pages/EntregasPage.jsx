import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  User, 
  CheckCircle, 
  XCircle, 
  MoreVertical, 
  AlertCircle, 
  MapPin, 
  Users as UsersIcon, 
  Plus, 
  Eye, 
  FileText, 
  Building2, 
  Sun,
  Package,
  ArrowLeft,
  Download
} from 'lucide-react';
import useEntregas from '../hooks/useEntregas';
import { useAuthContext } from '../contexts/auth-context';
import { useAmbientes } from '../hooks/useAmbientes';
import { useUsers } from '../hooks/useUsers';

const EntregasPage = () => {
  const { user } = useAuthContext();
  const {
    entregas,
    loading,
    error,
    estadisticas,
    filtros,
    paginacion,
    fetchEntregas,
    crearEntrega,
    devolverEntrega,
    cancelarEntrega,
    obtenerEntregasPorJornada,
    obtenerEntregasVencidas,
    fetchEstadisticas,
    actualizarFiltros,
    cambiarPagina,
    limpiarFiltros,
    limpiarError,
    obtenerJornadaActual,
    formatearFecha,
    formatearHora,
    calcularTiempoTranscurrido,
    esEntregaVencida,
    obtenerColorEstado,
    obtenerTextoEstado,
    obtenerResumenRapido,
    generarReporte
  } = useEntregas();
  
  const { ambientes, fetchAmbientes } = useAmbientes();
  const { users, fetchUsers } = useUsers();
  
  // Estados locales
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('crear'); // 'crear', 'ver', 'devolver'
  const [selectedEntrega, setSelectedEntrega] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [entregasVencidas, setEntregasVencidas] = useState([]);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    ambiente: '',
    instructor: '',
    jornada: obtenerJornadaActual(),
    observacionesEntrega: '',
    equiposEntregados: []
  });
  
  const [observacionesDevolucion, setObservacionesDevolucion] = useState('');
  const [motivoCancelacion, setMotivoCancelacion] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    fetchAmbientes();
    fetchUsers({ rol: 'instructor' });
    fetchEstadisticas();
    cargarEntregasVencidas();
  }, []);

  // Cargar entregas vencidas
  const cargarEntregasVencidas = async () => {
    try {
      const vencidas = await obtenerEntregasVencidas();
      setEntregasVencidas(vencidas);
    } catch (err) {
      console.error('Error al cargar entregas vencidas:', err);
    }
  };

  // Manejar cambios en filtros
  const handleFiltroChange = (campo, valor) => {
    actualizarFiltros({ [campo]: valor });
  };

  // Manejar búsqueda
  const handleSearch = (e) => {
    const valor = e.target.value;
    actualizarFiltros({ search: valor });
  };

  // Abrir modal para crear entrega
  const abrirModalCrear = () => {
    setFormData({
      ambiente: '',
      instructor: '',
      jornada: obtenerJornadaActual(),
      observacionesEntrega: '',
      equiposEntregados: []
    });
    setModalType('crear');
    setShowModal(true);
  };

  // Abrir modal para ver detalles
  const abrirModalVer = (entrega) => {
    setSelectedEntrega(entrega);
    setModalType('ver');
    setShowModal(true);
  };

  // Abrir modal para devolver
  const abrirModalDevolver = (entrega) => {
    setSelectedEntrega(entrega);
    setObservacionesDevolucion('');
    setModalType('devolver');
    setShowModal(true);
  };

  // Cerrar modal
  const cerrarModal = () => {
    setShowModal(false);
    setSelectedEntrega(null);
    setObservacionesDevolucion('');
    setMotivoCancelacion('');
    limpiarError();
  };

  // Manejar envío del formulario de crear entrega
  const handleSubmitCrear = async (e) => {
    e.preventDefault();
    
    try {
      await crearEntrega(formData);
      cerrarModal();
      // Mostrar notificación de éxito
    } catch (err) {
      // El error ya se maneja en el hook
    }
  };

  // Manejar devolución de entrega
  const handleDevolver = async () => {
    if (!selectedEntrega) return;
    
    try {
      await devolverEntrega(selectedEntrega._id, observacionesDevolucion);
      cerrarModal();
      // Mostrar notificación de éxito
    } catch (err) {
      // El error ya se maneja en el hook
    }
  };

  // Manejar cancelación de entrega
  const handleCancelar = async (entrega) => {
    const motivo = prompt('Ingrese el motivo de cancelación:');
    if (!motivo) return;
    
    try {
      await cancelarEntrega(entrega._id, motivo);
      // Mostrar notificación de éxito
    } catch (err) {
      // El error ya se maneja en el hook
    }
  };

  // Obtener instructores disponibles
  const instructoresDisponibles = users.filter(u => u.rol === 'instructor');

  // Obtener ambientes disponibles
  const ambientesDisponibles = ambientes.filter(a => a.activo && a.estado === 'Disponible');

  // Obtener resumen
  const resumen = obtenerResumenRapido();

  // Filtrar entregas mostradas
  const entregasFiltradas = entregas;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Entregas</h1>
            <p className="text-gray-600 mt-2">
              Administra las entregas de ambientes a instructores
            </p>
          </div>
          
          {(user?.rol === 'guardia' || user?.rol === 'administrador') && (
            <button
              onClick={abrirModalCrear}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nueva Entrega
            </button>
          )}
        </div>

        {/* Resumen rápido */}
        {resumen && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{resumen.total}</p>
                </div>
                <Package className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Entregados</p>
                  <p className="text-2xl font-bold text-blue-600">{resumen.entregados}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Devueltos</p>
                  <p className="text-2xl font-bold text-green-600">{resumen.devueltos}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cancelados</p>
                  <p className="text-2xl font-bold text-red-600">{resumen.cancelados}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vencidos</p>
                  <p className="text-2xl font-bold text-orange-600">{resumen.vencidos}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Alertas de entregas vencidas */}
      {entregasVencidas.length > 0 && (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-orange-800">
              Entregas Vencidas ({entregasVencidas.length})
            </h3>
          </div>
          <p className="text-orange-700 text-sm">
            Hay entregas que llevan más de 8 horas sin devolver. Revisa la lista para tomar acción.
          </p>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por instructor, ambiente..."
                value={filtros.search}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-4">
            <select
              value={filtros.estado}
              onChange={(e) => handleFiltroChange('estado', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="entregado">Entregado</option>
              <option value="devuelto">Devuelto</option>
              <option value="cancelado">Cancelado</option>
            </select>

            <select
              value={filtros.jornada}
              onChange={(e) => handleFiltroChange('jornada', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las jornadas</option>
              <option value="mañana">Mañana</option>
              <option value="tarde">Tarde</option>
              <option value="noche">Noche</option>
            </select>

            <button
              onClick={limpiarFiltros}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Mostrar error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
            <button
              onClick={limpiarError}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Lista de entregas */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Entregas Registradas</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Total: {paginacion.totalItems}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando entregas...</p>
          </div>
        ) : entregasFiltradas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No se encontraron entregas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ambiente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jornada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiempo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entregasFiltradas.map((entrega) => (
                  <tr key={entrega._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {entrega.instructor?.nombre || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {entrega.instructor?.email || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {entrega.ambiente?.nombre || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {entrega.ambiente?.tipo || ''} - {entrega.ambiente?.ubicacion || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Sun className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 capitalize">
                          {entrega.jornada}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatearFecha(entrega.fechaEntrega)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatearHora(entrega.fechaEntrega)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        obtenerColorEstado(entrega.estado)
                      }`}>
                        {obtenerTextoEstado(entrega.estado)}
                      </span>
                      {esEntregaVencida(entrega.fechaEntrega, entrega.estado) && (
                        <div className="flex items-center mt-1">
                          <AlertCircle className="w-4 h-4 text-orange-500 mr-1" />
                          <span className="text-xs text-orange-600">Vencida</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entrega.estado === 'entregado' && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {calcularTiempoTranscurrido(entrega.fechaEntrega)}
                        </div>
                      )}
                      {entrega.estado === 'devuelto' && entrega.fechaDevolucion && (
                        <div className="text-green-600">
                          Devuelto: {formatearHora(entrega.fechaDevolucion)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => abrirModalVer(entrega)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {entrega.estado === 'entregado' && (user?.rol === 'guardia' || user?.rol === 'administrador') && (
                          <button
                            onClick={() => abrirModalDevolver(entrega)}
                            className="text-green-600 hover:text-green-900"
                            title="Marcar como devuelto"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        
                        {(entrega.estado === 'pendiente' || entrega.estado === 'entregado') && 
                         (user?.rol === 'guardia' || user?.rol === 'administrador') && (
                          <button
                            onClick={() => handleCancelar(entrega)}
                            className="text-red-600 hover:text-red-900"
                            title="Cancelar entrega"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {paginacion.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {((paginacion.currentPage - 1) * paginacion.itemsPerPage) + 1} a{' '}
                {Math.min(paginacion.currentPage * paginacion.itemsPerPage, paginacion.totalItems)} de{' '}
                {paginacion.totalItems} resultados
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => cambiarPagina(paginacion.currentPage - 1)}
                  disabled={paginacion.currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 text-sm">
                  Página {paginacion.currentPage} de {paginacion.totalPages}
                </span>
                <button
                  onClick={() => cambiarPagina(paginacion.currentPage + 1)}
                  disabled={paginacion.currentPage === paginacion.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {modalType === 'crear' && 'Nueva Entrega'}
                  {modalType === 'ver' && 'Detalles de Entrega'}
                  {modalType === 'devolver' && 'Devolver Entrega'}
                </h3>
                <button
                  onClick={cerrarModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              {modalType === 'crear' && (
                <form onSubmit={handleSubmitCrear} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ambiente *
                      </label>
                      <select
                        value={formData.ambiente}
                        onChange={(e) => setFormData(prev => ({ ...prev, ambiente: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar ambiente</option>
                        {ambientesDisponibles.map(ambiente => (
                          <option key={ambiente._id} value={ambiente._id}>
                            {ambiente.nombre} - {ambiente.tipo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instructor *
                      </label>
                      <select
                        value={formData.instructor}
                        onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar instructor</option>
                        {instructoresDisponibles.map(instructor => (
                          <option key={instructor._id} value={instructor._id}>
                            {instructor.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jornada *
                      </label>
                      <select
                        value={formData.jornada}
                        onChange={(e) => setFormData(prev => ({ ...prev, jornada: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="mañana">Mañana</option>
                        <option value="tarde">Tarde</option>
                        <option value="noche">Noche</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observaciones
                    </label>
                    <textarea
                      value={formData.observacionesEntrega}
                      onChange={(e) => setFormData(prev => ({ ...prev, observacionesEntrega: e.target.value }))}
                      rows={3}
                      maxLength={500}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Observaciones adicionales sobre la entrega..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.observacionesEntrega.length}/500 caracteres
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={cerrarModal}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Creando...' : 'Crear Entrega'}
                    </button>
                  </div>
                </form>
              )}

              {modalType === 'ver' && selectedEntrega && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instructor
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedEntrega.instructor?.nombre || 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ambiente
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedEntrega.ambiente?.nombre || 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jornada
                      </label>
                      <p className="text-sm text-gray-900 capitalize">
                        {selectedEntrega.jornada}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                      </label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        obtenerColorEstado(selectedEntrega.estado)
                      }`}>
                        {obtenerTextoEstado(selectedEntrega.estado)}
                      </span>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Entrega
                      </label>
                      <p className="text-sm text-gray-900">
                        {formatearFecha(selectedEntrega.fechaEntrega)} - {formatearHora(selectedEntrega.fechaEntrega)}
                      </p>
                    </div>
                    
                    {selectedEntrega.fechaDevolucion && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha de Devolución
                        </label>
                        <p className="text-sm text-gray-900">
                          {formatearFecha(selectedEntrega.fechaDevolucion)} - {formatearHora(selectedEntrega.fechaDevolucion)}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código de Verificación
                      </label>
                      <p className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {selectedEntrega.codigoVerificacion}
                      </p>
                    </div>
                  </div>
                  
                  {selectedEntrega.observacionesEntrega && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observaciones de Entrega
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {selectedEntrega.observacionesEntrega}
                      </p>
                    </div>
                  )}
                  
                  {selectedEntrega.observacionesDevolucion && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observaciones de Devolución
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {selectedEntrega.observacionesDevolucion}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {modalType === 'devolver' && selectedEntrega && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Confirmar Devolución
                    </h4>
                    <p className="text-blue-800 text-sm">
                      Ambiente: <strong>{selectedEntrega.ambiente?.nombre}</strong><br />
                      Instructor: <strong>{selectedEntrega.instructor?.nombre}</strong><br />
                      Entregado: <strong>{formatearFecha(selectedEntrega.fechaEntrega)} - {formatearHora(selectedEntrega.fechaEntrega)}</strong>
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observaciones de Devolución
                    </label>
                    <textarea
                      value={observacionesDevolucion}
                      onChange={(e) => setObservacionesDevolucion(e.target.value)}
                      rows={3}
                      maxLength={500}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Estado del ambiente, equipos devueltos, observaciones..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {observacionesDevolucion.length}/500 caracteres
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={cerrarModal}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDevolver}
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Procesando...' : 'Confirmar Devolución'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntregasPage;