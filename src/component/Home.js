import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Home.css';
import logo from '../assets/logo.png';
import homeIcon from '../assets/icons/home.png';
import publicEyeIcon from '../assets/icons/public-eye.png';
import settingsIcon from '../assets/icons/settings.png';

// Import icons
import reportIcon from '../assets/icons/report.png';
import myIncidentsIcon from '../assets/icons/my-incidents.png';
import emergencyIcon from '../assets/icons/emergency.png';
import newsIcon from '../assets/icons/news.png';
import noticeIcon from '../assets/icons/notice.png';
import fmIcon from '../assets/icons/fm.png';
import stationsIcon from '../assets/icons/stations.png';
import clearanceIcon from '../assets/icons/clearance.png';
import complaintIcon from '../assets/icons/complaint.png';
import trafficIcon from '../assets/icons/traffic.png';
import bellIcon from '../assets/icons/bell.png';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const showSignIn = location.state?.fromSkip;

  const handleServiceClick = (title) => {
    switch (title) {
      case 'Report Incident':
        navigate('/report-incident');
        break;
      case 'My Incidents':
        navigate('/my-incidents');
        break;
      case 'Emergency Numbers':
        navigate('/emergency-contact');
        break;
      case 'News':
        navigate('/news');
        break;
      default:
        // Handle other services
        break;
    }
  };

  const services = [
    {
      id: 1,
      icon: reportIcon,
      title: 'Report Incident'
    },
    {
      id: 2,
      icon: myIncidentsIcon,
      title: 'My Incidents'
    },
    {
      id: 3,
      icon: emergencyIcon,
      title: 'Emergency Numbers'
    },
    {
      id: 4,
      icon: newsIcon,
      title: 'News'
    },
    {
      id: 5,
      icon: noticeIcon,
      title: 'Notice'
    },
    {
      id: 6,
      icon: fmIcon,
      title: 'FM'
    },
    {
      id: 7,
      icon: stationsIcon,
      title: 'Police Stations Nearby'
    },
    {
      id: 8,
      icon: clearanceIcon,
      title: 'Police Clearance Report'
    },
    {
      id: 9,
      icon: complaintIcon,
      title: 'e-Complaint'
    },
    {
      id: 10,
      icon: trafficIcon,
      title: 'Traffic Services'
    }
  ];

  return (
    <div className="home-container">
      <div className="home-card">
        <div className="home-header">
          <div className="logo-section">
            <div className="logo-text-section">
              <img src={logo} alt="Nepal Police Logo" className="logo" />
              <div className="header-actions">
                {showSignIn && (
                  <button className="sign-in-btn" onClick={() => navigate('/')}>
                    Sign In
                  </button>
                )}
                <button className="notification-btn">
                  <img src={bellIcon} alt="Notifications" />
                </button>
              </div>
            </div>
            <div className="header-text">
              <h1>Jay Nepal</h1>
              <p>Welcome to Nepal Police App. Please sign in to explore all our services.</p>
            </div>
          </div>
        </div>
        
        <div className="services-grid">
          {services.map(service => (
            <div 
              key={service.id} 
              className="service-item"
              onClick={() => handleServiceClick(service.title)}
            >
              <img src={service.icon} alt={service.title} />
              <p>{service.title}</p>
            </div>
          ))}
        </div>

        <div className="bottom-nav">
          <button className="nav-btn active">
            <img src={homeIcon} alt="Home" />
            <span>Home</span>
          </button>
          <div className="fab-center" onClick={() => navigate('/public-eye')}>
            <img src={publicEyeIcon} alt="Public Eye" />
            <span>Public Eye</span>
          </div>
          <button className="home-nav-btn" onClick={() => navigate('/settings')}>
            <img src={settingsIcon} alt="Settings" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home; 