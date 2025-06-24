import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './EComplaint.css';
import imageIcon from '../assets/icons/image.png';
import audioIcon from '../assets/icons/audio.png';
import videoIcon from '../assets/icons/video.png';
import axios from 'axios';

const EComplaint = () => {
  const navigate = useNavigate();
  const locationState = useLocation();
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [selectedComplaintType, setSelectedComplaintType] = useState('');
  const [showComplaintTypeModal, setShowComplaintTypeModal] = useState(false);
  const [images, setImages] = useState([]);
  const [audios, setAudios] = useState([]);
  const [videos, setVideos] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const complaintTypes = [
    {
      id: 1,
      title: "Police Service Not Received",
      titleNepali: "पुलिस सेवा प्राप्त नभएको"
    },
    {
      id: 2,
      title: "Police Personnel's Grievances or Complaints",
      titleNepali: "पुलिस कर्मचारीको आचरण वीरुद्धको गुनासो"
    },
    {
      id: 3,
      title: "Abuse To Service Recipients",
      titleNepali: "सेवाग्राहीलाई दुर्व्यवहार/अपमान व्यवहार"
    },
    {
      id: 4,
      title: "Misuse of authority",
      titleNepali: "पदिय दुरुपयोग गरी अनावश्यक दबाब दिएमा"
    },
    {
      id: 5,
      title: "Seeking financial gain",
      titleNepali: "आर्थिक लाभ लिन खोजेको"
    },
    {
      id: 6,
      title: "Involved In Sexual Activity",
      titleNepali: "यौनजन्य गतिविधिमा संलग्न भएमा"
    },
    {
      id: 7,
      title: "Misuse Of Social Media By Police Personnel",
      titleNepali: "पुलिस कर्मचारीद्वारा पदिय मर्यादा विपरीत सामाजिक सञ्जालको दुरुपयोग"
    },
    {
      id: 8,
      title: "Other Action (Police Work Related)",
      titleNepali: "अन्य पुलिस काम कारबाही सम्बन्धी"
    }
  ];

  // Handle location updates from LocationPicker
  useEffect(() => {
    if (locationState.state?.fromEComplaint &&
        locationState.state?.selectedLocation &&
        locationState.state?.previousFormData) {

      const prevData = locationState.state.previousFormData;

      // Restore form data
      setDescription(prevData.description || '');
      setSelectedComplaintType(prevData.selectedComplaintType || '');
      setLocation(locationState.state.selectedLocation.address || '');

      // Restore media files
      if (prevData.media) {
        setImages(prevData.media.images || []);
        setAudios(prevData.media.audio || []);
        setVideos(prevData.media.video || []);
      }
    }
  }, [locationState.key, locationState.state]);

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up all blob URLs to prevent memory leaks
      images.forEach(image => {
        if (image.url) URL.revokeObjectURL(image.url);
      });
      audios.forEach(audio => {
        if (audio.url) URL.revokeObjectURL(audio.url);
      });
      videos.forEach(video => {
        if (video.url) URL.revokeObjectURL(video.url);
      });
    };
  }, []);

  const handleBack = () => {
    navigate('/home');
  };

  const handleComplaintTypeSelect = (complaintType) => {
    setSelectedComplaintType(complaintType.title);
    setShowComplaintTypeModal(false);
  };

  const handleLocationSelect = () => {
    const currentState = {
      previousFormData: {
        description: description,
        selectedComplaintType: selectedComplaintType,
        media: {
          images: images,
          audio: audios,
          video: videos
        }
      },
      fromEComplaint: true,
      selectedLocation: location ? { address: location } : null
    };

    navigate('/location-picker', { state: currentState });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const blobUrl = URL.createObjectURL(file);
        setImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          file: file,
          url: blobUrl,
          name: file.name,
          size: file.size
        }]);
      }
    });
    // Clear the input value to allow re-uploading the same file
    e.target.value = '';
  };

  const handleAudioUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('audio/')) {
        const blobUrl = URL.createObjectURL(file);
        setAudios(prev => [...prev, {
          id: Date.now() + Math.random(),
          file: file,
          url: blobUrl,
          name: file.name,
          size: file.size
        }]);
      }
    });
    // Clear the input value to allow re-uploading the same file
    e.target.value = '';
  };

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('video/')) {
        const blobUrl = URL.createObjectURL(file);
        setVideos(prev => [...prev, {
          id: Date.now() + Math.random(),
          file: file,
          url: blobUrl,
          name: file.name,
          size: file.size
        }]);
      }
    });
    // Clear the input value to allow re-uploading the same file
    e.target.value = '';
  };

  const removeImage = (id) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove && imageToRemove.url) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter(img => img.id !== id);
    });
    if (currentImageIndex >= images.length - 1) {
      setCurrentImageIndex(Math.max(0, images.length - 2));
    }
  };

  const removeAudio = (id) => {
    setAudios(prev => {
      const audioToRemove = prev.find(audio => audio.id === id);
      if (audioToRemove && audioToRemove.url) {
        URL.revokeObjectURL(audioToRemove.url);
      }
      return prev.filter(audio => audio.id !== id);
    });
  };

  const removeVideo = (id) => {
    setVideos(prev => {
      const videoToRemove = prev.find(video => video.id === id);
      if (videoToRemove && videoToRemove.url) {
        URL.revokeObjectURL(videoToRemove.url);
      }
      return prev.filter(video => video.id !== id);
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    if (!location.trim()) {
      setError('Please choose a location');
      return;
    }

    if (!selectedComplaintType) {
      setError('Please select nature of complaint');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare complaint data (following incident pattern exactly)
      const complaintData = {
        type: selectedComplaintType,
        description: description.trim(),
        location: {
          type: 'Point',
          coordinates: [27.7172, 85.3240], // Default coordinates, will be updated by location picker
          address: location
        },
        media: {
          images: images.map(img => ({
            url: img.url,
            filename: img.name,
            size: img.size
          })),
          audio: audios.map(audio => ({
            url: audio.url,
            filename: audio.name,
            size: audio.size
          })),
          video: videos.map(video => ({
            url: video.url,
            filename: video.name,
            size: video.size
          }))
        }
      };

      console.log('Submitting e-complaint to MongoDB (incident pattern):', complaintData);

      // Submit to MongoDB via API (same as incident)
      const response = await axios.post('http://localhost:5000/api/ecomplaints', complaintData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });

      console.log('E-complaint saved successfully:', response.data);

      // Success - show success message
      const complaint = response.data.complaint;
      alert(`Complaint submitted successfully!\nComplaint ID: ${complaint._id}\nStatus: ${complaint.status.toUpperCase()}\nThank you for your submission.`);

      // Clear form and navigate back
      setDescription('');
      setLocation('');
      setSelectedComplaintType('');
      setImages([]);
      setAudios([]);
      setVideos([]);

      navigate('/home');
    } catch (err) {
      console.error('Failed to submit complaint:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit complaint';
      setError(`Failed to submit complaint: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ecomplaint-container">
      <div className="ecomplaint-card">
        <div className="ecomplaint-header">
          <button className="back-button" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
            </svg>
          </button>
          <h2>e-Complaint</h2>
          <button className="info-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="ecomplaint-form">
          <textarea
            className="description-input"
            placeholder="Enter Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <div className="location-selector" onClick={handleLocationSelect}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#1976D2">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span>{location || 'Choose Incident Location'}</span>
          </div>

          <div
            className="complaint-type-selector"
            onClick={() => setShowComplaintTypeModal(true)}
          >
            <span className="select-text">
              {selectedComplaintType || 'Select'} <span className="required">*</span>
            </span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </div>

          {/* Upload sections - exact copy from IncidentDetails */}
          <div className="upload-sections">
            <div className="upload-section">
              <label htmlFor="image-upload">
                <img src={imageIcon} alt="Image" className="upload-icon" />
                Image - {images.length} Files
                <span style={{ marginLeft: 'auto', fontSize: '14px', color: '#666' }}>
                  {formatFileSize(images.reduce((total, img) => total + img.size, 0))} MB / 25
                </span>
              </label>
              <input
                id="image-upload"
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />
            </div>

            <div className="upload-section">
              <label htmlFor="audio-upload">
                <img src={audioIcon} alt="Audio" className="upload-icon" />
                Audio - {audios.length} Files
                <span style={{ marginLeft: 'auto', fontSize: '14px', color: '#666' }}>
                  {formatFileSize(audios.reduce((total, audio) => total + audio.size, 0))} MB / 5
                </span>
              </label>
              <input
                id="audio-upload"
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                multiple
                onChange={handleAudioUpload}
              />
            </div>

            <div className="upload-section">
              <label htmlFor="video-upload">
                <img src={videoIcon} alt="Video" className="upload-icon" />
                Video - {videos.length} Files
                <span style={{ marginLeft: 'auto', fontSize: '14px', color: '#666' }}>
                  {formatFileSize(videos.reduce((total, video) => total + video.size, 0))} MB / 30
                </span>
              </label>
              <input
                id="video-upload"
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideoUpload}
              />
            </div>
          </div>

          {/* File Previews */}
          {images.length > 0 && (
            <div className="preview-section">
              <h3>Images ({images.length})</h3>
              {images.map((image, index) => (
                <div key={image.id} className="file-preview-container">
                  <div className="file-preview">
                    <img src={image.url} alt={`Preview ${index + 1}`} />
                  </div>
                  <div className="file-controls">
                    <div className="file-counter">{index + 1}/{images.length}</div>
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => removeImage(image.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {audios.length > 0 && (
            <div className="preview-section">
              <h3>Audio Files ({audios.length})</h3>
              {audios.map((audio, index) => (
                <div key={audio.id} className="file-preview-container">
                  <div className="audio-preview">
                    <audio src={audio.url} controls />
                    <div className="audio-info">
                      <span className="audio-filename">{audio.name}</span>
                      <span className="audio-size">{(audio.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                  </div>
                  <div className="file-controls">
                    <div className="file-counter">{index + 1}/{audios.length}</div>
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => removeAudio(audio.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {videos.length > 0 && (
            <div className="preview-section">
              <h3>Videos ({videos.length})</h3>
              {videos.map((video, index) => (
                <div key={video.id} className="file-preview-container">
                  <div className="file-preview">
                    <video src={video.url} controls />
                  </div>
                  <div className="file-controls">
                    <div className="file-counter">{index + 1}/{videos.length}</div>
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => removeVideo(video.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </form>

        {/* Complaint Type Modal */}
        {showComplaintTypeModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Nature of your complaint</h2>
                <button
                  className="close-button"
                  onClick={() => setShowComplaintTypeModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                {complaintTypes.map((complaintType) => (
                  <div
                    key={complaintType.id}
                    className="modal-item"
                    onClick={() => handleComplaintTypeSelect(complaintType)}
                  >
                    <div className="complaint-item">
                      <h3>{complaintType.title}</h3>
                      <p>{complaintType.titleNepali}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EComplaint;
