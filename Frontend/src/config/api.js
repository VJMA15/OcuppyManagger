// Configuración de la API - MODO DESARROLLO SIN BACKEND
const API_CONFIG = {
  // Comentar la URL real del backend
  // BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  
  // URL temporal para desarrollo sin backend
  BASE_URL: 'http://localhost:3001/api/v1', // Puerto que no existe
  
  TIMEOUT: 5000, // ✅ REDUCIDO: 5 segundos para respuestas más rápidas
  ENDPOINTS: {
    AUTH: {
      VERIFY: '/auth/verify',
      REGISTER: '/auth/signup',
      USER_BY_CC: (cc) => `/auth/user/${cc}`,
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
  
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  TIMEOUT: 10000,
};

export default API_CONFIG;

// ❌ ELIMINAR: Esta línea duplicada que causa confusión
// export const TIMEOUT = 3000;