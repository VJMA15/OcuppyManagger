import { forwardRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { BookOpen, Calendar, Plus, Building2, BarChart3 } from "lucide-react";
import logoSena from "@/assets/logo-sena.png";
import { cn } from "@/utils/cn";
import PropTypes from "prop-types";

const instructorNavLinks = [
  {
    title: "Panel de Instructor",
    links: [
      {
        label: "Mis Reservas",
        path: "/instructor/mis-reservas",
        icon: Calendar
      },
      {
        label: "Nueva Reserva",
        path: "/instructor/nueva-reserva",
        icon: Plus
      },
      {
        label: "Ambientes Disponibles",
        path: "/instructor/ambientes",
        icon: Building2
      },
    ]
  }
];

export const InstructorSidebar = forwardRef(({ collapsed }, ref) => {
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
                "flex items-center p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900",
                collapsed ? "md:justify-center" : "md:justify-start"
            )}>
                <div className={cn(
                    "flex items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 shadow-md transition-all duration-300",
                    collapsed 
                        ? "w-10 h-10" 
                        : "w-12 h-12"
                )}>
                    <BookOpen
                        className={cn(
                            "text-blue-600 dark:text-blue-400 transition-all duration-300",
                            collapsed 
                                ? "w-5 h-5" 
                                : "w-6 h-6"
                        )}
                    />
                </div>
                {!collapsed && (
                    <div className="ml-3 flex-1 min-w-0">
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                            PANEL INSTRUCTOR
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            Gestión de Reservas
                        </p>
                    </div>
                )}
            </div>

            {/* Navegación */}
            <div className="flex-1 flex flex-col gap-y-1 overflow-y-auto overflow-x-hidden p-3">
                {instructorNavLinks.map((navbarLink) => (
                    <nav
                        key={navbarLink.title}
                        className={cn("sidebar-group", collapsed && "md:items-center")}
                    >
                        {!collapsed && (
                            <p className="sidebar-group-title">{navbarLink.title}</p>
                        )}
                        {navbarLink.links.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <NavLink
                                    key={link.label}
                                    to={link.path}
                                    className={cn(
                                        "sidebar-item",
                                        isActive && "active",
                                        collapsed && "md:w-12 md:h-12 md:justify-center md:rounded-xl md:mx-auto"
                                    )}
                                    title={collapsed ? link.label : undefined}
                                >
                                    <link.icon
                                        size={collapsed ? 18 : 20}
                                        className="flex-shrink-0"
                                    />
                                    {!collapsed && (
                                        <p className="whitespace-nowrap truncate font-medium">{link.label}</p>
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>
                ))}
            </div>

            {/* Footer del sidebar */}
            {!collapsed && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                        © 2024 SENA - Instructor
                    </div>
                </div>
            )}
        </aside>
    );
});

InstructorSidebar.displayName = "InstructorSidebar";
InstructorSidebar.propTypes = {
    collapsed: PropTypes.bool,
};