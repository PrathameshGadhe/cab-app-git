

// User data

// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const CompanyLogin = require('./models/companyLogin');
// require('dotenv').config();

// const MONGO_URI = process.env.MONGO_URI ;

// async function seed() {
//   try {
//     await mongoose.connect(MONGO_URI);
//     await CompanyLogin.deleteMany({}); // Optional: clear previous data
//     const hashedPassword = await bcrypt.hash('company123', 10);
//     await CompanyLogin.create({
//       role: 'user',
//       companyName: 'Om Cab Services',
//       companyId: 'OM1001',
//       email: 'company@omcab.com',
//       password: hashedPassword
//     });
//     console.log('✅ Dummy user created!');
//   } catch (err) {
//     console.error('❌ Error:', err);
//   } finally {
//     mongoose.connection.close();
//   }
// }

// seed();

// company data



const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Company = require('../models/Company');
require('dotenv').config();

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);

    // Purane data hatao
    await Company.deleteMany({});

    // Password hash karo
    const hashedPassword = await bcrypt.hash('company123', 10);

    // Company insert karo
    await Company.create({
        email: 'company@omcab.com',
        password: hashedPassword
    });

    console.log('Company seeded!');
    process.exit();
}

seed();