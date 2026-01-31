import { useState, useEffect } from 'react';
import { getToken } from '../../utils/auth';
import { taskAPI } from '../../utils/api';
import { 
  Plus, 
  Check, 
  Trash2, 
  Edit2, 
  X, 
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  Filter
} from 'lucide-react';

const SUBJECTS = ['General', 'Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer Science', 'Art', 'Music', 'Other'];
const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-700' }
];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: 'General',
    priority: 'medium',
    dueDate: '',
    estimatedMinutes: 30
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getAll();
      if (response.data.success) {
        setTasks(response.data.tasks);
      }
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Fetch tasks error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        const response = await taskAPI.update(editingTask.id, formData);
        if (response.data.success) {
          setTasks(tasks.map(t => t.id === editingTask.id ? response.data.task : t));
        }
      } else {
        const response = await taskAPI.create(formData);
        if (response.data.success) {
          setTasks([response.data.task, ...tasks]);
        }
      }
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    }
  };

  const toggleTaskComplete = async (task) => {
    try {
      const response = await taskAPI.toggle(task.id);
      if (response.data.success) {
        setTasks(tasks.map(t => t.id === task.id ? response.data.task : t));
      }
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const response = await taskAPI.delete(taskId);
      if (response.data.success) {
        setTasks(tasks.filter(t => t.id !== taskId));
      }
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      subject: task.subject || 'General',
      priority: task.priority || 'medium',
      dueDate: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
      estimatedMinutes: task.estimated_minutes || 30
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      subject: 'General',
      priority: 'medium',
      dueDate: '',
      estimatedMinutes: 30
    });
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending' && task.status === 'completed') return false;
    if (filter === 'completed' && task.status !== 'completed') return false;
    if (subjectFilter !== 'all' && task.subject !== subjectFilter) return false;
    return true;
  });

  const getPriorityStyle = (priority) => {
    const p = PRIORITIES.find(pr => pr.value === priority);
    return p ? p.color : 'bg-gray-100 text-gray-700';
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return date.toLocaleDateString();
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status !== 'completed').length,
    overdue: tasks.filter(t => t.status !== 'completed' && isOverdue(t.due_date)).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">📋 My Tasks</h1>
            <p className="text-gray-400 mt-1">Manage your study tasks and assignments</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors shadow-md"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Task
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-900 rounded-lg">
                <Circle className="w-5 h-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-sm text-gray-400">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-900 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-white">{stats.pending}</p>
                <p className="text-sm text-gray-400">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-900 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-white">{stats.completed}</p>
                <p className="text-sm text-gray-400">Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-red-900 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-white">{stats.overdue}</p>
                <p className="text-sm text-gray-400">Overdue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">Filter:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'completed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div className="sm:ml-auto">
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-sm bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="all">All Subjects</option>
                {SUBJECTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300">
            {error}
            <button onClick={() => setError('')} className="ml-2 text-red-400 hover:text-red-200">
              <X className="w-4 h-4 inline" />
            </button>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-white mb-2">No tasks yet</h3>
              <p className="text-gray-400 mb-4">Create your first task to get started!</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Task
              </button>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`bg-gray-800 rounded-xl p-4 border transition-all hover:border-gray-500 ${
                  task.status === 'completed' 
                    ? 'border-green-700 bg-green-900/20' 
                    : isOverdue(task.due_date)
                    ? 'border-red-700'
                    : 'border-gray-700'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTaskComplete(task)}
                    className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      task.status === 'completed'
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-500 hover:border-yellow-500'
                    }`}
                  >
                    {task.status === 'completed' && <Check className="w-4 h-4" />}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${
                        task.status === 'completed' ? 'line-through text-gray-500' : 'text-white'
                      }`}>
                        {task.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityStyle(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-900 text-indigo-300">
                        {task.subject}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className={`text-sm mb-2 ${
                        task.status === 'completed' ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      {task.due_date && (
                        <span className={`flex items-center gap-1 ${
                          isOverdue(task.due_date) && task.status !== 'completed' ? 'text-red-400 font-medium' : ''
                        }`}>
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDueDate(task.due_date)}
                        </span>
                      )}
                      {task.estimated_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {task.estimated_minutes} min
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(task)}
                      className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">
                    {editingTask ? '✏️ Edit Task' : '➕ New Task'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="e.g., Complete Math homework"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Add details about this task..."
                    rows={3}
                  />
                </div>

                {/* Subject & Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      {SUBJECTS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      {PRIORITIES.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Due Date & Estimated Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Due Date
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Est. Time (min)
                    </label>
                    <input
                      type="number"
                      value={formData.estimatedMinutes}
                      onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) || 30 })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      min={5}
                      max={480}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
                  >
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}