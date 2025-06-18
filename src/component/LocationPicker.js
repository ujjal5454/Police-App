import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { useNavigate, useLocation } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './LocationPicker.css';
import locationIcon from '../assets/icons/location.png';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function MapEvents({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

function ChangeView({ center }) {
  const map = useMap();
  map.setView(center);
  return null;
}

const LocationPicker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [position, setPosition] = useState(() => {
    const existingLocation = location.state?.selectedLocation?.coordinates;
    return existingLocation ? { lat: existingLocation[0], lng: existingLocation[1] } : null;
  });
  const [address, setAddress] = useState(location.state?.selectedLocation?.address || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState(() => {
    const existingLocation = location.state?.selectedLocation?.coordinates;
    return existingLocation ? [existingLocation[0], existingLocation[1]] : [27.7172, 85.3240];
  });

  const handleLocationSelect = useCallback(async (latlng) => {
    console.log('Selected coordinates:', latlng);
    setPosition(latlng);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`
      );
      const data = await response.json();
      console.log('Received address data:', data);
      
      // Extract the area name and plus code
      const area = data.address?.suburb || 
                  data.address?.neighbourhood || 
                  data.address?.locality || 
                  data.address?.village ||
                  '';
      
      // Generate a plus code-like format using coordinates
      const lat = Math.abs(latlng.lat).toFixed(4);
      const lng = Math.abs(latlng.lng).toFixed(4);
      const plusCode = `${lat}${lng}`.replace(/\./g, '').substring(0, 8);
      
      const formattedAddress = `${area},${plusCode}`;
      setAddress(formattedAddress);
      
    } catch (error) {
      console.error('Error getting address:', error);
      setAddress('Location selected');
    }
  }, []);

  useEffect(() => {
    // Only get user's location if no existing location is set
    if (!position) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCenter = [pos.coords.latitude, pos.coords.longitude];
          setMapCenter(newCenter);
          handleLocationSelect({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [position, handleLocationSelect]);

  const handleBack = () => {
    const navigationState = {
      selectedLocation: position ? {
        coordinates: [position.lat, position.lng],
        address: address
      } : null,
      previousFormData: location.state?.previousFormData || {},
      incidentType: location.state?.incidentType,
      fromReportIncident: location.state?.fromReportIncident,
      fromPublicEye: location.state?.fromPublicEye
    };
    if (location.state?.fromPublicEye) {
      navigate('/public-eye', { state: navigationState, replace: true });
    } else {
      navigate('/incident-details', { state: navigationState, replace: true });
    }
  };

  const handleConfirm = () => {
    if (position) {
      const navigationState = {
        selectedLocation: {
          coordinates: [position.lat, position.lng],
          address: address
        },
        previousFormData: location.state?.previousFormData || {},
        incidentType: location.state?.incidentType,
        fromReportIncident: location.state?.fromReportIncident,
        fromPublicEye: location.state?.fromPublicEye
      };
      if (location.state?.fromPublicEye) {
        navigate('/public-eye', { state: navigationState, replace: true });
      } else {
        navigate('/incident-details', { state: navigationState, replace: true });
      }
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        const newCenter = [parseFloat(lat), parseFloat(lon)];
        setMapCenter(newCenter);
        handleLocationSelect({ lat: parseFloat(lat), lng: parseFloat(lon) });
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  return (
    <div className="location-picker-container">
      <div className="location-picker-card">
        <div className="location-header">
          <button className="back-button" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
            </svg>
          </button>
          <h2>Add Location</h2>
        </div>

        <div className="search-container">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-button">
              <svg viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
              </svg>
            </button>
          </form>
        </div>

        <div className="map-container">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <ChangeView center={mapCenter} />
            {position && <Marker position={position} />}
            <MapEvents onLocationSelect={handleLocationSelect} />
          </MapContainer>
        </div>

        {position && (
          <div className="location-footer">
            <div className="selected-location">
              <img src={locationIcon} alt="Location" className="location-icon" />
              <div className="location-text">{address || 'Location selected'}</div>
            </div>
            <button className="confirm-button" onClick={handleConfirm}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationPicker;