import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">JobSearch</div>
        <div className="footer-links">
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/privacy">Privacy</a>
        </div>
      </div>
      <div className="footer-copy">
        &copy; {new Date().getFullYear()} JobSearch. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
