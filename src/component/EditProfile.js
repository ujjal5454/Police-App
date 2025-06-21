import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './EditProfile.css';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(() => {
    // Parse existing name into first, middle, last
    const nameParts = user?.name?.split(' ') || ['Ujjal', 'Basnet'];
    const firstName = nameParts[0] || 'Ujjal';
    const lastName = nameParts[nameParts.length - 1] || 'Basnet';
    const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

    return {
      firstName,
      middleName,
      lastName,
      phone: user?.phone || '9849496614',
      email: user?.email || 'ujjalbasnet869@gmail.com',
      dateOfBirth: user?.dateOfBirth || '',
      province: user?.address?.province || 'Lumbini Province',
      district: user?.address?.district || 'Arghakhanchi',
      municipality: user?.address?.municipality || 'Sandhikharka',
      wardNo: user?.address?.wardNo || '',
      houseNo: user?.address?.houseNo || '',
      street: user?.address?.street || ''
    };
  });

  const [profileImagePreview, setProfileImagePreview] = useState(user?.profilePhoto || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const provinces = [
    'Province No. 1',
    'Madhesh Province',
    'Bagmati Province',
    'Gandaki Province',
    'Lumbini Province',
    'Karnali Province',
    'Sudurpashchim Province'
  ];

  const districts = {
    'Lumbini Province': ['Arghakhanchi', 'Banke', 'Bardiya', 'Dang', 'Gulmi', 'Kapilvastu', 'Nawalparasi East', 'Nawalparasi West', 'Palpa', 'Pyuthan', 'Rolpa', 'Rukum East'],
    'Bagmati Province': ['Bhaktapur', 'Chitwan', 'Dhading', 'Dolakha', 'Kathmandu', 'Kavrepalanchok', 'Lalitpur', 'Makwanpur', 'Nuwakot', 'Ramechhap', 'Rasuwa', 'Sindhuli', 'Sindhupalchok'],
    // Add more districts for other provinces as needed
  };

  const handleBack = () => {
    navigate('/settings');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setFormData(prev => ({
      ...prev,
      province,
      district: '', // Reset district when province changes
      municipality: '' // Reset municipality when province changes
    }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const compressImage = (file, maxWidth = 400, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }

      try {
        // Compress the image
        const compressedImage = await compressImage(file);
        setProfileImagePreview(compressedImage);
        setError(''); // Clear any previous errors
      } catch (error) {
        console.error('Error compressing image:', error);
        setError('Failed to process image. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Build full name including middle name if provided
      const fullName = [formData.firstName, formData.middleName, formData.lastName]
        .filter(name => name && name.trim()) // Remove empty names
        .join(' ');

      const updateData = {
        name: fullName,
        phone: formData.phone,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth || null,
        address: {
          province: formData.province,
          district: formData.district,
          municipality: formData.municipality,
          wardNo: formData.wardNo,
          houseNo: formData.houseNo,
          street: formData.street
        }
      };

      // Add profile photo if it was updated
      if (profileImagePreview && profileImagePreview !== user?.profilePhoto) {
        updateData.profilePhoto = profileImagePreview;
      }

      console.log('Sending update data:', updateData);

      const response = await axios.patch(
        'http://localhost:5000/api/auth/profile',
        updateData,
        { withCredentials: true }
      );

      console.log('Update response:', response.data);

      // Update user context with new data
      updateUser(response.data.user);

      setSuccess('Profile updated successfully!');

      // Redirect to settings after 2 seconds
      setTimeout(() => {
        navigate('/settings');
      }, 2000);

    } catch (err) {
      console.error('Error updating profile:', err);
      if (err.response?.status === 413) {
        setError('Profile photo is too large. Please choose a smaller image.');
      } else {
        setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        {/* Header */}
        <div className="edit-profile-header">
          <button className="back-button" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="white"/>
            </svg>
          </button>
          <h1>Edit Profile</h1>
          <div className="header-spacer"></div>
        </div>

        {/* Content */}
        <div className="edit-profile-content">
          <form onSubmit={handleSubmit} className="edit-profile-form">
            {/* Profile Image */}
            <div className="profile-image-section">
              <div className="profile-image-container" onClick={handleImageClick}>
                <div className="profile-image">
                  {profileImagePreview ? (
                    <img src={profileImagePreview} alt="Profile" />
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#999"/>
                    </svg>
                  )}
                </div>
                <div className="camera-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.65-.07-.97l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.32-.07.65-.07.97c0 .33.03.65.07.97L2.46 14.4c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.31.61.22l2.49-1c.52.39 1.06.73 1.69.98l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.25 1.17-.59 1.69-.98l2.49 1c.22.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.63Z" fill="white"/>
                  </svg>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>

            {/* Personal Information */}
            <div className="section">
              <h2 className="section-title">Personal Information</h2>
              
              {/* First Name */}
              <div className="input-group">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              {/* Middle Name and Last Name */}
              <div className="input-row">
                <div className="input-group half">
                  <input
                    type="text"
                    name="middleName"
                    placeholder="Middle Name"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="input-group half">
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="input-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
                <div className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="#666"/>
                  </svg>
                </div>
              </div>

              {/* Email */}
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
                <div className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#666"/>
                  </svg>
                </div>
              </div>

              {/* Date of Birth */}
              <div className="input-group">
                <input
                  type="date"
                  name="dateOfBirth"
                  placeholder="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="form-input"
                />
                <div className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" fill="#666"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="section">
              <h2 className="section-title">Provide your address</h2>
              
              {/* Province and District */}
              <div className="input-row">
                <div className="input-group half">
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleProvinceChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Province</option>
                    {provinces.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group half">
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select District</option>
                    {districts[formData.province]?.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Municipality */}
              <div className="input-group">
                <select
                  name="municipality"
                  value={formData.municipality}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Municipality</option>
                  <option value="Sandhikharka">Sandhikharka</option>
                  <option value="Sitganga">Sitganga</option>
                  <option value="Bhumikasthan">Bhumikasthan</option>
                  <option value="Chhatradev">Chhatradev</option>
                  <option value="Panini">Panini</option>
                  <option value="Malarani">Malarani</option>
                </select>
              </div>

              {/* Ward No */}
              <div className="input-group">
                <input
                  type="number"
                  name="wardNo"
                  placeholder="Ward No"
                  value={formData.wardNo}
                  onChange={handleInputChange}
                  className="form-input"
                  min="1"
                  max="35"
                />
              </div>

              {/* House No */}
              <div className="input-group">
                <input
                  type="text"
                  name="houseNo"
                  placeholder="House No"
                  value={formData.houseNo}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              {/* Street */}
              <div className="input-group">
                <input
                  type="text"
                  name="street"
                  placeholder="Street"
                  value={formData.street}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="success-message">
                {success}
              </div>
            )}

            {/* Update Button */}
            <button
              type="submit"
              className="update-button"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
