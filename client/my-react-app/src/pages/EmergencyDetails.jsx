import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EmergencyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [emergency, setEmergency] = useState(null);
  const [status, setStatus] = useState('accepted');
  const [eta, setEta] = useState(null);

  useEffect(() => {
    // Load emergency details
    const mockEmergency = {
      id: id,
      type: 'Medical Emergency - Heart Attack',
      location: { lat: 28.6139, lng: 77.2090 },
      address: '123 Main Street, City Center',
      victimInfo: {
        name: 'John Doe',
        age: 65,
        bloodGroup: 'B+',
        medicalConditions: 'Heart condition, Diabetic',
        allergies: 'None'
      },
      time: '2024-01-15T10:30:00',
      status: 'active'
    };
    setEmergency(mockEmergency);

    // Simulate ETA calculation
    setTimeout(() => {
      setEta('4 minutes');
    }, 1000);
  }, [id]);

  const updateStatus = (newStatus) => {
    setStatus(newStatus);
    if (newStatus === 'reached') {
      alert('You have marked yourself as reached. Provide assistance while waiting for professional help.');
    } else if (newStatus === 'resolved') {
      alert('Emergency resolved! Thank you for your service.');
      navigate('/volunteer-map');
    }
  };

  if (!emergency) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading emergency details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-red-600 text-white rounded-t-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Active Emergency Response</h1>
            <p className="text-red-100">Emergency ID: #{emergency.id}</p>
          </div>
          <div className="text-right">
            <div className="text-red-200">Status</div>
            <div className="font-semibold uppercase">{status}</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-b-lg shadow-xl p-6">
        {/* Emergency Info */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Emergency Details</h2>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-semibold">{emergency.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-semibold">{new Date(emergency.time).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold">{emergency.address}</p>
              </div>
              {eta && (
                <div>
                  <p className="text-sm text-gray-600">Estimated Arrival</p>
                  <p className="font-semibold text-green-600">{eta}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Victim Information */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Victim Information</h2>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold">{emergency.victimInfo.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="font-semibold">{emergency.victimInfo.age}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Blood Group</p>
                <p className="font-semibold">{emergency.victimInfo.bloodGroup}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Medical Conditions</p>
                <p className="font-semibold">{emergency.victimInfo.medicalConditions}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Allergies</p>
                <p className="font-semibold">{emergency.victimInfo.allergies || 'None'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Response Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {status === 'accepted' && (
              <>
                <button
                  onClick={() => updateStatus('enroute')}
                  className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  🚗 Start Navigation
                </button>
                <button
                  onClick={() => updateStatus('reached')}
                  className="bg-yellow-600 text-white px-4 py-3 rounded-lg hover:bg-yellow-700 transition"
                >
                  📍 Reached Location
                </button>
              </>
            )}
            {status === 'enroute' && (
              <button
                onClick={() => updateStatus('reached')}
                className="bg-yellow-600 text-white px-4 py-3 rounded-lg hover:bg-yellow-700 transition"
              >
                📍 Mark as Reached
              </button>
            )}
            {status === 'reached' && (
              <button
                onClick={() => updateStatus('resolved')}
                className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition"
              >
                ✅ Mark as Resolved
              </button>
            )}
            <button
              onClick={() => window.open(`https://maps.google.com/?q=${emergency.location.lat},${emergency.location.lng}`, '_blank')}
              className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition"
            >
              🗺️ Open in Google Maps
            </button>
          </div>
        </div>

        {/* Safety Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Safety Instructions</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Ensure your own safety before approaching the victim</li>
            <li>• Call professional emergency services (108) if not already done</li>
            <li>• Do not move the victim unless absolutely necessary</li>
            <li>• Provide basic first aid only if you are trained</li>
            <li>• Wait with the victim until professional help arrives</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmergencyDetails;