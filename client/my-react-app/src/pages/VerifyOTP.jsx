import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get email from location state or localStorage
  const email = location.state?.email || localStorage.getItem('tempEmail') || '';

  useEffect(() => {
    // If no email, redirect to register
    if (!email) {
      console.log('No email found, redirecting to register');
      navigate('/register');
      return;
    }
    
    console.log('Verifying email:', email);
    
    // Start timer countdown
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [email, navigate]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post(
        'http://localhost:3000/server/evas_function/app/v1/user/verifyOTP',
        { email, otp },
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );
      
      console.log('Verification response:', response.data);
      
      if (response.data.success) {
        setSuccess('Email verified successfully! Redirecting to login...');
        
        // Clear temp email from localStorage
        localStorage.removeItem('tempEmail');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Email verified successfully! Please login.',
              email: email
            } 
          });
        }, 2000);
      } else {
        setError(response.data.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error('Verification error:', err);
      
      if (err.response) {
        setError(err.response.data?.message || err.response.data?.error || 'Verification failed');
      } else if (err.request) {
        setError('No response from server. Please check if backend is running.');
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post(
        'http://localhost:3000/server/evas_function/app/v1/user/sendOTP',
        { email },
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );
      
      if (response.data.success) {
        setTimer(300);
        setCanResend(false);
        setSuccess('New OTP sent to your email!');
        
        // Restart timer
        const interval = setInterval(() => {
          setTimer(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              setCanResend(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        return () => clearInterval(interval);
      } else {
        setError(response.data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      console.error('Resend error:', err);
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-red-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
              E
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Verify Your Email</h2>
            <p className="mt-2 text-gray-600">
              We've sent a verification code to
            </p>
            <p className="font-semibold text-red-600 mt-1">{email}</p>
            {location.state?.fromRegistration && (
              <p className="text-xs text-green-600 mt-2">
                Registration successful! Please verify your email.
              </p>
            )}
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}
          
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP (6-digit code)
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                }}
                maxLength="6"
                autoFocus
                className="w-full px-3 py-2 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="000000"
                required
              />
            </div>
            
            <div className="text-center">
              {timer > 0 ? (
                <p className="text-sm text-gray-600">
                  OTP expires in: <span className="font-semibold text-red-600">{formatTime(timer)}</span>
                </p>
              ) : (
                <p className="text-sm text-red-600 font-semibold">OTP has expired. Please request a new one.</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading || timer === 0}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify Email'
              )}
            </button>
            
            <div className="text-center">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-red-600 hover:text-red-500 text-sm font-medium disabled:opacity-50"
                >
                  Resend OTP
                </button>
              ) : (
                <p className="text-sm text-gray-500">
                  Didn't receive the code? Wait {formatTime(timer)} to resend
                </p>
              )}
            </div>
            
            <div className="text-center pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                ← Back to Registration
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;