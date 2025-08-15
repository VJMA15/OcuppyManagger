import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal, Button } from '@/components/ui';

const DeleteConfirmModal = ({ 
  show, 
  onClose, 
  onConfirm, 
  title = "Confirmar Eliminación", 
  message = "¿Estás seguro de que deseas eliminar este elemento?",
  confirmText = "Eliminar",
  isLoading = false
}) => {
  return (
    <Modal show={show} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-slate-900 dark:text-white font-medium">{message}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Eliminando...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;