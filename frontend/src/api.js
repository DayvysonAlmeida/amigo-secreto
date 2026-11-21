// Cliente da API com o fetch nativo do navegador (sem biblioteca extra para baixar).
// Mantém o formato que o app usa: `res.data` no sucesso e `err.response.{status, data}` no erro.

// Por padrão a API fica no mesmo endereço do site (/api): em produção o Django entrega os dois,
// e no `npm run dev` o Vite repassa /api para o Django (vite.config.js).
// Só defina VITE_API_URL se a API ficar em outro domínio (ex.: https://api.seu-dominio.com.br/api).
const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(response) {
    super(`A API respondeu com o status ${response.status}`);
    this.response = response;
  }
}

const request = async (method, path, body) => {
  const headers = { Accept: 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers.Authorization = `Bearer ${token}`;

  const isForm = body instanceof FormData; // o navegador define o Content-Type do upload
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';

  const response = await fetch(BASE_URL + path, {
    method,
    headers,
    body: body === undefined || isForm ? body : JSON.stringify(body),
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      // Login vencido ou inválido: o AuthContext desconecta a pessoa.
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    throw new ApiError({ status: response.status, data });
  }
  return { status: response.status, data };
};

const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
};

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
