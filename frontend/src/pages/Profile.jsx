import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editData, setEditData] = useState({ companyName: '', companyId: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data.user);
        setEditData({
          companyName: res.data.user.companyName,
          companyId: res.data.user.companyId
        });
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-danger">{error}</div>;
  if (!profile) return null;

  return (
    <>
      <Navbar />
      <div className="container py-5" style={{ minHeight: '70vh' }}>
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-6">
            <div className="card shadow-sm p-4" style={{ borderRadius: 18, background: '#fff' }}>
              <h2 className="mb-4" style={{ color: '#2b7cff', fontWeight: 700 }}>My Profile</h2>
              <form>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={profile.email} disabled />
                </div>
                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <input type="text" className="form-control" value={profile.role} disabled />
                </div>
                <div className="mb-3">
                  <label className="form-label">Company Name</label>
                  <input type="text" className="form-control" name="companyName" value={editData.companyName} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Company ID</label>
                  <input type="text" className="form-control" name="companyId" value={editData.companyId} onChange={handleChange} />
                </div>
                <button type="button" className="btn btn-primary w-100" disabled>Save Changes</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile; 