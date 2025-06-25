import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PoliceStationNearby.css';

// Fix for default markers in react-leaflet
// ...existing code...
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const createPoliceIcon = (officers) => {
  return new L.DivIcon({
    className: 'custom-police-marker',
    html: `<div style="background: #1976D2; color: white; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.3); font-size: 12px;">${officers || '+'}</div>`,
    iconSize: [35, 35],
    iconAnchor: [17, 17]
  });
};

const policeLocations = [
  { id: 1, name: 'Metropolitan Police Range Kathmandu', address: 'Kathmandu, Nepal', phone: '100', position: [27.7172, 85.3240], officers: '500' },
  { id: 2, name: 'Lalitpur Police Station', address: 'Lalitpur, Nepal', phone: '01-5521100', position: [27.6588, 85.3247], officers: '120' },
  { id: 3, name: 'Bhaktapur Police Station', address: 'Bhaktapur, Nepal', phone: '01-6610100', position: [27.6710, 85.4298], officers: '80' },
  { id: 4, name: 'Maharajgunj Police Station', address: 'Maharajgunj, Kathmandu', phone: '01-4412100', position: [27.7394, 85.3350], officers: '60' },
  { id: 5, name: 'New Baneshwor Police Station', address: 'New Baneshwor, Kathmandu', phone: '01-4780100', position: [27.6950, 85.3500], officers: '45' },
  { id: 6, name: 'Pokhara Police Station', address: 'Pokhara, Kaski', phone: '061-520100', position: [28.2096, 83.9856], officers: '200' },
  { id: 7, name: 'Gorkha Police Station', address: 'Gorkha, Nepal', phone: '064-420100', position: [28.0000, 84.6333], officers: '50' },
  { id: 8, name: 'Lamjung Police Station', address: 'Besisahar, Lamjung', phone: '066-520100', position: [28.2333, 84.4167], officers: '35' },
  { id: 9, name: 'Biratnagar Police Station', address: 'Biratnagar, Morang', phone: '021-525100', position: [26.4525, 87.2718], officers: '150' },
  { id: 10, name: 'Dharan Police Station', address: 'Dharan, Sunsari', phone: '025-520100', position: [26.8147, 87.2769], officers: '100' },
  { id: 11, name: 'Itahari Police Station', address: 'Itahari, Sunsari', phone: '025-580100', position: [26.6650, 87.2700], officers: '80' },
  { id: 12, name: 'Butwal Police Station', address: 'Butwal, Rupandehi', phone: '071-540100', position: [27.7000, 83.4486], officers: '120' },
  { id: 13, name: 'Nepalgunj Police Station', address: 'Nepalgunj, Banke', phone: '081-521100', position: [28.0500, 81.6167], officers: '100' },
  { id: 14, name: 'Tansen Police Station', address: 'Tansen, Palpa', phone: '075-520100', position: [27.8667, 83.5500], officers: '60' },
  { id: 15, name: 'Birgunj Police Station', address: 'Birgunj, Parsa', phone: '051-522100', position: [27.0104, 84.8821], officers: '90' },
  { id: 16, name: 'Janakpur Police Station', address: 'Janakpur, Dhanusha', phone: '041-520100', position: [26.7288, 85.9266], officers: '70' },
  { id: 17, name: 'Rajbiraj Police Station', address: 'Rajbiraj, Saptari', phone: '031-560100', position: [26.5439, 86.7450], officers: '55' },
  { id: 18, name: 'Dhangadhi Police Station', address: 'Dhangadhi, Kailali', phone: '091-521100', position: [28.6833, 80.6000], officers: '80' },
  { id: 19, name: 'Mahendranagar Police Station', address: 'Mahendranagar, Kanchanpur', phone: '099-521100', position: [28.9667, 80.1833], officers: '50' },
  { id: 20, name: 'Dadeldhura Police Station', address: 'Dadeldhura, Nepal', phone: '096-420100', position: [29.3000, 80.5833], officers: '40' },
  { id: 21, name: 'Surkhet Police Station', address: 'Surkhet, Nepal', phone: '083-520100', position: [28.6000, 81.6167], officers: '60' },
  { id: 22, name: 'Jumla Police Station', address: 'Jumla, Nepal', phone: '087-520100', position: [29.2742, 82.1833], officers: '30' },
  { id: 23, name: 'Dolpa Police Station', address: 'Dunai, Dolpa', phone: '087-580100', position: [29.0333, 82.9000], officers: '25' },
];

const PoliceStationNearby = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  const handleBack = () => {
    navigate('/home');
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

  // Filter police stations based on search query
  const filteredPolice = policeLocations.filter(police =>
    police.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    police.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Default center (Kathmandu, Nepal)
  const mapCenter = userLocation || [27.7172, 85.3240];

  return (
    <div className="police-station-nearby-container">
      <div className="police-station-header">
        <button className="back-btn" onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
          </svg>
        </button>
        <h2>Police Stations Nearby</h2>
      </div>
      <div className="search-section">
        <input
          type="text"
          placeholder="Search by name or address..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <button className="location-btn" onClick={handleLocationClick}>Use My Location</button>
      </div>
      <div className="map-section">
        <MapContainer center={mapCenter} zoom={8} style={{ height: '300px', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MarkerClusterGroup>
            {filteredPolice.map(station => (
              <Marker
                key={station.id}
                position={station.position}
                icon={createPoliceIcon(station.officers)}
              >
                <Popup>
                  <div className="popup-content">
                    <strong>{station.name}</strong><br />
                    {station.address}<br />
                    <span>Officers: {station.officers}</span><br />
                    <button className="call-btn" onClick={() => handleCall(station.phone)}>Call: {station.phone}</button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
      <div className="station-list-section">
        <h3>All Police Stations</h3>
        <ul>
          {filteredPolice.map(station => (
            <li key={station.id} className="station-list-item">
              <div className="station-info">
                <span className="station-name">{station.name}</span>
                <span className="station-address">{station.address}</span>
                <span className="station-officers">👮 {station.officers}</span>
              </div>
              <button className="call-btn" onClick={() => handleCall(station.phone)}>Call</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PoliceStationNearby;
