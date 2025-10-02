import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métricas personalizadas
export let errorRate = new Rate('errors');
export let slowResponseRate = new Rate('slow_responses');

// Configuración de prueba de estrés - Incremento gradual hasta punto de ruptura
export let options = {
  stages: [
    { duration: '2m', target: 10 },   // Warm up
    { duration: '5m', target: 50 },   // Carga normal
    { duration: '5m', target: 100 },  // Carga alta
    { duration: '5m', target: 200 },  // Carga muy alta
    { duration: '5m', target: 300 },  // Punto de ruptura
    { duration: '2m', target: 0 },    // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<10000'], // 95% de requests < 10s (relajado para estrés)
    http_req_failed: ['rate<0.5'],      // Error rate < 50%
    errors: ['rate<0.5'],               // Error rate personalizado < 50%
  },
};

const BASE_URL = 'http://localhost:5000/api';

// Pool de usuarios para distribuir carga
const userPool = [
  { email: 'stress1@test.com', password: 'Test123!' },
  { email: 'stress2@test.com', password: 'Test123!' },
  { email: 'stress3@test.com', password: 'Test123!' },
  { email: 'stress4@test.com', password: 'Test123!' },
  { email: 'stress5@test.com', password: 'Test123!' },
];

export default function () {
  const user = userPool[__VU % userPool.length];
  
  // Simular diferentes patrones de uso bajo estrés
  const scenario = Math.random();
  
  if (scenario < 0.3) {
    // 30% - Operaciones de lectura intensiva
    intensiveReadOperations();
  } else if (scenario < 0.6) {
    // 30% - Operaciones de autenticación
    authenticationStress(user);
  } else if (scenario < 0.8) {
    // 20% - Operaciones CRUD mixtas
    mixedCrudOperations(user);
  } else {
    // 20% - Operaciones de reserva concurrente
    reservationStress(user);
  }
  
  // Sleep mínimo para mantener presión
  sleep(Math.random() * 0.5 + 0.1);
}

function intensiveReadOperations() {
  // Múltiples requests de lectura rápidos
  for (let i = 0; i < 5; i++) {
    const response = http.get(`${BASE_URL}/ambientes`);
    
    const success = check(response, {
      'lectura intensiva: status 200': (r) => r.status === 200,
      'lectura intensiva: response time < 5000ms': (r) => r.timings.duration < 5000,
    });
    
    errorRate.add(!success);
    slowResponseRate.add(response.timings.duration > 2000);
    
    if (i < 4) sleep(0.1); // Pausa mínima entre requests
  }
}

function authenticationStress(user) {
  // Login repetitivo para estresar autenticación
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
    'auth stress: status 200 o 401': (r) => r.status === 200 || r.status === 401,
    'auth stress: response time < 8000ms': (r) => r.timings.duration < 8000,
  });
  
  errorRate.add(!success);
  slowResponseRate.add(response.timings.duration > 3000);
  
  if (response.status === 200) {
    try {
      const body = JSON.parse(response.body);
      const token = body.token;
      
      // Verificar token inmediatamente
      const verifyParams = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      
      const verifyResponse = http.get(`${BASE_URL}/auth/verify-token`, verifyParams);
      
      check(verifyResponse, {
        'verify stress: status 200': (r) => r.status === 200,
        'verify stress: response time < 5000ms': (r) => r.timings.duration < 5000,
      });
    } catch (e) {
      // Error parsing response
    }
  }
}

function mixedCrudOperations(user) {
  // Login primero
  const token = quickLogin(user);
  
  if (!token) return;
  
  // Operaciones CRUD rápidas y consecutivas
  const operations = [
    () => http.get(`${BASE_URL}/ambientes`),
    () => http.get(`${BASE_URL}/reservas/my-reservations`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),
    () => http.get(`${BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),
  ];
  
  // Ejecutar 2-3 operaciones aleatorias
  const numOps = Math.floor(Math.random() * 2) + 2;
  
  for (let i = 0; i < numOps; i++) {
    const operation = operations[Math.floor(Math.random() * operations.length)];
    const response = operation();
    
    const success = check(response, {
      'crud stress: status válido': (r) => r.status >= 200 && r.status < 500,
      'crud stress: response time < 6000ms': (r) => r.timings.duration < 6000,
    });
    
    errorRate.add(!success);
    slowResponseRate.add(response.timings.duration > 2500);
    
    sleep(0.1);
  }
}

function reservationStress(user) {
  const token = quickLogin(user);
  
  if (!token) return;
  
  // Intentar crear múltiples reservas rápidamente
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const fecha = tomorrow.toISOString().split('T')[0];
  
  const timeSlots = [
    { inicio: '08:00', fin: '09:00' },
    { inicio: '11:00', fin: '12:00' },
    { inicio: '16:00', fin: '17:00' },
  ];
  
  for (let i = 0; i < 2; i++) {
    const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
    
    const payload = JSON.stringify({
      ambienteId: '507f1f77bcf86cd799439011', // ID genérico para prueba
      fecha: fecha,
      horaInicio: timeSlot.inicio,
      horaFin: timeSlot.fin,
      proposito: `Reserva stress test ${Date.now()}-${i}`
    });

    const params = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    const response = http.post(`${BASE_URL}/reservas`, payload, params);
    
    const success = check(response, {
      'reserva stress: status válido': (r) => r.status === 201 || r.status === 409 || r.status === 400,
      'reserva stress: response time < 8000ms': (r) => r.timings.duration < 8000,
    });
    
    errorRate.add(!success);
    slowResponseRate.add(response.timings.duration > 4000);
    
    sleep(0.2);
  }
}

function quickLogin(user) {
  const payload = JSON.stringify({
    email: user.email,
    password: user.password
  });

  const response = http.post(`${BASE_URL}/auth/login`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  
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

export function handleSummary(data) {
  const totalRequests = data.metrics.http_reqs.count;
  const failedRequests = data.metrics.http_req_failed.count || 0;
  const slowResponses = data.metrics.slow_responses ? data.metrics.slow_responses.count : 0;
  const maxVUs = data.metrics.vus_max.value;
  
  // Calcular punto de ruptura estimado
  const failureRate = (failedRequests / totalRequests) * 100;
  let breakingPoint = 'No alcanzado';
  
  if (failureRate > 25) {
    breakingPoint = `~${Math.floor(maxVUs * 0.8)} usuarios concurrentes`;
  } else if (failureRate > 10) {
    breakingPoint = `~${Math.floor(maxVUs * 0.9)} usuarios concurrentes`;
  }
  
  return {
    'stress-test-results.json': JSON.stringify(data, null, 2),
    stdout: `
    ========================================
    RESUMEN DE PRUEBAS DE ESTRÉS
    ========================================
    
    Objetivo: Identificar límites del sistema bajo carga extrema
    
    Métricas de Carga:
    - Usuarios concurrentes máximos: ${maxVUs}
    - Requests totales: ${totalRequests}
    - Requests fallidos: ${failedRequests} (${failureRate.toFixed(1)}%)
    - Respuestas lentas (>2s): ${slowResponses} (${((slowResponses/totalRequests)*100).toFixed(1)}%)
    
    Tiempos de Respuesta:
    - Promedio: ${data.metrics.http_req_duration.avg.toFixed(2)}ms
    - P95: ${data.metrics.http_req_duration['p(95)'].toFixed(2)}ms
    - P99: ${data.metrics.http_req_duration['p(99)'].toFixed(2)}ms
    - Máximo: ${data.metrics.http_req_duration.max.toFixed(2)}ms
    
    Análisis de Rendimiento:
    - Punto de ruptura estimado: ${breakingPoint}
    - Degradación gradual: ${failureRate < 50 ? '✅ Sí' : '❌ No'}
    - Recuperación del sistema: ${data.metrics.http_req_duration.avg < 5000 ? '✅ Buena' : '⚠️ Lenta'}
    
    Recomendaciones:
    ${failureRate < 10 ? '✅ Sistema robusto bajo estrés' : '⚠️ Considerar optimizaciones'}
    ${data.metrics.http_req_duration['p(95)'] < 5000 ? '✅ Tiempos aceptables' : '⚠️ Optimizar tiempos de respuesta'}
    ${maxVUs > 200 ? '✅ Soporta alta concurrencia' : '⚠️ Limitaciones de concurrencia'}
    
    ========================================
    `,
  };
}