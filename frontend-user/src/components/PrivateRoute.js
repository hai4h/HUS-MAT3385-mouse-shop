// src/components/PrivateRoute.js
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const PrivateRoute = ({ children }) => {
    const user = authService.getCurrentUser();
    
    if (!user || !user.access_token) {
        // Not logged in, redirect to login page
        return <Navigate to="/" />;
    }

    return children;
};

export default PrivateRoute;