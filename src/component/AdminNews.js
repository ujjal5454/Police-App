import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './AdminNews.css';

const AdminNews = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'informative',
    province: 'All Provinces',
    status: 'published',
    priority: 'medium'
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const newsCategories = [
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
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/news');
      return;
    }
    fetchAdminNews();
  }, [user, navigate]);

  const fetchAdminNews = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/news/admin/all', {
        withCredentials: true
      });
      setNews(response.data.news || []);
    } catch (err) {
      setError('Failed to fetch news');
      console.error('Error fetching admin news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/news');
  };

  const handleAddNews = () => {
    setEditingNews(null);
    setFormData({
      title: '',
      content: '',
      category: 'informative',
      province: 'All Provinces',
      status: 'published',
      priority: 'medium'
    });
    setSelectedImage(null);
    setShowAddForm(true);
  };

  const handleEditNews = (newsItem) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      category: newsItem.category,
      province: newsItem.province,
      status: newsItem.status,
      priority: newsItem.priority
    });
    setSelectedImage(null);
    setShowAddForm(true);
  };

  const handleDeleteNews = async (newsId) => {
    if (!window.confirm('Are you sure you want to delete this news?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/news/${newsId}`, {
        withCredentials: true
      });
      setNews(news.filter(item => item._id !== newsId));
    } catch (err) {
      console.error('Error deleting news:', err);
      alert('Failed to delete news');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('category', formData.category);
      submitData.append('province', formData.province);
      submitData.append('status', formData.status);
      submitData.append('priority', formData.priority);
      
      if (selectedImage) {
        submitData.append('image', selectedImage);
      }

      let response;
      if (editingNews) {
        response = await axios.put(`http://localhost:5000/api/news/${editingNews._id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });
      } else {
        response = await axios.post('http://localhost:5000/api/news', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });
      }

      if (editingNews) {
        setNews(news.map(item => 
          item._id === editingNews._id ? response.data : item
        ));
      } else {
        setNews([response.data, ...news]);
      }

      setShowAddForm(false);
      setEditingNews(null);
      setFormData({
        title: '',
        content: '',
        category: 'informative',
        province: 'All Provinces',
        status: 'published',
        priority: 'medium'
      });
      setSelectedImage(null);
    } catch (err) {
      console.error('Error submitting news:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save news';
      alert(`Error: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size should be less than 5MB');
        return;
      }
      setSelectedImage(file);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryDisplayName = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return '#4caf50';
      case 'draft': return '#ff9800';
      case 'archived': return '#757575';
      default: return '#757575';
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="admin-news-container">
      <div className="admin-news-card">
        <div className="admin-news-header">
          <button className="admin-news-back-btn" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
            </svg>
          </button>
          <h1>Admin News</h1>
          <button className="add-news-btn" onClick={handleAddNews}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>
        </div>

        {showAddForm && (
          <div className="news-form-overlay">
            <div className="news-form-container">
              <div className="news-form-header">
                <h2>{editingNews ? 'Edit News' : 'Add News'}</h2>
                <button 
                  className="close-form-btn"
                  onClick={() => setShowAddForm(false)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleFormSubmit} className="news-form">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter news title"
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    {newsCategories.map(category => (
                      <option key={category} value={category}>
                        {getCategoryDisplayName(category)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Province</label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                  >
                    {provinces.map(province => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                  />
                  {selectedImage && (
                    <p className="file-info">Selected: {selectedImage.name}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Content *</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter news content"
                    rows="6"
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="submit-btn"
                  >
                    {submitting ? 'Saving...' : (editingNews ? 'Update' : 'Publish')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="admin-news-content">
          {loading ? (
            <div className="admin-news-loading">
              <div className="loading-spinner"></div>
              <p>Loading news...</p>
            </div>
          ) : error ? (
            <div className="admin-news-error">
              <p>{error}</p>
              <button onClick={fetchAdminNews} className="retry-btn">Retry</button>
            </div>
          ) : news.length === 0 ? (
            <div className="admin-news-empty">
              <p>No news found. Create your first news article!</p>
              <button onClick={handleAddNews} className="add-first-news-btn">
                Add News
              </button>
            </div>
          ) : (
            <div className="admin-news-list">
              {news.map((item) => (
                <div key={item._id} className="admin-news-item">
                  <div className="admin-news-item-content">
                    <div className="admin-news-item-header">
                      <h3 className="admin-news-item-title">{item.title}</h3>
                      <div className="admin-news-item-actions">
                        <button 
                          onClick={() => handleEditNews(item)}
                          className="edit-btn"
                          title="Edit"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteNews(item._id)}
                          className="delete-btn"
                          title="Delete"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="admin-news-item-meta">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(item.status) }}
                      >
                        {item.status}
                      </span>
                      <span className="category-badge">
                        {getCategoryDisplayName(item.category)}
                      </span>
                      <span className="date-badge">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                    
                    <p className="admin-news-item-preview">
                      {item.content.substring(0, 150)}...
                    </p>
                    
                    <div className="admin-news-item-stats">
                      <span>👁 {item.views || 0}</span>
                      <span>❤ {item.likes || 0}</span>
                      {item.province !== 'All Provinces' && (
                        <span>📍 {item.province}</span>
                      )}
                    </div>
                  </div>
                  
                  {item.image && (
                    <div className="admin-news-item-image">
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

export default AdminNews;
