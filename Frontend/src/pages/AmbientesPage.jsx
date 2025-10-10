import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAmbientes } from '../hooks/useAmbientes';
import AmbientesContainer from '../containers/AmbientesContainer';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select.jsx';
import { Plus } from 'lucide-react';

const AmbientesPage = () => {
  const navigate = useNavigate();
  const { ambientes, loading, error, createAmbiente, updateAmbiente, deleteAmbiente } = useAmbientes();
  
  // Estados para la UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedAmbiente, setSelectedAmbiente] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingAmbiente, setEditingAmbiente] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: '',
    capacidad: '',
    ubicacion: '',
    descripcion: '',
    servicios: [],
    responsable: '',
    equipos: '0' // Agregar este campo
  });

  // Funciones de filtrado
  const filteredAmbientes = ambientes.filter(ambiente => {
    const matchesSearch = ambiente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ambiente.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ambiente.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || ambiente.tipo === filterType;
    
    return matchesSearch && matchesFilter;
  });

  // Handlers para la UI
  const handleAmbienteClick = (ambiente) => {
    setSelectedAmbiente(ambiente);
  };

  const handleClosePanel = () => {
    setSelectedAmbiente(null);
  };

    const handleCreateNew = () => {
    setFormData({
      nombre: '',
      tipo: '',
      capacidad: '',
      ubicacion: '',
      descripcion: '',
      servicios: [], // Ensure it's always an array
      responsable: '',
      equipos: '0'
    });
    setEditingAmbiente(null);
    setShowCreateModal(true);
  };

    const handleEdit = (ambiente) => {
      setFormData({
        nombre: ambiente.nombre || '',
        tipo: ambiente.tipo || '',
        capacidad: ambiente.capacidad?.toString() || '',
        ubicacion: ambiente.ubicacion || '',
        descripcion: ambiente.descripcion || '',
        servicios: Array.isArray(ambiente.servicios) ? ambiente.servicios : (ambiente.servicios ? [ambiente.servicios] : []),
        responsable: ambiente.responsable || '',
        equipos: ambiente.equipos?.toString() || '0'
      });
      setEditingAmbiente(ambiente);
      setShowEditModal(true);
    };

  const handleDeleteConfirm = (ambiente) => {
    setEditingAmbiente(ambiente);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!editingAmbiente) return;
    
    setIsSubmitting(true);
    try {
      await deleteAmbiente(editingAmbiente._id);
      setShowDeleteModal(false);
      setEditingAmbiente(null);
      if (selectedAmbiente?._id === editingAmbiente._id) {
        setSelectedAmbiente(null);
      }
    } catch (error) {
      console.error('Error al eliminar ambiente:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiciosChange = (e) => {
    // Si viene del nuevo sistema de checkboxes
    if (e.target && e.target.name === 'servicios' && Array.isArray(e.target.value)) {
      setFormData(prev => ({
        ...prev,
        servicios: e.target.value
      }));
    } else {
      // Compatibilidad con textarea (si aún se usa)
      const servicios = e.target.value.split(',').map(s => s.trim()).filter(s => s);
      setFormData(prev => ({
        ...prev,
        servicios
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.tipo || !formData.capacidad) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }
  
    setIsSubmitting(true);
    try {
      const ambienteData = {
        ...formData,
        capacidad: parseInt(formData.capacidad),
        equipos: parseInt(formData.equipos) || 0  // Agregar conversión de equipos
      };
  
      if (editingAmbiente) {
        await updateAmbiente(editingAmbiente._id, ambienteData);
        setShowEditModal(false);
      } else {
        await createAmbiente(ambienteData);
        setShowCreateModal(false);
      }
      
      setFormData({
        nombre: '',
        tipo: '',
        capacidad: '',
        ubicacion: '',
        descripcion: '',
        servicios: [],
        responsable: '',
        equipos: '0' // Agregar este campo
      });
      setEditingAmbiente(null);
    } catch (error) {
      console.error('Error al guardar ambiente:', error);
      alert('Error al guardar el ambiente. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-blue-600 dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white">Gestión de Ambientes - CTPGA</h1>
          <p className="text-blue-100 dark:text-gray-300">Administra los espacios educativos del centro</p>
        </div>
      </div>
      
      <main className="container mx-auto py-8 px-4">
        <Card className="mb-8 border border-blue-200 dark:border-gray-700 shadow-lg">
          <CardHeader className="bg-blue-50 dark:bg-gray-800 rounded-t-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-blue-800 dark:text-white">Panel de Control</CardTitle>
                <p className="text-sm text-blue-600 dark:text-gray-400">
                  {filteredAmbientes.length} ambientes encontrados
                  {filterType && ` • Filtrado por: ${filterType}`}
                </p>
              </div>
              <Button 
                onClick={handleCreateNew}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>Nuevo Ambiente</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-2">
                <Input
                  type="text"
                  placeholder="Buscar ambientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <Select 
                  value={filterType} 
                  onValueChange={setFilterType}
                >
                  <SelectTrigger className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <SelectValue>
                      {filterType === 'all' ? 'Todos los tipos' : filterType}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="Aula">Aula</SelectItem>
                    <SelectItem value="Laboratorio">Laboratorio</SelectItem>
                    <SelectItem value="Auditorio">Auditorio</SelectItem>
                    <SelectItem value="Taller">Taller</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <AmbientesContainer
              ambientes={filteredAmbientes}
              selectedAmbiente={selectedAmbiente}
              loading={loading}
              error={error}
              searchTerm={searchTerm}
              filterType={filterType}
              showCreateModal={showCreateModal}
              showEditModal={showEditModal}
              showDeleteModal={showDeleteModal}
              formData={formData}
              editingAmbiente={editingAmbiente}
              isSubmitting={isSubmitting}
              onSearchChange={setSearchTerm}
              onFilterChange={setFilterType}
              onAmbienteClick={handleAmbienteClick}
              onClosePanel={handleClosePanel}
              onCreateNew={handleCreateNew}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDeleteConfirm={handleDeleteConfirm}
              onInputChange={handleInputChange}
              onServiciosChange={handleServiciosChange}
              onSubmit={handleSubmit}
              onCloseCreateModal={() => setShowCreateModal(false)}
              onCloseEditModal={() => setShowEditModal(false)}
              onCloseDeleteModal={() => setShowDeleteModal(false)}
            />
          </CardContent>
        </Card>
      </main>
      
      <footer className="bg-primary-700 dark:bg-gray-900 text-white py-6 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold">CTP de Grecia</h3>
              <p className="text-primary-200 dark:text-gray-400">Sistema de Gestión de Ambientes</p>
            </div>
            <div className="flex space-x-4">
              <span className="text-primary-200 dark:text-gray-400"> 2023 Todos los derechos reservados</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AmbientesPage;