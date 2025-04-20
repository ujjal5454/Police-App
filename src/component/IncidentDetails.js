import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { incidentService } from '../services/api';
import './IncidentDetails.css';
import locationIcon from '../assets/icons/location.png';
import imageIcon from '../assets/icons/image.png';
import audioIcon from '../assets/icons/audio.png';
import videoIcon from '../assets/icons/video.png';

const IncidentDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState(() => {
    const initialState = {
      type: location.state?.fromReportIncident ? 'Domestic Violence' : '',
      description: location.state?.previousFormData?.description || '',
      location: location.state?.selectedLocation || {
        coordinates: null,
        address: ''
      },
      media: {
        images: location.state?.previousFormData?.media?.images || [],
        audio: location.state?.previousFormData?.media?.audio || [],
        video: location.state?.previousFormData?.media?.video || []
      }
    };
    console.log('Initializing form data:', initialState);
    return initialState;
  });

  const [currentFileIndices, setCurrentFileIndices] = useState({
    images: 0,
    audio: 0,
    video: 0
  });

  const [previews, setPreviews] = useState(() => ({
    images: formData.media.images.map(f => f.url) || [],
    video: formData.media.video.map(f => f.url) || []
  }));

  const handleBack = () => {
    if (location.state?.fromReportIncident) {
      navigate('/report-incident');
    } else {
      navigate('/home');
    }
  };

  const handleDescriptionChange = (e) => {
    const newDescription = e.target.value;
    setFormData(prev => ({
      ...prev,
      description: newDescription
    }));
  };

  const handleLocationSelect = () => {
    const currentState = {
      previousFormData: {
        description: formData.description,
        media: formData.media
      },
      incidentType: 'Domestic Violence',
      fromReportIncident: true,
      selectedLocation: formData.location
    };
    
    console.log('Navigating to location picker with state:', currentState);
    navigate('/location-picker', { state: currentState });
  };

  useEffect(() => {
    if (location.state) {
      console.log('Received new location state:', location.state);
      
      setFormData(prev => {
        const newState = {
          ...prev,
          type: 'Domestic Violence',
          description: location.state.previousFormData?.description || prev.description,
          location: location.state.selectedLocation || prev.location,
          media: {
            images: location.state.previousFormData?.media?.images || prev.media.images,
            audio: location.state.previousFormData?.media?.audio || prev.media.audio,
            video: location.state.previousFormData?.media?.video || prev.media.video
          }
        };
        console.log('Updated form data:', newState);
        return newState;
      });
    }
  }, [location.state]);

  const handleFileUpload = (type, files) => {
    const allowedFiles = Array.from(files).filter(file => {
      const size = file.size / (1024 * 1024); // Convert to MB
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

    if (type === 'images' || type === 'video') {
      setPreviews(prev => ({
        ...prev,
        [type]: [...prev[type], ...fileArray.map(f => f.url)]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.location.coordinates) {
      setError('Please select a location');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('type', formData.type);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', JSON.stringify({
        type: 'Point',
        coordinates: formData.location.coordinates
      }));

      Object.entries(formData.media).forEach(([type, files]) => {
        files.forEach(fileObj => {
          if (fileObj.file) {
            formDataToSend.append(type, fileObj.file);
          }
        });
      });

      await incidentService.createIncident(formDataToSend);
      navigate('/home', { state: { incidentCreated: true } });
    } catch (err) {
      setError(err.message || 'Failed to create incident. Please try again.');
      console.error('Error creating incident:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderFilePreview = (type, file, index, total) => {
    const isImage = type === 'images';
    const isVideo = type === 'video';
    const currentIndex = currentFileIndices[type];
    const previewUrl = type === 'images' ? previews.images[currentIndex] : 
                      type === 'video' ? previews.video[currentIndex] : null;

    if (index !== currentIndex) return null;

    return (
      <div className="file-preview-container" key={index}>
        <div className="file-preview">
          {isImage && (
            <img src={previewUrl} alt={`Preview ${index + 1}`} />
          )}
          {isVideo && (
            <video src={previewUrl} controls />
          )}
        </div>
        <div className="file-counter">{index + 1}/{total}</div>
        <button
          type="button"
          className="delete-button"
          onClick={() => {
            setFormData(prev => ({
              ...prev,
              media: {
                ...prev.media,
                [type]: prev.media[type].filter((_, i) => i !== index)
              }
            }));
          }}
        >
          ×
        </button>
      </div>
    );
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
          <h2>{formData.type || 'Report Incident'}</h2>
        </div>

        <form className="incident-form" onSubmit={handleSubmit}>
          <textarea
            className="description-input"
            placeholder="Enter Description"
            value={formData.description}
            onChange={handleDescriptionChange}
            required
          />

          <button
            type="button"
            className="location-selector"
            onClick={handleLocationSelect}
          >
            <img src={locationIcon} alt="Location" className="icon" />
            {formData.location.address || 'Choose Incident Location'}
          </button>

          <div className="upload-sections">
            <div className="upload-section">
              <label>
                <img src={imageIcon} alt="Upload Images" className="upload-icon" />
                Images (Max 10MB each)
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
                Audio (Max 10MB each)
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
                Video (Max 50MB each)
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={(e) => handleFileUpload('video', e.target.files)}
                />
              </label>
            </div>
          </div>

          <div className="preview-section">
            {formData.media.images.map((file, index) => (
              renderFilePreview('images', file, index, formData.media.images.length))
            )}
          </div>

          <div className="preview-section">
            {formData.media.video.map((file, index) => (
              renderFilePreview('video', file, index, formData.media.video.length))
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IncidentDetails;