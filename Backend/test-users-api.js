// Test de la API de usuarios
async function testUsersAPI() {
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
    console.log('📋 Respuesta completa del login:', JSON.stringify(loginData, null, 2));
    
    if (!loginData.success || !loginData.user) {
      throw new Error('Respuesta de login inválida');
    }
    
    console.log('✅ Login exitoso, usuario:', loginData.user.nombre);
    
    const token = loginData.token;
    
    // Ahora probar obtener usuarios
    console.log('👥 Obteniendo lista de usuarios...');
    const usersResponse = await fetch('https://ocuppymanagger-api.netlify.app/api/v1/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!usersResponse.ok) {
      const errorText = await usersResponse.text();
      throw new Error(`Error al obtener usuarios: ${usersResponse.status} - ${errorText}`);
    }

    const usersData = await usersResponse.json();
    console.log('✅ Usuarios obtenidos exitosamente');
    console.log('📊 Total de usuarios:', usersData.data.pagination.totalUsers);
    console.log('👤 Usuarios encontrados:');
    usersData.data.users.forEach(user => {
      console.log(`  - ${user.nombre} (CC: ${user.cc}, Rol: ${user.role})`);
    });

    // Probar crear un usuario de prueba
    console.log('\n🆕 Probando crear usuario...');
    const newUserData = {
      nombre: 'Usuario Test',
      cc: '9999999999',
      email: 'test@example.com',
      password: 'Test123456',
      role: 'instructor'
    };

    const createResponse = await fetch('https://ocuppymanagger-api.netlify.app/api/v1/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newUserData)
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Usuario creado exitosamente:', createData.data.user.nombre);
      
      // Eliminar el usuario de prueba
      const userId = createData.data.user._id;
      console.log('🗑️ Eliminando usuario de prueba...');
      
      const deleteResponse = await fetch(`https://ocuppymanagger-api.netlify.app/api/v1/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (deleteResponse.ok) {
        console.log('✅ Usuario de prueba eliminado exitosamente');
      } else {
        console.log('⚠️ No se pudo eliminar el usuario de prueba');
      }
    } else {
      const errorText = await createResponse.text();
      console.log('❌ Error al crear usuario:', createResponse.status, '-', errorText);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testUsersAPI();