import axios from 'axios';
import authService from './authService';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const user = authService.getCurrentUser();
        if (user?.access_token) {
            config.headers.Authorization = `Bearer ${user.access_token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Prevent automatic redirect on 401
        if (error.response?.status === 401) {
            // Don't automatically clear user data or redirect
            // Let the component handle the error
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;