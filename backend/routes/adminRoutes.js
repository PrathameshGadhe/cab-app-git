const express = require('express');
const router = express.Router();
const { loginAdmin } = require('../controllers/adminController');

// The '/api/admin' prefix is already applied in server.js
router.post('/login', loginAdmin);

module.exports = router;