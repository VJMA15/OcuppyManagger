// Configuración de la API
const API_CONFIG = {
  // URL base de la API
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  
  // Endpoints específicos
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
    },
    USERS: {
      PROFILE: '/users/profile',
      ALL: '/users',
      BY_ID: (id) => `/users/${id}`,
    },
    AMBIENTES: {
      ALL: '/ambientes',
      BY_ID: (id) => `/ambientes/${id}`,
      CREATE: '/ambientes',
      UPDATE: (id) => `/ambientes/${id}`,
      DELETE: (id) => `/ambientes/${id}`,
    },
    RESERVAS: {
      ALL: '/reservas',
      BY_ID: (id) => `/reservas/${id}`,
      CREATE: '/reservas',
      UPDATE: (id) => `/reservas/${id}`,
      DELETE: (id) => `/reservas/${id}`,
      MY_RESERVAS: '/reservas/my-reservas',
    },
    REGISTROS: {
      ALL: '/registros',
      BY_ID: (id) => `/registros/${id}`,
      CREATE: '/registros',
    },
    BITACORA: {
      ALL: '/bitacora',
      BY_ID: (id) => `/bitacora/${id}`,
    },
  },
  
  // Configuración de headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Timeout para las peticiones (en ms)
  TIMEOUT: 10000,
};

export default API_CONFIG; 