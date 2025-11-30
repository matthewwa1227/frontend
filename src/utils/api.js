import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('student');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
};

export const studentAPI = {
  getProfile: () => api.get('/student/profile'),
  getStats: () => api.get('/student/stats'),
};

export const sessionAPI = {
  start: (data) => api.post('/sessions/start', data),
  end: (id, data) => api.post(`/sessions/${id}/end`, data),
  getActive: () => api.get('/sessions/active'),
  getHistory: () => api.get('/sessions/history'),
};

export const achievementAPI = {
  getAll: () => api.get('/achievements'),
  getStudent: () => api.get('/achievements/student'),
  check: () => api.post('/achievements/check'),
};

export const leaderboardAPI = {
  getGlobal: () => api.get('/leaderboard/global'),
  getMyRank: () => api.get('/leaderboard/my-rank'),
};

export const dashboardAPI = {
  get: () => api.get('/dashboard'),
  getWeeklyStats: () => api.get('/dashboard/stats/weekly'),
};

export default api;