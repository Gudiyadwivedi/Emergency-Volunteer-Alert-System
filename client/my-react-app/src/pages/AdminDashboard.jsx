import React, { useState } from 'react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [volunteers, setVolunteers] = useState([
    { id: 1, name: 'John Smith', email: 'john@example.com', status: 'pending', rating: 0 },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', status: 'active', rating: 4.8 },
    { id: 3, name: 'Mike Brown', email: 'mike@example.com', status: 'active', rating: 4.9 },
  ]);

  const [emergencies, setEmergencies] = useState([
    { id: 1, type: 'Medical', location: 'Downtown', time: '10:30 AM', status: 'resolved', responseTime: '3 min' },
    { id: 2, type: 'Accident', location: 'Highway', time: '11:15 AM', status: 'active', responseTime: '2 min' },
    { id: 3, type: 'Fire', location: 'Mall', time: '09:45 AM', status: 'resolved', responseTime: '5 min' },
  ]);

  const stats = {
    totalUsers: 1234,
    activeVolunteers: 156,
    emergenciesToday: 12,
    avgResponseTime: '3.2 min',
    resolvedEmergencies: 145,
    pendingVerifications: 23
  };

  const approveVolunteer = (id) => {
    setVolunteers(volunteers.map(v => 
      v.id === id ? { ...v, status: 'active' } : v
    ));
    alert('Volunteer approved successfully!');
  };

  const rejectVolunteer = (id) => {
    setVolunteers(volunteers.filter(v => v.id !== id));
    alert('Volunteer rejected.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="card">
          <div className="text-sm text-gray-500">Total Users</div>
          <div className="text-2xl font-bold text-gray-800">{stats.totalUsers}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Active Volunteers</div>
          <div className="text-2xl font-bold text-green-600">{stats.activeVolunteers}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Emergencies Today</div>
          <div className="text-2xl font-bold text-red-600">{stats.emergenciesToday}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Avg Response Time</div>
          <div className="text-2xl font-bold text-blue-600">{stats.avgResponseTime}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Pending Verifications</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pendingVerifications}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {['overview', 'volunteers', 'emergencies', 'reports'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-red-600 text-red-600 font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'volunteers' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Volunteer Management</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {volunteers.map(volunteer => (
                  <tr key={volunteer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{volunteer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{volunteer.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        volunteer.status === 'active' ? 'bg-green-100 text-green-800' :
                        volunteer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {volunteer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{volunteer.rating || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      {volunteer.status === 'pending' && (
                        <>
                          <button
                            onClick={() => approveVolunteer(volunteer.id)}
                            className="text-green-600 hover:text-green-800"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectVolunteer(volunteer.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'emergencies' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Emergency History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {emergencies.map(emergency => (
                  <tr key={emergency.id}>
                    <td className="px-6 py-4 whitespace-nowrap">#{emergency.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{emergency.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{emergency.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{emergency.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{emergency.responseTime}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        emergency.status === 'active' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {emergency.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">System Reports</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Response Time Analysis</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Response:</span>
                    <span className="font-semibold">3.2 minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Fastest Response:</span>
                    <span className="font-semibold">1.5 minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Slowest Response:</span>
                    <span className="font-semibold">7.8 minutes</span>
                  </div>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Emergency Types</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Medical:</span>
                    <span className="font-semibold">65%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Accident:</span>
                    <span className="font-semibold">25%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Other:</span>
                    <span className="font-semibold">10%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Download Reports</h3>
              <div className="space-x-3">
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Download CSV
                </button>
                <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Recent Activity</h3>
              <ul className="space-y-2 text-sm">
                <li>• New volunteer registered: John Doe</li>
                <li>• Emergency #1243 resolved</li>
                <li>• 5 new users joined today</li>
                <li>• System health check: All systems operational</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">System Alerts</h3>
              <ul className="space-y-2 text-sm">
                <li className="text-green-600">✓ All services running normally</li>
                <li className="text-green-600">✓ Database backups completed</li>
                <li className="text-yellow-600">⚠️ 23 volunteers pending verification</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;