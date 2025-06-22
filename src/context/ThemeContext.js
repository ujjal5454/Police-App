import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext(null);

export const themes = {
  light: {
    // Background colors
    background: '#f5f5f5',
    cardBackground: '#ffffff',
    headerBackground: '#0088cc',
    
    // Text colors
    textPrimary: '#333333',
    textSecondary: '#666666',
    textLight: '#999999',
    textWhite: '#ffffff',
    
    // Input colors
    inputBackground: '#f0f0f0',
    inputBorder: '#e0e0e0',
    inputFocus: '#e8e8e8',
    
    // Button colors
    buttonPrimary: '#0088cc',
    buttonSecondary: '#f5f5f5',
    buttonHover: '#0077b3',
    
    // Border colors
    border: '#e0e0e0',
    borderLight: '#f0f0f0',
    
    // Status colors
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    
    // Navigation
    navBackground: '#0088cc',
    navText: '#ffffff',
    navActive: '#ffeb3b',
    
    // Shadows
    shadow: 'rgba(0, 0, 0, 0.12)',
    shadowDark: 'rgba(0, 0, 0, 0.24)',
    
    // Special
    overlay: 'rgba(0, 0, 0, 0.5)',
    fabBackground: '#1976d2',

    // Icon filters
    iconFilter: 'none',
    iconInvert: 'none',
    navIconFilter: 'brightness(0) invert(1)',
    serviceIconFilter: 'none',
  },
  
  dark: {
    // Background colors
    background: '#121212',
    cardBackground: '#1e1e1e',
    headerBackground: '#1976d2',
    
    // Text colors
    textPrimary: '#ffffff',
    textSecondary: '#b3b3b3',
    textLight: '#888888',
    textWhite: '#ffffff',
    
    // Input colors
    inputBackground: '#2c2c2c',
    inputBorder: '#404040',
    inputFocus: '#404040',
    
    // Button colors
    buttonPrimary: '#1976d2',
    buttonSecondary: '#2c2c2c',
    buttonHover: '#1565c0',
    
    // Border colors
    border: '#404040',
    borderLight: '#2c2c2c',
    
    // Status colors
    success: '#66bb6a',
    error: '#ef5350',
    warning: '#ffa726',
    info: '#42a5f5',
    
    // Navigation
    navBackground: '#1976d2',
    navText: '#ffffff',
    navActive: '#ffeb3b',
    
    // Shadows
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowDark: 'rgba(0, 0, 0, 0.5)',
    
    // Special
    overlay: 'rgba(0, 0, 0, 0.7)',
    fabBackground: '#2196f3',

    // Icon filters
    iconFilter: 'brightness(0) invert(1)',
    iconInvert: 'brightness(0) invert(1)',
    navIconFilter: 'brightness(0) invert(1)',
    serviceIconFilter: 'brightness(0.8) contrast(1.2)',
  }
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    console.log('ThemeContext: Saved theme from localStorage:', savedTheme);

    if (savedTheme) {
      const isDark = savedTheme === 'dark';
      console.log('ThemeContext: Using saved theme, isDark:', isDark);
      return isDark;
    }

    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log('ThemeContext: No saved theme, system prefers dark:', systemPrefersDark);
    return systemPrefersDark;
  });

  const currentTheme = isDarkMode ? themes.dark : themes.light;

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    console.log('ThemeContext: Toggling from', isDarkMode, 'to', newTheme);
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');

    // Force immediate update
    setTimeout(() => {
      const root = document.documentElement;
      const themeToApply = newTheme ? themes.dark : themes.light;
      Object.entries(themeToApply).forEach(([key, value]) => {
        root.style.setProperty(`--theme-${key}`, value);
      });
      document.body.className = newTheme ? 'dark-theme' : 'light-theme';
      console.log('ThemeContext: Force applied theme', newTheme ? 'dark' : 'light');
    }, 0);
  };

  useEffect(() => {
    console.log('ThemeContext: Applying theme', isDarkMode ? 'dark' : 'light');
    const root = document.documentElement;
    Object.entries(currentTheme).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });

    document.body.className = isDarkMode ? 'dark-theme' : 'light-theme';
    console.log('ThemeContext: Body class set to', document.body.className);
  }, [currentTheme, isDarkMode]);

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      theme: currentTheme,
      toggleTheme,
      themeName: isDarkMode ? 'dark' : 'light'
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
