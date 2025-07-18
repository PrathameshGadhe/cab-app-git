const express = require('express')
const { createBooking, getUserBookings } = require('../controllers/bookingController');
const auth = require('../auth');

const router = express.Router();

router.post('/createBooking', auth, createBooking);
router.get('/myBookings', auth, getUserBookings);

module.exports =  router;
