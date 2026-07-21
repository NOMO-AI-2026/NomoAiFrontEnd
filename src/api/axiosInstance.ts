import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'https://nomoai.runasp.net/api',
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (error.response.status === 403) {
        window.location.href = '/'; 
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;