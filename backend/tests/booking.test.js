const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../app');
const Booking = require('../models/booking');
const { calculateDistance, calculateFare } = require('../utils/fareCalculator');

// Set test environment
process.env.NODE_ENV = 'test';

// Test user ID for authenticated requests
const TEST_USER_ID = new mongoose.Types.ObjectId();

// Mock authentication middleware
jest.mock('../middleware/auth', () => (req, res, next) => {
  // Mock authenticated user
  req.user = { 
    _id: TEST_USER_ID,
    id: TEST_USER_ID,
    name: 'Test User',
    email: 'test@example.com',
    role: 'user'
  };
  next();
});

describe('Booking API', () => {
  let mongoServer;
  let testBooking;

  beforeAll(async () => {
    // Start in-memory MongoDB server for testing
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    // Clean up test data
    await Booking.deleteMany({});
  });

  describe('Create Booking', () => {
    const validBookingData = {
      pickup: '123 Main St, City',
      dropoff: '456 Oak Ave, Town',
      pickupLocation: {
        lat: 12.9716,
        lng: 77.5946,
        address: '123 Main St, City'
      },
      dropoffLocation: {
        lat: 12.9352,
        lng: 77.6245,
        address: '456 Oak Ave, Town'
      },
      date: '2023-12-31',
      time: '14:30',
      cabType: 'Sedan',
      passengers: 2,
      includeReturn: false,
      notes: 'Test booking'
    };

    it('should create a new booking with valid data', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send(validBookingData)
        .expect(201);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('fare');
      expect(res.body.data).toHaveProperty('distance');
      expect(res.body.data).toHaveProperty('estimatedDuration');
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.user).toBe(TEST_USER_ID.toString());

      // Verify the booking was saved to the database
      const booking = await Booking.findById(res.body.data._id);
      expect(booking).not.toBeNull();
      expect(booking.pickup).toBe(validBookingData.pickup);
      expect(booking.fare).toBeGreaterThan(0);
    });

    it('should calculate correct fare for given distance', async () => {
      const distance = calculateDistance(
        validBookingData.pickupLocation.lat,
        validBookingData.pickupLocation.lng,
        validBookingData.dropoffLocation.lat,
        validBookingData.dropoffLocation.lng
      );

      const fareDetails = calculateFare(distance, validBookingData.cabType);
      
      const res = await request(app)
        .post('/api/bookings')
        .send(validBookingData)
        .expect(201);

      // Verify fare calculation
      expect(res.body.data.fareBreakdown.totalFare).toBe(fareDetails.fare);
      expect(res.body.data.fareBreakdown.distance).toBeCloseTo(distance, 2);
    });

    it('should require all required fields', async () => {
      const requiredFields = ['pickup', 'dropoff', 'date', 'time', 'cabType', 'pickupLocation', 'dropoffLocation'];
      
      for (const field of requiredFields) {
        const invalidData = { ...validBookingData };
        delete invalidData[field];
        
        const res = await request(app)
          .post('/api/bookings')
          .send(invalidData)
          .expect(400);
        
        expect(res.body).toHaveProperty('success', false);
        expect(res.body.message).toContain('Missing required fields');
        expect(res.body.fields).toContain(field);
      }
    });

    it('should validate cab type', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({
          ...validBookingData,
          cabType: 'InvalidType'
        })
        .expect(400);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body.message).toContain('Invalid cab type');
    });

    it('should validate passenger count', async () => {
      // Test with 0 passengers
      let res = await request(app)
        .post('/api/bookings')
        .send({
          ...validBookingData,
          passengers: 0
        })
        .expect(400);

      expect(res.body).toHaveProperty('success', false);

      // Test with more than 8 passengers
      res = await request(app)
        .post('/api/bookings')
        .send({
          ...validBookingData,
          passengers: 9
        })
        .expect(400);

      expect(res.body).toHaveProperty('success', false);
    });

    it('should handle round trip bookings', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({
          ...validBookingData,
          includeReturn: true,
          returnDate: '2024-01-01',
          returnTime: '15:00'
        })
        .expect(201);

      expect(res.body.data.isRoundTrip).toBe(true);
      expect(res.body.data.fareBreakdown.totalFare).toBeGreaterThan(
        res.body.data.fareBreakdown.baseFare * res.body.data.fareBreakdown.distance
      );
    });
  });

  describe('Get Bookings', () => {
    beforeEach(async () => {
      // Create test bookings
      await Booking.create([
        {
          user: TEST_USER_ID,
          pickup: 'Location 1',
          dropoff: 'Location 2',
          pickupLocation: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Location 1' },
          dropoffLocation: { type: 'Point', coordinates: [77.6245, 12.9352], address: 'Location 2' },
          date: '2023-12-31',
          time: '10:00',
          cabType: 'Sedan',
          passengers: 2,
          distance: 8.5,
          fare: 150,
          baseFare: 14,
          isMinimumFare: false,
          isRoundTrip: false,
          estimatedDuration: 30,
          status: 'completed'
        },
        {
          user: TEST_USER_ID,
          pickup: 'Location 3',
          dropoff: 'Location 4',
          pickupLocation: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Location 3' },
          dropoffLocation: { type: 'Point', coordinates: [77.6345, 12.9152], address: 'Location 4' },
          date: '2024-01-01',
          time: '14:00',
          cabType: 'SUV',
          passengers: 4,
          distance: 12.3,
          fare: 250,
          baseFare: 18,
          isMinimumFare: false,
          isRoundTrip: true,
          estimatedDuration: 45,
          status: 'pending'
        }
      ]);
    });

    it('should get all bookings for the authenticated user', async () => {
      const res = await request(app)
        .get('/api/bookings/my-bookings')
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0]).toHaveProperty('pickup');
      expect(res.body.data[0]).toHaveProperty('status');
    });

    it('should filter bookings by status', async () => {
      const res = await request(app)
        .get('/api/bookings/my-bookings?status=completed')
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].status).toBe('completed');
    });
  });
});
