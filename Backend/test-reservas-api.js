const BASE_URL = 'https://ocuppymanagger-api.netlify.app';

async function testReservasAPI() {
  console.log('🔐 Haciendo login...');
  
  // 1. Login para obtener token (usando verify con CC)
  const loginResponse = await fetch(`${BASE_URL}/api/v1/auth/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cc: '1038647805',
      password: 'admin123'
    })
  });

  const loginData = await loginResponse.json();
  
  if (!loginData.success || !loginData.token || !loginData.user) {
    console.log('❌ Respuesta de login inválida');
    console.log('Respuesta completa:', JSON.stringify(loginData, null, 2));
    return;
  }

  const token = loginData.token;
  const userId = loginData.user.id; // Cambio de _id a id
  console.log(`✅ Login exitoso, usuario: ${loginData.user.nombre}`);

  // 2. Obtener lista de reservas
  console.log('\n📋 Obteniendo lista de reservas...');
  const reservasResponse = await fetch(`${BASE_URL}/api/v1/reservas`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (reservasResponse.ok) {
    const reservasData = await reservasResponse.json();
    console.log('✅ Reservas obtenidas exitosamente');
    console.log(`📊 Total de reservas: ${reservasData.data ? reservasData.data.length : 0}`);
    
    if (reservasData.data && reservasData.data.length > 0) {
      console.log('📋 Reservas encontradas:');
      reservasData.data.slice(0, 3).forEach(reserva => {
        console.log(`  - ${reserva.purpose || 'Sin propósito'} (Estado: ${reserva.status}, Fecha: ${new Date(reserva.startDate).toLocaleDateString()})`);
      });
    }
  } else {
    const errorData = await reservasResponse.text();
    console.log(`❌ Error al obtener reservas: ${reservasResponse.status} - ${errorData}`);
  }

  // 3. Obtener lista de ambientes para crear reserva
  console.log('\n🏢 Obteniendo ambientes disponibles...');
  const ambientesResponse = await fetch(`${BASE_URL}/api/v1/ambientes`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  let ambienteId = null;
  if (ambientesResponse.ok) {
    const ambientesData = await ambientesResponse.json();
    if (ambientesData.data && ambientesData.data.length > 0) {
      ambienteId = ambientesData.data[0]._id;
      console.log(`✅ Ambiente seleccionado: ${ambientesData.data[0].nombre}`);
    }
  }

  if (!ambienteId) {
    console.log('❌ No se pudo obtener un ambiente para la prueba');
    return;
  }

  // 4. Crear nueva reserva
  console.log('\n🆕 Probando crear reserva...');
  const fechaInicio = new Date();
  fechaInicio.setDate(fechaInicio.getDate() + 1); // Mañana
  fechaInicio.setHours(10, 0, 0, 0);
  
  const fechaFin = new Date(fechaInicio);
  fechaFin.setHours(12, 0, 0, 0);

  const nuevaReserva = {
    environmentId: ambienteId,
    startDate: fechaInicio.toISOString(),
    endDate: fechaFin.toISOString(),
    purpose: 'Reserva de prueba API',
    equipment: [
      {
        type: 'PROJECTOR',
        quantity: 1
      }
    ]
  };

  const createResponse = await fetch(`${BASE_URL}/api/v1/reservas`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(nuevaReserva)
  });

  let reservaId = null;
  if (createResponse.ok) {
    const createData = await createResponse.json();
    reservaId = createData.data._id;
    console.log(`✅ Reserva creada exitosamente: ${createData.data.purpose}`);
  } else {
    const errorData = await createResponse.text();
    console.log(`❌ Error al crear reserva: ${createResponse.status} - ${errorData}`);
    return;
  }

  // 5. Obtener mis reservas
  console.log('\n👤 Obteniendo mis reservas...');
  console.log(`🔍 Buscando reservas para userId: ${userId}`);
  const misReservasResponse = await fetch(`${BASE_URL}/api/v1/reservas/my-reservations?userId=${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (misReservasResponse.ok) {
    const misReservasData = await misReservasResponse.json();
    console.log(`✅ Mis reservas obtenidas: ${misReservasData.data ? misReservasData.data.length : 0} reservas`);
  } else {
    const errorData = await misReservasResponse.text();
    console.log(`❌ Error al obtener mis reservas: ${misReservasResponse.status} - ${errorData}`);
  }

  // 6. Aprobar reserva (solo admin)
  console.log('\n✅ Probando aprobar reserva...');
  const approveResponse = await fetch(`${BASE_URL}/api/v1/reservas/${reservaId}/approve`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      approvedBy: userId
    })
  });

  if (approveResponse.ok) {
    const approveData = await approveResponse.json();
    console.log('✅ Reserva aprobada exitosamente');
  } else {
    const errorData = await approveResponse.text();
    console.log(`❌ Error al aprobar reserva: ${approveResponse.status} - ${errorData}`);
  }

  // 7. Verificar disponibilidad de ambiente
  console.log('\n📅 Verificando disponibilidad...');
  const availabilityResponse = await fetch(`${BASE_URL}/api/v1/ambientes/verificar-disponibilidad`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ambienteId: ambienteId,
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: fechaFin.toISOString()
    })
  });

  if (availabilityResponse.ok) {
    const availabilityData = await availabilityResponse.json();
    console.log(`✅ Verificación de disponibilidad completada: ${availabilityData.disponible ? 'Disponible' : 'No disponible'}`);
  } else {
    const errorData = await availabilityResponse.text();
    console.log(`❌ Error al verificar disponibilidad: ${availabilityResponse.status} - ${errorData}`);
  }

  console.log('\n🎉 Pruebas de API de reservas completadas');
}

// Ejecutar las pruebas
testReservasAPI().catch(console.error);