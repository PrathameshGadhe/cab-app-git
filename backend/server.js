// ===== Imports =====
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const compression = require('compression');
const { initSocket } = require('./utils/socket');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// Load env vars
dotenv.config({ path: '.env' });

// Route imports
const adminRouter = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const driverRoutes = require('./routes/driverRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const seedAdmin = require('./seeders/adminSeeder');
const notificationRoutes = require('./routes/notificationRoutes');

// ===== Initialize Express =====
const app = express();

// Trust proxy for production
app.enable('trust proxy');

// ===== Security Middleware =====
// Set security HTTP headers
app.use(helmet());

// Enable CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

// Limit requests from same API
const limiter = rateLimit({
  max: process.env.RATE_LIMIT_MAX || 100,
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: process.env.REQUEST_BODY_LIMIT || '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: [
    'duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'
  ]
}));

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// File uploads
const uploadsDir = process.env.FILE_UPLOAD_PATH || 'uploads';
app.use(`/${uploadsDir}`, express.static(path.join(__dirname, uploadsDir)));

// Compress all responses
app.use(compression());

// ===== View Engine =====
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ===== MongoDB Connection =====
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cab-app';

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log('✅ MongoDB Connected...');
    
    // Seed admin if in development
    if (process.env.NODE_ENV === 'development') {
      await seedAdmin();
    }
    
    // Set mongoose debug mode based on environment
    mongoose.set('debug', process.env.NODE_ENV === 'development');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    // Exit process with failure
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err);
  server.close(() => {
    process.exit(1);
  });
});

// ===== Routes =====
app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/admin', adminRouter);
app.use('/api', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// EJS Views
app.get('/admin/login', (req, res) => {
  res.render('admin/login');
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Cab App API' });
});

// Handle 404 - Route not found
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

// Connect to MongoDB
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Start server
const port = process.env.PORT || 5000;
const host = process.env.HOST || '0.0.0.0';

// Start the server
server.listen(port, host, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on http://${host}:${port}`);
  console.log(`🌐 WebSocket server running on port ${port}`);
});

// Handle uncaught exceptions (synchronous errors)
process.on('uncaughtException', err => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err);
  process.exit(1);
});

// Handle SIGTERM (for production environments)
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
