import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Target, Trophy, TrendingUp, Plus, CheckCircle, Clock, 
  BookOpen, Calendar, X, Trash2, Edit2
} from 'lucide-react';
import { getUser } from '../../utils/auth';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const pixelText = { fontFamily: 'monospace' };

const ProgressDashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [goals, setGoals] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    goalType: 'weekly',
    targetMetric: 'minutes',
    targetValue: 120,
    subject: '',
    endDate: '',
    rewardXp: 50
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
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/progress/goals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newGoal)
      });

      if (response.ok) {
        setShowAddGoal(false);
        setNewGoal({
          title: '',
          description: '',
          goalType: 'weekly',
          targetMetric: 'minutes',
          targetValue: 120,
          subject: '',
          endDate: '',
          rewardXp: 50
        });
        fetchData();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create goal');
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Error creating goal');
    }
  };

  const updateGoalProgress = async (goalId, newValue) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/progress/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentValue: parseInt(newValue) })
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const deleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      await fetch(`${API_BASE}/api/progress/goals/${goalId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const getDaysLeft = (endDate) => {
    if (!endDate) return null;
    const days = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400" style={pixelText}>Loading progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2" style={{ ...pixelText, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            📊 PROGRESS DASHBOARD
          </h1>
          <p className="text-slate-400" style={pixelText}>
            Track your goals and learning journey
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard 
            icon={Target} 
            label="Active Goals" 
            value={goals.filter(g => g.status === 'active').length}
            color="blue"
          />
          <StatCard 
            icon={Trophy} 
            label="Completed" 
            value={goals.filter(g => g.status === 'completed').length}
            color="amber"
          />
          <StatCard 
            icon={Clock} 
            label="Study Hours (30d)" 
            value={progress?.summary?.totalStudyHours || 0}
            color="emerald"
          />
          <StatCard 
            icon={TrendingUp} 
            label="Avg Accuracy" 
            value={`${Math.round(progress?.summary?.averageAccuracy || 0)}%`}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Goals */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2" style={pixelText}>
                  <Target className="w-6 h-6 text-blue-400" />
                  YOUR GOALS
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddGoal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2"
                  style={pixelText}
                >
                  <Plus className="w-4 h-4" />
                  NEW GOAL
                </motion.button>
              </div>

              {goals.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4" style={pixelText}>No goals yet. Create your first goal!</p>
                  <button 
                    onClick={() => setShowAddGoal(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold"
                    style={pixelText}
                  >
                    CREATE GOAL
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {goals.map((goal) => (
                    <GoalCard 
                      key={goal.id} 
                      goal={goal} 
                      onUpdate={updateGoalProgress}
                      onDelete={deleteGoal}
                      daysLeft={getDaysLeft(goal.end_date)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Weekly Progress */}
            {progress?.weeklySummary && progress.weeklySummary.length > 0 && (
              <div className="bg-slate-800 rounded-2xl p-6 mt-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2" style={pixelText}>
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                  WEEKLY PROGRESS
                </h2>
                <div className="grid grid-cols-4 gap-4">
                  {progress.weeklySummary.map((week, i) => (
                    <div key={i} className="bg-slate-700 rounded-xl p-4 text-center">
                      <p className="text-slate-400 text-xs mb-2" style={pixelText}>
                        Week {week.tracking_week}
                      </p>
                      <p className="text-2xl font-bold text-emerald-400" style={pixelText}>
                        {Math.round(week.week_minutes / 60)}h
                      </p>
                      <p className="text-slate-500 text-xs" style={pixelText}>
                        {week.week_sessions} sessions
                      </p>
                      {week.week_accuracy && (
                        <p className="text-blue-400 text-xs mt-1" style={pixelText}>
                          {Math.round(week.week_accuracy)}% acc
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subject Breakdown */}
            {progress?.subjects && progress.subjects.length > 0 && (
              <div className="bg-slate-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2" style={pixelText}>
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  SUBJECTS
                </h2>
                <div className="space-y-3">
                  {progress.subjects.map((subject, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <span className="text-white" style={pixelText}>{subject.name}</span>
                      <div className="text-right">
                        <p className="text-purple-400 font-bold" style={pixelText}>
                          {Math.round(subject.minutes / 60)}h
                        </p>
                        {subject.avg_accuracy && (
                          <p className="text-xs text-slate-400" style={pixelText}>
                            {Math.round(subject.avg_accuracy)}% acc
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Summary */}
            <div className="bg-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4" style={pixelText}>YOUR STATS</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400" style={pixelText}>Current Level</span>
                  <span className="text-white font-bold" style={pixelText}>{progress?.stats?.level || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400" style={pixelText}>Total XP</span>
                  <span className="text-amber-400 font-bold" style={pixelText}>{progress?.stats?.xp || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400" style={pixelText}>Current Streak</span>
                  <span className="text-emerald-400 font-bold" style={pixelText}>
                    {progress?.stats?.current_streak || 0} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400" style={pixelText}>Longest Streak</span>
                  <span className="text-purple-400 font-bold" style={pixelText}>
                    {progress?.stats?.longest_streak || 0} days
                  </span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-2xl p-6">
              <h3 className="text-blue-300 font-bold mb-3" style={pixelText}>💡 TIPS</h3>
              <ul className="space-y-2 text-sm text-slate-300" style={pixelText}>
                <li>• Set weekly goals for better consistency</li>
                <li>• Focus on weak subjects first</li>
                <li>• Maintain your streak daily</li>
                <li>• Join study groups for motivation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Add Goal Modal */}
        {showAddGoal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white" style={pixelText}>CREATE NEW GOAL</h3>
                <button onClick={() => setShowAddGoal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 text-xs block mb-1" style={pixelText}>Goal Title *</label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    placeholder="e.g., Complete 10 Math sessions"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-xs block mb-1" style={pixelText}>Description</label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    rows={2}
                    placeholder="What do you want to achieve?"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 text-xs block mb-1" style={pixelText}>Type</label>
                    <select
                      value={newGoal.goalType}
                      onChange={(e) => setNewGoal({...newGoal, goalType: e.target.value})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="subject">Subject</option>
                      <option value="skill">Skill</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs block mb-1" style={pixelText}>Metric</label>
                    <select
                      value={newGoal.targetMetric}
                      onChange={(e) => setNewGoal({...newGoal, targetMetric: e.target.value})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="minutes">Minutes</option>
                      <option value="sessions">Sessions</option>
                      <option value="xp">XP</option>
                      <option value="accuracy">Accuracy %</option>
                      <option value="streak">Streak Days</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 text-xs block mb-1" style={pixelText}>Target Value</label>
                    <input
                      type="number"
                      value={newGoal.targetValue}
                      onChange={(e) => setNewGoal({...newGoal, targetValue: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                      min={1}
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs block mb-1" style={pixelText}>XP Reward</label>
                    <input
                      type="number"
                      value={newGoal.rewardXp}
                      onChange={(e) => setNewGoal({...newGoal, rewardXp: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                      min={0}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-xs block mb-1" style={pixelText}>Subject (optional)</label>
                  <select
                    value={newGoal.subject}
                    onChange={(e) => setNewGoal({...newGoal, subject: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">All Subjects</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                    <option value="Chinese">Chinese</option>
                    <option value="History">History</option>
                    <option value="Geography">Geography</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-xs block mb-1" style={pixelText}>End Date (optional)</label>
                  <input
                    type="date"
                    value={newGoal.endDate}
                    onChange={(e) => setNewGoal({...newGoal, endDate: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddGoal(false)}
                  className="flex-1 py-3 bg-slate-700 text-white rounded-xl font-bold"
                  style={pixelText}
                >
                  CANCEL
                </button>
                <button
                  onClick={createGoal}
                  disabled={!newGoal.title}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50"
                  style={pixelText}
                >
                  CREATE GOAL
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
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

const GoalCard = ({ goal, onUpdate, onDelete, daysLeft }) => {
  const progress = Math.round((goal.current_value / goal.target_value) * 100);
  const isCompleted = goal.status === 'completed';
  
  return (
    <div className={`bg-slate-700 rounded-xl p-4 ${isCompleted ? 'border-2 border-emerald-500/50' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-bold" style={pixelText}>{goal.title}</h3>
            {isCompleted && <CheckCircle className="w-5 h-5 text-emerald-400" />}
          </div>
          {goal.description && (
            <p className="text-slate-400 text-sm mt-1" style={pixelText}>{goal.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded" style={pixelText}>
              {goal.goal_type.toUpperCase()}
            </span>
            {goal.subject && (
              <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded" style={pixelText}>
                {goal.subject}
              </span>
            )}
            {daysLeft !== null && daysLeft > 0 && (
              <span className="text-xs bg-amber-900/50 text-amber-300 px-2 py-1 rounded" style={pixelText}>
                {daysLeft} days left
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isCompleted && (
            <>
              <button 
                onClick={() => {
                  const newValue = prompt(`Update progress (current: ${goal.current_value} / ${goal.target_value}):`, goal.current_value);
                  if (newValue && !isNaN(newValue)) onUpdate(goal.id, newValue);
                }}
                className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white"
                title="Update Progress"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onDelete(goal.id)}
                className="p-2 bg-red-600 hover:bg-red-500 rounded-lg text-white"
                title="Delete Goal"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-3 bg-slate-600 rounded-full overflow-hidden mb-3">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-xs" style={pixelText}>
          {goal.current_value} / {goal.target_value} {goal.target_metric}
        </p>
        <p className={`text-sm font-bold ${isCompleted ? 'text-emerald-400' : 'text-blue-400'}`} style={pixelText}>
          {progress}%
        </p>
      </div>
      
      {isCompleted && goal.reward_xp > 0 && (
        <p className="text-emerald-400 text-xs mt-2" style={pixelText}>
          🎉 Completed! +{goal.reward_xp} XP earned
        </p>
      )}
    </div>
  );
};

export default ProgressDashboard;
