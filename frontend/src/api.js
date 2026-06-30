import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // adjust backend url if different
});

// Request interceptor to add token if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;

export const createGroup = (payload) => api.post('/groups/new/', payload).then(res => res.data);
export const getGroups = () => api.get('/groups/').then(res => res.data);
export const getGroup = (adminToken) => api.get(`/groups/${adminToken}/`).then(res => res.data);
export const addParticipant = (adminToken, payload) => api.post(`/groups/${adminToken}/participants/`, payload).then(res => res.data);
export const removeParticipant = (adminToken, participantId) => api.delete(`/groups/${adminToken}/participants/${participantId}/`).then(res => res.data);
export const drawGroup = (adminToken) => api.post(`/groups/${adminToken}/draw/`).then(res => res.data);
export const revealParticipant = async (token) => {
  const response = await api.get(`/reveal/${token}/`);
  return response.data;
};

export const updateProfile = async (formData) => {
  const response = await api.put('/auth/me/', formData);
  return response.data;
};
