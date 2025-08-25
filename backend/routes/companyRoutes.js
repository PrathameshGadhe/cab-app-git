
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Company = require('../models/company');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get all companies (for admin use)
router.get('/', async (req, res) => {
  try {
    const companies = await Company.find({}, 'companyName companyId email createdAt');
    res.json({ companies });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register Company
router.post('/register', async (req, res) => {
  try {
    const { companyName, companyId, email, password } = req.body;
    if (!companyName || !companyId || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existing = await Company.findOne({ $or: [{ email }, { companyId }] });
    if (existing) {
      return res.status(400).json({ message: "Company already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newCompany = new Company({ companyName, companyId, email, password: hashedPassword });
    await newCompany.save();
    res.status(201).json({ message: "Company registered successfully", company: newCompany });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Middleware to verify company JWT and attach company id to req.user
function verifyCompanyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'company') return res.status(403).json({ message: 'Not authorized as company' });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

router.post('/employees', verifyCompanyToken, async (req, res) => {
  try {
    const { employeeId, employeeName, email, password } = req.body;
    if (!employeeId || !employeeName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // Check if user (employee) already exists with this email or employeeId for this company
    const existing = await User.findOne({
      $or: [
        { email },
        { employeeId, companyId: req.user.id }
      ]
    });
    if (existing) {
      return res.status(409).json({ message: 'Employee with this email or ID already exists' });
    }
    // Get company info for companyName
    const company = await Company.findById(req.user.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new user with role 'user'
    const user = new User({
      role: 'user',
      employeeId,
      employeeName,
      companyName: company.companyName,
      companyId: company.companyId,
      email,
      password: hashedPassword
    });
    await user.save();
    res.status(201).json({ message: 'Employee registered', user: {
      employeeId: user.employeeId,
      employeeName: user.employeeName,
      companyName: user.companyName,
      companyId: user.companyId,
      email: user.email
    }});
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Company Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const company = await Company.findOne({ email });
  if (!company) {
    return res.status(400).json({ message: 'Company not found' });
  }
  const valid = await bcrypt.compare(password, company.password);
  if (!valid) {
    return res.status(400).json({ message: 'Invalid password' });
  }
  const token = jwt.sign({ id: company._id, email, role: 'company' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ message: 'Login successful', token });
});


// GET /api/company/employees
router.get('/employees', verifyCompanyToken, async (req, res) => {
  try {
    // First get the company to verify it exists and get its companyId
    const company = await Company.findById(req.user.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Find all users with the company's companyId
    const employees = await User.find({ companyId: company.companyId }, '-password');
    res.json({ employees });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/company/employees/:employeeId
router.delete('/employees/:employeeId', verifyCompanyToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // First get the company to verify it exists and get its companyId
    const company = await Company.findById(req.user.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Find and delete the employee
    const employee = await User.findOneAndDelete({ 
      employeeId, 
      companyId: company.companyId 
    });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json({ message: 'Employee removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/company/stats
router.get('/stats', verifyCompanyToken, async (req, res) => {
  try {
    // First get the company to verify it exists and get its companyId
    const company = await Company.findById(req.user.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Get employee count
    const employeeCount = await User.countDocuments({ companyId: company.companyId });
    
    // Get booking statistics (you'll need to import the Booking model)
    const Booking = require('../models/booking');
    const totalBookings = await Booking.countDocuments({ companyId: company._id });
    const completedBookings = await Booking.countDocuments({ 
      companyId: company._id, 
      status: 'completed' 
    });
    const pendingBookings = await Booking.countDocuments({ 
      companyId: company._id, 
      status: { $in: ['pending', 'assigned', 'accepted'] } 
    });
    
    // Calculate total revenue
    const completedBookingsData = await Booking.find({ 
      companyId: company._id, 
      status: 'completed' 
    });
    const totalRevenue = completedBookingsData.reduce((sum, booking) => sum + (booking.fare || 0), 0);
    
    res.json({
      stats: {
        totalEmployees: employeeCount,
        totalBookings,
        completedBookings,
        pendingBookings,
        totalRevenue: Math.round(totalRevenue)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/company/bookings
router.get('/bookings', verifyCompanyToken, async (req, res) => {
  try {
    // First get the company to verify it exists and get its companyId
    const company = await Company.findById(req.user.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Get all bookings for this company with user details
    const Booking = require('../models/booking');
    const bookings = await Booking.find({ companyId: company._id })
      .populate('userId', 'employeeName email employeeId')
      .populate('assignedDriver', 'fullName phoneNumber vehicleNumber vehicleType')
      .sort({ createdAt: -1 });
    
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;