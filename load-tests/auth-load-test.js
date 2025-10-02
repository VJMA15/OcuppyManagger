import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métricas personalizadas
export let errorRate = new Rate('errors');

// Configuración de la prueba
export let options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up a 10 usuarios
    { duration: '5m', target: 10 }, // Mantener 10 usuarios
    { duration: '2m', target: 20 }, // Ramp up a 20 usuarios
    { duration: '5m', target: 20 }, // Mantener 20 usuarios
    { duration: '2m', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% de requests < 2s
    http_req_failed: ['rate<0.1'],     // Error rate < 10%
    errors: ['rate<0.1'],              // Error rate personalizado < 10%
  },
};

const BASE_URL = 'http://localhost:5000/api';

// Datos de prueba
const testUsers = [
  { email: 'test1@example.com', password: 'Test123!', nombre: 'Usuario Test 1', cedula: '1234567890' },
  { email: 'test2@example.com', password: 'Test123!', nombre: 'Usuario Test 2', cedula: '1234567891' },
  { email: 'test3@example.com', password: 'Test123!', nombre: 'Usuario Test 3', cedula: '1234567892' },
  { email: 'test4@example.com', password: 'Test123!', nombre: 'Usuario Test 4', cedula: '1234567893' },
  { email: 'test5@example.com', password: 'Test123!', nombre: 'Usuario Test 5', cedula: '1234567894' },
];

export default function () {
  // Seleccionar usuario aleatorio
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  
  // Test 1: Registro de usuario
  testUserRegistration(user);
  sleep(1);
  
  // Test 2: Login de usuario
  const token = testUserLogin(user);
  sleep(1);
  
  if (token) {
    // Test 3: Verificar token
    testTokenVerification(token);
    sleep(1);
    
    // Test 4: Obtener perfil de usuario
    testGetUserProfile(token);
    sleep(1);
  }
  
  sleep(Math.random() * 2 + 1); // Sleep aleatorio entre 1-3 segundos
}

function testUserRegistration(user) {
  const payload = JSON.stringify({
    nombre: user.nombre,
    cedula: user.cedula,
    email: user.email,
    password: user.password
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = http.post(`${BASE_URL}/auth/register`, payload, params);
  
  const success = check(response, {
    'registro: status 201 o 409': (r) => r.status === 201 || r.status === 409,
    'registro: response time < 3000ms': (r) => r.timings.duration < 3000,
    'registro: tiene respuesta JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    },
  });
  
  errorRate.add(!success);
}

function testUserLogin(user) {
  const payload = JSON.stringify({
    email: user.email,
    password: user.password
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = http.post(`${BASE_URL}/auth/login`, payload, params);
  
  const success = check(response, {
    'login: status 200': (r) => r.status === 200,
    'login: response time < 2000ms': (r) => r.timings.duration < 2000,
    'login: tiene token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.token !== undefined;
      } catch {
        return false;
      }
    },
  });
  
  errorRate.add(!success);
  
  if (response.status === 200) {
    try {
      const body = JSON.parse(response.body);
      return body.token;
    } catch {
      return null;
    }
  }
  
  return null;
}

function testTokenVerification(token) {
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  const response = http.get(`${BASE_URL}/auth/verify-token`, params);
  
  const success = check(response, {
    'verify token: status 200': (r) => r.status === 200,
    'verify token: response time < 1000ms': (r) => r.timings.duration < 1000,
    'verify token: válido': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.valid === true;
      } catch {
        return false;
      }
    },
  });
  
  errorRate.add(!success);
}

function testGetUserProfile(token) {
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  const response = http.get(`${BASE_URL}/auth/me`, params);
  
  const success = check(response, {
    'perfil: status 200': (r) => r.status === 200,
    'perfil: response time < 1500ms': (r) => r.timings.duration < 1500,
    'perfil: tiene datos usuario': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.user && body.user.email;
      } catch {
        return false;
      }
    },
  });
  
  errorRate.add(!success);
}

export function handleSummary(data) {
  return {
    'auth-load-test-results.json': JSON.stringify(data, null, 2),
    stdout: `
    ========================================
    RESUMEN DE PRUEBAS DE CARGA - AUTENTICACIÓN
    ========================================
    
    Duración total: ${data.metrics.iteration_duration.avg.toFixed(2)}ms promedio
    Requests totales: ${data.metrics.http_reqs.count}
    Requests fallidos: ${data.metrics.http_req_failed.rate * 100}%
    
    Tiempos de respuesta:
    - Promedio: ${data.metrics.http_req_duration.avg.toFixed(2)}ms
    - P95: ${data.metrics.http_req_duration['p(95)'].toFixed(2)}ms
    - P99: ${data.metrics.http_req_duration['p(99)'].toFixed(2)}ms
    
    Usuarios virtuales:
    - Máximo: ${data.metrics.vus_max.value}
    - Promedio: ${data.metrics.vus.value}
    
    ========================================
    `,
  };
}