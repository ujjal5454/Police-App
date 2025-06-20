import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './News.css';

const NewsDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchNewsDetail();
    }
  }, [id]);

  const fetchNewsDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/news/${id}`, {
        withCredentials: true
      });
      setNews(response.data);
    } catch (err) {
      setError('Failed to fetch news details');
      console.error('Error fetching news detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/news');
  };

  const handleLike = async () => {
    if (likeLoading) return;

    const wasLiked = liked;
    const originalLikes = news.likes;

    try {
      setLikeLoading(true);

      if (wasLiked) {
        // Unlike the news
        console.log('Unliking news, current likes:', originalLikes);
        const response = await axios.post(`http://localhost:5000/api/news/${id}/unlike`, {}, {
          withCredentials: true
        });
        console.log('Unlike response:', response.data);

        setLiked(false);
        setNews(prev => ({
          ...prev,
          likes: response.data.likes
        }));
      } else {
        // Like the news
        console.log('Liking news, current likes:', originalLikes);
        const response = await axios.post(`http://localhost:5000/api/news/${id}/like`, {}, {
          withCredentials: true
        });
        console.log('Like response:', response.data);

        setLiked(true);
        setNews(prev => ({
          ...prev,
          likes: response.data.likes
        }));
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      // Revert the state on error
      setLiked(wasLiked);
      setNews(prev => ({
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

  const getCategoryDisplayName = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  if (loading) {
    return (
      <div className="news-detail-container">
        <div className="news-detail-card">
          <div className="news-detail-header">
            <button className="news-back-btn" onClick={handleBack}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
              </svg>
            </button>
            <h1>News Detail</h1>
            <div style={{ width: '40px', height: '40px' }}></div>
          </div>
          <div className="news-detail-content">
            <div className="news-loading">
              <div className="loading-spinner"></div>
              <p>Loading news...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="news-detail-container">
        <div className="news-detail-card">
          <div className="news-detail-header">
            <button className="news-back-btn" onClick={handleBack}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
              </svg>
            </button>
            <h1>News Detail</h1>
            <div style={{ width: '40px', height: '40px' }}></div>
          </div>
          <div className="news-detail-content">
            <div className="news-error">
              <p>{error || 'News not found'}</p>
              <button onClick={fetchNewsDetail} className="retry-btn">Retry</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="news-detail-container">
      <div className="news-detail-card">
        <div className="news-detail-header">
          <button className="news-back-btn" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
            </svg>
          </button>
          <h1>News Detail</h1>
          <div style={{ width: '40px', height: '40px' }}></div>
        </div>

        <div className="news-detail-content">
          <div className="news-detail-meta">
            <div className="news-detail-date">
              {formatDate(news.createdAt)}
            </div>
            <div className="news-detail-category">
              {getCategoryDisplayName(news.category)}
            </div>
          </div>

          <h2 className="news-detail-title">{news.title}</h2>

          {news.image && (
            <div className="news-detail-image">
              <img 
                src={`http://localhost:5000${news.image.url}`} 
                alt={news.title}
                onError={(e) => {
                  e.target.parentElement.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="news-detail-text">
            {news.content}
          </div>

          <div className="news-detail-stats">
            <button
              className={`like-btn ${liked ? 'liked' : ''}`}
              onClick={handleLike}
              disabled={likeLoading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "#e91e63" : "#666"}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span>{likeLoading ? '...' : `${news.likes || 0} ${liked ? 'liked' : 'likes'}`}</span>
            </button>

            <div className="news-stat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              {news.views || 0} views
            </div>

            {news.createdBy && (
              <div className="news-stat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                By {news.createdBy.name}
              </div>
            )}

            {news.province && news.province !== 'All Provinces' && (
              <div className="news-stat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {news.province}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
