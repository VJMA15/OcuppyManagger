const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.DATABASE_URI || 'mongodb://localhost:27017/ocuppy_manager')
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    migrateUsers();
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err);
    process.exit(1);
  });

async function migrateUsers() {
  try {
    const usersCollection = mongoose.connection.db.collection('users');
    const users = await usersCollection.find({}).toArray();
    
    console.log(`🔄 Migrando ${users.length} usuarios...`);
    
    for (const user of users) {
      let needsUpdate = false;
      const updates = {};
      
      // Verificar si la contraseña necesita encriptación
      if (user.password && !user.password.startsWith('$2a$')) {
        console.log(`🔐 Encriptando contraseña para usuario: ${user.cc || user._id}`);
        updates.password = await bcrypt.hash(user.password, 12);
        needsUpdate = true;
      }
      
      // Agregar campos faltantes si es necesario
      if (!user.role) {
        updates.role = 'estudiante';
        needsUpdate = true;
      }
      
      if (!user.activo) {
        updates.activo = true;
        needsUpdate = true;
      }
      
      // Actualizar usuario si es necesario
      if (needsUpdate) {
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: updates }
        );
        console.log(`✅ Usuario actualizado: ${user.cc || user._id}`);
      }
    }
    
    console.log('🎉 Migración completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
}