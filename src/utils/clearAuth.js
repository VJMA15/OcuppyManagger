// Utilidad para limpiar la autenticación
export const clearAuthentication = () => {
  localStorage.removeItem("isAdmin");
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  console.log("🔧 Autenticación limpiada");
};

// Función para verificar si está autenticado
export const isAuthenticated = () => {
  return localStorage.getItem("isAdmin") === "true";
};

// Función para forzar logout
export const forceLogout = () => {
  clearAuthentication();
  window.location.reload();
}; 