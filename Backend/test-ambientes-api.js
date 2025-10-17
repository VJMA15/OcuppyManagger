// Test de la API de ambientes
async function testAmbientesAPI() {
  try {
    // Primero hacer login para obtener el token
    console.log('🔐 Haciendo login...');
    const loginResponse = await fetch('https://ocuppymanagger-api.netlify.app/api/v1/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cc: '1038647805',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      throw new Error(`Error en login: ${loginResponse.status} - ${errorText}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login exitoso, usuario:', loginData.user.nombre);
    
    const token = loginData.token;
    
    // 1. Obtener todos los ambientes
    console.log('\n🏢 Obteniendo lista de ambientes...');
    const ambientesResponse = await fetch('https://ocuppymanagger-api.netlify.app/api/v1/ambientes', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!ambientesResponse.ok) {
      const errorText = await ambientesResponse.text();
      throw new Error(`Error al obtener ambientes: ${ambientesResponse.status} - ${errorText}`);
    }

    const ambientesData = await ambientesResponse.json();
    console.log('✅ Ambientes obtenidos exitosamente');
    console.log('📊 Total de ambientes:', ambientesData.data.length);
    console.log('🏢 Ambientes encontrados:');
    ambientesData.data.forEach(ambiente => {
      console.log(`  - ${ambiente.nombre} (Capacidad: ${ambiente.capacidad}, Tipo: ${ambiente.tipo})`);
    });

    // 2. Crear un ambiente de prueba
    console.log('\n🆕 Probando crear ambiente...');
    const nuevoAmbiente = {
      nombre: 'Ambiente Test',
      tipo: 'Laboratorio',
      capacidad: 25,
      ubicacion: 'Bloque A - Piso 2',
      descripcion: 'Ambiente de prueba para testing',
      equipos: 20,
      servicios: ['proyector', 'aire_acondicionado', 'internet'],
      estado: 'Disponible'
    };

    const createResponse = await fetch('https://ocuppymanagger-api.netlify.app/api/v1/ambientes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nuevoAmbiente)
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Ambiente creado exitosamente:', createData.data.nombre);
      
      const ambienteId = createData.data._id;
      
      // 3. Obtener el ambiente específico
      console.log('\n🔍 Obteniendo ambiente específico...');
      const getAmbienteResponse = await fetch(`https://ocuppymanagger-api.netlify.app/api/v1/ambientes/${ambienteId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (getAmbienteResponse.ok) {
        const getAmbienteData = await getAmbienteResponse.json();
        console.log('✅ Ambiente obtenido:', getAmbienteData.data.nombre);
      }

      // 4. Actualizar el ambiente
      console.log('\n✏️ Actualizando ambiente...');
      const updateData = {
        nombre: 'Ambiente Test Actualizado',
        capacidad: 30,
        descripcion: 'Ambiente de prueba actualizado'
      };

      const updateResponse = await fetch(`https://ocuppymanagger-api.netlify.app/api/v1/ambientes/${ambienteId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (updateResponse.ok) {
        const updateResponseData = await updateResponse.json();
        console.log('✅ Ambiente actualizado:', updateResponseData.data.nombre);
      } else {
        const errorText = await updateResponse.text();
        console.log('❌ Error al actualizar ambiente:', updateResponse.status, '-', errorText);
      }

      // 5. Verificar disponibilidad
      console.log('\n📅 Verificando disponibilidad...');
      const disponibilidadData = {
        ambienteId: ambienteId,
        fechaInicio: new Date().toISOString(),
        fechaFin: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 horas después
      };

      const disponibilidadResponse = await fetch('https://ocuppymanagger-api.netlify.app/api/v1/ambientes/verificar-disponibilidad', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(disponibilidadData)
      });

      if (disponibilidadResponse.ok) {
        const disponibilidadResult = await disponibilidadResponse.json();
        console.log('✅ Verificación de disponibilidad completada:', disponibilidadResult.data ? 'Disponible' : 'No disponible');
      }

      // 6. Eliminar el ambiente de prueba
      console.log('\n🗑️ Eliminando ambiente de prueba...');
      const deleteResponse = await fetch(`https://ocuppymanagger-api.netlify.app/api/v1/ambientes/${ambienteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (deleteResponse.ok) {
        console.log('✅ Ambiente de prueba eliminado exitosamente');
      } else {
        console.log('⚠️ No se pudo eliminar el ambiente de prueba');
      }
    } else {
      const errorText = await createResponse.text();
      console.log('❌ Error al crear ambiente:', createResponse.status, '-', errorText);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAmbientesAPI();