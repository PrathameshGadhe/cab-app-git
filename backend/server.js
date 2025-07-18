// ===== Imports =====
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const bookingRoutes = require('./routes/bookingRoutes');


// ===== Config =====
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// ===== Middleware =====
// Enable CORS for frontend (React at port 5173)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// ===== View Engine =====
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'cab', 'views'));

// ===== MongoDB Connection =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ===== Routes =====
app.use('/api', authRoutes);
app.use('/api', companyRoutes);
app.use('/api', bookingRoutes);

// EJS Views
app.get('/admin/login', (req, res) => {
  res.render('admin/login');
});

app.get('/', (req, res) => {
  res.render('index');
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
