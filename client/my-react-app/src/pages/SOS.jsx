import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SOS = () => {
  const [countdown, setCountdown] = useState(3);
  const [sosActivated, setSosActivated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (sosActivated && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (sosActivated && countdown === 0) {
      sendSOS();
    }
  }, [sosActivated, countdown]);

  // ✅ Improved location capture with better accuracy
  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      // Check permission status first
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'denied') {
          reject(new Error("Location permission denied. Please enable location access in browser settings."));
        }
      });

      const options = {
        enableHighAccuracy: true,  // ✅ Use GPS for best accuracy
        timeout: 15000,            // 15 seconds timeout
        maximumAge: 0              // Don't use cached location
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const accuracy = position.coords.accuracy;
          console.log(`📍 Location accuracy: ${accuracy} meters`);
          
          if (accuracy > 500) {
            console.warn(`⚠️ Low accuracy: ${accuracy} meters. Try moving to an open area.`);
          }
          
          resolve({
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: accuracy
            }
          });
        },
        (error) => {
          let errorMessage = "";
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable GPS.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location unavailable. Please check GPS signal.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please try again.";
              break;
            default:
              errorMessage = error.message;
          }
          reject(new Error(errorMessage));
        },
        options
      );
    });
  };

  const sendSOS = async () => {
    setLoading(true);
    setError('');
    
    try {
      // ✅ Get accurate location
      const position = await getLocation();
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      
      if (!userId) {
        alert('Please login again');
        navigate('/login');
        return;
      }

      // ✅ Format to 8 decimal places for better precision
      const latitude = position.coords.latitude.toFixed(8);
      const longitude = position.coords.longitude.toFixed(8);
      const accuracy = Math.round(position.coords.accuracy);

      console.log('📍 SOS Location Details:', {
        latitude,
        longitude,
        accuracy: `${accuracy} meters`,
        timestamp: new Date().toISOString()
      });

      // Prepare data for API
      const sosData = {
        userId: userId,
        latitude: latitude,
        longitude: longitude,
        status: 'active',
        severity: 'high'
      };

      // Send to backend API
      const response = await axios.post(
        'http://localhost:3000/server/evas_function/app/v1/sos/createSOS',
        sosData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        console.log('✅ SOS Sent Successfully:', response.data);
        
        // Store in localStorage for tracking
        localStorage.setItem('activeSOS', JSON.stringify({
          id: response.data.sos.ROWID,
          status: response.data.sos.status,
          timestamp: new Date().toISOString(),
          latitude: latitude,
          longitude: longitude,
          accuracy: accuracy
        }));
        
        // ✅ Show accuracy info to user
        let accuracyMessage = "";
        if (accuracy <= 20) {
          accuracyMessage = "📍 Excellent location accuracy!";
        } else if (accuracy <= 100) {
          accuracyMessage = "📍 Good location accuracy.";
        } else {
          accuracyMessage = "📍 Low accuracy. Try moving to an open area for better response.";
        }
        
        alert(`🚨 SOS Alert Sent Successfully!\n\n${accuracyMessage}\n📍 Accuracy: ${accuracy} meters\n\n🆘 Volunteers are on their way!`);
        navigate('/dashboard');
      } else {
        setError(response.data.message || 'Failed to send SOS');
        alert('Failed to send SOS. Please try again.');
      }
      
    } catch (error) {
      console.error('❌ Error sending SOS:', error);
      
      if (error.response) {
        setError(error.response.data?.message || 'Server error');
        alert(error.response.data?.message || 'Server error. Please try again.');
      } else if (error.request) {
        setError('No response from server. Check your connection.');
        alert('No response from server. Please check your internet connection.');
      } else {
        setError(error.message);
        alert('Error: ' + error.message);
      }
    } finally {
      setLoading(false);
      setSosActivated(false);
      setCountdown(3);
    }
  };

  const handleSOS = () => {
    // Check if user has given location permission before
    if (navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'denied') {
          alert("⚠️ Location access is blocked.\n\nPlease enable location access in your browser settings to send SOS.");
        }
      });
    }
    setSosActivated(true);
    setError('');
    setLocationAccuracy(null);
  };

  const cancelSOS = () => {
    setSosActivated(false);
    setCountdown(3);
    setError('');
    setLocationAccuracy(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {!sosActivated ? (
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">🚨</span>
              </div>
              <h1 className="text-3xl font-bold text-red-600 mb-4">Emergency SOS</h1>
              <p className="text-gray-600 mb-8">
                Press the button below to send an immediate alert to nearby volunteers and emergency services.
              </p>
              
              {/* ✅ Location Tips */}
              <div className="bg-blue-50 rounded-lg p-3 mb-4 text-left">
                <p className="text-sm font-semibold text-blue-800 mb-1">📍 For Best Location Accuracy:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>✓ Enable GPS/Location services</li>
                  <li>✓ Allow location permission when prompted</li>
                  <li>✓ Move to an open area if possible</li>
                  <li>✓ Stay still while capturing location</li>
                </ul>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              
              <button
                onClick={handleSOS}
                className="w-48 h-48 bg-red-600 rounded-full text-white text-4xl font-bold animate-pulse hover:bg-red-700 transition shadow-2xl transform hover:scale-105 duration-200"
              >
                🚨<br />SOS
              </button>
            </div>
            
            {/* Important Information */}
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
                <span className="text-xl mr-2">⚠️</span> Important
              </h3>
              <p className="text-sm text-yellow-700">
                Only use this button in genuine emergencies. False alarms will be tracked and may result in account suspension.
              </p>
              <p className="text-xs text-yellow-600 mt-2">
                Your exact location will be shared with emergency responders.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="text-7xl mb-4 animate-bounce">🚨</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              SOS Alert in {countdown}
            </h2>
            <p className="text-gray-600 mb-6">
              {countdown > 0 ? (
                <>
                  🌍 Getting your exact location...
                  <br />
                  <span className="text-sm text-gray-500">Please stay still for better accuracy</span>
                </>
              ) : (
                '📡 Sending alert with location...'
              )}
            </p>
            
            {/* Countdown Circle */}
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="w-32 h-32 border-4 border-red-200 rounded-full"></div>
              <div 
                className="absolute top-0 left-0 w-32 h-32 border-4 border-red-600 border-t-transparent rounded-full animate-spin"
                style={{ animationDuration: '1s' }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-red-600">{countdown}</span>
              </div>
            </div>
            
            <button
              onClick={cancelSOS}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
            >
              Cancel SOS
            </button>
            
            <p className="text-xs text-gray-500 mt-4">
              Press cancel to abort emergency alert
            </p>
          </div>
        )}
        
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 text-center max-w-sm mx-4">
              <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-800 font-semibold mb-2">🚨 Sending Emergency Alert...</p>
              <p className="text-sm text-gray-600">Notifying nearby volunteers</p>
              {locationAccuracy && (
                <p className="text-xs text-gray-500 mt-2">
                  📍 Location accuracy: {locationAccuracy} meters
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SOS;