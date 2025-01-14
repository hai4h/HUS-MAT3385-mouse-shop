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
        // Kiểm tra nguồn gốc của lỗi 401
        if (error.response?.status === 401) {
            // Nếu lỗi đến từ endpoint login, không kích hoạt session expired
            const loginEndpoints = ['/token'];
            const currentUrl = error.config?.url;
            
            if (loginEndpoints.some(endpoint => currentUrl && currentUrl.includes(endpoint))) {
                // Trả về lỗi để component login có thể xử lý
                return Promise.reject(error);
            }

            // Kiểm tra xem token đã hết hạn chưa
            const currentUser = authService.getCurrentUser();
            const isTokenExpired = !currentUser || authService.isTokenExpired();

            if (!isShowingModal && isTokenExpired) {
                isShowingModal = true;
                // Dispatch custom event
                const event = new CustomEvent('sessionExpired');
                window.dispatchEvent(event);
            }

            return Promise.reject(new Error('Session expired'));
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;