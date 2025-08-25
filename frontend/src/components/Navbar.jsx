import React, { useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import jwt_decode from 'jwt-decode';
import { FaBars } from 'react-icons/fa';

const AppNavbar = ({ showAdminHamburger, sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mainMenuOpen, setMainMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  let userRole = null;
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwt_decode(token);
      userRole = decoded.role;
    } catch (e) {
      userRole = null;
    }
  }

  // Custom hamburger for Bootstrap Navbar
  const MainMenuHamburger = (
    <button
      className="admin-hamburger"
      style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', marginLeft: 12, zIndex: 1101 }}
      aria-label="Open main menu"
      onClick={() => setMainMenuOpen((open) => !open)}
      type="button"
    >
      <FaBars />
    </button>
  );

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm py-3" style={{ borderBottom: '1px solid #e5e7eb', position: 'relative' }} expanded={mainMenuOpen} onToggle={setMainMenuOpen}>
      <Container style={{ position: 'relative' }}>
        <Navbar.Brand onClick={() => navigate('/')} style={{ fontWeight: 700, fontSize: '1.7rem', color: '#2b7cff', letterSpacing: '1px', cursor: 'pointer' }}>
          <span style={{ color: '#222' }}>Cab</span><span style={{ color: '#2b7cff' }}>App</span>
        </Navbar.Brand>
        {/* Custom hamburger for main menu (right side, only on mobile) */}
        <div className="d-lg-none" style={{ position: 'absolute', right: 0, top: 0, height: '100%', display: 'flex', alignItems: 'center' }}>
          {!sidebarOpen && MainMenuHamburger}
        </div>
        <Navbar.Collapse id="basic-navbar-nav" in={mainMenuOpen} onClick={() => setMainMenuOpen(false)}>
          <Nav className="me-auto" style={{ fontWeight: 500, fontSize: '1.1rem' }}>
            <Nav.Link onClick={() => navigate('/')} active={location.pathname === '/'} style={{ color: location.pathname === '/' ? '#2b7cff' : '#222', marginRight: 16 }}>Home</Nav.Link>
            <Nav.Link onClick={() => navigate('/booking')} active={location.pathname === '/booking'} style={{ color: location.pathname === '/booking' ? '#2b7cff' : '#222', marginRight: 16 }}>Booking</Nav.Link>
            {localStorage.getItem('token') && (
              <>
                <Nav.Link onClick={() => navigate('/profile')} active={location.pathname === '/profile'} style={{ color: location.pathname === '/profile' ? '#2b7cff' : '#222', marginRight: 16 }}>Profile</Nav.Link>
                <Nav.Link onClick={() => navigate('/history')} active={location.pathname === '/history'} style={{ color: location.pathname === '/history' ? '#2b7cff' : '#222', marginRight: 16 }}>Ride History</Nav.Link>
              </>
            )}
            {/* Only show Dashboard tab for company role */}
            {userRole === 'company' && (
              <Nav.Link onClick={() => navigate('/company-dashboard')} active={location.pathname === '/company-dashboard'} style={{ color: location.pathname === '/company-dashboard' ? '#2b7cff' : '#222' }}>Dashboard</Nav.Link>
            )}
          </Nav>
          {localStorage.getItem('token') && (
            <Button variant="outline-primary" onClick={handleLogout} style={{ fontWeight: 600, borderRadius: 8, border: '1px solid #2b7cff', color: '#2b7cff' }}>
              Log Out
            </Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar; 