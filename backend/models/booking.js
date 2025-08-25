const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Basic booking information
  pickup: { type: String, required: true },
  dropoff: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  cabType: { type: String, required: true },
  
  // Trip type and details
  tripType: {
    type: String,
    enum: ['local', 'outstation', 'airport'],
    required: true,
    default: 'local'
  },
  
  // Passenger and return trip details
  passengers: { type: Number, required: true, min: 1 },
  includeReturn: { type: Boolean, default: false },
  returnDate: { type: String },
  returnTime: { type: String },
  
  // Pricing and distance
  fare: { type: Number, required: true },
  distance: { type: Number, required: true },
  duration: { type: Number, required: true }, // in hours
  
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Driver assignment
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },
  
  // Booking status
  status: {
    type: String,
    enum: ['pending', 'assigned', 'accepted', 'denied', 'completed', 'cancelled'],
    default: 'pending',
  },
  
  // Company reference (for company admins)
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  
  // Location coordinates with address
  pickupCoordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true }
  },
  
  dropoffCoordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true }
  },
  
  // Vehicle assignment
  vehicleNumber: {
    type: String,
    trim: true,
    uppercase: true,
    default: null
  },
  
  // Additional metadata
  metadata: {
    tripDays: { type: Number, default: 1 },
    calculatedAt: { type: Date, default: Date.now },
    notes: { type: String },
    vehicleAssignedAt: { type: Date },
    assignedBy: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' 
    }
  }

}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
