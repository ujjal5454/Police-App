import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Ambulance.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom ambulance marker icon
const createAmbulanceIcon = (available) => {
  return new L.DivIcon({
    className: 'custom-ambulance-marker',
    html: `<div style="
      background: #2196F3;
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
    ">${available || '+'}</div>`,
    iconSize: [35, 35],
    iconAnchor: [17, 17]
  });
};

// Ambulance service locations across Nepal
const ambulanceLocations = [
  // Bagmati Province
  { id: 1, name: 'Kathmandu Ambulance Service', address: 'Kathmandu Metropolitan City', phone: '102', position: [27.7172, 85.3240], available: '24' },
  { id: 2, name: 'Lalitpur Emergency Ambulance', address: 'Lalitpur, Nepal', phone: '01-5521102', position: [27.6588, 85.3247], available: '18' },
  { id: 3, name: 'Bhaktapur Ambulance Service', address: 'Bhaktapur, Nepal', phone: '01-6610102', position: [27.6710, 85.4298], available: '12' },
  { id: 4, name: 'TUTH Ambulance Service', address: 'Maharajgunj, Kathmandu', phone: '01-4412102', position: [27.7394, 85.3350], available: '15' },
  
  // Gandaki Province
  { id: 5, name: 'Pokhara Ambulance Service', address: 'Pokhara, Kaski', phone: '061-520102', position: [28.2096, 83.9856], available: '20' },
  { id: 6, name: 'Western Regional Hospital Ambulance', address: 'Pokhara, Kaski', phone: '061-520066', position: [28.2380, 83.9956], available: '12' },
  { id: 7, name: 'Gorkha Ambulance Service', address: 'Gorkha, Nepal', phone: '064-420102', position: [28.0000, 84.6333], available: '8' },
  
  // Province 1
  { id: 8, name: 'Biratnagar Ambulance Service', address: 'Biratnagar, Morang', phone: '021-525102', position: [26.4525, 87.2718], available: '16' },
  { id: 9, name: 'Dharan Ambulance Service', address: 'Dharan, Sunsari', phone: '025-520102', position: [26.8147, 87.2769], available: '14' },
  { id: 10, name: 'BPKIHS Ambulance Service', address: 'Dharan, Sunsari', phone: '025-525102', position: [26.8147, 87.2769], available: '10' },
  
  // Lumbini Province
  { id: 11, name: 'Butwal Ambulance Service', address: 'Butwal, Rupandehi', phone: '071-540102', position: [27.7000, 83.4486], available: '14' },
  { id: 12, name: 'Nepalgunj Ambulance Service', address: 'Nepalgunj, Banke', phone: '081-521102', position: [28.0500, 81.6167], available: '12' },
  { id: 13, name: 'Bheri Hospital Ambulance', address: 'Nepalgunj, Banke', phone: '081-521477', position: [28.0500, 81.6167], available: '8' },
  
  // Madhesh Province
  { id: 14, name: 'Birgunj Ambulance Service', address: 'Birgunj, Parsa', phone: '051-522102', position: [27.0104, 84.8821], available: '10' },
  { id: 15, name: 'Janakpur Ambulance Service', address: 'Janakpur, Dhanusha', phone: '041-520102', position: [26.7288, 85.9266], available: '8' },
  { id: 16, name: 'Narayani Hospital Ambulance', address: 'Birgunj, Parsa', phone: '051-522190', position: [27.0104, 84.8821], available: '6' },
  
  // Sudurpashchim Province
  { id: 17, name: 'Dhangadhi Ambulance Service', address: 'Dhangadhi, Kailali', phone: '091-521102', position: [28.6833, 80.6000], available: '10' },
  { id: 18, name: 'Mahendranagar Ambulance Service', address: 'Mahendranagar, Kanchanpur', phone: '099-521102', position: [28.9667, 80.1833], available: '6' },
  { id: 19, name: 'Seti Hospital Ambulance', address: 'Dhangadhi, Kailali', phone: '091-521977', position: [28.6833, 80.6000], available: '8' },
  
  // Karnali Province
  { id: 20, name: 'Surkhet Ambulance Service', address: 'Surkhet, Nepal', phone: '083-520102', position: [28.6000, 81.6167], available: '8' },
  { id: 21, name: 'Jumla Ambulance Service', address: 'Jumla, Nepal', phone: '087-520102', position: [29.2742, 82.1833], available: '4' },
  { id: 22, name: 'Karnali Hospital Ambulance', address: 'Surkhet, Nepal', phone: '083-520042', position: [28.6000, 81.6167], available: '6' },
];

const Ambulance = () => {
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
    navigate('/blood-bank-list?category=ambulance');
  };

  // Filter ambulances based on search query
  const filteredAmbulances = ambulanceLocations.filter(ambulance =>
    ambulance.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ambulance.address.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className="ambulance-container">
      <div className="ambulance-card">
        <div className="ambulance-header">
          <button className="ambulance-back-btn" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
            </svg>
          </button>
          <h1>Ambulance</h1>
          <div className="ambulance-spacer"></div>
        </div>

        <div className="ambulance-search-container">
          <div className="ambulance-search-wrapper">
            <input
              type="text"
              placeholder="Search Ambulance"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ambulance-search-input"
            />
            <svg className="ambulance-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div className="ambulance-map-container">
          {!mapReady && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              color: '#2196F3',
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
            key={`ambulance-map-${Date.now()}`}
            center={mapCenter}
            zoom={7}
            style={{ height: '500px', width: '100%', position: 'relative', zIndex: 1 }}
            className="ambulance-map"
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
                      background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
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
                {filteredAmbulances.map((ambulance) => (
                  <Marker
                    key={ambulance.id}
                    position={ambulance.position}
                    icon={createAmbulanceIcon(ambulance.available)}
                  >
                    <Popup>
                      <div className="ambulance-popup">
                        <h3>{ambulance.name}</h3>
                        <p><strong>Address:</strong> {ambulance.address}</p>
                        <p><strong>Phone:</strong> {ambulance.phone}</p>
                        <p><strong>Available:</strong> {ambulance.available}</p>
                        <button
                          className="ambulance-call-btn"
                          onClick={() => handleCall(ambulance.phone)}
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

          <button className="ambulance-location-btn" onClick={handleLocationClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white"/>
            </svg>
          </button>

          <button className="ambulance-list-btn" onClick={handleListClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" fill="white"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ambulance;
