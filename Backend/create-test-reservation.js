const mongoose = require('mongoose');
require('dotenv').config();

async function createTestReservation() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/occupymanager');
    console.log('Conectado a MongoDB');
    
    // Obtener un usuario instructor
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const instructor = await User.findOne({ role: 'instructor' });
    
    if (!instructor) {
      console.log('No se encontró un instructor. Creando uno...');
      const newInstructor = new User({
        nombre: 'Instructor Prueba',
        email: 'instructor.prueba@test.com',
        cc: '12345678',
        role: 'instructor',
        password: '$2b$10$hashedpassword', // Password hasheado
        active: true
      });
      await newInstructor.save();
      console.log('Instructor creado:', newInstructor._id);
    }
    
    // Obtener un ambiente
    const Ambiente = mongoose.model('Ambiente', new mongoose.Schema({}, { strict: false }));
    const ambiente = await Ambiente.findOne();
    
    if (!ambiente) {
      console.log('No se encontró un ambiente. Por favor, crea uno primero.');
      return;
    }
    
    // Crear reserva de prueba
    const ReservationModel = mongoose.model('Reservation', new mongoose.Schema({}, { strict: false }));
    
    const testReservation = new ReservationModel({
      userId: instructor._id,
      environmentId: ambiente._id,
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // Mañana + 2 horas
      status: 'pending', // Estado pendiente
      purpose: 'Reserva de prueba para verificar el flujo de aprobación'
    });
    
    await testReservation.save();
    
    console.log('\n✅ Reserva de prueba creada exitosamente:');
    console.log(`ID: ${testReservation._id}`);
    console.log(`Estado: ${testReservation.status}`);
    console.log(`Usuario: ${instructor.nombre} (${instructor._id})`);
    console.log(`Ambiente: ${ambiente.nombre} (${ambiente._id})`);
    console.log(`Fecha inicio: ${testReservation.startDate}`);
    console.log(`Propósito: ${testReservation.purpose}`);
    
    // Verificar conteo actualizado
    const statusCounts = await ReservationModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('\n=== CONTEO ACTUALIZADO POR ESTADOS ===');
    statusCounts.forEach(status => {
      console.log(`${status._id}: ${status.count}`);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestReservation();