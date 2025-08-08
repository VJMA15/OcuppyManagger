import React from 'react';
import { User, FileText, Building2, Calendar, Clock, AlertCircle, Lock, Monitor } from 'lucide-react';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

const ReservaForm = ({ 
  formData, 
  onFormChange, 
  onSubmit, 
  ambientes = [], 
  isSubmitting = false,
  error = null,
  user = null
}) => {
  return (
    <Card className="p-8">
      <CardHeader>
        <CardTitle>Información de la Reserva</CardTitle>
        <CardDescription>
          Completa los datos para crear tu reserva
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Información Personal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre Completo"
              icon={user ? Lock : User}
              name="nombre"
              value={formData.nombre}
              onChange={onFormChange}
              placeholder="Ingresa tu nombre completo"
              required
              readOnly={!!user}
              className={user ? "bg-slate-100 dark:bg-slate-700 cursor-not-allowed" : ""}
            />
            
            <Input
              label="Número de Cédula (CC)"
              icon={user ? Lock : FileText}
              name="CC"
              value={formData.CC}
              onChange={onFormChange}
              placeholder="Número de cédula"
              required
              readOnly={!!user}
              className={user ? "bg-slate-100 dark:bg-slate-700 cursor-not-allowed" : ""}
            />
          </div>

          {/* Selección de Ambiente */}
          <Select
            label="Ambiente a Reservar"
            icon={Building2}
            name="ambiente"
            value={formData.ambiente}
            onChange={onFormChange}
            required
          >
            <option value="">Selecciona un ambiente</option>
            {ambientes.map(ambiente => (
              <option 
                key={ambiente._id} 
                value={ambiente.nombre}  // ✅ Enviar el nombre en lugar del ID
                disabled={!ambiente.disponible}
                className={!ambiente.disponible ? "text-red-500" : ""}
              >
                {ambiente.nombre} - {ambiente.tipo} ({ambiente.capacidad}) 
                {!ambiente.disponible ? " - OCUPADO" : " - Disponible"}
              </option>
            ))}
          </Select>
          
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Los ambientes marcados como "OCUPADO" no están disponibles para reserva
          </p>

          {/* Fecha y Jornada */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="date"
              label="Fecha de Reserva"
              icon={Calendar}
              name="fecha"
              value={formData.fecha}
              onChange={onFormChange}
              required
            />
            
            <Select
              label="Jornada"
              icon={Clock}
              name="jornada"
              value={formData.jornada}
              onChange={onFormChange}
              required
            >
              <option value="">Selecciona una jornada</option>
              <option value="mañana">Mañana (6:00 AM - 12:00 PM)</option>
              <option value="tarde">Tarde (12:30 PM - 6:00 PM)</option>
              <option value="noche">Noche (6:30 PM - 10:00 PM)</option>
            </Select>
          </div>

          {/* Dispositivos Requeridos */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              <Monitor className="inline w-4 h-4 mr-2" />
              Dispositivos Requeridos
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              {[
                { key: 'Cargadores', label: 'Cargadores' },
                { key: 'computadores', label: 'Computadores' },
                { key: 'sonido', label: 'Sistema de Sonido' },
                { key: 'microfono', label: 'Micrófono' },
                { key: 'videoBeam', label: 'Video Beam' },
                { key: 'pizarra', label: 'Pizarra' },
                { key: 'pizarraDigital', label: 'Pizarra Digital' }
              ].map(dispositivo => (
                <label key={dispositivo.key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name={`dispositivos.${dispositivo.key}`}
                    checked={formData.dispositivos?.[dispositivo.key] || false}
                    onChange={onFormChange}
                    className="w-4 h-4 text-sena bg-gray-100 border-gray-300 rounded focus:ring-sena dark:focus:ring-sena-light dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {dispositivo.label}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Selecciona los dispositivos que necesitas para tu actividad
            </p>
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              <FileText className="inline w-4 h-4 mr-2" />
              Motivo de la Reserva
            </label>
            <textarea
              name="motivo"
              value={formData.motivo}
              onChange={onFormChange}
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-sena-light transition-all duration-200 resize-none"
              placeholder="Describe el motivo de tu reserva..."
              required
            />
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                  <h4 className="font-medium text-red-800 dark:text-red-200">
                    Error al crear reserva
                  </h4>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => window.history.back()}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Procesando...
                </div>
              ) : (
                "Crear Reserva"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReservaForm;