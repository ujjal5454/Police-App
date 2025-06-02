import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Hospital.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom hospital marker icon
const createHospitalIcon = (beds) => {
  return new L.DivIcon({
    className: 'custom-hospital-marker',
    html: `<div style="
      background: #4CAF50;
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
    ">${beds || '+'}</div>`,
    iconSize: [35, 35],
    iconAnchor: [17, 17]
  });
};

// Comprehensive hospital locations across Nepal (all 7 provinces)
const hospitalLocations = [
  // Province 1 (Koshi Province)
  { id: 1, name: 'B.P. Koirala Institute of Health Sciences', address: 'Dharan, Sunsari', phone: '025-525555', position: [26.8147, 87.2769], beds: '450' },
  { id: 2, name: 'Koshi Hospital', address: 'Biratnagar, Morang', phone: '021-525777', position: [26.4525, 87.2718], beds: '300' },
  { id: 3, name: 'Mechi Zonal Hospital', address: 'Bhadrapur, Jhapa', phone: '023-462042', position: [26.5448, 88.0851], beds: '200' },
  { id: 4, name: 'Sagarmatha Zonal Hospital', address: 'Rajbiraj, Saptari', phone: '031-560039', position: [26.5439, 86.7450], beds: '250' },

  // Province 2 (Madhesh Province)
  { id: 5, name: 'Janakpur Zonal Hospital', address: 'Janakpur, Dhanusha', phone: '041-520042', position: [26.7288, 85.9266], beds: '350' },
  { id: 6, name: 'Narayani Sub-Regional Hospital', address: 'Birgunj, Parsa', phone: '051-522190', position: [27.0104, 84.8821], beds: '280' },
  { id: 7, name: 'Gajendra Narayan Singh Hospital', address: 'Rajbiraj, Saptari', phone: '031-560333', position: [26.5439, 86.7450], beds: '180' },

  // Bagmati Province
  { id: 8, name: 'Tribhuvan University Teaching Hospital', address: 'Maharajgunj, Kathmandu', phone: '01-4412303', position: [27.7394, 85.3350], beds: '700' },
  { id: 9, name: 'Bir Hospital', address: 'Mahaboudha, Kathmandu', phone: '01-4221119', position: [27.7056, 85.3137], beds: '600' },
  { id: 10, name: 'Patan Hospital', address: 'Lagankhel, Lalitpur', phone: '01-5522266', position: [27.6588, 85.3247], beds: '500' },
  { id: 11, name: 'Bhaktapur Hospital', address: 'Bhaktapur, Nepal', phone: '01-6610798', position: [27.6710, 85.4298], beds: '250' },
  { id: 12, name: 'Manmohan Hospital', address: 'Swoyambhu, Kathmandu', phone: '01-4271595', position: [27.7150, 85.2900], beds: '200' },
  { id: 13, name: 'Dhulikhel Hospital', address: 'Dhulikhel, Kavre', phone: '011-490497', position: [27.6200, 85.5400], beds: '300' },
  { id: 14, name: 'Charikot Hospital', address: 'Charikot, Dolakha', phone: '049-420042', position: [27.6761, 86.1494], beds: '150' },

  // Gandaki Province
  { id: 15, name: 'Western Regional Hospital', address: 'Pokhara, Kaski', phone: '061-520066', position: [28.2380, 83.9956], beds: '400' },
  { id: 16, name: 'Gandaki Medical College', address: 'Pokhara, Kaski', phone: '061-538900', position: [28.1894, 84.0194], beds: '250' },
  { id: 17, name: 'Manipal Teaching Hospital', address: 'Pokhara, Kaski', phone: '061-526416', position: [28.2096, 83.9856], beds: '350' },
  { id: 18, name: 'Gorkha Hospital', address: 'Gorkha, Gorkha', phone: '064-420042', position: [28.0000, 84.6333], beds: '180' },
  { id: 19, name: 'Lamjung Hospital', address: 'Besisahar, Lamjung', phone: '066-520042', position: [28.2333, 84.4167], beds: '120' },

  // Lumbini Province
  { id: 20, name: 'Lumbini Provincial Hospital', address: 'Butwal, Rupandehi', phone: '071-547722', position: [27.7000, 83.4486], beds: '350' },
  { id: 21, name: 'Bheri Zonal Hospital', address: 'Nepalgunj, Banke', phone: '081-521477', position: [28.0500, 81.6167], beds: '300' },
  { id: 22, name: 'Rapti Zonal Hospital', address: 'Tulsipur, Dang', phone: '082-560042', position: [28.1333, 82.2833], beds: '250' },
  { id: 23, name: 'United Mission Hospital', address: 'Tansen, Palpa', phone: '075-520042', position: [27.8667, 83.5500], beds: '200' },
  { id: 24, name: 'Kapilvastu Hospital', address: 'Kapilvastu, Kapilvastu', phone: '076-580042', position: [27.5667, 83.0500], beds: '150' },

  // Karnali Province
  { id: 25, name: 'Karnali Provincial Hospital', address: 'Surkhet, Surkhet', phone: '083-520042', position: [28.6000, 81.6167], beds: '250' },
  { id: 26, name: 'Jumla Hospital', address: 'Khalanga, Jumla', phone: '087-520042', position: [29.2742, 82.1833], beds: '100' },
  { id: 27, name: 'Dolpa Hospital', address: 'Dunai, Dolpa', phone: '087-580042', position: [29.0333, 82.9000], beds: '80' },

  // Sudurpashchim Province
  { id: 28, name: 'Seti Provincial Hospital', address: 'Dhangadhi, Kailali', phone: '091-521977', position: [28.6833, 80.6000], beds: '320' },
  { id: 29, name: 'Mahakali Zonal Hospital', address: 'Mahendranagar, Kanchanpur', phone: '099-521042', position: [28.9667, 80.1833], beds: '220' },
  { id: 30, name: 'Doti Hospital', address: 'Silgadhi, Doti', phone: '094-420042', position: [29.2667, 80.9833], beds: '120' },
  { id: 31, name: 'Bajura Hospital', address: 'Martadi, Bajura', phone: '096-420042', position: [29.5333, 81.2167], beds: '80' },

  // Additional major hospitals
  { id: 32, name: 'Chitwan Medical College', address: 'Bharatpur, Chitwan', phone: '056-526006', position: [27.6800, 84.4300], beds: '280' },
  { id: 33, name: 'College of Medical Sciences', address: 'Bharatpur, Chitwan', phone: '056-525555', position: [27.6333, 84.4333], beds: '250' },
  { id: 34, name: 'Nepal Medical College', address: 'Jorpati, Kathmandu', phone: '01-4911008', position: [27.7394, 85.3700], beds: '300' },
  { id: 35, name: 'Kathmandu Medical College', address: 'Sinamangal, Kathmandu', phone: '01-4469404', position: [27.6950, 85.3500], beds: '280' },
  { id: 36, name: 'Grande International Hospital', address: 'Dhapasi, Kathmandu', phone: '01-5159266', position: [27.7500, 85.3200], beds: '200' },
];

const Hospital = () => {
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
    navigate('/blood-bank-list?category=hospital');
  };

  // Filter hospitals based on search query
  const filteredHospitals = hospitalLocations.filter(hospital =>
    hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hospital.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Default center (Kathmandu, Nepal)
  const mapCenter = userLocation || [27.7172, 85.3240];

  // Ensure map renders properly
  useEffect(() => {
    // Force a re-render after component mounts to fix map display issues
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);

    // Additional timer for map container resize
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
    <div className="hospital-container">
      <div className="hospital-card">
        <div className="hospital-header">
          <button className="hospital-back-btn" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
            </svg>
          </button>
          <h1>Hospital</h1>
          <div className="hospital-spacer"></div>
        </div>

        <div className="hospital-search-container">
          <div className="hospital-search-wrapper">
            <input
              type="text"
              placeholder="Search Hospital"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="hospital-search-input"
            />
            <svg className="hospital-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div className="hospital-map-container">
          {!mapReady && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              color: '#4CAF50',
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
            key={`hospital-map-${Date.now()}`}
            center={mapCenter}
            zoom={7}
            style={{ height: '500px', width: '100%', position: 'relative', zIndex: 1 }}
            className="hospital-map"
            whenCreated={(mapInstance) => {
              console.log('Hospital map created successfully');
              setMapReady(true);
              setTimeout(() => {
                mapInstance.invalidateSize();
              }, 100);
            }}
            whenReady={() => {
              console.log('Hospital map is ready');
              setMapReady(true);
            }}
          >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                maxZoom={19}
                minZoom={1}
                errorTileUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
              />

              <MarkerClusterGroup
                chunkedLoading
                iconCreateFunction={(cluster) => {
                  const count = cluster.getChildCount();
                  return new L.DivIcon({
                    html: `<div style="
                      background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
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
                {filteredHospitals.map((hospital) => (
                  <Marker
                    key={hospital.id}
                    position={hospital.position}
                    icon={createHospitalIcon(hospital.beds)}
                  >
                    <Popup>
                      <div className="hospital-popup">
                        <h3>{hospital.name}</h3>
                        <p><strong>Address:</strong> {hospital.address}</p>
                        <p><strong>Phone:</strong> {hospital.phone}</p>
                        <p><strong>Available Beds:</strong> {hospital.beds}</p>
                        <button
                          className="hospital-call-btn"
                          onClick={() => handleCall(hospital.phone)}
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

          <button className="hospital-location-btn" onClick={handleLocationClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white"/>
            </svg>
          </button>

          <button className="hospital-list-btn" onClick={handleListClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" fill="white"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hospital;
