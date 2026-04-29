import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  
  const [sosList, setSosList] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSOS, setSelectedSOS] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [stats, setStats] = useState({
    activeSOS: 0,
    assignedSOS: 0,
    resolvedSOS: 0,
    totalVolunteers: 0
  });

  useEffect(() => {
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      navigate('/login');
      return;
    }
    
    fetchAllData();
    
    const interval = setInterval(fetchAllData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      await fetchSOSList();
      await fetchVolunteers();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSOSList = async () => {
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
          severity: item.sos.severity,
          resolvedAt: item.sos.resolvedAt,
          message: item.sos.message,
          userName: item.userTable.name,
          userPhone: item.userTable.phone,
          userEmail: item.userTable.email,
          bloodGroup: item.userTable.bloodGroup,
          medicalInfo: item.userTable.medicalInfo,
          address: item.userTable.address
        }));
        
        setSosList(mappedSOS);
        
        const activeSOS = mappedSOS.filter(s => s.status === 'active');
        const assignedSOS = mappedSOS.filter(s => s.status === 'assigned');
        const resolvedSOS = mappedSOS.filter(s => s.status === 'resolved');
        
        setStats(prev => ({
          ...prev,
          activeSOS: activeSOS.length,
          assignedSOS: assignedSOS.length,
          resolvedSOS: resolvedSOS.length
        }));
      }
    } catch (error) {
      console.error('Error fetching SOS:', error);
    }
  };

  const fetchVolunteers = async () => {
    try {
      const response = await axios.get(
        'http://localhost:3000/server/evas_function/app/v1/sos/getVolunteers'
      );
      if (response.data.success) {
        setVolunteers(response.data.data);
        setStats(prev => ({
          ...prev,
          totalVolunteers: response.data.data.length
        }));
      }
    } catch (error) {
      console.error('Error fetching volunteers:', error);
    }
  };

  // ✅ Get volunteer name by ID from volunteers list
  const getVolunteerName = (volunteerId) => {
    if (!volunteerId) return 'Not assigned';
    const volunteer = volunteers.find(v => v.id == volunteerId || v.ROWID == volunteerId);
    return volunteer ? volunteer.name : 'Unknown Volunteer';
  };

  const assignVolunteer = async () => {
    if (!selectedVolunteer) {
      alert('Please select a volunteer');
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:3000/server/evas_function/app/v1/sos/assignVolunteer/${selectedSOS.ROWID}`,
        {
          volunteerId: selectedVolunteer
        }
      );

      if (response.data.success) {
        const volunteerName = response.data.data.volunteer?.name || getVolunteerName(selectedVolunteer);
        alert(`✅ SOS assigned to ${volunteerName}`);
        setShowAssignModal(false);
        setSelectedVolunteer('');
        fetchSOSList();
        fetchVolunteers();
      }
    } catch (error) {
      console.error('Error assigning volunteer:', error);
      alert('Failed to assign volunteer');
    }
  };

  const updateStatus = async (sosId, status) => {
    if (!window.confirm(`Mark this SOS as ${status}?`)) return;

    try {
      const response = await axios.put(
        `http://localhost:3000/server/evas_function/app/v1/sos/updateStatus/${sosId}`,
        { status }
      );

      if (response.data.success) {
        alert(`✅ SOS marked as ${status}`);
        fetchSOSList();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs animate-pulse">🚨 ACTIVE</span>;
      case 'assigned':
        return <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">👤 ASSIGNED</span>;
      case 'resolved':
        return <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">✅ RESOLVED</span>;
      default:
        return <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  const activeSOS = sosList.filter(s => s.status === 'active');
  const assignedSOS = sosList.filter(s => s.status === 'assigned');
  const resolvedSOS = sosList.filter(s => s.status === 'resolved');

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
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 shadow-lg">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">👑 EVAS Admin Dashboard</h1>
              <p className="text-red-100 mt-1">Monitor all SOS alerts</p>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={() => navigate('/profile')}
                className="bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                👤 Profile
              </button>
              <button 
                onClick={() => {
                  localStorage.clear();
                  navigate('/login');
                }}
                className="bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active SOS</p>
                <p className="text-3xl font-bold text-red-600">{stats.activeSOS}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚨</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Assigned SOS</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.assignedSOS}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Resolved SOS</p>
                <p className="text-3xl font-bold text-green-600">{stats.resolvedSOS}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Volunteers</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalVolunteers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🦸</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'active' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🚨 Active SOS ({activeSOS.length})
          </button>
          <button
            onClick={() => setActiveTab('assigned')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'assigned' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            👤 Assigned SOS ({assignedSOS.length})
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'resolved' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ✅ Resolved SOS ({resolvedSOS.length})
          </button>
        </div>

        {/* Active SOS Tab */}
        {activeTab === 'active' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">🚨 Active SOS (Need Assignment)</h2>
              <button onClick={fetchSOSList} className="text-blue-600 text-sm">🔄 Refresh</button>
            </div>

            {activeSOS.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-6xl mb-3">✅</div>
                <p className="text-gray-500">No active SOS alerts</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeSOS.map((sos) => (
                  <div key={sos.ROWID} className="border-2 border-red-200 rounded-lg p-5 bg-red-50">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-semibold text-red-600">URGENT</span>
                        <span className="text-sm text-gray-500">{new Date(sos.CREATEDTIME).toLocaleString()}</span>
                      </div>
                      <span className="text-xs text-gray-500">ID: {sos.ROWID?.slice(-8)}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">👤 User</p>
                        <p className="font-semibold">{sos.userName}</p>
                        <p className="text-sm">📞 {sos.userPhone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">📍 Location</p>
                        <p className="text-sm font-mono">Lat: {sos.latitude}, Lng: {sos.longitude}</p>
                        <button 
                          onClick={() => window.open(`https://www.google.com/maps?q=${sos.latitude},${sos.longitude}`, '_blank')}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View on Map →
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedSOS(sos);
                        setShowAssignModal(true);
                      }}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                    >
                      👤 Assign to Volunteer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Assigned SOS Tab - ✅ Fixed volunteer name display */}
        {activeTab === 'assigned' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">👤 Assigned SOS (In Progress)</h2>

            {assignedSOS.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-6xl mb-3">📭</div>
                <p className="text-gray-500">No assigned SOS alerts</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignedSOS.map((sos) => {
                  // ✅ Get volunteer name from volunteers list
                  const volunteerName = getVolunteerName(sos.assignedVolunteerId);
                  return (
                    <div key={sos.ROWID} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusBadge(sos.status)}
                            <span className="text-xs text-gray-500">{new Date(sos.CREATEDTIME).toLocaleString()}</span>
                          </div>
                          <p className="font-semibold">{sos.userName}</p>
                          <p className="text-sm text-gray-600">📞 {sos.userPhone}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Assigned to: <span className="font-medium text-green-700">{volunteerName}</span>
                          </p>
                          {sos.assignedVolunteerId && (
                            <p className="text-xs text-gray-400 mt-1">
                              Volunteer ID: {sos.assignedVolunteerId.slice(-8)}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => updateStatus(sos.ROWID, 'resolved')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                        >
                          ✅ Mark Resolved
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Resolved SOS Tab */}
        {activeTab === 'resolved' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">✅ Resolved SOS (Completed)</h2>

            {resolvedSOS.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-6xl mb-3">📭</div>
                <p className="text-gray-500">No resolved SOS alerts</p>
              </div>
            ) : (
              <div className="space-y-4">
                {resolvedSOS.map((sos) => {
                  // ✅ Get volunteer name for resolved SOS too
                  const volunteerName = getVolunteerName(sos.assignedVolunteerId);
                  return (
                    <div key={sos.ROWID} className="border border-green-200 rounded-lg p-4 bg-green-50 opacity-80">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusBadge(sos.status)}
                            <span className="text-xs text-gray-500">{new Date(sos.CREATEDTIME).toLocaleString()}</span>
                          </div>
                          <p className="font-semibold">{sos.userName}</p>
                          <p className="text-sm text-gray-600">📞 {sos.userPhone}</p>
                          {sos.assignedVolunteerId && (
                            <p className="text-sm text-gray-600 mt-1">
                              Handled by: <span className="font-medium text-green-700">{volunteerName}</span>
                            </p>
                          )}
                          {sos.resolvedAt && (
                            <p className="text-xs text-gray-500 mt-1">Resolved on: {new Date(sos.resolvedAt).toLocaleString()}</p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedSOS(sos);
                            setShowAssignModal(true);
                          }}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Assign Volunteer Modal */}
      {showAssignModal && selectedSOS && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Assign Volunteer</h2>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="p-6">
              <div className="mb-4 p-3 bg-red-50 rounded-lg">
                <p className="text-sm font-medium text-red-800">🚨 SOS From:</p>
                <p className="font-semibold">{selectedSOS.userName}</p>
                <p className="text-sm text-gray-600">📞 {selectedSOS.userPhone}</p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Volunteer</label>
                <select
                  value={selectedVolunteer}
                  onChange={(e) => setSelectedVolunteer(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Choose a volunteer...</option>
                  {volunteers.map(vol => (
                    <option key={vol.id} value={vol.id}>
                      {vol.name} - {vol.phone}
                    </option>
                  ))}
                </select>
                {volunteers.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">⚠️ No volunteers available</p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                  Cancel
                </button>
                <button onClick={assignVolunteer} disabled={volunteers.length === 0} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  Assign SOS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;