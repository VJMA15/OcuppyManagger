import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { ThemeProvider } from "@/contexts/theme-context";
import { AuthProvider, useAuthContext } from "@/contexts/auth-context";
import { useAutoCompleteReservations } from "@/hooks/useAutoCompleteReservations";
import { useReportGeneration } from "@/hooks/useReportGeneration";
import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
import Register from "@/routes/register";
import RequireAdmin from "@/routes/RequireAdmin";

// Importaciones corregidas - solo páginas migradas
import ReservaPage from '@/pages/ReservaPage';
import AmbientesPage from './pages/AmbientesPage';
import VerReservasPage from './pages/VerReservasPage';
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";
import LoginPage from "@/pages/LoginPage";

function AppRoutes() {
    // Eliminar verificación de autenticación
    // const { isAuthenticated, isLoading, logout } = useAuthContext();
    
    return (
        <BrowserRouter>
            <Routes>
                {/* Todas las rutas accesibles sin autenticación */}
                <Route element={<Layout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="ambientes" element={<AmbientesPage />} />
                    <Route path="reserva" element={<ReservaPage />} />
                    <Route path="ver-reservas" element={<VerReservasPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                </Route>
                {/* Mantener login como opción */}
                <Route path="/login" element={<LoginPage />} />
            </Routes>
        </BrowserRouter>
    );
}

function App() {
    return (
        <ThemeProvider storageKey="theme">
            {/* Eliminar AuthProvider si no se usa */}
            <AppRoutes />
        </ThemeProvider>
    );
}

export default App;

