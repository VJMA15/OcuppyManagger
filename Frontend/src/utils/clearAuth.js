/**
 * Utilidades para limpiar datos de autenticación y datos de prueba
 */

export const clearAuthData = () => {
  // Limpiar datos de autenticación
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Limpiar datos de prueba
  localStorage.removeItem('ambientes');
  localStorage.removeItem('reservas');
  localStorage.removeItem('informes');
  
  // Limpiar datos de configuración local
  localStorage.removeItem('theme');
  localStorage.removeItem('systemName');
  localStorage.removeItem('logoSena');
  
  console.log('🧹 Datos de autenticación y prueba limpiados');
};

export const clearTestData = () => {
  // Limpiar solo datos de prueba
  localStorage.removeItem('ambientes');
  localStorage.removeItem('reservas');
  localStorage.removeItem('informes');
  
  console.log('🧹 Datos de prueba limpiados');
};

export default clearAuthData; 