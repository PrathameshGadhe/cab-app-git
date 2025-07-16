import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './LandingPage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';


const features = [
  {
    icon: '🚗',
    title: 'Easy Booking',
    desc: 'Book a cab in just a few clicks with our user-friendly interface.'
  },
  {
    icon: '🕒',
    title: '24/7 Service',
    desc: 'We are available round the clock to serve your travel needs.'
  },
  {
    icon: '💳',
    title: 'Secure Payments',
    desc: 'Multiple payment options with complete security.'
  }
];

const howItWorks = [
  {
    icon: '📱',
    title: 'Book',
    desc: 'Open the app and book your ride in seconds.'
  },
  {
    icon: '🚕',
    title: 'Ride',
    desc: 'Meet your driver and enjoy a safe journey.'
  },
  {
    icon: '🏁',
    title: 'Arrive',
    desc: 'Reach your destination and pay securely.'
  }
];

const testimonials = [
  {
    name: 'Amit S.',
    text: 'CabApp made my daily commute so much easier. Fast, reliable, and always on time!',
    avatar: '🧑🏻'
  },
  {
    name: 'Priya K.',
    text: 'I love the simple booking process and the friendly drivers. Highly recommended!',
    avatar: '👩🏽'
  },
  {
    name: 'Rahul D.',
    text: 'The best cab service in the city. Secure payments and great support!',
    avatar: '🧑🏾'
  }
];

