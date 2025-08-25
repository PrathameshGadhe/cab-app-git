

const express = require('express');
const {
  createBooking,
  getUserBookings,
  getAllBookings,
  assignDriverToBooking,
  driverAcceptBooking, // ✅ NEW controller function
  getAssignedBookings ,
  updateBookingStatusByDriver, // ✅ NEW controller function
  getMyBookings, // <-- add this
  assignVehicleToBooking // New controller function for vehicle assignment
} = require('../controllers/bookingController');
const auth = require('../auth');

const router = express.Router();

// Create a new booking (user)
router.post('/createBooking', auth, createBooking);

// Get logged-in user's bookings
router.get('/myBookings', auth, getMyBookings);

// Admin/Company: View all bookings with optional filters
router.get('/allBookings', auth, (req, res, next) => {
  // Only allow admin or company users to access this endpoint
  if (req.user.role !== 'admin' && req.user.role !== 'company') {
    return res.status(403).json({ message: 'Access denied. Admins and company users only.' });
  }
  
  // If user is a company admin, automatically filter by their company
  if (req.user.role === 'company') {
    req.query.companyId = req.user.companyId;
  }
  
  next();
}, getAllBookings);

// Assign driver to booking (admin only)
router.put('/assignDriver', auth, (req, res, next) => {
  // Only allow admin users to access this endpoint
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin users only.' });
  }
  next();
}, assignDriverToBooking);

// NEW — Driver accepts assigned booking



// ✅ NEW — Driver accepts assigned booking
router.post('/acceptBooking', driverAcceptBooking);

// ✅ NEW — Get assigned bookings for driver
router.get('/assigned', auth, getAssignedBookings);

// Admin: Assign vehicle to booking
router.post('/:bookingId/assign-vehicle', auth, (req, res, next) => {
  // Only allow admin users to access this endpoint
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin users only.' });
  }
  next();
}, assignVehicleToBooking);

router.put('/updateStatus/:id', updateBookingStatusByDriver);


module.exports = router;