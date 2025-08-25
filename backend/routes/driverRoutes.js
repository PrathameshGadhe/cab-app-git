const express = require('express');
const router = express.Router();
const driverCtrl = require('../controllers/driverController');
const upload = require('../middlewares/uploadMiddleware'); 
const auth = require('../auth');
const Driver = require('../models/Driver'); // Add this line to import the Driver model  

// ================= PUBLIC ROUTES =================

// Driver Login
router.post('/login', driverCtrl.driverLogin);

// Register a new driver
router.post(
  '/register',
  upload.fields([
    { name: 'licenseImage', maxCount: 1 },
    { name: 'aadhaarCardImage', maxCount: 1 }
  ]),
  driverCtrl.createDriver
);

// ================= PROTECTED ROUTES =================
router.use(auth);  

// Get current driver's profile
router.get('/profile', driverCtrl.getDriverProfile);

// Update driver's location
router.put('/location', driverCtrl.updateLocation);

// ================= ADMIN ROUTES =================
// Get all drivers (admin only)
router.get('/', driverCtrl.getAllDrivers);
router.get('/:id', driverCtrl.getDriverById);
router.put('/:id', driverCtrl.updateDriver);
router.patch('/:id/status', driverCtrl.changeStatus);

// ================= DRIVER REPORTS =================
// Get driver report
router.get('/:id/report', driverCtrl.getDriverReport);

// ================= SALARY MANAGEMENT =================
// Set or update base salary for current cycle
router.put('/:id/salary', driverCtrl.setSalary);

// Adjust salary (increase/decrease)
router.put('/:id/salary/adjust', driverCtrl.adjustSalary);

// Give advance for current cycle
router.post('/:id/advance', driverCtrl.giveAdvance);

// Get current salary status and cycle information
router.get('/:id/salary/status', auth, driverCtrl.getSalaryStatus);

// ================= EARNINGS & REPORTS =================
router.get('/:id/earnings', driverCtrl.getDriverEarnings); // Total earnings from completed trips
router.get('/:id/report', driverCtrl.getDriverReport);     // Full driver report (profile + bookings + salary + advances + earnings)

// ================= BILLING & PAYMENTS =================
const billingCtrl = require('../controllers/billingController');

// Billing routes
router.post('/payments/record', auth, billingCtrl.recordPayment);
router.get('/payments', auth, billingCtrl.getPaymentHistory);
router.post('/invoices', auth, billingCtrl.generateInvoice);
router.get('/invoices/:invoiceId', auth, billingCtrl.getInvoice);
router.post('/invoices/:invoiceId/pay', auth, billingCtrl.markInvoicePaid);

module.exports = router;
