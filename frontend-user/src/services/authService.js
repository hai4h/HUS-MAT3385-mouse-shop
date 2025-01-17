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
                    window.location.href = `https://mou-x-admin.azurewebsites.net?${params}`;
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
            // Ném nguyên error để component login có thể xử lý chi tiết
            throw error;
        }
    }

    getCurrentUser() {
        try {
            const userData = localStorage.getItem('user');
            if (!userData) {
                console.log('No user data in localStorage');
                return null;
            }
            
            const user = JSON.parse(userData);
            console.log('Current user:', { ...user, access_token: '[REDACTED]' });
            return user;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
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
        console.log('Logging out user');
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
        if (!user?.access_token) {
            console.log('No user or token found');
            return true;
        }

        try {
            const token = user.access_token;
            const tokenParts = token.split('.');
            
            if (tokenParts.length !== 3) {
                console.error('Invalid token format');
                return true;
            }

            const payload = JSON.parse(atob(tokenParts[1]));
            const expiration = payload.exp * 1000; // Convert to milliseconds
            const currentTime = Date.now();
            
            // Add buffer time (15 seconds) to prevent edge cases
            const isExpired = currentTime >= (expiration - 15000);
            
            if (isExpired) {
                console.log('Token expired:', {
                    currentTime: new Date(currentTime).toISOString(),
                    expirationTime: new Date(expiration).toISOString(),
                    timeUntilExpiration: Math.floor((expiration - currentTime) / 1000) + ' seconds'
                });
            } else {
                console.log('Token valid for:', Math.floor((expiration - currentTime) / 1000), 'seconds');
            }
            
            return isExpired;
        } catch (error) {
            console.error('Error checking token expiration:', error);
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

const authService = new AuthService();
export default authService;