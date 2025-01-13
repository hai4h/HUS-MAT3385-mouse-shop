import axios from 'axios';
import authService from './authService';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json'
    }
});

let isShowingModal = false;

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

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response?.status === 401 && !isShowingModal) {
            isShowingModal = true;
            // Dispatch custom event
            const event = new CustomEvent('sessionExpired');
            window.dispatchEvent(event);

            // Reject promise để dừng request
            return Promise.reject(new Error('Session expired'));
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;