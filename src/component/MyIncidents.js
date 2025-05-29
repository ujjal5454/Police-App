import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { incidentService } from '../services/api';
import './MyIncidents.css';

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
      const response = await incidentService.getAllIncidents();
      if (response && response.data) {
        setIncidents(response.data);
      } else {
        setIncidents([]);
        setError('No incidents found');
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
      case 'explosives/weapons':
        return '💣';
      case 'theft':
        return '🕵️';
      case 'others':
        return '📦';
      case 'fraud':
        return '💰';
      case 'domestic violence':
        return '🏠';
      default:
        return '❓';
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
    <div className="my-incidents-container">
      <div className="incidents-header">
        <button className="back-button" onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
          </svg>
        </button>
        <h1>My Incidents</h1>
        <button className="filter-button" onClick={() => setFilterOpen(!filterOpen)}>
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

      <div className="search-container">
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {error && <div className="error">{error}</div>}
      </div>

      {loading ? (
        <div className="loading">Loading incidents...</div>
      ) : filteredIncidents.length === 0 ? (
        <div className="no-incidents">No incidents found</div>
      ) : (
        <div className="incidents-list">
          {filteredIncidents.map((incident) => (
            <div 
              key={incident._id} 
              className="incident-card"
              onClick={() => handleIncidentClick(incident)}
            >
              <div className="incident-icon">
                {getIncidentIcon(incident.type)}
              </div>
              <div className="incident-details">
                <h3>{incident.type || 'Unknown Type'}</h3>
                <div className="incident-info">
                  <p className="incident-id">
                    <strong>Incident Id</strong><br />
                    {incident._id}
                  </p>
                  <p className="reported-date">
                    <strong>Reported Date</strong><br />
                    {formatDate(incident.createdAt)}
                  </p>
                  <p className="status" style={{ color: getStatusColor(incident.status) }}>
                    <strong>Status</strong><br />
                    {incident.status || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyIncidents; 