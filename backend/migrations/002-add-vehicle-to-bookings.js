const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

async function runMigration() {
  let mongoServer;
  let conn;

  try {
    // Connect to the database
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cabapp';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get the booking model
    const Booking = mongoose.model('Booking');

    // Add the new fields to all existing bookings
    const result = await Booking.updateMany(
      {},
      {
        $set: {
          'metadata.vehicleAssignedAt': null,
          'metadata.assignedBy': null
        },
        $setOnInsert: {
          vehicleNumber: null
        }
      },
      { upsert: false, multi: true }
    );

    console.log(`Migration complete. Updated ${result.nModified} documents.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    if (conn) await conn.close();
    if (mongoServer) await mongoServer.stop();
  }
}

runMigration();
