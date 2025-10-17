import { useState } from "react";
import { useTheme } from "../hooks/use-theme";

import { Bell, ChevronsLeft, Moon, Search, Sun, User } from "lucide-react";
import { useAuthContext } from "../contexts/auth-context";

import profileImg from "../assets/profile-image.jpg";
import NotificationPanel from "../components/notifications/NotificationPanel";
import NotificationBadge from "../components/notifications/NotificationBadge";

import PropTypes from "prop-types";

export const Header = ({ collapsed, setCollapsed }) => {
    const { theme, setTheme } = useTheme();
    const { user } = useAuthContext();
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <>
        <header className="relative z-10 flex h-[60px] items-center justify-between bg-white px-6 shadow-md transition-colors dark:bg-slate-900">
            <div className="flex items-center gap-x-3">
                <button
                    className="btn-ghost size-10"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <ChevronsLeft className={collapsed && "rotate-180"} />
                </button>
                
            </div>
            <div className="flex items-center justify-end gap-x-4 md:gap-x-5 md:flex-1">
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

Header.propTypes = {
    collapsed: PropTypes.bool,
    setCollapsed: PropTypes.func,
};
