import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './BloodBank.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom blood bank marker icon (temporarily disabled for debugging)
// const bloodBankIcon = new L.DivIcon({
//   className: 'custom-blood-bank-marker',
//   html: '<div style="background: #2196F3; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">+</div>',
//   iconSize: [30, 30],
//   iconAnchor: [15, 15]
// });

// Sample blood bank locations in Nepal (major only for map)
const bloodBankLocations = [
  { id: 1, name: 'Central Blood Bank', address: 'Kathmandu, Nepal', phone: '01-4225344', position: [27.7172, 85.3240] },
  { id: 2, name: 'Bir Hospital Blood Bank', address: 'Mahaboudha, Kathmandu', phone: '01-4221119', position: [27.7056, 85.3137] },
  { id: 3, name: 'Teaching Hospital Blood Bank', address: 'Maharajgunj, Kathmandu', phone: '01-4412303', position: [27.7394, 85.3350] },
  { id: 4, name: 'Patan Hospital Blood Bank', address: 'Lagankhel, Lalitpur', phone: '01-5522266', position: [27.6588, 85.3247] },
  { id: 5, name: 'Bhaktapur Hospital Blood Bank', address: 'Bhaktapur, Nepal', phone: '01-6610798', position: [27.6710, 85.4298] },
];

const BloodBank = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);

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
    navigate('/blood-bank-list');
  };

  // Default center (Kathmandu, Nepal)
  const mapCenter = userLocation || [27.7172, 85.3240];

  return (
    <div className="blood-bank-container">
      <div className="blood-bank-card">
        <div className="blood-bank-header">
          <button className="blood-bank-back-btn" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
            </svg>
          </button>
          <h1>Blood Bank</h1>
          <div className="blood-bank-spacer"></div>
        </div>

        <div className="blood-bank-map-container">
          <div style={{
            height: '500px',
            width: '100%',
            position: 'relative',
            background: '#f0f0f0',
            border: '1px solid #ddd'
          }}>
            <MapContainer
              center={mapCenter}
              zoom={12}
              style={{ height: '100%', width: '100%', zIndex: 1 }}
              className="blood-bank-map"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {bloodBankLocations.map((bank) => (
                <Marker
                  key={bank.id}
                  position={bank.position}
                >
                  <Popup>
                    <div className="blood-bank-popup">
                      <h3>{bank.name}</h3>
                      <p><strong>Address:</strong> {bank.address}</p>
                      <p><strong>Phone:</strong> {bank.phone}</p>
                      <button
                        className="blood-bank-call-btn"
                        onClick={() => handleCall(bank.phone)}
                      >
                        Call Now
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {userLocation && (
                <Marker position={userLocation}>
                  <Popup>Your Location</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>

          <button className="blood-bank-location-btn" onClick={handleLocationClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white"/>
            </svg>
          </button>

          <button className="blood-bank-list-btn" onClick={handleListClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" fill="white"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BloodBank;
