import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import './LandingPage.css';
import axios from 'axios';

// const [email, setEmail] = useState('');
// const [password, setPassword] = useState('');
// const [companyId, setCompanyId] = useState('');
// const [companyName, setCompanyName] = useState('');


// const handleLogin = async (e) => {
//   e.preventDefault();

//   const payload = {
//     email,
//     password,
//     role,
//     ...(role === 'user' && { companyId, companyName })
//   };

//   try {
//     const response = await axios.post('/auth/login', payload);
//     console.log('Login Success:', response.data);
//     alert('Login successful!');
//     setShowModal(false); // close modal
//     // Optionally store token: localStorage.setItem('token', response.data.token);
//   } catch (err) {
//     console.error('Login Failed:', err.response?.data || err.message);
//     alert('Login failed. Please check your credentials.');
//   }
// };


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

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleLogin = async () => {
    try {
      const loginData = {
        email,
        password,
        role
      };
  
      // Add companyId only if role is "user"
      if (role === 'user') {
        loginData.companyId = 'OM001'; // or get from form/input
      }
  
      // Select the correct endpoint
      const endpoint =
        role === 'company'
          ? 'http://localhost:5000/api/company/login'
          : 'http://localhost:5000/api/login';
  
      console.log("Sending login data:", loginData);
  
      const response = await axios.post(endpoint, loginData);
  
      console.log("Login Success:", response.data);
      // Handle success (e.g., redirect, set auth, etc.)
  
    } catch (error) {
      if (error.response) {
        console.log("Login Failed:", error.response.data);
        alert(error.response.data.message); // Optional UI alert
      } else {
        console.log("Login Error:", error.message);
        alert("Network error");
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
            <div className="mb-3">
              <label htmlFor="loginPassword" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="loginPassword"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Login as {role === 'user' ? 'User' : 'Company'}
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
      <footer className="footer-section py-4 bg-dark text-light">
        <div className="container text-center">
          <div className="mb-2">&copy; {new Date().getFullYear()} CabApp. All rights reserved.</div>
          <div>
            <a href="#" className="text-light mx-2">Privacy Policy</a>|
            <a href="#" className="text-light mx-2">Terms</a>|
            <a href="#" className="text-light mx-2">Contact</a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default LandingPage; 