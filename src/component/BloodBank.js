import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
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

// Custom blood bank marker icon
const createBloodBankIcon = (count) => {
  return new L.DivIcon({
    className: 'custom-blood-bank-marker',
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
    ">${count || '+'}</div>`,
    iconSize: [35, 35],
    iconAnchor: [17, 17]
  });
};

// Comprehensive blood bank locations across Nepal (all 7 provinces)
const bloodBankLocations = [
  // Province 1 (Koshi Province)
  { id: 1, name: 'B.P. Koirala Institute Blood Bank', address: 'Dharan, Sunsari', phone: '025-520133', position: [26.8147, 87.2769], count: '18' },
  { id: 2, name: 'Koshi Hospital Blood Bank', address: 'Biratnagar, Morang', phone: '021-525777', position: [26.4525, 87.2718], count: '14' },
  { id: 3, name: 'Mechi Zonal Hospital Blood Bank', address: 'Bhadrapur, Jhapa', phone: '023-462042', position: [26.5448, 88.0851], count: '9' },
  { id: 4, name: 'Sagarmatha Zonal Hospital Blood Bank', address: 'Rajbiraj, Saptari', phone: '031-560039', position: [26.5439, 86.7450], count: '11' },

  // Province 2 (Madhesh Province)
  { id: 5, name: 'Janakpur Zonal Hospital Blood Bank', address: 'Janakpur, Dhanusha', phone: '041-520042', position: [26.7288, 85.9266], count: '16' },
  { id: 6, name: 'Narayani Sub-Regional Hospital Blood Bank', address: 'Birgunj, Parsa', phone: '051-522190', position: [27.0104, 84.8821], count: '13' },
  { id: 7, name: 'Gajendra Narayan Singh Hospital Blood Bank', address: 'Rajbiraj, Saptari', phone: '031-560333', position: [26.5439, 86.7450], count: '8' },

  // Bagmati Province
  { id: 8, name: 'Central Blood Bank', address: 'Kathmandu, Nepal', phone: '01-4225344', position: [27.7172, 85.3240], count: '25' },
  { id: 9, name: 'Bir Hospital Blood Bank', address: 'Mahaboudha, Kathmandu', phone: '01-4221119', position: [27.7056, 85.3137], count: '22' },
  { id: 10, name: 'Teaching Hospital Blood Bank', address: 'Maharajgunj, Kathmandu', phone: '01-4412303', position: [27.7394, 85.3350], count: '20' },
  { id: 11, name: 'Patan Hospital Blood Bank', address: 'Lagankhel, Lalitpur', phone: '01-5522266', position: [27.6588, 85.3247], count: '18' },
  { id: 12, name: 'Bhaktapur Hospital Blood Bank', address: 'Bhaktapur, Nepal', phone: '01-6610798', position: [27.6710, 85.4298], count: '12' },
  { id: 13, name: 'Tribhuvan University Blood Bank', address: 'Kirtipur, Kathmandu', phone: '01-4330433', position: [27.6780, 85.2800], count: '15' },
  { id: 14, name: 'Nepal Red Cross Blood Bank', address: 'Kalimati, Kathmandu', phone: '01-4270650', position: [27.6950, 85.3100], count: '28' },
  { id: 15, name: 'Manmohan Hospital Blood Bank', address: 'Swoyambhu, Kathmandu', phone: '01-4271595', position: [27.7150, 85.2900], count: '10' },
  { id: 16, name: 'Dhulikhel Hospital Blood Bank', address: 'Dhulikhel, Kavre', phone: '011-490497', position: [27.6200, 85.5400], count: '14' },
  { id: 17, name: 'Charikot Hospital Blood Bank', address: 'Charikot, Dolakha', phone: '049-420042', position: [27.6761, 86.1494], count: '7' },

  // Gandaki Province
  { id: 18, name: 'Pokhara Hospital Blood Bank', address: 'Pokhara, Kaski', phone: '061-465482', position: [28.2096, 83.9856], count: '19' },
  { id: 19, name: 'Western Regional Hospital Blood Bank', address: 'Pokhara, Kaski', phone: '061-520066', position: [28.2380, 83.9956], count: '17' },
  { id: 20, name: 'Gandaki Medical College Blood Bank', address: 'Pokhara, Kaski', phone: '061-538900', position: [28.1894, 84.0194], count: '12' },
  { id: 21, name: 'Gorkha Hospital Blood Bank', address: 'Gorkha, Gorkha', phone: '064-420042', position: [28.0000, 84.6333], count: '8' },
  { id: 22, name: 'Lamjung Hospital Blood Bank', address: 'Besisahar, Lamjung', phone: '066-520042', position: [28.2333, 84.4167], count: '6' },

  // Lumbini Province
  { id: 23, name: 'Lumbini Provincial Hospital Blood Bank', address: 'Butwal, Rupandehi', phone: '071-547722', position: [27.7000, 83.4486], count: '16' },
  { id: 24, name: 'Bheri Zonal Hospital Blood Bank', address: 'Nepalgunj, Banke', phone: '081-521477', position: [28.0500, 81.6167], count: '14' },
  { id: 25, name: 'Rapti Zonal Hospital Blood Bank', address: 'Tulsipur, Dang', phone: '082-560042', position: [28.1333, 82.2833], count: '11' },
  { id: 26, name: 'United Mission Hospital Blood Bank', address: 'Tansen, Palpa', phone: '075-520042', position: [27.8667, 83.5500], count: '9' },
  { id: 27, name: 'Kapilvastu Hospital Blood Bank', address: 'Kapilvastu, Kapilvastu', phone: '076-580042', position: [27.5667, 83.0500], count: '7' },

  // Karnali Province
  { id: 28, name: 'Karnali Provincial Hospital Blood Bank', address: 'Surkhet, Surkhet', phone: '083-520042', position: [28.6000, 81.6167], count: '12' },
  { id: 29, name: 'Jumla Hospital Blood Bank', address: 'Khalanga, Jumla', phone: '087-520042', position: [29.2742, 82.1833], count: '5' },
  { id: 30, name: 'Dolpa Hospital Blood Bank', address: 'Dunai, Dolpa', phone: '087-580042', position: [29.0333, 82.9000], count: '4' },

  // Sudurpashchim Province
  { id: 31, name: 'Seti Provincial Hospital Blood Bank', address: 'Dhangadhi, Kailali', phone: '091-521977', position: [28.6833, 80.6000], count: '15' },
  { id: 32, name: 'Mahakali Zonal Hospital Blood Bank', address: 'Mahendranagar, Kanchanpur', phone: '099-521042', position: [28.9667, 80.1833], count: '10' },
  { id: 33, name: 'Doti Hospital Blood Bank', address: 'Silgadhi, Doti', phone: '094-420042', position: [29.2667, 80.9833], count: '6' },
  { id: 34, name: 'Bajura Hospital Blood Bank', address: 'Martadi, Bajura', phone: '096-420042', position: [29.5333, 81.2167], count: '4' },

  // Additional major hospitals
  { id: 35, name: 'Chitwan Medical College Blood Bank', address: 'Bharatpur, Chitwan', phone: '056-526006', position: [27.6800, 84.4300], count: '13' },
  { id: 36, name: 'College of Medical Sciences Blood Bank', address: 'Bharatpur, Chitwan', phone: '056-525555', position: [27.6333, 84.4333], count: '11' },
];

const BloodBank = () => {
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
    navigate('/blood-bank-list');
  };

  // Filter blood banks based on search query
  const filteredBloodBanks = bloodBankLocations.filter(bank =>
    bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bank.address.toLowerCase().includes(searchQuery.toLowerCase())
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

        <div className="blood-bank-search-container">
          <div className="blood-bank-search-wrapper">
            <input
              type="text"
              placeholder="Search Blood Bank"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="blood-bank-search-input"
            />
            <svg className="blood-bank-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div className="blood-bank-map-container">
          {!mapReady && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              color: '#0088cc',
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
            key={`blood-bank-map-${Date.now()}`}
            center={mapCenter}
            zoom={7}
            style={{ height: '500px', width: '100%', position: 'relative', zIndex: 1 }}
            className="blood-bank-map"
            whenCreated={(mapInstance) => {
              console.log('Map created successfully');
              setMapReady(true);
              setTimeout(() => {
                mapInstance.invalidateSize();
              }, 100);
            }}
            whenReady={() => {
              console.log('Map is ready');
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
                {filteredBloodBanks.map((bank) => (
                  <Marker
                    key={bank.id}
                    position={bank.position}
                    icon={createBloodBankIcon(bank.count)}
                  >
                    <Popup>
                      <div className="blood-bank-popup">
                        <h3>{bank.name}</h3>
                        <p><strong>Address:</strong> {bank.address}</p>
                        <p><strong>Phone:</strong> {bank.phone}</p>
                        <p><strong>Available Units:</strong> {bank.count}</p>
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
              </MarkerClusterGroup>

              {userLocation && (
                <Marker position={userLocation}>
                  <Popup>Your Location</Popup>
                </Marker>
              )}
            </MapContainer>

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
