import axios from 'axios';

const API_URL = 'http://localhost:8080';

// Set authorization header for all future requests
export const setAuthHeader = (token) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
};

// Register a new user
export const register = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/users/register`, userData);

        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userId', response.data.userId);
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('email', response.data.email);
            setAuthHeader(response.data.token);
        }

        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Login a user
export const login = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/users/login`, credentials);

        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userId', response.data.userId);
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('email', response.data.email);
            setAuthHeader(response.data.token);
        }

        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Initialize auth header with token from localStorage
export const initAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (token) {
        setAuthHeader(token);
        console.log('Auth header initialized with token');
    } else {
        console.warn('No token found in localStorage during initialization');
    }
};

// Handle 401/403 responses globally
export const setupAxiosInterceptors = () => {
    // Request interceptor
    axios.interceptors.request.use(
        config => {
            // Ensure Authorization header is set on every request
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        error => Promise.reject(error)
    );

    // Response interceptor
    axios.interceptors.response.use(
        response => response,
        error => {
            // Handle 401 (Unauthorized) or 403 (Forbidden) responses
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                console.warn('Authentication issue:', error.response.status);

                // If it was an API request (not login/register)
                if (!error.config.url.includes('login') && !error.config.url.includes('register')) {
                    console.log('Token rejected by API, logging out user...');
                    // Clear authentication data
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('username');
                    localStorage.removeItem('email');

                    // Redirect to login page after a short delay
                    setTimeout(() => {
                        window.location.href = '/auth';
                    }, 100);
                }
            }
            return Promise.reject(error);
        }
    );
};

// Check if user is authenticated
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    // You could add token expiration validation here
    // For example, decode the JWT and check if it's expired

    return true;
};