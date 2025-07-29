import React from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "@/hooks/use-theme";
import PropTypes from "prop-types";

const ActivityChart = ({ data }) => {
    const { theme } = useTheme();

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Actividad del Sistema</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Estadísticas de uso de ambientes
                </p>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorSena" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00995D" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#00995D" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis 
                            dataKey="name" 
                            stroke="#64748b"
                            fontSize={12}
                        />
                        <YAxis 
                            stroke="#64748b"
                            fontSize={12}
                        />
                        <Tooltip 
                            contentStyle={{
                                backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px'
                            }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="total" 
                            stroke="#00995D" 
                            strokeWidth={2}
                            fill="url(#colorSena)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

ActivityChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        total: PropTypes.number.isRequired
    })).isRequired
};

export default ActivityChart; 