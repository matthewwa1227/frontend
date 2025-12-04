import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, getUser } from './utils/auth';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import StudyTimer from './components/StudyTimer/StudyTimer';
import Achievements from './components/Achievements/Achievements'; // ✅ ADD THIS
import Navbar from './components/shared/Navbar';

// Protected Route Component
function ProtectedRoute({ children }) {
  const isAuth = isAuthenticated();
  const user = getUser();
  
  if (!isAuth || !user) {
    window.location.href = '/login';
    return (
      <div className="min-h-screen flex items-center justify-center bg-pixel-dark">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pixel-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-pixel text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

// Public Route Component - NO REDIRECT HERE
function PublicRoute({ children }) {
  // Just render the children, don't redirect
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-pixel-dark">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={<Login />} 
          />
          <Route 
            path="/register" 
            element={<Register />} 
          />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Study Timer Route */}
          <Route 
            path="/timer" 
            element={
              <ProtectedRoute>
                <StudyTimer />
              </ProtectedRoute>
            } 
          />

          {/* Achievements Route ✅ ADD THIS */}
          <Route 
            path="/achievements" 
            element={
              <ProtectedRoute>
                <Achievements />
              </ProtectedRoute>
            } 
          />

          {/* Default Route - redirect to login if not authenticated, dashboard if authenticated */}
          <Route 
            path="/" 
            element={
              isAuthenticated() ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;