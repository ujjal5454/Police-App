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
import { FaComment, FaShieldAlt, FaBookOpen, FaQuestionCircle, FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

const defaultSettings = {
  theme: 'Light',
  language: 'English',
  biometric: false,
  notifications: true,
  panicMode: false
};

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState(defaultSettings);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <h1 className="settings-title">Settings</h1>

        {/* User Profile Card */}
        <div className="profile-card">
          <div className="profile-info">
            <img 
              src={logo} 
              alt="Profile"
              className="profile-avatar"
            />
            <div className="profile-details">
              <h2 className="profile-name">{user?.name || 'Ujjal Basnet'}</h2>
              <p className="profile-email">{user?.email || 'ujjalbasnet869@gmail.com'}</p>
            </div>
            <button className="settings-edit-btn">
              <FiEdit2 size={20} color="#666" />
            </button>
          </div>
        </div>

        {/* User Settings Card */}
        <div className="settings-card">
          <div className="card-header">
            <h2 className="card-title">User Settings</h2>
          </div>
          <div className="card-content-spacey">
            {/* Change Password */}
            <div className="setting-item">
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
                <div className="toggle-background"></div>
                <div className="toggle-slider"></div>
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
                <div className="toggle-background"></div>
                <div className="toggle-slider"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Panic Mode Card */}
        <div className="settings-card">
          <div className="card-content">
            <div className="setting-item" style={{ marginBottom: '0.75rem' }}>
              <span className="card-title">Panic Mode</span>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  className="toggle-input" 
                  checked={settings.panicMode} 
                  onChange={() => updateSetting('panicMode', !settings.panicMode)} 
                />
                <div className="toggle-background"></div>
                <div className="toggle-slider"></div>
              </label>
            </div>
            <div className="panic-note">
              <p className="panic-note-text">
                Note: Please turn off or disable battery saver mode while panic mode is enabled. Also please do not swipe off and close app from memory for better user experience.
              </p>
            </div>
          </div>
        </div>

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
            {/* Theme */}
            <div className="setting-item">
              <IoColorPalette className="setting-icon" size={20} />
              <span className="setting-label">Theme</span>
              <span className="setting-value">{settings.theme}</span>
              <svg className="chevron-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
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
            <div className="setting-item">
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
            <div className="setting-item">
              <FaBookOpen className="setting-icon" size={20} />
              <span className="setting-label">User Guide</span>
              <svg className="chevron-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            {/* FAQ */}
            <div className="setting-item">
              <FaQuestionCircle className="setting-icon" size={20} />
              <span className="setting-label">Frequently Asked Questions</span>
              <svg className="chevron-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Logout Card */}
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

        {/* Stay Connected Card */}
        <div className="settings-card">
          <div className="card-header">
            <h2 className="card-title">Stay connected</h2>
          </div>
          <div className="card-content">
            <div className="social-buttons">
              <button className="social-button social-facebook">
                <FaFacebookF color="white" size={20} />
              </button>
              <button className="social-button social-instagram">
                <FaInstagram color="white" size={20} />
              </button>
              <button className="social-button social-twitter">
                <FaTwitter color="white" size={20} />
              </button>
              <button className="social-button social-youtube">
                <FaYoutube color="white" size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Navigation - Inside card */}
        <div className="custom-bottom-nav">
          <button className="nav-btn" onClick={() => navigate('/home')}>
            <img src={homeIcon} alt="Home" />
            <span>Home</span>
          </button>
          <div className="fab-center" onClick={() => navigate('/public-eye')}>
            <img src={publicEyeIcon} alt="Public Eye" />
          </div>
          <div className="fab-label">Public Eye</div>
          <button className="home-nav-btn active">
            <img src={settingsIcon} alt="Settings" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;