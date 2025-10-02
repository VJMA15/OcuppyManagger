async function testInstructorFlow() {
  const fetch = (await import('node-fetch')).default;
  const API_BASE = 'http://localhost:5000/api/v1';
  
  console.log('🔍 Probando flujo de autenticación para INSTRUCTOR...\n');
  
  try {
    // 1. Login como instructor
    console.log('1️⃣ Intentando login como instructor...');
    const loginResponse = await fetch(`${API_BASE}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cc: '5087468301', password: '123456' })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login Response:', loginResponse.status, loginData);
    
    if (!loginResponse.ok) {
      console.log('❌ Error en login');
      return;
    }
    
    // Extraer token de las cookies
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Cookies recibidas:', cookies);
    
    if (!cookies) {
      console.log('❌ No se recibieron cookies');
      return;
    }
    
    // 2. Probar endpoint de reservas del instructor
    console.log('\n2️⃣ Probando endpoint de reservas del instructor...');
    const reservasResponse = await fetch(`${API_BASE}/reservas/my-reservations`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    });
    
    const reservasData = await reservasResponse.json();
    console.log('Reservas Response:', reservasResponse.status, reservasData);
    
    // 3. Probar endpoint de reportes del instructor
    console.log('\n3️⃣ Probando endpoint de reportes del instructor...');
    const reportesResponse = await fetch(`${API_BASE}/reports/instructor/mis-reservas`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    });
    
    const reportesData = await reportesResponse.json();
    console.log('Reportes Response:', reportesResponse.status, reportesData);
    
    // 4. Probar refresh token
    console.log('\n4️⃣ Probando refresh token...');
    const refreshResponse = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    });
    
    const refreshData = await refreshResponse.json();
    console.log('Refresh Response:', refreshResponse.status, refreshData);
    
    // 5. Verificar token actual
    console.log('\n5️⃣ Verificando token actual...');
    const verifyResponse = await fetch(`${API_BASE}/auth/verify-token`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    });
    
    const verifyData = await verifyResponse.json();
    console.log('Verify Token Response:', verifyResponse.status, verifyData);
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testInstructorFlow();