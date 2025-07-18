import React, { useState, useMemo } from 'react';
import AppNavbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Booking.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const illustration = (
  <svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="110" cy="110" rx="100" ry="100" fill="url(#paint0_linear)" fillOpacity="0.2"/>
    <ellipse cx="110" cy="110" rx="80" ry="80" fill="url(#paint1_linear)" fillOpacity="0.3"/>
    <rect x="60" y="90" width="100" height="60" rx="18" fill="#2b7cff" fillOpacity="0.9"/>
    <rect x="80" y="110" width="60" height="20" rx="8" fill="#fff" fillOpacity="0.9"/>
    <circle cx="110" cy="120" r="8" fill="#2b7cff"/>
    <defs>
      <linearGradient id="paint0_linear" x1="0" y1="0" x2="220" y2="220" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2b7cff"/>
        <stop offset="1" stopColor="#38bdf8"/>
      </linearGradient>
      <linearGradient id="paint1_linear" x1="30" y1="30" x2="190" y2="190" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fff"/>
        <stop offset="1" stopColor="#e0e7ff"/>
      </linearGradient>
    </defs>
  </svg>
);

const LOCATIONS = [
  'TV Center',
  'CIDCO',
  '7Hills',
  'Thakare Nagar',
  'Jadhwadi',
  'Gajanan Mandir',
];

const DIST_MATRIX = {
  'TV Center':      [0, 4, 7, 6, 8, 10],
  'CIDCO':          [4, 0, 3, 2, 5, 7],
  '7Hills':         [7, 3, 0, 4, 6, 8],
  'Thakare Nagar':  [6, 2, 4, 0, 3, 5],
  'Jadhwadi':       [8, 5, 6, 3, 0, 2],
  'Gajanan Mandir': [10, 7, 8, 5, 2, 0],
};
const FARE_PER_KM = {
  Mini: 10,
  Sedan: 14,
  SUV: 18,
  Luxury: 25,
};
function getDistance(pickup, dropoff) {
  if (!LOCATIONS.includes(pickup) || !LOCATIONS.includes(dropoff)) return 5;
  const i = LOCATIONS.indexOf(pickup);
  const j = LOCATIONS.indexOf(dropoff);
  return DIST_MATRIX[pickup][j];
}

