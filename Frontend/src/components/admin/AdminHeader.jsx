import { useState } from 'react';
import { Menu, Sun, Moon, Bell, User, LogOut, Shield } from 'lucide-react';
import { useAuthContext } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import PropTypes from 'prop-types';
import profileImg from '@/assets/profile-image.jpg';
import NotificationPanel from '@/components/notifications/NotificationPanel';
import NotificationBadge from '@/components/notifications/NotificationBadge';

const AdminHeader = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuthContext();
  const { theme, setTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      logout();
    }
  };

  return (
    <header className="header-container sticky top-0 z-40 flex h-[60px] items-center justify-between px-6">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          className="btn-ghost size-10"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu size={20} />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              Panel de Administrador
            </h1>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <User size={16} />
          <span>{user?.nombre || 'Administrador'}</span>
        </div>
        
        <button
          className="btn-ghost size-10"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          title={`Cambiar a tema ${theme === "light" ? "oscuro" : "claro"}`}
        >
          <Sun
            size={20}
            className="dark:hidden"
          />
          <Moon
            size={20}
            className="hidden dark:block"
          />
        </button>
        
        <button 
          className="btn-ghost size-10 relative" 
          title="Notificaciones"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <Bell size={20} />
          <NotificationBadge />
        </button>
        
        <button className="size-10 overflow-hidden rounded-full" title="Perfil">
          <img
            src={profileImg}
            alt="profile image"
            className="size-full object-cover"
          />
        </button>
        
        {/* Botón de cerrar sesión */}
        <button 
          className="btn-ghost size-10 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20" 
          onClick={handleLogout}
          title="Cerrar Sesión"
        >
          <LogOut size={20} />
        </button>
      </div>
      
      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </header>
  );
};

AdminHeader.propTypes = {
  collapsed: PropTypes.bool,
  setCollapsed: PropTypes.func,
};

export default AdminHeader;