import axios, { type InternalAxiosRequestConfig, type AxiosError } from 'axios';

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
  withCredentials: true, // إرسال واستقبال الـ HttpOnly Refresh Token Cookies تلقائياً
});

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (!config.headers['X-Correlation-ID']) {
    config.headers['X-Correlation-ID'] = createCorrelationId();
  }

  return config;
});

// متغيرات التحكم في عملية التجديد ومنع تكرار النداءات المتزامنة
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest) {
      const requestUrl = originalRequest.url?.toLowerCase() || '';

      // تجنب إعادة المحاولة التلقائية إذا كان الطلب نفسه ينتمي لعمليات المصادقة الأساسية
      const isAuthEndpoint =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register') ||
        requestUrl.includes('/auth/refresh') ||
        requestUrl.includes('/auth/logout') ||
        requestUrl.includes('/auth/confirm-email');

      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      if (originalRequest._retry) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // طلب تجديد التوكن من الباك إند مع الاعتماد على HttpOnly Cookie
        const refreshResponse = await axiosInstance.post('/auth/refresh');
        const data = refreshResponse.data;
        const newAccessToken = data?.accessToken || data?.value?.accessToken;

        if (newAccessToken) {
          localStorage.setItem('token', newAccessToken);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return axiosInstance(originalRequest);
        } else {
          throw new Error('No access token returned from refresh endpoint');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
