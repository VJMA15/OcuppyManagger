import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { SharedArray } from 'k6/data';

// Métricas personalizadas
export let errorRate = new Rate('errors');
export let conflictRate = new Rate('conflicts');
export let successRate = new Rate('success');

// Configuración de la prueba - Simula picos de reservas concurrentes
export let options = {
  stages: [
    { duration: '30s', target: 5 },  // Warm up
    { duration: '1m', target: 25 },  // Pico de usuarios concurrentes
    { duration: '2m', target: 25 },  // Mantener pico
    { duration: '30s', target: 0 },  // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95% de requests < 5s
    http_req_failed: ['rate<0.3'],     // Error rate < 30% (esperamos conflictos)
    conflicts: ['rate>0.1'],           // Esperamos al menos 10% de conflictos
    success: ['rate>0.2'],             // Al menos 20% de éxito
  },
};

const BASE_URL = 'http://localhost:5000/api';

// Usuarios de prueba compartidos
const testUsers = new SharedArray('users', function () {
  return [
    { email: 'user1@test.com', password: 'Test123!', nombre: 'Usuario 1', cedula: '1111111111' },
    { email: 'user2@test.com', password: 'Test123!', nombre: 'Usuario 2', cedula: '2222222222' },
    { email: 'user3@test.com', password: 'Test123!', nombre: 'Usuario 3', cedula: '3333333333' },
    { email: 'user4@test.com', password: 'Test123!', nombre: 'Usuario 4', cedula: '4444444444' },
    { email: 'user5@test.com', password: 'Test123!', nombre: 'Usuario 5', cedula: '5555555555' },
    { email: 'user6@test.com', password: 'Test123!', nombre: 'Usuario 6', cedula: '6666666666' },
    { email: 'user7@test.com', password: 'Test123!', nombre: 'Usuario 7', cedula: '7777777777' },
    { email: 'user8@test.com', password: 'Test123!', nombre: 'Usuario 8', cedula: '8888888888' },
  ];
});

// Horarios populares para crear conflictos
const popularTimeSlots = [
  { inicio: '09:00', fin: '10:00' },
  { inicio: '10:00', fin: '11:00' },
  { inicio: '14:00', fin: '15:00' },
  { inicio: '15:00', fin: '16:00' },
];

let availableAmbientes = [];

export function setup() {
  // Obtener lista de ambientes disponibles
  const response = http.get(`${BASE_URL}/ambientes`);
  
  if (response.status === 200) {
    try {
      availableAmbientes = JSON.parse(response.body);
      console.log(`Setup: ${availableAmbientes.length} ambientes disponibles`);
    } catch (e) {
      console.log('Error parsing ambientes:', e);
    }
  }
  
  return { ambientes: availableAmbientes };
}

export default function (data) {
  const user = testUsers[__VU % testUsers.length]; // Distribuir usuarios por VU
  const ambientes = data.ambientes || [];
  
  if (ambientes.length === 0) {
    console.log('No hay ambientes disponibles');
    return;
  }
  
  // Login del usuario
  const token = loginUser(user);
  
  if (!token) {
    console.log(`Login fallido para ${user.email}`);
    return;
  }
  
  // Seleccionar ambiente popular (los primeros son más populares)
  const ambiente = ambientes[Math.floor(Math.random() * Math.min(3, ambientes.length))];
  
  // Seleccionar horario popular
  const timeSlot = popularTimeSlots[Math.floor(Math.random() * popularTimeSlots.length)];
  
  // Fecha para mañana (día popular)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const fecha = tomorrow.toISOString().split('T')[0];
  
  // Intentar crear reserva concurrente
  attemptConcurrentReservation(token, ambiente._id, fecha, timeSlot, user.email);
  
  sleep(1);
}

