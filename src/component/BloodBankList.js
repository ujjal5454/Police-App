import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BloodBank.css';

const categories = [
  { key: 'bloodBank', label: 'Blood Bank' },
  { key: 'hospital', label: 'Hospital' },
  { key: 'fireBrigade', label: 'Fire Brigade' },
  { key: 'ambulance', label: 'Ambulance' },
  { key: 'police', label: 'Police' },
];

const allData = {
  bloodBank: [
    { id: 1, name: 'Central Blood Bank', address: 'Kathmandu, Nepal', phone: '01-4225344' },
    { id: 2, name: 'Bir Hospital Blood Bank', address: 'Mahaboudha, Kathmandu', phone: '01-4221119' },
    { id: 3, name: 'Teaching Hospital Blood Bank', address: 'Maharajgunj, Kathmandu', phone: '01-4412303' },
    { id: 4, name: 'Patan Hospital Blood Bank', address: 'Lagankhel, Lalitpur', phone: '01-5522266' },
    { id: 5, name: 'Bhaktapur Hospital Blood Bank', address: 'Bhaktapur, Nepal', phone: '01-6610798' },
    { id: 6, name: 'Nepalgunj Blood Bank', address: 'Nepalgunj, Banke', phone: '081-520111' },
    { id: 7, name: 'Pokhara Blood Bank', address: 'Pokhara, Kaski', phone: '061-520111' },
    { id: 8, name: 'Dharan Blood Bank', address: 'Dharan, Sunsari', phone: '025-520111' },
    { id: 9, name: 'Butwal Blood Bank', address: 'Butwal, Rupandehi', phone: '071-520111' },
    { id: 10, name: 'Dhangadhi Blood Bank', address: 'Dhangadhi, Kailali', phone: '091-520111' },
  ],
  hospital: [
    { id: 1, name: 'Bir Hospital', address: 'Kathmandu', phone: '01-4221119' },
    { id: 2, name: 'Teaching Hospital', address: 'Maharajgunj, Kathmandu', phone: '01-4412303' },
    { id: 3, name: 'Patan Hospital', address: 'Lagankhel, Lalitpur', phone: '01-5522266' },
    { id: 4, name: 'Bharatpur Hospital', address: 'Bharatpur, Chitwan', phone: '056-520111' },
    { id: 5, name: 'BPKIHS', address: 'Dharan, Sunsari', phone: '025-525555' },
  ],
  fireBrigade: [
    { id: 1, name: 'Kathmandu Fire Brigade', address: 'Kathmandu', phone: '101' },
    { id: 2, name: 'Pokhara Fire Brigade', address: 'Pokhara', phone: '061-520111' },
    { id: 3, name: 'Biratnagar Fire Brigade', address: 'Biratnagar', phone: '021-520111' },
  ],
  ambulance: [
    { id: 1, name: 'Kathmandu Ambulance', address: 'Kathmandu', phone: '102' },
    { id: 2, name: 'Lalitpur Ambulance', address: 'Lalitpur', phone: '01-5541111' },
    { id: 3, name: 'Pokhara Ambulance', address: 'Pokhara', phone: '061-520222' },
  ],
  police: [
    { id: 1, name: 'Nepal Police HQ', address: 'Naxal, Kathmandu', phone: '100' },
    { id: 2, name: 'Pokhara Police', address: 'Pokhara', phone: '061-520333' },
    { id: 3, name: 'Biratnagar Police', address: 'Biratnagar', phone: '021-520444' },
  ],
};

const BloodBankList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('bloodBank');

  // Check URL parameters for category
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const category = urlParams.get('category');
    if (category && categories.find(c => c.key === category)) {
      setSelectedCategory(category);
    }
  }, [location.search]);

  const categoryData = allData[selectedCategory] || [];
  const filteredData = categoryData.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Dynamic color theming based on category
  const getThemeColor = () => {
    switch (selectedCategory) {
      case 'hospital': return '#4CAF50';
      case 'fireBrigade': return '#FF9800';
      case 'ambulance': return '#2196F3';
      case 'police': return '#1976D2';
      default: return '#0088cc'; // bloodBank
    }
  };

  const themeColor = getThemeColor();

  return (
    <div className="blood-bank-container">
      <div className="blood-bank-card">
        <div className="blood-bank-header" style={{ backgroundColor: themeColor }}>
          <button className="blood-bank-back-btn" onClick={() => navigate(-1)}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
            </svg>
          </button>
          <h1>{categories.find(c => c.key === selectedCategory)?.label || 'Blood Bank'}</h1>
          <div className="blood-bank-spacer"></div>
        </div>

        <div className="blood-bank-search-container">
          <div className="blood-bank-search-wrapper">
            <input
              type="text"
              placeholder={`Search ${categories.find(c => c.key === selectedCategory).label}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="blood-bank-search-input"
              style={{
                '--focus-color': themeColor
              }}
            />
            <svg className="blood-bank-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {categories.map(cat => (
              <button
                key={cat.key}
                className={selectedCategory === cat.key ? 'category-tab active' : 'category-tab'}
                onClick={() => setSelectedCategory(cat.key)}
                style={selectedCategory === cat.key ? {
                  backgroundColor: themeColor,
                  borderColor: themeColor
                } : {}}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '0 0 16px 0' }}>
          {filteredData.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888', marginTop: '32px' }}>No data found.</div>
          ) : (
            filteredData.map(item => (
              <div key={item.id} className="incidents-item-card" style={{ borderRadius: 12, margin: '12px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div className="incidents-item-icon" style={{ background: `${themeColor}20` }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={themeColor}>
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
                <div className="incidents-item-details">
                  <h3 style={{ fontSize: 16, margin: 0 }}>{item.name}</h3>
                  <div style={{ color: '#555', fontSize: 14 }}>{item.address}</div>
                  <div style={{ color: themeColor, fontWeight: 600, fontSize: 15, marginTop: 4 }}>{item.phone}</div>
                </div>
                <a
                  href={`tel:${item.phone}`}
                  style={{
                    background: themeColor,
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 'auto',
                    textDecoration: 'none',
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                    <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z" />
                  </svg>
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BloodBankList; 