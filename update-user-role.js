const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  nombre: String,
  cc: String,
  email: String,
  password: String,
  role: { type: String, default: 'user' },
  passwordChangedAt: Date
});

const User = mongoose.model('User', userSchema);

async function updateUserRole() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB Atlas');
    
    // Primero verificar el usuario actual
    const currentUser = await User.findOne({ cc: '1038647805' });
    
    if (currentUser) {
      console.log('Usuario encontrado:');
      console.log('- Nombre:', currentUser.nombre);
      console.log('- CC:', currentUser.cc);
      console.log('- Rol actual:', currentUser.role);
      
      // Actualizar a admin
      const result = await User.updateOne(
        { cc: '1038647805' },
        { role: 'admin' }
      );
      
      if (result.modifiedCount > 0) {
        console.log('✅ Rol actualizado a admin exitosamente');
        
        // Verificar el cambio
        const updatedUser = await User.findOne({ cc: '1038647805' });
        console.log('✅ Nuevo rol:', updatedUser.role);
      } else {
        console.log('❌ No se pudo actualizar el rol');
      }
    } else {
      console.log('❌ Usuario no encontrado con CC: 1038647805');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateUserRole();