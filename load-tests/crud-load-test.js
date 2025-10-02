import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métricas personalizadas
export let errorRate = new Rate('errors');

// Configuración de la prueba
export let options = {
  stages: [
    { duration: '1m', target: 5 },  // Ramp up a 5 usuarios
    { duration: '3m', target: 5 },  // Mantener 5 usuarios
    { duration: '2m', target: 15 }, // Ramp up a 15 usuarios
    { duration: '5m', target: 15 }, // Mantener 15 usuarios
    { duration: '1m', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% de requests < 3s
    http_req_failed: ['rate<0.15'],    // Error rate < 15%
    errors: ['rate<0.15'],             // Error rate personalizado < 15%
  },
};

const BASE_URL = 'http://localhost:5000/api';

// Datos de prueba para ambientes
const testAmbientes = [
  { nombre: 'Sala de Conferencias A', capacidad: 20, ubicacion: 'Piso 1', descripcion: 'Sala principal' },
  { nombre: 'Sala de Reuniones B', capacidad: 8, ubicacion: 'Piso 2', descripcion: 'Sala pequeña' },
  { nombre: 'Auditorio C', capacidad: 100, ubicacion: 'Planta Baja', descripcion: 'Auditorio principal' },
];

// Usuario admin para pruebas
const adminUser = {
  email: 'admin@ocuppy.com',
  password: 'Admin123!'
};

let adminToken = null;
let createdAmbientes = [];

export function setup() {
  // Login como admin para obtener token
  const loginPayload = JSON.stringify({
    email: adminUser.email,
    password: adminUser.password
  });

  const loginParams = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const loginResponse = http.post(`${BASE_URL}/auth/login`, loginPayload, loginParams);
  
  if (loginResponse.status === 200) {
    const body = JSON.parse(loginResponse.body);
    adminToken = body.token;
    console.log('Admin token obtenido para setup');
  }
  
  return { adminToken };
}

export default function (data) {
  const token = data.adminToken;
  
  if (!token) {
    console.log('No hay token disponible, saltando iteración');
    return;
  }
  
  // Test 1: Listar ambientes (operación de lectura)
  testListAmbientes();
  sleep(1);
  
  // Test 2: Crear ambiente (operación de escritura)
  const ambienteId = testCreateAmbiente(token);
  sleep(1);
  
  if (ambienteId) {
    // Test 3: Obtener ambiente específico
    testGetAmbiente(ambienteId);
    sleep(1);
    
    // Test 4: Verificar disponibilidad
    testCheckAvailability(ambienteId);
    sleep(1);
    
    // Test 5: Crear reserva
    testCreateReserva(token, ambienteId);
    sleep(1);
    
    // Test 6: Listar reservas del usuario
    testListUserReservas(token);
    sleep(1);
  }
  
  sleep(Math.random() * 2 + 1); // Sleep aleatorio entre 1-3 segundos
}

function testListAmbientes() {
  const response = http.get(`${BASE_URL}/ambientes`);
  
  const success = check(response, {
    'listar ambientes: status 200': (r) => r.status === 200,
    'listar ambientes: response time < 2000ms': (r) => r.timings.duration < 2000,
    'listar ambientes: es array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body);
      } catch {
        return false;
      }
    },
  });
  
  errorRate.add(!success);
}

function testCreateAmbiente(token) {
  const ambiente = testAmbientes[Math.floor(Math.random() * testAmbientes.length)];
  const uniqueName = `${ambiente.nombre} ${Date.now()}`;
  
  const payload = JSON.stringify({
    nombre: uniqueName,
    capacidad: ambiente.capacidad,
    ubicacion: ambiente.ubicacion,
    descripcion: ambiente.descripcion
  });

  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  const response = http.post(`${BASE_URL}/ambientes`, payload, params);
  
  const success = check(response, {
    'crear ambiente: status 201': (r) => r.status === 201,
    'crear ambiente: response time < 3000ms': (r) => r.timings.duration < 3000,
    'crear ambiente: tiene ID': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body._id !== undefined;
      } catch {
        return false;
      }
    },
  });
  
  errorRate.add(!success);
  
  if (response.status === 201) {
    try {
      const body = JSON.parse(response.body);
      return body._id;
    } catch {
      return null;
    }
  }
  
  return null;
}

function testGetAmbiente(ambienteId) {
  const response = http.get(`${BASE_URL}/ambientes/${ambienteId}`);
  
  const success = check(response, {
    'obtener ambiente: status 200': (r) => r.status === 200,
    'obtener ambiente: response time < 1500ms': (r) => r.timings.duration < 1500,
    'obtener ambiente: tiene datos': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body._id === ambienteId;
      } catch {
        return false;
      }
    },
  });
  
  errorRate.add(!success);
}

function testCheckAvailability(ambienteId) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const payload = JSON.stringify({
    ambienteId: ambienteId,
    fecha: tomorrow.toISOString().split('T')[0],
    horaInicio: '09:00',
    horaFin: '10:00'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = http.post(`${BASE_URL}/ambientes/verificar-disponibilidad`, payload, params);
  
  const success = check(response, {
    'verificar disponibilidad: status 200': (r) => r.status === 200,
    'verificar disponibilidad: response time < 2000ms': (r) => r.timings.duration < 2000,
    'verificar disponibilidad: tiene resultado': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.disponible !== undefined;
      } catch {
        return false;
      }
    },
  });
  
  errorRate.add(!success);
}

function testCreateReserva(token, ambienteId) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const payload = JSON.stringify({
    ambienteId: ambienteId,
    fecha: tomorrow.toISOString().split('T')[0],
    horaInicio: '14:00',
    horaFin: '15:00',
    proposito: `Reunión de prueba de carga ${Date.now()}`
  });

  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  const response = http.post(`${BASE_URL}/reservas`, payload, params);
  
  const success = check(response, {
    'crear reserva: status 201': (r) => r.status === 201,
    'crear reserva: response time < 3000ms': (r) => r.timings.duration < 3000,
    'crear reserva: tiene ID': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body._id !== undefined;
      } catch {
        return false;
      }
    },
  });
  
  errorRate.add(!success);
}

function testListUserReservas(token) {
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  const response = http.get(`${BASE_URL}/reservas/my-reservations`, params);
  
  const success = check(response, {
    'listar mis reservas: status 200': (r) => r.status === 200,
    'listar mis reservas: response time < 2000ms': (r) => r.timings.duration < 2000,
    'listar mis reservas: es array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body);
      } catch {
        return false;
      }
    },
  });
  
  errorRate.add(!success);
}

export function handleSummary(data) {
  return {
    'crud-load-test-results.json': JSON.stringify(data, null, 2),
    stdout: `
    ========================================
    RESUMEN DE PRUEBAS DE CARGA - OPERACIONES CRUD
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
    
    Operaciones probadas:
    - Listar ambientes
    - Crear ambientes
    - Obtener ambiente específico
    - Verificar disponibilidad
    - Crear reservas
    - Listar reservas del usuario
    
    ========================================
    `,
  };
}