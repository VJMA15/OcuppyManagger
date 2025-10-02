require('dotenv').config();
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: String,
  cc: String,
  email: String,
  password: String,
  role: String,
  activo: Boolean
});

const User = mongoose.model('User', userSchema);

async function activateInstructor() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    
    const result = await User.updateOne(
      { cc: '5087468301' },
      { activo: true }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Cuenta del instructor activada exitosamente');
      console.log('CC: 5087468301');
      console.log('Nombre: Victor Mendez');
      console.log('Estado: ACTIVO');
    } else {
      console.log('❌ No se encontró el usuario o ya estaba activo');
    }
    
    // Verificar el estado actual
    const user = await User.findOne({ cc: '5087468301' });
    console.log('\n📋 Estado actual del instructor:');
    console.log(`Nombre: ${user.nombre}`);
    console.log(`CC: ${user.cc}`);
    console.log(`Email: ${user.email}`);
    console.log(`Rol: ${user.role}`);
    console.log(`Activo: ${user.activo}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

activateInstructor();