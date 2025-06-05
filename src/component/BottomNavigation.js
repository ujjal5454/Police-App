import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import homeIcon from '../assets/icons/home.png';
import publicEyeIcon from '../assets/icons/public-eye.png';
import settingsIcon from '../assets/icons/settings.png';
import './BottomNavigation.css';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="bottom-nav">
      <button 
        className={`nav-btn ${isActive('/home') ? 'active' : ''}`}
        onClick={() => handleNavigation('/home')}
      >
        <img src={homeIcon} alt="Home" />
        <span>Home</span>
      </button>
      
      <button 
        className={`nav-btn ${isActive('/public-eye') ? 'active' : ''}`}
        onClick={() => handleNavigation('/public-eye')}
      >
        <img src={publicEyeIcon} alt="Public Eye" />
        <span>Public Eye</span>
      </button>
      
      <button 
        className={`nav-btn ${isActive('/settings') ? 'active' : ''}`}
        onClick={() => handleNavigation('/settings')}
      >
        <img src={settingsIcon} alt="Settings" />
        <span>Settings</span>
      </button>
    </div>
  );
};

export default BottomNavigation;
