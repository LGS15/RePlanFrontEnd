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
        setAuthHeader(token);
        console.log('Auth header initialized with token');
    }
};

// Check if user is authenticated and token is still valid
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        // Get the expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000; // milliseconds

        // Check if token has expired
        if (Date.now() >= expiry) {

            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
            localStorage.removeItem('email');
            return false;
        }

        return true;
    } catch (e) {
        console.error('Invalid token format:', e);
        return false;
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

    // Interceptor with retry on 401
    axios.interceptors.response.use(
        response => response,
        async (error) => {
            const originalRequest = error.config;

            // If the error is due to an expired token, and we haven't tried to refresh yet
            if (error.response && error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    // Try to refresh the token
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
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('username');
                localStorage.removeItem('email');

                // Redirect to login page
                window.location.href = '/auth';
                return Promise.reject(error);
            }

            // For 403 Forbidden or other auth errors
            if (error.response && error.response.status === 403) {
                console.warn('Access forbidden:', error.response.status);

            }

            return Promise.reject(error);
        }
    );}