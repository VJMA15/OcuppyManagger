import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RequireAdmin from "@/routes/RequireAdmin";
import AdminLayout from "@/layouts/AdminLayout";
import { ReservasProvider } from "@/contexts/ReservasContext";

// Páginas del admin - usando las páginas existentes
import DashboardPage from "@/routes/dashboard/page";
import ReservaPage from "@/pages/ReservaPage";
import VerReservasPage from "@/pages/VerReservasPage";
import AmbientesPage from "@/pages/AmbientesPage";
import ReportesPage from "@/pages/admin/ReportesPage";
import SettingsPage from "@/pages/SettingsPage";
import RegistrarUsuarioPage from "@/pages/RegistrarUsuarioPage";
import GestionUsuariosPage from "@/pages/GestionUsuariosPage";
import MisReservasPage from "@/pages/MisReservasPage";
import RegistrosPage from "@/pages/RegistrosPage";
import BitacoraPage from "@/pages/BitacoraPage";

// Hooks específicos del admin
import { useAutoCompleteReservations } from "@/hooks/useAutoCompleteReservations";
import { useReportGeneration } from "@/hooks/useReportGeneration";

const AdminContent = () => {
  // Solo cargar hooks del admin cuando esté en el módulo admin
  useAutoCompleteReservations();
  useReportGeneration();

  return (
    <RequireAdmin>
      <ReservasProvider>
        <AdminLayout>
          <Routes>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="reserva" element={<ReservaPage />} />
            <Route path="ver-reservas" element={<VerReservasPage />} />
            <Route path="mis-reservas" element={<MisReservasPage />} />
            <Route path="ambientes" element={<AmbientesPage />} />
            <Route path="reportes" element={<ReportesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="registrar-usuario" element={<RegistrarUsuarioPage />} />
            <Route path="gestion-usuarios" element={<GestionUsuariosPage />} />
            <Route path="registros" element={<RegistrosPage />} />
            <Route path="bitacora" element={<BitacoraPage />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </AdminLayout>
      </ReservasProvider>
    </RequireAdmin>
  );
};

const AdminModule = () => {
  return (
    <AdminContent />
  );
};

export default AdminModule;