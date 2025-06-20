import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { incidentService } from '../services/api';
import './IncidentDetails.css';
import locationIcon from '../assets/icons/location.png';
import imageIcon from '../assets/icons/image.png';
import audioIcon from '../assets/icons/audio.png';
import videoIcon from '../assets/icons/video.png';

const IncidentDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState(false);
  
  const [formData, setFormData] = useState(() => {
    console.log('Initializing IncidentDetails with location.state:', location.state);

    if (location.state?.incident) {
      // View mode - coming from My Incidents
      const incident = location.state.incident;
      console.log('View mode - incident:', incident);
      return {
        type: incident.type || '',
        description: incident.description || '',
        location: incident.location || {
          coordinates: null,
          address: ''
        },
        media: {
          images: incident.media?.images || [],
          audio: incident.media?.audio || [],
          video: incident.media?.video || []
        },
        status: incident.status
      };
    } else {
      // Create mode - coming from Report Incident or LocationPicker
      const initialData = {
        type: location.state?.incidentType || (location.state?.fromReportIncident ? 'Domestic Violence' : ''),
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
      console.log('Create mode - initial data:', initialData);
      return initialData;
    }
  });

  const [currentFileIndices, setCurrentFileIndices] = useState({
    images: 0,
    audio: 0,
    video: 0
  });

  const [previews, setPreviews] = useState(() => ({
    images: formData.media.images.map(f => {
      // Handle both local blob URLs and server URLs
      return f.url?.startsWith('blob:') ? f.url : (f.url ? `http://localhost:5000${f.url}` : '');
    }).filter(Boolean) || [],
    video: formData.media.video.map(f => {
      // Handle both local blob URLs and server URLs
      return f.url?.startsWith('blob:') ? f.url : (f.url ? `http://localhost:5000${f.url}` : '');
    }).filter(Boolean) || []
  }));

  const fetchIncidentDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching incident details for ID:', id);

      const response = await incidentService.getIncidentById(id);
      console.log('Incident details response:', response);

      // Handle both response.data and direct response formats
      const incident = response.data || response;
      console.log('Processed incident data:', incident);
      console.log('Incident media:', incident.media);

      setFormData({
        type: incident.type || '',
        description: incident.description || '',
        location: incident.location || {
          coordinates: null,
          address: ''
        },
        media: {
          images: incident.media?.images || [],
          audio: incident.media?.audio || [],
          video: incident.media?.video || []
        },
        status: incident.status || 'pending'
      });

      // Update previews for media files - handle both local URLs and server URLs
      if (incident.media) {
        setPreviews({
          images: incident.media.images?.map(img => {
            // If URL starts with blob: it's a local file, otherwise it's from server
            return img.url?.startsWith('blob:') ? img.url : `http://localhost:5000${img.url}`;
          }) || [],
          video: incident.media.video?.map(vid => {
            // If URL starts with blob: it's a local file, otherwise it's from server
            return vid.url?.startsWith('blob:') ? vid.url : `http://localhost:5000${vid.url}`;
          }) || []
        });
      }

    } catch (err) {
      console.error('Error fetching incident details:', err);
      setError(`Failed to fetch incident details: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      setViewMode(true);
      fetchIncidentDetails();
    }
  }, [id, fetchIncidentDetails]);

  const handleBack = () => {
    if (location.state?.fromMyIncidents) {
      navigate('/my-incidents');
    } else if (location.state?.fromReportIncident) {
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
      incidentType: formData.type,
      fromReportIncident: true,
      selectedLocation: formData.location
    };

    console.log('Navigating to location picker with state:', currentState);
    navigate('/location-picker', { state: currentState });
  };

  // Handle location updates from LocationPicker
  useEffect(() => {
    console.log('Location state changed:', location.state);

    // Check if we're coming back from location picker with new data
    if (location.state?.fromReportIncident &&
        location.state?.selectedLocation &&
        location.state?.previousFormData) {

      console.log('Updating form data from location picker');
      console.log('Previous form data:', location.state.previousFormData);
      console.log('Selected location:', location.state.selectedLocation);

      setFormData(prev => {
        const updated = {
          type: location.state.incidentType || prev.type || 'Domestic Violence',
          description: location.state.previousFormData.description || '',
          location: location.state.selectedLocation,
          media: location.state.previousFormData.media || {
            images: [],
            audio: [],
            video: []
          }
        };
        console.log('Setting form data to:', updated);
        return updated;
      });
    }
  }, [location.key, location.state]); // Use location.key and location.state

  const handleFileUpload = (type, files) => {
    // Check file count limits
    const maxFiles = type === 'images' ? 3 : type === 'video' ? 1 : 5; // 3 images, 1 video, 5 audio
    const currentCount = formData.media[type].length;
    const newFilesCount = files.length;

    if (currentCount + newFilesCount > maxFiles) {
      setError(`Maximum ${maxFiles} ${type} allowed. You currently have ${currentCount} ${type}.`);
      return;
    }

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

    // Clear any previous errors
    setError('');
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
      console.log('Submitting incident with data:', {
        type: formData.type,
        description: formData.description,
        location: formData.location,
        mediaFiles: {
          images: formData.media.images.length,
          audio: formData.media.audio.length,
          video: formData.media.video.length
        }
      });

      // Prepare incident data in the format expected by the backend
      // Note: reportedBy will be set automatically by the backend using the authenticated user
      const incidentData = {
        type: formData.type,
        description: formData.description,
        location: {
          type: 'Point',
          coordinates: formData.location.coordinates,
          address: formData.location.address || 'Location not specified'
        },
        media: {
          images: formData.media.images.map(file => ({
            url: file.url,
            filename: file.filename,
            size: file.size
          })),
          audio: formData.media.audio.map(file => ({
            url: file.url,
            filename: file.filename,
            size: file.size
          })),
          video: formData.media.video.map(file => ({
            url: file.url,
            filename: file.filename,
            size: file.size
          }))
        }
      };

      console.log('Sending incident data:', incidentData);

      await incidentService.createIncident(incidentData);
      navigate('/home', { state: { incidentCreated: true } });
    } catch (err) {
      console.error('Full error object:', err);
      setError(err.message || 'Failed to create incident. Please try again.');
    } finally {
      setLoading(false);
    }
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

  const handleDeleteFile = (type, index) => {
    setFormData(prev => ({
      ...prev,
      media: {
        ...prev.media,
        [type]: prev.media[type].filter((_, i) => i !== index)
      }
    }));

    // Update previews
    if (type === 'images' || type === 'video') {
      setPreviews(prev => ({
        ...prev,
        [type]: prev[type].filter((_, i) => i !== index)
      }));
    }

    // Adjust current index if necessary
    setCurrentFileIndices(prev => {
      const newLength = formData.media[type].length - 1;
      const currentIdx = prev[type];
      return {
        ...prev,
        [type]: currentIdx >= newLength ? Math.max(0, newLength - 1) : currentIdx
      };
    });
  };

  const renderFilePreview = (type, file, index, total) => {
    const isImage = type === 'images';
    const isVideo = type === 'video';
    const isAudio = type === 'audio';
    const currentIndex = currentFileIndices[type];

    // Get preview URL for images and videos
    let previewUrl = null;
    if (type === 'images' && previews.images[currentIndex]) {
      previewUrl = previews.images[currentIndex];
    } else if (type === 'video' && previews.video[currentIndex]) {
      previewUrl = previews.video[currentIndex];
    } else if (file.url) {
      // Fallback to file URL if preview not available
      previewUrl = file.url.startsWith('blob:') ? file.url : `http://localhost:5000${file.url}`;
    }

    // Get audio URL
    let audioUrl = null;
    if (isAudio && file.url) {
      audioUrl = file.url.startsWith('blob:') ? file.url : `http://localhost:5000${file.url}`;
    }

    // Only show the current file based on the currentIndex for this type
    if (index !== currentIndex) return null;

    return (
      <div className="file-preview-container" key={`${type}-${index}`}>
        <div className="file-preview">
          {isImage && previewUrl && (
            <img
              src={previewUrl}
              alt={`Preview ${currentIndex + 1}`}
              onError={(e) => {
                console.log('Image failed to load:', previewUrl);
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          )}
          {isImage && (
            <div className="file-placeholder" style={{ display: 'none' }}>
              <div className="placeholder-content">
                <span>📷</span>
                <span>Image: {file.filename}</span>
                {file.size && <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>}
              </div>
            </div>
          )}

          {isVideo && previewUrl && (
            <video
              src={previewUrl}
              controls
              onError={(e) => {
                console.log('Video failed to load:', previewUrl);
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          )}
          {isVideo && (
            <div className="file-placeholder" style={{ display: 'none' }}>
              <div className="placeholder-content">
                <span>🎥</span>
                <span>Video: {file.filename}</span>
                {file.size && <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>}
              </div>
            </div>
          )}

          {isAudio && (
            <div className="audio-preview">
              {audioUrl ? (
                <audio
                  src={audioUrl}
                  controls
                  onError={(e) => {
                    console.log('Audio failed to load:', audioUrl);
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="audio-placeholder">
                  <span>🎵</span>
                  <span>Audio file not available</span>
                </div>
              )}
              <div className="audio-info">
                <span className="audio-filename">{file.filename}</span>
                {file.size && (
                  <span className="audio-size">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="file-controls">
          <div className="file-counter">{currentIndex + 1}/{total}</div>

          {total > 1 && (
            <div className="navigation-buttons">
              <button
                type="button"
                className="nav-button prev-button"
                onClick={() => handlePreviousFile(type)}
                disabled={currentIndex === 0}
              >
                ‹
              </button>
              <button
                type="button"
                className="nav-button next-button"
                onClick={() => handleNextFile(type)}
                disabled={currentIndex === total - 1}
              >
                ›
              </button>
            </div>
          )}

          {/* Only show delete button if not in view mode (i.e., user is creating/editing, not admin viewing) */}
          {!viewMode && (
            <button
              type="button"
              className="delete-button"
              onClick={() => handleDeleteFile(type, currentIndex)}
            >
              ×
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading && viewMode) {
    return (
      <div className="incident-details-container">
        <div className="incident-details-card">
          <div className="incident-header">
            <button className="back-button" onClick={handleBack}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
              </svg>
            </button>
            <h2>Loading...</h2>
          </div>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading incident details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && viewMode) {
    return (
      <div className="incident-details-container">
        <div className="incident-details-card">
          <div className="incident-header">
            <button className="back-button" onClick={handleBack}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
              </svg>
            </button>
            <h2>Error</h2>
          </div>
          <div className="error-container">
            <p>{error}</p>
            <button onClick={fetchIncidentDetails} className="retry-button">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              {formData.location.address || 'Choose Incident Location'}
            </button>
          )}

          {viewMode ? (
            <div className="status-display">
              <strong>Status:</strong> {formData.status}
            </div>
          ) : (
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
            {formData.media.images.map((file, index) => (
              renderFilePreview('images', file, index, formData.media.images.length))
            )}
          </div>

          <div className="preview-section">
            {formData.media.audio.map((file, index) => (
              renderFilePreview('audio', file, index, formData.media.audio.length))
            )}
          </div>

          <div className="preview-section">
            {formData.media.video.map((file, index) => (
              renderFilePreview('video', file, index, formData.media.video.length))
            )}
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

export default IncidentDetails;