import React from 'react';
import { Search, Plus, Filter, Building2, Users, MapPin, Edit, Trash2, X } from 'lucide-react';
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
  onDeleteConfirm,
  onDelete,
  onInputChange,
  onServiciosChange,
  onSubmit,
  onCloseCreateModal,
  onCloseEditModal,
  onCloseDeleteModal
}) => {
  const getStatusColor = (estado) => {
    switch (estado) {
      case 'Disponible': return 'success';
      case 'Ocupado': return 'error';
      case 'Mantenimiento': return 'warning';
      default: return 'default';
    }
  };

  const getTypeIcon = (tipo) => {
    switch (tipo) {
      case 'Aula': return Building2;
      case 'Laboratorio': return Building2;
      case 'Auditorio': return Users;
      default: return Building2;
    }
  };

  const getAmbienteIcon = (tipo) => {
    switch (tipo) {
      case 'Aula': return '🏫';
      case 'Laboratorio': return '🔬';
      case 'Auditorio': return '🎭';
      case 'Conferencia': return '💼';
      case 'Reunión': return '👥';
      case 'Taller': return '🔧';
      default: return '🏢';
    }
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
                relative bg-white dark:bg-gray-800 rounded-lg border-2 cursor-pointer
                transition-all duration-200 aspect-square p-4 flex flex-col items-center justify-center
                hover:shadow-lg hover:scale-105 group
                ${
                  selectedAmbiente?._id === ambiente._id
                    ? 'border-blue-500 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }
              `}
            >
              {/* Icono del ambiente */}
              <div className="text-3xl mb-2">
                {getAmbienteIcon(ambiente.tipo)}
              </div>
              
              {/* Nombre del ambiente */}
              <h3 className="text-sm font-medium text-gray-900 dark:text-white text-center mb-2">
                {ambiente.nombre}
              </h3>
              
              {/* Estado */}
              <span className={`
                px-2 py-1 rounded-full text-xs font-medium mb-2
                ${
                  ambiente.estado === 'Disponible'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : ambiente.estado === 'Ocupado'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }
              `}>
                {ambiente.estado}
              </span>
              
              {/* Información básica */}
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                <div>👥 {ambiente.capacidad}</div>
                <div>📍 {ambiente.ubicacion}</div>
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
                  ✏️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConfirm(ambiente);
                  }}
                  className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  🗑️
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
              
              {/* Información básica */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Capacidad</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    👥 {selectedAmbiente.capacidad}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Ubicación</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    📍 {selectedAmbiente.ubicacion}
                  </div>
                </div>
              </div>
              
              {/* Responsable */}
              {selectedAmbiente.responsable && (
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Responsable</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedAmbiente.responsable}
                  </div>
                </div>
              )}
              
              {/* Descripción */}
              {selectedAmbiente.descripcion && (
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedAmbiente.descripcion}
                  </p>
                </div>
              )}
              
              {/* Servicios */}
              {selectedAmbiente.servicios && selectedAmbiente.servicios.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Servicios</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedAmbiente.servicios.map((servicio, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs"
                      >
                        {servicio}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Botones de acción */}
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => onEdit(selectedAmbiente)}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => onDeleteConfirm(selectedAmbiente)}
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
        title="Crear Nuevo Ambiente"
        size="lg"
      >
        <AmbienteForm
          formData={formData}
          onInputChange={onInputChange}
          onServiciosChange={onServiciosChange}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          editingAmbiente={null}
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
          formData={formData}
          onInputChange={onInputChange}
          onServiciosChange={onServiciosChange}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          editingAmbiente={editingAmbiente}
        />
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        show={showDeleteModal}
        onClose={onCloseDeleteModal}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400">
            ¿Estás seguro de que deseas eliminar el ambiente <strong>{editingAmbiente?.nombre}</strong>?
          </p>
          <p className="text-sm text-red-600 dark:text-red-400">
            Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onCloseDeleteModal}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={onDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AmbientesContainer;