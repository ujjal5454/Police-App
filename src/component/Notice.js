import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Notice.css';
import { provinces } from '../data/nepal-data';

const Notice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('All Provinces');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState(null);

  const categories = [
    { id: 'all', name: 'All', displayName: 'All' },
    { id: 'promotion', name: 'promotion', displayName: 'Promotion' },
    { id: 'transfer notices', name: 'transfer notices', displayName: 'Transfer Notices' },
    { id: 'directives', name: 'directives', displayName: 'Directives' },
    { id: 'rules', name: 'rules', displayName: 'Rules' },
    { id: 'exam schedule', name: 'exam schedule', displayName: 'Exam Schedule' },
    { id: 'order', name: 'order', displayName: 'Order' },
    { id: 'general notice', name: 'general notice', displayName: 'General Notice' },
    { id: 'law', name: 'law', displayName: 'Law' },
    { id: 'un notices', name: 'un notices', displayName: 'UN Notices' },
    { id: 'deputation', name: 'deputation', displayName: 'Deputation' },
    { id: 'other notice (career)', name: 'other notice (career)', displayName: 'Other Notice (Career)' },
    { id: 'bipad notice', name: 'bipad notice', displayName: 'Bipad Notice' },
    { id: 'public procurement', name: 'public procurement', displayName: 'Public Procurement' },
    { id: 'ordinance', name: 'ordinance', displayName: 'Ordinance' },
    { id: 'procedure', name: 'procedure', displayName: 'Procedure' }
  ];

  const getCategoryDisplayName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId || cat.name === categoryId);
    return category ? category.displayName : categoryId;
  };

  useEffect(() => {
    // Handle date range from DateRangePicker
    if (location.state?.dateRange) {
      setDateRange(location.state.dateRange);
      // Restore other filters if coming from date picker
      if (location.state.currentFilters) {
        setSelectedCategory(location.state.currentFilters.category);
        setSelectedProvince(location.state.currentFilters.province);
        setSearchQuery(location.state.currentFilters.search);
      }
    }
  }, [location.state]);

  useEffect(() => {
    fetchNotices();
  }, [selectedCategory, selectedProvince, searchQuery, dateRange]);

  const fetchNotices = async () => {
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

      // Add date range filter
      if (dateRange && dateRange.startDate && dateRange.endDate) {
        // Convert Nepali dates to approximate Gregorian dates for API
        const startYear = dateRange.startDate.year - 57; // Approximate conversion
        const endYear = dateRange.endDate.year - 57;
        const startDate = `${startYear}-${String(dateRange.startDate.month + 1).padStart(2, '0')}-${String(dateRange.startDate.day).padStart(2, '0')}`;
        const endDate = `${endYear}-${String(dateRange.endDate.month + 1).padStart(2, '0')}-${String(dateRange.endDate.day).padStart(2, '0')}`;
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }

      const response = await axios.get(`http://localhost:5000/api/notices?${params.toString()}`, {
        withCredentials: true
      });
      setNotices(response.data.notices || []);
    } catch (err) {
      setError('Failed to fetch notices');
      console.error('Error fetching notices:', err);
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

  const handleNoticeClick = (noticeId) => {
    navigate(`/notice/${noticeId}`);
  };

  const handleAdminPanel = () => {
    navigate('/admin/notices');
  };

  const handleDateFilter = () => {
    navigate('/date-range-picker', {
      state: {
        fromNotice: true,
        currentFilters: {
          category: selectedCategory,
          province: selectedProvince,
          search: searchQuery
        }
      }
    });
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

  const truncateContent = (content, maxLength = 100) => {
    if (!content) return '';
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  return (
    <div className="notice-container">
      <div className="notice-card">
        <div className="notice-header">
          <button className="notice-back-btn" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
            </svg>
          </button>
          <h1>Notice</h1>
          <div className="notice-header-actions">
            {user && user.role === 'admin' && (
              <button className="admin-btn" onClick={handleAdminPanel}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </button>
            )}
            <button className="filter-btn" onClick={handleDateFilter}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.73-4.8 5.75-7.39C20.25 4.95 19.78 4 18.95 4H5.04c-.83 0-1.3.95-.79 1.61z"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="notice-search-container">
          <input
            type="text"
            placeholder="Search notices..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="notice-search-input"
          />
        </div>

        <div className="notice-province-container">
          <select
            value={selectedProvince}
            onChange={handleProvinceChange}
            className="notice-province-select"
          >
            <option value="All Provinces">All Provinces</option>
            {provinces.map(province => (
              <option key={province} value={province}>{province}</option>
            ))}
          </select>
        </div>

        <div className="notice-categories-container">
          <div className="notice-categories-scroll">
            {categories.map(category => (
              <button
                key={category.id}
                className={`notice-category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategorySelect(category.id)}
              >
                {category.displayName}
              </button>
            ))}
          </div>
        </div>

        <div className="notice-content">
          {loading ? (
            <div className="notice-loading">
              <div className="loading-spinner"></div>
              <p>Loading notices...</p>
            </div>
          ) : error ? (
            <div className="notice-error">
              <p>{error}</p>
              <button onClick={fetchNotices} className="retry-btn">Retry</button>
            </div>
          ) : notices.length === 0 ? (
            <div className="notice-empty">
              <p>No notices found for the selected criteria.</p>
            </div>
          ) : (
            <div className="notice-list">
              {notices.map((item) => (
                <div 
                  key={item._id} 
                  className="notice-item"
                  onClick={() => handleNoticeClick(item._id)}
                >
                  <div className="notice-item-content">
                    <div className="notice-item-date">
                      {formatDate(item.createdAt)}
                    </div>
                    <div className="notice-item-title">
                      {item.title}
                    </div>
                    {item.content && (
                      <div className="notice-item-preview">
                        {truncateContent(item.content)}
                      </div>
                    )}
                    <div className="notice-item-meta">
                      <span className="notice-category">{getCategoryDisplayName(item.category)}</span>
                      {item.province !== 'All Provinces' && (
                        <span className="notice-province">{item.province}</span>
                      )}
                    </div>
                  </div>
                  {item.image && (
                    <div className="notice-item-image">
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

export default Notice;
