import axiosInstance from './axiosConfig';

class AuthService {
    async login(username, password) {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        
        try {
            const response = await axiosInstance.post('/token', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (response.data.access_token) {
                // Store initial auth data
                const userData = {
                    access_token: response.data.access_token,
                    user_id: response.data.user_id,
                    username: response.data.username,
                    role: response.data.role
                };
                
                // Verify role
                if (userData.role !== 'admin') {
                    throw new Error('Unauthorized access');
                }

                localStorage.setItem('adminUser', JSON.stringify(userData));

                // Fetch and store complete user data
                try {
                    const userInfoResponse = await axiosInstance.get(`/users/${response.data.user_id}`);
                    this.setUserData(userInfoResponse.data);
                    return { ...userData, ...userInfoResponse.data };
                } catch (error) {
                    console.error('Error fetching complete user data:', error);
                    return userData;
                }
            }
            throw new Error('Invalid response from server');
        } catch (error) {
            throw error;
        }
    }

    getCurrentUser() {
        try {
            const userData = localStorage.getItem('adminUser');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    logout() {
        // Xóa dữ liệu admin
        localStorage.removeItem('adminUser');
        
        // Thêm flag logout cho trang user
        localStorage.setItem('adminLogoutTime', Date.now().toString());
        
        // Điều hướng sang login của admin
        window.location.href = '/login';
    }

    setUserData(userData) {
        const existingUser = this.getCurrentUser();
        const fullUserData = {
            ...existingUser,
            ...userData
        };
        localStorage.setItem('adminUser', JSON.stringify(fullUserData));
    }
}

export default new AuthService();