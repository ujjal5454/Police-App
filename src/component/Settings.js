import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadUserData();
    loadUserSettings();
    
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark');
    }
  }, []);

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/user');
      const userData = await response.json();
      setUserData(userData);
      setEditForm({
        fullName: userData.fullName,
        email: userData.email
      });
    } catch (error) {
      showToast('Failed to load user data', 'error');
    }
  };

  const loadUserSettings = async () => {
    try {
      const response = await fetch('/api/user/settings');
      const settingsData = await response.json();
      setSettings(settingsData);
      setLoading(false);
    } catch (error) {
      showToast('Failed to load settings', 'error');
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [key]: value }),
      });
      
      if (response.ok) {
        const updatedSettings = await response.json();
        setSettings(updatedSettings);
        
        if (key === 'theme') {
          localStorage.setItem('theme', value.toLowerCase());
        }
      }
    } catch (error) {
      showToast('Failed to update setting', 'error');
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        setUserData(updatedUser);
        setEditProfileOpen(false);
        showToast('Profile updated successfully!');
      }
    } catch (error) {
      showToast('Failed to update profile', 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordForm),
      });
      
      if (response.ok) {
        setChangePasswordOpen(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        showToast('Password changed successfully!');
      } else {
        const error = await response.json();
        showToast(error.message || 'Failed to change password', 'error');
      }
    } catch (error) {
      showToast('Failed to change password', 'error');
    }
  };

  const handleThemeChange = (theme) => {
    const isDark = theme === 'Dark';
    setIsDarkMode(isDark);
    
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    
    updateSetting('theme', theme);
    setThemeModalOpen(false);
    showToast('Theme updated successfully!');
  };

  const handleLanguageChange = (language) => {
    updateSetting('language', language);
    setLanguageModalOpen(false);
    showToast('Language updated successfully!');
  };

  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: ${type === 'error' ? '#ef4444' : '#10b981'};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 1001;
      transform: translateX(400px);
      transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      toast.style.transform = 'translateX(400px)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-900 min-h-screen">
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

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