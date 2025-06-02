import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EmergencyContact.css';

// Import emergency service icons (using proper emergency service icons)
import bloodBankIcon from '../assets/icons/blood-bank.png';
import hospitalIcon from '../assets/icons/hospital.png';
import fireBrigadeIcon from '../assets/icons/fire-brigade.png';
import ambulanceIcon from '../assets/icons/ambulance.png';
import policeIcon from '../assets/icons/police.png';
import phoneIcon from '../assets/icons/phone.png'; // Phone icon for call indication

const EmergencyContact = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/home');
  };

  const handleEmergencyCall = (service) => {
    // Navigate to respective component pages
    switch (service.title) {
      case 'Blood Bank':
        navigate('/blood-bank');
        return;
      case 'Hospital':
        navigate('/hospital');
        return;
      case 'Fire Brigade':
        navigate('/fire-brigade');
        return;
      case 'Ambulance':
        navigate('/ambulance');
        return;
      case 'Police':
        navigate('/police');
        return;
      default:
        // Fallback to phone call
        window.location.href = `tel:100`;
    }
  };

  const emergencyServices = [
    {
      id: 1,
      icon: bloodBankIcon,
      title: 'Blood Bank',
      number: '1660'
    },
    {
      id: 2,
      icon: hospitalIcon,
      title: 'Hospital',
      number: '102'
    },
    {
      id: 3,
      icon: fireBrigadeIcon,
      title: 'Fire Brigade',
      number: '101'
    },
    {
      id: 4,
      icon: ambulanceIcon,
      title: 'Ambulance',
      number: '102'
    },
    {
      id: 5,
      icon: policeIcon,
      title: 'Police',
      number: '100'
    }
  ];

  return (
    <div className="emergency-contact-container">
      <div className="emergency-contact-card">
        <div className="emergency-header">
          <button className="emergency-back-btn" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
            </svg>
          </button>
          <h1>Emergency Contact</h1>
          <div className="emergency-spacer"></div>
        </div>

        <div className="emergency-services-grid">
          {emergencyServices.map(service => (
            <div
              key={service.id}
              className="emergency-service-item"
              onClick={() => handleEmergencyCall(service)}
            >
              <div className="emergency-icon-container">
                <img src={service.icon} alt={service.title} />
                <div className="phone-indicator">
                  <img src={phoneIcon} alt="Call" className="phone-icon" />
                </div>
              </div>
              <p className="emergency-service-title">{service.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmergencyContact;
