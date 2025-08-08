import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { ThemeProvider } from "@/contexts/theme-context";
import { AuthProvider, useAuthContext } from "@/contexts/auth-context";
import { useAutoCompleteReservations } from "@/hooks/useAutoCompleteReservations";
import { useReportGeneration } from "@/hooks/useReportGeneration";
import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
// Cambiar esta importación:
import AmbientesPage from "@/pages/AmbientesPage"; // En lugar de Ambientes
import ReservaPage from "@/pages/ReservaPage";
import VerReservas from "@/routes/ver-reservas";
import Reports from "@/routes/reports";
import Settings from "@/routes/settings";
import Login from "@/routes/login";
import RequireAdmin from "@/routes/RequireAdmin";

function AppRoutes() {
    const { isAuthenticated, isLoading, logout } = useAuthContext();
    
    // Usar el hook de finalización automática de reservas
    useAutoCompleteReservations();
    
    // Usar el hook de generación de informes
    useReportGeneration();

    // Mostrar loading mientras verifica autenticación
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sena mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                {!isAuthenticated ? (
                    <Route path="/*" element={<Login />} />
                ) : (
                    <Route element={<RequireAdmin><Layout onLogout={logout} /></RequireAdmin>}>
                        <Route index element={<DashboardPage />} />
                        <Route path="settings" element={<Settings />} />
                        {/* Cambiar esta línea: */}
                        <Route path="ambientes" element={<AmbientesPage />} />
                        <Route path="reserva" element={<ReservaPage />} />
                        <Route path="ver-reservas" element={<VerReservas />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Route>
                )}
            </Routes>
        </BrowserRouter>
    );
}

function App() {
    return (
        <ThemeProvider storageKey="theme">
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
