import React from 'react';

const About = () => {
  const team = [
    { name: 'Rahul Agnihotri', role: 'Project Guide', image: '👨‍🏫' },
    { name: 'MCA Student', role: 'Lead Developer', image: '💻' },
    { name: 'Development Team', role: 'System Architects', image: '👥' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">About EVAS</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          The Emergency Volunteer Alert System - Transforming emergency response through community power
        </p>
      </div>

      {/* Mission Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="card text-center">
          <div className="text-5xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
          <p className="text-gray-600">
            To minimize emergency response time by connecting those in need with nearby volunteers instantly.
          </p>
        </div>
        <div className="card text-center">
          <div className="text-5xl mb-4">👁️</div>
          <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
          <p className="text-gray-600">
            A world where no one faces an emergency alone, and help is always just a tap away.
          </p>
        </div>
        <div className="card text-center">
          <div className="text-5xl mb-4">💎</div>
          <h3 className="text-xl font-semibold mb-2">Our Values</h3>
          <p className="text-gray-600">
            Community, Speed, Reliability, Compassion, and Innovation in emergency response.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="card mb-16">
        <h2 className="text-2xl font-bold mb-6">Our Story</h2>
        <div className="space-y-4 text-gray-600">
          <p>
            EVAS was born from a simple observation: in medical emergencies, the first few minutes are critical, yet professional help often takes 10-15 minutes to arrive. We realized that within this gap, there are always willing community members who could provide immediate assistance if only they knew someone needed help.
          </p>
          <p>
            This insight led to the creation of EVAS - a platform that bridges the critical gap between an emergency occurring and professional help arriving. By leveraging modern technology and community spirit, we've created a system that can alert nearby volunteers within seconds of an emergency.
          </p>
          <p>
            Today, EVAS is transforming how communities respond to emergencies, turning ordinary citizens into potential lifesavers and creating safer neighborhoods for everyone.
          </p>
        </div>
      </div>

      {/* Problem Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="card">
          <h2 className="text-2xl font-bold mb-4 text-red-600">The Problem</h2>
          <ul className="space-y-3 text-gray-600">
            <li>⚠️ Emergency response times are critically slow</li>
            <li>⚠️ Vulnerable individuals often live alone with no nearby help</li>
            <li>⚠️ No system exists to coordinate community volunteers effectively</li>
            <li>⚠️ Families worry about loved ones living independently</li>
          </ul>
        </div>
        <div className="card">
          <h2 className="text-2xl font-bold mb-4 text-green-600">Our Solution</h2>
          <ul className="space-y-3 text-gray-600">
            <li>✅ One-tap SOS with automatic location sharing</li>
            <li>✅ Real-time volunteer alert system within 2km radius</li>
            <li>✅ Transparent response tracking and coordination</li>
            <li>✅ Instant family notification via SMS and push alerts</li>
          </ul>
        </div>
      </div>

      {/* Team Section */}
      <div>
        <h2 className="text-2xl font-bold text-center mb-8">Project Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <div key={index} className="card text-center">
              <div className="text-6xl mb-4">{member.image}</div>
              <h3 className="text-xl font-semibold">{member.name}</h3>
              <p className="text-gray-600">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;