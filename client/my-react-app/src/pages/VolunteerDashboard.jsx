import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  
  const [activeTasks, setActiveTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSOS, setSelectedSOS] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    if (userRole !== 'volunteer') {
      navigate('/login');
      return;
    }
    fetchAssignedSOS();
    
    const interval = setInterval(fetchAssignedSOS, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchAssignedSOS = async () => {
    try {
      const response = await axios.get(
        'http://localhost:3000/server/evas_function/app/v1/sos/getAllSOS'
      );
      
      if (response.data.success) {
        const mappedSOS = response.data.data.map(item => ({
          ROWID: item.sos.ROWID,
          userId: item.sos.userId,
          latitude: item.sos.latitude,
          longitude: item.sos.longitude,
          status: item.sos.status,
          CREATEDTIME: item.sos.CREATEDTIME,
          MODIFIEDTIME: item.sos.MODIFIEDTIME,
          assignedVolunteerId: item.sos.assignedVolunteerId,
          resolvedAt: item.sos.resolvedAt,
          severity: item.sos.severity,
          message: item.sos.message,
          userName: item.userTable.name,
          userPhone: item.userTable.phone,
          userEmail: item.userTable.email,
          bloodGroup: item.userTable.bloodGroup,
          medicalInfo: item.userTable.medicalInfo,
          address: item.userTable.address
        }));
        
        const myTasks = mappedSOS.filter(sos => sos.assignedVolunteerId === userId);
        const active = myTasks.filter(task => task.status !== 'resolved');
        const completed = myTasks.filter(task => task.status === 'resolved');
        
        setActiveTasks(active);
        setCompletedTasks(completed);
      }
    } catch (error) {
      console.error('Error fetching SOS:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (sosId, status) => {
    if (!window.confirm(`Mark this SOS as ${status}?`)) return;

    try {
      const response = await axios.put(
        `http://localhost:3000/server/evas_function/app/v1/sos/updateStatus/${sosId}`,
        { status: status }
      );

      if (response.data.success) {
        alert(`✅ SOS marked as ${status}`);
        fetchAssignedSOS();
        setShowDetailsModal(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update status');
    }
  };

  const openMap = (lat, lng) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  const getSeverityIcon = (severity) => {
    if (!severity) return '🟡';
    switch(severity.toLowerCase()) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '🟡';
    }
  };

  const getSeverityColor = (severity) => {
    if (!severity) return 'bg-gray-500';
    switch(severity.toLowerCase()) {
      case 'critical': return 'bg-red-700';
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityText = (severity) => {
    if (!severity) return 'Not Specified';
    switch(severity.toLowerCase()) {
      case 'critical': return '🔥 CRITICAL - Life Threatening';
      case 'high': return '⚠️ HIGH - Serious Emergency';
      case 'medium': return '📌 MEDIUM - Urgent';
      case 'low': return 'ℹ️ LOW - Normal';
      default: return severity;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'assigned':
        return <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs animate-pulse">🔄 In Progress</span>;
      case 'resolved':
        return <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">✅ Completed</span>;
      default:
        return <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 shadow-lg">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">🦸 Volunteer Dashboard</h1>
              <p className="text-green-100 mt-1">Welcome back, {userName}!</p>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={() => navigate('/profile')}
                className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                👤 My Profile
              </button>
              <button 
                onClick={() => {
                  localStorage.clear();
                  navigate('/login');
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              <p className="text-gray-500 text-sm">Active Tasks</p>
              <p className="text-3xl font-bold text-yellow-600">{activeTasks.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              <p className="text-gray-500 text-sm">Completed Tasks</p>
              <p className="text-3xl font-bold text-green-600">{completedTasks.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              <p className="text-gray-500 text-sm">Total Rescues</p>
              <p className="text-3xl font-bold text-blue-600">{completedTasks.length}</p>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'active' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🚨 Active Tasks ({activeTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'completed' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ✅ Completed Tasks ({completedTasks.length})
          </button>
        </div>

        {/* Active Tasks Section */}
        {activeTab === 'active' && (
          <div className="mb-8">
            {activeTasks.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Active Tasks</h3>
                <p className="text-gray-500">You don't have any assigned emergency alerts right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeTasks.map((sos) => (
                  <div key={sos.ROWID} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition">
                    <div className={`${getSeverityColor(sos.severity)} px-4 py-3`}>
                      <div className="flex justify-between items-center text-white">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{getSeverityIcon(sos.severity)}</span>
                          <span className="font-semibold">{getSeverityText(sos.severity)}</span>
                        </div>
                        {getStatusBadge(sos.status)}
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="text-xs text-gray-500 mb-2">SOS ID: {sos.ROWID.slice(-8)}</p>
                      
                      {sos.message && (
                        <div className="bg-red-50 p-2 rounded mb-3">
                          <p className="text-sm text-red-700 font-medium">📢 {sos.message}</p>
                        </div>
                      )}
                      
                      <div className="border-t border-b py-3 mb-3">
                        <p className="text-sm font-semibold text-gray-700 mb-2">👤 Person in Need:</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500">Name:</p>
                            <p className="font-semibold">{sos.userName}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Phone:</p>
                            <p className="font-semibold">{sos.userPhone}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-700 mb-2">📍 Location:</p>
                        <button
                          onClick={() => openMap(sos.latitude, sos.longitude)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          🗺️ Open in Google Maps
                        </button>
                      </div>

                      <div className="flex space-x-3 mt-4">
                        <button
                          onClick={() => {
                            setSelectedSOS(sos);
                            setShowDetailsModal(true);
                          }}
                          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                        >
                          📋 View Full Details
                        </button>
                        <button
                          onClick={() => updateStatus(sos.ROWID, 'resolved')}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                        >
                          ✅ Mark Complete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Completed Tasks Section */}
        {activeTab === 'completed' && (
          <div className="mb-8">
            {completedTasks.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Completed Tasks</h3>
                <p className="text-gray-500">You haven't completed any rescues yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {completedTasks.map((sos) => (
                  <div key={sos.ROWID} className="bg-white rounded-xl shadow-lg overflow-hidden opacity-90">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-3">
                      <div className="flex justify-between items-center text-white">
                        <span className="font-semibold">✅ RESCUE COMPLETED</span>
                        {getStatusBadge(sos.status)}
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="text-xs text-gray-500 mb-2">SOS ID: {sos.ROWID.slice(-8)}</p>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">👤 Person Rescued: <span className="font-semibold">{sos.userName}</span></p>
                        <p className="text-sm text-gray-600">📞 Phone: {sos.userPhone}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Completed on: {new Date(sos.MODIFIEDTIME).toLocaleString()}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedSOS(sos);
                          setShowDetailsModal(true);
                        }}
                        className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SOS Details Modal - Complete Details */}
      {showDetailsModal && selectedSOS && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className={`sticky top-0 ${getSeverityColor(selectedSOS.severity)} text-white p-4 flex justify-between items-center`}>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getSeverityIcon(selectedSOS.severity)}</span>
                <h2 className="text-xl font-bold">🚨 SOS Emergency Details</h2>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Emergency Type & Severity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Emergency Severity</p>
                  <p className={`font-semibold inline-block px-2 py-1 rounded ${getSeverityColor(selectedSOS.severity)} text-white`}>
                    {getSeverityText(selectedSOS.severity)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-semibold capitalize">{selectedSOS.status}</p>
                </div>
              </div>

              {/* Emergency Message */}
              {selectedSOS.message && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <p className="text-sm text-gray-500 mb-1">📢 Emergency Message</p>
                  <p className="text-red-700 font-medium">{selectedSOS.message}</p>
                </div>
              )}

              {/* SOS Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">SOS ID</p>
                  <p className="font-mono text-sm">{selectedSOS.ROWID}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p>{new Date(selectedSOS.CREATEDTIME).toLocaleString()}</p>
                </div>
              </div>

              {selectedSOS.resolvedAt && (
                <div>
                  <p className="text-sm text-gray-500">Completed At</p>
                  <p>{new Date(selectedSOS.resolvedAt).toLocaleString()}</p>
                </div>
              )}

              {/* Person in Need - Complete Info */}
              <div className="border-t pt-4">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                  <span className="text-xl mr-2">👤</span> Person in Need
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-semibold">{selectedSOS.userName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-semibold">{selectedSOS.userPhone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p>{selectedSOS.userEmail}</p>
                  </div>
                  {selectedSOS.address && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Address</p>
                      <p>{selectedSOS.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Details */}
              <div className="border-t pt-4">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                  <span className="text-xl mr-2">📍</span> Location Details
                </h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Latitude: <span className="font-mono">{selectedSOS.latitude}</span></p>
                  <p className="text-sm text-gray-600">Longitude: <span className="font-mono">{selectedSOS.longitude}</span></p>
                  <button
                    onClick={() => openMap(selectedSOS.latitude, selectedSOS.longitude)}
                    className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full"
                  >
                    🗺️ Open in Google Maps
                  </button>
                </div>
              </div>

              {/* Medical Information */}
              {(selectedSOS.medicalInfo || selectedSOS.bloodGroup) && (
                <div className="border-t pt-4">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                    <span className="text-xl mr-2">🏥</span> Medical Information
                  </h3>
                  {selectedSOS.medicalInfo && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-2">
                      <p className="text-sm text-gray-500">Medical Conditions</p>
                      <p className="text-gray-700">{selectedSOS.medicalInfo}</p>
                    </div>
                  )}
                  {selectedSOS.bloodGroup && (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Blood Group</p>
                      <p className="font-bold text-red-700 text-lg">{selectedSOS.bloodGroup}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t pt-4 flex space-x-3">
                {selectedSOS.status === 'assigned' && (
                  <button
                    onClick={() => updateStatus(selectedSOS.ROWID, 'resolved')}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                  >
                    ✅ Mark as Completed
                  </button>
                )}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerDashboard;