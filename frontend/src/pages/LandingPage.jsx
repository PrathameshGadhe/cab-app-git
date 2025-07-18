import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const features = [
  {
    icon: '⚡',
    title: 'Lightning Fast Booking',
    desc: 'Book a cab in under 30 seconds with our streamlined SaaS platform.'
  },
  {
    icon: '🔒',
    title: 'Enterprise-Grade Security',
    desc: 'Your data and payments are protected with industry-leading security.'
  },
  {
    icon: '📱',
    title: 'Mobile First',
    desc: 'Seamless experience on any device, anywhere, anytime.'
  },
  {
    icon: '🤝',
    title: '24/7 Human Support',
    desc: 'Real people, real help, whenever you need it.'
  }
];

const highlights = [
  {
    icon: '🌐',
    title: 'Global Coverage',
    desc: 'Book rides in 100+ cities worldwide.'
  },
  {
    icon: '🧑‍💼',
    title: 'Business Solutions',
    desc: 'Corporate accounts, analytics, and expense management.'
  },
  {
    icon: '🧾',
    title: 'Instant Invoicing',
    desc: 'Get digital receipts and manage your ride history easily.'
  },
  {
    icon: '🎁',
    title: 'Rewards & Referrals',
    desc: 'Earn points and discounts for every ride and referral.'
  }
];

const howItWorks = [
  {
    icon: '1️⃣',
    title: 'Sign Up',
    desc: 'Create your account in seconds.'
  },
  {
    icon: '2️⃣',
    title: 'Book Instantly',
    desc: 'Enter your ride details and get matched instantly.'
  },
  {
    icon: '3️⃣',
    title: 'Track & Ride',
    desc: 'Track your cab in real-time and enjoy the journey.'
  },
  {
    icon: '4️⃣',
    title: 'Pay & Rate',
    desc: 'Pay securely and rate your experience.'
  }
];

const testimonials = [
  {
    name: 'Samantha R.',
    text: 'This is the best cab SaaS I’ve ever used. The booking is instant and the support is amazing!',
    avatar: '👩🏼‍💻',
    company: 'Acme Corp.'
  },
  {
    name: 'David K.',
    text: 'Our company switched to CabApp SaaS and productivity soared. Highly recommended!',
    avatar: '🧑🏽‍💼',
    company: 'Techify'
  },
  {
    name: 'Priya S.',
    text: 'I love the mobile experience and the security features. Five stars!',
    avatar: '👩🏾‍🎤',
    company: 'Startly'
  }
];

const pricing = [
  {
    plan: 'Starter',
    price: 'Free',
    features: ['Basic booking', 'Mobile access', 'Email support']
  },
  {
    plan: 'Pro',
    price: '$19/mo',
    features: ['Priority booking', 'Advanced analytics', '24/7 support', 'Custom branding']
  },
  {
    plan: 'Enterprise',
    price: 'Contact Us',
    features: ['Dedicated manager', 'Custom integrations', 'SLA & compliance', 'API access']
  }
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      {/* HERO SECTION */}
      <section className="d-flex align-items-center min-vh-100" style={{background: 'linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%)', paddingTop: 40, paddingBottom: 40}}>
        <div className="container">
          <div className="row align-items-center justify-content-between">
            <div className="col-12 col-lg-6 mb-5 mb-lg-0 text-center text-lg-start">
              <h1 className="display-2 fw-bold mb-3" style={{lineHeight: 1.1}}>
                <span style={{background: 'linear-gradient(90deg, #2b7cff 40%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>The SaaS for Cab Booking</span>
                <br />
                <span style={{color:'#222'}}>Modern. Fast. Secure.</span>
              </h1>
              <p className="lead mb-4" style={{fontSize:'1.35rem'}}>Empower your business or daily commute with the most advanced cab booking SaaS platform.</p>
              <div className="d-flex flex-column flex-sm-row gap-3 mb-3 justify-content-center justify-content-lg-start">
                <button className="btn btn-primary btn-lg px-4 shadow" onClick={() => navigate('/booking')}>Book Now</button>
                <button className="btn btn-outline-primary btn-lg px-4 shadow" onClick={() => navigate('/login')}>Login / Register</button>
                <button className="btn btn-outline-dark btn-lg px-4 shadow" onClick={() => navigate('/admin/login')}>Admin Login</button>
              </div>
            </div>
            <div className="col-12 col-lg-5 text-center">
              {/* Modern SaaS illustration (emoji for now) */}
              <span style={{fontSize:'7rem', display:'inline-block', filter:'drop-shadow(0 4px 24px rgba(44,62,80,0.10))'}}>🚕</span>
              <div style={{marginTop: 24, background:'rgba(255,255,255,0.7)', borderRadius: 18, boxShadow:'0 2px 12px rgba(44,62,80,0.07)', padding:'1.2rem 1.5rem', display:'inline-block', backdropFilter:'blur(6px)'}}>
                <span style={{fontWeight:600, color:'#2b7cff'}}>Book. Track. Arrive.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* APP HIGHLIGHTS SECTION */}
      <section className="py-5" style={{background:'#fff'}}>
        <div className="container">
          <div className="row justify-content-center mb-4">
            <div className="col-12 text-center">
              <h2 className="fw-bold mb-3">App Highlights</h2>
              <p className="text-muted">Discover what makes our platform unique and powerful.</p>
            </div>
          </div>
          <div className="row g-4 justify-content-center">
            {highlights.map((item, idx) => (
              <div className="col-12 col-sm-6 col-md-3" key={idx}>
                <div className="feature-card p-4 text-center h-100" style={{borderRadius:16, boxShadow:'0 2px 12px rgba(44,62,80,0.07)', background:'#f8fafc'}}>
                  <div className="feature-icon mb-3" style={{fontSize:'2.2rem', color:'#2b7cff'}}>{item.icon}</div>
                  <h5 className="fw-bold mb-2">{item.title}</h5>
                  <p className="text-muted mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-5" style={{background:'#f8fafc'}}>
        <div className="container">
          <div className="row justify-content-center mb-4">
            <div className="col-12 text-center">
              <h2 className="fw-bold mb-3">Why Choose Our SaaS?</h2>
              <p className="text-muted">Everything you need to run your cab business or commute smarter.</p>
            </div>
          </div>
          <div className="row g-4 justify-content-center">
            {features.map((feature, idx) => (
              <div className="col-12 col-sm-6 col-md-3" key={idx}>
                <div className="feature-card p-4 text-center h-100" style={{borderRadius:16, boxShadow:'0 2px 12px rgba(44,62,80,0.07)', background:'#fff', transition:'transform 0.18s', cursor:'pointer'}} onMouseOver={e => e.currentTarget.style.transform='scale(1.04)'} onMouseOut={e => e.currentTarget.style.transform='scale(1)'}>
                  <div className="feature-icon mb-3" style={{fontSize:'2.5rem', color:'#2b7cff'}}>{feature.icon}</div>
                  <h5 className="fw-bold mb-2">{feature.title}</h5>
                  <p className="text-muted mb-0">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS TIMELINE */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row justify-content-center mb-4">
            <div className="col-12 text-center">
              <h2 className="fw-bold mb-3">How It Works</h2>
              <p className="text-muted">From signup to ride, it’s all seamless.</p>
            </div>
          </div>
          <div className="row g-4 justify-content-center align-items-center">
            {howItWorks.map((step, idx) => (
              <div className="col-12 col-md-3" key={idx}>
                <div className="how-card p-4 text-center h-100" style={{borderRadius:16, boxShadow:'0 2px 12px rgba(44,62,80,0.07)', background:'#f8fafc'}}>
                  <div className="how-icon mb-3" style={{fontSize:'2.2rem', color:'#2b7cff'}}>{step.icon}</div>
                  <h5 className="fw-bold mb-2">{step.title}</h5>
                  <p className="text-muted mb-0">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GET THE APP SECTION */}
      <section className="py-5" style={{background:'#e0e7ff'}}>
        <div className="container">
          <div className="row justify-content-center mb-4">
            <div className="col-12 text-center">
              <h2 className="fw-bold mb-3">Get the App</h2>
              <p className="text-muted">Book, track, and manage rides on the go. Download now!</p>
              <div className="d-flex flex-wrap gap-3 justify-content-center mt-3">
                <button className="btn btn-dark px-4 py-2" style={{borderRadius: 10, fontWeight:600, fontSize:'1.1rem'}}>
                  <span style={{fontSize:'1.5rem', verticalAlign:'middle', marginRight:8}}>📱</span> App Store
                </button>
                <button className="btn btn-dark px-4 py-2" style={{borderRadius: 10, fontWeight:600, fontSize:'1.1rem'}}>
                  <span style={{fontSize:'1.5rem', verticalAlign:'middle', marginRight:8}}>🤖</span> Google Play
                </button>
                <button className="btn btn-outline-primary px-4 py-2" style={{borderRadius: 10, fontWeight:600, fontSize:'1.1rem'}}>
                  <span style={{fontSize:'1.5rem', verticalAlign:'middle', marginRight:8}}>💻</span> Web App
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-5" style={{background:'#f4f8fb'}}>
        <div className="container">
          <div className="row justify-content-center mb-4">
            <div className="col-12 text-center">
              <h2 className="fw-bold mb-3">What Our Customers Say</h2>
            </div>
          </div>
          <div className="row g-4 justify-content-center">
            {testimonials.map((t, idx) => (
              <div className="col-12 col-md-4" key={idx}>
                <div className="testimonial-card p-4 h-100 text-center" style={{borderRadius:16, boxShadow:'0 2px 12px rgba(44,62,80,0.07)', background:'#fff'}}>
                  <div className="testimonial-avatar mb-2" style={{fontSize:'2.2rem', background:'#eaf2ff', borderRadius:'50%', width:56, height:56, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto'}}>{t.avatar}</div>
                  <div className="testimonial-text mb-2" style={{fontStyle:'italic', color:'#444'}}>{t.text}</div>
                  <div className="testimonial-name fw-bold" style={{color:'#2b7cff'}}>{t.name}</div>
                  <div className="testimonial-company text-muted" style={{fontSize:'0.98rem'}}>{t.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING / BENEFITS */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row justify-content-center mb-4">
            <div className="col-12 text-center">
              <h2 className="fw-bold mb-3">Simple Pricing</h2>
              <p className="text-muted">Choose the plan that fits your needs. No hidden fees.</p>
            </div>
          </div>
          <div className="row g-4 justify-content-center">
            {pricing.map((plan, idx) => (
              <div className="col-12 col-md-4" key={idx}>
                <div className="p-4 text-center h-100" style={{borderRadius:18, boxShadow:'0 2px 12px rgba(44,62,80,0.07)', background:'#f8fafc', border: idx === 1 ? '2.5px solid #2b7cff' : 'none', transform: idx === 1 ? 'scale(1.04)' : 'none'}}>
                  <h4 className="fw-bold mb-2" style={{color:'#2b7cff'}}>{plan.plan}</h4>
                  <div className="display-5 fw-bold mb-3" style={{color:'#1a1a1a'}}>{plan.price}</div>
                  <ul className="list-unstyled mb-4">
                    {plan.features.map((f, i) => (
                      <li key={i} style={{marginBottom:8, color:'#222'}}><span style={{color:'#2b7cff', fontWeight:600}}>•</span> {f}</li>
                    ))}
                  </ul>
                  <button className="btn btn-primary px-4">{plan.plan === 'Starter' ? 'Get Started' : plan.plan === 'Pro' ? 'Upgrade' : 'Contact Sales'}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default LandingPage; 