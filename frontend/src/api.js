import axios from 'axios';

const baseURL = import.meta.env.DEV
  ? (import.meta.env.VITE_API_URL || '/api')
  : '/api';

// In production, always use the same-origin /api path so Vercel can proxy to Render.
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach the JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle session expiration (401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if token is invalid or expired
      const isLoginOrRegister = window.location.pathname === '/login' || window.location.pathname === '/register';
      if (!isLoginOrRegister) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
