import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './ChangePassword.css';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleBack = () => {
    navigate('/settings');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[#@!%&*]/.test(password);

    return password.length >= minLength && hasUpperCase && hasNumber && hasSpecialChar;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (!validatePassword(formData.newPassword)) {
      setError('Password must be minimum 8 characters and should contain 1 uppercase, 1 number and 1 special character like #,@,!,% etc.');
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirm password do not match');
      setLoading(false);
      return;
    }

    if (formData.oldPassword === formData.newPassword) {
      setError('New password must be different from old password');
      setLoading(false);
      return;
    }

    try {
      await axios.patch(
        'http://localhost:5000/api/auth/change-password',
        {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        },
        { withCredentials: true }
      );

      setSuccess('Password changed successfully!');
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Redirect to settings after 2 seconds
      setTimeout(() => {
        navigate('/settings');
      }, 2000);

    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-card">
        {/* Header */}
        <div className="change-password-header">
          <button className="back-button" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="white"/>
            </svg>
          </button>
          <h1>Change Password</h1>
          <div className="header-spacer"></div>
        </div>

        {/* Content */}
        <div className="change-password-content">
          {/* Password Icon */}
          <div className="password-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="11" width="18" height="10" rx="2" ry="2" stroke="#0088cc" strokeWidth="2"/>
              <circle cx="12" cy="16" r="1" fill="#0088cc"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#0088cc" strokeWidth="2"/>
            </svg>
          </div>

          {/* Password Requirements Note */}
          <div className="password-note">
            <p>Note: Password must be minimum 8 characters and should contain 1 uppercase, 1 number and 1 special character like #,@,!,% etc.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="change-password-form">
            {/* Old Password */}
            <div className="input-group">
              <input
                type={showPasswords.old ? "text" : "password"}
                name="oldPassword"
                placeholder="Old Password"
                value={formData.oldPassword}
                onChange={handleInputChange}
                className="password-input"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('old')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  {showPasswords.old ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="#666" strokeWidth="2"/>
                      <path d="M1 1l22 22" stroke="#666" strokeWidth="2"/>
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#666" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="3" stroke="#666" strokeWidth="2"/>
                    </>
                  )}
                </svg>
              </button>
            </div>

            {/* New Password */}
            <div className="input-group">
              <input
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                placeholder="New Password"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="password-input"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('new')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  {showPasswords.new ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="#666" strokeWidth="2"/>
                      <path d="M1 1l22 22" stroke="#666" strokeWidth="2"/>
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#666" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="3" stroke="#666" strokeWidth="2"/>
                    </>
                  )}
                </svg>
              </button>
            </div>

            {/* Confirm Password */}
            <div className="input-group">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="password-input"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  {showPasswords.confirm ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="#666" strokeWidth="2"/>
                      <path d="M1 1l22 22" stroke="#666" strokeWidth="2"/>
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#666" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="3" stroke="#666" strokeWidth="2"/>
                    </>
                  )}
                </svg>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="success-message">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Changing...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
