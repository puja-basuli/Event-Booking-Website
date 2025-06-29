import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Event Booking</h3>
          <p>
            Book your next event with us! Whether it's a corporate meeting, a pool party, 
            or a private party, we have the perfect venue and services to make your 
            event unforgettable. Contact us today to learn more.
          </p>
        </div>
        <div className="footer-section logos">
          <h3>Connect</h3>
          <div className="logo-container">
            <i className="fa fa-facebook-official" aria-hidden="true"></i>
            <i className="fa fa-instagram" aria-hidden="true"></i>
            <i className="fa fa-linkedin" aria-hidden="true"></i>
            <i className="fa fa-twitter" aria-hidden="true"></i>
            
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
