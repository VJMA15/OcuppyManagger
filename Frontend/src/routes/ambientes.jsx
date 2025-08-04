import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Building2, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Edit, 
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  Monitor,
  Wifi,
  Power,
  AlertCircle,
  Trash2,
  X,
  Save
} from "lucide-react";
import { useAmbientes } from "@/hooks/useAmbientes";

export default function Ambientes() {
  const { ambientes, isLoading, createAmbiente, updateAmbiente, deleteAmbiente, fetchAmbientes } = useAmbientes();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedAmbiente, setSelectedAmbiente] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingAmbiente, setEditingAmbiente] = useState(null);
  const [ambienteToDelete, setAmbienteToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: '',
    capacidad: '',
    equipos: '',
    ubicacion: '',
    descripcion: '',
    servicios: [],
    horario: '',
    responsable: ''
  });

  // Aplicar filtro automático si viene de URL
  useEffect(() => {
    const filterFromUrl = searchParams.get('filter');
    if (filterFromUrl === 'ocupados') {
      setFilterEstado('Ocupado');
    }
  }, [searchParams]);

  // Filtrar ambientes
  const filteredAmbientes = ambientes.filter(ambiente => {
    const matchesSearch = ambiente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ambiente.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ambiente.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === "todos" || ambiente.tipo === filterTipo;
    const matchesEstado = filterEstado === "todos" || ambiente.estado === filterEstado;
    
    return matchesSearch && matchesTipo && matchesEstado;
  });

  // Obtener tipos únicos para el filtro
  const tiposUnicos = [...new Set(ambientes.map(a => a.tipo).filter(Boolean))];
  const estadosUnicos = [...new Set(ambientes.map(a => a.estado).filter(Boolean))];

  // Función para obtener el color del estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case "Disponible":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Ocupado":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Mantenimiento":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400";
    }
  };

  // Función para obtener el icono del tipo
  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case "Conferencia":
        return <Users className="w-4 h-4" />;
      case "Laboratorio":
        return <Monitor className="w-4 h-4" />;
      case "Aula":
        return <Building2 className="w-4 h-4" />;
      case "Auditorio":
        return <Users className="w-4 h-4" />;
      case "Reunión":
        return <Users className="w-4 h-4" />;
      case "Taller":
        return <Building2 className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  // Manejar click en ambiente
  const handleAmbienteClick = (ambiente) => {
    console.log('🔍 Click en ambiente:', ambiente.nombre);
    setSelectedAmbiente(ambiente);
    setShowPanel(true);
    console.log('✅ Panel abierto para:', ambiente.nombre);
  };

  // Cerrar panel de detalles
  const handleClosePanel = () => {
    console.log('🚪 Cerrando panel');
    setShowPanel(false);
    setSelectedAmbiente(null);
  };

  // Abrir modal para crear nuevo ambiente
  const handleCreateNew = () => {
    setEditingAmbiente(null);
    setFormData({
      nombre: '',
      tipo: '',
      capacidad: '',
      equipos: '',
      ubicacion: '',
      descripcion: '',
      servicios: [],
      horario: '8:00 AM - 6:00 PM',
      responsable: ''
    });
    setShowModal(true);
  };

  // Abrir modal para editar ambiente
  const handleEdit = (ambiente, e) => {
    e.stopPropagation();
    setEditingAmbiente(ambiente);
    setFormData({
      nombre: ambiente.nombre || '',
      tipo: ambiente.tipo || '',
      capacidad: ambiente.capacidad?.toString() || '',
      equipos: ambiente.equipos?.toString() || '',
      ubicacion: ambiente.ubicacion || '',
      descripcion: ambiente.descripcion || '',
      servicios: ambiente.servicios || [],
      horario: ambiente.horario || '8:00 AM - 6:00 PM',
      responsable: ambiente.responsable || ''
    });
    setShowModal(true);
  };

  // Confirmar eliminación
  const handleDeleteConfirm = (ambiente, e) => {
    e.stopPropagation();
    setAmbienteToDelete(ambiente);
    setShowDeleteModal(true);
  };

  // Ejecutar eliminación
  const handleDelete = async () => {
    if (!ambienteToDelete) return;
    
    try {
      setIsSubmitting(true);
      await deleteAmbiente(ambienteToDelete._id);
      setShowDeleteModal(false);
      setAmbienteToDelete(null);
      console.log('✅ Ambiente eliminado exitosamente');
    } catch (error) {
      console.error('❌ Error al eliminar ambiente:', error);
      alert('Error al eliminar el ambiente. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar servicios
  const handleServiciosChange = (e) => {
    const value = e.target.value;
    const serviciosArray = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    setFormData(prev => ({
      ...prev,
      servicios: serviciosArray
    }));
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.nombre.trim() || !formData.tipo.trim()) {
      alert('Por favor, completa al menos el nombre y tipo del ambiente.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const ambienteData = {
        ...formData,
        capacidad: parseInt(formData.capacidad) || 0,
        equipos: parseInt(formData.equipos) || 0,
        estado: 'Disponible' // Estado por defecto
      };

      if (editingAmbiente) {
        await updateAmbiente(editingAmbiente._id, ambienteData);
        console.log('✅ Ambiente actualizado exitosamente');
      } else {
        await createAmbiente(ambienteData);
        console.log('✅ Ambiente creado exitosamente');
      }
      
      setShowModal(false);
      setEditingAmbiente(null);
      
    } catch (error) {
      console.error('❌ Error al guardar ambiente:', error);
      alert('Error al guardar el ambiente. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Ambientes</h1>
          <p className="text-slate-600 dark:text-slate-400">Gestiona y visualiza todos los ambientes disponibles</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-sena text-white rounded-lg hover:bg-sena-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Ambiente
        </button>
      </div>

      {/* Indicador de carga */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sena mx-auto mb-2"></div>
            <p className="text-slate-600 dark:text-slate-400">Cargando ambientes...</p>
          </div>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        {/* Indicador de filtro activo */}
        {filterEstado === 'Ocupado' && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-800 dark:text-red-200">
                  Mostrando solo ambientes ocupados
                </span>
              </div>
              <button
                onClick={() => setFilterEstado('todos')}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                Ver todos
              </button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar ambientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sena focus:border-transparent"
            />
          </div>

          {/* Filtro por tipo */}
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sena focus:border-transparent"
          >
            <option value="todos">Todos los tipos</option>
            {tiposUnicos.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>

          {/* Filtro por estado */}
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sena focus:border-transparent"
          >
            <option value="todos">Todos los estados</option>
            {estadosUnicos.map(estado => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>

          {/* Contador */}
          <div className="flex items-center justify-center px-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {filteredAmbientes.length} de {ambientes.length} ambientes
            </span>
          </div>
        </div>
      </div>

      {/* Grid de ambientes */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAmbientes.map((ambiente) => (
          <div
            key={ambiente._id || ambiente.id}
            onClick={() => handleAmbienteClick(ambiente)}
            className="group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 cursor-pointer hover:shadow-lg hover:border-sena/50 transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Estado badge */}
            <div className="absolute top-4 right-4">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(ambiente.estado)}`}>
                {ambiente.estado}
              </span>
            </div>

            {/* Botones de acción */}
            <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleEdit(ambiente, e)}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                title="Editar ambiente"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => handleDeleteConfirm(ambiente, e)}
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                title="Eliminar ambiente"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido de la tarjeta */}
            <div className="mt-8">
              {/* Tipo y nombre */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-sena/10 rounded-lg">
                  {getTipoIcon(ambiente.tipo)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                    {ambiente.nombre}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {ambiente.tipo}
                  </p>
                </div>
              </div>

              {/* Información básica */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <MapPin className="w-4 h-4" />
                  <span>{ambiente.ubicacion}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Users className="w-4 h-4" />
                    <span>{ambiente.capacidad} personas</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Monitor className="w-4 h-4" />
                    <span>{ambiente.equipos} equipos</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>{ambiente.horario}</span>
                </div>
              </div>

              {/* Descripción truncada */}
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                {ambiente.descripcion}
              </p>

              {/* Servicios */}
              {ambiente.servicios && ambiente.servicios.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-1">
                    {ambiente.servicios.slice(0, 3).map((servicio, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded"
                      >
                        {servicio}
                      </span>
                    ))}
                    {ambiente.servicios.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                        +{ambiente.servicios.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          ))}
        </div>
      )}

      {/* Modal de crear/editar ambiente */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {editingAmbiente ? 'Editar Ambiente' : 'Crear Nuevo Ambiente'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nombre del Ambiente *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sena focus:border-transparent"
                    placeholder="Ej: Sala de Conferencias A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Tipo *
                  </label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sena focus:border-transparent"
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="Conferencia">Conferencia</option>
                    <option value="Laboratorio">Laboratorio</option>
                    <option value="Aula">Aula</option>
                    <option value="Auditorio">Auditorio</option>
                    <option value="Reunión">Reunión</option>
                    <option value="Taller">Taller</option>
                  </select>
                </div>
              </div>

              {/* Capacidad y equipos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Capacidad (personas)
                  </label>
                  <input
                    type="number"
                    name="capacidad"
                    value={formData.capacidad}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sena focus:border-transparent"
                    placeholder="Ej: 20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Número de Equipos
                  </label>
                  <input
                    type="number"
                    name="equipos"
                    value={formData.equipos}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sena focus:border-transparent"
                    placeholder="Ej: 15"
                  />
                </div>
              </div>

              {/* Ubicación */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sena focus:border-transparent"
                  placeholder="Ej: Piso 1 - Ala Norte"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sena focus:border-transparent"
                  placeholder="Describe las características y equipamiento del ambiente..."
                />
              </div>

              {/* Servicios */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Servicios Disponibles
                </label>
                <input
                  type="text"
                  value={formData.servicios.join(', ')}
                  onChange={handleServiciosChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sena focus:border-transparent"
                  placeholder="Ej: Proyector, Audio, WiFi, Aire acondicionado (separados por comas)"
                />
              </div>

              {/* Horario y responsable */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Horario de Disponibilidad
                  </label>
                  <input
                    type="text"
                    name="horario"
                    value={formData.horario}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sena focus:border-transparent"
                    placeholder="Ej: 8:00 AM - 6:00 PM"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Responsable
                  </label>
                  <input
                    type="text"
                    name="responsable"
                    value={formData.responsable}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sena focus:border-transparent"
                    placeholder="Ej: María González"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-300 text-slate-800 rounded-lg hover:bg-slate-400 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-sena text-white rounded-lg hover:bg-sena-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingAmbiente ? 'Actualizar' : 'Crear'} Ambiente
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && ambienteToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Confirmar Eliminación
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
              
              <p className="text-slate-700 dark:text-slate-300 mb-6">
                ¿Estás seguro de que deseas eliminar el ambiente <strong>"{ambienteToDelete.nombre}"</strong>?
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-300 text-slate-800 rounded-lg hover:bg-slate-400 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panel de detalles del ambiente */}
      {showPanel && selectedAmbiente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sena/10 rounded-lg">
                  {getTipoIcon(selectedAmbiente.tipo)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {selectedAmbiente.nombre}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {selectedAmbiente.tipo}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getEstadoColor(selectedAmbiente.estado)}`}>
                  {selectedAmbiente.estado}
                </span>
                <button
                  onClick={handleClosePanel}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-6">
              {/* Ubicación */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <MapPin className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Ubicación</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedAmbiente.ubicacion}</p>
                </div>
              </div>

              {/* Capacidad y equipos */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <Users className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Capacidad</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedAmbiente.capacidad} personas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <Monitor className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Equipos</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedAmbiente.equipos} equipos</p>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Descripción</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {selectedAmbiente.descripcion}
                </p>
              </div>

              {/* Servicios */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Servicios disponibles</h3>
                <div className="grid grid-cols-1 gap-2">
                  {selectedAmbiente.servicios && selectedAmbiente.servicios.length > 0 ? (
                    selectedAmbiente.servicios.map((servicio, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{servicio}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <span className="text-sm text-slate-500 dark:text-slate-400">No hay servicios registrados</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Información adicional */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Horario</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedAmbiente.horario}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <Users className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Responsable</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedAmbiente.responsable}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Última reserva</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {selectedAmbiente.ultimaReserva ? new Date(selectedAmbiente.ultimaReserva).toLocaleDateString('es-ES') : 'Sin reservas'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={handleClosePanel}
                className="flex-1 px-4 py-3 bg-slate-300 text-slate-800 rounded-lg hover:bg-slate-400 transition-colors font-medium"
              >
                Cerrar
              </button>
              <button className="flex-1 px-4 py-3 bg-sena text-white rounded-lg hover:bg-sena-dark transition-colors font-medium">
                Reservar Ambiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
