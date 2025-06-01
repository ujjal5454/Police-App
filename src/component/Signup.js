import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';
import { provinces, districtsByProvince, getMunicipalitiesForDistrict } from '../data/nepal-data';
import { authService } from '../services/api';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    mobileNumber: '',
    email: '',
    password: '',
    province: '',
    district: '',
    municipality: ''
  });

  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showMunicipalityModal, setShowMunicipalityModal] = useState(false);

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const userData = {
        name: `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        mobileNumber: formData.mobileNumber,
        address: {
          province: formData.province,
          district: formData.district,
          municipality: formData.municipality
        }
      };

      await authService.register(userData);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    }
  };

  const handleProvinceSelect = (province) => {
    setFormData(prev => ({
      ...prev,
      province: province,
      district: '',
      municipality: ''
    }));
    setShowProvinceModal(false);
  };

  const handleDistrictSelect = (district) => {
    setFormData(prev => ({
      ...prev,
      district: district,
      municipality: ''
    }));
    setShowDistrictModal(false);
  };

  const handleMunicipalitySelect = (municipality) => {
    setFormData(prev => ({
      ...prev,
      municipality: municipality
    }));
    setShowMunicipalityModal(false);
  };

  // Get available districts based on selected province
  const getAvailableDistricts = () => {
    return districtsByProvince[formData.province] || [];
  };

  // Get available municipalities based on selected district
  const getAvailableMunicipalities = () => {
    const municipalities = getMunicipalitiesForDistrict(formData.district);
    console.log('Selected District:', formData.district);
    console.log('Available Municipalities:', municipalities);
    return municipalities;
  };



  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <button className="back-button" onClick={() => navigate('/')}>
            ←
          </button>
          <h1>Sign Up</h1>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-section">
            <h2>Personal Information</h2>
            
            <div className="input-group full-width">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="name-row">
              <div className="input-group">
                <input
                  type="text"
                  name="middleName"
                  placeholder="Middle Name"
                  value={formData.middleName}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <input
                type="tel"
                name="mobileNumber"
                placeholder="Mobile Number"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
              />
              <img src={require("../assets/icons/phone.png")} alt="Phone" className="input-icon" />
            </div>

            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <img src={require("../assets/icons/email.png")} alt="Email" className="input-icon" />
            </div>

            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
              <img src={require("../assets/icons/hide.png")} alt="Password" className="input-icon" />
            </div>

            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="form-section">
            <h2>Provide your address</h2>
            
            <div className="address-row">
              <div className="input-group" onClick={() => setShowProvinceModal(true)}>
                <input
                  type="text"
                  name="province"
                  placeholder="Province"
                  value={formData.province}
                  onChange={handleChange}
                  required
                  readOnly
                />
                <img src={require("../assets/icons/down.png")} alt="Select" className="input-icon" />
              </div>

              <div className="input-group" onClick={() => formData.province && setShowDistrictModal(true)}>
                <input
                  type="text"
                  name="district"
                  placeholder="District"
                  value={formData.district}
                  onChange={handleChange}
                  required
                  readOnly
                />
                <img src={require("../assets/icons/down.png")} alt="Select" className="input-icon" />
              </div>
            </div>

            <div className="input-group" onClick={() => formData.district && setShowMunicipalityModal(true)}>
              <input
                type="text"
                name="municipality"
                placeholder="Select Your Municipality"
                value={formData.municipality}
                onChange={handleChange}
                required
                readOnly
              />
              <img src={require("../assets/icons/down.png")} alt="Select" className="input-icon" />
            </div>
          </div>

          
          <button type="submit" className="next-button">Next</button>

          <div className="login-link">
            <p>Already have an account? <button 
              className="signin-link-button"
              onClick={() => navigate('/')}
            >Sign In</button></p>
          </div>
        </form>

        {showProvinceModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Select Your Province</h2>
                <button className="close-button" onClick={() => setShowProvinceModal(false)}>×</button>
              </div>
              <div className="modal-body">
                {provinces.map((province, index) => (
                  <div
                    key={index}
                    className="modal-item"
                    onClick={() => handleProvinceSelect(province)}
                  >
                    {province}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showDistrictModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Select Your District</h2>
                <button className="close-button" onClick={() => setShowDistrictModal(false)}>×</button>
              </div>
              <div className="modal-body">
                {getAvailableDistricts().map((district, index) => (
                  <div
                    key={index}
                    className="modal-item"
                    onClick={() => handleDistrictSelect(district)}
                  >
                    {district}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showMunicipalityModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Select Your Municipality</h2>
                <button className="close-button" onClick={() => setShowMunicipalityModal(false)}>×</button>
              </div>
              <div className="modal-body">
                {getAvailableMunicipalities().map((municipality, index) => (
                  <div
                    key={index}
                    className="modal-item"
                    onClick={() => handleMunicipalitySelect(municipality)}
                  >
                    {municipality}
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

export default Signup;
