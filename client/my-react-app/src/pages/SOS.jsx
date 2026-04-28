import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SOS = () => {
  const [location, setLocation] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [sosActivated, setSosActivated] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (sosActivated && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (sosActivated && countdown === 0) {
      sendSOS();
    }
  }, [sosActivated, countdown]);

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        });
      } else {
        reject(new Error("Geolocation not supported"));
      }
    });
  };

  const sendSOS = async () => {
    setLoading(true);
    try {
      const position = await getLocation();
      const emergencyData = {
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        },
        timestamp: new Date().toISOString(),
        userId: localStorage.getItem('userId'),
        status: 'active'
      };
      
      // Here you would send to your backend
      console.log('SOS Sent:', emergencyData);
      
      // Store in localStorage for demo
      localStorage.setItem('activeEmergency', JSON.stringify(emergencyData));
      
      alert('SOS Alert Sent! Volunteers are on their way.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error sending SOS:', error);
      alert('Failed to send SOS. Please ensure location services are enabled.');
    } finally {
      setLoading(false);
    }
  };

  const handleSOS = () => {
    setSosActivated(true);
  };

  const cancelSOS = () => {
    setSosActivated(false);
    setCountdown(3);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-red-100 to-red-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {!sosActivated ? (
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
              <h1 className="text-3xl font-bold text-red-600 mb-4">Emergency SOS</h1>
              <p className="text-gray-600 mb-8">
                Press the button below to send an immediate alert to nearby volunteers and your emergency contacts.
              </p>
              <button
                onClick={handleSOS}
                className="w-48 h-48 bg-red-600 rounded-full text-white text-4xl font-bold animate-pulse hover:bg-red-700 transition shadow-2xl"
              >
                🚨<br />SOS
              </button>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important</h3>
              <p className="text-sm text-yellow-700">
                Only use this button in genuine emergencies. False alarms will be tracked and may result in account suspension.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="text-7xl mb-4">🚨</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">SOS Alert in {countdown}</h2>
            <p className="text-gray-600 mb-6">
              Your location is being captured. Alert will be sent in {countdown} seconds.
            </p>
            <div className="w-32 h-32 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <button
              onClick={cancelSOS}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        )}
        
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-700">Sending emergency alert...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SOS;