import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import homeIcon from '../assets/icons/home.png';
import publicEyeIcon from '../assets/icons/public-eye.png';
import settingsIcon from '../assets/icons/settings.png';
import logo from '../assets/logo.png';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [panicModeEnabled, setPanicModeEnabled] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedTheme, setSelectedTheme] = useState('Light');

  const handleNavigation = (path) => {
    if (path === '/home') {
      navigate('/home');
    } else if (path === '/public-eye') {
      // Navigate to public eye page when implemented
      console.log('Public Eye navigation');
    }
  };

  const handleEditProfile = () => {
    // Navigate to profile edit page
    console.log('Edit profile clicked');
  };

  const handleChangePassword = () => {
    // Navigate to change password page
    console.log('Change password clicked');
  };

  const handleLanguageChange = () => {
    // Show language selection modal
    console.log('Language change clicked');
  };

  const handleThemeChange = () => {
    // Toggle theme
    setSelectedTheme(selectedTheme === 'Light' ? 'Dark' : 'Light');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="settings-container">
      <div className="settings-card">
        <div className="settings-header">
          <h1>Settings</h1>
        </div>

        <div className="settings-content">
          {/* User Profile Section */}
          <div className="user-profile-section">
            <div className="user-profile-info">
              <img src={logo} alt="Profile" className="profile-avatar" />
              <div className="user-details">
                <h3>{user?.name || 'Ujjal Basnet'}</h3>
                <p>{user?.email || 'ujjalbasnet869@gmail.com'}</p>
              </div>
            </div>
            <button className="edit-profile-btn" onClick={handleEditProfile}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
          </div>

          {/* User Settings Section */}
          <div className="settings-section">
            <h2>User Settings</h2>
            
            <div className="setting-item" onClick={handleChangePassword}>
              <div className="setting-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </div>
              <span className="setting-label">Change Password</span>
            </div>

            <div className="setting-item">
              <div className="setting-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.27.16.22.11.54-.12.7-.23.16-.54.11-.7-.12-.9-1.29-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4.01-1.36.69-2.5 1.65-3.4 2.94-.08.14-.23.21-.39.21z"/>
                </svg>
              </div>
              <span className="setting-label">Biometric Login</span>
              <div className="setting-toggle">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={biometricEnabled}
                    onChange={(e) => setBiometricEnabled(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                </svg>
              </div>
              <span className="setting-label">Notifications</span>
              <div className="setting-toggle">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Panic Mode Section */}
          <div className="panic-mode-section">
            <div className="setting-item">
              <span className="setting-label">Panic Mode</span>
              <div className="setting-toggle">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={panicModeEnabled}
                    onChange={(e) => setPanicModeEnabled(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
            <p className="panic-mode-note">
              Note: Please turn off or disable battery saver mode while panic mode is enabled. 
              Also please do not swipe off and close app from memory for better user experience.
            </p>
          </div>

          {/* App Settings Section */}
          <div className="settings-section">
            <h2>App Settings</h2>
            
            <div className="setting-item" onClick={handleLanguageChange}>
              <div className="setting-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
                </svg>
              </div>
              <span className="setting-label">Language</span>
              <span className="setting-value">{selectedLanguage}</span>
            </div>

            <div className="setting-item" onClick={handleThemeChange}>
              <div className="setting-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                </svg>
              </div>
              <span className="setting-label">Theme</span>
              <span className="setting-value">{selectedTheme}</span>
            </div>
          </div>

          {/* Logout Button */}
          <div className="logout-section">
            <button className="logout-btn" onClick={handleLogout}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="settings-bottom-nav">
          <button
            className="settings-nav-btn"
            onClick={() => handleNavigation('/home')}
          >
            <img src={homeIcon} alt="Home" />
            <span>Home</span>
          </button>
          <button
            className="settings-nav-btn"
            onClick={() => handleNavigation('/public-eye')}
          >
            <img src={publicEyeIcon} alt="Public Eye" />
            <span>Public Eye</span>
          </button>
          <button className="settings-nav-btn active">
            <img src={settingsIcon} alt="Settings" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
