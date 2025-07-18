const Booking = require('../models/booking');

// Simple distance matrix (in km) for the provided locations
const LOCATIONS = ['TV Center', 'CIDCO', '7Hills', 'Thakare Nagar', 'Jadhwadi', 'Gajanan Mandir'];
const DIST_MATRIX = {
  'TV Center':      [0, 4, 7, 6, 8, 10],
  'CIDCO':          [4, 0, 3, 2, 5, 7],
  '7Hills':         [7, 3, 0, 4, 6, 8],
  'Thakare Nagar':  [6, 2, 4, 0, 3, 5],
  'Jadhavwadi':       [8, 5, 6, 3, 0, 2],
  'Gajanan Mandir': [10, 7, 8, 5, 2, 0],
};

// Fare per km for each cab type
const FARE_PER_KM = {
  Mini: 10,
  Sedan: 14,
  SUV: 18,
  Luxury: 25,
};

function getDistance(pickup, dropoff) {
  if (!LOCATIONS.includes(pickup) || !LOCATIONS.includes(dropoff)) return 5; // default 5km for manual entry
  const i = LOCATIONS.indexOf(pickup);
  const j = LOCATIONS.indexOf(dropoff);
  return DIST_MATRIX[pickup][j];
}

const createBooking = async (req, res) => {
  try {
    console.log('Server time:', new Date());
    const {
      pickup,
      dropoff,
      date,
      time,
      cabType,
      passengers,
      includeReturn,
      returnDate,
      returnTime
    } = req.body;

    // Calculate distance and fare
    const distance = getDistance(pickup, dropoff);
    const baseFare = FARE_PER_KM[cabType] || 10;
    let fare = distance * baseFare;
    if (includeReturn) fare *= 2;
    fare = Math.round(fare);

    const newBooking = await Booking.create({
      pickup,
      dropoff,
      date,
      time,
      cabType,
      passengers,
      includeReturn,
      returnDate,
      returnTime,
      fare,
      distance,
      userId: req.user.id // Associate booking with the current user
    });
    res.status(201).json({ message: 'Booking successful', booking: newBooking, fare, distance });
  } catch (err) {
    res.status(500).json({ error: 'Booking failed', details: err.message });
  }
};

// Get all bookings for the current user (ride history)
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ride history', details: err.message });
  }
};

module.exports = { createBooking, getUserBookings };
