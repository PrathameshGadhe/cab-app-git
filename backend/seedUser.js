const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
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
        companyName: 'Om Cab Services',
        companyId: 'OM001',
        email: 'company@omcab.com',
        password: companyPassword
    });

    // Insert user
    await User.create({
        role: 'user',
        companyName: 'Om Cab Services',
        companyId: 'OM001',
        email: 'user@omcab.com',
        password: userPassword
    });

    console.log('Seeded users!');
    process.exit();
};

seed();