import React from 'react';

const footerStyle = {
  width: '100%',
  background: 'linear-gradient(90deg, #e0e7ff 0%, #f8fafc 100%)',
  color: '#2b7cff',
  textAlign: 'center',
  fontWeight: 600,
  fontSize: '1.08rem',
  padding: '14px 0 10px 0',
  letterSpacing: '0.2px',
  borderTop: '1.5px solid #e0e7ff',
  boxShadow: '0 -1.5px 8px rgba(44,62,80,0.04)',
  position: 'relative',
  zIndex: 1200,
};

const mobileFooterStyle = {
  ...footerStyle,
  fontSize: '0.98rem',
  padding: '8px 0 6px 0',
  borderTop: 'none',
  boxShadow: 'none',
};

const Footer = () => {
  // Use window width to determine mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;
  return (
    <footer style={isMobile ? mobileFooterStyle : footerStyle}>
      Made with <span style={{color:'#ff4d4f', fontSize:'1.1em', margin:'0 4px'}}>❤️</span> by Team CabApp | Powered by Arkarz Technologies
    </footer>
  );
};

export default Footer; 