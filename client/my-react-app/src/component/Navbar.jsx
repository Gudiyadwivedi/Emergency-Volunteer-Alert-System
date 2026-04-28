import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ isAuthenticated, userRole }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-xl font-bold text-gray-800">EVAS</span>
              <span className="text-sm text-gray-500 hidden md:inline">Emergency Volunteer Alert System</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-red-600 transition">Home</Link>
            <Link to="/about" className="text-gray-700 hover:text-red-600 transition">About</Link>
            <Link to="/contact" className="text-gray-700 hover:text-red-600 transition">Contact</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-red-600 transition">Dashboard</Link>
                <Link to="/sos" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                  SOS 🚨
                </Link>
                {userRole === 'volunteer' && (
                  <Link to="/volunteer-map" className="text-gray-700 hover:text-red-600 transition">Volunteer Map</Link>
                )}
                {userRole === 'admin' && (
                  <Link to="/admin" className="text-gray-700 hover:text-red-600 transition">Admin Panel</Link>
                )}
                <Link to="/profile" className="text-gray-700 hover:text-red-600 transition">Profile</Link>
                <button onClick={handleLogout} className="text-gray-700 hover:text-red-600 transition">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-red-600 transition">Login</Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;