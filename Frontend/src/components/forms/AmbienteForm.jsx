import React from 'react';
import { Building2, Users, MapPin, User, Monitor } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select.jsx';
import Card, { CardContent } from '../ui/Card';

const AmbienteForm = ({ 
  formData, 
  onInputChange, 
  onServiciosChange, 
  onSubmit, 
  isSubmitting, 
  editingAmbiente 
}) => {
  const tiposAmbiente = [
    'Aula',
    'Laboratorio', 
    'Auditorio',
    'Oficina',
    'Otro'
  ];

  // Lista de servicios disponibles
  const serviciosDisponibles = [
    'WiFi',
    'Proyector',
    'Aire acondicionado',
    'Pizarra',
    'Computadoras',
    'Audio',
    'Micrófonos',
    'Impresora',
    'Scanner',
    'Televisor',
    'Sistema de sonido',
    'Cámaras de seguridad'
  ];

  // Función para manejar cambios en checkboxes
  const handleServicioChange = (servicio) => {
    const serviciosActuales = Array.isArray(formData.servicios) ? formData.servicios : [];
    let nuevosServicios;
    
    if (serviciosActuales.includes(servicio)) {
      nuevosServicios = serviciosActuales.filter(s => s !== servicio);
    } else {
      nuevosServicios = [...serviciosActuales, servicio];
    }
    
    // Simular evento para mantener compatibilidad
    const event = {
      target: {
        name: 'servicios',
        value: nuevosServicios
      }
    };
    onServiciosChange(event);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre del Ambiente"
              icon={Building2}
              name="nombre"
              value={formData.nombre}
              onChange={onInputChange}
              placeholder="Ej: Aula 101"
              required
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo de Ambiente
              </label>
              <Select 
                name="tipo"
                value={formData.tipo} 
                onValueChange={(value) => onInputChange({ target: { name: 'tipo', value } })}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposAmbiente.map(tipo => (
                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              type="number"
              label="Capacidad"
              icon={Users}
              name="capacidad"
              value={formData.capacidad}
              onChange={onInputChange}
              placeholder="Número de personas"
              min="1"
              required
            />
            
            <Input
              type="number"
              label="Equipos Disponibles"
              icon={Monitor}
              name="equipos"
              value={formData.equipos}
              onChange={onInputChange}
              placeholder="Cantidad de equipos"
              min="0"
            />
            
            <Input
              label="Ubicación"
              icon={MapPin}
              name="ubicacion"
              value={formData.ubicacion}
              onChange={onInputChange}
              placeholder="Ej: Edificio A, Piso 2"
              required
            />
          </div>

          <Input
            label="Responsable"
            icon={User}
            name="responsable"
            value={formData.responsable}
            onChange={onInputChange}
            placeholder="Nombre del responsable"
          />

          {/* Servicios con checkboxes */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Servicios Disponibles
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {serviciosDisponibles.map((servicio) => {
                const serviciosActuales = Array.isArray(formData.servicios) ? formData.servicios : [];
                const isChecked = serviciosActuales.includes(servicio);
                
                return (
                  <label 
                    key={servicio}
                    className="flex items-center space-x-3 p-3 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleServicioChange(servicio)}
                      className="w-4 h-4 text-sena bg-white border-slate-300 rounded focus:ring-sena focus:ring-2 dark:bg-slate-800 dark:border-slate-600"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {servicio}
                    </span>
                  </label>
                );
              })}
            </div>
            
            {/* Servicios seleccionados */}
            {formData.servicios && formData.servicios.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Servicios seleccionados:
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.servicios.map((servicio, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-sena/10 text-sena rounded-full text-xs font-medium"
                    >
                      {servicio}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={onInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-sena-light transition-all duration-200 resize-none"
              placeholder="Descripción detallada del ambiente..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {editingAmbiente ? 'Actualizando...' : 'Creando...'}
                </div>
              ) : (
                editingAmbiente ? 'Actualizar Ambiente' : 'Crear Ambiente'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AmbienteForm;