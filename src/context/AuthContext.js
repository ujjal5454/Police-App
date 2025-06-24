import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/auth/check-auth');
      if (response.data.isAuthenticated) {
        const userResponse = await axios.get('/auth/me');
        setUser(userResponse.data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      // Check if it's a network error (backend not available)
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Backend server is not available. Please try again later.');
      }
      throw error.response?.data || { message: 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      // Industry-level logout implementation
      console.log('Starting logout process...');

      // 1. Call backend logout endpoint to invalidate server-side session/token
      await axios.post('/auth/logout');

      // 2. Clear all client-side storage
      localStorage.clear();
      sessionStorage.clear();

      // 3. Clear any cached user data
      setUser(null);

      // 4. Clear any IndexedDB data (for security)
      if ('indexedDB' in window) {
        try {
          // Clear incident database
          const deleteIncidentDB = indexedDB.deleteDatabase('IncidentDB');
          deleteIncidentDB.onsuccess = () => console.log('IncidentDB cleared');

          // Clear e-complaint database
          const deleteComplaintDB = indexedDB.deleteDatabase('EComplaintDB');
          deleteComplaintDB.onsuccess = () => console.log('EComplaintDB cleared');

          // Clear news database
          const deleteNewsDB = indexedDB.deleteDatabase('NewsDB');
          deleteNewsDB.onsuccess = () => console.log('NewsDB cleared');

          // Clear notice database
          const deleteNoticeDB = indexedDB.deleteDatabase('NoticeDB');
          deleteNoticeDB.onsuccess = () => console.log('NoticeDB cleared');
        } catch (dbError) {
          console.warn('Failed to clear some databases:', dbError);
        }
      }

      // 5. Revoke any blob URLs to prevent memory leaks
      if (window.URL && window.URL.revokeObjectURL) {
        // This will be handled by individual components, but good practice
        console.log('Blob URLs should be cleaned by components');
      }

      // 6. Clear any service worker caches (if implemented)
      if ('serviceWorker' in navigator && 'caches' in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
          console.log('Service worker caches cleared');
        } catch (cacheError) {
          console.warn('Failed to clear service worker caches:', cacheError);
        }
      }

      // 7. Clear any timers or intervals (if any are set globally)
      // This would be handled by individual components

      // 8. Reset axios defaults
      delete axios.defaults.headers.common['Authorization'];

      console.log('Logout completed successfully');

    } catch (error) {
      console.error('Logout failed:', error);

      // Even if server logout fails, clear client-side data for security
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];

      // Don't throw error - logout should always succeed on client side
      console.log('Client-side logout completed despite server error');
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUserData
    }));
  };

  const refreshUser = async () => {
    try {
      const userResponse = await axios.get('/auth/me');
      setUser(userResponse.data);
      return userResponse.data;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateUser,
      refreshUser,
      isAuthenticated: !!user
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 