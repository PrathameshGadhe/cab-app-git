import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import jwt_decode from 'jwt-decode';

const AppNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm py-3" style={{ borderBottom: '1px solid #e5e7eb' }}>
      <Container>
        <Navbar.Brand onClick={() => navigate('/')} style={{ fontWeight: 700, fontSize: '1.7rem', color: '#2b7cff', letterSpacing: '1px', cursor: 'pointer' }}>
          <span style={{ color: '#222' }}>Cab</span><span style={{ color: '#2b7cff' }}>App</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
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