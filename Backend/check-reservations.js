const mongoose = require('mongoose');
require('dotenv').config();

async function checkReservations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/occupymanager');
    console.log('Conectado a MongoDB');
    
    const ReservationModel = mongoose.model('Reservation', new mongoose.Schema({}, { strict: false }));
    
    const reservations = await ReservationModel.find({}).sort({ createdAt: -1 }).limit(10);
    
    console.log('\n=== ÚLTIMAS 10 RESERVAS ===');
    reservations.forEach((res, index) => {
      console.log(`${index + 1}. ID: ${res._id}`);
      console.log(`   Estado: ${res.status}`);
      console.log(`   Usuario: ${res.userId}`);
      console.log(`   Fecha creación: ${res.createdAt}`);
      console.log(`   Fecha inicio: ${res.startDate}`);
      console.log('   ---');
    });
    
    // Contar por estados
    const statusCounts = await ReservationModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('\n=== CONTEO POR ESTADOS ===');
    statusCounts.forEach(status => {
      console.log(`${status._id}: ${status.count}`);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkReservations();