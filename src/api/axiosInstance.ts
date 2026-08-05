import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  console.warn(
    'VITE_API_BASE_URL is not set. Falling back is disabled for production safety; set it in .env.',
  );
}

function createCorrelationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `corr-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const axiosInstance = axios.create({
  baseURL: apiBaseUrl || undefined,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (!config.headers['X-Correlation-ID']) {
    config.headers['X-Correlation-ID'] = createCorrelationId();
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        const requestUrl = error.config?.url?.toLowerCase() || '';

        if (!requestUrl.includes('login')) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
