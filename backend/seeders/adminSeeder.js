const bcrypt = require('bcrypt');
const Admin = require('../models/adminModel');
const dotenv = require('dotenv');
dotenv.config();

async function seedAdmin() {
  const existing = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
  if (existing) {
    console.log('Admin already exists');
    return;
  }

  const hash = await bcrypt.hash(process.env.ADMIN_PASS, 10);

  await Admin.create({
    email: process.env.ADMIN_EMAIL,
    password: hash
  });

  console.log('✅ Admin user seeded');
}

module.exports = seedAdmin;