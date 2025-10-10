// Configuración de la API - CONECTADO AL BACKEND REAL
export const API_CONFIG = {
  // URL para desarrollo con proxy de Vite
  BASE_URL: '',
  
  // URL anterior del backend (puerto 5000 estaba ocupado)
  // BASE_URL: 'http://localhost:5000/api/v1',
  
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/v1/auth/login',
      VERIFY: '/api/v1/auth/verify',
      REGISTER: '/api/v1/auth/register',
      USER_BY_CC: '/api/v1/auth/user-by-cc'
    },
    USERS: {
      PROFILE: '/api/v1/users/profile',
      ALL: '/api/v1/users',
      BY_ID: (id) => `/api/v1/users/${id}`,
    },
    AMBIENTES: {
      ALL: '/api/v1/ambientes',
      BY_ID: (id) => `/api/v1/ambientes/${id}`,
      CREATE: '/api/v1/ambientes',
      UPDATE: (id) => `/api/v1/ambientes/${id}`,
      DELETE: (id) => `/api/v1/ambientes/${id}`,
    },
    RESERVAS: {
      ALL: '/api/v1/reservas',
      BY_ID: (id) => `/api/v1/reservas/${id}`,
      CREATE: '/api/v1/reservas',
      UPDATE: (id) => `/api/v1/reservas/${id}`,
      DELETE: (id) => `/api/v1/reservas/${id}`,
      // Alinear con backend: endpoint es /my-reservations
      MY_RESERVAS: '/api/v1/reservas/my-reservations',
    },
    ENTREGAS: {
      ALL: '/api/v1/entregas',
      BY_ID: (id) => `/api/v1/entregas/${id}`,
      CREATE: '/api/v1/entregas',
      UPDATE: (id) => `/api/v1/entregas/${id}`,
      DELETE: (id) => `/api/v1/entregas/${id}`,
      VERIFICAR: (codigo) => `/api/v1/entregas/verificar/${codigo}`,
      JORNADA: (jornada) => `/api/v1/entregas/jornada/${jornada}`,
      VENCIDAS: '/api/v1/entregas/vencidas',
      ESTADISTICAS: '/api/v1/entregas/estadisticas',
    },
    REGISTROS: {
      ALL: '/api/v1/registros',
      BY_ID: (id) => `/api/v1/registros/${id}`,
      CREATE: '/api/v1/registros',
      UPDATE: (id) => `/api/v1/registros/${id}`,
      DELETE: (id) => `/api/v1/registros/${id}`,
      BY_AMBIENTE: (ambienteId) => `/api/v1/registros/ambiente/${ambienteId}`,
      ENTRADA: '/api/v1/registros/entrada',
      SALIDA: '/api/v1/registros/salida',
    },
    BITACORA: {
      ALL: '/api/v1/bitacora',
      BY_ID: (id) => `/api/v1/bitacora/${id}`,
      CREATE: '/api/v1/bitacora',
      UPDATE: (id) => `/api/v1/bitacora/${id}`,
      DELETE: (id) => `/api/v1/bitacora/${id}`,
    },
  },
  
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  TIMEOUT: 15000, // 15 segundos para evitar abortar peticiones lentas
};

export default API_CONFIG;