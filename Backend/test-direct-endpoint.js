const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testDirectEndpoint() {
  try {
    console.log('🔍 Probando endpoint directo con token...');
    
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4Y2M1YjFmYzJjNzdhN2IyMTliZGVjYyIsImlhdCI6MTc1OTE3Njk5NiwiZXhwIjoxNzY2OTUyOTk2fQ.Kfoc2medCJp-TDby5ZvHOnbQSdiDVJn1YGwWaizubXA';
    
    console.log('\n1️⃣ Probando /auth/verify-token...');
    const verifyResponse = await fetch('http://localhost:3000/api/v1/auth/verify-token', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const verifyData = await verifyResponse.json();
    console.log('Verify Response:', verifyResponse.status, verifyData);
    
    console.log('\n2️⃣ Probando /reservas/instructor...');
    const reservasResponse = await fetch('http://localhost:3000/api/v1/reservas/instructor', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const reservasData = await reservasResponse.json();
    console.log('Reservas Response:', reservasResponse.status, reservasData);
    
    console.log('\n3️⃣ Probando con cookie...');
    const cookieResponse = await fetch('http://localhost:3000/api/v1/auth/verify-token', {
      method: 'GET',
      headers: {
        'Cookie': `jwt=${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const cookieData = await cookieResponse.json();
    console.log('Cookie Response:', cookieResponse.status, cookieData);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDirectEndpoint();