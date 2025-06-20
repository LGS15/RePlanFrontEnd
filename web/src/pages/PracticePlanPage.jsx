import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PracticePlanCalculator from '../components/PracticePlanCalculator.jsx';
import PracticeHistory from '../components/PracticeHistory.jsx';

const PracticePlanPage = () => {
    const [activeTab, setActiveTab] = useState('calculator');
    const { currentUser } = useAuth();

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                            Individual Practice Plans
                        </h1>
                        <p className="text-gray-400 mt-2">Create and track your personal training sessions</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center space-x-4">
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center text-gray-300 hover:text-white transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Back to Dashboard
                        </Link>
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-600/20 p-2 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-300 font-medium">
                                        {currentUser?.username}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Individual Training
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 border-b border-gray-800">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('calculator')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'calculator'
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 002 2v14a2 2 0 002 2z" />
                                </svg>
                                <span>Create Practice Plan</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'history'
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>My Practice History</span>
                            </div>
                        </button>
                    </nav>
                </div>

                {/* Content Area */}
                <div className="bg-opacity-50 backdrop-blur-sm">
                    {activeTab === 'calculator' && <PracticePlanCalculator forceIndividual={true} />}
                    {activeTab === 'history' && <PracticeHistory />}
                </div>
            </div>
        </div>
    );
};

export default PracticePlanPage;