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

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    
    const users = await User.find({}).select('nombre cc email role activo');
    console.log('Usuarios encontrados:');
    users.forEach(user => {
      console.log(`- Nombre: ${user.nombre}`);
      console.log(`  CC: ${user.cc}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Rol: ${user.role}`);
      console.log(`  Activo: ${user.activo}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkUsers();