import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import homeIcon from '../assets/icons/home.png';
import publicEyeIcon from '../assets/icons/public-eye.png';
import settingsIcon from '../assets/icons/settings.png';
import { FiEdit2, FiKey, FiLogOut } from 'react-icons/fi';
import { IoLanguage, IoColorPalette } from 'react-icons/io5';
import { MdOutlineNotifications } from 'react-icons/md';
import { RiFingerprint2Line } from 'react-icons/ri';
import { FaComment, FaShieldAlt, FaBookOpen, FaQuestionCircle, FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Settings.css';

const defaultSettings = {
  theme: 'Light',
  language: 'English',
  biometric: false,
  notifications: false,
  panicMode: false
};

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [settings, setSettings] = useState(defaultSettings);

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = async () => {
    try {
      // Show confirmation dialog for security
      const confirmLogout = window.confirm(
        'Are you sure you want to log out? This will clear all your local data and end your session.'
      );

      if (!confirmLogout) {
        return;
      }

      console.log('User confirmed logout');

      // Call the enhanced logout function
      await logout();

      // Force page reload to ensure complete cleanup
      window.location.href = '/login';

    } catch (error) {
      console.error('Error logging out:', error);

      // Fallback: force navigation even if logout fails
      window.location.href = '/login';
    }
  };

  // SocialLink component for Stay Connected card
  const SocialLink = ({ href, children, ...props }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );

  return (
    <div className="settings home-container">
      <div className="home-card">
        <div className="settings-content">
          <h1 className="settings-title">Settings</h1>

        {/* User Profile Card - Only show for authenticated users */}
        {isAuthenticated && (
          <div className="profile-card">
            <div className="profile-info">
              <img
                src={user?.profilePhoto || logo}
                alt="Profile"
                className="profile-avatar"
              />
              <div className="profile-details">
                <h2 className="profile-name">{user?.name || 'Ujjal Basnet'}</h2>
                <p className="profile-email">{user?.email || 'ujjalbasnet869@gmail.com'}</p>
              </div>
              <button className="settings-edit-btn" onClick={() => navigate('/edit-profile')}>
                <FiEdit2 size={20} color="#666" />
              </button>
            </div>
          </div>
        )}

        {/* User Settings Card - Only show for authenticated users */}
        {isAuthenticated && (
          <div className="settings-card">
            <div className="card-header">
              <h2 className="card-title">User Settings</h2>
            </div>
            <div className="card-content-spacey">
              {/* Change Password */}
              <div className="setting-item" onClick={() => navigate('/change-password')}>
                <FiKey className="setting-icon" size={20} />
                <span className="setting-label">Change Password</span>
                <svg className="chevron-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              {/* Biometric Login */}
              <div className="setting-item">
                <RiFingerprint2Line className="setting-icon" size={20} />
                <span className="setting-label">Biometric Login</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    className="toggle-input"
                    checked={settings.biometric}
                    onChange={() => updateSetting('biometric', !settings.biometric)}
                  />
                  <span className="toggle-background">
                    <span className="toggle-slider"></span>
                  </span>
                </label>
              </div>
              {/* Notifications */}
              <div className="setting-item">
                <MdOutlineNotifications className="setting-icon" size={20} />
                <span className="setting-label">Notifications</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    className="toggle-input"
                    checked={settings.notifications}
                    onChange={() => updateSetting('notifications', !settings.notifications)}
                  />
                  <span className="toggle-background">
                    <span className="toggle-slider"></span>
                  </span>
                </label>
              </div>
              {/* Panic Mode */}
              <div className="setting-item">
                <FaExclamationTriangle className="setting-icon" size={20} />
                <span className="setting-label">Panic Mode</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    className="toggle-input"
                    checked={settings.panicMode}
                    onChange={() => updateSetting('panicMode', !settings.panicMode)}
                  />
                  <span className="toggle-background">
                    <span className="toggle-slider"></span>
                  </span>
                </label>
              </div>
              {/* Panic Mode Note */}
              <div className="panic-note">
                <p className="panic-note-text">
                  Note: Please turn off or disable battery saver mode while panic mode is enabled. Also please do not swipe off and close app from memory for better user experience.
                </p>
              </div>
            </div>
          </div>
        )}



        {/* App Settings Card */}
        <div className="settings-card">
          <div className="card-header">
            <h2 className="card-title">App Settings</h2>
          </div>
          <div className="card-content-spacey">
            {/* Language */}
            <div className="setting-item">
              <IoLanguage className="setting-icon" size={20} />
              <span className="setting-label">Language</span>
              <span className="setting-value">{settings.language}</span>
              <svg className="chevron-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            {/* Dark Mode */}
            <div className="setting-item">
              <IoColorPalette className="setting-icon" size={20} />
              <span className="setting-label">Dark Mode</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  className="toggle-input"
                  checked={isDarkMode}
                  onChange={handleThemeToggle}
                />
                <span className="toggle-background">
                  <span className="toggle-slider"></span>
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Help Desk Card */}
        <div className="settings-card">
          <div className="card-header">
            <h2 className="card-title">Help Desk</h2>
          </div>
          <div className="card-content-spacey">
            {/* Feedback */}
            <div className="setting-item" onClick={() => navigate('/feedback')}>
              <FaComment className="setting-icon" size={20} />
              <span className="setting-label">Feedback</span>
              <svg className="chevron-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            {/* Privacy Policy */}
            <div className="setting-item">
              <FaShieldAlt className="setting-icon" size={20} />
              <span className="setting-label">Privacy Policy</span>
              <svg className="chevron-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            {/* User Guide */}
            <div className="setting-item" onClick={() => navigate('/user-guide')}>
              <FaBookOpen className="setting-icon" size={20} />
              <span className="setting-label">User Guide</span>
              <svg className="chevron-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            {/* FAQ */}
            <div className="setting-item" onClick={() => navigate('/faq')}>
              <FaQuestionCircle className="setting-icon" size={20} />
              <span className="setting-label">Frequently Asked Questions</span>
              <svg className="chevron-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Logout Card - Only show for authenticated users */}
        {isAuthenticated && (
          <div className="settings-card">
            <div className="card-content">
              <button
                onClick={handleLogout}
                className="logout-button"
              >
                <FiLogOut className="logout-icon" size={20} />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}

        {/* Login Card - Only show for non-authenticated users */}
        {!isAuthenticated && (
          <div className="settings-card">
            <div className="card-content">
              <button
                onClick={() => navigate('/login')}
                className="logout-button"
              >
                <FiLogOut className="logout-icon" size={20} />
                <span>Log in</span>
              </button>
            </div>
          </div>
        )}

        {/* Stay Connected Card */}
        <div className="settings-card">
          <div className="card-header">
            <h2 className="card-title">Stay connected</h2>
          </div>
          <div className="card-content">
            <div className="social-buttons">
              <SocialLink href="https://www.facebook.com/NepalPolicePHQ" className="social-button social-facebook">
                <FaFacebookF color="white" size={20} />
              </SocialLink>
              <SocialLink href="https://www.instagram.com/nepalpolice/" className="social-button social-instagram">
                <FaInstagram color="white" size={20} />
              </SocialLink>
              <SocialLink href="https://twitter.com//NepalPoliceHQ" className="social-button social-twitter">
                <FaTwitter color="white" size={20} />
              </SocialLink>
              <SocialLink href="https://youtube.com/NepalPoliceHQ" className="social-button social-youtube">
                <FaYoutube color="white" size={20} />
              </SocialLink>
            </div>
          </div>
        </div>
        </div>

        {/* Bottom Navigation - Match Home page structure */}
        <div className="custom-bottom-nav">
          <button className="nav-btn" onClick={() => navigate('/home')}>
            <img src={homeIcon} alt="Home" />
            <span>Home</span>
          </button>
          <div className="nav-spacer"></div>
          <button className="home-nav-btn active">
            <img src={settingsIcon} alt="Settings" />
            <span>Settings</span>
          </button>

          {/* FAB positioned absolutely relative to navigation */}
          <div className="settings-fab-center" onClick={() => navigate('/public-eye')}>
            <img src={publicEyeIcon} alt="Public Eye" />
          </div>
          <div className="settings-fab-label">Public Eye</div>
        </div>
      </div>
    </div>
  );
};

export default Settings;