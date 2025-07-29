import { forwardRef } from "react";
import { NavLink } from "react-router-dom";

import { navbarLinks } from "@/constants";

import logoSena from "@/assets/logo-sena.png";

import { cn } from "@/utils/cn";

import PropTypes from "prop-types";

export const Sidebar = forwardRef(({ collapsed }, ref) => {
    return (
        <aside
            ref={ref}
            className={cn(
                "fixed z-[100] flex h-full w-[240px] flex-col overflow-x-hidden border-r border-slate-300 bg-white [transition:_width_300ms_cubic-bezier(0.4,_0,_0.2,_1),_left_300ms_cubic-bezier(0.4,_0,_0.2,_1),_background-color_150ms_cubic-bezier(0.4,_0,_0.2,_1),_border_150ms_cubic-bezier(0.4,_0,_0.2,_1)] dark:border-slate-700 dark:bg-slate-900",
                collapsed ? "md:w-[70px] md:items-center" : "md:w-[240px]",
                collapsed ? "max-md:-left-full" : "max-md:left-0",
            )}
        >
            {/* Header con Logo */}
            <div className={cn(
                "flex items-center p-4 border-b border-slate-200 dark:border-slate-700",
                collapsed ? "md:justify-center" : "md:justify-start"
            )}>
                <div className={cn(
                    "flex items-center justify-center rounded-full bg-white border-2 border-sena shadow-sm transition-all duration-300",
                    collapsed 
                        ? "w-12 h-12 md:w-10 md:h-10" 
                        : "w-16 h-16 md:w-14 md:h-14"
                )}>
                    <img
                        src={localStorage.getItem('logoSena') || logoSena}
                        alt="Logo SENA"
                        className={cn(
                            "object-contain transition-all duration-300",
                            collapsed 
                                ? "w-8 h-8 md:w-6 md:h-6" 
                                : "w-12 h-12 md:w-10 md:h-10"
                        )}
                    />
                </div>
                {!collapsed && (
                    <div className="ml-3 flex-1 min-w-0">
                        <h1 className="text-lg font-bold text-sena truncate">
                    {localStorage.getItem('systemName') || 'OCCUPY MANAGER'}
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            Sistema de Gestión
                  </p>
                    </div>
                )}
            </div>

            {/* Navegación */}
            <div className="flex-1 flex flex-col gap-y-2 overflow-y-auto overflow-x-hidden p-3 [scrollbar-width:_thin]">
                {navbarLinks.map((navbarLink) => (
                    <nav
                        key={navbarLink.title}
                        className={cn("sidebar-group", collapsed && "md:items-center")}
                    >
                        {!collapsed && (
                            <p className="sidebar-group-title">{navbarLink.title}</p>
                        )}
                        {navbarLink.links.map((link) => (
                            <NavLink
                                key={link.label}
                                to={link.path}
                                className={cn(
                                    "sidebar-item",
                                    collapsed && "md:w-10 md:h-10 md:justify-center md:rounded-lg"
                                )}
                                title={collapsed ? link.label : undefined}
                            >
                                <link.icon
                                    size={collapsed ? 20 : 22}
                                    className="flex-shrink-0"
                                />
                                {!collapsed && (
                                    <p className="whitespace-nowrap truncate">{link.label}</p>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                ))}
            </div>


        </aside>
    );
});

Sidebar.displayName = "Sidebar";

Sidebar.propTypes = {
    collapsed: PropTypes.bool,
};
