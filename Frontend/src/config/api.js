const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  
  ENDPOINTS: {
    AUTH: {
      VERIFY: '/auth/verify',  // Nuevo endpoint
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
  
  TIMEOUT: 30000, // Aumentado a 30 segundos
};

export default API_CONFIG;