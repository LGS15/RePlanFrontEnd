import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { useAuth } from '../contexts/AuthContext';

const ProtectedLayout = ({ children }) => {
    const { currentUser, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Check if user is authenticated, redirect to login if not
    useEffect(() => {
        if (!currentUser && !isAuthenticated()) {
            navigate('/auth');
        }
    }, [currentUser, navigate, isAuthenticated]);

    // Only render the layout and children if the user is authenticated
    if (!currentUser && !isAuthenticated()) {
        return null; // Return nothing while redirecting
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