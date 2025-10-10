import React from "react";

const DashboardHeader = () => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Panel de Control
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Gestión integral de ambientes y reservas
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Sistema Activo</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader; 