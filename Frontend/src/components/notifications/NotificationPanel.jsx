import React, { useEffect } from 'react';
import { Bell, X, Calendar, Clock, User, Building2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuthContext } from '../../contexts/auth-context';
import { cn } from '../../utils/cn';

const NotificationPanel = ({ isOpen, onClose }) => {
  const { user } = useAuthContext();
  const { notifications, loading, error, actions } = useNotifications();

  // Marcar todas como leídas al abrir el panel
  useEffect(() => {
    if (isOpen && notifications.length > 0) {
      // Marcar como leídas después de un pequeño delay para mejor UX
      const timer = setTimeout(() => {
        actions.markAllAsRead();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, notifications.length, actions]);

  // Debug: Log para verificar el estado
  useEffect(() => {
    console.log('NotificationPanel - isOpen:', isOpen);
    console.log('NotificationPanel - notifications:', notifications);
    console.log('NotificationPanel - loading:', loading);
    console.log('NotificationPanel - error:', error);
  }, [isOpen, notifications, loading, error]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'aprobada':
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pendiente':
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rechazada':
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'aprobada':
      case 'approved':
        return 'text-green-600 dark:text-green-400';
      case 'pendiente':
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'rechazada':
      case 'rejected':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Obtener título del panel según el rol
  const getPanelTitle = () => {
    const userRole = user?.rol || user?.role;
    switch (userRole?.toLowerCase()) {
      case 'administrador':
      case 'admin':
        return 'Gestión de Reservas';
      case 'instructor':
        return 'Notificaciones de Reservas';
      case 'guardia':
        return 'Supervisión de Reservas';
      default:
        return 'Notificaciones de Reservas';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getPanelTitle()}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={actions.refresh}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400">
                No hay notificaciones disponibles
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 10).map((notification, index) => {
                const reserva = notification.data || notification;
                return (
                  <div
                    key={notification.id || reserva._id || index}
                    className={cn(
                      "p-3 rounded-lg border transition-colors cursor-pointer",
                      notification.read 
                        ? "bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600" 
                        : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    )}
                    onClick={() => actions.markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(reserva.estado || reserva.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {notification.title || 'Nueva reserva'}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                            {reserva.userId?.nombre || reserva.instructor?.nombre || 'Usuario desconocido'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                            {reserva.ambienteId?.nombre || reserva.ambiente?.nombre || 'Ambiente no especificado'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(reserva.fecha || reserva.startDate || notification.timestamp)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-xs font-medium px-2 py-1 rounded-full",
                            getStatusColor(reserva.estado || reserva.status),
                            "bg-gray-100 dark:bg-gray-600"
                          )}>
                            {reserva.estado || reserva.status || 'Sin estado'}
                          </span>
                        </div>
                        
                        {reserva.proposito && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                            {reserva.proposito}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
          <button
            onClick={actions.refresh}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            {loading ? 'Actualizando...' : 'Actualizar notificaciones'}
          </button>
          
          {notifications.length > 0 && (
            <button
              onClick={actions.clearAll}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Limpiar todas
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;