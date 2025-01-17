import axios from 'axios';
import { authEvents } from './authEvents';

const axiosInstance = axios.create({
  baseURL: 'https://mou-x-test.azurewebsites.net',
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosInstance.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('adminUser'));
    if (user?.access_token) {
      config.headers.Authorization = `Bearer ${user.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response?.status === 401) {
      const loginEndpoints = ['/token'];
      const currentUrl = error.config?.url;
      
      // Không xử lý lỗi 401 cho các endpoint đăng nhập
      if (loginEndpoints.some(endpoint => currentUrl && currentUrl.includes(endpoint))) {
        return Promise.reject(error);
      }

      // Kiểm tra token hết hạn
      const currentUser = JSON.parse(localStorage.getItem('adminUser'));
      const isTokenExpired = !currentUser || isTokenExpired(currentUser.access_token);

      if (isTokenExpired) {
        // Emit sự kiện token hết hạn
        authEvents.emit('sessionExpired');
      }

      return Promise.reject(new Error('Session expired'));
    }
    return Promise.reject(error);
  }
);

function isTokenExpired(token) {
  try {
    const [, payloadBase64] = token.split('.');
    const payload = JSON.parse(atob(payloadBase64));
    const expTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expTime;
  } catch {
    return true;
  }
}

export default axiosInstance;