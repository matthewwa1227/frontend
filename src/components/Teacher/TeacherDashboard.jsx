import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Trophy, TrendingUp, Plus, Clock, Target, CheckCircle, AlertCircle } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const pixelText = { fontFamily: 'monospace' };

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', subject: '', description: '' });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/teacher/classes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setClasses(data.classes || []);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassDetails = async (classId) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const [studentsRes, analyticsRes] = await Promise.all([
        fetch(`${API_BASE}/api/teacher/classes/${classId}/students`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/api/teacher/classes/${classId}/analytics`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      if (studentsRes.ok && analyticsRes.ok) {
        const studentsData = await studentsRes.json();
        const analyticsData = await analyticsRes.json();
        setStudents(studentsData.students || []);
        setAnalytics(analyticsData.analytics);
        setSelectedClass(classId);
      }
    } catch (error) {
      console.error('Error:', error);
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
        setShowCreateClass(false);
        setNewClass({ name: '', subject: '', description: '' });
        fetchClasses();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400" style={pixelText}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8" style={pixelText}>
          👨‍🏫 TEACHER DASHBOARD
        </h1>

        {/* Classes Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {classes.map((cls) => (
            <motion.div
              key={cls.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => fetchClassDetails(cls.id)}
              className={`p-6 rounded-xl border-2 cursor-pointer ${
                selectedClass === cls.id 
                  ? 'bg-blue-900/30 border-blue-500' 
                  : 'bg-slate-800 border-slate-700 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <BookOpen className="w-8 h-8 text-blue-400" />
                <span className="text-xs text-slate-400" style={pixelText}>
                  CODE: {cls.class_code}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1" style={pixelText}>{cls.name}</h3>
              <p className="text-slate-400 text-sm" style={pixelText}>{cls.subject}</p>
              <div className="flex items-center gap-2 mt-4">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400 text-sm" style={pixelText}>
                  {cls.student_count} students
                </span>
              </div>
            </motion.div>
          ))}

          {/* Create New Class Card */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowCreateClass(true)}
            className="p-6 rounded-xl border-2 border-dashed border-slate-600 hover:border-blue-500 bg-slate-800/50 flex flex-col items-center justify-center"
          >
            <Plus className="w-12 h-12 text-slate-400 mb-2" />
            <span className="text-slate-400 font-bold" style={pixelText}>CREATE CLASS</span>
          </motion.button>
        </div>

        {/* Class Details */}
        {selectedClass && analytics && (
          <div className="space-y-6">
            {/* Analytics Overview */}
            <div className="bg-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6" style={pixelText}>CLASS ANALYTICS</h2>
              <div className="grid grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total Students" value={analytics.totalStudents} color="blue" />
                <StatCard icon={Clock} label="Avg Minutes" value={Math.round(analytics.avgStudyMinutes)} color="emerald" />
                <StatCard icon={Target} label="Accuracy" value={`${Math.round(analytics.avgAccuracy)}%`} color="amber" />
                <StatCard icon={Trophy} label="Completion" value={`${Math.round(analytics.completionRate)}%`} color="purple" />
              </div>
            </div>

            {/* Students List */}
            <div className="bg-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6" style={pixelText}>STUDENTS</h2>
              <div className="space-y-3">
                {students.map((student) => (
                  <div key={student.id} className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {student.username[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-white font-bold" style={pixelText}>{student.full_name || student.username}</h4>
                        <p className="text-slate-400 text-xs" style={pixelText}>
                          Level {student.level} • {student.study_minutes_this_week || 0} min this week
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-emerald-400 font-bold" style={pixelText}>
                          {Math.round(student.accuracy_rate || 0)}% accuracy
                        </p>
                        <p className="text-slate-400 text-xs" style={pixelText}>
                          {student.sessions_this_week || 0} sessions
                        </p>
                      </div>
                      {student.needs_attention && (
                        <AlertCircle className="w-5 h-5 text-rose-400" title="Needs Attention" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Create Class Modal */}
        {showCreateClass && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4" style={pixelText}>CREATE NEW CLASS</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 text-xs block mb-1" style={pixelText}>Class Name</label>
                  <input
                    type="text"
                    value={newClass.name}
                    onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    placeholder="e.g., Mathematics P5"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1" style={pixelText}>Subject</label>
                  <input
                    type="text"
                    value={newClass.subject}
                    onChange={(e) => setNewClass({...newClass, subject: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    placeholder="e.g., Mathematics"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1" style={pixelText}>Description</label>
                  <textarea
                    value={newClass.description}
                    onChange={(e) => setNewClass({...newClass, description: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowCreateClass(false)} className="flex-1 py-2 bg-slate-600 text-white rounded-lg font-bold">
                  CANCEL
                </button>
                <button onClick={createClass} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold">
                  CREATE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = { blue: 'text-blue-400', amber: 'text-amber-400', emerald: 'text-emerald-400', purple: 'text-purple-400' };
  return (
    <div className="bg-slate-700 rounded-xl p-4 text-center">
      <Icon className={`w-6 h-6 mx-auto mb-2 ${colors[color]}`} />
      <p className="text-2xl font-bold text-white" style={pixelText}>{value}</p>
      <p className="text-xs text-slate-400" style={pixelText}>{label}</p>
    </div>
  );
};

export default TeacherDashboard;
