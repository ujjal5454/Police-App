import React, { useState } from 'react';
import { FaUserEdit, FaLock, FaFingerprint, FaBell, FaLanguage, FaPalette, FaExclamationTriangle, FaSignOutAlt } from 'react-icons/fa';
import logo from '../assets/logo.png';
import BottomNavigation from './BottomNavigation';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State for toggles and modals
  const [biometric, setBiometric] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [panicMode, setPanicMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [language, setLanguage] = useState('English');
  const [theme, setTheme] = useState('Light');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  // Password modal state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Handlers
  const handlePasswordChange = (e) => {
    e.preventDefault();
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    alert('Password changed!');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="home-container">
      <div className="home-card">
        {/* Header */}
        <div className="home-header">
          <div className="logo-section">
            <div className="logo-text-section">
              <img src={logo} alt="Logo" className="logo" />
              <div className="header-actions">
                <button className="notification-btn" title="Edit Profile">
                  <FaUserEdit size={22} />
                </button>
              </div>
            </div>
            <div className="header-text">
              <h1>{user?.name || 'User'}</h1>
              <p>{user?.email || ''}</p>
            </div>
          </div>
        </div>

        {/* User Settings */}
        <div className="mt-4 px-2">
          <div className="text-lg font-semibold text-gray-700 mb-2">User Settings</div>
          <div className="bg-white rounded-lg shadow divide-y">
            <button
              className="flex items-center w-full px-4 py-3 hover:bg-gray-50 focus:outline-none"
              onClick={() => setShowPasswordModal(true)}
            >
              <FaLock className="text-gray-500 mr-4" size={20} />
              <span className="flex-1 text-left">Change Password</span>
            </button>
            <div className="flex items-center px-4 py-3">
              <FaFingerprint className="text-gray-500 mr-4" size={20} />
              <span className="flex-1">Biometric Login</span>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={biometric} onChange={() => setBiometric(!biometric)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
                <div className={`absolute ml-[-2.2rem] mt-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${biometric ? 'translate-x-5' : ''}`}></div>
              </label>
            </div>
            <div className="flex items-center px-4 py-3">
              <FaBell className="text-gray-500 mr-4" size={20} />
              <span className="flex-1">Notifications</span>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={notifications} onChange={() => setNotifications(!notifications)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
                <div className={`absolute ml-[-2.2rem] mt-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${notifications ? 'translate-x-5' : ''}`}></div>
              </label>
            </div>
          </div>
        </div>

        {/* Panic Mode */}
        <div className="mt-4 px-2">
          <div className="text-lg font-semibold text-gray-700 mb-2">Panic Mode</div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-4" size={22} />
            <span className="flex-1">Panic Mode</span>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={panicMode} onChange={() => setPanicMode(!panicMode)} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-red-600 transition-all"></div>
              <div className={`absolute ml-[-2.2rem] mt-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${panicMode ? 'translate-x-5' : ''}`}></div>
            </label>
          </div>
          <div className="bg-gray-200 text-gray-700 text-sm rounded-lg p-3 mt-2">
            Please turn off or disable battery saver mode while panic mode is enabled. Also please do not swipe off and close app from memory for better user experience.
          </div>
        </div>

        {/* App Settings */}
        <div className="mt-4 px-2">
          <div className="text-lg font-semibold text-gray-700 mb-2">App Settings</div>
          <div className="bg-white rounded-lg shadow divide-y">
            <div className="flex items-center px-4 py-3">
              <FaLanguage className="text-gray-500 mr-4" size={20} />
              <span className="flex-1">Language</span>
              <button
                className="bg-gray-100 px-3 py-1 rounded text-gray-700 hover:bg-gray-200"
                onClick={() => setShowLanguageModal(true)}
              >
                {language}
              </button>
            </div>
            <div className="flex items-center px-4 py-3">
              <FaPalette className="text-gray-500 mr-4" size={20} />
              <span className="flex-1">Theme</span>
              <button
                className="bg-gray-100 px-3 py-1 rounded text-gray-700 hover:bg-gray-200"
                onClick={() => setShowThemeModal(true)}
              >
                {theme}
              </button>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-6 px-2 mb-4 flex justify-center">
          <button
            className="flex items-center gap-2 px-6 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 shadow"
            onClick={handleLogout}
          >
            <FaSignOutAlt size={18} /> Logout
          </button>
        </div>

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <form className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm" onSubmit={handlePasswordChange}>
              <div className="text-lg font-semibold mb-4">Change Password</div>
              <input
                type="password"
                className="w-full border rounded px-3 py-2 mb-3"
                placeholder="Current Password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
              />
              <input
                type="password"
                className="w-full border rounded px-3 py-2 mb-3"
                placeholder="New Password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
              <input
                type="password"
                className="w-full border rounded px-3 py-2 mb-4"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Language Modal */}
        {showLanguageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
              <div className="text-lg font-semibold mb-4">Select Language</div>
              <button
                className={`w-full px-4 py-2 rounded mb-2 ${language === 'English' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => { setLanguage('English'); setShowLanguageModal(false); }}
              >
                English
              </button>
              <button
                className={`w-full px-4 py-2 rounded ${language === 'Nepali' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => { setLanguage('Nepali'); setShowLanguageModal(false); }}
              >
                Nepali
              </button>
              <button
                className="w-full px-4 py-2 rounded bg-gray-200 text-gray-700 mt-2"
                onClick={() => setShowLanguageModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Theme Modal */}
        {showThemeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
              <div className="text-lg font-semibold mb-4">Select Theme</div>
              <button
                className={`w-full px-4 py-2 rounded mb-2 ${theme === 'Light' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => { setTheme('Light'); setShowThemeModal(false); }}
              >
                Light
              </button>
              <button
                className={`w-full px-4 py-2 rounded ${theme === 'Dark' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => { setTheme('Dark'); setShowThemeModal(false); }}
              >
                Dark
              </button>
              <button
                className="w-full px-4 py-2 rounded bg-gray-200 text-gray-700 mt-2"
                onClick={() => setShowThemeModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 w-full z-40">
          <BottomNavigation />
        </div>
      </div>
    </div>
  );
};

export default Settings; 