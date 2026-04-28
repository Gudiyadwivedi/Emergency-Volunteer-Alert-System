import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    {
      icon: "🚨",
      title: "One-Tap SOS",
      description: "Instant emergency alert with a single tap, automatically sharing your location."
    },
    {
      icon: "🤝",
      title: "Nearby Volunteers",
      description: "Connect with verified volunteers in your area within minutes."
    },
    {
      icon: "📍",
      title: "Real-Time Tracking",
      description: "Track volunteer response in real-time with live updates."
    },
    {
      icon: "👨‍👩‍👧",
      title: "Family Notification",
      description: "Automatically alert your emergency contacts via SMS."
    }
  ];

  const stats = [
    { number: "< 3 min", label: "Average Response Time" },
    { number: "1000+", label: "Active Volunteers" },
    { number: "5000+", label: "Lives Saved" },
    { number: "24/7", label: "Emergency Support" }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-linear-to-r from-red-600 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Emergency Volunteer Alert System
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Your safety net in times of crisis. Connect with nearby volunteers instantly when you need help the most.
            </p>
            <div className="space-x-4">
              <Link to="/register" className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block">
                Join as Volunteer
              </Link>
              <Link to="/sos" className="bg-yellow-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition inline-block">
                Emergency SOS 🚨
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">How EVAS Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our system connects victims with nearby volunteers in real-time
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center hover:shadow-xl transition">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Simple 4-Step Process</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="font-semibold mb-2">Trigger SOS</h3>
              <p className="text-gray-600">One tap on the SOS button</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="font-semibold mb-2">Location Shared</h3>
              <p className="text-gray-600">GPS location automatically sent</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="font-semibold mb-2">Volunteers Alerted</h3>
              <p className="text-gray-600">Nearby volunteers get notification</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">4</div>
              <h3 className="font-semibold mb-2">Help Arrives</h3>
              <p className="text-gray-600">Volunteers rush to your location</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8">Join our community of lifesavers today</p>
          <Link to="/register" className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block">
            Become a Volunteer
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;