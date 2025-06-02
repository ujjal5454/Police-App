import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Police.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom police marker icon
const createPoliceIcon = (officers) => {
  return new L.DivIcon({
    className: 'custom-police-marker',
    html: `<div style="
      background: #1976D2;
      color: white;
      border-radius: 50%;
      width: 35px;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      border: 3px solid white;
      box-shadow: 0 3px 6px rgba(0,0,0,0.3);
      font-size: 12px;
    ">${officers || '+'}</div>`,
    iconSize: [35, 35],
    iconAnchor: [17, 17]
  });
};

// Police station locations across Nepal
const policeLocations = [
  // Bagmati Province
  { id: 1, name: 'Metropolitan Police Range Kathmandu', address: 'Kathmandu, Nepal', phone: '100', position: [27.7172, 85.3240], officers: '500' },
  { id: 2, name: 'Lalitpur Police Station', address: 'Lalitpur, Nepal', phone: '01-5521100', position: [27.6588, 85.3247], officers: '120' },
  { id: 3, name: 'Bhaktapur Police Station', address: 'Bhaktapur, Nepal', phone: '01-6610100', position: [27.6710, 85.4298], officers: '80' },
  { id: 4, name: 'Maharajgunj Police Station', address: 'Maharajgunj, Kathmandu', phone: '01-4412100', position: [27.7394, 85.3350], officers: '60' },
  { id: 5, name: 'New Baneshwor Police Station', address: 'New Baneshwor, Kathmandu', phone: '01-4780100', position: [27.6950, 85.3500], officers: '45' },
  
  // Gandaki Province
  { id: 6, name: 'Pokhara Police Station', address: 'Pokhara, Kaski', phone: '061-520100', position: [28.2096, 83.9856], officers: '200' },
  { id: 7, name: 'Gorkha Police Station', address: 'Gorkha, Nepal', phone: '064-420100', position: [28.0000, 84.6333], officers: '50' },
  { id: 8, name: 'Lamjung Police Station', address: 'Besisahar, Lamjung', phone: '066-520100', position: [28.2333, 84.4167], officers: '35' },
  
  // Province 1
  { id: 9, name: 'Biratnagar Police Station', address: 'Biratnagar, Morang', phone: '021-525100', position: [26.4525, 87.2718], officers: '150' },
  { id: 10, name: 'Dharan Police Station', address: 'Dharan, Sunsari', phone: '025-520100', position: [26.8147, 87.2769], officers: '100' },
  { id: 11, name: 'Itahari Police Station', address: 'Itahari, Sunsari', phone: '025-580100', position: [26.6650, 87.2700], officers: '80' },
  
  // Lumbini Province
  { id: 12, name: 'Butwal Police Station', address: 'Butwal, Rupandehi', phone: '071-540100', position: [27.7000, 83.4486], officers: '120' },
  { id: 13, name: 'Nepalgunj Police Station', address: 'Nepalgunj, Banke', phone: '081-521100', position: [28.0500, 81.6167], officers: '100' },
  { id: 14, name: 'Tansen Police Station', address: 'Tansen, Palpa', phone: '075-520100', position: [27.8667, 83.5500], officers: '60' },
  
  // Madhesh Province
  { id: 15, name: 'Birgunj Police Station', address: 'Birgunj, Parsa', phone: '051-522100', position: [27.0104, 84.8821], officers: '90' },
  { id: 16, name: 'Janakpur Police Station', address: 'Janakpur, Dhanusha', phone: '041-520100', position: [26.7288, 85.9266], officers: '70' },
  { id: 17, name: 'Rajbiraj Police Station', address: 'Rajbiraj, Saptari', phone: '031-560100', position: [26.5439, 86.7450], officers: '55' },
  
  // Sudurpashchim Province
  { id: 18, name: 'Dhangadhi Police Station', address: 'Dhangadhi, Kailali', phone: '091-521100', position: [28.6833, 80.6000], officers: '80' },
  { id: 19, name: 'Mahendranagar Police Station', address: 'Mahendranagar, Kanchanpur', phone: '099-521100', position: [28.9667, 80.1833], officers: '50' },
  { id: 20, name: 'Dadeldhura Police Station', address: 'Dadeldhura, Nepal', phone: '096-420100', position: [29.3000, 80.5833], officers: '40' },
  
  // Karnali Province
  { id: 21, name: 'Surkhet Police Station', address: 'Surkhet, Nepal', phone: '083-520100', position: [28.6000, 81.6167], officers: '60' },
  { id: 22, name: 'Jumla Police Station', address: 'Jumla, Nepal', phone: '087-520100', position: [29.2742, 82.1833], officers: '30' },
  { id: 23, name: 'Dolpa Police Station', address: 'Dunai, Dolpa', phone: '087-580100', position: [29.0333, 82.9000], officers: '25' },
];

