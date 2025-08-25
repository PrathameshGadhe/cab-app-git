import React, { useState, useMemo } from 'react';
import AppNavbar from '../components/Navbar';
import Footer from '../components/Footer';
import LocationInput from '../components/LocationInput';
import './Booking.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

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

// Location and distance handling will be managed by the map service
const CAB_TYPES = {
  'Sedan': { 
    // Local trip rates
    local: {
      baseFare: 1800, 
      baseKm: 80,
      baseHours: 8,
      extraKmRate: 12, 
      extraHourRate: 100,
      description: '₹1800 for 80km & 8hr, then ₹12/km & ₹100/hr'
    },
    // Outstation trip rates (per km)
    outstation: {
      ratePerKm: 12,
      minKmPerDay: 300,
      driverAllowancePerDay: 500, // Fixed ₹500 per day for all outstation trips
      description: '₹12/km (min 300km/day) + ₹500/day driver allowance'
    },
    airportRate: 600
  },
  'Mini SUV': { 
    local: {
      baseFare: 2500, 
      baseKm: 80,
      baseHours: 8,
      extraKmRate: 15, 
      extraHourRate: 130,
      description: '₹2500 for 80km & 8hr, then ₹15/km & ₹130/hr'
    },
    outstation: {
      ratePerKm: 15,
      minKmPerDay: 300,
      driverAllowancePerDay: 500, // Fixed ₹500 per day for all outstation trips
      description: '₹15/km (min 300km/day) + ₹500/day driver allowance'
    },
    airportRate: 800
  },
  'SUV': { 
    local: {
      baseFare: 2800, 
      baseKm: 80,
      baseHours: 8,
      extraKmRate: 18, 
      extraHourRate: 150,
      description: '₹2800 for 80km & 8hr, then ₹18/km & ₹150/hr'
    },
    outstation: {
      ratePerKm: 18,
      minKmPerDay: 300,
      driverAllowancePerDay: 500, // Fixed ₹500 per day for all outstation trips
      description: '₹18/km (min 300km/day) + ₹500/day driver allowance'
    },
    airportRate: 1200
  }
};
function getDistance(pickup, dropoff) {
  // This function will be updated to calculate distance using map service
  // For now, return a default distance of 5km
  return 5;
}





