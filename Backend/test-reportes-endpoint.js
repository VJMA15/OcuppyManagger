// Usar fetch nativo de Node.js (disponible desde Node 18+)

// Función para hacer login y obtener token
async function loginAndTestReportes() {
  try {
    console.log('🔐 Intentando hacer login...');
    
    // Hacer login
    const loginResponse = await fetch('http://localhost:5000/api/v1/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cc: '12345678',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.error('❌ Error en login:', loginData);
      return;
    }
    
    console.log('✅ Login exitoso');
    console.log('Token:', loginData.token);
    
    // Probar endpoint de reportes
    console.log('\n📊 Probando endpoint de reportes...');
    
    const reportesResponse = await fetch('http://localhost:5000/api/v1/reportes/estadisticas', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const reportesData = await reportesResponse.json();
    
    if (!reportesResponse.ok) {
      console.error('❌ Error en reportes:', reportesData);
      return;
    }
    
    console.log('✅ Endpoint de reportes funciona correctamente');
    console.log('Datos:', JSON.stringify(reportesData, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar la prueba
loginAndTestReportes();