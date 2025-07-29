const { MongoClient } = require('mongodb');
require('dotenv').config();

// Función para probar la conexión
async function testMongoConnection() {
  // Mostrar la URI (sin contraseña) para depuración
  const maskedUri = process.env.MONGODB_URI 
    ? process.env.MONGODB_URI.replace(/(mongodb\+srv:\/\/[^:]+:)([^@]+)@/, '$1****@')
    : 'No configurada';

  console.log('🔍 Configuración de MongoDB:');
  console.log('URI:', maskedUri);
  console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

  if (!process.env.MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI no está definida en el archivo .env');
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    maxPoolSize: 10,
  });

  try {
    console.log('\n🔄 Intentando conectar a MongoDB Atlas...');
    
    // Intentar conectar
    await client.connect();
    
    // Obtener información de la base de datos
    const adminDb = client.db().admin();
    const serverStatus = await adminDb.serverStatus();
    const dbInfo = await adminDb.command({ listDatabases: 1 });
    
    console.log('\n✅ Conexión exitosa a MongoDB Atlas!');
    console.log('\n📊 Información del servidor:');
    console.log('- Host:', client.options.srvHost);
    console.log('- Versión MongoDB:', serverStatus.version);
    console.log('- Tiempo de actividad:', Math.floor(serverStatus.uptime / 3600) + ' horas');
    
    console.log('\n📚 Bases de datos disponibles:');
    dbInfo.databases.forEach(db => {
      console.log(`- ${db.name} (${(db.sizeOnDisk / (1024 * 1024)).toFixed(2)} MB)`);
    });
    
    // Probar una operación básica
    const testDb = client.db('occupy-manager');
    const testCollection = testDb.collection('testConnection');
    
    // Insertar un documento de prueba
    const insertResult = await testCollection.insertOne({
      test: 'Conexión exitosa',
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'development'
    });
    
    console.log('\n🧪 Prueba de escritura exitosa. Documento insertado con ID:', insertResult.insertedId);
    
    // Contar documentos
    const count = await testCollection.countDocuments();
    console.log('📝 Total de documentos en la colección de prueba:', count);
    
  } catch (error) {
    console.error('\n❌ Error al conectar a MongoDB:');
    console.error('- Tipo de error:', error.name);
    console.error('- Mensaje:', error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('\n🔍 Posibles soluciones:');
      
      if (error.message.includes('getaddrinfo ENOTFOUND')) {
        console.error('1. Verifica el nombre del host/clúster en la cadena de conexión');
        console.error('   - Asegúrate de que el clúster esté en ejecución en MongoDB Atlas');
      } else if (error.message.includes('bad auth')) {
        console.error('1. Verifica el nombre de usuario y la contraseña');
        console.error('   - Asegúrate de que el usuario tenga los permisos necesarios');
      } else if (error.message.includes('timed out')) {
        console.error('1. El servidor no respondió a tiempo');
        console.error('   - Verifica tu conexión a internet');
        console.error('   - Asegúrate de que tu IP esté en la lista blanca en MongoDB Atlas');
      } else if (error.message.includes('self signed certificate')) {
        console.error('1. Error de certificado SSL');
        console.error('   - Intenta agregar `?tlsAllowInvalidCertificates=true` al final de la URI');
      }
      
      console.error('\n2. Verifica tu conexión a internet');
      console.error('3. Revisa la configuración del firewall');
      console.error('4. Verifica que MongoDB Atlas esté en línea: https://status.cloud.mongodb.com/');
    }
    
    process.exit(1);
  } finally {
    // Cerrar la conexión
    await client.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
}

// Ejecutar la prueba
testMongoConnection().catch(console.error);
