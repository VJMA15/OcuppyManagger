const mongoose = require('mongoose');
const User = require('./src/models/user.model');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.DATABASE_URI || 'mongodb://localhost:27017/ocuppy_manager')
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    createTestUser();
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err);
    process.exit(1);
  });

async function createTestUser() {
  try {
    // Eliminar usuario de prueba si existe
    await User.deleteOne({ cc: '12345678' });
    
    // Crear nuevo usuario de prueba
    const testUser = await User.create({
      nombre: 'Usuario Prueba',
      cc: '12345678',
      email: 'test@test.com',
      password: '123456',
      role: 'admin'
    });
    
    console.log('✅ Usuario de prueba creado:');
    console.log('CC: 12345678');
    console.log('Contraseña: 123456');
    console.log('Role: admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando usuario:', error);
    process.exit(1);
  }
}