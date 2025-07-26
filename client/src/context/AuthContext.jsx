// client/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

// Set up axios base URL and interceptors
axios.defaults.baseURL = 'http://localhost:5000/api'; // <--- IMPORTANT: Base URL for all API calls

// Add a request interceptor to attach the token
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle token expiration/401 errors
axios.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        // If 401 and not trying to refresh token or login
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/register') {
            originalRequest._retry = true; // Mark request as retried
            // Here you might attempt to refresh the token if you have a refresh token mechanism
            // For now, simply log out the user if the token is invalid/expired
            localStorage.removeItem('token');
            // You might want to navigate to login here, but it's better handled in a hook or component
            // window.location.href = '/login'; // This is a full page reload, typically not desired in React
            return Promise.reject(error); // Reject the original request
        }
        return Promise.reject(error);
    }
);


export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Added loading state for initial auth check
    const navigate = useNavigate(); // Use useNavigate hook

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Verify token with backend
                    const res = await axios.get('/auth/me'); // Uses default base URL
                    setUser(res.data);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
                    setIsAuthenticated(false);
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post('/auth/login', { email, password }); // Uses default base URL
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
            setIsAuthenticated(true);
            navigate('/'); // Navigate to dashboard
            return { success: true };
        } catch (error) {
            console.error('Login failed:', error.response?.data?.message || error.message);
            setIsAuthenticated(false);
            setUser(null);
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (username, email, password) => {
        try {
            const res = await axios.post('/auth/register', { username, email, password }); // Uses default base URL
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
            setIsAuthenticated(true);
            navigate('/'); // Navigate to dashboard
            return { success: true };
        } catch (error) {
            console.error('Registration failed:', error.response?.data?.message || error.message);
            setIsAuthenticated(false);
            setUser(null);
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
        navigate('/login'); // Navigate to login page
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);