const LandingPage = () => {





  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/booking');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    console.log("Login button clicked");
    e.preventDefault();
    try {
      const loginData = {
        email,
        password,
        role,
        companyName,
        companyId
      };
      // Show loading message (optional)
      // Select the correct endpoint
      const endpoint =
        role === "company"
          ? "http://localhost:5000/api/company/login"
          : "http://localhost:5000/api/login";
      const response = await axios.post(endpoint, loginData);
      // Store token for both user and company
      localStorage.setItem('token', response.data.token);
      toast.success("Login successful!");
      if (role === "user") {
        navigate("/booking");
      } else if (role === "company") {
        navigate("/company-dashboard");
      }
    } catch (error) {
      if (error.response) {
        console.log("Login Failed:", error.response.data);
        toast.error(error.response.data.message || "Invalid credentials");
      } else {
        console.log("Login Error:", error.message);
        toast.error("Network error, please try again!");
      }
    }
  };
  


  return (
    <>
      <Navbar />
      {/* HERO SECTION WITH ENHANCED PHRASE */}
      <section className="hero-section d-flex align-items-center min-vh-100">
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-12 col-lg-6 text-center text-lg-start mb-4 mb-lg-0">
              <h1 className="display-3 fw-bold mb-3 hero-title">
                Your Journey,
                <span className="hero-highlight ms-2">Our Priority</span>
              </h1>
              <p className="lead mb-4">Book a cab instantly, track your ride, and enjoy a safe, comfortable journey with CabApp.</p>
              <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3 mb-3">
                <a className="btn btn-primary btn-lg px-4" href="#">Book Now</a>
                <a className="btn btn-outline-secondary btn-lg px-4" href="#">Learn More</a>
                <button className="btn btn-warning btn-lg px-4" onClick={handleOpenModal}>Login</button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Login Modal */}


      {showModal && (
  <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.4)' }}>
    <div className="modal-dialog modal-dialog-centered" role="document">
      <div className="modal-content">
        <div className="modal-header border-0">
          <h5 className="modal-title">Login</h5>
          <button type="button" className="btn-close" aria-label="Close" onClick={handleCloseModal}></button>
        </div>
        <div className="modal-body">
          <ul className="nav nav-tabs mb-3 justify-content-center" role="tablist">
            <li className="nav-item" role="presentation">
              <button className={`nav-link ${role === 'user' ? 'active' : ''}`} onClick={() => setRole('user')} type="button">User</button>
            </li>
            <li className="nav-item" role="presentation">
              <button className={`nav-link ${role === 'company' ? 'active' : ''}`} onClick={() => setRole('company')} type="button">Company</button>
            </li>
          </ul>
          <form onSubmit={handleLogin}>
            {role === 'user' && (
              <>
                <div className="mb-3">
                  <label htmlFor="loginCompanyId" className="form-label">Company ID</label>
                  <input
                    type="text"
                    className="form-control"
                    id="loginCompanyId"
                    placeholder="Enter Company ID"
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="loginCompanyName" className="form-label">Company Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="loginCompanyName"
                    placeholder="Enter Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              </>
            )}
            <div className="mb-3">
              <label htmlFor="loginEmail" className="form-label">Email address</label>
              <input
                type="email"
                className="form-control"
                id="loginEmail"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3" style={{ position: 'relative' }}>
              <label htmlFor="loginPassword" className="form-label">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                id="loginPassword"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '38px',
                  cursor: 'pointer',
                  fontSize: '1.3rem',
                  color: '#888',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.03-10-7 0-1.13.37-2.19 1.025-3.13M6.22 6.22A9.956 9.956 0 0112 5c5.523 0 10 4.03 10 7 0 1.61-.81 3.13-2.18 4.37M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 9l-18-18" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm7 0c0 2.97-4.477 7-10 7S2 14.97 2 12s4.477-7 10-7 10 4.03 10 7z" /></svg>
                )}
              </span>
            </div>
            <button type="submit" className="btn btn-primary w-100 mb-2">
              Login as {role === 'user' ? 'User' : 'Company'}
            </button>
            <button type="button" className="btn btn-outline-secondary w-100" onClick={handleCloseModal}>
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
)}



      {/* HOW IT WORKS SECTION */}
      <section className="how-it-works-section py-5">
        <div className="container">
          <h2 className="text-center fw-bold mb-5">How It Works</h2>
          <div className="row justify-content-center">
            {howItWorks.map((step, idx) => (
              <div className="col-12 col-md-4 mb-4 mb-md-0 text-center" key={idx}>
                <div className="how-card p-4 h-100">
                  <div className="how-icon mb-3 display-4">{step.icon}</div>
                  <h5 className="fw-bold mb-2">{step.title}</h5>
                  <p className="text-muted mb-0">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* FEATURES SECTION */}
      <section className="features-section py-5 bg-light">
        <div className="container">
          <div className="row text-center">
            {features.map((feature, idx) => (
              <div className="col-12 col-md-4 mb-4 mb-md-0" key={idx}>
                <div className="feature-card p-4 h-100">
                  <div className="feature-icon mb-3 display-4">{feature.icon}</div>
                  <h5 className="fw-bold mb-2">{feature.title}</h5>
                  <p className="text-muted mb-0">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* TESTIMONIALS SECTION */}
      <section className="testimonials-section py-5">
        <div className="container">
          <h2 className="text-center fw-bold mb-5">What Our Users Say</h2>
          <div className="row justify-content-center">
            {testimonials.map((t, idx) => (
              <div className="col-12 col-md-4 mb-4 mb-md-0" key={idx}>
                <div className="testimonial-card p-4 h-100 text-center">
                  <div className="testimonial-avatar mb-3" style={{fontSize: '2.5rem'}}>{t.avatar}</div>
                  <p className="testimonial-text mb-2">"{t.text}"</p>
                  <div className="testimonial-name fw-bold">{t.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA SECTION */}
      <section className="cta-section py-5">
        <div className="container text-center">
          <h2 className="fw-bold mb-3">Ready to ride?</h2>
          <p className="lead mb-4">Sign up now and experience the best cab booking service in your city.</p>
          <a className="btn btn-success btn-lg px-5" href="#">Get Started</a>
        </div>
      </section>
      {/* FOOTER */}
      <Footer />
    </>
  );
};

export default LandingPage; 