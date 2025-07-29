require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Intentando conectar a MongoDB Atlas...');
console.log('📡 URI de conexión:', 
  process.env.MONGODB_URI
    .replace(/(mongodb\+srv:\/\/)([^:]+):([^@]+)/, '$1[USUARIO]:[CONTRASEÑA]')
    .replace(/@[^/]+\//, '@[CLUSTER]/')
);

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('✅ Conexión exitosa a MongoDB Atlas!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error al conectar a MongoDB Atlas:');
    console.error(err.message);
    console.log('\n🔧 Solución de problemas:');
    console.log('1. Verifica que tu usuario de MongoDB Atlas tenga los permisos necesarios');
    console.log('2. Asegúrate de que tu IP esté en la lista blanca de MongoDB Atlas');
    console.log('3. Verifica que la cadena de conexión sea correcta');
    process.exit(1);
  });
