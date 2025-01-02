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
                localStorage.setItem('user', JSON.stringify(userData));

                // If admin, handle redirect
                if (response.data.role === 'admin') {
                    const params = new URLSearchParams({
                        token: response.data.access_token,
                        userId: response.data.user_id,
                        username: response.data.username,
                        role: response.data.role
                    }).toString();
                    window.location.href = `http://localhost:3001?${params}`;
                    return null;
                }

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
            if (error.response?.status === 401) {
                throw new Error('Invalid username or password');
            }
            throw new Error(error.response?.data?.detail || error.message || 'Login failed');
        }
    }

    getCurrentUser() {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    }

    async getCurrentUserInfo() {
        const user = this.getCurrentUser();
        if (!user || !user.user_id) {
            throw new Error('No user information found');
        }

        try {
            const response = await axiosInstance.get(`/users/${user.user_id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user info:', error);
            throw error;
        }
    }

    logout() {
        localStorage.removeItem('user');
    }

    // isTokenExpired() {
    //     const user = this.getCurrentUser();
    //     if (!user?.access_token) return true;

    //     try {
    //         const token = user.access_token;
    //         const tokenParts = token.split('.');
    //         if (tokenParts.length !== 3) return true;

    //         const payload = JSON.parse(atob(tokenParts[1]));
    //         const expiration = payload.exp * 1000;
    //         return Date.now() >= expiration;
    //     } catch {
    //         return true;
    //     }
    // }

    isTokenExpired() {
        const user = this.getCurrentUser();
        if (!user?.access_token) return true;

        try {
            const token = user.access_token;
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) return true;

            const payload = JSON.parse(atob(tokenParts[1]));
            const expiration = payload.exp * 1000;
            // Thêm buffer 5 giây để tránh edge cases
            return Date.now() >= (expiration - 5000);
        } catch {
            return true;
        }
    }

    // Add a method to store full user data
    setUserData(userData) {
        const existingUser = this.getCurrentUser();
        const fullUserData = {
            ...existingUser,
            ...userData
        };
        localStorage.setItem('user', JSON.stringify(fullUserData));
    }
}

export default new AuthService();