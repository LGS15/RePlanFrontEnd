import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import TeamManagementPage from './pages/TeamManagementPage';
import TeamPage from './pages/TeamPage.jsx';
import AuthPage from './pages/AuthPage';
import ReviewSessionPage from './pages/ReviewSessionPage.jsx';
import PracticePlanPage from './pages/PracticePlanPage.jsx';
import ProtectedLayout from './layouts/ProtectedLayout';
import { setupAxiosInterceptors } from './services/AuthService';
import { AuthProvider } from './contexts/AuthContext';
import TeamDashboard from "./components/TeamDashboard.jsx";
import './App.css';


function App() {

    useEffect(() => {
        setupAxiosInterceptors();
        console.log('Auth interceptors initialized');
    }, []);

    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/auth" element={<AuthPage />} />

                    {/* Protected routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedLayout>
                                <TeamDashboard />
                            </ProtectedLayout>
                        }
                    />
                    <Route
                        path="/team-management"
                        element={
                            <ProtectedLayout>
                                <TeamManagementPage />
                            </ProtectedLayout>
                        }
                    />
                    <Route
                        path="/practice-plans"
                        element={
                            <ProtectedLayout>
                                <PracticePlanPage />
                            </ProtectedLayout>
                        }
                    />
                    <Route
                        path="/team/:teamId"
                        element={
                            <ProtectedLayout>
                                <TeamPage />
                            </ProtectedLayout>
                        }
                    />
                    <Route
                        path="/review-session/:sessionId"
                        element={
                            <ProtectedLayout>
                                <ReviewSessionPage />
                            </ProtectedLayout>
                        }
                    />

                    {/* Catch-all redirect */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;