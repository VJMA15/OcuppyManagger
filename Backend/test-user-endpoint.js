// Token del instructor obtenido de la autenticación
const INSTRUCTOR_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4Y2M1YjFmYzJjNzdhN2IyMTliZGVjYyIsImlhdCI6MTc1OTE4NDA3MCwiZXhwIjoxNzY2OTYwMDcwfQ.t8f6S9zX35cB48hX_g-TFy6RQrwnuEkNT6dEETY9eww';
const BASE_URL = 'http://localhost:8080';

// ID del instructor para probar
const INSTRUCTOR_ID = '68cc5b1fc2c77a7b219bdecc';

async function testGetUserById() {
  console.log('🧪 Probando endpoint getUserById...\n');

  try {
    console.log('1️⃣ Probando obtener usuario por ID...');
    const response = await fetch(`${BASE_URL}/api/v1/users/${INSTRUCTOR_ID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${INSTRUCTOR_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Endpoint getUserById funciona correctamente');
    } else {
      console.log('❌ Error en endpoint getUserById:', data.message || data.error);
    }

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }

  console.log('\n2️⃣ Probando obtener todos los usuarios...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/v1/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${INSTRUCTOR_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Endpoint getAllUsers funciona correctamente');
    } else {
      console.log('❌ Error en endpoint getAllUsers:', data.message || data.error);
    }

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testGetUserById();