function loginUser(user) {
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
    'login concurrente: status 200': (r) => r.status === 200,
    'login concurrente: response time < 3000ms': (r) => r.timings.duration < 3000,
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

function attemptConcurrentReservation(token, ambienteId, fecha, timeSlot, userEmail) {
  // Primero verificar disponibilidad
  const availabilityCheck = checkAvailability(ambienteId, fecha, timeSlot);
  
  if (!availabilityCheck) {
    console.log(`${userEmail}: Disponibilidad no verificable`);
    return;
  }
  
  // Pequeña pausa aleatoria para simular tiempo de decisión del usuario
  sleep(Math.random() * 0.5);
  
  // Intentar crear la reserva
  const reservationResult = createReservation(token, ambienteId, fecha, timeSlot, userEmail);
  
  // Registrar métricas según el resultado
  if (reservationResult === 'success') {
    successRate.add(1);
    conflictRate.add(0);
    errorRate.add(0);
    console.log(`${userEmail}: ✅ Reserva exitosa`);
  } else if (reservationResult === 'conflict') {
    successRate.add(0);
    conflictRate.add(1);
    errorRate.add(0);
    console.log(`${userEmail}: ⚠️ Conflicto de horario`);
  } else {
    successRate.add(0);
    conflictRate.add(0);
    errorRate.add(1);
    console.log(`${userEmail}: ❌ Error en reserva`);
  }
}

function checkAvailability(ambienteId, fecha, timeSlot) {
  const payload = JSON.stringify({
    ambienteId: ambienteId,
    fecha: fecha,
    horaInicio: timeSlot.inicio,
    horaFin: timeSlot.fin
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = http.post(`${BASE_URL}/ambientes/verificar-disponibilidad`, payload, params);
  
  const success = check(response, {
    'verificar disponibilidad concurrente: status 200': (r) => r.status === 200,
    'verificar disponibilidad concurrente: response time < 2000ms': (r) => r.timings.duration < 2000,
  });
  
  return success && response.status === 200;
}

function createReservation(token, ambienteId, fecha, timeSlot, userEmail) {
  const payload = JSON.stringify({
    ambienteId: ambienteId,
    fecha: fecha,
    horaInicio: timeSlot.inicio,
    horaFin: timeSlot.fin,
    proposito: `Reserva concurrente de ${userEmail} - ${Date.now()}`
  });

  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  const response = http.post(`${BASE_URL}/reservas`, payload, params);
  
  const checks = check(response, {
    'crear reserva concurrente: response time < 5000ms': (r) => r.timings.duration < 5000,
    'crear reserva concurrente: respuesta válida': (r) => r.status === 201 || r.status === 409 || r.status === 400,
  });
  
  if (response.status === 201) {
    return 'success';
  } else if (response.status === 409) {
    // Conflicto de horario - comportamiento esperado
    return 'conflict';
  } else {
    return 'error';
  }
}

export function handleSummary(data) {
  const totalRequests = data.metrics.http_reqs.count;
  const successfulReservations = data.metrics.success ? data.metrics.success.count : 0;
  const conflicts = data.metrics.conflicts ? data.metrics.conflicts.count : 0;
  const errors = data.metrics.errors ? data.metrics.errors.count : 0;
  
  return {
    'concurrent-reservations-results.json': JSON.stringify(data, null, 2),
    stdout: `
    ========================================
    RESUMEN DE PRUEBAS DE CONCURRENCIA - RESERVAS
    ========================================
    
    Escenario: Múltiples usuarios intentando reservar los mismos horarios
    
    Resultados de Reservas:
    - Reservas exitosas: ${successfulReservations} (${((successfulReservations/totalRequests)*100).toFixed(1)}%)
    - Conflictos de horario: ${conflicts} (${((conflicts/totalRequests)*100).toFixed(1)}%)
    - Errores: ${errors} (${((errors/totalRequests)*100).toFixed(1)}%)
    
    Métricas de Rendimiento:
    - Requests totales: ${totalRequests}
    - Tiempo promedio: ${data.metrics.http_req_duration.avg.toFixed(2)}ms
    - P95: ${data.metrics.http_req_duration['p(95)'].toFixed(2)}ms
    - P99: ${data.metrics.http_req_duration['p(99)'].toFixed(2)}ms
    
    Usuarios Concurrentes:
    - Máximo: ${data.metrics.vus_max.value}
    - Promedio: ${data.metrics.vus.value}
    
    Análisis:
    ${conflicts > 0 ? '✅ Sistema maneja correctamente conflictos de concurrencia' : '⚠️ No se detectaron conflictos - revisar configuración'}
    ${successfulReservations > 0 ? '✅ Algunas reservas fueron exitosas' : '❌ No hubo reservas exitosas'}
    ${data.metrics.http_req_duration['p(95)'] < 5000 ? '✅ Tiempos de respuesta aceptables' : '⚠️ Tiempos de respuesta altos'}
    
    ========================================
    `,
  };
}