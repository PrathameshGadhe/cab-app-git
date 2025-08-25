const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const seed = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing users
    await User.deleteMany({});

    // Hash passwords
    const companyPassword = await bcrypt.hash('company123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    // Insert user
    await User.create({
        role: 'company',
        employeeId: '001',
        companyName: 'Arkarz',
        companyId: 'AR001',
        email: 'Arkarz@gmail.com',
        password: await bcrypt.hash('123', 10) // <-- HASHED!

    });



    console.log('Seeded users!');
    process.exit();
};

seed();