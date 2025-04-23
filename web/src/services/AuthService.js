import axios from 'axios';

const API_URL = 'http://localhost:8080';

// Set authorization header for all future requests
const setAuthHeader = (token) => {
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
    if (token) setAuthHeader(token);
};

// Check if user is authenticated
export const isAuthenticated = () => Boolean(localStorage.getItem('token'));