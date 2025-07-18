const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  pickup: { type: String, required: true },
  dropoff: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  cabType: { type: String, required: true },
  passengers: { type: Number, required: true },
  includeReturn: { type: Boolean, default: false },
  returnDate: { type: String },
  returnTime: { type: String },
  fare: { type: Number },
  distance: { type: Number },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
