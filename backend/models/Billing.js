const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking', 
    required: true 
  },
  driverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Driver', 
    required: true 
  },
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'upi'],
    required: true 
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending'
  },
  paymentDate: { 
    type: Date,
    default: null
  },
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  notes: String,
  isCorporate: {
    type: Boolean,
    default: false
  },
  corporateDetails: {
    companyName: String,
    billingAddress: String,
    gstNumber: String
  }
}, { timestamps: true });

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking', 
    required: true 
  },
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  issueDate: { 
    type: Date, 
    default: Date.now 
  },
  dueDate: {
    type: Date,
    required: function() { return this.isCorporate; }
  },
  items: [{
    description: String,
    quantity: { type: Number, default: 1 },
    unitPrice: Number,
    amount: Number
  }],
  subtotal: Number,
  taxAmount: Number,
  discount: { 
    type: Number, 
    default: 0 
  },
  total: Number,
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue'],
    default: 'draft'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'bank_transfer'],
    required: true
  },
  notes: String,
  isCorporate: {
    type: Boolean,
    default: false
  },
  companyDetails: {
    name: String,
    address: String,
    gstNumber: String,
    contactPerson: String,
    contactEmail: String,
    contactPhone: String
  }
}, { timestamps: true });

// Generate invoice number
invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const count = await this.constructor.countDocuments();
    const prefix = this.isCorporate ? 'CORP-INV' : 'INV';
    this.invoiceNumber = `${prefix}-${new Date().getFullYear()}-${(count + 1).toString().padStart(5, '0')}`;
  }
  if (this.isCorporate && !this.dueDate) {
    this.dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days for corporate
  }
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);
const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = { Payment, Invoice };
