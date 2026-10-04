import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });
export const TOKEN_KEY = 'lms_token';
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
api.interceptors.response.use((r) => r, (err) => {
  if (err.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) window.dispatchEvent(new Event('auth:logout'));
  return Promise.reject(err);
});
export const getErrorMessage = (e) => e.response?.data?.message || e.message || 'Something went wrong';
export const getFieldErrors = (e) => Object.fromEntries((e.response?.data?.errors || []).map((x) => [x.field, x.message]));
const data = (p) => p.then((r) => r.data);
export const authService = {
  login: (body) => data(api.post('/auth/login', body)),
  register: (body) => data(api.post('/auth/register', body)),
  me: () => data(api.get('/auth/me')),
  updateMe: (body) => data(api.put('/auth/me', body)),
};
export const leadService = {
  list: (params) => data(api.get('/leads', { params })),
  get: (id) => data(api.get(`/leads/${id}`)),
  create: (body) => data(api.post('/leads', body)),
  update: (id, body) => data(api.put(`/leads/${id}`, body)),
  remove: (id) => api.delete(`/leads/${id}`),
  stats: () => data(api.get('/leads/stats')),
  reminders: () => data(api.get('/leads/reminders')),
};
export const userService = { list: () => data(api.get('/users')) };
