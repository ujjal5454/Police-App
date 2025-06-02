import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './FireBrigade.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom fire brigade marker icon
const createFireBrigadeIcon = (vehicles) => {
  return new L.DivIcon({
    className: 'custom-fire-brigade-marker',
    html: `<div style="
      background: #FF9800;
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
    ">${vehicles || '+'}</div>`,
    iconSize: [35, 35],
    iconAnchor: [17, 17]
  });
};

// Fire brigade locations across Nepal
const fireBrigadeLocations = [
  // Bagmati Province
  { id: 1, name: 'Kathmandu Fire Brigade', address: 'Kathmandu Metropolitan City', phone: '101', position: [27.7172, 85.3240], vehicles: '12' },
  { id: 2, name: 'Lalitpur Fire Brigade', address: 'Lalitpur, Nepal', phone: '01-5521001', position: [27.6588, 85.3247], vehicles: '8' },
  { id: 3, name: 'Bhaktapur Fire Brigade', address: 'Bhaktapur, Nepal', phone: '01-6610101', position: [27.6710, 85.4298], vehicles: '6' },
  
  // Gandaki Province
  { id: 4, name: 'Pokhara Fire Brigade', address: 'Pokhara, Kaski', phone: '061-520101', position: [28.2096, 83.9856], vehicles: '10' },
  { id: 5, name: 'Gorkha Fire Brigade', address: 'Gorkha, Nepal', phone: '064-420101', position: [28.0000, 84.6333], vehicles: '4' },
  
  // Province 1
  { id: 6, name: 'Biratnagar Fire Brigade', address: 'Biratnagar, Morang', phone: '021-525101', position: [26.4525, 87.2718], vehicles: '8' },
  { id: 7, name: 'Dharan Fire Brigade', address: 'Dharan, Sunsari', phone: '025-520101', position: [26.8147, 87.2769], vehicles: '6' },
  
  // Lumbini Province
  { id: 8, name: 'Butwal Fire Brigade', address: 'Butwal, Rupandehi', phone: '071-540101', position: [27.7000, 83.4486], vehicles: '7' },
  { id: 9, name: 'Nepalgunj Fire Brigade', address: 'Nepalgunj, Banke', phone: '081-521101', position: [28.0500, 81.6167], vehicles: '6' },
  
  // Madhesh Province
  { id: 10, name: 'Birgunj Fire Brigade', address: 'Birgunj, Parsa', phone: '051-522101', position: [27.0104, 84.8821], vehicles: '5' },
  { id: 11, name: 'Janakpur Fire Brigade', address: 'Janakpur, Dhanusha', phone: '041-520101', position: [26.7288, 85.9266], vehicles: '4' },
  
  // Sudurpashchim Province
  { id: 12, name: 'Dhangadhi Fire Brigade', address: 'Dhangadhi, Kailali', phone: '091-521101', position: [28.6833, 80.6000], vehicles: '5' },
  { id: 13, name: 'Mahendranagar Fire Brigade', address: 'Mahendranagar, Kanchanpur', phone: '099-521101', position: [28.9667, 80.1833], vehicles: '3' },
  
  // Karnali Province
  { id: 14, name: 'Surkhet Fire Brigade', address: 'Surkhet, Nepal', phone: '083-520101', position: [28.6000, 81.6167], vehicles: '4' },
  { id: 15, name: 'Jumla Fire Brigade', address: 'Jumla, Nepal', phone: '087-520101', position: [29.2742, 82.1833], vehicles: '2' },
];

const FireBrigade = () => {
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
    navigate('/blood-bank-list?category=fireBrigade');
  };

  // Filter fire brigades based on search query
  const filteredFireBrigades = fireBrigadeLocations.filter(fireBrigade =>
    fireBrigade.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fireBrigade.address.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className="fire-brigade-container">
      <div className="fire-brigade-card">
        <div className="fire-brigade-header">
          <button className="fire-brigade-back-btn" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
            </svg>
          </button>
          <h1>Fire Brigade</h1>
          <div className="fire-brigade-spacer"></div>
        </div>

        <div className="fire-brigade-search-container">
          <div className="fire-brigade-search-wrapper">
            <input
              type="text"
              placeholder="Search Fire Brigade"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="fire-brigade-search-input"
            />
            <svg className="fire-brigade-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div className="fire-brigade-map-container">
          {!mapReady && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              color: '#FF9800',
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
            key={`fire-brigade-map-${Date.now()}`}
            center={mapCenter}
            zoom={7}
            style={{ height: '500px', width: '100%', position: 'relative', zIndex: 1 }}
            className="fire-brigade-map"
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
                      background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
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
                {filteredFireBrigades.map((fireBrigade) => (
                  <Marker
                    key={fireBrigade.id}
                    position={fireBrigade.position}
                    icon={createFireBrigadeIcon(fireBrigade.vehicles)}
                  >
                    <Popup>
                      <div className="fire-brigade-popup">
                        <h3>{fireBrigade.name}</h3>
                        <p><strong>Address:</strong> {fireBrigade.address}</p>
                        <p><strong>Phone:</strong> {fireBrigade.phone}</p>
                        <p><strong>Vehicles:</strong> {fireBrigade.vehicles}</p>
                        <button
                          className="fire-brigade-call-btn"
                          onClick={() => handleCall(fireBrigade.phone)}
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

          <button className="fire-brigade-location-btn" onClick={handleLocationClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white"/>
            </svg>
          </button>

          <button className="fire-brigade-list-btn" onClick={handleListClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" fill="white"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FireBrigade;