const Bookings = () => {
  const [activeTab, setActiveTab] = useState('regular'); // 'regular' or 'airport'
  const [formData, setFormData] = useState({
    pickup: '',
    dropoff: '',
    pickupLocation: { address: '', lat: null, lng: null },
    dropoffLocation: { address: '', lat: null, lng: null },
    date: '',
    time: '',
    tripType: 'local',
    cabType: '',
    passengers: 1,
    includeReturn: false,
    returnDate: '',
    returnTime: '',
    flightNumber: '',
    terminal: ''
  });
  const [fareInfo, setFareInfo] = useState({ fare: null, distance: null, source: null });
  const [isCalculating, setIsCalculating] = useState(false);
  const navigate = useNavigate();

  const calculateDistance = async () => {
    if (activeTab === 'airport') {
      const cabInfo = CAB_TYPES[formData.cabType] || CAB_TYPES['Sedan'];
      setFareInfo({
        fare: cabInfo.airportRate,
        distance: 10, // Fixed 10km for airport transport
        source: 'airport_rate'
      });
      return;
    }
    
    const { pickupLocation, dropoffLocation, cabType, tripType, includeReturn, date, time, returnDate, returnTime } = formData;

    if (!pickupLocation?.lat || !dropoffLocation?.lat) return;
    if (!cabType) {
      setFareInfo({ fare: null, distance: null, source: null });
      return;
    }

    setIsCalculating(true);
    
    try {
      // Use the newer Routes API if available, otherwise fallback to Distance Matrix
      const service = new window.google.maps.DistanceMatrixService();
      
      // Get distance using Distance Matrix API
      const distanceResponse = await new Promise((resolve, reject) => {
        service.getDistanceMatrix(
          {
            origins: [{ lat: pickupLocation.lat, lng: pickupLocation.lng }],
            destinations: [{ lat: dropoffLocation.lat, lng: dropoffLocation.lng }],
            travelMode: window.google.maps.TravelMode.DRIVING,
            unitSystem: window.google.maps.UnitSystem.METRIC,
          },
          (response, status) => {
            if (status === 'OK') resolve(response);
            else reject(new Error(`Distance Matrix request failed with status: ${status}`));
          }
        );
      });

      if (distanceResponse && distanceResponse.rows[0].elements[0].status === 'OK') {
        const distanceInMeters = distanceResponse.rows[0].elements[0].distance.value;
        const durationInSeconds = distanceResponse.rows[0].elements[0].duration.value;
        let distanceInKm = distanceInMeters / 1000;
        const durationInHours = durationInSeconds / 3600;

        // Calculate trip duration including return if needed
        let totalHours = durationInHours;
        let tripDays = 1;
        let finalDistanceInKm = distanceInKm; // Create a mutable copy of distanceInKm
        
        if (includeReturn) {
          totalHours *= 2; // Double the duration for return trip
          finalDistanceInKm *= 2; // Double the distance for return trip
        }

        // Calculate trip days based on dates if available
        if (date && returnDate && includeReturn) {
          const startDate = new Date(`${date}T${time || '00:00'}`);
          const endDate = new Date(`${returnDate}T${returnTime || '23:59'}`);
          const diffTime = Math.abs(endDate - startDate);
          tripDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          tripDays = Math.max(1, tripDays); // At least 1 day
        }

        let fare = 0;
        
        const cabInfo = CAB_TYPES[cabType] || CAB_TYPES['Sedan'];
        
        if (tripType === 'local') {
          // Local trip pricing
          const { baseFare, baseKm, baseHours, extraKmRate, extraHourRate } = cabInfo.local;
          
          // Calculate distance charges
          const extraKm = Math.max(0, finalDistanceInKm - baseKm);
          const distanceCharges = extraKm * extraKmRate;
          
          // Calculate time charges
          const extraHours = Math.max(0, totalHours - baseHours);
          const timeCharges = extraHours * extraHourRate;
          
          // Total fare for local trip
          fare = baseFare + distanceCharges + timeCharges;
        } else {
          // Outstation trip pricing
          const { ratePerKm, minKmPerDay, driverAllowancePerDay } = cabInfo.outstation;
          
          // Calculate distance charges (minimum 300 km per day)
          const effectiveDistance = Math.max(finalDistanceInKm, minKmPerDay * tripDays);
          const distanceCharges = effectiveDistance * ratePerKm;
          
          // Calculate driver allowance
          const driverAllowance = driverAllowancePerDay * tripDays;
          
          // Total fare for outstation trip
          fare = distanceCharges + driverAllowance;
        }
        
        // Round to nearest rupee
        fare = Math.round(fare);
        
        setFareInfo({ 
          fare, 
          distance: distanceInKm.toFixed(1), 
          source: 'google',
          tripDays,
          totalHours: totalHours.toFixed(1)
        });
      } else {
        // Fallback to predefined distance matrix if Google Maps API fails
        const fallbackDistance = getDistance(formData.pickup, formData.dropoff);
        const distanceInKm = includeReturn ? fallbackDistance * 2 : fallbackDistance;
        
        // Simple fare calculation for fallback (can be enhanced if needed)
        let fare;
        if (tripType === 'local') {
          const cabInfo = CAB_TYPES[cabType] || { 
            baseFare: 1800, 
            extraKmRate: 12, 
            extraHourRate: 100 
          };
          const { baseFare, extraKmRate, extraHourRate } = cabInfo;
          const extraKm = Math.max(0, distanceInKm - 80);
          fare = baseFare + (extraKm * extraKmRate);
          // Add rough time estimate (4 hours per 100km)
          const estimatedHours = (distanceInKm / 100) * 4;
          const extraHours = Math.max(0, estimatedHours - 8);
          fare += extraHours * extraHourRate;
        } else {
          const tripDays = includeReturn && returnDate ? 
            Math.ceil((new Date(returnDate) - new Date(date)) / (1000 * 60 * 60 * 24)) || 1 : 1;
          const effectiveDistance = Math.max(distanceInKm, 300 * tripDays);
          fare = (effectiveDistance * 12) + (tripDays * 500);
        }
        
        fare = Math.round(fare);
        
        setFareInfo({ 
          fare, 
          distance: distanceInKm.toFixed(1), 
          source: 'fallback',
          tripDays: 1,
          totalHours: 'N/A'
        });
        
        toast.info('Using estimated distance (Google Maps unavailable)');
      }
    } catch (error) {
      console.error('Error calculating distance:', error);
      // Fallback to predefined distance matrix
      const fallbackDistance = getDistance(formData.pickup, formData.dropoff);
      const distanceInKm = formData.includeReturn ? fallbackDistance * 2 : fallbackDistance;
      
      // Simple fare calculation for fallback (can be enhanced if needed)
      let fare;
      if (formData.tripType === 'local') {
        const cabInfo = CAB_TYPES[formData.cabType] || { 
          baseFare: 1800, 
          extraKmRate: 12, 
          extraHourRate: 100 
        };
        const { baseFare, extraKmRate } = cabInfo;
        const extraKm = Math.max(0, distanceInKm - 80);
        fare = baseFare + (extraKm * extraKmRate);
      } else {
        const tripDays = formData.includeReturn && formData.returnDate ? 
          Math.ceil((new Date(formData.returnDate) - new Date(formData.date)) / (1000 * 60 * 60 * 24)) || 1 : 1;
        const effectiveDistance = Math.max(distanceInKm, 300 * tripDays);
        fare = (effectiveDistance * 12) + (tripDays * 500);
      }
      
     
      fare = Math.round(fare);
      
      setFareInfo({ 
        fare, 
        distance: distanceInKm.toFixed(1), 
        source: 'fallback',
        tripDays: 1,
        totalHours: 'N/A'
      });
      
      toast.info('Using estimated distance (Google Maps unavailable)');
    }
    
    setIsCalculating(false);
  };

  // Calculate fare and distance in real time using Google Maps API
  useEffect(() => {
    if (
      formData.pickupLocation.lat &&
      formData.dropoffLocation.lat &&
      formData.cabType
    ) {
      calculateDistance();
    }
  }, [formData.pickupLocation, formData.dropoffLocation, formData.cabType, formData.includeReturn]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'passengers' ? Math.min(Math.max(value, 1), 6) : value)
    }));
  };

  const handleLocationSelect = (type) => (location) => {
    setFormData(prev => ({
      ...prev,
      [type === 'pickup' ? 'pickup' : 'dropoff']: location.address,
      [type === 'pickup' ? 'pickupLocation' : 'dropoffLocation']: location
    }));
  };

  const handleLocationClear = (type) => () => {
    setFormData(prev => ({
      ...prev,
      [type === 'pickup' ? 'pickup' : 'dropoff']: '',
      [type === 'pickup' ? 'pickupLocation' : 'dropoffLocation']: { address: '', lat: null, lng: null }
    }));
    // Clear fare info when location is cleared
    setFareInfo({ fare: null, distance: null, source: null });
  };

  // Calculate fare and distance in real time using Google Maps API
  useEffect(() => {
    if (
      formData.pickupLocation.lat &&
      formData.dropoffLocation.lat &&
      formData.cabType
    ) {
      calculateDistance();
    }
  }, [formData.pickupLocation, formData.dropoffLocation, formData.cabType, formData.includeReturn]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!localStorage.getItem('token')) {
      toast.error('Please login to book a cab');
      setTimeout(() => navigate('/login'), 1200);
      return;
    }

    // Validate that we have distance and fare calculated
    if (!fareInfo.distance || !fareInfo.fare) {
      toast.error('Please select both pickup and dropoff locations to calculate fare');
      return;
    }

    try {
      // Prepare booking data with calculated distance and fare
      const bookingData = {
        ...formData,
        distance: parseFloat(fareInfo.distance),
        fare: fareInfo.fare,
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation
      };

      const res = await axios.post('http://localhost:5000/api/bookings/createBooking', bookingData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Booking created successfully');
      console.log(res.data);
      
      // Optionally redirect to booking history or dashboard
      setTimeout(() => navigate('/history'), 1500);
    } catch (error) {
      toast.error('Booking failed');
      console.error('Booking failed:', error.response?.data || error.message);
    }
  };

  return (
    <div className="booking-bg d-flex flex-column min-vh-100">
      <AppNavbar />
      <div className="flex-grow-1 d-flex align-items-center justify-content-center py-4" style={{padding: 0}}>
        <div style={{
          display: 'flex',
          flexDirection: window.innerWidth < 992 ? 'column' : 'row',
          width: '100%',
          maxWidth: window.innerWidth < 992 ? '95%' : 1000,
          minHeight: window.innerWidth < 992 ? 'auto' : 600,
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
            minWidth: 0,
            minHeight: window.innerWidth < 992 ? '300px' : 'auto'
          }}>
            <div style={{marginBottom: 24, transform: window.innerWidth < 992 ? 'scale(0.8)' : 'none'}}>
              {illustration}
            </div>
            <h2 style={{
              fontWeight: 800, 
              fontSize: window.innerWidth < 768 ? '1.8rem' : '2.1rem', 
              lineHeight: 1.1, 
              marginBottom: 12,
              textAlign: 'center',
              padding: '0 10px'
            }}>
              Book Your Ride
            </h2>
            <p style={{
              fontSize: window.innerWidth < 768 ? '1rem' : '1.1rem', 
              opacity: 0.93, 
              fontWeight: 500, 
              marginBottom: 0,
              textAlign: 'center',
              maxWidth: '90%'
            }}>
              Fast, secure, and reliable cab booking for every journey.
            </p>
          </div>
          {/* Right: Booking Form */}
          <div style={{
            flex: 1.2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.97)',
            position: 'relative',
            minWidth: 0,
            padding: window.innerWidth < 768 ? '1.5rem 0' : '2rem 0',
            overflowY: 'auto',
            maxHeight: window.innerWidth < 992 ? '70vh' : 'none'
          }}>
            <form 
              onSubmit={handleSubmit} 
              autoComplete="off" 
              style={{
                width: '100%', 
                maxWidth: 400, 
                padding: window.innerWidth < 768 ? '1rem 1.2rem' : '0 2rem',
                margin: '0 auto'
              }}
            >
              {/* Tab Navigation */}
              <div style={{ 
                display: 'flex', 
                marginBottom: '1.5rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '12px',
                padding: '4px',
                position: 'relative',
                zIndex: 1
              }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('regular')}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: 'none',
                    background: activeTab === 'regular' ? 'white' : 'transparent',
                    color: activeTab === 'regular' ? '#2b7cff' : '#6b7280',
                    fontWeight: 600,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                    boxShadow: activeTab === 'regular' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  Regular Ride
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('airport')}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: 'none',
                    background: activeTab === 'airport' ? 'white' : 'transparent',
                    color: activeTab === 'airport' ? '#2b7cff' : '#6b7280',
                    fontWeight: 600,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                    boxShadow: activeTab === 'airport' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  Airport Transfer
                </button>
              </div>
              
              <h3 style={{
                fontWeight: 700, 
                color: '#2b7cff', 
                marginBottom: 24, 
                textAlign: 'center',
                fontSize: window.innerWidth < 768 ? '1.3rem' : '1.5rem',
                display: activeTab === 'airport' ? 'none' : 'block'
              }}>
                Booking Details
              </h3>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Pickup Location</label>
                <LocationInput
                  value={formData.pickup}
                  onChange={(value) => setFormData(prev => ({ ...prev, pickup: value }))}
                  onPlaceSelected={handleLocationSelect('pickup')}
                  placeholder="Enter pickup location"
                  style={{ width: '100%' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Drop-off Location</label>
                <LocationInput
                  value={formData.dropoff}
                  onChange={(value) => setFormData(prev => ({ ...prev, dropoff: value }))}
                  onPlaceSelected={handleLocationSelect('dropoff')}
                  placeholder="Enter drop-off location"
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Ride Date</label>
                  <div style={{position:'relative'}}>
                    <span style={{position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:'1.1rem', color:'#2b7cff'}}>📅</span>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="form-input"
                      style={{
                        padding: '0.6rem 1rem 0.6rem 2.5rem',
                        width: '100%',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.95rem',
                        color: '#374151',
                        backgroundColor: '#fff',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Ride Time</label>
                  <div style={{position:'relative'}}>
                    <span style={{position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:'1.1rem', color:'#2b7cff'}}>⏰</span>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      className="form-input"
                      style={{
                        padding: '0.6rem 1rem 0.6rem 2.5rem',
                        width: '100%',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.95rem',
                        color: '#374151',
                        backgroundColor: '#fff',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Cab Type</label>
                <div style={{position:'relative'}}>
                  <span style={{position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:'1.1rem', color:'#2b7cff'}}>🚕</span>
                  <select
                    name="cabType"
                    value={formData.cabType}
                    onChange={handleChange}
                    required
                    className="form-input"
                    style={{
                      padding: '0.6rem 1rem 0.6rem 2.5rem',
                      width: '100%',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.95rem',
                      color: formData.cabType ? '#374151' : '#9ca3af',
                      backgroundColor: '#fff',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'%239ca3af\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z\'/%3E%3C/svg%3E")',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '12px 12px',
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                      paddingRight: '3rem'
                    }}
                  >
                    <option value="" disabled>Select a Cab Type</option>
                    {Object.entries(CAB_TYPES).map(([cabType, cabDetails]) => {
                      // For airport transfers, show airport rate
                      if (activeTab === 'airport') {
                        return (
                          <option key={cabType} value={cabType}>
                            {cabType} — ₹{cabDetails.airportRate} (Up to 10 km)
                          </option>
                        );
                      }
                      
                      // For regular trips, show local or outstation details based on tripType
                      const tripDetails = formData.tripType === 'local' 
                        ? cabDetails.local 
                        : cabDetails.outstation;
                      
                      return (
                        <option key={cabType} value={cabType}>
                          {cabType} — {tripDetails.description}
                        </option>
                      );
                    })}
                  </select>
                  {formData.cabType && activeTab === 'airport' && (
                    <div style={{
                      position: 'absolute',
                      right: '2.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: '#2b7cff',
                      color: 'white',
                      borderRadius: '4px',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}>
                      ₹{CAB_TYPES[formData.cabType]?.airportRate}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Passengers</label>
                  <div style={{position:'relative'}}>
                    <span style={{position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:'1.1rem', color:'#2b7cff'}}>👥</span>
                    <input
                      type="number"
                      name="passengers"
                      min="1"
                      max="6"
                      value={formData.passengers}
                      onChange={handleChange}
                      className="form-input"
                      style={{
                        padding: '0.6rem 1rem 0.6rem 2.5rem',
                        width: '100%',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.95rem',
                        color: '#374151',
                        backgroundColor: '#fff',
                        boxSizing: 'border-box',
                        WebkitAppearance: 'none',
                        appearance: 'textfield',
                        MozAppearance: 'textfield'
                      }}
                    />
                  </div>
                </div>

              </div>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: '#374151' }}>Trip Type</label>
                <div className="d-flex gap-3" style={{ padding: '8px 0' }}>
                  <div className="position-relative" style={{ flex: 1 }}>
                    <label className="d-flex align-items-center justify-content-center gap-2" style={{
                      cursor: 'pointer',
                      padding: '0.8rem 1rem',
                      borderRadius: '8px',
                      border: `2px solid ${formData.tripType === 'local' ? '#2b7cff' : '#e5e7eb'}`,
                      backgroundColor: formData.tripType === 'local' ? '#f0f7ff' : '#f9fafb',
                      transition: 'all 0.2s ease',
                      height: '100%',
                      textAlign: 'center',
                      fontWeight: formData.tripType === 'local' ? 600 : 500,
                      color: formData.tripType === 'local' ? '#2b7cff' : '#4b5563'
                    }}>
                      <input
                        type="radio"
                        name="tripType"
                        value="local"
                        checked={formData.tripType === 'local'}
                        onChange={handleChange}
                        style={{
                          width: '18px',
                          height: '18px',
                          margin: 0,
                          cursor: 'pointer',
                          accentColor: '#2b7cff'
                        }}
                      />
                      <span>Local</span>
                    </label>
                    <div className="trip-type-tooltip" style={{
                      visibility: 'hidden',
                      width: '280px',
                      backgroundColor: '#1f2937',
                      color: '#fff',
                      textAlign: 'left',
                      borderRadius: '6px',
                      padding: '12px',
                      position: 'absolute',
                      zIndex: 1,
                      bottom: '125%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      opacity: 0,
                      transition: 'opacity 0.3s',
                      fontSize: '0.85rem',
                      lineHeight: 1.5,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                    }}>
                      <strong style={{ display: 'block', marginBottom: '4px', color: '#fff' }}>Local (within 80 km & 8 hours)</strong>
                      <div style={{ fontSize: '0.85rem', color: '#e5e7eb' }}>
                        Base fare as per cab type. Extra charges apply after 80 km and 8 hours.
                      </div>
                    </div>
                  </div>
                  <div className="position-relative" style={{ flex: 1 }}>
                    <label className="d-flex align-items-center justify-content-center gap-2" style={{
                      cursor: 'pointer',
                      padding: '0.8rem 1rem',
                      borderRadius: '8px',
                      border: `2px solid ${formData.tripType === 'outstation' ? '#2b7cff' : '#e5e7eb'}`,
                      backgroundColor: formData.tripType === 'outstation' ? '#f0f7ff' : '#f9fafb',
                      transition: 'all 0.2s ease',
                      height: '100%',
                      textAlign: 'center',
                      fontWeight: formData.tripType === 'outstation' ? 600 : 500,
                      color: formData.tripType === 'outstation' ? '#2b7cff' : '#4b5563'
                    }}>
                      <input
                        type="radio"
                        name="tripType"
                        value="outstation"
                        checked={formData.tripType === 'outstation'}
                        onChange={handleChange}
                        style={{
                          width: '18px',
                          height: '18px',
                          margin: 0,
                          cursor: 'pointer',
                          accentColor: '#2b7cff'
                        }}
                      />
                      <span>Outstation</span>
                    </label>
                    <div className="trip-type-tooltip" style={{
                      visibility: 'hidden',
                      width: '280px',
                      backgroundColor: '#1f2937',
                      color: '#fff',
                      textAlign: 'left',
                      borderRadius: '6px',
                      padding: '12px',
                      position: 'absolute',
                      zIndex: 1,
                      bottom: '125%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      opacity: 0,
                      transition: 'opacity 0.3s',
                      fontSize: '0.85rem',
                      lineHeight: 1.5,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                    }}>
                      <strong style={{ display: 'block', marginBottom: '4px', color: '#fff' }}>Outstation (more than 80 km / multiple days)</strong>
                      <div style={{ fontSize: '0.85rem', color: '#e5e7eb' }}>
                        Minimum 300 km/day at ₹12/km. ₹500/day driver food allowance.
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: formData.tripType === 'local' ? '#f0f9ff' : '#f5f3ff',
                  borderLeft: `4px solid ${formData.tripType === 'local' ? '#2b7cff' : '#8b5cf6'}`,
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  color: formData.tripType === 'local' ? '#0369a1' : '#6d28d9',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '1rem' }}>
                    {formData.tripType === 'local' ? 'ℹ️' : 'ℹ️'}
                  </span>
                  <div>
                    {formData.tripType === 'local' 
                      ? 'Local trips are limited to within 80 km. For longer distances, please select Outstation.'
                      : 'Outstation trips are for distances above 80 km, typically starting from 300 km and beyond.'}
                  </div>
                </div>
              </div>
              
              {/* Include Return Journey Checkbox */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  backgroundColor: formData.includeReturn ? '#f0f7ff' : '#f9fafb',
                  borderRadius: '8px',
                  padding: '0.9rem 1.25rem',
                  border: `1px solid ${formData.includeReturn ? '#2b7cff' : '#d1d5db'}`,
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  marginTop: '0.25rem',
                  width: '100%'
                }} 
                onClick={() => setFormData(prev => ({ ...prev, includeReturn: !prev.includeReturn }))}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    marginTop: '2px',
                    flexShrink: 0
                  }}>
                    <input
                      type="checkbox"
                      name="includeReturn"
                      id="includeReturn"
                      checked={formData.includeReturn}
                      onChange={handleChange}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        margin: 0
                      }}
                    />
                  </div>
                  <div>
                    <div style={{
                      color: formData.includeReturn ? '#2b7cff' : '#374151',
                      fontWeight: formData.includeReturn ? 600 : 500,
                      fontSize: '0.95rem',
                      marginBottom: '4px'
                    }}>
                      Include Return Journey
                    </div>
                    <div style={{
                      fontSize: '0.825rem',
                      color: formData.includeReturn ? '#3b82f6' : '#6b7280',
                      lineHeight: '1.4'
                    }}>
                      {formData.includeReturn ? 'Return trip details will be shown below' : 'Add return trip to your journey'}
                    </div>
                  </div>
                </div>
              </div>
              
              {formData.includeReturn && (
                <div style={{ 
                  marginTop: '-0.5rem',
                  marginBottom: '1.25rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px dashed #d1d5db',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '1rem',
                    marginBottom: '0.5rem'
                  }}>
                    <div>
                      <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Return Date</label>
                      <div style={{position:'relative'}}>
                        <span style={{position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:'1.1rem', color:'#2b7cff'}}>📅</span>
                        <input
                          type="date"
                          name="returnDate"
                          value={formData.returnDate}
                          onChange={handleChange}
                          required={formData.includeReturn}
                          style={{
                            padding: '0.6rem 1rem 0.6rem 2.5rem',
                            width: '100%',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '0.95rem',
                            color: '#374151',
                            backgroundColor: '#fff',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Return Time</label>
                      <div style={{position:'relative'}}>
                        <span style={{position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:'1.1rem', color:'#2b7cff'}}>⏰</span>
                        <input
                          type="time"
                          name="returnTime"
                          value={formData.returnTime}
                          onChange={handleChange}
                          required={formData.includeReturn}
                          style={{
                            padding: '0.6rem 1rem 0.6rem 2.5rem',
                            width: '100%',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '0.95rem',
                            color: '#374151',
                            backgroundColor: '#fff',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: '0.5rem'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 6V12L16 14" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Return trip will affect the total fare calculation</span>
                  </div>
                </div>
              )}
              {/* Fare and distance display */}
              {isCalculating ? (
                <div style={{margin: '1.25rem 0', textAlign: 'center', background: '#f8fafc', borderRadius: 12, padding: '1.25rem', border: '1px dashed #dbeafe'}}>
                  <div className="spinner-border text-primary" style={{width: '1.5rem', height: '1.5rem'}}></div>
                  <p style={{margin: '0.75rem 0 0', color: '#2b7cff', fontWeight: 600}}>Calculating your fare...</p>
                </div>
              ) : fareInfo.fare !== null && fareInfo.distance !== null ? (
                <div style={{background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', padding: '1.25rem', margin: '1.25rem 0', position: 'relative'}}>
                  <div style={{position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: '#22c55e'}}></div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem'}}>
                    <div style={{fontSize: '0.9rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Distance
                    </div>
                    <div style={{background: '#dcfce7', color: '#166534', padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.9rem', fontWeight: 600}}>
                      {fareInfo.distance} km
                    </div>
                  </div>
                  <div style={{borderTop: '1px dashed #bbf7d0', paddingTop: '0.75rem'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <div style={{fontSize: '0.9rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 6V12L16 14" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Estimated Fare
                      </div>
                      <div style={{fontSize: '1.5rem', fontWeight: 700, color: '#166534'}}>₹{fareInfo.fare.toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{fontSize: '0.8rem', color: fareInfo.source === 'google' ? '#10b981' : '#f59e0b', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
                      {fareInfo.source === 'google' ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M22 4L12 14.01L9 11.01" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Real-time distance from Google Maps
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Estimated distance (offline mode)
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : formData.pickup && formData.dropoff && !formData.cabType ? (
                <div style={{margin: '1.25rem 0', textAlign: 'center', background: '#fff3cd', borderRadius: 12, padding: '1rem', color: '#856404', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16H12.01M12 8V12" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Please select a cab type to see fare estimate
                </div>
              ) : null}
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
