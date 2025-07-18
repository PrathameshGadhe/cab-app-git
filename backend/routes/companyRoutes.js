const express = require('express');
const router = express.Router();
const Company = require('../models/company');
const jwt = require('jsonwebtoken');

// Fix these values as your "database"
const FIXED_EMAIL = 'company@omcab.com';
const FIXED_PASSWORD = 'company123';

// POST /api/company/login
router.post('/company/login', async (req, res) => {
    const { email, password } = req.body;

    // Check against fixed values
    if (email !== FIXED_EMAIL) {
        return res.status(400).json({ message: 'Company not found' });
    }
    if (password !== FIXED_PASSWORD) {
        return res.status(400).json({ message: 'Invalid password' });
    }

    // Find the company in the database to get its _id
    const company = await Company.findOne({ email });
    if (!company) {
        return res.status(400).json({ message: 'Company not found in DB' });
    }

    // Generate a token for the company, including its id
    const token = jwt.sign({ id: company._id, email, role: 'company' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });
});

module.exports = router;