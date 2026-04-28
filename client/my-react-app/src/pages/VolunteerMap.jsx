import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VolunteerMap = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentLocation();
    loadEmergencies();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const loadEmergencies = () => {
    // Mock emergencies data
    const mockEmergencies = [
      {
        id: 1,
        location: { lat: 28.6139, lng: 77.2090 },
        type: 'Medical Emergency',
        status: 'active',
        victimInfo: { bloodGroup: 'B+', condition: 'Heart Attack' },
        time: '2 mins ago',
        volunteersResponding: 3
      },
      {
        id: 2,
        location: { lat: 28.6200, lng: 77.2100 },
        type: 'Accident',
        status: 'active',
        victimInfo: { condition: 'Injury' },
        time: '5 mins ago',
        volunteersResponding: 2
      }
    ];
    setEmergencies(mockEmergencies);
  };

  const handleAcceptEmergency = (emergency) => {
    if (window.confirm(`Accept this emergency? ${emergency.type}`)) {
      // Here you would send response to backend
      alert('You have accepted this emergency. Navigate to the location immediately.');
      navigate(`/emergency/${emergency.id}`);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Volunteer Response Map</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <div className="lg:col-span-2">
          <div className="card p-0 overflow-hidden">
            <div className="bg-gray-200 h-96 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🗺️</div>
                  <p className="text-gray-600">Interactive Map would load here</p>
                  <p className="text-sm text-gray-500">Using Google Maps API</p>
                  {userLocation && (
                    <p className="text-xs text-gray-400 mt-2">
                      Your Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency List */}
        <div>
          <div className="card mb-4">
            <h2 className="text-xl font-semibold mb-4">Active Emergencies Near You</h2>
            {userLocation && (
              <div className="bg-blue-50 rounded-lg p-3 mb-4 text-sm">
                📍 Monitoring within 2km radius
              </div>
            )}
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {emergencies.map(emergency => (
                <div key={emergency.id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-red-600">{emergency.type}</div>
                      <div className="text-xs text-gray-500">{emergency.time}</div>
                    </div>
                    <div className="text-red-600 animate-pulse">🔴</div>
                  </div>
                  
                  {userLocation && (
                    <div className="text-sm text-gray-600 mb-2">
                      📍 {calculateDistance(userLocation.lat, userLocation.lng, emergency.location.lat, emergency.location.lng)} km away
                    </div>
                  )}
                  
                  <div className="text-sm mb-2">
                    <span className="font-semibold">Victim Info:</span> {emergency.victimInfo.condition}
                    {emergency.victimInfo.bloodGroup && `, Blood: ${emergency.victimInfo.bloodGroup}`}
                  </div>
                  
                  <div className="text-sm text-blue-600 mb-3">
                    👥 {emergency.volunteersResponding} volunteers responding
                  </div>
                  
                  <button
                    onClick={() => handleAcceptEmergency(emergency)}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    I'm Coming!
                  </button>
                </div>
              ))}
              
              {emergencies.length === 0 && (
                <p className="text-gray-600 text-center py-8">No active emergencies in your area</p>
              )}
            </div>
          </div>
          
          <div className="card">
            <h3 className="font-semibold mb-2">Volunteer Status</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Available for response</span>
              </div>
              <button className="text-sm text-red-600">Set Unavailable</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerMap;