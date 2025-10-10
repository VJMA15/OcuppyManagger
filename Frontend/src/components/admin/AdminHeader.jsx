import { useState } from 'react';
import { ChevronsLeft, Sun, Moon, Bell, User, Search } from 'lucide-react';
import { useAuthContext } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import PropTypes from 'prop-types';
import profileImg from '@/assets/profile-image.jpg';
import NotificationPanel from '@/components/notifications/NotificationPanel';
import NotificationBadge from '@/components/notifications/NotificationBadge';

const AdminHeader = ({ collapsed, setCollapsed }) => {
  const { user } = useAuthContext();
  const { theme, setTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
    <header className="relative z-10 flex h-[60px] items-center justify-between bg-white px-4 shadow-md transition-colors dark:bg-slate-900">
        <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-sena">
                {localStorage.getItem('systemName') || 'OCCUPY MANAGER'}
            </span>
        </div>
        <div className="flex items-center gap-x-3">
            <button
                className="btn-ghost size-10"
                onClick={() => setCollapsed(!collapsed)}
            >
                <ChevronsLeft className={collapsed && "rotate-180"} />
            </button>
            <div className="input">
                <Search
                    size={20}
                    className="text-slate-300"
                />
                <input
                    type="text"
                    name="search"
                    id="search"
                    placeholder="Search..."
                    className="w-full bg-transparent text-slate-900 outline-0 placeholder:text-slate-300 dark:text-slate-50"
                />
            </div>
        </div>
        <div className="flex items-center gap-x-3">
            {/* Usuario info */}
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <User size={16} />
                <span>{user?.nombre || 'Admin'}</span>
            </div>
            
            <button
                className="btn-ghost size-10"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
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
                aria-label="Notificaciones"
                title="Notificaciones"
                onClick={() => setShowNotifications(!showNotifications)}
            >
                <Bell size={20} />
                <NotificationBadge />
            </button>
            
            <button className="size-10 overflow-hidden rounded-full">
                <img
                    src={profileImg}
                    alt="profile image"
                    className="size-full object-cover"
                />
            </button>
        </div>
    </header>
    <NotificationPanel 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
    />
    </>
  );
};

AdminHeader.propTypes = {
  collapsed: PropTypes.bool,
  setCollapsed: PropTypes.func,
};

export default AdminHeader;