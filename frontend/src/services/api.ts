import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor ──
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.params ?? '');
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 422) {
      console.error('[API] Validation error:', error.response.data);
    } else {
      console.error('[API] Error:', error.response?.status, error.message);
    }
    return Promise.reject(error);
  },
);

export default api;
