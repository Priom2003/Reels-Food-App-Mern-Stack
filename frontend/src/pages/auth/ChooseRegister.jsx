import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/auth-shared.css';

const ChooseRegister = () => {
  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <header className="auth-header">
          <h1 id="choose-register-title" className="auth-title">Register</h1>
          <p className="auth-subtitle">Pick how you want to join the platform.</p>
        </header>
        <div className="auth-options">
          <Link to="/user/register" className="auth-option-card">
            <div className="auth-option-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="auth-option-title">Normal User</h3>
            <p className="auth-option-description">Join as a regular user to explore and enjoy content.</p>
          </Link>
          <Link to="/food-partner/register" className="auth-option-card">
            <div className="auth-option-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v10h2V6h2V4h-4z" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="auth-option-title">Food Partner</h3>
            <p className="auth-option-description">Partner with us to share your culinary creations.</p>
          </Link>
        </div>
        <div className="auth-alt-action">
          Already have an account? <Link to="/user/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default ChooseRegister;