const Police = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  const handleBack = () => {
    navigate('/emergency-contact');
  };

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleListClick = () => {
    navigate('/blood-bank-list?category=police');
  };

  // Filter police stations based on search query
  const filteredPolice = policeLocations.filter(police =>
    police.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    police.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Default center (Kathmandu, Nepal)
  const mapCenter = userLocation || [27.7172, 85.3240];

  // Ensure map renders properly
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);

    const mapTimer = setTimeout(() => {
      const mapElements = document.querySelectorAll('.leaflet-container');
      mapElements.forEach(mapEl => {
        if (mapEl._leaflet_map) {
          mapEl._leaflet_map.invalidateSize();
        }
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      clearTimeout(mapTimer);
    };
  }, []);

  return (
    <div className="police-container">
      <div className="police-card">
        <div className="police-header">
          <button className="police-back-btn" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
            </svg>
          </button>
          <h1>Police</h1>
          <div className="police-spacer"></div>
        </div>

        <div className="police-search-container">
          <div className="police-search-wrapper">
            <input
              type="text"
              placeholder="Search Police Station"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="police-search-input"
            />
            <svg className="police-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div className="police-map-container">
          {!mapReady && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              color: '#1976D2',
              fontSize: '16px',
              fontWeight: '500',
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              Loading map...
            </div>
          )}
          <MapContainer
            key={`police-map-${Date.now()}`}
            center={mapCenter}
            zoom={7}
            style={{ height: '500px', width: '100%', position: 'relative', zIndex: 1 }}
            className="police-map"
            whenCreated={(mapInstance) => {
              setMapReady(true);
              setTimeout(() => {
                mapInstance.invalidateSize();
              }, 100);
            }}
            whenReady={() => {
              setMapReady(true);
            }}
          >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                maxZoom={19}
                minZoom={1}
              />

              <MarkerClusterGroup
                chunkedLoading
                iconCreateFunction={(cluster) => {
                  const count = cluster.getChildCount();
                  return new L.DivIcon({
                    html: `<div style="
                      background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
                      color: white;
                      border-radius: 50%;
                      width: 40px;
                      height: 40px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-weight: bold;
                      border: 3px solid white;
                      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                      font-size: 14px;
                    ">${count}</div>`,
                    className: 'custom-cluster-icon',
                    iconSize: [40, 40],
                    iconAnchor: [20, 20]
                  });
                }}
              >
                {filteredPolice.map((police) => (
                  <Marker
                    key={police.id}
                    position={police.position}
                    icon={createPoliceIcon(police.officers)}
                  >
                    <Popup>
                      <div className="police-popup">
                        <h3>{police.name}</h3>
                        <p><strong>Address:</strong> {police.address}</p>
                        <p><strong>Phone:</strong> {police.phone}</p>
                        <p><strong>Officers:</strong> {police.officers}</p>
                        <button
                          className="police-call-btn"
                          onClick={() => handleCall(police.phone)}
                        >
                          Call Now
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MarkerClusterGroup>

              {userLocation && (
                <Marker position={userLocation}>
                  <Popup>Your Location</Popup>
                </Marker>
              )}
            </MapContainer>

          <button className="police-location-btn" onClick={handleLocationClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white"/>
            </svg>
          </button>

          <button className="police-list-btn" onClick={handleListClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" fill="white"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Police;
