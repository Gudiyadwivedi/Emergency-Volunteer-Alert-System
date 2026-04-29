import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3000/server/evas_function/app/v1/user/getById/${userId}`
      );
      
      if (response.data.success) {
        const userData = response.data.data;
        
        const mappedProfile = {
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: userData.role || 'user',
          address: userData.address || '',
          isVerified: userData.isVerified || false,
          bloodGroup: userData.bloodGroup || 'Not specified',
          medicalInfo: userData.medicalInfo || '',
          emergencyContacts: [
            { 
              name: userData.emergencyContactName || '', 
              phone: userData.emergencyContactPhone || '', 
              relation: 'Emergency Contact' 
            }
          ]
        };
        
        setProfile(mappedProfile);
        setEditedProfile(mappedProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setUpdating(true);
      setError('');
      
      const updateData = {
        name: editedProfile.name,
        email: editedProfile.email,
        phone: editedProfile.phone,
        address: editedProfile.address || '',
        bloodGroup: editedProfile.bloodGroup || 'Not specified',
        medicalInfo: editedProfile.medicalInfo || '',
        emergencyContactName: editedProfile.emergencyContacts[0]?.name || '',
        emergencyContactPhone: editedProfile.emergencyContacts[0]?.phone || ''
      };
      
      // ✅ Correct API endpoint
      const response = await axios.put(
        `http://localhost:3000/server/evas_function/app/v1/user/updateUser/${userId}`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setProfile(editedProfile);
        setIsEditing(false);
        alert('Profile updated successfully!');
        
        if (editedProfile.name !== profile.name) {
          localStorage.setItem('userName', editedProfile.name);
        }
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMsg = error.response?.data?.message || 'Failed to update profile';
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      emergencyContacts: [{ ...prev.emergencyContacts[0], [field]: value }]
    }));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="text-xl text-gray-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="text-xl text-red-600">{error}</div>
          <button 
            onClick={fetchUserProfile}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">My Profile</h1>
              <p className="text-red-100 mt-2">Manage your account information</p>
            </div>
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <span className="text-4xl">{profile?.name?.charAt(0) || '👤'}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isEditing ? (
            // View Mode
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Full Name</label>
                  <p className="mt-1 text-lg text-gray-900">{profile.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-lg text-gray-900">{profile.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="mt-1 text-lg text-gray-900">{profile.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Role</label>
                  <p className="mt-1 text-lg text-gray-900 capitalize">{profile.role}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Address</label>
                  <p className="mt-1 text-lg text-gray-900">{profile.address || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Account Status</label>
                  <p className="mt-1 text-lg text-gray-900">
                    {profile.isVerified ? (
                      <span className="text-green-600">✓ Verified</span>
                    ) : (
                      <span className="text-yellow-600">⚠ Not Verified</span>
                    )}
                  </p>
                </div>
                
                {profile.role === 'user' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Blood Group</label>
                      <p className="mt-1 text-lg text-gray-900">{profile.bloodGroup}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500">Medical Information</label>
                      <p className="mt-1 text-lg text-gray-900">
                        {profile.medicalInfo || 'No medical information provided'}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Emergency Contacts */}
              {profile.emergencyContacts && profile.emergencyContacts[0]?.name && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Emergency Contact</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500">Name</label>
                        <p className="font-medium">{profile.emergencyContacts[0].name}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Phone</label>
                        <p className="font-medium">{profile.emergencyContacts[0].phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-6">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editedProfile.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editedProfile.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editedProfile.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={editedProfile.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter your address"
                  />
                </div>
                
                {profile.role === 'user' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                      <select
                        name="bloodGroup"
                        value={editedProfile.bloodGroup}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="Not specified">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medical Information (Allergies, Conditions, etc.)
                      </label>
                      <textarea
                        name="medicalInfo"
                        rows="3"
                        value={editedProfile.medicalInfo}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                        placeholder="e.g., Allergic to Penicillin, Diabetic, Asthma"
                      ></textarea>
                      <p className="text-xs text-gray-500 mt-1">
                        This information helps emergency responders provide better care
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Emergency Contact Edit */}
              {profile.role === 'user' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Emergency Contact Name"
                      value={editedProfile.emergencyContacts[0]?.name || ''}
                      onChange={(e) => handleContactChange('name', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="tel"
                      placeholder="Emergency Contact Phone"
                      value={editedProfile.emergencyContacts[0]?.phone || ''}
                      onChange={(e) => handleContactChange('phone', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancel}
                  disabled={updating}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={updating}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;