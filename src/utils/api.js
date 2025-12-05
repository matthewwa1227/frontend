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

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const studentAPI = {
  getProfile: () => api.get('/student/profile'), 
  updateProfile: (data) => api.put('/student/profile', data),
  getStats: () => api.get('/student/stats'), 
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
  getSessions: () => api.get('/sessions/history'), // ✅ Correct endpoint
  getActiveSession: () => api.get('/sessions/active'),
};

export const achievementAPI = {
  getAchievements: () => api.get('/achievements'),
  getMyAchievements: () => api.get('/achievements/my'),
  checkAchievements: () => api.post('/achievements/check'),
};

export const leaderboardAPI = {
  getLeaderboard: () => api.get('/leaderboard'),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;