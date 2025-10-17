import React, { useState } from 'react';
import { BookOpen, Menu, Sun, Moon, Bell, User } from 'lucide-react';
import { useAuthContext } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import PropTypes from 'prop-types';
import profileImg from '@/assets/profile-image.jpg';
import NotificationPanel from '@/components/notifications/NotificationPanel';
import NotificationBadge from '@/components/notifications/NotificationBadge';

const InstructorHeader = ({ collapsed, setCollapsed }) => {
  const { user } = useAuthContext();
  const { theme, setTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  
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
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          {/* Título eliminado a petición: se quita "Panel de Instructor" del header */}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <User size={16} />
          <span>{user?.nombre || 'Instructor'}</span>
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
          onClick={() => setShowNotifications(true)}
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
        
        {/* Botón de cerrar sesión eliminado: disponible desde Configuración */}
      </div>
      
      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </header>
  );
};

InstructorHeader.propTypes = {
  collapsed: PropTypes.bool,
  setCollapsed: PropTypes.func,
};

export default InstructorHeader;