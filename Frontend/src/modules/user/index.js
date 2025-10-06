import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth-context";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import UserLayout from "@/routes/UserLayout";

// Páginas del usuario
import AmbientesMainPage from "@/pages/AmbientesMainPage";
import AmbienteDetailPage from "@/pages/AmbienteDetailPage";

const UserContent = () => {
  return (
    <ProtectedRoute>
      <UserLayout>
        <Routes>
          <Route index element={<AmbientesMainPage />} />
          <Route path="ambientes" element={<AmbientesMainPage />} />
          <Route path="ambientes/:id" element={<AmbienteDetailPage />} />
          <Route path="*" element={<Navigate to="/ambientes" replace />} />
        </Routes>
      </UserLayout>
    </ProtectedRoute>
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