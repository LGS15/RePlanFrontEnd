import axios from 'axios';

const API_URL = 'http://localhost:8080';

// This right here is 15 minutes in milliseconds
const TOKEN_EXPIRATION_THRESHOLD = 15 * 60 * 1000;



export const setAuthHeader = (token) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
};


const getTokenExpiration = (token) => {
    try {
        if (!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000; // Milliseconds
    } catch (e) {
        console.error('Invalid token format:', e);
        return null;
    }
};

// Check if token is expiring soon
const isTokenExpiringSoon = (token) => {
    const expiry = getTokenExpiration(token);
    if (!expiry) return true;
    return Date.now() + TOKEN_EXPIRATION_THRESHOLD >= expiry;
};

export const register = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/users/register`, userData);

        if (response.data.token) {
            storeAuthData(response.data);
        }

        return response.data;
    } catch (error) {
        handleAuthError(error);
    }
};

export const login = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/users/login`, credentials);

        if (response.data.token) {
            storeAuthData(response.data);
        }

        return response.data;
    } catch (error) {
        handleAuthError(error);
    }
};

export const refreshToken = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;

        // Only refresh if the token is valid but expiring soon
        if (!isTokenExpiringSoon(token)) {
            return token; // Return existing token if it's not expiring soon
        }

        const response = await axios.post(`${API_URL}/users/refresh-token`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.data.token) {
            storeAuthData(response.data);
            return response.data.token;
        }
        return null;
    } catch (error) {
        console.error('Token refresh failed:', error);
        // Clear auth data if refresh fails due to invalid token
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            clearAuthData();
        }
        return null;
    }
};

const storeAuthData = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('username', data.username);
    localStorage.setItem('email', data.email);
    setAuthHeader(data.token);
};

const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    setAuthHeader(null);
};

// Handle 401/403 responses globally
const handleAuthError = (error) => {
    console.error('Authentication error:', error);

    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw {
            status: error.response.status,
            message: error.response.data?.message || 'Authentication failed',
            data: error.response.data
        };
    } else if (error.request) {
        // The request was made but no response was received
        throw {
            status: 0,
            message: 'No response from server. Please check your internet connection.'
        };
    } else {
        throw {
            status: 500,
            message: error.message || 'An unexpected error occurred'
        };
    }
};

export const initAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (token) {
        // Check if token is valid before setting header
        if (isValidToken(token)) {
            setAuthHeader(token);
            console.log('Auth header initialized with token');
        } else {
            clearAuthData();
            console.warn('Invalid token found in localStorage, cleared auth data');
        }
    }
};


export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return isValidToken(token);
};

// Validate token format and expiration
export const isValidToken = (token) => {
    if (!token) return false;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000; // milliseconds

        // Check if token has expired
        if (Date.now() >= expiry) {
            clearAuthData();
            return false;
        }

        return true;
    } catch (e) {
        console.error('Invalid token format:', e);
        clearAuthData();
        return false;
    }
};


export const setupAxiosInterceptors = () => {
    axios.interceptors.request.use(
        async config => {
            const token = localStorage.getItem('token');

            if (token && isTokenExpiringSoon(token)) {
                const newToken = await refreshToken();
                if (newToken) {
                    config.headers.Authorization = `Bearer ${newToken}`;
                }
            } else if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        },
        error => Promise.reject(error)
    );


    axios.interceptors.response.use(
        response => response,
        async (error) => {
            const originalRequest = error.config;

            if (error.response && error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    const newToken = await refreshToken();
                    if (newToken) {
                        // Retry the original request with new token
                        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                        return axios(originalRequest);
                    }
                } catch (refreshError) {
                    console.error('Token refresh failed during interceptor:', refreshError);
                }

                // If we get here, token refresh failed or was not possible
                clearAuthData();

                window.location.href = '/auth';
                return Promise.reject(error);
            }

            if (error.response && error.response.status === 403) {
                console.warn('Access forbidden:', error.response.data);
            }

            return Promise.reject(error);
        }
    );
}