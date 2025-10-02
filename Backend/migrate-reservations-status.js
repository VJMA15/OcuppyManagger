const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose
  .connect(process.env.DATABASE_URI || 'mongodb://localhost:27017/ocuppy_manager')
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    migrateReservationsStatus();
  })
  .catch((err) => {
    console.error('❌ Error conectando a MongoDB:', err);
    process.exit(1);
  });

function normalizeStatus(raw) {
  const s = String(raw || '').trim().toLowerCase();
  const map = {
    pending: 'pending',
    pendiente: 'pending',
    approved: 'approved',
    aprobada: 'approved',
    aprobado: 'approved',
    rejected: 'rejected',
    rechazada: 'rejected',
    rechazado: 'rejected',
    cancelled: 'cancelled',
    canceled: 'cancelled',
    cancelada: 'cancelled',
    completed: 'completed',
    completada: 'completed'
  };
  return map[s] || (s ? s : null);
}

async function migrateReservationsStatus() {
  try {
    const col = mongoose.connection.db.collection('reservations');
    const total = await col.countDocuments({});
    console.log(`📊 Total reservas: ${total}`);

    const cursor = col.find({});
    let updated = 0;
    let unchanged = 0;
    let errors = 0;
    let legacyCount = 0;
    let missingCount = 0;

    while (await cursor.hasNext()) {
      const doc = await cursor.next();

      const raw = doc.status ?? doc.estado;
      if (doc.estado) legacyCount++;
      if (raw == null || String(raw).trim() === '') {
        missingCount++;
        unchanged++;
        continue;
      }

      const normalized = normalizeStatus(raw);
      if (!normalized) {
        unchanged++;
        continue;
      }

      const needsUpdate = doc.status !== normalized || doc.estado != null;
      if (!needsUpdate) {
        unchanged++;
        continue;
      }

      try {
        await col.updateOne(
          { _id: doc._id },
          {
            $set: { status: normalized },
            $unset: { estado: '' }
          }
        );
        updated++;
      } catch (e) {
        console.error('❌ Error actualizando reserva:', doc._id, e.message);
        errors++;
      }
    }

    console.log('✅ Migración completada');
    console.log(
      `Resumen → actualizadas: ${updated}, sin cambios: ${unchanged}, erroneas: ${errors}, legado(estado): ${legacyCount}, sin estado/status: ${missingCount}`
    );
    process.exit(errors ? 1 : 0);
  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
}