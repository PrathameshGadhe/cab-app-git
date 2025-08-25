const Driver = require('../models/Driver');
const Booking = require('../models/booking');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getIo } = require('../utils/socket');
const saltRounds = 10;
const mongoose = require('mongoose');


// Add new driver
exports.createDriver = async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      email,
      password,
      gender,
      vehicleNumber,
      vehicleType
    } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const licenseImage = req.files?.licenseImage?.[0]?.filename || null;
    const aadhaarCardImage = req.files?.aadhaarCardImage?.[0]?.filename || null;

    const newDriver = new Driver({
      fullName,
      phoneNumber,
      email,
      password: hashedPassword,
      gender,
      vehicleNumber,
      vehicleType,
      licenseImage,
      aadhaarCardImage,
      status: 'active',
      available: true,
      totalRides: 0
    });

    const savedDriver = await newDriver.save();
    res.status(201).json(savedDriver);
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Get all drivers
exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single driver
exports.getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    res.json(driver);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update driver
exports.updateDriver = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }
    
    const updated = await Driver.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Change driver status (block/unblock)
exports.changeStatus = async (req, res) => {
  try {
    const updated = await Driver.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get current driver's profile
exports.getDriverProfile = async (req, res) => {
  try {
    // The auth middleware should have set req.user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized to access this resource' 
      });
    }

    const driver = await Driver.findById(req.user.id).select('-password');
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    res.status(200).json({
      success: true,
      driver
    });
  } catch (error) {
    console.error('Error fetching driver profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Driver Login
exports.driverLogin = async (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body;

    // Validate input
    if ((!email && !phoneNumber) || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Either email or phone number, and password are required' 
      });
    }

    // Build query to find driver by email or phone number
    const query = {};
    if (email) {
      query.email = email;
    } else {
      query.phoneNumber = phoneNumber;
    }

    // Find driver by email or phone number
    const driver = await Driver.findOne(query);
    
    // Check if driver exists
    if (!driver) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    

    // Check password
    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Create token
    const token = jwt.sign(
      { 
        id: driver._id, 
        role: 'driver' 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Return token and driver info (excluding password)
    const { password: _, ...driverData } = driver.toObject();
    res.json({ 
      message: 'Login successful',
      token,
      driver: driverData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update driver's location
exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const driverId = req.user.id; // From auth middleware

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const updatedDriver = await Driver.findByIdAndUpdate(
      driverId,
      {
        'location.coordinates': [longitude, latitude], // GeoJSON uses [long, lat]
        'location.lastUpdated': new Date()
      },
      { new: true, select: '-password' }
    );

    if (!updatedDriver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Emit location update to all users tracking this driver
    const io = getIo();
    io.to(`driver_${driverId}`).emit('location_update', {
      driverId,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Location updated successfully',
      location: updatedDriver.location
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ================= SALARY MANAGEMENT =================
const { checkAndUpdateCycle, DAYS_IN_CYCLE } = require('../utils/salaryCycle');

// In backend/controllers/driverController.js
exports.setSalary = async (req, res) => {
  try {
    const { salary, note } = req.body;
    if (!salary || salary <= 0) {
      return res.status(400).json({ error: 'Salary must be a positive number' });
    }

    let driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Check and update cycle if needed
    driver = await checkAndUpdateCycle(driver);
    
    // Initialize salaryCycles if it doesn't exist
    if (!driver.salaryCycles) {
      driver.salaryCycles = [];
    }

    // Update current cycle's base salary
    driver.currentCycle.baseSalary = salary;
    driver.currentCycle.lastUpdated = new Date();
    
    // Ensure current cycle exists in salaryCycles
    const currentCycleIndex = driver.salaryCycles.findIndex(
      cycle => cycle.cycleNumber === driver.currentCycle.cycleNumber
    );

    const transaction = {
      type: 'salary',
      amount: salary,
      date: new Date(),
      note: note || 'Salary set/updated',
      reference: 'SALARY_SET'
    };

    if (currentCycleIndex >= 0) {
      // Update existing cycle
      if (!driver.salaryCycles[currentCycleIndex].transactions) {
        driver.salaryCycles[currentCycleIndex].transactions = [];
      }
      driver.salaryCycles[currentCycleIndex].transactions.push(transaction);
    } else {
      // Create new cycle
      driver.salaryCycles.push({
        cycleNumber: driver.currentCycle.cycleNumber,
        startDate: driver.currentCycle.startDate,
        endDate: new Date(driver.currentCycle.startDate.getTime() + (30 * 24 * 60 * 60 * 1000)),
        baseSalary: driver.currentCycle.baseSalary,
        totalAdvances: driver.currentCycle.currentAdvances || 0,
        totalPaid: 0,
        status: 'active',
        transactions: [transaction]
      });
    }

    await driver.save();
    
    // Prepare response with updated data
    const cycleEnd = new Date(driver.currentCycle.startDate);
    cycleEnd.setDate(cycleEnd.getDate() + 30); // 30-day cycle
    
    res.json({ 
      success: true, 
      message: 'Salary updated successfully',
      currentCycle: {
        ...driver.currentCycle.toObject(),
        cycleEnd,
        daysRemaining: Math.ceil((cycleEnd - new Date()) / (1000 * 60 * 60 * 24)),
        remainingBalance: Math.max(0, driver.currentCycle.baseSalary - (driver.currentCycle.currentAdvances || 0))
      },
      salaryHistory: driver.salaryCycles
    });
  } catch (err) {
    console.error('Error setting salary:', err);
    res.status(500).json({ 
      error: 'Failed to set salary',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
// Adjust salary (increase/decrease)
exports.adjustSalary = async (req, res) => {
  try {
    const { amount, changeType, note } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }
    if (!['increase', 'decrease'].includes(changeType)) {
      return res.status(400).json({ error: 'Invalid change type' });
    }

    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Check and update cycle if needed
    await checkAndUpdateCycle(driver);
    
    // Update salary based on change type
    const adjustment = changeType === 'increase' ? amount : -amount;
    driver.currentCycle.baseSalary += adjustment;
    
    // Add to transactions
    driver.salaryCycles[driver.salaryCycles.length - 1].transactions.push({
      type: 'adjustment',
      amount: adjustment,
      note: note || `Salary ${changeType}d by ${amount}`,
      reference: `SALARY_${changeType.toUpperCase()}`
    });

    await driver.save();
    res.json({ 
      success: true, 
      message: `Salary ${changeType}d successfully`,
      currentCycle: driver.currentCycle
    });
  } catch (err) {
    console.error('Error adjusting salary:', err);
    res.status(500).json({ error: err.message });
  }
};

// Give advance
exports.giveAdvance = async (req, res) => {
  try {
    const { amount, note } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Advance amount must be positive' });
    }

    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Check and update cycle if needed
    await checkAndUpdateCycle(driver);
    
    // Add to current advances
    driver.currentCycle.currentAdvances += amount;
    
    // Add to transactions
    driver.salaryCycles[driver.salaryCycles.length - 1].transactions.push({
      type: 'advance',
      amount: amount,
      note: note || `Advance payment of ${amount}`,
      reference: 'ADVANCE_PAYMENT'
    });

    await driver.save();
    res.json({ 
      success: true, 
      message: 'Advance recorded successfully',
      currentCycle: driver.currentCycle
    });
  } catch (err) {
    console.error('Error recording advance:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get salary status
exports.getSalaryStatus = async (req, res) => {
  try {
    console.log('Fetching salary status for driver:', req.params.id);

    // Get driver
    let driver = await Driver.findById(req.params.id).lean();
    if (!driver) return res.status(404).json({ error: 'Driver not found' });

    console.log('Driver found, checking for migration needs', {
      hasSalary: !!driver.salary,
      hasCurrentCycle: !!driver.currentCycle,
      salaryCyclesLength: driver.salaryCycles?.length || 0
    });

    // If legacy fields exist but new cycle does not => migrate
    if (driver.salary && !driver.currentCycle?.baseSalary) {
      console.log('Running NON-TRANSACTIONAL migration');

      // Build new cycle
      const newCycle = {
        cycleNumber: 1,
        startDate: driver.registrationDate || new Date(),
        baseSalary: driver.salary,
        currentAdvances: (driver.advances || []).reduce((s, a) => s + (a.amount || 0), 0),
        lastUpdated: new Date()
      };

      const transactions = [
        {
          type: 'salary',
          amount: driver.salary,
          date: new Date(),
          note: 'Initial salary setup',
          reference: 'INITIAL_SALARY'
        },
        ...(driver.advances || []).map(a => ({
          type: 'advance',
          amount: a.amount,
          date: a.date,
          note: a.note,
          reference: 'ADVANCE_PAYMENT'
        }))
      ];

      // Build salaryCycles array
      const salaryCycles = [{
        cycleNumber: 1,
        startDate: newCycle.startDate,
        endDate: new Date(newCycle.startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        baseSalary: newCycle.baseSalary,
        totalAdvances: newCycle.currentAdvances,
        totalPaid: 0,
        status: 'active',
        transactions
      }];

      await Driver.updateOne({ _id: driver._id }, {
        $set: { currentCycle: newCycle, salaryCycles },
        $unset: { salary: "", advances: "" }
      });

      console.log('Migration complete');
      driver = await Driver.findById(req.params.id).lean(); // reload
    }

    // Ensure currentCycle exists
    if (!driver.currentCycle) {
      driver.currentCycle = {
        cycleNumber: 1,
        startDate: new Date(),
        baseSalary: 0,
        currentAdvances: 0,
        lastUpdated: new Date()
      };
      driver.salaryCycles = driver.salaryCycles || [];
      await Driver.updateOne({ _id: driver._id }, {
        currentCycle: driver.currentCycle,
        salaryCycles: driver.salaryCycles
      });
    }

    const current = driver.currentCycle;
    // Compute days
    const cycleEnd = new Date(current.startDate);
    cycleEnd.setDate(cycleEnd.getDate() + DAYS_IN_CYCLE);
    const daysRemaining = Math.ceil((cycleEnd - new Date()) / (1000 * 60 * 60 * 24));

    res.json({
      success: true,
      currentCycle: {
        ...current,
        cycleEnd,
        daysRemaining,
        remainingBalance: Math.max(0, current.baseSalary - (current.currentAdvances || 0))
      },
      salaryHistory: driver.salaryCycles || []
    });

  } catch (err) {
    console.error('Error getting salary status:', err);
    res.status(500).json({ error: 'Failed to get salary status' });
  }
};




// Get driver's total earnings from completed trips
exports.getDriverEarnings = async (req, res) => {
  try {
    const driverId = req.params.id;

    // Sum up fare/amount from completed bookings
    const result = await Booking.aggregate([
      { $match: { driver: driverId, status: 'completed' } },
      { $group: { _id: null, totalEarnings: { $sum: '$fare' } } }
    ]);

    const totalEarnings = result.length > 0 ? result[0].totalEarnings : 0;

    res.json({ success: true, driverId, totalEarnings });
  } catch (err) {
    console.error('Error fetching driver earnings:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get full driver report (profile, salary, advances, bookings, earnings)
exports.getDriverReport = async (req, res) => {
  try {
    const driverId = req.params.id;

    // First, get the driver without populating to avoid strictPopulate error
    const driver = await Driver.findById(driverId)
      .select('-password')
      .lean();
      
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    
    // Initialize advances as empty array if not exists
    driver.advances = driver.advances || [];

    // Fetch bookings for this driver
    const bookings = await Booking.find({ driver: driverId })
      .select('pickup dropoff date status fare')
      .sort({ date: -1 })
      .lean();

    // Calculate earnings
    const completedBookings = bookings.filter(b => b.status === 'completed');
    const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.fare || 0), 0);

    // Calculate advances total (handle case where advances is undefined)
    const advances = driver.advances || [];
    const totalAdvance = advances.reduce((sum, a) => sum + (a.amount || 0), 0);

    // Prepare response data
    const reportData = {
      success: true,
      driver: {
        ...driver,
        // Ensure these fields exist in the response
        salary: driver.salary || 0,
        salaryHistory: driver.salaryHistory || [],
        advances: advances.map(a => ({
          amount: a.amount || 0,
          date: a.date || new Date(),
          notes: a.notes || ''
        }))
      },
      totalBookings: bookings.length,
      completedBookings: completedBookings.length,
      pendingBookings: bookings.filter(b => b.status !== 'completed').length,
      salary: driver.salary || 0,
      totalAdvance,
      remainingSalary: Math.max(0, (driver.salary || 0) - totalAdvance), // Ensure non-negative
      totalEarnings,
      salaryHistory: driver.salaryHistory || [],
      advances: advances,
      bookings: bookings.map(b => ({
        ...b,
        fare: b.fare || 0,
        status: b.status || 'pending',
        date: b.date || new Date()
      }))
    };

    res.json(reportData);
  } catch (err) {
    console.error('Error fetching driver report:', err);
    res.status(500).json({ error: err.message });
  }
};
