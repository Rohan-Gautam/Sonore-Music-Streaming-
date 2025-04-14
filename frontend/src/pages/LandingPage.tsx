import React, { useEffect } from 'react';
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const LandingPage = () => {
  const navigate = useNavigate();

  // Redirect to dashboard if authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="landing-container">
      <header className="landing-header">
        <img src="/banner.jpg" alt="Banner" className="banner-image" />
        <h1>Welcome to Sonore</h1>
        <p>Your favorite music, anytime, anywhere.</p>
        <div className="landing-buttons">
          <a href="/login" className="btn-primary">
            <FaSignInAlt style={{ marginRight: '0.5rem' }} /> Login
          </a>
          <a href="/register" className="btn-secondary">
            <FaUserPlus style={{ marginRight: '0.5rem' }} /> Sign Up
          </a>
        </div>
      </header>
    </div>
  );
};

export default LandingPage;
