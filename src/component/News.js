import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './News.css';

const News = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('All Provinces');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const newsCategories = [
    'all',
    'fire',
    'cyber crime',
    'informative',
    'harmful weapon',
    'flood landslide',
    'organizational program',
    'gambling',
    'dead bodies found',
    'rape',
    'home ministry program',
    'narcotic',
    'igp program',
    'blackmailing',
    'quarrel/disturbance',
    'bribery',
    'drug',
    'violence',
    'suspicious thing',
    'crime report',
    'burglary',
    'pick pocketing',
    'harassment',
    'illegal trading',
    'police day program',
    'misbehaviour',
    'robbery',
    'public gathering',
    'crime(arrest)',
    'human trafficking',
    'miscellaneous'
  ];

  const provinces = [
    'All Provinces',
    'Province 1',
    'Madhesh Province',
    'Bagmati Province',
    'Gandaki Province',
    'Lumbini Province',
    'Karnali Province',
    'Sudurpashchim Province'
  ];

  useEffect(() => {
    fetchNews();
  }, [selectedCategory, selectedProvince, searchQuery]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      if (selectedProvince !== 'All Provinces') {
        params.append('province', selectedProvince);
      }
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await axios.get(`http://localhost:5000/api/news?${params.toString()}`, {
        withCredentials: true
      });
      setNews(response.data.news || []);
    } catch (err) {
      setError('Failed to fetch news');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/home');
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleProvinceChange = (e) => {
    setSelectedProvince(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleNewsClick = (newsId) => {
    navigate(`/news/${newsId}`);
  };

  const handleAdminPanel = () => {
    navigate('/admin/news');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Simple B.S. conversion (approximate)
    const bsYear = year + 57;
    return `${year}-${month}-${day} (${bsYear}-${month}-${day} B.S)`;
  };

  const getCategoryDisplayName = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Show all categories
  const visibleCategories = newsCategories;

  return (
    <div className="news-container">
      <div className="news-card">
        <div className="news-header">
          <button className="news-back-btn" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
            </svg>
          </button>
          <h1>News</h1>
          <div className="news-header-actions">
            {user && user.role === 'admin' && (
              <button className="admin-btn" onClick={handleAdminPanel}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </button>
            )}
            <button className="filter-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.73-4.8 5.75-7.39C20.25 4.95 19.78 4 18.95 4H5.04c-.83 0-1.3.95-.79 1.61z"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="news-search-container">
          <div className="news-search-wrapper">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              className="news-search-input"
            />
            <svg className="news-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div className="news-province-container">
          <select 
            value={selectedProvince} 
            onChange={handleProvinceChange}
            className="news-province-select"
          >
            {provinces.map(province => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
          <svg className="province-dropdown-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M7 10l5 5 5-5z" fill="currentColor"/>
          </svg>
        </div>

        <div className="news-categories-container">
          <div className="news-categories-scroll">
            {visibleCategories.map(category => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => handleCategorySelect(category)}
              >
                {getCategoryDisplayName(category)}
              </button>
            ))}
          </div>
        </div>

        <div className="news-content">
          {loading ? (
            <div className="news-loading">
              <div className="loading-spinner"></div>
              <p>Loading news...</p>
            </div>
          ) : error ? (
            <div className="news-error">
              <p>{error}</p>
              <button onClick={fetchNews} className="retry-btn">Retry</button>
            </div>
          ) : news.length === 0 ? (
            <div className="news-empty">
              <p>No news found for the selected criteria.</p>
            </div>
          ) : (
            <div className="news-list">
              {news.map((item) => (
                <div 
                  key={item._id} 
                  className="news-item"
                  onClick={() => handleNewsClick(item._id)}
                >
                  <div className="news-item-content">
                    <div className="news-item-date">
                      {formatDate(item.createdAt)}
                    </div>
                    <div className="news-item-title">
                      {item.title}
                    </div>
                    {item.content && (
                      <div className="news-item-preview">
                        {item.content.substring(0, 100)}...
                      </div>
                    )}
                    <div className="news-item-meta">
                      <span className="news-category">{getCategoryDisplayName(item.category)}</span>
                      {item.province !== 'All Provinces' && (
                        <span className="news-province">{item.province}</span>
                      )}
                    </div>
                  </div>
                  {item.image && (
                    <div className="news-item-image">
                      <img 
                        src={`http://localhost:5000${item.image.url}`} 
                        alt={item.title}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default News;
