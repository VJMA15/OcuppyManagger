import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth-context";
import LoginPage from "@/pages/LoginPage";
import { useAuthContext } from "@/contexts/auth-context";

const AuthRoutes = () => {
  const { isAuthenticated, user } = useAuthContext();
  
  if (isAuthenticated) {
    const isAdmin = user?.role === 'admin' || user?.rol === 'admin';
    return <Navigate to={isAdmin ? "/dashboard" : "/ambientes"} replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const AuthModule = () => {
  return (
    <AuthProvider>
      <AuthRoutes />
    </AuthProvider>
  );
};

export default AuthModule;