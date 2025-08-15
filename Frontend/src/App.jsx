import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import { AuthProvider, useAuthContext } from "@/contexts/auth-context";
import { useAutoCompleteReservations } from "@/hooks/useAutoCompleteReservations";
import { useReportGeneration } from "@/hooks/useReportGeneration";

// Importar páginas
import LandingPage from "@/pages/LandingPage";
import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
import RequireAdmin from "@/routes/RequireAdmin";
import ReservaPage from '@/pages/ReservaPage';
import AmbientesPage from './pages/AmbientesPage';
import VerReservasPage from './pages/VerReservasPage';
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";
import LoginPage from "@/pages/LoginPage";

// Nuevo componente para usuarios no admin
import UserLayout from "@/routes/UserLayout";
import AmbientesMainPage from "@/pages/AmbientesMainPage";
import AmbienteDetailPage from "@/pages/AmbienteDetailPage";

// Importar las nuevas páginas
import InstructorAmbientesPage from "@/pages/InstructorAmbientesPage";
import { GuardiaAmbientesPage } from "@/pages/guardia";

function AppContent() {
  const { isAuthenticated, user } = useAuthContext();
  const location = useLocation();
  
  // Hooks para funcionalidades automáticas
  useAutoCompleteReservations();
  useReportGeneration();

  // Verificar roles
  const isAdmin = user?.role === 'admin';
  const isInstructor = user?.role === 'instructor';
  const isGuardia = user?.role === 'guardia';
  
  // Verificar si es modo guest
  const isGuestMode = location.search.includes('mode=guest');
  
  return (
    <Routes>
      {/* Ruta pública - Landing Page */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Ruta de login actualizada */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            <Navigate to={
              isAdmin ? "/dashboard" : 
              isInstructor ? "/instructor/ambientes" :
              isGuardia ? "/guardia/ambientes" :
              "/ambientes"
            } replace />
          ) : (
            <LoginPage />
          )
        } 
      />
      
      {/* Rutas para ADMIN - Corregidas */}
      {/* ✅ SOLUCIÓN: Rutas anidadas con Layout como padre */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated && isAdmin ? (
            <RequireAdmin>
              <Layout />
            </RequireAdmin>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        {/* Rutas hijas que se renderizan en <Outlet /> */}
        <Route index element={<DashboardPage />} />
        <Route path="reserva" element={<ReservaPage />} />
        <Route path="ver-reservas" element={<VerReservasPage />} />
        <Route path="ambientes" element={<AmbientesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      
      {/* Rutas para INSTRUCTORES */}
      <Route
        path="/instructor/ambientes"
        element={
          isAuthenticated && isInstructor ? (
            <InstructorAmbientesPage />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      
      {/* Rutas para GUARDIAS - Expandidas */}
      <Route path="/guardia/*" element={
        isAuthenticated && isGuardia ? (
          <Routes>
            <Route index element={<Navigate to="ambientes" replace />} />
            <Route path="ambientes" element={<GuardiaAmbientesPage />} />
            {/* TODO: Implementar estas páginas */}
            {/* <Route path="monitoreo" element={<MonitoreoPage />} /> */}
            {/* <Route path="incidentes" element={<IncidentesPage />} /> */}
            {/* <Route path="accesos" element={<AccesosPage />} /> */}
            {/* <Route path="settings" element={<SettingsPage />} /> */}
          </Routes>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      
      {/* Rutas para USUARIOS NORMALES y GUEST */}
      <Route
        path="/ambientes/*"
        element={
          isAuthenticated && !isAdmin && !isInstructor && !isGuardia ? (
            <UserLayout>
              <Routes>
                <Route index element={<AmbientesMainPage />} />
                <Route path=":id" element={<AmbienteDetailPage />} />
              </Routes>
            </UserLayout>
          ) : isAuthenticated ? (
            <Navigate to={
              isAdmin ? "/dashboard" :
              isInstructor ? "/instructor/ambientes" :
              isGuardia ? "/guardia/ambientes" :
              "/ambientes"
            } replace />
          ) : isGuestMode ? (
            // Permitir acceso guest sin autenticación
            <Routes>
              <Route index element={<AmbientesMainPage />} />
            </Routes>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      
      {/* Redirección por defecto */}
      <Route 
        path="*" 
        element={
          isAuthenticated ? (
            <Navigate to={
              isAdmin ? "/dashboard" :
              isInstructor ? "/instructor/ambientes" :
              isGuardia ? "/guardia/ambientes" :
              "/ambientes"
            } replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;