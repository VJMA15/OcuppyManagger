// Test de login simple
async function testLogin() {
  try {
    console.log('🔐 Probando login con credenciales de prueba...');
    
    const response = await fetch('http://localhost:5000/api/v1/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cc: '1038647805',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Login exitoso!');
      console.log('Usuario:', data.user.nombre);
      console.log('Rol:', data.user.role);
      console.log('Token generado:', data.token ? 'Sí' : 'No');
      console.log('Token:', data.token.substring(0, 50) + '...');
    } else {
      console.log('❌ Error en login:', data);
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
  }
}

testLogin();