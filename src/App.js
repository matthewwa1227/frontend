import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, getUser } from './utils/auth';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import StudyTimer from './components/StudyTimer/StudyTimer';
import Achievements from './components/Achievements/Achievements';
import Profile from './components/profile/Profile';
import Leaderboard from './components/leaderboard/Leaderboard';
import Navbar from './components/shared/Navbar';
import TestAnimation from './TestAnimation';
import ParentStudentPortal from './components/ParentStudentPortal';

// Protected Route Component
function ProtectedRoute({ children }) {
  const isAuth = isAuthenticated();
  const user = getUser();
  
  if (!isAuth || !user) {
    // Note: In a real app, you might want to use Navigate component instead of window.location
    // but keeping your existing logic for consistency.
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

// Public Route Component
function PublicRoute({ children }) {
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-pixel-dark">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* --- NEW ROUTE ADDED HERE --- */}
          <Route 
            path="/portal" 
            element={
              <ProtectedRoute>
                <ParentStudentPortal />
              </ProtectedRoute>
            } 
          />
          {/* ---------------------------- */}

          <Route 
            path="/timer" 
            element={
              <ProtectedRoute>
                <StudyTimer />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/achievements" 
            element={
              <ProtectedRoute>
                <Achievements />
              </ProtectedRoute>
            } 
          />

          {/* Profile Route */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          {/* Leaderboard Route */}
          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/test-animation" 
            element={
              <ProtectedRoute>
                <TestAnimation />
              </ProtectedRoute>
            } 
          />

          {/* Default Route */}
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

          {/* 404 - Catch all */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center bg-pixel-dark">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎮</div>
                  <h1 className="text-2xl font-pixel text-white mb-2">404 - Page Not Found</h1>
                  <p className="text-gray-400 font-pixel text-sm mb-4">This quest doesn't exist!</p>
                  <a 
                    href="/dashboard" 
                    className="inline-block bg-pixel-gold border-4 border-white px-6 py-2 font-pixel text-sm hover:bg-yellow-500"
                  >
                    Return to Base
                  </a>
                </div>
              </div>
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;