const Bookings = () => {
  const [formData, setFormData] = useState({
    pickup: '',
    dropoff: '',
    date: '',
    time: '',
    cabType: '',
    passengers: 1,
    includeReturn: false,
    returnDate: '',
    returnTime: '',
  });
  const [fareInfo, setFareInfo] = useState({ fare: null, distance: null });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'passengers' ? Math.min(Math.max(value, 1), 6) : value)
    }));
  };

  // Calculate fare and distance in real time
  useMemo(() => {
    const { pickup, dropoff, cabType, includeReturn } = formData;
    if (pickup && dropoff && cabType) {
      const distance = getDistance(pickup, dropoff);
      const baseFare = FARE_PER_KM[cabType] || 10;
      let fare = distance * baseFare;
      if (includeReturn) fare *= 2;
      fare = Math.round(fare);
      setFareInfo({ fare, distance });
    } else {
      setFareInfo({ fare: null, distance: null });
    }
  }, [formData.pickup, formData.dropoff, formData.cabType, formData.includeReturn]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!localStorage.getItem('token')) {
      toast.error('Please login to book a cab');
      setTimeout(() => navigate('/login'), 1200);
      return;
    }
    try {
      const res = await axios.post('http://localhost:5000/api/createBooking', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Booking created successfully');
      console.log(res.data);
    } catch (error) {
      toast.error('Booking failed');
      console.error('Booking failed:', error.response?.data || error.message);
    }
  };

  return (
    <div className="booking-bg d-flex flex-column min-vh-100">
      <AppNavbar />
      <div className="flex-grow-1 d-flex align-items-center justify-content-center" style={{padding:0}}>
        <div style={{
          display: 'flex',
          width: '100%',
          maxWidth: 900,
          minHeight: 520,
          borderRadius: 28,
          boxShadow: '0 8px 32px rgba(44,62,80,0.13)',
          background: 'rgba(255,255,255,0.7)',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Left: Illustration & Tagline */}
          <div style={{
            flex: 1,
            background: 'linear-gradient(120deg, #2b7cff 0%, #38bdf8 100%)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2.5rem 1.5rem',
            minWidth: 0
          }}>
            <div style={{marginBottom: 24}}>{illustration}</div>
            <h2 style={{fontWeight: 800, fontSize: '2.1rem', lineHeight: 1.1, marginBottom: 12}}>Book Your Ride</h2>
            <p style={{fontSize: '1.1rem', opacity: 0.93, fontWeight: 500, marginBottom: 0}}>Fast, secure, and reliable cab booking for every journey.</p>
          </div>
          {/* Right: Booking Form */}
          <div style={{
            flex: 1.2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.97)',
            position: 'relative',
            minWidth: 0
          }}>
            <form onSubmit={handleSubmit} autoComplete="off" style={{width: '100%', maxWidth: 370, padding: '2.2rem 1.2rem', borderRadius: 20, boxShadow: '0 2px 12px rgba(44,62,80,0.07)', background: 'rgba(255,255,255,1)'}}>
              <h3 style={{fontWeight: 700, color: '#2b7cff', marginBottom: 18, textAlign: 'center'}}>Booking Details</h3>
              <div className="form-group">
                <label className="form-label">Pickup Location</label>
                <div style={{position:'relative'}}>
                  <span style={{position:'absolute', left:10, top:10, fontSize:'1.1rem', color:'#2b7cff'}}>📍</span>
                  <input
                    type="text"
                    name="pickup"
                    placeholder="Enter pickup address"
                    value={formData.pickup}
                    onChange={handleChange}
                    required
                    className="form-input"
                    autoComplete="off"
                    style={{paddingLeft:34}}
                    list="pickup-locations"
                  />
                  <datalist id="pickup-locations">
                    {LOCATIONS.map(loc => <option value={loc} key={loc} />)}
                  </datalist>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Drop-off Location</label>
                <div style={{position:'relative'}}>
                  <span style={{position:'absolute', left:10, top:10, fontSize:'1.1rem', color:'#2b7cff'}}>🏁</span>
                  <input
                    type="text"
                    name="dropoff"
                    placeholder="Enter drop-off address"
                    value={formData.dropoff}
                    onChange={handleChange}
                    required
                    className="form-input"
                    autoComplete="off"
                    style={{paddingLeft:34}}
                    list="dropoff-locations"
                  />
                  <datalist id="dropoff-locations">
                    {LOCATIONS.map(loc => <option value={loc} key={loc} />)}
                  </datalist>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Ride Date</label>
                <div style={{position:'relative'}}>
                  <span style={{position:'absolute', left:10, top:10, fontSize:'1.1rem', color:'#2b7cff'}}>📅</span>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="form-input"
                    style={{paddingLeft:34}}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Ride Time</label>
                <div style={{position:'relative'}}>
                  <span style={{position:'absolute', left:10, top:10, fontSize:'1.1rem', color:'#2b7cff'}}>⏰</span>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="form-input"
                    style={{paddingLeft:34}}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Cab Type</label>
                <div style={{position:'relative'}}>
                  <span style={{position:'absolute', left:10, top:10, fontSize:'1.1rem', color:'#2b7cff'}}>🚕</span>
                  <select
                    name="cabType"
                    value={formData.cabType}
                    onChange={handleChange}
                    required
                    className="form-input"
                    style={{paddingLeft:34}}
                  >
                    <option value="">Select a Cab Type</option>
                    <option value="Mini">Mini</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">No. of Passengers</label>
                <div style={{position:'relative'}}>
                  <span style={{position:'absolute', left:10, top:10, fontSize:'1.1rem', color:'#2b7cff'}}>👥</span>
                  <input
                    type="number"
                    name="passengers"
                    min="1"
                    max="6"
                    value={formData.passengers}
                    onChange={handleChange}
                    className="form-input"
                    style={{paddingLeft:34}}
                  />
                </div>
              </div>
              <div className="form-group d-flex align-items-center gap-2">
                <input
                  type="checkbox"
                  name="includeReturn"
                  id="includeReturn"
                  checked={formData.includeReturn}
                  onChange={handleChange}
                  style={{width: '18px', height: '18px'}}
                />
                <label htmlFor="includeReturn" className="form-label mb-0" style={{cursor: 'pointer'}}>Include Return Journey</label>
              </div>
              {formData.includeReturn && (
                <>
                  <div className="form-group">
                    <label className="form-label">Return Date (optional)</label>
                    <div style={{position:'relative'}}>
                      <span style={{position:'absolute', left:10, top:10, fontSize:'1.1rem', color:'#2b7cff'}}>📅</span>
                      <input
                        type="date"
                        name="returnDate"
                        value={formData.returnDate}
                        onChange={handleChange}
                        className="form-input"
                        style={{paddingLeft:34}}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Return Time (optional)</label>
                    <div style={{position:'relative'}}>
                      <span style={{position:'absolute', left:10, top:10, fontSize:'1.1rem', color:'#2b7cff'}}>⏰</span>
                      <input
                        type="time"
                        name="returnTime"
                        value={formData.returnTime}
                        onChange={handleChange}
                        className="form-input"
                        style={{paddingLeft:34}}
                      />
                    </div>
                  </div>
                </>
              )}
              {/* Fare and distance display */}
              {fareInfo.fare !== null && fareInfo.distance !== null && (
                <div style={{margin: '18px 0 10px 0', textAlign: 'center', background:'#f8fafc', borderRadius:8, padding:'10px 0', color:'#2b7cff', fontWeight:600, fontSize:'1.08rem'}}>
                  Distance: {fareInfo.distance} km &nbsp;|&nbsp; Estimated Fare: ₹{fareInfo.fare}
                </div>
              )}
              <button
                type="submit"
                className="booking-btn mt-2 shadow-sm"
                style={{fontWeight:700, fontSize:'1.1rem', borderRadius:10, boxShadow:'0 2px 8px rgba(44,62,80,0.09)'}}
              >
                Book Ride
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Bookings;
