import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button, Input, Select, Card, CardContent } from '@/components/ui';

const AdvancedFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  options = {},
  isOpen,
  onToggle
}) => {
  if (!isOpen) {
    return (
      <Button variant="outline" onClick={onToggle} className="flex items-center gap-2">
        <Filter className="w-4 h-4" />
        Filtros Avanzados
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-slate-900 dark:text-white">Filtros Avanzados</h3>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              Limpiar
            </Button>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Fecha desde"
            type="date"
            value={filters.fechaDesde || ''}
            onChange={(e) => onFilterChange('fechaDesde', e.target.value)}
          />
          
          <Input
            label="Fecha hasta"
            type="date"
            value={filters.fechaHasta || ''}
            onChange={(e) => onFilterChange('fechaHasta', e.target.value)}
          />
          
          <Select
            label="Estado"
            value={filters.estado || ''}
            onChange={(e) => onFilterChange('estado', e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobada">Aprobada</option>
            <option value="rechazada">Rechazada</option>
            <option value="completada">Completada</option>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedFilters;