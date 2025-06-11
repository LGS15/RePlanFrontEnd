import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ReviewSessionViewer from '../components/ReviewSessionViewer.jsx';

const ReviewSessionPage = () => {
    const { sessionId } = useParams();

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Navigation Header */}
            <nav className="bg-gray-800 border-b border-gray-700 px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/dashboard"
                            className="text-gray-300 hover:text-white transition flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Back to Dashboard
                        </Link>
                        <span className="text-gray-500">|</span>
                        <h1 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-500">
                            Review Session
                        </h1>
                    </div>

                    <div className="text-sm text-gray-400">
                        Session ID: {sessionId}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <ReviewSessionViewer />
        </div>
    );
};

export default ReviewSessionPage;