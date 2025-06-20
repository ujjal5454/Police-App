import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './Notice.css';

const NoticeDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchNoticeDetail();
    }
  }, [id]);

  const fetchNoticeDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/notices/${id}`, {
        withCredentials: true
      });
      setNotice(response.data);
    } catch (err) {
      setError('Failed to fetch notice details');
      console.error('Error fetching notice detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/notice');
  };

  const handleLike = async () => {
    if (likeLoading) return;

    const wasLiked = liked;
    const originalLikes = notice.likes;

    try {
      setLikeLoading(true);

      if (wasLiked) {
        // Unlike the notice
        console.log('Unliking notice, current likes:', originalLikes);
        const response = await axios.post(`http://localhost:5000/api/notices/${id}/unlike`, {}, {
          withCredentials: true
        });
        console.log('Unlike response:', response.data);

        setLiked(false);
        setNotice(prev => ({
          ...prev,
          likes: response.data.likes
        }));
      } else {
        // Like the notice
        console.log('Liking notice, current likes:', originalLikes);
        const response = await axios.post(`http://localhost:5000/api/notices/${id}/like`, {}, {
          withCredentials: true
        });
        console.log('Like response:', response.data);

        setLiked(true);
        setNotice(prev => ({
          ...prev,
          likes: response.data.likes
        }));
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      // Revert the state on error
      setLiked(wasLiked);
      setNotice(prev => ({
        ...prev,
        likes: originalLikes
      }));
    } finally {
      setLikeLoading(false);
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

  if (loading) {
    return (
      <div className="notice-detail-container">
        <div className="notice-detail-card">
          <div className="notice-detail-header">
            <button className="notice-back-btn" onClick={handleBack}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
              </svg>
            </button>
            <h1>Notice Detail</h1>
            <div style={{ width: '40px', height: '40px' }}></div>
          </div>
          <div className="notice-detail-content">
            <div className="notice-loading">
              <div className="loading-spinner"></div>
              <p>Loading notice...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="notice-detail-container">
        <div className="notice-detail-card">
          <div className="notice-detail-header">
            <button className="notice-back-btn" onClick={handleBack}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
              </svg>
            </button>
            <h1>Notice Detail</h1>
            <div style={{ width: '40px', height: '40px' }}></div>
          </div>
          <div className="notice-detail-content">
            <div className="notice-error">
              <p>{error || 'Notice not found'}</p>
              <button onClick={fetchNoticeDetail} className="retry-btn">Retry</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notice-detail-container">
      <div className="notice-detail-card">
        <div className="notice-detail-header">
          <button className="notice-back-btn" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
            </svg>
          </button>
          <h1>Notice Detail</h1>
          <div style={{ width: '40px', height: '40px' }}></div>
        </div>

        <div className="notice-detail-content">
          <div className="notice-detail-meta">
            <div className="notice-detail-date">
              {formatDate(notice.createdAt)}
            </div>
            <div className="notice-detail-category">
              {getCategoryDisplayName(notice.category)}
            </div>
          </div>

          <h2 className="notice-detail-title">{notice.title}</h2>

          {notice.image && (
            <div className="notice-detail-image">
              <img 
                src={`http://localhost:5000${notice.image.url}`} 
                alt={notice.title}
                onError={(e) => {
                  e.target.parentElement.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="notice-detail-text">
            {notice.content}
          </div>

          <div className="notice-detail-stats">
            <div className="notice-stat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#666">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
              <span>{notice.views || 0} views</span>
            </div>
            <button
              className={`like-btn ${liked ? 'liked' : ''}`}
              onClick={handleLike}
              disabled={likeLoading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "#e91e63" : "#666"}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span>{likeLoading ? '...' : `${notice.likes || 0} ${liked ? 'liked' : 'likes'}`}</span>
            </button>
          </div>

          {notice.createdBy && (
            <div className="notice-detail-author">
              <p>Published by: {notice.createdBy.name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoticeDetail;
