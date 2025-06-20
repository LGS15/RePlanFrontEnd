import React, { createContext, useState, useContext, useEffect , useCallback} from 'react';
import { login, register, isAuthenticated , refreshToken} from '../services/AuthService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const initializeAuth = useCallback(async () => {
        if (isAuthenticated()) {
            try {
                // Check if token is close to expiration and refresh if needed
                const tokenData = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));
                const expiryTime = tokenData.exp * 1000; // Convert to milliseconds
                const currentTime = Date.now();

                // If token expires in less than 15 minutes, refresh it
                if (expiryTime - currentTime < 15 * 60 * 1000) {
                    await refreshTokenSilently();
                }

                setCurrentUser({
                    userId: localStorage.getItem('userId'),
                    username: localStorage.getItem('username'),
                    email: localStorage.getItem('email')
                });
            } catch (error) {
                // Clear invalid authentication data
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('username');
                localStorage.removeItem('email');
            }
        }
        setLoading(false);
    }, []);

    const refreshTokenSilently = async () => {
        try {
            const newToken = await refreshToken();
            if (newToken) {
                localStorage.setItem('token', newToken);
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    };


    useEffect(() => {
        initializeAuth();

        // Set up an interval to check token expiration every 5 minutes
        const refreshInterval = setInterval(() => {
            if (isAuthenticated()) {
                refreshTokenSilently();
            }
        }, 5 * 60 * 1000);

        return () => clearInterval(refreshInterval);
    }, [initializeAuth]);


    const handleLogin = async (credentials) => {
        try {
            const data = await login(credentials);
            setCurrentUser({
                userId: data.userId,
                username: data.username,
                email: data.email
            });
            return data;
        } catch (error) {

            throw error;
        }
    };

    const handleRegister = async (userData) => {
        try {
            const data = await register(userData);
            setCurrentUser({
                userId: data.userId,
                username: data.username,
                email: data.email
            });
            return data;
        } catch (error) {

            throw error;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        setCurrentUser(null);
    };

    const value = {
        currentUser,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        isAuthenticated: isAuthenticated,
        refreshToken: refreshTokenSilently
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};