import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { useAuth } from '../contexts/AuthContext';

const ProtectedLayout = ({ children }) => {
    const { currentUser, isAuthenticated , refreshToken} = useAuth();
    const navigate = useNavigate();


    useEffect(() => {
        const checkAuthentication = async () => {
            if (!currentUser) {
                // Try to refresh token first before redirecting
                if (isAuthenticated()) {
                    const refreshSuccess = await refreshToken();
                    if (!refreshSuccess) {
                        navigate('/auth', { state: { from: window.location.pathname } });
                    }
                } else {
                    navigate('/auth', { state: { from: window.location.pathname } });
                }
            }
        };

        checkAuthentication();
    }, [currentUser, navigate, isAuthenticated, refreshToken]);

    if (!currentUser && !isAuthenticated()) {
        return null;
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <NavBar />
            <div className="pt-16 px-4 sm:px-6 lg:px-8">
                {children}
            </div>
        </div>
    );
};

export default ProtectedLayout;