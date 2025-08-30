import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { FaCar, FaMapMarkerAlt, FaClock, FaUser, FaCheck, FaTimes, FaSpinner, FaBell, FaRoute, FaChartLine, FaCheckCircle, FaTimesCircle, FaMapMarkedAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './DriverDashboard.css';

// WebSocket server URL - will use the same origin as the page
const SOCKET_URL = ''; // Empty string will use current origin

const DriverDashboard = () => {
  const [assignedBookings, setAssignedBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [driver, setDriver] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [processingBooking, setProcessingBooking] = useState(null); // Track which booking is being processed
  const [stats, setStats] = useState({
    totalRides: 0,
    completedRides: 0,
    pendingRides: 0,
    totalEarnings: 0
  });
  const [locationError, setLocationError] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const navigate = useNavigate();

  // Initialize WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Connect to WebSocket server
    socketRef.current = io({
      path: '/socket.io', // This should match your Nginx WebSocket location
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: { token },
      withCredentials: true
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsOnline(true);
      
      // Join driver room
      const driverId = JSON.parse(atob(token.split('.')[1])).id;
      socketRef.current.emit('join_driver', driverId);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsOnline(false);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsOnline(false);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [navigate]);

  // Start tracking location
  useEffect(() => {
    if (!isOnline) return;

    const updateLocation = async (position) => {
      const { latitude, longitude } = position.coords;
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/driver/location', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            latitude,
            longitude
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update location');
        }
        
        setLocationError(null);
      } catch (error) {
        console.error('Error updating location:', error);
        setLocationError('Failed to update location. Please check your connection.');
      }
    };

    const handleError = (error) => {
      console.error('Geolocation error:', error);
      setLocationError('Unable to retrieve your location. Please enable location services.');
    };

    // Start watching position
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        updateLocation,
        handleError,
        {
          enableHighAccuracy: true,
          maximumAge: 10000,    // Cache location for 10 seconds
          timeout: 5000         // Time to wait for location
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser');
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isOnline]);
  

  // Fetch driver's assigned bookings
  const fetchAssignedBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/bookings/assigned', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      const data = await response.json();
      const bookings = data.bookings || [];
      setAssignedBookings(bookings);
      
      // Calculate stats
      const totalRides = bookings.length;
      const completedRides = bookings.filter(b => b.status === 'completed').length;
      const pendingRides = bookings.filter(b => b.status === 'assigned').length; // Changed to 'assigned'
      const totalEarnings = bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.fare || 0), 0);
      
      setStats({
        totalRides,
        completedRides,
        pendingRides,
        totalEarnings
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch driver profile
  const fetchDriverProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/driver/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch driver profile');
      }
      
      const data = await response.json();
      setDriver(data.driver);
    } catch (error) {
      console.error('Error fetching driver profile:', error);
      // If not authenticated, redirect to login
      navigate('/driver-login');
    }
  };

  // Handle accepting a booking
  const handleAcceptBooking = async (bookingId) => {
    if (processingBooking) return; // Prevent multiple clicks
    
    setProcessingBooking(bookingId);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/bookings/acceptBooking', {
        method: 'PATCH', // Changed to PATCH as requested
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId,
          driverId: driver?._id,
          action: 'accept'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to accept booking');
      }

      // Update the booking status in the UI
      setAssignedBookings(prevBookings =>
        prevBookings.map(booking =>
          booking._id === bookingId
            ? { ...booking, status: 'accepted' }
            : booking
        )
      );

      toast.success('Booking accepted successfully! Admin and user have been notified.');
      
      // Refresh stats
      fetchAssignedBookings();
    } catch (error) {
      console.error('Error accepting booking:', error);
      toast.error(error.message || 'Failed to accept booking');
    } finally {
      setProcessingBooking(null);
    }
  };

  // Handle rejecting a booking
  const handleRejectBooking = async (bookingId) => {
    if (processingBooking) return; // Prevent multiple clicks
    
    setProcessingBooking(bookingId);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/bookings/acceptBooking', {
        method: 'PATCH', // Using same endpoint but with reject action
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId,
          driverId: driver?._id,
          action: 'reject'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reject booking');
      }

      // Remove the booking from the list since it's rejected
      setAssignedBookings(prevBookings =>
        prevBookings.filter(booking => booking._id !== bookingId)
      );

      toast.success('Booking rejected successfully! Admin and user have been notified.');
      
      // Refresh stats
      fetchAssignedBookings();
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast.error(error.message || 'Failed to reject booking');
    } finally {
      setProcessingBooking(null);
    }
  };

  // Handle starting a ride
  const handleStartRide = async (bookingId) => {
    if (processingBooking) return;
    
    setProcessingBooking(bookingId);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/bookings/startRide', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId,
          driverId: driver?._id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to start ride');
      }

      // Update the booking status in the UI
      setAssignedBookings(prevBookings =>
        prevBookings.map(booking =>
          booking._id === bookingId
            ? { ...booking, status: 'on_trip' }
            : booking
        )
      );

      toast.success('Ride started successfully!');
    } catch (error) {
      console.error('Error starting ride:', error);
      toast.error(error.message || 'Failed to start ride');
    } finally {
      setProcessingBooking(null);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDriverProfile();
    fetchAssignedBookings();
    
    // Set up polling to check for new bookings
    const interval = setInterval(fetchAssignedBookings, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Get first letter of driver's name for avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'D';
  };

  // Format date and time
  const formatDateTime = (dateString, timeString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    const date = new Date(`${dateString}T${timeString}`);
    return date.toLocaleDateString('en-US', options);
  };

  // Format time
  const formatTime = (timeString) => {
    const time = new Date(`1970-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="driver-dashboard-container">
      <Navbar showAdminHamburger={false} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <main className="driver-dashboard-content">
        <div className="driver-dashboard">
          {/* Professional Header */}
          <div className="driver-header">
            <div>
              <h1>Welcome back, {driver?.fullName || 'Driver'}</h1>
              <p>
                You have {stats.pendingRides} assigned ride{stats.pendingRides !== 1 ? 's' : ''} to review.
              </p>
            </div>
            <div className="driver-status">
              <span className={`status-badge ${driver?.rideStatus === 'available' ? 'available' : 'on-ride'}`}>
                {driver?.rideStatus === 'available' ? 'Available' : 'On Ride'}
              </span>
            </div>
          </div>

          {/* Professional Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-icon">🚗</span>
              <div className="stat-value">{stats.totalRides}</div>
              <div className="stat-label">Total Rides</div>
            </div>
            
            <div className="stat-card">
              <span className="stat-icon">✅</span>
              <div className="stat-value">{stats.completedRides}</div>
              <div className="stat-label">Completed</div>
            </div>
            
            <div className="stat-card">
              <span className="stat-icon">⏳</span>
              <div className="stat-value">{stats.pendingRides}</div>
              <div className="stat-label">Assigned</div>
            </div>
            
            <div className="stat-card">
              <span className="stat-icon">💰</span>
              <div className="stat-value">₹{stats.totalEarnings}</div>
              <div className="stat-label">Total Earnings</div>
            </div>
          </div>

          {/* Professional Bookings Section */}
          <div className="bookings-section">
            <div className="section-header">
              <h2>
                <FaRoute style={{ color: '#3b82f6' }} />
                Your Assigned Bookings
              </h2>
              <div className="booking-count">
                {assignedBookings.length} {assignedBookings.length === 1 ? 'Ride' : 'Rides'}
              </div>
            </div>
            
            {isLoading ? (
              <div className="loading-container">
                <FaSpinner className="spinner" />
                <p>Loading your rides...</p>
              </div>
            ) : assignedBookings.length > 0 ? (
              <div className="bookings-grid">
                {assignedBookings.map((booking, index) => (
                  <div key={booking._id} className={`booking-card ${booking.status}`}>
                    <div className="card-header">
                      <div className="booking-id">#{booking._id.substring(0, 6).toUpperCase()}</div>
                      <div className={`status-badge ${booking.status}`}>
                        {booking.status === 'assigned' ? 'Assigned' : 
                         booking.status === 'accepted' ? 'Accepted' :
                         booking.status === 'on_trip' ? 'On Trip' :
                         booking.status === 'completed' ? 'Completed' :
                         booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </div>
                    </div>
                    
                    <div className="route-info">
                      <div className="route-point">
                        <div className="point-marker"></div>
                        <div className="point-details">
                          <div className="point-address">{booking.pickup || 'Pickup location'}</div>
                          <div className="point-time">
                            <FaClock />
                            {formatTime(booking.time)} • {formatDate(booking.date)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="route-duration">~15 min</div>
                      
                      <div className="route-point">
                        <div className="point-marker drop"></div>
                        <div className="point-details">
                          <div className="point-address">{booking.dropoff || 'Drop location'}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="booking-meta">
                      <div className="meta-item">
                        <FaUser className="meta-icon" />
                        <span>{booking.passengers} {booking.passengers === 1 ? 'Passenger' : 'Passengers'}</span>
                      </div>
                      <div className="meta-item">
                        <FaCar className="meta-icon" />
                        <span>{booking.cabType || 'Standard'}</span>
                      </div>
                      <div className="meta-item fare">
                        <span>₹{booking.fare || '--'}</span>
                      </div>
                    </div>
                    
                    <div className="card-actions">
                      {booking.status === 'assigned' && (
                        <>
                          <button 
                            className="btn btn-outline"
                            onClick={() => handleRejectBooking(booking._id)}
                            disabled={processingBooking === booking._id}
                          >
                            {processingBooking === booking._id ? (
                              <FaSpinner className="spinner" />
                            ) : (
                              <FaTimesCircle />
                            )}
                            {processingBooking === booking._id ? 'Processing...' : 'Reject'}
                          </button>
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleAcceptBooking(booking._id)}
                            disabled={processingBooking === booking._id}
                          >
                            {processingBooking === booking._id ? (
                              <FaSpinner className="spinner" />
                            ) : (
                              <FaCheckCircle />
                            )}
                            {processingBooking === booking._id ? 'Processing...' : 'Accept'}
                          </button>
                        </>
                      )}
                      {booking.status === 'accepted' && (
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleStartRide(booking._id)}
                          disabled={processingBooking === booking._id}
                          style={{ width: '100%' }}
                        >
                          {processingBooking === booking._id ? (
                            <FaSpinner className="spinner" />
                          ) : (
                            <FaCar />
                          )}
                          {processingBooking === booking._id ? 'Processing...' : 'Start Ride'}
                        </button>
                      )}
                      {booking.status === 'on_trip' && (
                        <div style={{ 
                          textAlign: 'center', 
                          padding: '1rem', 
                          background: '#f0fdf4', 
                          borderRadius: '6px',
                          border: '1px solid #bbf7d0',
                          color: '#166534',
                          fontWeight: '600'
                        }}>
                          🚗 Ride in Progress
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-bookings">
                <FaCar className="no-bookings-icon" />
                <h3>No rides assigned yet</h3>
                <p>Your assigned rides will appear here. Stay tuned for new bookings!</p>
                <div className="notification-info">
                  <div>
                    <FaBell />
                    <span>You'll be notified when new rides are assigned</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DriverDashboard;
