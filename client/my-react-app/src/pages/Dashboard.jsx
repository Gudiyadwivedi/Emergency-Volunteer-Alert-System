import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName');
  const userId = localStorage.getItem('userId');
  
  const [mySOS, setMySOS] = useState([]);
  const [activeSOS, setActiveSOS] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({
    activeEmergencies: 0,
    resolvedToday: 0,
    totalSOS: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
    
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all SOS data
      const response = await axios.get(
        'http://localhost:3000/server/evas_function/app/v1/sos/getAllSOS'
      );
      
      if (response.data.success) {
        // Map SOS data with user info
        const mappedSOS = response.data.data.map(item => ({
          ROWID: item.sos.ROWID,
          userId: item.sos.userId,
          latitude: item.sos.latitude,
          longitude: item.sos.longitude,
          status: item.sos.status,
          CREATEDTIME: item.sos.CREATEDTIME,
          resolvedAt: item.sos.resolvedAt,
          assignedVolunteerId: item.sos.assignedVolunteerId,
          severity: item.sos.severity,
          message: item.sos.message,
          userName: item.userTable.name,
          userPhone: item.userTable.phone,
          userEmail: item.userTable.email
        }));
        
        // ✅ ONLY current user's SOS
        const mySOSList = mappedSOS.filter(sos => sos.userId === userId);
        
        // Active emergencies (current user's active/assigned SOS)
        const active = mySOSList.filter(s => s.status === 'active' || s.status === 'assigned');
        
        // Recent activity (current user's last 5 SOS)
        const recent = mySOSList.slice(0, 5);
        
        // Today's resolved SOS (current user's)
        const today = new Date().toDateString();
        const resolvedToday = mySOSList.filter(s => {
          if (!s.resolvedAt) return false;
          return s.status === 'resolved' && new Date(s.resolvedAt).toDateString() === today;
        }).length;
        
        setMySOS(mySOSList);
        setActiveSOS(active);
        setRecentActivity(recent);
        setStats({
          activeEmergencies: active.length,
          resolvedToday: resolvedToday,
          totalSOS: mySOSList.length
        });
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
              <h1 className="text-3xl font-bold">🚨 EVAS Dashboard</h1>
              <p className="text-red-100 mt-1">Welcome back, {userName || 'User'}!</p>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={() => navigate('/sos')}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
              >
                🚨 Send SOS
              </button>
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
        {/* Stats Cards - Sirf current user ke stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">My Active SOS</p>
                <p className="text-3xl font-bold text-red-600">{stats.activeEmergencies}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚨</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Resolved Today</p>
                <p className="text-3xl font-bold text-green-600">{stats.resolvedToday}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total SOS Sent</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalSOS}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📢</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Volunteers</p>
                <p className="text-3xl font-bold text-purple-600">0</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🦸</span>
              </div>
            </div>
          </div>
        </div>

        {/* My Active Emergencies - Sirf current user ke active SOS */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">🚨 My Active Emergencies</h2>
            <button 
              onClick={fetchDashboardData}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              🔄 Refresh
            </button>
          </div>

          {activeSOS.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-6xl mb-3">✅</div>
              <p className="text-gray-500">You have no active emergencies</p>
              <p className="text-sm text-gray-400 mt-1">All clear! Your SOS history will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeSOS.map((sos) => (
                <div key={sos.ROWID} className="border border-red-200 rounded-lg p-4 hover:shadow-lg transition bg-red-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusBadge(sos.status)}
                        <span className="text-xs text-gray-500">
                          {new Date(sos.CREATEDTIME).toLocaleString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm text-gray-600">👤 Person in Need:</p>
                          <p className="font-semibold text-gray-800">{sos.userName}</p>
                          <p className="text-sm text-gray-600">📞 {sos.userPhone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">📍 Location:</p>
                          <p className="text-sm font-mono text-gray-700">
                            Lat: {sos.latitude}, Lng: {sos.longitude}
                          </p>
                          <button 
                            onClick={() => window.open(`https://www.google.com/maps?q=${sos.latitude},${sos.longitude}`, '_blank')}
                            className="text-xs text-blue-600 hover:underline mt-1"
                          >
                            View on Map →
                          </button>
                        </div>
                      </div>
                      {sos.message && (
                        <div className="mt-2 p-2 bg-red-100 rounded">
                          <p className="text-sm text-red-700">📢 {sos.message}</p>
                        </div>
                      )}
                      {sos.status === 'assigned' && sos.assignedVolunteerId && (
                        <div className="mt-2 p-2 bg-yellow-100 rounded">
                          <p className="text-sm text-yellow-700">👤 Volunteer assigned. Help is on the way!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Recent Activity - Sirf current user ki activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">📋 My Recent Activity</h2>
          
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No recent activity</p>
              <p className="text-sm text-gray-400 mt-1">Send an SOS to see activity here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.ROWID} className="flex items-center justify-between p-3 border-b hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {activity.status === 'active' && <span className="text-red-500">🚨</span>}
                      {activity.status === 'assigned' && <span className="text-yellow-500">👤</span>}
                      {activity.status === 'resolved' && <span className="text-green-500">✅</span>}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {activity.status === 'active' ? 'SOS Alert Sent' : 
                         activity.status === 'assigned' ? 'Volunteer Assigned' : 
                         'Emergency Resolved'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.CREATEDTIME).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(activity.status)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <button
            onClick={() => navigate('/sos')}
            className="bg-red-600 text-white p-4 rounded-xl shadow-lg hover:bg-red-700 transition"
          >
            🚨 Send SOS Alert
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="bg-blue-600 text-white p-4 rounded-xl shadow-lg hover:bg-blue-700 transition"
          >
            👤 Update Profile
          </button>
          <button
            onClick={() => navigate('/my-sos-history')}
            className="bg-green-600 text-white p-4 rounded-xl shadow-lg hover:bg-green-700 transition"
          >
            📜 My SOS History
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;