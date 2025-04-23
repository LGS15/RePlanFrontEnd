import React, { createContext, useState, useContext, useEffect } from 'react';
import { login, register, isAuthenticated } from '../services/AuthService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load user from localStorage on initial render
        const loadUser = () => {
            if (isAuthenticated()) {
                setCurrentUser({
                    userId: localStorage.getItem('userId'),
                    username: localStorage.getItem('username'),
                    email: localStorage.getItem('email')
                });
            }
            setLoading(false);
        };

        loadUser();
    }, []);

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
        isAuthenticated: isAuthenticated
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