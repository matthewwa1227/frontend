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
import Tasks from './components/Tasks/Tasks'; // ADD THIS

// --- Parent/Guardian Components ---
import ParentDashboard from './components/parent/ParentDashboard';
import ParentPortal from './components/portal/ParentPortal'; 
import GuardianManagement from './components/GuardianManagement';

// --- Shared Components ---
import Navbar from './components/shared/Navbar';
import TestAnimation from './TestAnimation';

import StudyBuddy from './components/StudyBuddy/StudyBuddy';
import ScheduleGenerator from './components/ScheduleGenerator/ScheduleGenerator';

import AITutor from './components/AITutor/StoryQuestAI';
import RevisionMode from './components/AITutor/RevisionMode';

// --- New Feature Components ---
import ProgressDashboard from './components/Progress/ProgressDashboard';
import TeacherDashboard from './components/Teacher/TeacherDashboard';
import SocialHub from './components/Social/SocialHub';

/**
 * ProtectedRoute Wrapper - For Students
 */
function ProtectedRoute({ children }) {
  const isAuth = isAuthenticated();
  const user = getUser();
  
  if (!isAuth || !user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <>
      <Navbar />
      <div className="pt-4">
        {children}
      </div>
    </>
  );
}

/**
 * ParentProtectedRoute Wrapper - For Parents (no student navbar)
 */
function ParentProtectedRoute({ children }) {
  const isAuth = isAuthenticated();
  const user = getUser();
  
  if (!isAuth || !user) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect students away from parent routes
  if (user.role !== 'parent') {
    return <Navigate to="/dashboard" replace />;
  }
  
  // No Navbar for parents - ParentDashboard has its own header
  return <>{children}</>;
}

/**
 * Smart Home Route - redirects based on role
 */
function SmartHomeRedirect() {
  const isAuth = isAuthenticated();
  const user = getUser();
  
  if (!isAuth || !user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role === 'parent') {
    return <Navigate to="/parent/dashboard" replace />;
  }
  
  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-pixel-dark text-white font-mono selection:bg-pixel-gold selection:text-black">
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* --- Protected Parent Routes --- */}
          <Route 
            path="/parent/dashboard" 
            element={
              <ParentProtectedRoute>
                <ParentDashboard />
              </ParentProtectedRoute>
            } 
          />

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

          {/* ADD THIS TASKS ROUTE */}
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            } 
          />

          {/* --- Protected Parent/Guardian Routes --- */}
          <Route 
            path="/portal" 
            element={
              <ProtectedRoute>
                <ParentPortal />
              </ProtectedRoute>
            } 
          />

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

          <Route 
            path="/study-buddy" 
            element={
              <ProtectedRoute>
                <StudyBuddy />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/schedule" 
            element={
              <ProtectedRoute>
                <ScheduleGenerator />
              </ProtectedRoute>
            }            
          />

          <Route 
            path="/tutor" 
            element={
              <ProtectedRoute>
                <AITutor />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/story-quest" 
            element={
              <ProtectedRoute>
                <AITutor />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/revision" 
            element={
              <ProtectedRoute>
                <RevisionMode />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/story-quest" 
            element={
              <ProtectedRoute>
                <AITutor />
              </ProtectedRoute>
            } 
          />

          {/* --- NEW FEATURE ROUTES --- */}
          <Route 
            path="/progress" 
            element={
              <ProtectedRoute>
                <ProgressDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/teacher" 
            element={
              <ProtectedRoute>
                <TeacherDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/social" 
            element={
              <ProtectedRoute>
                <SocialHub />
              </ProtectedRoute>
            } 
          />
          

          {/* --- Smart Home Redirect (role-based) --- */}
          <Route path="/" element={<SmartHomeRedirect />} />
          
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
                    href="/" 
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