// Configuración de desarrollo
export const DEV_CONFIG = {
  // URL base de la API en desarrollo
  API_URL: 'https://ocuppymanagger-api.netlify.app',
  
  // Configuración de la aplicación
  APP_NAME: 'Occupy Manager',
  APP_VERSION: '1.0.0',
  
  // Configuración de debug
  DEBUG: true,
  LOG_LEVEL: 'debug',
  
  // Configuración de timeouts
  REQUEST_TIMEOUT: 10000,
  
  // Configuración de reintentos
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};

export default DEV_CONFIG;