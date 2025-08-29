


const Booking = require('../models/booking');
const Driver = require('../models/Driver');
const createNotification = require('../utils/createNotification');

// ------------------------------
// Fare Configuration
// ------------------------------
const CAB_TYPES = {
  'Sedan': {
    local: {
      baseFare: 1800,
      baseKm: 80,
      baseHours: 8,
      extraKmRate: 12,
      extraHourRate: 100,
      description: '₹1800 for 80km & 8hr, then ₹12/km & ₹100/hr'
    },
    outstation: {
      ratePerKm: 12,
      minKmPerDay: 300,
      driverAllowancePerDay: 500,
      description: '₹12/km (min 300km/day) + ₹500/day driver allowance'
    },
    airportRate: 600
  },
  'Mini SUV': {
    local: {
      baseFare: 2500,
      baseKm: 80,
      baseHours: 8,
      extraKmRate: 15,
      extraHourRate: 130,
      description: '₹2500 for 80km & 8hr, then ₹15/km & ₹130/hr'
    },
    outstation: {
      ratePerKm: 15,
      minKmPerDay: 300,
      driverAllowancePerDay: 500,
      description: '₹15/km (min 300km/day) + ₹500/day driver allowance'
    },
    airportRate: 800
  },
  'SUV': {
    local: {
      baseFare: 2800,
      baseKm: 80,
      baseHours: 8,
      extraKmRate: 18,
      extraHourRate: 150,
      description: '₹2800 for 80km & 8hr, then ₹18/km & ₹150/hr'
    },
    outstation: {
      ratePerKm: 18,
      minKmPerDay: 300,
      driverAllowancePerDay: 500,
      description: '₹18/km (min 300km/day) + ₹500/day driver allowance'
    },
    airportRate: 1200
  }
};

// Default distance if not provided (in km)
const DEFAULT_DISTANCE = 5;

// Default duration if not provided (in hours)
const DEFAULT_DURATION = 1;

// ------------------------------
// Create Booking
// ------------------------------
const createBooking = async (req, res) => {
  try {
    const {
      pickup, dropoff, date, time,
      cabType, passengers, tripType = 'local',
      includeReturn, returnDate, returnTime,
      distance, fare, // Accept distance and fare from frontend
      pickupLocation, dropoffLocation, // Accept location coordinates
      duration = DEFAULT_DURATION // Default duration if not provided
    } = req.body;

    // Validate required fields
    if (!pickup || !dropoff || !date || !time || !cabType || !passengers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate location coordinates
    if (!pickupLocation || !pickupLocation.lat || !pickupLocation.lng || !pickupLocation.address) {
      return res.status(400).json({ error: 'Invalid pickup location data' });
    }
    
    if (!dropoffLocation || !dropoffLocation.lat || !dropoffLocation.lng || !dropoffLocation.address) {
      return res.status(400).json({ error: 'Invalid dropoff location data' });
    }

    // Use the distance, fare, and duration calculated by frontend, or use defaults
    let finalDistance = parseFloat(distance) || DEFAULT_DISTANCE;
    let finalFare = parseFloat(fare) || 0;
    let finalDuration = parseFloat(duration) || DEFAULT_DURATION;
    let tripDays = 1;

    // If frontend didn't provide fare, calculate it
    if (!fare) {
      const cabInfo = CAB_TYPES[cabType] || CAB_TYPES['Sedan'];
      
      if (tripType === 'airport') {
        // Airport transfer - fixed rate
        finalFare = cabInfo.airportRate;
      } else if (tripType === 'outstation') {
        // Outstation trip calculation
        const { ratePerKm, minKmPerDay, driverAllowancePerDay } = cabInfo.outstation;
        
        // Calculate trip days if return date is provided
        if (includeReturn && returnDate) {
          const startDate = new Date(`${date}T${time || '00:00'}`);
          const endDate = new Date(`${returnDate}T${returnTime || '23:59'}`);
          const diffTime = Math.abs(endDate - startDate);
          tripDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          tripDays = Math.max(1, tripDays);
        }
        
        // Calculate distance charges (minimum km per day)
        const effectiveDistance = Math.max(finalDistance, minKmPerDay * tripDays);
        const distanceCharges = effectiveDistance * ratePerKm;
        
        // Calculate driver allowance
        const driverAllowance = driverAllowancePerDay * tripDays;
        
        // Total fare for outstation
        finalFare = Math.round(distanceCharges + driverAllowance);
      } else {
        // Local trip calculation
        const { baseFare, baseKm, baseHours, extraKmRate, extraHourRate } = cabInfo.local;
        
        // Calculate extra distance and time
        const extraKm = Math.max(0, finalDistance - baseKm);
        const extraHours = Math.max(0, finalDuration - baseHours);
        
        // Calculate charges
        const distanceCharges = extraKm * extraKmRate;
        const timeCharges = extraHours * extraHourRate;
        
        // Total fare for local trip
        finalFare = Math.round(baseFare + distanceCharges + timeCharges);
        
        // Double the fare for return trip
        if (includeReturn) {
          finalFare *= 2;
        }
      }
    }

    const newBooking = await Booking.create({
      pickup,
      dropoff,
      date,
      time,
      cabType,
      tripType,
      passengers: parseInt(passengers, 10),
      includeReturn: includeReturn || false,
      returnDate: includeReturn ? returnDate : undefined,
      returnTime: includeReturn ? returnTime : undefined,
      fare: finalFare,
      distance: finalDistance,
      duration: finalDuration,
      status: 'pending',
      userId: req.user.id,
      // Store location coordinates
      pickupCoordinates: {
        lat: parseFloat(pickupLocation.lat),
        lng: parseFloat(pickupLocation.lng),
        address: pickupLocation.address || pickup
      },
      dropoffCoordinates: {
        lat: parseFloat(dropoffLocation.lat),
        lng: parseFloat(dropoffLocation.lng),
        address: dropoffLocation.address || dropoff
      },
      // Additional metadata
      metadata: {
        tripType,
        tripDays,
        calculatedAt: new Date()
      },
      // Initialize with null vehicle number
      vehicleNumber: null
    });

    res.status(201).json({ 
      message: 'Booking successful', 
      booking: newBooking, 
      fare: finalFare, 
      distance: finalDistance 
    });
  } catch (err) {
    res.status(500).json({ error: 'Booking failed', details: err.message });
  }
};

// ------------------------------
// Get All Bookings (Admin)
// ------------------------------
const mongoose = require('mongoose');

const Company = require('../models/company');

const getAllBookings = async (req, res) => {
  try {
    const { 
      driverId, 
      companyId, 
      populate, 
      select, 
      status, 
      sort, 
      limit, 
      startDate, 
      endDate,
      search
    } = req.query;
    
    const filter = {};
    
    // Handle date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    // Handle company filter
    if (companyId) {
      filter.companyId = companyId;
    }
    
    // Handle search query
    if (search) {
      filter.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { 'userId.name': { $regex: search, $options: 'i' } },
        { 'assignedDriver.fullName': { $regex: search, $options: 'i' } },
        { 'companyId.companyName': { $regex: search, $options: 'i' } },
        { status: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Apply driver filter if present
    if (driverId) {
      if (mongoose.Types.ObjectId.isValid(driverId)) {
        filter.assignedDriver = driverId;
      } else {
        return res.status(400).json({ error: 'Invalid driverId format' });
      }
    }

    // Apply company filter if present
    if (companyId) {
      const companyQuery = {};
      if (mongoose.Types.ObjectId.isValid(companyId)) {
        companyQuery._id = companyId;
      } else {
        companyQuery.$or = [
          { companyId: { $regex: new RegExp(`^${companyId}$`, 'i') } },
          { companyCode: { $regex: new RegExp(`^${companyId}$`, 'i') } }
        ];
      }
      
      const company = await Company.findOne(companyQuery);
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }
      
      filter.$or = [
        { companyId: company._id },
        { companyId: { $exists: false } },
        { companyId: null }
      ];
    }
    
    // Apply status filter if present
    if (status) {
      filter.status = status;
    }
    
    // Build the query with the complete filter
    let query = Booking.find(filter);
    
    // Handle sorting
    if (sort) {
      const sortFields = sort.split(',').map(field => {
        let sortOrder = 1;
        if (field.startsWith('-')) {
          sortOrder = -1;
          field = field.substring(1);
        }
        return [field, sortOrder];
      });
      const sortObject = Object.fromEntries(sortFields);
      query = query.sort(sortObject);
    }
    
    // Handle limit
    if (limit) {
      query = query.limit(parseInt(limit, 10));
    }
    
    // Handle field selection
    if (select) {
      const selectFields = select.split(',').map(f => f.trim());
      if (!selectFields.includes('vehicleNumber')) {
        selectFields.push('vehicleNumber');
      }
      query = query.select(selectFields.join(' '));
    }

    // Always populate assignedDriver with basic details
    query = query.populate({
      path: 'assignedDriver',
      select: 'fullName phoneNumber vehicleNumber',
      options: { strictPopulate: false }
    });

    // Handle population of related fields from query param
    if (populate) {
      const populateFields = populate.split(',').map(field => field.trim());
      const populateOptions = {
        'userId': { path: 'userId', select: 'name email phone' },
        'driverId': { path: 'driverId', select: 'fullName phoneNumber', options: { strictPopulate: false } },
        'companyId': { path: 'companyId', select: 'companyName companyId', options: { strictPopulate: false } },
        'user': { path: 'userId', select: 'name email phone', options: { strictPopulate: false } },
        'driver': { path: 'driverId', select: 'fullName phoneNumber', options: { strictPopulate: false } },
        'company': { path: 'companyId', select: 'companyName companyId', options: { strictPopulate: false } }
      };

      const filteredPopulateFields = populateFields.filter(field => field !== 'vehicleId');
      filteredPopulateFields.forEach(field => {
        if (populateOptions[field]) {
          query = query.populate(populateOptions[field]);
        }
      });
    }
    
    const bookings = await query.sort(sort ? undefined : { createdAt: -1 });
    
    res.json({ 
      success: true,
      count: bookings.length,
      bookings 
    });
  } catch (err) {
    const errorContext = {
      message: err.message,
      stack: err.stack,
      query: req.query,
      errorDetails: {
        name: err.name,
        code: err.code,
        keyPattern: err.keyPattern,
        keyValue: err.keyValue,
        errors: err.errors
      },
      filter: 'not defined'
    };
    try {
      if (typeof filter !== 'undefined') {
        errorContext.filter = filter;
      }
    } catch (e) {}
    
    console.error('Error in getAllBookings:', JSON.stringify(errorContext, null, 2));
    
    const errorResponse = {
      success: false,
      error: 'Failed to fetch bookings',
      message: err.message,
      details: {
        name: err.name,
        code: err.code,
        ...(process.env.NODE_ENV === 'development' ? {
          stack: err.stack,
          error: JSON.stringify(err, Object.getOwnPropertyNames(err))
        } : {})
      }
    };
    
    res.status(500).json(errorResponse);
  }
};


// ------------------------------
// Get User's Bookings (My Bookings)
// ------------------------------
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ride history', details: err.message });
  }
};


