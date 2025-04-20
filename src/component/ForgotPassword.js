import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';
import { ReactComponent as EmailIcon } from '../assets/icons/email.svg';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Handle password reset logic here
    console.log('Password reset requested for:', email);
    // You can add your API call here
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <button className="back-button" onClick={() => navigate('/')}>
            ←
          </button>
          <h1>Forgot Password</h1>
        </div>

        <div className="forgot-password-content">
          <div className="email-icon">
            <EmailIcon />
          </div>
          
          <p className="instruction-text">
            Enter your registered email address to receive a verification code.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="email"
                placeholder="Email/Computer Code"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                required
                className={error ? 'error' : ''}
              />
              {error && <div className="error-message">{error}</div>}
            </div>

            <button type="submit" className="send-button">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 