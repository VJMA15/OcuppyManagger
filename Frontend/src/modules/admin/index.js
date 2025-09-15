import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/shared/contexts/auth-context";
import RequireAdmin from "./components/RequireAdmin";
import AdminLayout from "./layouts/AdminLayout";

// Páginas del admin
import DashboardPage from "./pages/DashboardPage";
import ReservaPage from "./pages/ReservaPage";
import VerReservasPage from "./pages/VerReservasPage";
import AmbientesPage from "./pages/AmbientesPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import RegistrarUsuarioPage from "@/pages/RegistrarUsuarioPage";

// Hooks específicos del admin
import { useAutoCompleteReservations } from "./hooks/useAutoCompleteReservations";
import { useReportGeneration } from "./hooks/useReportGeneration";

const AdminContent = () => {
  // Solo cargar hooks del admin cuando esté en el módulo admin
  useAutoCompleteReservations();
  useReportGeneration();

  return (
    <RequireAdmin>
      <AdminLayout>
        <Routes>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="reserva" element={<ReservaPage />} />
          <Route path="ver-reservas" element={<VerReservasPage />} />
          <Route path="ambientes" element={<AmbientesPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="registrar-usuario" element={<RegistrarUsuarioPage />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </AdminLayout>
    </RequireAdmin>
  );
};

const AdminModule = () => {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  );
};

export default AdminModule;