const assignDriverToBooking = async (req, res) => {
  try {
    const { bookingId, driverId } = req.body;
    
    // Validate input
    if (!bookingId || !driverId) {
      return res.status(400).json({ success: false, message: 'Booking ID and Driver ID are required' });
    }

    // Find the booking and update it
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { 
        assignedDriver: driverId,
        status: 'assigned',
        assignedAt: new Date()
      },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Populate driver details if needed
    await updatedBooking.populate('assignedDriver', 'name phone');
    
    res.status(200).json({ 
      success: true, 
      message: 'Driver assigned successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Error assigning driver:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error assigning driver',
      error: error.message 
    });
  }
};

// ------------------------------
// Get Bookings Assigned to Driver
// ------------------------------
const getDriverBookings = async (req, res) => {
  try {
    const driverId = req.user.id; // Assumes token contains driver ID
    const bookings = await Booking.find({ assignedDriver: driverId }).sort({ createdAt: -1 });
    res.status(200).json({ bookings });
  } catch (err) {
    console.error('Error fetching driver bookings:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------------
// Driver Accepts Booking

const driverAcceptBooking = async (req, res) => {
  try {
    const { bookingId, driverId } = req.body;

    // Fetch the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Check if driver is assigned
    if (!booking.assignedDriver || booking.assignedDriver.toString() !== driverId) {
      return res.status(403).json({ message: 'You are not assigned to this booking' });
    }

    // Update status to accepted
    booking.status = 'accepted';
    await booking.save();

    res.status(200).json({ message: 'Booking accepted successfully', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error accepting booking' });
  }
};

// Add this function before module.exports
const getAssignedBookings = async (req, res) => {
  try {
    const driverId = req.user.id;

    const bookings = await Booking.find({ assignedDriver: driverId }).sort({ createdAt: -1 });
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error fetching assigned bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



const updateBookingStatusByDriver = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = status;
    await booking.save();

    // Send notifications based on new status
    let message = '';
    if (status === 'on trip') message = 'Your ride has started.';
    if (status === 'completed') message = 'Your ride is completed. Thank you!';
    if (message) await createNotification(booking.userId, message, booking._id);

    res.status(200).json({ message: 'Booking status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------------------
// Assign Vehicle to Booking
// ------------------------------
const assignVehicleToBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { vehicleNumber } = req.body;
    const adminId = req.user._id; // Assuming admin is authenticated

    if (!vehicleNumber) {
      return res.status(400).json({ message: 'Vehicle number is required' });
    }

    // Use findByIdAndUpdate with runValidators to ensure validation passes
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        $set: {
          vehicleNumber: vehicleNumber.trim().toUpperCase(),
          'metadata.vehicleAssignedAt': new Date(),
          'metadata.assignedBy': adminId
        }
      },
      { 
        new: true, // Return the updated document
        runValidators: true // Run model validators on update
      }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({
      message: 'Vehicle assigned successfully',
      booking: {
        _id: updatedBooking._id,
        vehicleNumber: updatedBooking.vehicleNumber,
        assignedAt: updatedBooking.metadata?.vehicleAssignedAt
      }
    });
  } catch (error) {
    console.error('Error assigning vehicle:', error);
    res.status(500).json({ 
      message: 'Error assigning vehicle to booking', 
      error: error.message,
      details: error.errors // Include validation error details if any
    });
  }
};

// ------------------------------
// Get My Bookings (for logged-in user)
// ------------------------------
const getMyBookings = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const bookings = await Booking.find({ userId: req.user.id })
      .populate('assignedDriver', 'fullName phoneNumber email')
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch your bookings',
      error: error.message 
    });
  }
};

// ------------------------------
module.exports = {
  createBooking,
  getAllBookings,
  getUserBookings,
  assignDriverToBooking,
  getDriverBookings,
  driverAcceptBooking,
  updateBookingStatusByDriver,
  getMyBookings,
  assignVehicleToBooking,
  getAssignedBookings: async (req, res) => {
    try {
      const bookings = await Booking.find({ userId: req.user.id })
        .populate('assignedDriver', 'fullName phoneNumber email gender vehicleNumber vehicleType status totalRides driverId')
        .sort({ createdAt: -1 });
      res.json({ bookings });
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch bookings' });
    }
  },

};