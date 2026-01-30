import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

// Add this to your api.js file

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
};

export default api;