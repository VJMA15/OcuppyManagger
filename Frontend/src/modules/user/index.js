import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/shared/contexts/auth-context";
import RequireAuth from "./components/RequireAuth";
import UserLayout from "./layouts/UserLayout";

// Páginas del usuario
import AmbientesMainPage from "./pages/AmbientesMainPage";
import AmbienteDetailPage from "./pages/AmbienteDetailPage";

const UserContent = () => {
  return (
    <RequireAuth>
      <UserLayout>
        <Routes>
          <Route index element={<AmbientesMainPage />} />
          <Route path="ambientes" element={<AmbientesMainPage />} />
          <Route path="ambientes/:id" element={<AmbienteDetailPage />} />
          <Route path="*" element={<Navigate to="/user/ambientes" replace />} />
        </Routes>
      </UserLayout>
    </RequireAuth>
  );
};

const UserModule = () => {
  return (
    <AuthProvider>
      <UserContent />
    </AuthProvider>
  );
};

export default UserModule;