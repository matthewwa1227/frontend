import axios from 'axios';

// Environment-aware API URL - with fallback for production
const getApiUrl = () => {
  // Priority 1: Environment variable (set in Vercel/Netlify/etc)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Priority 2: Production fallback (Render backend)
  if (process.env.NODE_ENV === 'production') {
    return 'https://fyp-gp20.onrender.com/api';
  }
  
  // Priority 3: Local development
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();
console.log('🔌 API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors (auto logout on 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  registerParent: (userData) => api.post('/auth/register-parent', userData),
  getMe: () => api.get('/auth/me'),
  getProfile: () => api.get('/auth/profile'),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const studentAPI = {
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data) => api.put('/student/profile', data),
  getStats: () => api.get('/student/stats'),
  getAchievements: () => api.get('/student/achievements'),
  getConnectedParents: () => api.get('/student/parents'),
  generateParentCode: () => api.post('/student/generate-code'),
};

export const courseAPI = {
  getAllCourses: () => api.get('/courses'),
  getCourse: (id) => api.get(`/courses/${id}`),
  enrollCourse: (id) => api.post(`/courses/${id}/enroll`),
  getMyCourses: () => api.get('/courses/my-courses'),
  unenrollCourse: (id) => api.delete(`/courses/${id}/unenroll`),
};

export const quizAPI = {
  getQuizzesByCourse: (courseId) => api.get(`/quizzes/course/${courseId}`),
  getQuiz: (id) => api.get(`/quizzes/${id}`),
  submitQuiz: (id, answers) => api.post(`/quizzes/${id}/submit`, { answers }),
  getQuizResults: (id) => api.get(`/quizzes/${id}/results`),
};

export const sessionAPI = {
  startSession: (data) => api.post('/sessions/start', data),
  endSession: (sessionId, data) => api.post(`/sessions/${sessionId}/end`, data),
  getSessions: () => api.get('/sessions/history'),
  getActiveSession: () => api.get('/sessions/active'),
};

export const achievementAPI = {
  getAchievements: () => api.get('/achievements'),
  getMyAchievements: () => api.get('/achievements/my'),
  checkAchievements: () => api.post('/achievements/check'),
};

export const leaderboardAPI = {
  // Main leaderboard endpoint with filters
  getLeaderboard: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.timeFilter) queryParams.append('timeFilter', params.timeFilter);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const queryString = queryParams.toString();
    return api.get(`/leaderboard${queryString ? `?${queryString}` : ''}`);
  },
  
  // Global leaderboard (legacy endpoint)
  getGlobal: (params = {}) => api.get('/leaderboard/global', { params }),
  
  // Get current user's rank
  getMyRank: (period = 'all-time') => api.get('/leaderboard/my-rank', { params: { period } }),
  
  // Get specific user's rank
  getUserRank: (userId) => api.get(`/leaderboard/rank/${userId}`),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// Family API (updated with schedule management methods)
export const familyAPI = {
  // Student generates invite code
  generateCode: () => api.post('/family/generate-code'),
  
  // Parent links using code
  linkChild: (code, relationship = 'Guardian') => 
    api.post('/family/link-child', { code, relationship }),
  
  // Parent gets list of linked children with stats
  getChildrenStats: () => api.get('/family/children-stats'),
  
  // Student gets list of guardians
  getGuardians: () => api.get('/family/guardians'),
  
  // Student removes a guardian
  removeGuardian: (linkId) => api.delete(`/family/guardians/${linkId}`),
  
  // Parent removes a child
  removeChild: (studentId) => api.delete(`/family/children/${studentId}`),
  
  // === NEW: Schedule Management Methods ===
  
  // Get child's learning schedules
  getChildSchedules: (studentId) => 
    api.get(`/family/children/${studentId}/schedules`),
  
  // Get child's mastery overview
  getChildMastery: (studentId) => 
    api.get(`/family/children/${studentId}/mastery`),
  
  // Update child's daily time limit
  updateChildTimeLimit: (studentId, dailyMinutes) => 
    api.patch(`/family/children/${studentId}/time-limit`, { dailyMinutes }),
  
  // Set rest day for child (null = today)
  setChildRestDay: (studentId, date = null) => 
    api.post(`/family/children/${studentId}/rest-day`, { date }),
  
  // Acknowledge burnout warning
  acknowledgeBurnout: (studentId) => 
    api.patch(`/family/children/${studentId}/burnout-ack`),
};

