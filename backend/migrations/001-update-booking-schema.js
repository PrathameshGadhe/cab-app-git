const mongoose = require('mongoose');
require('dotenv').config();

async function runMigration() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cab-app', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Get the bookings collection
    const db = mongoose.connection.db;
    const bookings = db.collection('bookings');

    // Add new fields with default values
    await bookings.updateMany(
      {},
      {
        $set: {
          'tripType': 'local',
          'duration': 1,
          'pickupCoordinates.address': '$pickup',
          'dropoffCoordinates.address': '$dropoff',
          'metadata': {
            tripDays: 1,
            calculatedAt: new Date(),
            notes: 'Migrated from previous version'
          }
        },
        $rename: {
          'pickupCoordinates.lat': 'pickupCoordinates.lat_old',
          'pickupCoordinates.lng': 'pickupCoordinates.lng_old',
          'dropoffCoordinates.lat': 'dropoffCoordinates.lat_old',
          'dropoffCoordinates.lng': 'dropoffCoordinates.lng_old'
        }
      },
      { multi: true }
    );

    // Rename the fields back to their correct names
    await bookings.updateMany(
      {},
      [
        {
          $set: {
            'pickupCoordinates.lat': { $ifNull: ['$pickupCoordinates.lat_old', 0] },
            'pickupCoordinates.lng': { $ifNull: ['$pickupCoordinates.lng_old', 0] },
            'dropoffCoordinates.lat': { $ifNull: ['$dropoffCoordinates.lat_old', 0] },
            'dropoffCoordinates.lng': { $ifNull: ['$dropoffCoordinates.lng_old', 0] }
          }
        },
        {
          $unset: [
            'pickupCoordinates.lat_old',
            'pickupCoordinates.lng_old',
            'dropoffCoordinates.lat_old',
            'dropoffCoordinates.lng_old'
          ]
        }
      ],
      { multi: true }
    );

    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
