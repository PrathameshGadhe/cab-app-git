require('dotenv').config();
const mongoose = require('mongoose');
const { Payment, Invoice } = require('../models/Billing');
const Driver = require('../models/Driver');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cab-app';

const createTestData = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Get a driver and user for testing
    const driver = await Driver.findOne();
    const user = await User.findOne({ role: 'user' });

    if (!driver || !user) {
      console.error('Please make sure you have at least one driver and user in the database');
      process.exit(1);
    }

    // Create test payments
    const payments = [
      {
        bookingId: new mongoose.Types.ObjectId(),
        driverId: driver._id,
        customerId: user._id,
        amount: 500,
        paymentMethod: 'cash',
        status: 'paid',
        paymentDate: new Date(),
        collectedBy: new mongoose.Types.ObjectId(),
        notes: 'Test payment 1',
      },
      {
        bookingId: new mongoose.Types.ObjectId(),
        driverId: driver._id,
        customerId: user._id,
        amount: 750,
        paymentMethod: 'upi',
        status: 'paid',
        paymentDate: new Date(Date.now() - 86400000), // Yesterday
        notes: 'Test payment 2',
      },
    ];

    // Create test invoices
    const invoices = [
      {
        bookingId: new mongoose.Types.ObjectId(),
        customerId: user._id,
        driverId: driver._id,
        invoiceNumber: `INV-${new Date().getFullYear()}-00001`,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        items: [
          {
            description: 'Airport Transfer',
            quantity: 1,
            unitPrice: 1200,
            amount: 1200,
          },
        ],
        subtotal: 1200,
        taxAmount: 216, // 18% GST
        total: 1416,
        status: 'sent',
        paymentMethod: 'bank_transfer',
        isCorporate: true,
        companyDetails: {
          name: 'Test Corp',
          address: '123 Business St, City',
          gstNumber: '22AAAAA0000A1Z5',
          contactPerson: 'John Doe',
          contactEmail: 'accounts@testcorp.com',
          contactPhone: '9876543210',
        },
      },
    ];

    // Clear existing data
    await Payment.deleteMany({});
    await Invoice.deleteMany({});

    // Insert test data
    const createdPayments = await Payment.insertMany(payments);
    const createdInvoices = await Invoice.insertMany(invoices);

    console.log('Created test data:');
    console.log('- Payments:', createdPayments.length);
    console.log('- Invoices:', createdInvoices.length);
    
    console.log('\nTest data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test data:', error);
    process.exit(1);
  }
};

createTestData();
