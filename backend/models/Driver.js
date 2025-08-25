const mongoose = require('mongoose');

// Schema for salary cycle records
const salaryCycleSchema = new mongoose.Schema({
  cycleNumber: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  baseSalary: { type: Number, default: 0 },
  totalAdvances: { type: Number, default: 0 },
  totalPaid: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'pending_payment'],
    default: 'active'
  },
  notes: String,
  transactions: [{
    type: { type: String, enum: ['salary', 'advance', 'adjustment', 'payment'] },
    amount: Number,
    date: { type: Date, default: Date.now },
    note: String,
    reference: String
  }]
}, { timestamps: true });

const driverSchema = new mongoose.Schema({
  driverId: {
    type: String,
    unique: true,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  licenseImage: {
    type: String,
    required: true
  },
  aadhaarCardImage: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked'],
    default: 'inactive'
  },
  available: {
    type: Boolean,
    default: false
  },
  totalRides: {
    type: Number,
    default: 0
  },
  rideStatus: {
    type: String,
    enum: ['available', 'assigned', 'on trip', 'completed'],
    default: 'available'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0],
      index: '2dsphere'
    },
    lastUpdated: {
      type: Date,
      default: null
    }
  },
  // Financial advances given to the driver
  advances: [{
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    notes: String,
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected', 'repaid'],
      default: 'approved'
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date
  }],

  // ================= Salary Management =================
  salaryCycles: [salaryCycleSchema],
  currentCycle: {
    cycleNumber: { type: Number, default: 1 },
    startDate: { type: Date, default: Date.now },
    baseSalary: { type: Number, default: 0 },
    currentAdvances: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  registrationDate: { 
    type: Date, 
    default: Date.now,
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.models.Driver || mongoose.model('Driver', driverSchema);
