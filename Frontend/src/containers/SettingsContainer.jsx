import React from 'react';
import {
  User,
  Palette,
  Bell,
  Shield,
  LogOut,
  Settings as SettingsIcon,
  Eye,
  Clock
} from 'lucide-react';
import { Modal } from '@/components/ui';

const SettingsContainer = ({
  // Theme settings
  theme,
  handleThemeChange,
  
  // User preferences
  notifications,
  handleNotificationsChange,
  
  // Logout
  confirmLogout,
  handleConfirmLogout,
  handleCancelLogout,
  handleLogout,
  
  // User info
  userInfo
}) => {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-sena/10 rounded-xl flex items-center justify-center">
          <SettingsIcon className="w-6 h-6 text-sena" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Configuración</h1>
          <p className="text-slate-600 dark:text-slate-400">Gestiona tus preferencias personales</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Account Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Mi Cuenta</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Información de tu sesión</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{userInfo?.nombre || 'Usuario'}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{userInfo?.email || userInfo?.cc || 'usuario@sena.edu.co'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    Rol: {userInfo?.role || userInfo?.rol || localStorage.getItem('userRole') || 'Usuario'}
                  </p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              
              <button
                onClick={handleConfirmLogout}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg transition-all duration-200 font-medium"
              >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Visual Theme Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Apariencia</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Personaliza el tema visual</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="relative cursor-pointer">
                  <input 
                    type="radio" 
                    name="theme" 
                    value="light" 
                    checked={theme === "light"} 
                    onChange={handleThemeChange}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                    theme === "light" 
                      ? "border-sena bg-sena/5" 
                      : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white border-2 border-slate-200 rounded"></div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Claro</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Tema claro</p>
                      </div>
                    </div>
                  </div>
                </label>
                
                <label className="relative cursor-pointer">
                  <input 
                    type="radio" 
                    name="theme" 
                    value="dark" 
                    checked={theme === "dark"} 
                    onChange={handleThemeChange}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                    theme === "dark" 
                      ? "border-sena bg-sena/5" 
                      : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-800 border-2 border-slate-600 rounded"></div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Oscuro</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Tema oscuro</p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Notifications Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Notificaciones</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Gestiona tus alertas</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Notificaciones de reservas</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Recibe alertas sobre tus reservas</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications?.reservas || false}
                    onChange={(e) => handleNotificationsChange('reservas', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sena/20 dark:peer-focus:ring-sena/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-sena"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Recordatorios</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Recordatorios antes de tus reservas</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications?.recordatorios || false}
                    onChange={(e) => handleNotificationsChange('recordatorios', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sena/20 dark:peer-focus:ring-sena/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-sena"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Privacy & Security Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Privacidad y Seguridad</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Configuraciones de seguridad</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Eye className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <p className="font-medium text-slate-900 dark:text-white">Historial de actividad</p>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Puedes ver tu historial de reservas y actividad en el sistema
                </p>
                <button className="text-sm text-sena hover:text-sena-dark font-medium">
                  Ver historial →
                </button>
              </div>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <p className="font-medium text-slate-900 dark:text-white">Sesión activa</p>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Tu sesión se cerrará automáticamente después de 2 horas de inactividad
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {confirmLogout && (
        <Modal isOpen={confirmLogout} onClose={handleCancelLogout} title="Cerrar Sesión">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">¿Estás seguro de que quieres salir?</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleLogout}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Sí, cerrar sesión
            </button>
            <button 
              onClick={handleCancelLogout}
              className="flex-1 px-4 py-2 bg-slate-300 text-slate-800 rounded-lg hover:bg-slate-400 transition-colors font-medium"
            >
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SettingsContainer;