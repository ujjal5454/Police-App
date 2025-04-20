import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReportIncident.css';

// Import icons
import domesticViolenceIcon from '../assets/icons/domestic-violence.png';
import attemptToMurderIcon from '../assets/icons/attempt-murder.png';
import kidnappingIcon from '../assets/icons/kidnapping.png';
import fraudIcon from '../assets/icons/fraud.png';
import sexualHarassmentIcon from '../assets/icons/sexual-harassment.png';
import drugsIcon from '../assets/icons/drugs.png';
import theftIcon from '../assets/icons/theft.png';
import accidentIcon from '../assets/icons/accident.png';
import missingPersonIcon from '../assets/icons/missing-person.png';
import explosivesIcon from '../assets/icons/explosives.png';
import othersIcon from '../assets/icons/others.png';
import trafficViolationsIcon from '../assets/icons/traffic-violations.png';
import wildlifeIcon from '../assets/icons/wildlife.png';
import disasterIcon from '../assets/icons/disaster.png';
import infoIcon from '../assets/icons/info.png';

const ReportIncident = () => {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);

  const handleBack = () => {
    navigate('/home');
  };

  const handleIncidentSelect = (incident) => {
    navigate('/incident-details', { 
      state: { 
        incidentType: incident.title.replace('\n', ' '),
        fromReportIncident: true
      }
    });
  };

  const incidents = [
    {
      id: 1,
      icon: domesticViolenceIcon,
      title: 'Domestic\nViolence'
    },
    {
      id: 2,
      icon: attemptToMurderIcon,
      title: 'Attempt to\nMurder'
    },
    {
      id: 3,
      icon: kidnappingIcon,
      title: 'Kidnapping'
    },
    {
      id: 4,
      icon: fraudIcon,
      title: 'Fraud'
    },
    {
      id: 5,
      icon: sexualHarassmentIcon,
      title: 'Sexual\nHarrasment'
    },
    {
      id: 6,
      icon: drugsIcon,
      title: 'Drugs'
    },
    {
      id: 7,
      icon: theftIcon,
      title: 'Theft'
    },
    {
      id: 8,
      icon: accidentIcon,
      title: 'Accident'
    },
    {
      id: 9,
      icon: missingPersonIcon,
      title: 'Missing Person'
    },
    {
      id: 10,
      icon: explosivesIcon,
      title: 'Explosives/\nWeapons'
    },
    {
      id: 11,
      icon: othersIcon,
      title: 'Others'
    },
    {
      id: 12,
      icon: trafficViolationsIcon,
      title: 'Traffic Violations'
    },
    {
      id: 13,
      icon: wildlifeIcon,
      title: 'Wildlife related'
    },
    {
      id: 14,
      icon: disasterIcon,
      title: 'Disaster'
    }
  ];

  return (
    <div className="report-container">
      <div className={`report-card ${showInfo ? 'blur-background' : ''}`}>
        <div className="report-header">
          <button className="back-button" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
            </svg>
          </button>
          <h1>Report Incident</h1>
          <button className="info-button" onClick={() => setShowInfo(true)}>
            <img src={infoIcon} alt="Information" />
          </button>
        </div>

        <div className="incidents-grid">
          {incidents.map(incident => (
            <div 
              key={incident.id} 
              className="incident-item" 
              onClick={() => handleIncidentSelect(incident)}
            >
              <img src={incident.icon} alt={incident.title} />
              <p>{incident.title}</p>
            </div>
          ))}
        </div>
      </div>

      {showInfo && (
        <div className="info-modal">
          <div className="info-content">
            <h2>Information</h2>
            <div className="info-section">
              <h3>Report an Incident</h3>
              <p>Report incident is used to report different types of incidents that have taken place around you. You can view the incident details reported by you in the "My incidents" section.</p>
              </div>
            <div className="info-section">
              <h3>Service Details</h3>
              <p>The following types of incidents can be reported through this incident report.</p>
              <ul>
                <li>Accident</li>
                <li>Explosives/Weapons</li>
                <li>Missing person</li>
                <li>Theft</li>
                <li>Drugs</li>
                <li>Attempt to Murder</li>
                <li>Domestic Violence</li>
                <li>Sexual Harrasment</li>
                <li>Kidnapping</li>
                <li>Flood</li>
                <li>Landslide</li>
                <li>Other</li>
              </ul>
            </div>
            <div className="info-section">
              <h3>Office Responsible for Implementation of the Service</h3>
              <ul>
                <li>Operation unit,Police Headquarters,Naxal</li>
                <li>Control Room, Valley Police Office, Ranipokhari</li>
                <li>Province Police Offices</li>
                <li>District Police Offices</li>
              </ul>
            </div>
            <button className="close-button" onClick={() => setShowInfo(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportIncident; 