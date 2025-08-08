import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAmbientes } from '../hooks/useAmbientes';
import AmbientesContainer from '../containers/AmbientesContainer';

const AmbientesPage = () => {
  const navigate = useNavigate();
  const { ambientes, loading, error, createAmbiente, updateAmbiente, deleteAmbiente } = useAmbientes();
  
  // Estados para la UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
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
                         ambiente.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === '' || ambiente.tipo === filterType;
    return matchesSearch && matchesType;
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
    <AmbientesContainer
      // Datos
      ambientes={filteredAmbientes}
      selectedAmbiente={selectedAmbiente}
      loading={loading}
      error={error}
      
      // Estados de UI
      searchTerm={searchTerm}
      filterType={filterType}
      showCreateModal={showCreateModal}
      showEditModal={showEditModal}
      showDeleteModal={showDeleteModal}
      
      // Datos del formulario
      formData={formData}
      editingAmbiente={editingAmbiente}
      isSubmitting={isSubmitting}
      
      // Handlers
      onSearchChange={setSearchTerm}
      onFilterChange={setFilterType}
      onAmbienteClick={handleAmbienteClick}
      onClosePanel={handleClosePanel}
      onCreateNew={handleCreateNew}
      onEdit={handleEdit}
      onDeleteConfirm={handleDeleteConfirm}
      onDelete={handleDelete}
      onInputChange={handleInputChange}
      onServiciosChange={handleServiciosChange}
      onSubmit={handleSubmit}
      onCloseCreateModal={() => setShowCreateModal(false)}
      onCloseEditModal={() => setShowEditModal(false)}
      onCloseDeleteModal={() => setShowDeleteModal(false)}
    />
  );
};

export default AmbientesPage;