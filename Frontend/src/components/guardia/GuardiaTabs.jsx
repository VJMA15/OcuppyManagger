import { useState } from "react";
import { cn } from "@/utils/cn";
import { Monitor, AlertTriangle, Shield, Calendar } from "lucide-react";

const tabs = [
    {
        id: "monitoreo",
        label: "Monitoreo",
        icon: Monitor,
        description: "Vista general de ambientes"
    },
    {
        id: "incidentes",
        label: "Incidentes",
        icon: AlertTriangle,
        description: "Gestión de incidentes"
    },
    {
        id: "accesos",
        label: "Control de Acceso",
        icon: Shield,
        description: "Gestión de accesos"
    },
    {
        id: "reservas",
        label: "Reservas Activas",
        icon: Calendar,
        description: "Reservas del día"
    }
];

export const GuardiaTabs = ({ activeTab, onTabChange }) => {
    return (
        <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200",
                                isActive
                                    ? "border-sena-500 text-sena-600 dark:text-sena-400"
                                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300"
                            )}
                        >
                            <Icon size={18} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};