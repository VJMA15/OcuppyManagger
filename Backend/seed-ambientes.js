require('dotenv').config();
const mongoose = require('mongoose');
// Cambiar esta línea:
// const Ambiente = require('./src/models/ambiente.model.ts').default;
// Por esta (usar el archivo compilado con .default):
const Ambiente = require('./dist/models/ambiente.model').default;

// Función para conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

// Datos de ejemplo para ambientes
const ambientesEjemplo = [
  {
    nombre: "Sala de Conferencias A",
    descripcion: "Sala equipada con proyector, sistema de audio y micrófonos inalámbricos.",
    capacidad: 20,
    tipo: "Aula",
    estado: "Disponible",
    equipos: 15,
    ubicacion: "Piso 1 - Ala Norte",
    servicios: ["Proyector", "Audio", "WiFi", "Aire acondicionado"],
    horario: "8:00 AM - 6:00 PM",
    responsable: "María González",
    activo: true
  },
  {
    nombre: "Laboratorio de Computación 1",
    descripcion: "Laboratorio con 25 computadoras de última generación.",
    capacidad: 25,
    tipo: "Laboratorio",
    estado: "Disponible",
    equipos: 25,
    ubicacion: "Piso 2 - Ala Este",
    servicios: ["Computadoras", "Software especializado", "WiFi", "Impresora"],
    horario: "7:00 AM - 8:00 PM",
    responsable: "Carlos Ruiz",
    activo: true
  },
  {
    nombre: "Aula de Capacitación 1",
    descripcion: "Aula tradicional con pizarra digital y sistema de audio.",
    capacidad: 30,
    tipo: "Aula",
    estado: "Disponible",
    equipos: 8,
    ubicacion: "Piso 1 - Ala Sur",
    servicios: ["Pizarra digital", "Audio", "WiFi", "Ventilación"],
    horario: "8:00 AM - 6:00 PM",
    responsable: "Ana Martínez",
    activo: true
  },
  {
    nombre: "Auditorio Principal",
    descripcion: "Auditorio con capacidad para 100 personas y sistema de proyección profesional.",
    capacidad: 100,
    tipo: "Auditorio",
    estado: "Disponible",
    equipos: 5,
    ubicacion: "Piso 3 - Centro",
    servicios: ["Proyector 4K", "Audio surround", "WiFi", "Aire acondicionado"],
    horario: "8:00 AM - 10:00 PM",
    responsable: "Luis Pérez",
    activo: true
  }
];

// Función para insertar ambientes
const seedAmbientes = async () => {
  try {
    // Limpiar colección existente
    await Ambiente.deleteMany({});
    console.log('🧹 Colección de ambientes limpiada');
    
    // Insertar nuevos ambientes
    const ambientesCreados = await Ambiente.insertMany(ambientesEjemplo);
    console.log(`✅ ${ambientesCreados.length} ambientes insertados exitosamente`);
    
    // Mostrar los ambientes creados
    ambientesCreados.forEach((ambiente, index) => {
      console.log(`${index + 1}. ${ambiente.nombre} (ID: ${ambiente._id})`);
    });
    
  } catch (error) {
    console.error('❌ Error insertando ambientes:', error.message);
  }
};

// Función principal
const main = async () => {
  console.log('🚀 Insertando datos de prueba para ambientes...\n');
  
  await connectDB();
  await seedAmbientes();
  
  console.log('\n✅ Proceso completado');
  process.exit(0);
};

// Ejecutar script
main().catch(error => {
  console.error('❌ Error en el script:', error);
  process.exit(1);
});