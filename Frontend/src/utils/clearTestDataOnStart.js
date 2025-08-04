/**
 * Script para limpiar automáticamente datos de prueba al iniciar la aplicación
 * Solo se ejecuta en desarrollo
 */

export const clearTestDataOnStart = () => {
  // Solo ejecutar en desarrollo
  if (import.meta.env.PROD) {
    return;
  }

  // Verificar si es la primera vez que se carga la aplicación
  const hasCleared = sessionStorage.getItem('testDataCleared');
  
  if (!hasCleared) {
    console.log('🧹 Limpiando datos de prueba al iniciar...');
    
    // Limpiar datos de prueba
    localStorage.removeItem('ambientes');
    localStorage.removeItem('reservas');
    localStorage.removeItem('informes');
    
    // Marcar como limpiado para esta sesión
    sessionStorage.setItem('testDataCleared', 'true');
    
    console.log('✅ Datos de prueba limpiados automáticamente');
  }
};

export default clearTestDataOnStart; 