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

async function checkUserRole() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB Atlas');
    
    const user = await User.findOne({ cc: '1038647805' });
    
    if (user) {
      console.log('Usuario encontrado:');
      console.log('- Nombre:', user.nombre);
      console.log('- CC:', user.cc);
      console.log('- Email:', user.email);
      console.log('- Rol:', user.role);
    } else {
      console.log('Usuario no encontrado');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUserRole();