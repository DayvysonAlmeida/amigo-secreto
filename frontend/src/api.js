import axios from 'axios';

// Por padrão a API fica no mesmo endereço do site (/api): em produção o Django entrega os dois,
// e no `npm run dev` o Vite repassa /api para o Django (vite.config.js).
// Só defina VITE_API_URL se a API ficar em outro domínio (ex.: https://api.seu-dominio.com.br/api).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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
export const updateGroup = (adminToken, payload) => api.patch(`/groups/${adminToken}/`, payload).then(res => res.data);
export const deleteGroup = (adminToken) => api.delete(`/groups/${adminToken}/`);
export const updateParticipant = (adminToken, participantId, payload) => api.patch(`/groups/${adminToken}/participants/${participantId}/`, payload).then(res => res.data);
export const addParticipant = (adminToken, payload) => api.post(`/groups/${adminToken}/participants/`, payload).then(res => res.data);
export const removeParticipant = (adminToken, participantId) => api.delete(`/groups/${adminToken}/participants/${participantId}/`).then(res => res.data);
export const drawGroup = (adminToken) => api.post(`/groups/${adminToken}/draw/`).then(res => res.data);
export const undoDraw = (adminToken) => api.delete(`/groups/${adminToken}/draw/`).then(res => res.data);
export const markLinkSent = (adminToken, participantId) => api.post(`/groups/${adminToken}/participants/${participantId}/sent/`).then(res => res.data);
// Link público do participante: abrir não revela; revelar marca como visto.
export const getRevealInfo = (token) => api.get(`/reveal/${token}/`).then(res => res.data);
export const revealParticipant = (token) => api.post(`/reveal/${token}/`).then(res => res.data);
export const updateMyWishlist = (token, wishlist) => api.patch(`/reveal/${token}/`, { wishlist }).then(res => res.data);

export const updateProfile = async (formData) => {
  const response = await api.put('/auth/me/', formData);
  return response.data;
};
