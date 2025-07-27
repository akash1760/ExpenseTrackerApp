// client/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

// Set up axios base URL based on environment
// In development, it will be http://localhost:5000
// In production (Netlify), it will be the URL set in Netlify's env variables (e.g., https://your-backend.onrender.com)
axios.defaults.baseURL = import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5000';

// Allow credentials (like cookies if you were using them, or for CORS with credentials:true)
axios.defaults.withCredentials = true;

// Request Interceptor: Attach token to headers
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle token expiry
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            // You might want to try to refresh token here if you implement refresh tokens
            // For now, just log out if 401 (unauthorized) occurs
            localStorage.removeItem('token');
            // This assumes your navigate is accessible, typically you'd need history object
            // or handle logout outside interceptor
            // window.location.href = '/login'; // Force redirect to login
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Function to load user from token (called on app load)
    const loadUser = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Fetch user data from backend using the protected /api/auth/me route
                const res = await axios.get('/api/auth/me'); // <-- Corrected path
                setUser(res.data.user);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Failed to load user:', error.response?.data?.message || error.message);
                localStorage.removeItem('token');
                setUser(null);
                setIsAuthenticated(false);
                // navigate('/login'); // Redirect to login if token is invalid
            }
        }
        setLoading(false);
    }, []); // Empty dependency array means this function is created once

    useEffect(() => {
        loadUser();
    }, [loadUser]); // Run loadUser when component mounts or loadUser changes (it won't)


    // Login function
    const login = async (email, password) => {
        try {
            // Corrected path for login
            const res = await axios.post('/api/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
            setIsAuthenticated(true);
            navigate('/dashboard');
            return { success: true, message: res.data.message };
        } catch (error) {
            console.error('Login error:', error.response?.data?.message || error.message);
            // Changed message extraction to handle various backend responses
            return { success: false, message: error.response?.data?.message || 'Login failed. Please try again.' };
        }
    };

    // Register function
    const register = async (username, email, password) => {
        try {
            // Corrected path for register
            const res = await axios.post('/api/auth/register', { username, email, password });
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
            setIsAuthenticated(true);
            navigate('/dashboard');
            return { success: true, message: res.data.message };
        } catch (error) {
            console.error('Registration error:', error.response?.data?.message || error.message);
            // Changed message extraction to handle various backend responses
            return { success: false, message: error.response?.data?.message || 'Registration failed. Please try again.' };
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        navigate('/login');
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        loadUser,
        setUser, // Provide setUser if needed for profile updates etc.
    };

    if (loading) {
        return <div>Loading authentication...</div>; // Simple loading state while checking token
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};