import React, { useState } from 'react';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    role: localStorage.getItem('userRole') || 'user',
    bloodGroup: 'B+',
    medicalConditions: 'Asthma, Allergic to nuts',
    emergencyContacts: [
      { name: 'Jane Doe', phone: '+1234567891', relation: 'Spouse' },
      { name: 'Bob Smith', phone: '+1234567892', relation: 'Brother' }
    ]
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
  };

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (index, field, value) => {
    const updatedContacts = [...editedProfile.emergencyContacts];
    updatedContacts[index][field] = value;
    setEditedProfile(prev => ({ ...prev, emergencyContacts: updatedContacts }));
  };

  const addEmergencyContact = () => {
    setEditedProfile(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, { name: '', phone: '', relation: '' }]
    }));
  };

  const removeEmergencyContact = (index) => {
    const updatedContacts = editedProfile.emergencyContacts.filter((_, i) => i !== index);
    setEditedProfile(prev => ({ ...prev, emergencyContacts: updatedContacts }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-red-600 to-red-800 px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">My Profile</h1>
              <p className="text-red-100 mt-2">Manage your account information</p>
            </div>
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <span className="text-4xl">👤</span>
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
                {profile.role === 'user' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Blood Group</label>
                      <p className="mt-1 text-lg text-gray-900">{profile.bloodGroup}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Medical Conditions</label>
                      <p className="mt-1 text-lg text-gray-900">{profile.medicalConditions}</p>
                    </div>
                  </>
                )}
              </div>

              {profile.role === 'user' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Emergency Contacts</h3>
                  <div className="space-y-3">
                    {profile.emergencyContacts.map((contact, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs text-gray-500">Name</label>
                            <p className="font-medium">{contact.name}</p>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500">Phone</label>
                            <p className="font-medium">{contact.phone}</p>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500">Relation</label>
                            <p className="font-medium">{contact.relation}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleEdit}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editedProfile.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editedProfile.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editedProfile.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                {profile.role === 'user' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                      <input
                        type="text"
                        name="bloodGroup"
                        value={editedProfile.bloodGroup}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Medical Conditions</label>
                      <textarea
                        name="medicalConditions"
                        rows="2"
                        value={editedProfile.medicalConditions}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      ></textarea>
                    </div>
                  </>
                )}
              </div>

              {profile.role === 'user' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Emergency Contacts</h3>
                    <button
                      onClick={addEmergencyContact}
                      className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700"
                    >
                      + Add Contact
                    </button>
                  </div>
                  <div className="space-y-3">
                    {editedProfile.emergencyContacts.map((contact, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 relative">
                        <button
                          onClick={() => removeEmergencyContact(index)}
                          className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <input
                            type="text"
                            placeholder="Name"
                            value={contact.name}
                            onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          <input
                            type="tel"
                            placeholder="Phone"
                            value={contact.phone}
                            onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          <input
                            type="text"
                            placeholder="Relation"
                            value={contact.relation}
                            onChange={(e) => handleContactChange(index, 'relation', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancel}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Save Changes
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