import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PublicEye.css';
import locationIcon from '../assets/icons/location.png';
import imageIcon from '../assets/icons/image.png';
import audioIcon from '../assets/icons/audio.png';
import videoIcon from '../assets/icons/video.png';

const PublicEye = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState(false);

  const [formData, setFormData] = useState(() => ({
    description: '',
    location: { coordinates: null, address: '' },
    media: { images: [], audio: [], video: [] },
    status: ''
  }));

  const [currentFileIndices, setCurrentFileIndices] = useState({
    images: 0,
    video: 0
  });

  useEffect(() => {
    if (location.state?.publicEye) {
      setFormData(location.state.publicEye);
      setViewMode(true);
    }
    // Handle location picker return for PublicEye
    if (location.state?.fromPublicEye && location.state?.selectedLocation && location.state?.previousFormData) {
      setFormData(prev => ({
        ...prev,
        description: location.state.previousFormData.description || '',
        location: location.state.selectedLocation,
        media: location.state.previousFormData.media || { images: [], audio: [], video: [] }
      }));
    }
  }, [location.state]);

  const handleBack = () => {
    navigate('/home');
  };

  const handleDescriptionChange = (e) => {
    setFormData(prev => ({ ...prev, description: e.target.value }));
  };

  // Location picker navigation logic for PublicEye
  const handleLocationSelect = () => {
    const currentState = {
      previousFormData: {
        description: formData.description,
        media: formData.media
      },
      fromPublicEye: true,
      selectedLocation: formData.location
    };
    navigate('/location-picker', { state: currentState });
  };

  const handleFileUpload = (type, files) => {
    const maxFiles = type === 'images' ? 3 : type === 'video' ? 1 : 5;
    const currentCount = formData.media[type].length;
    const newFilesCount = files.length;
    if (currentCount + newFilesCount > maxFiles) {
      setError(`Maximum ${maxFiles} ${type} allowed. You currently have ${currentCount} ${type}.`);
      return;
    }
    const allowedFiles = Array.from(files).filter(file => {
      const size = file.size / (1024 * 1024);
      const maxSize = type === 'video' ? 50 : 10;
      return size <= maxSize;
    });
    if (allowedFiles.length < files.length) {
      setError(`Some files were too large. Maximum size: ${type === 'video' ? '50MB' : '10MB'}`);
      return;
    }
    const fileArray = allowedFiles.map(file => ({
      url: URL.createObjectURL(file),
      filename: file.name,
      size: file.size,
      file
    }));
    setFormData(prev => ({
      ...prev,
      media: {
        ...prev.media,
        [type]: [...prev.media[type], ...fileArray]
      }
    }));
    setError('');
  };

  const handleDeleteFile = (type, index) => {
    setFormData(prev => ({
      ...prev,
      media: {
        ...prev.media,
        [type]: prev.media[type].filter((_, i) => i !== index)
      }
    }));
    setCurrentFileIndices(prev => {
      const newLength = formData.media[type].length - 1;
      const currentIdx = prev[type];
      return {
        ...prev,
        [type]: currentIdx >= newLength ? Math.max(0, newLength - 1) : currentIdx
      };
    });
  };

  const handlePreviousFile = (type) => {
    setCurrentFileIndices(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] - 1)
    }));
  };

  const handleNextFile = (type) => {
    const maxIndex = formData.media[type].length - 1;
    setCurrentFileIndices(prev => ({
      ...prev,
      [type]: Math.min(maxIndex, prev[type] + 1)
    }));
  };

  const renderFilePreview = (type) => {
    const files = formData.media[type];
    if (!files.length) return null;
    const currentIndex = currentFileIndices[type];
    const file = files[currentIndex];
    return (
      <div className="file-preview-container">
        <div className="file-preview">
          {type === 'images' && <img src={file.url} alt={file.filename} className="preview-img" />}
          {type === 'video' && <video src={file.url} controls className="preview-video" />}
        </div>
        <div className="file-controls">
          <div className="file-counter">{files.length > 0 ? `${currentIndex + 1}/${files.length}` : ''}</div>
          {files.length > 1 && (
            <div className="navigation-buttons">
              <button type="button" className="nav-button prev-button" onClick={() => handlePreviousFile(type)} disabled={currentIndex === 0}>‹</button>
              <button type="button" className="nav-button next-button" onClick={() => handleNextFile(type)} disabled={currentIndex === files.length - 1}>›</button>
            </div>
          )}
          {!viewMode && (
            <button type="button" className="delete-button" onClick={() => handleDeleteFile(type, currentIndex)}>×</button>
          )}
        </div>
      </div>
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Public Eye report submitted!');
      navigate('/home');
    }, 1000);
  };

  return (
    <div className="incident-details-container">
      <div className="incident-details-card">
        <div className="incident-header">
          <button className="back-button" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
            </svg>
          </button>
          <h2>Public Eye Report</h2>
        </div>

        <form className="incident-form" onSubmit={handleSubmit}>
          <textarea
            className="description-input"
            placeholder="Enter Description"
            value={formData.description}
            onChange={handleDescriptionChange}
            required
            readOnly={viewMode}
          />

          {viewMode ? (
            <div className="location-display">
              <img src={locationIcon} alt="Location" className="icon" />
              {formData.location.address || 'No location specified'}
            </div>
          ) : (
            <button
              type="button"
              className="location-selector"
              onClick={handleLocationSelect}
            >
              <img src={locationIcon} alt="Location" className="icon" />
              {formData.location.address || 'Choose Location'}
            </button>
          )}
          {!viewMode && (
            <div className="upload-sections">
              <div className="upload-section">
                <label>
                  <img src={imageIcon} alt="Upload Images" className="upload-icon" />
                  Images (Max 3 files, 10MB each)
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload('images', e.target.files)}
                  />
                </label>
              </div>
              <div className="upload-section">
                <label>
                  <img src={audioIcon} alt="Upload Audio" className="upload-icon" />
                  Audio (Max 5 files, 10MB each)
                  <input
                    type="file"
                    accept="audio/*"
                    multiple
                    onChange={(e) => handleFileUpload('audio', e.target.files)}
                  />
                </label>
              </div>
              <div className="upload-section">
                <label>
                  <img src={videoIcon} alt="Upload Video" className="upload-icon" />
                  Video (Max 1 file, 50MB)
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileUpload('video', e.target.files)}
                  />
                </label>
              </div>
            </div>
          )}
          <div className="preview-section">
            {renderFilePreview('images')}
            {renderFilePreview('video')}
          </div>
          {error && <div className="error-message">{error}</div>}
          {!viewMode && (
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default PublicEye;
