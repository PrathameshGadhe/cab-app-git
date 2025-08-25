import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import { FaCar, FaUser, FaPhone, FaEnvelope, FaIdCard, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaMoneyBillWave, FaRoute, FaUsers, FaCheckCircle, FaTimesCircle, FaSpinner, FaEye } from 'react-icons/fa';
import './RideHistory.css';
// import { sampleRideHistory } from '../data/sampleRideHistory'; // Remove sample data

const RideHistory = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDriverModal, setShowDriverModal] = useState(false);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/bookings/myBookings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRides(res.data.bookings || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to load ride history');
        setLoading(false);
        console.error('Error fetching rides:', err);
      }
    };
    fetchRides();
  }, []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'warning', text: 'Pending', icon: '⏳' },
      assigned: { color: 'info', text: 'Assigned', icon: '🚗' },
      accepted: { color: 'success', text: 'Accepted', icon: '✅' },
      denied: { color: 'danger', text: 'Denied', icon: '❌' },
      completed: { color: 'secondary', text: 'Completed', icon: '🏁' },
      on_trip: { color: 'primary', text: 'On Trip', icon: '🚀' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`badge bg-${config.color} px-3 py-2`} style={{ fontSize: '0.8rem', fontWeight: 500 }}>
        {config.icon} {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  const handleViewDriver = (driver) => {
    setSelectedDriver(driver);
    setShowDriverModal(true);
  };

  const closeDriverModal = () => {
    setShowDriverModal(false);
    setSelectedDriver(null);
  };

  return (
    <>
      <Navbar />
      <div className="ride-history-container">
        <div className="ride-history-header">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <h1 className="ride-history-title">
                  <FaRoute className="title-icon" />
                  My Ride History
                </h1>
                <p className="ride-history-subtitle">
                  Track all your bookings and driver information
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10">
              {loading ? (
                <div className="loading-container">
                  <FaSpinner className="spinner" />
                  <p>Loading your ride history...</p>
                </div>
              ) : error ? (
                <div className="error-container">
                  <div className="alert alert-danger">
                    <FaTimesCircle className="me-2" />
                    {error}
                  </div>
                </div>
              ) : rides.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🚗</div>
                  <h3>No rides yet</h3>
                  <p>You haven't made any bookings yet. Start your journey by booking a ride!</p>
                  <a href="/booking" className="btn btn-primary">
                    Book Your First Ride
                  </a>
                </div>
              ) : (
                <div className="rides-grid">
                  {rides.map((ride) => (
                    <div key={ride._id} className="ride-card">
                      <div className="ride-card-header">
                        <div className="ride-id">
                          <FaIdCard className="me-2" />
                          Booking #{ride._id.slice(-8)}
                        </div>
                        <div className="ride-status">
                          {getStatusBadge(ride.status)}
                        </div>
                      </div>

                      <div className="ride-route">
                        <div className="route-point pickup">
                          <FaMapMarkerAlt className="point-icon pickup-icon" />
                          <div className="point-details">
                            <div className="point-label">Pickup</div>
                            <div className="point-address">{ride.pickup}</div>
                          </div>
                        </div>
                        <div className="route-line"></div>
                        <div className="route-point dropoff">
                          <FaMapMarkerAlt className="point-icon dropoff-icon" />
                          <div className="point-details">
                            <div className="point-label">Dropoff</div>
                            <div className="point-address">{ride.dropoff}</div>
                          </div>
                        </div>
                      </div>

                      <div className="ride-details">
                        <div className="detail-row">
                          <div className="detail-item">
                            <FaCalendarAlt className="detail-icon" />
                            <span className="detail-label">Date:</span>
                            <span className="detail-value">{formatDate(ride.date)}</span>
                          </div>
                          <div className="detail-item">
                            <FaClock className="detail-icon" />
                            <span className="detail-label">Time:</span>
                            <span className="detail-value">{formatTime(ride.time)}</span>
                          </div>
                        </div>
                        <div className="detail-row">
                          <div className="detail-item">
                            <FaCar className="detail-icon" />
                            <span className="detail-label">Cab Type:</span>
                            <span className="detail-value">{ride.cabType}</span>
                          </div>
                          <div className="detail-item">
                            <FaUsers className="detail-icon" />
                            <span className="detail-label">Passengers:</span>
                            <span className="detail-value">{ride.passengers}</span>
                          </div>
                        </div>
                        <div className="detail-row">
                          <div className="detail-item">
                            <FaRoute className="detail-icon" />
                            <span className="detail-label">Distance:</span>
                            <span className="detail-value">{ride.distance} km</span>
                          </div>
                          <div className="detail-item">
                            <FaMoneyBillWave className="detail-icon" />
                            <span className="detail-label">Fare:</span>
                            <span className="detail-value">₹{ride.fare}</span>
                          </div>
                        </div>
                      </div>

                      {ride.assignedDriver && (ride.status === 'accepted' || ride.status === 'completed' || ride.status === 'on_trip') && (
                        <div className="driver-section">
                          <div className="driver-info">
                            <FaUser className="driver-icon" />
                            <div className="driver-details">
                              <div className="driver-name">{ride.assignedDriver.fullName}</div>
                              <div className="driver-vehicle">{ride.assignedDriver.vehicleNumber} • {ride.assignedDriver.vehicleType}</div>
                            </div>
                            <button 
                              className="btn btn-outline-primary btn-sm view-driver-btn"
                              onClick={() => handleViewDriver(ride.assignedDriver)}
                            >
                              <FaEye className="me-1" />
                              View Details
                            </button>
                          </div>
                        </div>
                      )}

                      {ride.includeReturn && (
                        <div className="return-journey">
                          <div className="return-header">
                            <FaRoute className="me-2" />
                            Return Journey
                          </div>
                          <div className="return-details">
                            <div className="return-date">
                              <FaCalendarAlt className="me-2" />
                              {formatDate(ride.returnDate)} at {formatTime(ride.returnTime)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Driver Details Modal */}
      {showDriverModal && selectedDriver && (
        <div className="modal-overlay" onClick={closeDriverModal}>
          <div className="driver-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <FaUser className="me-2" />
                Driver Details
              </h3>
              <button className="modal-close" onClick={closeDriverModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="driver-profile">
                <div className="driver-avatar">
                  <FaUser />
                </div>
                <div className="driver-info">
                  <h4 className="driver-name">{selectedDriver.fullName}</h4>
                  <div className="driver-status">
                    <span className={`status-badge ${selectedDriver.status}`}>
                      {selectedDriver.status === 'active' ? '🟢 Active' : '🔴 Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="driver-details-grid">
                <div className="detail-card">
                  <FaPhone className="detail-icon" />
                  <div className="detail-content">
                    <div className="detail-label">Phone Number</div>
                    <div className="detail-value">{selectedDriver.phoneNumber}</div>
                  </div>
                </div>

                {selectedDriver.email && (
                  <div className="detail-card">
                    <FaEnvelope className="detail-icon" />
                    <div className="detail-content">
                      <div className="detail-label">Email</div>
                      <div className="detail-value">{selectedDriver.email}</div>
                    </div>
                  </div>
                )}

                <div className="detail-card">
                  <FaIdCard className="detail-icon" />
                  <div className="detail-content">
                    <div className="detail-label">Driver ID</div>
                    <div className="detail-value">{selectedDriver.driverId}</div>
                  </div>
                </div>

                <div className="detail-card">
                  <FaCar className="detail-icon" />
                  <div className="detail-content">
                    <div className="detail-label">Vehicle Details</div>
                    <div className="detail-value">
                      {selectedDriver.vehicleNumber} • {selectedDriver.vehicleType}
                    </div>
                  </div>
                </div>

                <div className="detail-card">
                  <FaUser className="detail-icon" />
                  <div className="detail-content">
                    <div className="detail-label">Gender</div>
                    <div className="detail-value">{selectedDriver.gender}</div>
                  </div>
                </div>

                <div className="detail-card">
                  <FaRoute className="detail-icon" />
                  <div className="detail-content">
                    <div className="detail-label">Total Rides</div>
                    <div className="detail-value">{selectedDriver.totalRides}</div>
                  </div>
                </div>
              </div>

              <div className="driver-documents">
                <h5>Documents</h5>
                <div className="documents-grid">
                  <div className="document-item">
                    <FaIdCard className="document-icon" />
                    <span>License Verified</span>
                  </div>
                  <div className="document-item">
                    <FaIdCard className="document-icon" />
                    <span>Aadhaar Verified</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={closeDriverModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default RideHistory; 