const dotenv = require('dotenv');
const mongoose = require('mongoose');

const seedAdmin = require('./seeders/adminSeeder');

dotenv.config();

(async () => {
  await seedAdmin();
  process.exit();
})();