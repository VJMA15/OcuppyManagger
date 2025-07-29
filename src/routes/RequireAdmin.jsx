import React from "react";
import { Navigate } from "react-router-dom";

export default function RequireAdmin({ children }) {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  
  if (!isAdmin) {
    // Redirigir al login si no está autenticado
    return <Navigate to="/" replace />;
  }
  
  return children;
}
