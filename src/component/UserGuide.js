import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { IoArrowBack, IoSearch, IoDocument } from 'react-icons/io5';
import './UserGuide.css';

const UserGuide = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const guideItems = [
    {
      id: 1,
      title: 'How to report violations using Public Eye?',
      category: 'Public Eye'
    },
    {
      id: 2,
      title: 'How to call nearby police stations?',
      category: 'Emergency'
    },
    {
      id: 3,
      title: 'How to Setup Biometric Login?',
      category: 'Security'
    },
    {
      id: 4,
      title: 'How to reset your password?',
      category: 'Account'
    },
    {
      id: 5,
      title: 'How to change Language Setting in app?',
      category: 'Settings'
    },
    {
      id: 6,
      title: 'How to apply for Police Clearance Report?',
      category: 'Services'
    }
  ];

  const filteredItems = guideItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (item) => {
    // Here you would typically navigate to a detailed guide page
    // For now, we'll just show an alert
    alert(`Opening guide: ${item.title}`);
  };

  return (
    <div className="user-guide-container">
      <div className="user-guide-card">
        {/* Header */}
        <div className="user-guide-header">
          <button className="back-button" onClick={() => navigate('/settings')}>
            <IoArrowBack size={24} />
          </button>
          <h1 className="user-guide-title">User Guide</h1>
        </div>

        {/* Content */}
        <div className="user-guide-content">
          {/* Search Bar */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <IoSearch className="search-icon" />
            </div>
          </div>

          {/* Guide Items */}
          <div className="guide-items">
            {filteredItems.map((item) => (
              <div key={item.id} className="guide-item">
                <div className="guide-item-content">
                  <h3 className="guide-item-title">{item.title}</h3>
                  <div className="guide-item-footer">
                    <div className="docs-badge">
                      <IoDocument size={16} />
                      <span>Docs</span>
                    </div>
                    <button 
                      className="view-details-btn"
                      onClick={() => handleViewDetails(item)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredItems.length === 0 && (
            <div className="no-results">
              <p>No guides found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserGuide;
