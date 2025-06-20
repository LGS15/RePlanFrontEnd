import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Animated background elements
const ChaoticElements = () => {
    return (
        <div className="absolute inset-0 overflow-hidden -z-10">
            {[...Array(15)].map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full opacity-20 animate-float"
                    style={{
                        width: `${Math.random() * 100 + 50}px`,
                        height: `${Math.random() * 100 + 50}px`,
                        backgroundColor: [
                            '#FF4D4D',
                            '#FFA64D',
                            '#4DA6FF',
                            '#FF4DFF',
                            '#E14DFF',
                        ][Math.floor(Math.random() * 5)],
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDuration: `${Math.random() * 10 + 10}s`,
                        animationDelay: `${Math.random() * 5}s`
                    }}
                />
            ))}
        </div>
    );
};

const AuthPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, register, currentUser, isAuthenticated } = useAuth();

    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        username: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const from = location.state?.from || '/dashboard';

    // If already authenticated, redirect to the intended page
    useEffect(() => {
        if (currentUser || isAuthenticated()) {
            navigate(from);
        }
    }, [currentUser, navigate, isAuthenticated, from]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {

                const loginData = {
                    email: formData.email,
                    password: formData.password
                };

                await login(loginData);

                navigate(from);
            } else {

                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match');
                    setLoading(false);
                    return;
                }

                if (formData.password.length < 6) {
                    setError('Password must be at least 6 characters');
                    setLoading(false);
                    return;
                }

                const registerData = {
                    email: formData.email,
                    password: formData.password,
                    username: formData.username
                };

                await register(registerData);
                navigate(from);
            }
        } catch (err) {
            console.error('Auth error:', err);

            if (err.status === 401) {
                setError('Authentication failed');
            } else if (err.status === 409) {
                setError('Email or username already exists');
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
            <ChaoticElements />

            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-red-900/40 to-pink-900/40 -z-5"></div>

            <div className="max-w-md w-full space-y-8 relative z-10">
                <div className="backdrop-blur-md bg-black/30 p-8 rounded-xl border border-pink-500/30 shadow-xl">
                    <div className="text-center">
                        <Link to="/">
                            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 mb-2">
                                Team Sync
                            </h2>
                        </Link>
                        <h1 className="text-2xl font-bold text-white mb-6">
                            {isLogin ? 'Sign in to your account' : 'Create your account'}
                        </h1>
                    </div>

                    {error && (
                        <div className="bg-red-900/50 border border-red-500 text-white px-4 py-3 rounded-md mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                data-cy="auth-email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-700 rounded-md bg-gray-800/80 shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                            />
                        </div>

                        {!isLogin && (
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    data-cy="auth-username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-700 rounded-md bg-gray-800/80 shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                data-cy="auth-password"
                                type="password"
                                autoComplete={isLogin ? "current-password" : "new-password"}
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-700 rounded-md bg-gray-800/80 shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                            />
                        </div>

                        {!isLogin && (
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    data-cy="auth-confirm-password"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-700 rounded-md bg-gray-800/80 shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                />
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-lg font-medium text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transform hover:scale-105 transition duration-300"
                            >
                                {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-pink-300 hover:text-pink-500 font-medium transition duration-300"
                        >
                            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;