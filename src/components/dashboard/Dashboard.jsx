import React, { useState, useEffect } from 'react';
import { getUser } from '../../utils/auth';
import { courseAPI, studentAPI } from '../../utils/api';
import PixelCard from '../shared/PixelCard';
import ProgressBar from '../shared/ProgressBar';
import StatCard from '../shared/StatCard';
import CourseCard from './CourseCard';
import { Trophy, Target, Book, Star } from 'lucide-react';

export default function Dashboard() {
  const user = getUser(); // This is guaranteed to exist thanks to ProtectedRoute
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, coursesRes, myCoursesRes] = await Promise.all([
        studentAPI.getStats(),
        courseAPI.getAllCourses(),
        courseAPI.getMyCourses(),
      ]);

      setStats(statsRes.data.data);
      setCourses(coursesRes.data.data);
      setMyCourses(myCoursesRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableCourses = courses.filter(
    course => !myCourses.some(mc => mc._id === course._id)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pixel-dark">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pixel-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-pixel text-sm">Loading Quest Data...</p>
        </div>
      </div>
    );
  }

  // Calculate XP needed for next level
  const currentLevelXP = user.totalXP % 100;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-pixel text-white mb-2">
          Welcome back, {user.username}!
        </h1>
        <p className="text-sm font-pixel text-gray-400">
          Ready to continue your learning quest?
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          icon={Trophy}
          label="Level"
          value={user.level || 1}
          color="text-pixel-gold"
        />
        <StatCard 
          icon={Star}
          label="Total XP"
          value={user.totalXP || 0}
          color="text-pixel-success"
        />
        <StatCard 
          icon={Target}
          label="Quests Completed"
          value={stats?.completedQuizzes || 0}
          color="text-pixel-info"
        />
        <StatCard 
          icon={Book}
          label="Courses Enrolled"
          value={myCourses.length}
          color="text-pixel-warning"
        />
      </div>

      {/* Level Progress */}
      <PixelCard title="Level Progress" icon="⚡" className="mb-8">
        <div className="space-y-4">
          <ProgressBar
            current={currentLevelXP}
            max={100}
            label={`Level ${user.level || 1} → Level ${(user.level || 1) + 1}`}
            color="bg-pixel-gold"
          />
          <p className="text-xs font-mono text-gray-400">
            {100 - currentLevelXP} XP needed to reach Level {(user.level || 1) + 1}
          </p>
        </div>
      </PixelCard>

      {/* My Active Quests */}
      <PixelCard title="My Active Quests" icon="🎯" className="mb-8">
        {myCourses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white font-pixel text-sm mb-4">
              No active quests yet!
            </p>
            <p className="text-gray-400 font-pixel text-xs">
              Start your learning journey by enrolling in a course below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map(course => (
              <CourseCard 
                key={course._id} 
                course={course} 
                enrolled={true}
                onUpdate={fetchDashboardData}
              />
            ))}
          </div>
        )}
      </PixelCard>

      {/* Available Quests */}
      <PixelCard title="Available Quests" icon="🗺️">
        {availableCourses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white font-pixel text-sm mb-2">
              You're enrolled in all available quests!
            </p>
            <p className="text-gray-400 font-pixel text-xs">
              Check back later for new challenges.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map(course => (
              <CourseCard 
                key={course._id} 
                course={course} 
                enrolled={false}
                onUpdate={fetchDashboardData}
              />
            ))}
          </div>
        )}
      </PixelCard>
    </div>
  );
}