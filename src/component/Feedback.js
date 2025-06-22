import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { IoArrowBack } from 'react-icons/io5';
import { FaStar } from 'react-icons/fa';
import './Feedback.css';

const Feedback = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [feedbackType, setFeedbackType] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const feedbackTypes = [
    'Bug Report',
    'Feature Request',
    'General Feedback',
    'Complaint',
    'Suggestion',
    'Compliment'
  ];

  const handleSubmit = () => {
    if (!feedbackType || !feedbackText || rating === 0) {
      alert('Please fill in all fields and provide a rating');
      return;
    }

    // Here you would typically send the feedback to your backend
    console.log('Feedback submitted:', {
      type: feedbackType,
      text: feedbackText,
      rating: rating
    });

    alert('Thank you for your feedback!');
    navigate('/settings');
  };

  const handleStarClick = (starIndex) => {
    setRating(starIndex);
  };

  const handleStarHover = (starIndex) => {
    setHoveredRating(starIndex);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  return (
    <div className="feedback-container">
      <div className="feedback-card">
        {/* Header */}
        <div className="feedback-header">
          <button className="back-button" onClick={() => navigate('/settings')}>
            <IoArrowBack size={24} />
          </button>
          <h1 className="feedback-title">Feedback</h1>
        </div>

        {/* Content */}
        <div className="feedback-content">
          <p className="feedback-description">
            Thank you for using Nepal Police App. We value your feedbacks and suggestions.
          </p>

          {/* Feedback Type Dropdown */}
          <div className="form-group">
            <select
              className="feedback-select"
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              required
            >
              <option value="" disabled>Feedback type</option>
              {feedbackTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Feedback Text Area */}
          <div className="form-group">
            <textarea
              className="feedback-textarea"
              placeholder="Write your feedback description..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={6}
            />
          </div>

          {/* Rating Section */}
          <div className="rating-section">
            <h3 className="rating-title">Rate us</h3>
            <div className="stars-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={`star ${
                    star <= (hoveredRating || rating) ? 'star-filled' : 'star-empty'
                  }`}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={handleStarLeave}
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button className="submit-button" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
