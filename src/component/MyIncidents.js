import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { incidentService } from '../services/api';
import './MyIncidents.css';

// Import incident icons
import domesticViolenceIcon from '../assets/icons/domestic-violence.png';
import theftIcon from '../assets/icons/theft.png';
import fraudIcon from '../assets/icons/fraud.png';
import explosivesIcon from '../assets/icons/explosives.png';
import othersIcon from '../assets/icons/others.png';
import accidentIcon from '../assets/icons/accident.png';
import attemptMurderIcon from '../assets/icons/attempt-murder.png';
import disasterIcon from '../assets/icons/disaster.png';
import drugsIcon from '../assets/icons/drugs.png';
import emergencyIcon from '../assets/icons/emergency.png';
import kidnappingIcon from '../assets/icons/kidnapping.png';
import missingPersonIcon from '../assets/icons/missing-person.png';
import sexualHarassmentIcon from '../assets/icons/sexual-harassment.png';
import trafficViolationsIcon from '../assets/icons/traffic-violations.png';
import wildlifeIcon from '../assets/icons/wildlife.png';

const NEPALI_MONTHS = [
  'Baishakh', 'Jestha', 'Ashadh', 'Shrawan',
  'Bhadra', 'Ashwin', 'Kartik', 'Mangsir',
  'Poush', 'Magh', 'Falgun', 'Chaitra'
];

