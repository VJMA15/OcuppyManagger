const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Usar MONGODB_URI del .env (MongoDB Atlas)
const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URI;

if (!mongoUri) {
  console.error('❌ No se encontró MONGODB_URI o DATABASE_URI en .env');
  process.exit(1);
}

console.log('🔗 Conectando a:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Ocultar credenciales

// Conectar a MongoDB Atlas
mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ Conectado a MongoDB Atlas');
    fixUserPassword();
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB Atlas:', err.message);
    process.exit(1);
  });

async function fixUserPassword() {
  try {
    const cc = '1038647805';
    const newPassword = 'admin123';
    
    // Usar conexión directa a la colección
    const usersCollection = mongoose.connection.db.collection('users');
    
    console.log('🔍 Buscando usuario con CC:', cc);
    
    // Buscar el usuario
    const user = await usersCollection.findOne({ cc: cc });
    
    if (!user) {
      console.log('❌ Usuario no encontrado con CC:', cc);
      console.log('\n🔍 Verificando todos los usuarios en Atlas...');
      const allUsers = await usersCollection.find({}).toArray();
      console.log('Total usuarios en Atlas:', allUsers.length);
      
      if (allUsers.length > 0) {
        console.log('\n📋 Usuarios encontrados:');
        allUsers.forEach((u, index) => {
          console.log(`${index + 1}. CC: ${u.cc}, Nombre: ${u.nombre}, Email: ${u.email}`);
        });
      } else {
        console.log('⚠️  No hay usuarios en la base de datos de Atlas');
      }
      process.exit(1);
    }
    
    console.log('\n👤 Usuario encontrado en Atlas:');
    console.log('   Nombre:', user.nombre);
    console.log('   Email:', user.email);
    console.log('   Rol:', user.role);
    console.log('   ID:', user._id);
    
    // Hashear la nueva contraseña
    console.log('\n🔐 Hasheando nueva contraseña...');
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Actualizar la contraseña en Atlas
    console.log('💾 Actualizando contraseña en Atlas...');
    const result = await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          password: hashedPassword,
          passwordChangedAt: new Date()
        }
      }
    );
    
    if (result.modifiedCount === 1) {
      console.log('\n✅ ¡Contraseña actualizada exitosamente en MongoDB Atlas!');
      console.log('\n🔐 Credenciales para login:');
      console.log('   CC:', cc);
      console.log('   Contraseña:', newPassword);
      
      // Verificar la actualización
      const updatedUser = await usersCollection.findOne({ _id: user._id });
      console.log('\n🔍 Verificación:');
      console.log('   Contraseña hasheada:', updatedUser.password ? '✅ Sí' : '❌ No');
      console.log('   Fecha de cambio:', updatedUser.passwordChangedAt);
      
      console.log('\n🎉 ¡Ahora puedes hacer login en la aplicación!');
    } else {
      console.log('❌ No se pudo actualizar la contraseña en Atlas');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}