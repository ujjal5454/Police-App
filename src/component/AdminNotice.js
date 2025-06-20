import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './AdminNotice.css';
import { provinces } from '../data/nepal-data';

const AdminNotice = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general notice',
    province: 'All Provinces',
    status: 'published',
    priority: 'medium'
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const categories = [
    'promotion',
    'transfer notices',
    'directives',
    'rules',
    'exam schedule',
    'order',
    'general notice',
    'law',
    'un notices',
    'deputation',
    'other notice (career)',
    'bipad notice',
    'public procurement',
    'ordinance',
    'procedure'
  ];

  const statuses = ['draft', 'published', 'archived'];
  const priorities = ['low', 'medium', 'high', 'urgent'];

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/notice');
      return;
    }
    fetchAdminNotices();
  }, [user, navigate]);

  const fetchAdminNotices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/notices/admin/all', {
        withCredentials: true
      });
      setNotices(response.data.notices || []);
    } catch (err) {
      setError('Failed to fetch notices');
      console.error('Error fetching admin notices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/notice');
  };

  const handleAddNotice = () => {
    setEditingNotice(null);
    setFormData({
      title: '',
      content: '',
      category: 'general notice',
      province: 'All Provinces',
      status: 'published',
      priority: 'medium'
    });
    setSelectedImage(null);
    setImagePreview('');
    setShowAddForm(true);
  };

  const handleEditNotice = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      category: notice.category,
      province: notice.province,
      status: notice.status,
      priority: notice.priority
    });
    setSelectedImage(null);
    setImagePreview(notice.image ? `http://localhost:5000${notice.image.url}` : '');
    setShowAddForm(true);
  };

  const handleDeleteNotice = async (noticeId) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await axios.delete(`http://localhost:5000/api/notices/${noticeId}`, {
          withCredentials: true
        });
        fetchAdminNotices();
      } catch (err) {
        console.error('Error deleting notice:', err);
        alert('Failed to delete notice');
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('province', formData.province);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('priority', formData.priority);
      
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }

      if (editingNotice) {
        await axios.put(`http://localhost:5000/api/notices/${editingNotice._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true
        });
      } else {
        await axios.post('http://localhost:5000/api/notices', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true
        });
      }

      setShowAddForm(false);
      fetchAdminNotices();
    } catch (err) {
      console.error('Error saving notice:', err);
      alert('Failed to save notice');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
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

  const getCategoryDisplayName = (categoryId) => {
    const categories = {
      'promotion': 'Promotion',
      'transfer notices': 'Transfer Notices',
      'directives': 'Directives',
      'rules': 'Rules',
      'exam schedule': 'Exam Schedule',
      'order': 'Order',
      'general notice': 'General Notice',
      'law': 'Law',
      'un notices': 'UN Notices',
      'deputation': 'Deputation',
      'other notice (career)': 'Other Notice (Career)',
      'bipad notice': 'Bipad Notice',
      'public procurement': 'Public Procurement',
      'ordinance': 'Ordinance',
      'procedure': 'Procedure'
    };
    return categories[categoryId] || categoryId;
  };

  if (showAddForm) {
    return (
      <div className="admin-notice-container">
        <div className="admin-notice-card">
          <div className="admin-notice-header">
            <button className="admin-notice-back-btn" onClick={() => setShowAddForm(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
              </svg>
            </button>
            <h1>{editingNotice ? 'Edit Notice' : 'Add Notice'}</h1>
            <div style={{ width: '40px', height: '40px' }}></div>
          </div>

          <div className="admin-notice-form-container">
            <form onSubmit={handleFormSubmit} className="admin-notice-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  required
                  rows="6"
                  className="form-textarea"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="form-select"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {getCategoryDisplayName(category)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Province</label>
                  <select
                    value={formData.province}
                    onChange={(e) => setFormData({...formData, province: e.target.value})}
                    className="form-select"
                  >
                    <option value="All Provinces">All Provinces</option>
                    {provinces.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="form-select"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="form-select"
                  >
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-file-input"
                />
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowAddForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {editingNotice ? 'Update Notice' : 'Create Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-notice-container">
      <div className="admin-notice-card">
        <div className="admin-notice-header">
          <button className="admin-notice-back-btn" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
            </svg>
          </button>
          <h1>Admin Notices</h1>
          <button className="add-notice-btn" onClick={handleAddNotice}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>
        </div>

        <div className="admin-notice-content">
          {loading ? (
            <div className="admin-notice-loading">
              <div className="loading-spinner"></div>
              <p>Loading notices...</p>
            </div>
          ) : error ? (
            <div className="admin-notice-error">
              <p>{error}</p>
              <button onClick={fetchAdminNotices} className="retry-btn">Retry</button>
            </div>
          ) : notices.length === 0 ? (
            <div className="admin-notice-empty">
              <p>No notices found. Create your first notice!</p>
              <button onClick={handleAddNotice} className="add-first-notice-btn">
                Add Notice
              </button>
            </div>
          ) : (
            <div className="admin-notice-list">
              {notices.map((item) => (
                <div key={item._id} className="admin-notice-item">
                  <div className="admin-notice-item-content">
                    <div className="admin-notice-item-header">
                      <h3 className="admin-notice-item-title">{item.title}</h3>
                      <div className="admin-notice-item-actions">
                        <button
                          onClick={() => handleEditNotice(item)}
                          className="edit-btn"
                          title="Edit Notice"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteNotice(item._id)}
                          className="delete-btn"
                          title="Delete Notice"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="admin-notice-item-meta">
                      <span className={`status-badge status-${item.status}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                      <span className="category-badge">{getCategoryDisplayName(item.category)}</span>
                      <span className="date-badge">{formatDate(item.createdAt)}</span>
                    </div>
                    <p className="admin-notice-item-preview">
                      {item.content.length > 150 ? item.content.substring(0, 150) + '...' : item.content}
                    </p>
                    <div className="admin-notice-item-stats">
                      <span>👁 {item.views || 0}</span>
                      <span>❤ {item.likes || 0}</span>
                      {item.province !== 'All Provinces' && (
                        <span>📍 {item.province}</span>
                      )}
                    </div>
                  </div>
                  {item.image && (
                    <div className="admin-notice-item-image">
                      <img
                        src={`http://localhost:5000${item.image.url}`}
                        alt={item.title}
                        onError={(e) => {
                          e.target.parentElement.style.display = 'none';
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

export default AdminNotice;
