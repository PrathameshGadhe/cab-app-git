const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { getProfile, login } = require('../controllers/authController');

// POST /api/login
router.post('/login', login);

router.get('/profile', getProfile);

module.exports = router;
