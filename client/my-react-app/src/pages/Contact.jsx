import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactInfo = [
    { icon: '📞', title: 'Emergency Helpline', value: '108', description: '24/7 Emergency Services' },
    { icon: '📧', title: 'Email Us', value: 'support@evas.com', description: 'General inquiries' },
    { icon: '📍', title: 'Office', value: 'MCA Department', description: 'University Campus' },
    { icon: '⏰', title: 'Support Hours', value: '24/7', description: 'Emergency support always available' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Contact Us</h1>
        <p className="text-xl text-gray-600">We're here to help. Reach out anytime.</p>
      </div>

      {/* Contact Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {contactInfo.map((info, index) => (
          <div key={index} className="card text-center">
            <div className="text-3xl mb-2">{info.icon}</div>
            <h3 className="font-semibold text-gray-800">{info.title}</h3>
            <p className="text-lg text-red-600 font-medium">{info.value}</p>
            <p className="text-sm text-gray-500">{info.description}</p>
          </div>
        ))}
      </div>

      {/* Contact Form and Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
          {submitted ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              Thank you for your message! We'll get back to you soon.
            </div>
          ) : null}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <input
                type="text"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea
                name="message"
                rows="5"
                required
                value={formData.message}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Send Message
            </button>
          </form>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Location & Map</h2>
          <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center mb-4">
            <div className="text-center">
              <div className="text-6xl mb-2">🗺️</div>
              <p className="text-gray-600">Interactive Map Location</p>
              <p className="text-sm text-gray-500">Google Maps Integration</p>
            </div>
          </div>
          <div className="space-y-2 text-gray-600">
            <p className="flex items-center">
              <span className="w-6">📍</span>
              MCA Department, University Campus, City - 123456
            </p>
            <p className="flex items-center">
              <span className="w-6">📞</span>
              Emergency: 108 | Support: +91-123-4567890
            </p>
            <p className="flex items-center">
              <span className="w-6">✉️</span>
              support@evas.com | admin@evas.com
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold text-lg mb-2">How does EVAS work?</h3>
            <p className="text-gray-600">
              Simply press the SOS button during an emergency. Your location is shared with nearby volunteers who receive instant alerts.
            </p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-lg mb-2">Is EVAS free?</h3>
            <p className="text-gray-600">
              Yes, EVAS is completely free for all users. We believe emergency help should be accessible to everyone.
            </p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-lg mb-2">How do I become a volunteer?</h3>
            <p className="text-gray-600">
              Register on our platform, complete the verification process, and start helping your community.
            </p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-lg mb-2">Is my data secure?</h3>
            <p className="text-gray-600">
              Yes, we follow strict data protection protocols and never share your information without consent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;