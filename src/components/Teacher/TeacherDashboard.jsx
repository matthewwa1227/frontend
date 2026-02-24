import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, BookOpen, Trophy, TrendingUp, Plus, Clock, Target, 
  AlertCircle, CheckCircle, ChevronRight, BarChart3
} from 'lucide-react';
import TeacherLayout from './TeacherLayout';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const pixelText = { fontFamily: 'monospace' };

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    pendingVerifications: 0,
    activeChallenges: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [newClass, setNewClass] = useState({ 
    name: '', 
    subject: '', 
    description: '',
    gradeLevel: ''
  });

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      // Fetch classes
      const classesRes = await fetch(`${API_BASE}/api/teacher/classes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (classesRes.ok) {
        const classesData = await classesRes.json();
        setClasses(classesData.classes || []);
        
        // Calculate stats
        const totalStudents = classesData.classes?.reduce((sum, c) => sum + (c.student_count || 0), 0) || 0;
        setStats({
          totalClasses: classesData.classes?.length || 0,
          totalStudents,
          pendingVerifications: 0, // Will fetch separately
          activeChallenges: 0 // Will fetch separately
        });
      }

      // Fetch pending verifications
      const verifyRes = await fetch(`${API_BASE}/api/teacher/verify-sessions?status=pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (verifyRes.ok) {
        const verifyData = await verifyRes.json();
        setStats(prev => ({ ...prev, pendingVerifications: verifyData.sessions?.length || 0 }));
      }

      // Fetch challenges
      const challengesRes = await fetch(`${API_BASE}/api/teacher/classes/all/challenges`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (challengesRes.ok) {
        const challengesData = await challengesRes.json();
        setStats(prev => ({ ...prev, activeChallenges: challengesData.challenges?.filter(c => c.status === 'active').length || 0 }));
      }

    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createClass = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/teacher/classes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newClass)
      });

      if (response.ok) {
        const data = await response.json();
        setShowCreateClass(false);
        setNewClass({ name: '', subject: '', description: '', gradeLevel: '' });
        fetchTeacherData();
        
        // Show class code
        alert(`Class created! Class Code: ${data.class.class_code}`);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create class');
      }
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Error creating class');
    }
  };

  const deleteClass = async (classId) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      await fetch(`${API_BASE}/api/teacher/classes/${classId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchTeacherData();
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400" style={pixelText}>Loading...</p>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2" style={pixelText}>
          👨‍🏫 TEACHER DASHBOARD
        </h1>
        <p className="text-slate-400" style={pixelText}>
          Manage your classes and track student progress
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={BookOpen} label="My Classes" value={stats.totalClasses} color="blue" />
        <StatCard icon={Users} label="Total Students" value={stats.totalStudents} color="emerald" />
        <StatCard icon={CheckCircle} label="Pending Verifications" value={stats.pendingVerifications} color="amber" />
        <StatCard icon={Trophy} label="Active Challenges" value={stats.activeChallenges} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Classes Section */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white" style={pixelText}>MY CLASSES</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateClass(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold flex items-center gap-2"
                style={pixelText}
              >
                <Plus className="w-4 h-4" /> NEW CLASS
              </motion.button>
            </div>

            {classes.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4" style={pixelText}>No classes yet. Create your first class!</p>
                <button 
                  onClick={() => setShowCreateClass(true)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold"
                  style={pixelText}
                >
                  CREATE CLASS
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {classes.map((cls) => (
                  <motion.div
                    key={cls.id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-slate-700 rounded-xl p-4 cursor-pointer hover:bg-slate-600 transition-colors"
                    onClick={() => navigate(`/teacher/classes/${cls.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-2xl">
                          {cls.subject === 'Mathematics' ? '📐' : 
                           cls.subject === 'Science' ? '🔬' : 
                           cls.subject === 'English' ? '📖' : '📚'}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white" style={pixelText}>{cls.name}</h3>
                          <p className="text-slate-400 text-sm" style={pixelText}>{cls.subject} • {cls.grade_level}</p>
                          <p className="text-indigo-400 text-xs mt-1" style={pixelText}>
                            Code: {cls.class_code}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white" style={pixelText}>{cls.student_count}</p>
                        <p className="text-slate-400 text-xs" style={pixelText}>students</p>
                        <ChevronRight className="w-5 h-5 text-slate-400 mt-2 ml-auto" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Quick Links */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4" style={pixelText}>QUICK ACTIONS</h2>
            <div className="space-y-3">
              <ActionButton 
                icon={Target} 
                label="Verify Sessions" 
                count={stats.pendingVerifications}
                onClick={() => navigate('/teacher/verify')}
                color="amber"
              />
              <ActionButton 
                icon={Trophy} 
                label="Create Challenge" 
                onClick={() => navigate('/teacher/challenges')}
                color="purple"
              />
              <ActionButton 
                icon={BarChart3} 
                label="View Analytics" 
                onClick={() => navigate('/teacher/analytics')}
                color="blue"
              />
              <ActionButton 
                icon={Users} 
                label="All Students" 
                onClick={() => navigate('/teacher/students')}
                color="emerald"
              />
            </div>
          </div>

          {/* Tips */}
          <div className="bg-indigo-900/30 border border-indigo-500/30 rounded-2xl p-6">
            <h3 className="text-indigo-300 font-bold mb-3" style={pixelText}>💡 TEACHER TIPS</h3>
            <ul className="space-y-2 text-sm text-slate-300" style={pixelText}>
              <li>• Create challenges to motivate students</li>
              <li>• Verify study sessions for accuracy</li>
              <li>• Check analytics weekly for insights</li>
              <li>• Share class code with students</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Create Class Modal */}
      {showCreateClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-slate-800 rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-white mb-4" style={pixelText}>CREATE NEW CLASS</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-xs block mb-1" style={pixelText}>Class Name *</label>
                <input
                  type="text"
                  value={newClass.name}
                  onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  placeholder="e.g., Mathematics P5"
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs block mb-1" style={pixelText}>Subject *</label>
                <select
                  value={newClass.subject}
                  onChange={(e) => setNewClass({...newClass, subject: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Select Subject</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="English">English</option>
                  <option value="Chinese">Chinese</option>
                  <option value="History">History</option>
                  <option value="Geography">Geography</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-xs block mb-1" style={pixelText}>Grade Level</label>
                <select
                  value={newClass.gradeLevel}
                  onChange={(e) => setNewClass({...newClass, gradeLevel: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Select Grade</option>
                  <option value="P1">Primary 1</option>
                  <option value="P2">Primary 2</option>
                  <option value="P3">Primary 3</option>
                  <option value="P4">Primary 4</option>
                  <option value="P5">Primary 5</option>
                  <option value="P6">Primary 6</option>
                  <option value="S1">Secondary 1</option>
                  <option value="S2">Secondary 2</option>
                  <option value="S3">Secondary 3</option>
                  <option value="S4">Secondary 4</option>
                  <option value="S5">Secondary 5</option>
                  <option value="S6">Secondary 6</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-xs block mb-1" style={pixelText}>Description</label>
                <textarea
                  value={newClass.description}
                  onChange={(e) => setNewClass({...newClass, description: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  rows={3}
                  placeholder="Brief description of the class..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowCreateClass(false)}
                className="flex-1 py-2 bg-slate-600 text-white rounded-lg font-bold"
                style={pixelText}
              >
                CANCEL
              </button>
              <button 
                onClick={createClass}
                disabled={!newClass.name || !newClass.subject}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold disabled:opacity-50"
                style={pixelText}
              >
                CREATE
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </TeacherLayout>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
  };

  return (
    <div className={`p-4 rounded-xl border-2 ${colors[color]}`}>
      <Icon className="w-6 h-6 mb-2" />
      <p className="text-2xl font-bold" style={pixelText}>{value}</p>
      <p className="text-xs opacity-70" style={pixelText}>{label}</p>
    </div>
  );
};

const ActionButton = ({ icon: Icon, label, count, onClick, color }) => {
  const colors = {
    blue: 'hover:bg-blue-600/20',
    emerald: 'hover:bg-emerald-600/20',
    amber: 'hover:bg-amber-600/20',
    purple: 'hover:bg-purple-600/20',
  };

  return (
    <button 
      onClick={onClick}
      className={`w-full p-3 bg-slate-700 rounded-lg flex items-center justify-between transition-colors ${colors[color]}`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-slate-400" />
        <span className="text-white font-bold" style={pixelText}>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {count > 0 && (
          <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full" style={pixelText}>
            {count}
          </span>
        )}
        <ChevronRight className="w-5 h-5 text-slate-400" />
      </div>
    </button>
  );
};

export default TeacherDashboard;
