import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = ({ userRole }) => {
  const [activeEmergencies, setActiveEmergencies] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // Load emergency data
    const emergency = localStorage.getItem('activeEmergency');
    if (emergency) {
      setActiveEmergencies([JSON.parse(emergency)]);
    }

    // Mock recent activities
    setRecentActivities([
      { id: 1, type: 'response', message: 'Volunteer John reached location', time: '2 mins ago' },
      { id: 2, type: 'alert', message: 'SOS alert responded by 3 volunteers', time: '5 mins ago' },
      { id: 3, type: 'status', message: 'Emergency #1234 resolved', time: '10 mins ago' }
    ]);
  }, []);

  const userStats = {
    volunteer: {
      title: "Volunteer Dashboard",
      stats: [
        { label: "Total Responses", value: "12" },
        { label: "Lives Saved", value: "8" },
        { label: "Response Rate", value: "95%" }
      ]
    },
    user: {
      title: "User Dashboard",
      stats: [
        { label: "Emergency Contacts", value: "3" },
        { label: "Active Alerts", value: activeEmergencies.length },
        { label: "Safety Score", value: "98%" }
      ]
    },
    admin: {
      title: "Admin Dashboard",
      stats: [
        { label: "Active Volunteers", value: "156" },
        { label: "Total Users", value: "1,234" },
        { label: "Active Emergencies", value: activeEmergencies.length }
      ]
    }
  };

  const currentStats = userStats[userRole] || userStats.user;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">{currentStats.title}</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {currentStats.stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="text-gray-600 text-sm">{stat.label}</div>
            <div className="text-3xl font-bold text-red-600">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/sos" className="block w-full bg-red-600 text-white text-center px-4 py-2 rounded-lg hover:bg-red-700 transition">
              🚨 Trigger SOS Alert
            </Link>
            {userRole === 'volunteer' && (
              <Link to="/volunteer-map" className="block w-full bg-blue-600 text-white text-center px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                📍 View Active Emergencies
              </Link>
            )}
            <Link to="/profile" className="block w-full bg-gray-600 text-white text-center px-4 py-2 rounded-lg hover:bg-gray-700 transition">
              👤 Update Profile
            </Link>
            <Link to="/contact" className="block w-full bg-green-600 text-white text-center px-4 py-2 rounded-lg hover:bg-green-700 transition">
              📞 Add Emergency Contacts
            </Link>
          </div>
        </div>

        {/* Active Emergencies */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Active Emergencies</h2>
          {activeEmergencies.length > 0 ? (
            <div className="space-y-3">
              {activeEmergencies.map((emergency, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-red-600">Active SOS Alert</div>
                      <div className="text-sm text-gray-600">{new Date(emergency.timestamp).toLocaleTimeString()}</div>
                    </div>
                    <div className="text-red-600 animate-pulse">🔴 ACTIVE</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No active emergencies</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivities.map(activity => (
            <div key={activity.id} className="flex items-center justify-between py-2 border-b">
              <div>
                <div className="text-gray-800">{activity.message}</div>
                <div className="text-xs text-gray-500">{activity.time}</div>
              </div>
              {activity.type === 'response' && <span className="text-green-600">✓</span>}
              {activity.type === 'alert' && <span className="text-red-600">🚨</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;