const MyIncidents = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [incidents, setIncidents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all'
  });
  const [dateRange, setDateRange] = useState(() => {
    return location.state?.dateRange || null;
  });

  useEffect(() => {
    fetchIncidents();
  }, []);

  useEffect(() => {
    if (location.state?.dateRange) {
      setDateRange(location.state.dateRange);
      // Clear the location state to prevent re-applying filters on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      console.log('Fetching incidents...');
      const response = await incidentService.getAllIncidents();
      console.log('Incidents response:', response);

      if (response && Array.isArray(response)) {
        setIncidents(response);
        console.log('Set incidents:', response);
      } else if (response && response.data && Array.isArray(response.data)) {
        setIncidents(response.data);
        console.log('Set incidents from data:', response.data);
      } else {
        setIncidents([]);
        console.log('No incidents found, response:', response);
      }
    } catch (err) {
      console.error('Error fetching incidents:', err);
      setError('Failed to fetch incidents');
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/home');
  };

  const handleDateRangeClick = () => {
    navigate('/date-range-picker', {
      state: { currentDateRange: dateRange }
    });
  };

  const formatDateRange = () => {
    if (!dateRange?.startDate) return 'All Time';
    const start = `${dateRange.startDate.day} ${NEPALI_MONTHS[dateRange.startDate.month]}`;
    const end = dateRange.endDate 
      ? `${dateRange.endDate.day} ${NEPALI_MONTHS[dateRange.endDate.month]}`
      : 'Present';
    return `${start} - ${end}`;
  };

  const handleIncidentClick = (incident) => {
    navigate(`/incident-details/${incident._id}`, { 
      state: { 
        incident,
        fromMyIncidents: true
      } 
    });
  };

  const getIncidentIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'domestic violence':
        return <img src={domesticViolenceIcon} alt="Domestic Violence" />;
      case 'theft':
        return <img src={theftIcon} alt="Theft" />;
      case 'fraud':
        return <img src={fraudIcon} alt="Fraud" />;
      case 'explosives/weapons':
        return <img src={explosivesIcon} alt="Explosives/Weapons" />;
      case 'others':
        return <img src={othersIcon} alt="Others" />;
      case 'accident':
        return <img src={accidentIcon} alt="Accident" />;
      case 'attempt murder':
        return <img src={attemptMurderIcon} alt="Attempt Murder" />;
      case 'disaster':
        return <img src={disasterIcon} alt="Disaster" />;
      case 'drugs':
        return <img src={drugsIcon} alt="Drugs" />;
      case 'emergency':
        return <img src={emergencyIcon} alt="Emergency" />;
      case 'kidnapping':
        return <img src={kidnappingIcon} alt="Kidnapping" />;
      case 'missing person':
        return <img src={missingPersonIcon} alt="Missing Person" />;
      case 'sexual harassment':
        return <img src={sexualHarassmentIcon} alt="Sexual Harassment" />;
      case 'traffic violations':
        return <img src={trafficViolationsIcon} alt="Traffic Violations" />;
      case 'wildlife':
        return <img src={wildlifeIcon} alt="Wildlife" />;
      default:
        return <img src={othersIcon} alt="Unknown" />;
    }
  };

  const convertToBS = (adDate) => {
    if (!adDate) return '';
    
    const ad = new Date(adDate);
    const adYear = ad.getFullYear();
    const adMonth = ad.getMonth() + 1;
    const adDay = ad.getDate();

    let bsYear = adYear + 56;
    let bsMonth = adMonth;
    let bsDay = adDay + 16;
    
    if (bsDay > 32) {
      bsDay -= 32;
      bsMonth += 1;
    }
    if (bsMonth > 12) {
      bsMonth = 1;
      bsYear += 1;
    }

    return `${bsYear}-${String(bsMonth).padStart(2, '0')}-${String(bsDay).padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const bsDate = convertToBS(dateString);
    return `${year}-${month}-${day} (${bsDate} B.S)`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'acknowledged':
        return 'green';
      case 'rejected':
        return 'red';
      case 'pending':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const applyFilters = (incidentsToFilter) => {
    if (!Array.isArray(incidentsToFilter)) return [];
    
    return incidentsToFilter.filter(incident => {
      // Filter by search query
      const matchesSearch = incident.type?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by status
      const matchesStatus = filters.status === 'all' || 
                           incident.status?.toLowerCase() === filters.status.toLowerCase();
      
      // Filter by date range
      let matchesDate = true;
      if (dateRange?.startDate && incident.createdAt) {
        const incidentDate = new Date(incident.createdAt);
        const startYear = dateRange.startDate.year - 57; // Convert BS to AD
        const startMonth = dateRange.startDate.month;
        const startDay = dateRange.startDate.day;
        const startDate = new Date(startYear, startMonth, startDay);

        if (dateRange.endDate) {
          const endYear = dateRange.endDate.year - 57;
          const endMonth = dateRange.endDate.month;
          const endDay = dateRange.endDate.day;
          const endDate = new Date(endYear, endMonth, endDay);
          endDate.setHours(23, 59, 59);
          
          matchesDate = incidentDate >= startDate && incidentDate <= endDate;
        } else {
          matchesDate = incidentDate >= startDate;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  };

  const filteredIncidents = applyFilters(incidents);

  return (
    <div className="incidents-main-wrapper">
      <div className="incidents-content-card">
        <div className="incidents-top-header">
          <button className="header-back-btn" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
            </svg>
          </button>
          <h1>My Incidents</h1>
          <button className="header-filter-btn" onClick={() => setFilterOpen(!filterOpen)}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" fill="white"/>
            </svg>
          </button>
        </div>

      {filterOpen && (
        <div className="filter-menu">
          <div className="filter-section">
            <h4>Status</h4>
            <select 
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="filter-section">
            <h4>Date Range</h4>
            <button className="date-range-button" onClick={handleDateRangeClick}>
              {formatDateRange()}
              <svg className="edit-icon" width="16" height="16" viewBox="0 0 24 24">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#666"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="incidents-search-wrapper">
        <div className="incidents-search-input-container">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="incidents-search-field"
          />
          <svg className="incidents-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {error && <div className="incidents-error-msg">{error}</div>}
      </div>

      {loading ? (
        <div className="incidents-loading-msg">Loading incidents...</div>
      ) : filteredIncidents.length === 0 ? (
        <div className="incidents-no-data">No incidents found</div>
      ) : (
        <div className="incidents-data-list">
          {filteredIncidents.map((incident) => (
            <div
              key={incident._id}
              className="incidents-item-card"
              onClick={() => handleIncidentClick(incident)}
            >
              <div className="incidents-item-icon">
                {getIncidentIcon(incident.type)}
              </div>
              <div className="incidents-item-details">
                <h3>{incident.type || 'Unknown Type'}</h3>
                <div className="incidents-item-info">
                  <div className="incidents-item-info-left">
                    <p className="incidents-item-id">
                      <strong>Incident Id</strong>
                      {incident._id}
                    </p>
                    <div className="incidents-item-info-row">
                      <p className="incidents-item-date">
                        <strong>Reported Date</strong>
                        {formatDate(incident.createdAt)}
                      </p>
                      <p className="incidents-item-status" style={{ color: getStatusColor(incident.status) }}>
                        <strong>Status</strong>
                        {incident.status || 'pending'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default MyIncidents; 