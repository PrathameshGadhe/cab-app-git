const { Payment, Invoice } = require('../models/Billing');
const Booking = require('../models/booking');
const Driver = require('../models/Driver');
const User = require('../models/User');

// Record a payment (cash/UPI)
exports.recordPayment = async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod, notes, isCorporate, corporateDetails } = req.body;
    const adminId = req.user._id; // Assuming admin is logged in
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const payment = new Payment({
      bookingId,
      driverId: booking.driver,
      customerId: booking.user,
      amount,
      paymentMethod,
      status: 'paid',
      paymentDate: new Date(),
      collectedBy: adminId,
      notes,
      isCorporate,
      ...(isCorporate && { corporateDetails })
    });

    await payment.save();

    // Update booking status
    booking.paymentStatus = 'paid';
    await booking.save();

    res.status(201).json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
};

// Generate an invoice (for corporate clients)
exports.generateInvoice = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { 
      paymentMethod = 'bank_transfer',
      companyDetails,
      items,
      notes 
    } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('user', 'name email phone')
      .populate('driver', 'name phone');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Default to trip details if no items provided
    const invoiceItems = items || [{
      description: `Trip from ${booking.pickupLocation} to ${booking.dropoffLocation}`,
      quantity: 1,
      unitPrice: booking.fare,
      amount: booking.fare
    }];

    const subtotal = invoiceItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxAmount = subtotal * 0.18; // 18% GST
    const total = subtotal + taxAmount;

    const invoice = new Invoice({
      bookingId: booking._id,
      customerId: booking.user._id,
      items: invoiceItems,
      subtotal,
      taxAmount,
      total,
      status: 'sent',
      paymentMethod,
      notes,
      isCorporate: true,
      companyDetails
    });

    await invoice.save();
    
    // Update booking with invoice reference
    booking.invoiceId = invoice._id;
    await booking.save();

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ error: 'Failed to generate invoice' });
  }
};

// Get payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    const { driverId, startDate, endDate, status } = req.query;
    const filter = {};
    
    if (driverId) filter.driverId = driverId;
    if (status) filter.status = status;
    
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const payments = await Payment.find(filter)
      .populate('driverId', 'name phone')
      .populate('customerId', 'name phone')
      .populate('collectedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
};

// Mark invoice as paid
exports.markInvoicePaid = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { paymentDate, transactionId, notes } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    invoice.status = 'paid';
    invoice.paymentDate = paymentDate || new Date();
    invoice.transactionId = transactionId;
    if (notes) invoice.notes = notes;

    await invoice.save();

    // Update related booking if exists
    if (invoice.bookingId) {
      await Booking.findByIdAndUpdate(invoice.bookingId, {
        paymentStatus: 'paid',
        paymentMethod: invoice.paymentMethod
      });
    }

    res.json({
      success: true,
      message: 'Invoice marked as paid',
      invoice
    });
  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({ error: 'Failed to update invoice status' });
  }
};

// Get invoice details
exports.getInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    const invoice = await Invoice.findById(invoiceId)
      .populate('customerId', 'name email phone')
      .populate('bookingId', 'pickupLocation dropoffLocation')
      .populate('driverId', 'name phone');

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
};
