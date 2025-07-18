import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';

const RideHistory = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/myBookings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRides(res.data.bookings || []);
      } catch (err) {
        setError('Failed to load ride history');
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container py-5" style={{ minHeight: '70vh' }}>
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-9">
            <div className="card shadow-sm p-4" style={{ borderRadius: 18, background: '#fff' }}>
              <h2 className="mb-4" style={{ color: '#2b7cff', fontWeight: 700 }}>My Ride History</h2>
              {loading ? (
                <div>Loading...</div>
              ) : error ? (
                <div className="text-danger">{error}</div>
              ) : rides.length === 0 ? (
                <div className="text-muted">No rides found.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Pickup</th>
                        <th>Dropoff</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Cab Type</th>
                        <th>Fare</th>
                        <th>Distance (km)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rides.map((ride) => (
                        <tr key={ride._id}>
                          <td>{ride.pickup}</td>
                          <td>{ride.dropoff}</td>
                          <td>{ride.date}</td>
                          <td>{ride.time}</td>
                          <td>{ride.cabType}</td>
                          <td>{ride.fare}</td>
                          <td>{ride.distance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RideHistory; 