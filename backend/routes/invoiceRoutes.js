const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// Import auth middleware
let protect;
try {
  const auth = require('../middleware/auth');
  protect = auth.protect;
} catch (error) {
  console.warn('Auth middleware not found, using dummy auth');
  protect = (req, res, next) => next(); // Dummy middleware
}

// Generate PDF invoice
router.post('/generate-pdf', protect, invoiceController.generatePDF);

module.exports = router;
