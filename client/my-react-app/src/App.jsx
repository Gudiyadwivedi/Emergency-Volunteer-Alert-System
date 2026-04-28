import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './component/Navbar';
import Footer from './component/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SOS from './pages/SOS';
import VolunteerMap from './pages/VolunteerMap';
import EmergencyDetails from './pages/EmergencyDetails';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import Contact from './pages/Contact';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [userRole, setUserRole] = React.useState(null);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar isAuthenticated={isAuthenticated} userRole={userRole} />
        <main className="grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={isAuthenticated ? <Dashboard userRole={userRole} /> : <Navigate to="/login" />} />
            <Route path="/sos" element={isAuthenticated ? <SOS /> : <Navigate to="/login" />} />
            <Route path="/volunteer-map" element={isAuthenticated ? <VolunteerMap /> : <Navigate to="/login" />} />
            <Route path="/emergency/:id" element={isAuthenticated ? <EmergencyDetails /> : <Navigate to="/login" />} />
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/admin" element={userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;