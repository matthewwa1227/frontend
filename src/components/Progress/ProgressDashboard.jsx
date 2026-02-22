import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Trophy, TrendingUp, Plus, CheckCircle, Clock, BookOpen } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const pixelText = { fontFamily: 'monospace' };

const ProgressDashboard = () => {
  const [goals, setGoals] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    goalType: 'weekly',
    targetMetric: 'minutes',
    targetValue: 120,
    endDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/progress/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGoals(data.data.goals || []);
          setProgress(data.data);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
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
          📊 PROGRESS DASHBOARD
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard icon={Target} label="Active Goals" value={goals.filter(g => g.status === 'active').length} color="blue" />
          <StatCard icon={Trophy} label="Completed" value={goals.filter(g => g.status === 'completed').length} color="amber" />
          <StatCard icon={Clock} label="Study Hours" value={progress?.summary?.totalStudyHours || 0} color="emerald" />
          <StatCard icon={TrendingUp} label="Accuracy" value={`${progress?.summary?.averageAccuracy || 0}%`} color="purple" />
        </div>

        {/* Goals */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white" style={pixelText}>YOUR GOALS</h2>
            <button onClick={() => setShowAddGoal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2">
              <Plus className="w-4 h-4" /> NEW GOAL
            </button>
          </div>

          {goals.length === 0 ? (
            <p className="text-slate-400 text-center py-8" style={pixelText}>No goals yet. Create your first goal!</p>
          ) : (
            <div className="space-y-4">
              {goals.map(goal => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = { blue: 'text-blue-400', amber: 'text-amber-400', emerald: 'text-emerald-400', purple: 'text-purple-400' };
  return (
    <div className="bg-slate-800 rounded-xl p-4 text-center">
      <Icon className={`w-6 h-6 mx-auto mb-2 ${colors[color]}`} />
      <p className="text-2xl font-bold text-white" style={pixelText}>{value}</p>
      <p className="text-xs text-slate-400" style={pixelText}>{label}</p>
    </div>
  );
};

const GoalCard = ({ goal }) => {
  const progress = Math.round((goal.current_value / goal.target_value) * 100);
  return (
    <div className="bg-slate-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-bold" style={pixelText}>{goal.title}</h3>
        {goal.status === 'completed' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <span className="text-amber-400" style={pixelText}>{progress}%</span>}
      </div>
      <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
        <div className={`h-full ${goal.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>
      <p className="text-slate-400 text-xs mt-2" style={pixelText}>{goal.current_value} / {goal.target_value} {goal.target_metric}</p>
    </div>
  );
};

export default ProgressDashboard;