// Story Quest RPG API
export const storyQuestAPI = {
  // Generate story content
  generateIntro: (topic) => api.post('/storyquest/intro', { topic }),
  generateScene: (data) => api.post('/storyquest/scene', data),
  generateLesson: (data) => api.post('/storyquest/lesson', data),
  generateQuestion: (data) => api.post('/storyquest/question', data),
  
  // Simple learn endpoint - now with subject context
  learn: (topic, subject, chapterTitle, focus) => api.post('/storyquest/learn', { 
    topic, 
    subject, 
    chapterTitle, 
    focus 
  }),
  
  // Health check
  health: () => api.get('/storyquest/health')
};

// Schedule Generator API (kept for ScheduleGenerator component)
export const aiAPI = {
  generateSchedule: (preferences = {}, dateRange = 7, tasks = []) => 
    api.post('/ai/generate-schedule', { preferences, dateRange, tasks }),
  
  // Study Buddy Chat
  getHistory: (limit = 20) => api.get(`/ai/history?limit=${limit}`),
  chatWithMedia: (message, conversationHistory, media) => 
    api.post('/ai/chat', { message, context: conversationHistory, media }),
  getTips: (subject, difficulty) => api.get(`/ai/tips?subject=${subject}&difficulty=${difficulty}`),
  
  // AI Capabilities
  getCapabilities: () => api.get('/ai/capabilities'),
  quickAction: (action, context = {}) => api.post('/ai/quick-action', { action, context }),
};

// Exercise Generator API
export const exerciseAPI = {
  generate: (data) => api.post('/exercises/generate', data),
  
  // MISSION 55: Generate reading comprehension
  generateReading: (data) => api.post('/exercises/generate-reading', data),
  
  // Analyze document to extract subject/concept/exercises
  // MISSION 52: Support single file or array of files
  analyzeDocument: (files) => {
    const formData = new FormData();
    const fileArray = Array.isArray(files) ? files : [files];
    
    fileArray.forEach(file => {
      formData.append('documents', file);
    });
    
    return api.post('/exercises/analyze-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Generate similar exercises with optional file upload
  generateSimilar: (data) => {
    // If document is provided, use FormData
    if (data.document) {
      const formData = new FormData();
      formData.append('document', data.document);
      if (data.subject) formData.append('subject', data.subject);
      if (data.concept) formData.append('concept', data.concept);
      formData.append('numExercises', data.numExercises || 10);
      formData.append('difficulty', data.difficulty || 'medium');
      formData.append('preservePattern', data.preservePattern ? 'true' : 'false');
      if (data.referenceExercises) formData.append('referenceExercises', data.referenceExercises);
      
      return api.post('/exercises/generate-similar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    
    // Otherwise, send as JSON
    return api.post('/exercises/generate-similar', data);
  },
  
  health: () => api.get('/exercises/health')
};

// Revision Mode API
export const revisionAPI = {
  // Upload document
  uploadDocument: (file) => {
    const formData = new FormData();
    formData.append('document', file);
    return api.post('/revision/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Get user's documents
  getDocuments: () => api.get('/revision/documents'),
  
  // Generate quiz from document
  generateQuiz: (documentId, numQuestions = 5) => 
    api.post('/revision/quiz/generate', { documentId, numQuestions }),
  
  // Get quiz by ID
  getQuiz: (quizId) => api.get(`/revision/quiz/${quizId}`),
  
  // Chat with document
  chatWithDocument: (documentId, message) => 
    api.post('/revision/chat', { documentId, message }),
  
  // Fetch URL content
  fetchUrl: (url) => api.post('/revision/fetch-url', { url })
};

export const taskAPI = {
  getAll: () => api.get('/tasks'),
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (taskData) => api.post('/tasks', taskData),
  update: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  delete: (id) => api.delete(`/tasks/${id}`),
  toggle: (id) => api.patch(`/tasks/${id}/toggle`)
};



export default api;