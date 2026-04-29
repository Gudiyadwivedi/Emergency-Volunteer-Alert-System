import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const emergencyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const criticalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [35, 57],
  iconAnchor: [17, 57],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to auto-fit map bounds
function MapBounds({ locations }) {
  const map = useMap();
  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);
  return null;
}

const VolunteerMap = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Center of India
  const [mapZoom, setMapZoom] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyEmergencies();
      const interval = setInterval(fetchNearbyEmergencies, 15000);
      return () => clearInterval(interval);
    }
  }, [userLocation]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setMapCenter([position.coords.latitude, position.coords.longitude]);
        setMapZoom(13);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Please enable location access to see nearby emergencies');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  };

  const fetchNearbyEmergencies = async () => {
    if (!userLocation) return;

    try {
      setLoading(true);
      const response = await axios.get(
        'http://localhost:3000/server/evas_function/app/v1/sos/getAllSOS'
      );

      if (response.data.success) {
        const allEmergencies = response.data.data.map(item => ({
          id: item.sos.ROWID,
          userId: item.sos.userId,
          latitude: parseFloat(item.sos.latitude),
          longitude: parseFloat(item.sos.longitude),
          status: item.sos.status,
          createdTime: item.sos.CREATEDTIME,
          message: item.sos.message,
          severity: item.sos.severity,
          userName: item.userTable.name,
          userPhone: item.userTable.phone,
          userEmail: item.userTable.email,
          bloodGroup: item.userTable.bloodGroup,
          medicalInfo: item.userTable.medicalInfo
        }));

        const activeEmergencies = allEmergencies.filter(
          e => e.status === 'active'
        );

        const emergenciesWithDistance = activeEmergencies.map(emergency => ({
          ...emergency,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            emergency.latitude,
            emergency.longitude
          )
        }));

        const sortedEmergencies = emergenciesWithDistance.sort(
          (a, b) => a.distance - b.distance
        );

        const nearbyEmergencies = sortedEmergencies.filter(
          e => e.distance <= 10
        );

        setEmergencies(nearbyEmergencies);
      }
    } catch (error) {
      console.error('Error fetching emergencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return parseFloat((R * c).toFixed(1));
  };

  const handleAcceptEmergency = async (emergency) => {
    if (!window.confirm(`Accept this emergency?\n\n👤 Person: ${emergency.userName}\n📍 Distance: ${emergency.distance} km away\n\nAre you sure you want to respond?`)) {
      return;
    }

    setAcceptingId(emergency.id);
    
    try {
      const volunteerId = localStorage.getItem('userId');
      const volunteerName = localStorage.getItem('userName');

      const response = await axios.put(
        `http://localhost:3000/server/evas_function/app/v1/sos/assignVolunteer/${emergency.id}`,
        { volunteerId: volunteerId }
      );

      if (response.data.success) {
        alert(`✅ You have accepted this emergency!\n\n📍 Location: ${emergency.latitude}, ${emergency.longitude}\n🚗 Please navigate to the location immediately.`);
        setEmergencies(prev => prev.filter(e => e.id !== emergency.id));
        navigate('/volunteer/dashboard');
      } else {
        alert('Failed to accept emergency. Please try again.');
      }
    } catch (error) {
      console.error('Error accepting emergency:', error);
      alert('Failed to accept emergency. Please try again.');
    } finally {
      setAcceptingId(null);
    }
  };

  const getSeverityColor = (severity) => {
    if (!severity) return 'bg-red-500';
    switch(severity.toLowerCase()) {
      case 'critical': return 'bg-red-700';
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-red-500';
    }
  };

  const getSeverityText = (severity) => {
    if (!severity) return 'Emergency';
    switch(severity.toLowerCase()) {
      case 'critical': return '🔴 CRITICAL';
      case 'high': return '🟠 HIGH';
      case 'medium': return '🟡 MEDIUM';
      case 'low': return '🟢 LOW';
      default: return '🚨 EMERGENCY';
    }
  };

  // Prepare map markers
  const mapLocations = emergencies.map(e => ({
    lat: e.latitude,
    lng: e.longitude,
    id: e.id
  }));

  if (!userLocation) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Getting your location...</p>
          <p className="text-sm text-gray-500 mt-2">Please allow location access</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
          <span className="text-4xl mr-3">🗺️</span>
          Volunteer Response Map
          <span className="ml-3 text-sm font-normal text-gray-500 bg-white px-3 py-1 rounded-full shadow">
            {emergencies.length} Active SOS
          </span>
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-[500px] w-full relative">
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: '100%', width: '100%' }}
                  className="z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* User Location Marker */}
                  {userLocation && (
                    <>
                      <Marker
                        position={[userLocation.lat, userLocation.lng]}
                        icon={userIcon}
                      >
                        <Popup>
                          <div className="text-center">
                            <strong>You are here</strong>
                            <br />
                            <span className="text-sm text-gray-600">
                              Accuracy: {Math.round(userLocation.accuracy)}m
                            </span>
                          </div>
                        </Popup>
                      </Marker>
                      
                      {/* User Location Circle (showing accuracy radius) */}
                      <Circle
                        center={[userLocation.lat, userLocation.lng]}
                        radius={userLocation.accuracy}
                        pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
                      />
                    </>
                  )}
                  
                  {/* Emergency Markers */}
                  {emergencies.map((emergency) => (
                    <Marker
                      key={emergency.id}
                      position={[emergency.latitude, emergency.longitude]}
                      icon={emergency.severity === 'critical' ? criticalIcon : emergencyIcon}
                    >
                      <Popup>
                        <div className="min-w-[200px]">
                          <div className={`${getSeverityColor(emergency.severity)} text-white px-2 py-1 rounded-t-lg -mx-3 -mt-3 mb-2`}>
                            <strong>{getSeverityText(emergency.severity)}</strong>
                          </div>
                          <p><strong>👤 Person:</strong> {emergency.userName}</p>
                          <p><strong>📞 Phone:</strong> {emergency.userPhone}</p>
                          <p><strong>📍 Distance:</strong> {emergency.distance} km</p>
                          {emergency.medicalInfo && (
                            <p><strong>🏥 Medical:</strong> {emergency.medicalInfo.substring(0, 50)}</p>
                          )}
                          {emergency.bloodGroup && (
                            <p><strong>🩸 Blood:</strong> {emergency.bloodGroup}</p>
                          )}
                          <button
                            onClick={() => handleAcceptEmergency(emergency)}
                            disabled={acceptingId === emergency.id}
                            className="w-full mt-3 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 text-sm"
                          >
                            {acceptingId === emergency.id ? 'Accepting...' : '🚗 Respond Now'}
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  
                  <MapBounds locations={mapLocations} />
                </MapContainer>
              </div>
              
              {/* Map Legend */}
              <div className="p-3 bg-gray-50 border-t flex flex-wrap gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                  <span>Your Location</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-600 rounded-full mr-2 animate-bounce"></div>
                  <span>Critical Emergency</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                  <span>High Priority</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                  <span>Medium Priority</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-400 rounded-full mr-2"></div>
                  <span>Low Priority</span>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency List */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">🚨</span>
                Active Emergencies
              </h2>
              
              {userLocation && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 mb-4 text-sm border border-blue-200">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                    <span className="font-semibold">📍 Your Location:</span>
                  </div>
                  <p className="text-gray-600 text-xs mt-1 font-mono">
                    {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                  </p>
                  {userLocation.accuracy && (
                    <p className="text-xs text-gray-500 mt-1">
                      🎯 Accuracy: ±{Math.round(userLocation.accuracy)} meters
                    </p>
                  )}
                </div>
              )}
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading emergencies...</p>
                  </div>
                ) : emergencies.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-6xl mb-3 animate-bounce">✅</div>
                    <p className="text-gray-600 font-medium">No Active Emergencies</p>
                    <p className="text-sm text-gray-500 mt-1">All clear in your area!</p>
                    <p className="text-xs text-gray-400 mt-2">You're within 10km radius</p>
                  </div>
                ) : (
                  emergencies.map((emergency, index) => (
                    <div 
                      key={emergency.id} 
                      className="border rounded-lg p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className={`inline-block px-2 py-1 rounded text-xs text-white mb-2 ${getSeverityColor(emergency.severity)} animate-pulse`}>
                            {getSeverityText(emergency.severity)}
                          </div>
                          <div className="font-semibold text-gray-800">{emergency.userName}</div>
                          <div className="text-xs text-gray-500">
                            ⏱️ {new Date(emergency.createdTime).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="relative">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute"></div>
                          <div className="w-3 h-3 bg-red-500 rounded-full relative"></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <span className="mr-1">📍</span>
                        <span className="font-medium">{emergency.distance} km</span>
                        <span className="mx-1">•</span>
                        <span>away from you</span>
                      </div>
                      
                      {emergency.medicalInfo && (
                        <div className="text-sm mb-2 p-2 bg-blue-50 rounded-lg">
                          <span className="font-semibold text-blue-700">🏥 Medical:</span>
                          <span className="text-gray-700 ml-1">{emergency.medicalInfo.substring(0, 50)}</span>
                        </div>
                      )}
                      
                      {emergency.bloodGroup && (
                        <div className="text-sm mb-2 inline-block bg-red-100 px-2 py-1 rounded-full">
                          <span className="font-semibold text-red-700">🩸 {emergency.bloodGroup}</span>
                        </div>
                      )}
                      
                      <button
                        onClick={() => handleAcceptEmergency(emergency)}
                        disabled={acceptingId === emergency.id}
                        className="w-full mt-3 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                      >
                        {acceptingId === emergency.id ? (
                          <span className="flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Accepting...
                          </span>
                        ) : (
                          '🚗 Respond Now'
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Volunteer Status Card */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border border-purple-200">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="text-xl mr-2">🦸</span>
                Your Status
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-700 font-medium">Available for response</span>
                </div>
                <div className="bg-white px-3 py-1 rounded-full shadow text-sm font-semibold text-purple-600">
                  {emergencies.length} Nearby
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-purple-200">
                <button
                  onClick={() => navigate('/volunteer/dashboard')}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all duration-300"
                >
                  📋 Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add animation CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default VolunteerMap;