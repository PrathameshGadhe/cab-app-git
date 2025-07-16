import React from 'react';

const Footer = () => (
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
);

export default Footer; 