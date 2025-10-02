const BASE_URL = 'http://localhost:3000';

async function testApiResponse() {
  const { default: fetch } = await import('node-fetch');
  console.log('🧪 PROBANDO RESPUESTA DEL API DE RESERVAS\n');

  try {
    // 1. Login como admin para obtener token
    console.log('🔐 Iniciando sesión como admin...');
    const loginResponse = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@sistema.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Error en login:', loginResponse.status);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('✅ Login exitoso');

    // 2. Obtener reservas
    console.log('\n📋 Obteniendo todas las reservas...');
    const reservasResponse = await fetch(`${BASE_URL}/api/v1/reservas`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (reservasResponse.ok) {
      const reservasData = await reservasResponse.json();
      console.log('\n✅ RESPUESTA COMPLETA DEL API:');
      console.log(JSON.stringify(reservasData, null, 2));
      
      console.log('\n📊 ANÁLISIS DE LA RESPUESTA:');
      console.log(`- Success: ${reservasData.success}`);
      console.log(`- Count: ${reservasData.count}`);
      console.log(`- Data length: ${reservasData.data ? reservasData.data.length : 'N/A'}`);
      
      if (reservasData.data && reservasData.data.length > 0) {
        console.log('\n🔍 PRIMERAS 3 RESERVAS:');
        reservasData.data.slice(0, 3).forEach((reserva, index) => {
          console.log(`\n--- Reserva ${index + 1} ---`);
          console.log(`ID: ${reserva._id}`);
          console.log(`Status: ${reserva.status}`);
          console.log(`UserId: ${reserva.userId}`);
          console.log(`EnvironmentId: ${reserva.environmentId}`);
          console.log(`StartDate: ${reserva.startDate}`);
          console.log(`EndDate: ${reserva.endDate}`);
          console.log(`Purpose: ${reserva.purpose}`);
          console.log(`CreatedAt: ${reserva.createdAt}`);
        });
        
        console.log('\n📈 CONTEO POR ESTADOS EN LA RESPUESTA:');
        const statusCount = {};
        reservasData.data.forEach(reserva => {
          statusCount[reserva.status] = (statusCount[reserva.status] || 0) + 1;
        });
        Object.entries(statusCount).forEach(([status, count]) => {
          console.log(`${status}: ${count}`);
        });
      }
    } else {
      const errorData = await reservasResponse.text();
      console.log(`❌ Error al obtener reservas: ${reservasResponse.status} - ${errorData}`);
    }

  } catch (error) {
    console.error('💥 Error en la prueba:', error);
  }
}

testApiResponse();