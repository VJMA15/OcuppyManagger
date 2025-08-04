const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.DATABASE_URI || 'mongodb://localhost:27017/ocuppy_manager')
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    checkUsers();
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err);
    process.exit(1);
  });

async function checkUsers() {
  try {
    // Obtener todos los usuarios sin usar el modelo (para ver estructura real)
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    
    console.log('\n📊 Usuarios encontrados:', users.length);
    
    if (users.length > 0) {
      console.log('\n🔍 Estructura del primer usuario:');
      console.log(JSON.stringify(users[0], null, 2));
      
      console.log('\n📋 Campos disponibles en todos los usuarios:');
      const allFields = new Set();
      users.forEach(user => {
        Object.keys(user).forEach(field => allFields.add(field));
      });
      console.log(Array.from(allFields));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}