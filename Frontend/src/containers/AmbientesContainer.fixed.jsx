import { 
  Search, 
  Plus, 
  Filter, 
  Building2, 
  Users, 
  MapPin, 
  Edit, 
  Trash2, 
  X, 
  Home, 
  FlaskConical, 
  Presentation, 
  Briefcase, 
  Users2, 
  Wrench,
  GraduationCap,
  Microscope,
  Projector,
  BookOpen
} from 'lucide-react';
import { Button, Input, Select, Card, CardContent, Badge, Modal } from '../components/ui';
import AmbienteForm from '../components/forms/AmbienteForm';

const AmbientesContainer = ({
  // Datos
  ambientes,
  selectedAmbiente,
  loading,
  error,
  
  // Estados de UI
  searchTerm,
  filterType,
  showCreateModal,
  showEditModal,
  showDeleteModal,
  
  // Datos del formulario
  formData,
  editingAmbiente,
  isSubmitting,
  
  // Handlers
  onSearchChange,
  onFilterChange,
  onAmbienteClick,
  onClosePanel,
  onCreateNew,
  onEdit,
  onDelete,
  onDeleteConfirm,
  onInputChange,
  onServiciosChange,
  onSubmit,
  onCloseCreateModal,
  onCloseEditModal,
  onCloseDeleteModal
}) => {
  // Función para obtener el color según el estado
  const getStatusColor = (estado) => {
    switch (estado) {
      case 'Disponible':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Ocupado':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Mantenimiento':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Función para obtener el ícono según el tipo de ambiente
  const getTypeIcon = (tipo) => {
    switch (tipo) {
      case 'Aula': return GraduationCap;
      case 'Laboratorio': return Microscope;
      case 'Auditorio': return Presentation;
      case 'Conferencia': return Briefcase;
      case 'Reunión': return Users2;
      case 'Taller': return Wrench;
      default: return Home;
    }
  };

  const getAmbienteIcon = (tipo) => {
    const Icon = getTypeIcon(tipo);
    return <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
  };

  // Filtrar ambientes
  const filteredAmbientes = ambientes.filter(ambiente => {
    const matchesSearch = ambiente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ambiente.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || ambiente.tipo === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600 dark:text-slate-400">Cargando ambientes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 dark:text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestión de Ambientes</h1>
          <p className="text-slate-600 dark:text-slate-400">Administra los espacios disponibles para reservas</p>
        </div>
        <Button onClick={onCreateNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Ambiente
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                icon={Search}
                placeholder="Buscar por nombre o ubicación..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                icon={Filter}
                value={filterType}
                onChange={(e) => onFilterChange(e.target.value)}
              >
                <option value="">Todos los tipos</option>
                <option value="Aula">Aula</option>
                <option value="Laboratorio">Laboratorio</option>
                <option value="Conferencia">Conferencia</option>
                <option value="Auditorio">Auditorio</option>
                <option value="Reunión">Reunión</option>
                <option value="Taller">Taller</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de ambientes */}
      {filteredAmbientes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">No se encontraron ambientes</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredAmbientes.map((ambiente) => (
            <div
              key={ambiente._id}
              onClick={() => onAmbienteClick(ambiente)}
              className={`
                relative bg-white dark:bg-gray-800 rounded-xl border cursor-pointer
                transition-all duration-300 overflow-hidden
                hover:shadow-xl hover:-translate-y-1 group
                ${
                  selectedAmbiente?._id === ambiente._id
                    ? 'ring-2 ring-blue-500 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }
              `}
            >
              {/* Header con gradiente */}
              <div className="h-2 bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900"></div>
              
              {/* Contenido principal */}
              <div className="p-5 flex flex-col items-center">
                {/* Icono */}
                <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl transform rotate-1 group-hover:rotate-3 transition-transform duration-300"></div>
                  <div className="relative w-16 h-16 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700 group-hover:shadow-md transition-all duration-300">
                    {getAmbienteIcon(ambiente.tipo)}
                  </div>
                </div>
                
                {/* Información del ambiente */}
                <div className="text-center">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {ambiente.nombre}
                  </h3>
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">
                    {ambiente.tipo.toUpperCase()}
                  </p>
                </div>
                
                {/* Estado */}
                <div className="mt-3 w-full">
                  <span className={`
                    inline-block w-full px-3 py-1.5 rounded-lg text-xs font-medium text-center shadow-sm
                    ${
                      ambiente.estado === 'Disponible'
                        ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-200 dark:from-green-900/50 dark:to-green-800/50 dark:border-green-700 dark:text-green-200'
                        : ambiente.estado === 'Ocupado'
                        ? 'bg-gradient-to-r from-red-100 to-red-50 text-red-700 border border-red-200 dark:from-red-900/50 dark:to-red-800/50 dark:border-red-700 dark:text-red-200'
                        : 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 border border-yellow-200 dark:from-yellow-900/50 dark:to-yellow-800/50 dark:border-yellow-700 dark:text-yellow-200'
                    }
                  `}>
                    {ambiente.estado}
                  </span>
                </div>
                
                {/* Información básica */}
                <div className="w-full mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <Users2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>{ambiente.capacidad} personas</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span className="truncate max-w-[140px]">{ambiente.ubicacion}</span>
                  </div>
                </div>
              </div>
              
              {/* Botones de acción (aparecen al hover) */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(ambiente);
                  }}
                  className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConfirm(ambiente);
                  }}
                  className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Panel de detalles centrado */}
      {selectedAmbiente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {getAmbienteIcon(selectedAmbiente.tipo)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedAmbiente.nombre}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedAmbiente.tipo}
                  </p>
                </div>
              </div>
              <button
                onClick={onClosePanel}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
              >
                ✕
              </button>
            </div>
            
            {/* Contenido */}
            <div className="p-6 space-y-4">
              {/* Estado */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado:</span>
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${
                    selectedAmbiente.estado === 'Disponible'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : selectedAmbiente.estado === 'Ocupado'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }
                `}>
                  {selectedAmbiente.estado}
                </span>
              </div>

              {/* Capacidad y Ubicación */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Capacidad</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedAmbiente.capacidad} personas
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Ubicación</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedAmbiente.ubicacion}
                  </p>
                </div>
              </div>

              {/* Descripción */}
              {selectedAmbiente.descripcion && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedAmbiente.descripcion}
                  </p>
                </div>
              )}

              {/* Servicios */}
              {selectedAmbiente.servicios && selectedAmbiente.servicios.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Servicios</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAmbiente.servicios.map((servicio, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {servicio}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  onEdit(selectedAmbiente);
                  onClosePanel();
                }}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => {
                  onDelete(selectedAmbiente);
                  onClosePanel();
                }}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de creación */}
      <Modal
        show={showCreateModal}
        onClose={onCloseCreateModal}
        title="Nuevo Ambiente"
        size="lg"
      >
        <AmbienteForm
          formData={formData}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onInputChange={onInputChange}
          onServiciosChange={onServiciosChange}
          onClose={onCloseCreateModal}
        />
      </Modal>

      {/* Modal de edición */}
      <Modal
        show={showEditModal}
        onClose={onCloseEditModal}
        title="Editar Ambiente"
        size="lg"
      >
        <AmbienteForm
          formData={editingAmbiente}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onInputChange={onInputChange}
          onServiciosChange={onServiciosChange}
          onClose={onCloseEditModal}
          isEdit
        />
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        show={showDeleteModal}
        onClose={onCloseDeleteModal}
        title="Eliminar Ambiente"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            ¿Estás seguro de que deseas eliminar este ambiente? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onCloseDeleteModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onDelete(editingAmbiente);
                onCloseDeleteModal();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AmbientesContainer;
