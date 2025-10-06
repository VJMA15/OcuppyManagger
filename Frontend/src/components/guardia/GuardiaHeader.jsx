import { useState, useEffect } from 'react';
import { Shield, Menu, Sun, Moon, Bell, User, LogOut, Clock } from 'lucide-react';
import { useAuthContext } from '../../contexts/auth-context';
import { useTheme } from '../../contexts/theme-context';
import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';
import NotificationPanel from '../notifications/NotificationPanel';
import NotificationBadge from '../notifications/NotificationBadge';

// Componente para mostrar la hora actual
const CurrentTime = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="hidden md:flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
        <Clock className="w-4 h-4" />
        <span>{formatTime(time)}</span>
      </div>
      <div className="h-4 w-px bg-slate-300 dark:bg-slate-600 mx-2"></div>
      <div className="text-slate-600 dark:text-slate-400">
        {formatDate(time)}
      </div>
    </div>
  );
};

const GuardiaHeader = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuthContext();
  const { theme, setTheme } = useTheme();
  const [notificationCount, setNotificationCount] = useState(3);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      logout();
    }
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side - Logo and menu */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
              "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            )}
            aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 text-white dark:from-blue-700 dark:to-blue-900">
              <Shield className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                Control de Acceso CTPGA
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.rol === 'guardia' ? 'Guardia de Seguridad' : 'Personal Autorizado'}
              </p>
            </div>
          </div>
        </div>

        {/* Right side - User and actions */}
        <div className="flex items-center gap-2">
          {/* Current time and date */}
          <CurrentTime />
          
          {/* Notifications */}
          <div className="relative">
            <button
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              )}
              aria-label="Notificaciones"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
              <NotificationBadge />
            </button>
          </div>
          
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
              "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            )}
            aria-label={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </button>
          
          {/* User profile */}
          <div className="relative">
            <button
              onClick={toggleProfile}
              className={cn(
                "flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-transparent transition-all",
                "hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
              )}
              aria-expanded={isProfileOpen}
              aria-label="Menú de usuario"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
              </div>
            </button>
            
            {/* Dropdown menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-800 dark:ring-white/10" role="menu">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {user?.nombre || 'Usuario'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user?.email || 'usuario@ctpga.edu.co'}
                  </p>
                </div>
                <div className="p-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-md px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                    role="menuitem"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      
      {/* Mobile menu backdrop */}
      {isProfileOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
      
      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </header>
  );
};

GuardiaHeader.propTypes = {
  collapsed: PropTypes.bool,
  setCollapsed: PropTypes.func,
};

export default GuardiaHeader;