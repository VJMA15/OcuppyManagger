require('dotenv').config();

const BASE_URL = 'http://localhost:3000/api/v1';

// Token del instructor Victor Mendez (actualizado)
const INSTRUCTOR_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4Y2M1YjFmYzJjNzdhN2IyMTliZGVjYyIsImlhdCI6MTc1OTE4MzcwMiwiZXhwIjoxNzY2OTU5NzAyfQ.hP_8J_1TBATtTDJ3Jjj8wsesegZivB3EGsI7bJaqPXQ';

const headers = {
  'Authorization': `Bearer ${INSTRUCTOR_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testInstructorEndpoints() {
  console.log('🧪 PROBANDO TODOS LOS ENDPOINTS DEL INSTRUCTOR\n');

  const tests = [
    {
      name: '1️⃣ Obtener todas las reservas',
      method: 'GET',
      url: `${BASE_URL}/reservations`
    },
    {
      name: '2️⃣ Obtener mis reservas',
      method: 'GET',
      url: `${BASE_URL}/reservations/my-reservations`
    },
    {
      name: '3️⃣ Obtener estadísticas generales',
      method: 'GET',
      url: `${BASE_URL}/reports/estadisticas`
    },
    {
      name: '4️⃣ Obtener reportes de reservas',
      method: 'GET',
      url: `${BASE_URL}/reports/reservas`
    },
    {
      name: '5️⃣ Obtener reportes de entregas',
      method: 'GET',
      url: `${BASE_URL}/reports/entregas`
    },
    {
      name: '6️⃣ Obtener reportes de uso de ambientes',
      method: 'GET',
      url: `${BASE_URL}/reports/uso-ambientes`
    },
    {
      name: '7️⃣ Obtener mis reservas (reporte)',
      method: 'GET',
      url: `${BASE_URL}/reports/instructor/mis-reservas`
    },
    {
      name: '8️⃣ Obtener mis entregas (reporte)',
      method: 'GET',
      url: `${BASE_URL}/reports/instructor/mis-entregas`
    },
    {
      name: '9️⃣ Obtener todas las entregas',
      method: 'GET',
      url: `${BASE_URL}/entregas`
    },
    {
      name: '🔟 Obtener mis entregas',
      method: 'GET',
      url: `${BASE_URL}/entregas/instructor/mis-entregas`
    }
  ];

  for (const test of tests) {
    try {
      console.log(`${test.name}...`);
      
      const response = await fetch(test.url, {
        method: test.method,
        headers: headers
      });

      if (!response.ok) {
        console.log(`❌ ${test.name}: ${response.status}`);
        const errorText = await response.text();
        console.log(`   Error: ${errorText}`);
        console.log('');
        continue;
      }

      const data = await response.json();

      console.log(`✅ ${test.name}: ${response.status}`);
      if (data) {
        if (data.success !== undefined) {
          console.log(`   Success: ${data.success}`);
        }
        if (data.data && Array.isArray(data.data)) {
          console.log(`   Datos: ${data.data.length} elementos`);
        } else if (data.data) {
          console.log(`   Datos: ${typeof data.data}`);
        }
        if (data.message) {
          console.log(`   Mensaje: ${data.message}`);
        }
      }
      console.log('');
      
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR`);
      console.log(`   Error: ${error.message}`);
      console.log('');
    }
  }

  console.log('🏁 Pruebas completadas');
}

testInstructorEndpoints().catch(console.error);