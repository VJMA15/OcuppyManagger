import { forwardRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Shield, Users, Building2, BarChart3, Settings, Calendar, UserCheck, Database } from "lucide-react";
import logoSena from "@/assets/logo-sena.png";
import { cn } from "@/utils/cn";
import PropTypes from "prop-types";

const adminNavLinks = [
  {
    title: "Panel de Administración",
    links: [
      {
        label: "Dashboard",
        path: "/admin",
        icon: BarChart3
      },
      {
        label: "Gestión de Usuarios",
        path: "/admin/usuarios",
        icon: Users
      },
      {
        label: "Gestión de Ambientes",
        path: "/admin/ambientes",
        icon: Building2
      },
      {
        label: "Reservas",
        path: "/admin/reservas",
        icon: Calendar
      },
      {
        label: "Reportes",
        path: "/admin/reportes",
        icon: BarChart3
      }
    ]
  },
  {
    title: "Sistema",
    links: [
      {
        label: "Configuración",
        path: "/admin/configuracion",
        icon: Settings
      },
      {
        label: "Auditoría",
        path: "/admin/auditoria",
        icon: UserCheck
      },
      {
        label: "Base de Datos",
        path: "/admin/database",
        icon: Database
      }
    ]
  }
];

export const AdminSidebar = forwardRef(({ collapsed }, ref) => {
    const location = useLocation();
    
    return (
        <aside
            ref={ref}
            className={cn(
                "fixed z-[100] flex h-full w-[240px] flex-col overflow-x-hidden border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg transition-all duration-300",
                collapsed ? "md:w-[70px] md:items-center" : "md:w-[240px]",
                collapsed ? "max-md:-left-full" : "max-md:left-0",
            )}
        >
            {/* Header con Logo */}
            <div className={cn(
                "flex items-center p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-red-50 to-white dark:from-red-900/20 dark:to-slate-900",
                collapsed ? "md:justify-center" : "md:justify-start"
            )}>
                <div className={cn(
                    "flex items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30 shadow-md transition-all duration-300",
                    collapsed 
                        ? "w-10 h-10" 
                        : "w-12 h-12"
                )}>
                    <Shield
                        className={cn(
                            "text-red-600 dark:text-red-400 transition-all duration-300",
                            collapsed 
                                ? "w-5 h-5" 
                                : "w-6 h-6"
                        )}
                    />
                </div>
                {!collapsed && (
                    <div className="ml-3 flex-1 min-w-0">
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                            PANEL ADMIN
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            Administración Total
                        </p>
                    </div>
                )}
            </div>

            {/* Navegación */}
            <div className="flex-1 flex flex-col gap-y-1 overflow-y-auto overflow-x-hidden p-3">
                {adminNavLinks.map((navbarLink) => (
                    <nav
                        key={navbarLink.title}
                        className={cn("sidebar-group", collapsed && "md:items-center")}
                    >
                        {!collapsed && (
                            <p className="sidebar-group-title">{navbarLink.title}</p>
                        )}
                        {navbarLink.links.map((link) => {
                            const IconComponent = link.icon;
                            const isActive = location.pathname === link.path;
                            
                            return (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    className={cn(
                                        "sidebar-item",
                                        isActive && "active",
                                        collapsed && "md:justify-center md:px-0"
                                    )}
                                    title={collapsed ? link.label : undefined}
                                >
                                    <IconComponent 
                                        className={cn(
                                            "flex-shrink-0 transition-all duration-200",
                                            collapsed ? "w-5 h-5" : "w-5 h-5"
                                        )} 
                                    />
                                    {!collapsed && (
                                        <span className="truncate font-medium">
                                            {link.label}
                                        </span>
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>
                ))}
            </div>

            {/* Footer */}
            {!collapsed && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3 mb-2">
                        <img
                            src={logoSena}
                            alt="Logo SENA"
                            className="w-6 h-6 rounded-full"
                        />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            SENA CTPGA
                        </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                        © 2024 SENA
                    </div>
                </div>
            )}
        </aside>
    );
});

AdminSidebar.displayName = "AdminSidebar";
AdminSidebar.propTypes = {
    collapsed: PropTypes.bool,
};

export default AdminSidebar;