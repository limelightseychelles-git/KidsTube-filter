import axios from 'axios';

const API_BASE_URL = '/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  checkPIN: () => api.get('/auth/check-pin'),
  initializePIN: (pin) => api.post('/auth/initialize-pin', { pin }),
  verifyPIN: (pin) => api.post('/auth/verify-pin', { pin }),
  changePIN: (currentPin, newPin) => api.post('/auth/change-pin', { currentPin, newPin }),
};

export const videoAPI = {
  searchVideos: (query, maxResults = 12) => api.get('/videos/search', { params: { query, maxResults } }),
  getLatestVideos: (maxResults = 12) => api.get('/videos/latest', { params: { maxResults } }),
  getVideoDetails: (videoId) => api.get(`/videos/details/${videoId}`),
};

export const channelAPI = {
  getApprovedChannels: () => api.get('/channels'),
  addApprovedChannel: (channelId, channelName) => api.post('/channels', { channelId, channelName }),
  removeApprovedChannel: (id) => api.delete(`/channels/${id}`),
  searchChannels: (query) => api.get('/channels/search', { params: { query } }),
};

export const keywordAPI = {
  getBlockedKeywords: () => api.get('/keywords'),
  addBlockedKeyword: (keyword) => api.post('/keywords', { keyword }),
  removeBlockedKeyword: (id) => api.delete(`/keywords/${id}`),
  bulkAddKeywords: (keywords) => api.post('/keywords/bulk', { keywords }),
};

export const historyAPI = {
  getWatchHistory: (limit = 50, offset = 0) => api.get('/history', { params: { limit, offset } }),
  getWatchStatistics: () => api.get('/history/stats'),
  deleteHistoryEntry: (id) => api.delete(`/history/${id}`),
  clearAllHistory: () => api.delete('/history/clear'),
};

export const requestAPI = {
  getVideoRequests: (status) => api.get('/requests', { params: status ? { status } : {} }),
  getMyVideoRequests: () => api.get('/requests/my-requests'),
  submitVideoRequest: (videoUrl) => api.post('/requests/submit', { videoUrl }),
  approveVideoRequest: (id) => api.put(`/requests/${id}/approve`),
  rejectVideoRequest: (id) => api.put(`/requests/${id}/reject`),
  deleteVideoRequest: (id) => api.delete(`/requests/${id}`),
};

export const settingsAPI = {
  getAPIKeys: () => api.get('/settings'),
  addAPIKey: (key_value) => api.post('/settings', { key_value }),
  toggleAPIKey: (id, is_active) => api.put(`/settings/${id}`, { is_active }),
  deleteAPIKey: (id) => api.delete(`/settings/${id}`),
};

export default api;
