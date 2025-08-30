import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const illustration = (
  <svg width="180" height="180" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{maxWidth:'100%'}}>
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

const Login = () => {
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    phoneNumber: '',
    password: '',
    companyId: '',
    companyName: '',
    employeeId: '',
    employeeName: ''
  });
  const navigate = useNavigate();

  const handleInput = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      let endpoint;
      let response;
      
      // Use relative path for API calls
      let payload = { ...loginData };
      
      console.log('Login attempt with role:', role);
      
      // Set endpoint and prepare payload based on role
      if (role === 'driver') {
        endpoint = '/api/driver/login';
        payload = { password: loginData.password };
        
        if (loginData.email) {
          payload.email = loginData.email;
          console.log('Using email for driver login');
        } else if (loginData.phoneNumber) {
          payload.phoneNumber = loginData.phoneNumber;
          console.log('Using phone number for driver login');
        }
      } else if (role === 'company') {
        endpoint = '/api/company/login';
      } else {
        endpoint = '/api/auth/login';
      }

      console.log('Making request to:', endpoint, 'with payload:', payload);
      response = await axios.post(endpoint, payload, {
        withCredentials: true
      });
      
      console.log('Login response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', role);
        console.log('Token and role stored in localStorage');
        
        if (response.data.driver) {
          localStorage.setItem('driver', JSON.stringify(response.data.driver));
          console.log('Driver data stored in localStorage');
        }

        toast.success('Login successful!');
        
        // Navigate based on role
        let redirectPath = '/';
        
        if (role === 'driver') {
          redirectPath = '/driver-dashboard';
          console.log('Navigating driver to /driver-dashboard');
        } else if (role === 'company') {
          redirectPath = '/company-dashboard';
          console.log('Navigating company to /company-dashboard');
        } else if (role === 'user') {
          redirectPath = '/booking';
          console.log('Navigating user to /booking');
        }
        
        console.log('Attempting to navigate to', redirectPath);
        navigate(redirectPath);
      } else {
        console.error('No token in response:', response.data);
        toast.error('Login failed: No token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  // Render role-specific form fields
  const renderRoleSpecificFields = () => {
    if (role === 'driver') {
      return (
        <div className="mb-3">
          <label className="form-label">Email or Phone Number</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              name={loginData.email ? 'email' : 'phoneNumber'}
              value={loginData.email || loginData.phoneNumber}
              onChange={(e) => {
                const value = e.target.value;
                // Clear both fields when changing
                setLoginData(prev => ({
                  ...prev,
                  email: '',
                  phoneNumber: ''
                }));
                // Set the appropriate field based on input
                const isEmail = value.includes('@');
                setLoginData(prev => ({
                  ...prev,
                  [isEmail ? 'email' : 'phoneNumber']: value
                }));
              }}
              placeholder="Email or Phone Number"
              required
            />
          </div>
          <div className="form-text">You can use either email or phone number to login</div>
        </div>
      );
    } else if (role === 'user') {
      return (
        <>
          <div className="mb-3">
            <label className="form-label">Company ID</label>
            <input
              type="text"
              className="form-control"
              name="companyId"
              value={loginData.companyId}
              onChange={handleInput}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Employee ID</label>
            <input
              type="text"
              className="form-control"
              name="employeeId"
              value={loginData.employeeId}
              onChange={handleInput}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Employee Name</label>
            <input
              type="text"
              className="form-control"
              name="employeeName"
              value={loginData.employeeName}
              onChange={handleInput}
              required
            />
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <>
      <Navbar />
      <div className="reg-bg-responsive">
        <div className="reg-card-responsive">
          {/* Illustration & Tagline */}
          <div className="reg-illustration-col">
            <div style={{marginBottom: 18}}>{illustration}</div>
            <h2 className="reg-title">Welcome Back</h2>
            <p className="reg-desc">Login to CabApp and manage or book your rides.</p>
          </div>
          
          {/* Login Form */}
          <div className="reg-form-col">
            <div className="reg-form-inner">
              <h3 className="reg-form-heading">Login</h3>
              
              {/* Role Switcher */}
              <div className="d-flex justify-content-center mb-3" style={{gap: '10px'}}>
                <button
                  className={`btn btn-sm ${role === 'user' ? 'btn-info' : 'btn-outline-info'}`}
                  style={{
                    borderRadius: '8px',
                    minWidth: '90px',
                    fontWeight: 600,
                    color: role === 'user' ? '#fff' : '#2b7cff',
                    background: role === 'user' ? '#2b7cff' : '#fff',
                    border: '1.5px solid #2b7cff',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setRole('user')}
                >
                  <span role="img" aria-label="user" style={{marginRight: '6px'}}>🧑</span> User
                </button>
                <button
                  className={`btn btn-sm ${role === 'driver' ? 'btn-info' : 'btn-outline-info'}`}
                  style={{
                    borderRadius: '8px',
                    minWidth: '90px',
                    fontWeight: 600,
                    color: role === 'driver' ? '#fff' : '#2b7cff',
                    background: role === 'driver' ? '#2b7cff' : '#fff',
                    border: '1.5px solid #2b7cff',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setRole('driver')}
                >
                  <span role="img" aria-label="driver" style={{marginRight: '6px'}}>🚕</span> Driver
                </button>
                <button
                  className={`btn btn-sm ${role === 'company' ? 'btn-info' : 'btn-outline-info'}`}
                  style={{
                    borderRadius: '8px',
                    minWidth: '90px',
                    fontWeight: 600,
                    color: role === 'company' ? '#fff' : '#2b7cff',
                    background: role === 'company' ? '#2b7cff' : '#fff',
                    border: '1.5px solid #2b7cff',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setRole('company')}
                >
                  <span role="img" aria-label="company">🏢</span>Company
                </button>
              </div>
              
              <form onSubmit={handleLogin}>
                {renderRoleSpecificFields()}
                
                {role !== 'driver' && (
                  <div className="mb-4">
                    <label className="form-label" style={{fontWeight: 500, marginBottom: '8px', display: 'block'}}>Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={loginData.email}
                      onChange={handleInput}
                      required={role !== 'driver'}
                      style={{
                        padding: '10px 15px',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        width: '100%',
                        transition: 'border-color 0.2s',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>
                )}
                
                <div className="mb-4">
                  <label className="form-label" style={{fontWeight: 500, marginBottom: '8px', display: 'block'}}>Password</label>
                  <div style={{position: 'relative'}}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      name="password"
                      value={loginData.password}
                      onChange={handleInput}
                      required
                      style={{
                        padding: '10px 45px 10px 15px',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        width: '100%',
                        transition: 'border-color 0.2s',
                        fontSize: '0.95rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#666',
                        cursor: 'pointer',
                        padding: '5px',
                        fontSize: '1rem'
                      }}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#2b7cff',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      marginTop: '10px'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#1a6ae6'}
                    onMouseOut={(e) => e.target.style.background = '#2b7cff'}
                  >
                    Login as {role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                </div>
              </form>
              
              <div className="text-center mt-3">
                {role === 'driver' ? (
                  <p className="mb-0">
                    Don't have an account?{' '}
                    <a href="/driver-register" className="text-primary">Register as Driver</a>
                  </p>
                ) : role === 'user' ? (
                  <p className="mb-0">
                    Don't have an account? <a href="/register" className="text-primary">Sign up</a>
                  </p>
                ) : (
                  <p className="mb-0">
                    Company registration? <a href="/company-register" className="text-primary">Contact us</a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <style>{`
        .reg-bg-responsive {
          min-height: 100vh;
          background: linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .reg-card-responsive {
          display: flex;
          flex-direction: row;
          width: 100%;
          max-width: 900px;
          min-height: 520px;
          border-radius: 28px;
          box-shadow: 0 8px 32px rgba(44,62,80,0.13);
          background: rgba(255,255,255,0.7);
          overflow: hidden;
          position: relative;
        }
        .reg-illustration-col {
          flex: 1;
          background: linear-gradient(120deg, #2b7cff 0%, #38bdf8 100%);
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1.5rem;
          min-width: 0;
        }
        .reg-title {
          font-weight: 800;
          font-size: 2.1rem;
          line-height: 1.1;
          margin-bottom: 12px;
          text-align: center;
        }
        .reg-desc {
          font-size: 1.1rem;
          opacity: 0.93;
          font-weight: 500;
          margin-bottom: 0;
          text-align: center;
        }
        .reg-form-col {
          flex: 1.2;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.97);
          position: relative;
          min-width: 0;
          border-radius: 20px;
          box-shadow: 0 2px 12px rgba(44,62,80,0.07);
        }
        .reg-form-inner {
          width: 100%;
          max-width: 370px;
          padding: 2.2rem 1.2rem;
          border-radius: 20px;
          background: rgba(255,255,255,1);
        }
        .reg-form-heading {
          font-weight: 700;
          color: #2b7cff;
          margin-bottom: 18px;
          text-align: center;
          font-size: 1.4rem;
        }
        .reg-btn-responsive {
          font-weight: 700;
          font-size: 1.1rem;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(44,62,80,0.09);
        }
        @media (max-width: 600px) {
          .reg-bg-responsive {
            align-items: flex-start;
            padding: 0;
          }
          .reg-card-responsive {
            flex-direction: column;
            max-width: 100vw;
            min-height: 0;
            border-radius: 0;
            box-shadow: none;
            background: transparent;
          }
          .reg-illustration-col {
            padding: 2.2rem 1.2rem 1.2rem 1.2rem;
            border-radius: 0;
          }
          .reg-title {
            font-size: 1.5rem;
            margin-bottom: 10px;
          }
          .reg-desc {
            font-size: 1rem;
          }
          .reg-form-col {
            border-radius: 0;
            box-shadow: 0 -2px 12px rgba(44,62,80,0.07);
            background: #fff;
            padding: 1.2rem 0.5rem 1.2rem 0.5rem;
          }
          .reg-form-inner {
            padding: 1.2rem 0.5rem;
            border-radius: 0;
            background: #fff;
          }
          .reg-form-heading {
            font-size: 1.2rem;
          }
          .reg-btn-responsive {
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  );
};

export default Login;