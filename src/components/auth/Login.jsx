import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import { setAuth } from '../../utils/auth';
import PixelButton from '../shared/PixelButton';
import { User, Lock, WifiOff, RefreshCw } from 'lucide-react';
import api from '../../utils/api';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState({ checking: true, online: false, url: '' });
  const [debugInfo, setDebugInfo] = useState(null);

  // Check API connection on mount
  useEffect(() => {
    checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
    setApiStatus({ checking: true, online: false, url: '' });
    try {
      const healthUrl = api.defaults.baseURL.replace('/api', '') + '/api/health';
      console.log('Checking API health at:', healthUrl);
      
      const response = await fetch(healthUrl, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        setApiStatus({ checking: false, online: true, url: api.defaults.baseURL });
      } else {
        setApiStatus({ checking: false, online: false, url: api.defaults.baseURL });
      }
    } catch (err) {
      console.error('API health check failed:', err);
      setApiStatus({ checking: false, online: false, url: api.defaults.baseURL });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setDebugInfo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDebugInfo(null); // Clear any previous debug info

    try {
      console.log('🔑 Attempting login with:', { email: formData.email });
      console.log('📡 API URL:', api.defaults.baseURL);
      
      const response = await authAPI.login(formData);
      
      console.log('✅ Login response:', response);
      console.log('📦 Response data:', response.data);
      
      // Clear debug info on success (don't show in UI)
      setDebugInfo(null);
      
      const { token, student } = response.data.data;
      
      console.log('🎫 Token:', token ? 'Received' : 'MISSING!');
      console.log('👤 Student:', student ? 'Received' : 'MISSING!');
      
      if (!token || !student) {
        setError('Login response missing required data. Check console.');
        setLoading(false);
        return;
      }
      
      // Store token and user data
      setAuth(token, student);
      
      console.log('💾 Auth data saved to localStorage');
      console.log('🚀 Navigating to dashboard...');
      
      // Route based on role
      if (student.role === 'parent') {
        navigate('/parent/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      
      let errorDetails = {
        status: 'error',
        message: err.message,
        code: err.code,
        responseStatus: err.response?.status,
        responseData: err.response?.data,
      };
      
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setError('Cannot connect to server. Please check your internet connection.');
      } else if (err.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (err.response?.status === 0) {
        setError('Connection blocked. The server may be down or CORS is not configured.');
      } else if (err.response?.status === 404) {
        setError('Login endpoint not found. Server may be misconfigured.');
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.response?.data?.message || `Login failed: ${err.message}`);
      }
      
      setDebugInfo(errorDetails);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pixel-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="inline-block bg-pixel-gold border-4 border-white shadow-pixel p-4 mb-4">
            <h1 className="text-4xl font-pixel text-white">📚</h1>
          </div>
          <h1 className="text-3xl font-pixel text-white mb-2">StudyQuest</h1>
          <p className="text-sm font-pixel text-gray-400">Begin Your Learning Adventure</p>
        </div>

        {/* API Status Banner */}
        {!apiStatus.checking && !apiStatus.online && (
          <div className="bg-red-900/80 border-2 border-red-500 text-white text-xs font-mono p-4 mb-6 flex items-start gap-3">
            <WifiOff className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-red-300 mb-1">SERVER UNREACHABLE</p>
              <p className="text-gray-300 mb-2">Cannot connect to: {apiStatus.url}</p>
              <p className="text-gray-400 text-[10px]">
                The backend server may be down or the API URL is incorrect.
              </p>
              <button 
                onClick={checkApiConnection}
                className="mt-3 flex items-center gap-2 text-red-300 hover:text-white transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span className="text-[10px]">RETRY CONNECTION</span>
              </button>
            </div>
          </div>
        )}

        {!apiStatus.checking && apiStatus.online && (
          <div className="bg-green-900/50 border-2 border-green-500 text-green-300 text-xs font-mono p-3 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Server Online: {apiStatus.url}
          </div>
        )}

        {/* Login Form */}
        <div className="bg-pixel-primary border-4 border-pixel-accent shadow-pixel p-8">
          <h2 className="text-xl font-pixel text-white mb-6 text-center">Player Login</h2>
          
          {error && (
            <div className="bg-red-900 border-4 border-red-600 text-white text-xs font-pixel p-4 mb-6">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-xs font-pixel text-white mb-2">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-pixel-dark border-4 border-pixel-accent text-white font-mono text-sm px-10 py-3 focus:outline-none focus:border-pixel-gold"
                  placeholder="hero@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-pixel text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-pixel-dark border-4 border-pixel-accent text-white font-mono text-sm px-10 py-3 focus:outline-none focus:border-pixel-gold"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <PixelButton
              type="submit"
              disabled={loading}
              variant="gold"
              className="w-full"
            >
              {loading ? 'Logging in...' : 'Enter Quest'}
            </PixelButton>
          </form>

          {/* Debug Info Panel - Only show in development or when there's an error */}
          {debugInfo && debugInfo.status === 'error' && (
            <div className="mt-6 p-4 bg-black/50 border-2 border-red-600 text-xs font-mono">
              <p className="text-red-400 mb-2">Error Details:</p>
              <pre className="text-red-300 whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-xs font-pixel text-gray-400">
              New adventurer?{' '}
              <Link to="/register" className="text-pixel-gold hover:text-yellow-400">
                Create Account
              </Link>
            </p>
          </div>

          {/* Test Credentials */}
          <div className="mt-6 pt-6 border-t-4 border-pixel-accent">
            <p className="text-xs font-pixel text-gray-500 mb-2">Test Credentials:</p>
            <div className="bg-pixel-dark border-2 border-pixel-accent p-3">
              <p className="text-xs font-mono text-gray-400">Email: alice@example.com</p>
              <p className="text-xs font-mono text-gray-400">Password: Alice123</p>
              <br />
              <p className="text-xs font-mono text-gray-400">Email: Test@test.com</p>
              <p className="text-xs font-mono text-gray-400">Password: Test1234</p>
              <br />
              <p className="text-xs font-mono text-gray-400">Email: parent@test.com </p>
              <p className="text-xs font-mono text-gray-400">Password: password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
