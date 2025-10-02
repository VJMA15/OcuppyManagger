require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nombre: String,
  cc: String,
  email: String,
  password: String,
  role: String,
  activo: Boolean
});

const User = mongoose.model('User', userSchema);

async function updateInstructorPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    const result = await User.updateOne(
      { cc: '5087468301' },
      { password: hashedPassword }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Contraseña del instructor actualizada exitosamente');
      console.log('CC: 5087468301');
      console.log('Nueva contraseña: 123456');
    } else {
      console.log('❌ No se encontró el usuario o no se pudo actualizar');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

updateInstructorPassword();