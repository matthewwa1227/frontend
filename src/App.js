import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, getUser } from './utils/auth';

// --- Auth Components ---
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// --- Student Components ---
import Dashboard from './components/dashboard/Dashboard';
import StudyTimer from './components/StudyTimer/StudyTimer';
import Achievements from './components/Achievements/Achievements';
import Profile from './components/profile/Profile';
import Leaderboard from './components/leaderboard/Leaderboard';

// --- Parent/Guardian Components ---
import ParentPortal from './components/portal/ParentPortal'; 
import GuardianManagement from './components/GuardianManagement';

// --- Shared Components ---
import Navbar from './components/shared/Navbar';
import TestAnimation from './TestAnimation';

/**
 * ProtectedRoute Wrapper
 * Checks if user is logged in. If not, redirects to Login.
 * If yes, renders the Navbar and the requested page.
 */
function ProtectedRoute({ children }) {
  const isAuth = isAuthenticated();
  const user = getUser();
  
  if (!isAuth || !user) {
    // Use Navigate for smoother SPA transition instead of window.location
    return <Navigate to="/login" replace />;
  }
  
  return (
    <>
      <Navbar />
      <div className="pt-4"> {/* Added padding-top so content doesn't hide behind Navbar if fixed */}
        {children}
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-pixel-dark text-white font-mono selection:bg-pixel-gold selection:text-black">
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* --- Protected Student Routes --- */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

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

          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            } 
          />

          {/* --- Protected Parent/Guardian Routes --- */}
          
          {/* The Portal: Where students generate codes or parents view status */}
          <Route 
            path="/portal" 
            element={
              <ProtectedRoute>
                <ParentPortal />
              </ProtectedRoute>
            } 
          />

          {/* Guardian Management: List of connected guardians */}
          <Route 
            path="/guardians" 
            element={
              <ProtectedRoute>
                <GuardianManagement />
              </ProtectedRoute>
            } 
          />

          {/* --- Utility Routes --- */}
          <Route 
            path="/test-animation" 
            element={
              <ProtectedRoute>
                <TestAnimation />
              </ProtectedRoute>
            } 
          />

          {/* --- Default Redirects --- */}
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
          
          {/* --- 404 Page --- */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center bg-pixel-dark">
                <div className="text-center p-8 border-4 border-pixel-accent bg-pixel-primary shadow-pixel">
                  <div className="text-6xl mb-4 animate-bounce">👾</div>
                  <h1 className="text-2xl font-pixel text-white mb-2">404 - Level Not Found</h1>
                  <p className="text-gray-400 font-pixel text-sm mb-6">This quest map is incomplete!</p>
                  <a 
                    href="/dashboard" 
                    className="inline-block bg-pixel-gold border-4 border-white px-6 py-2 font-pixel text-black text-sm hover:bg-yellow-400 hover:scale-105 transition-transform"
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