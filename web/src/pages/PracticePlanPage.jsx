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
                            Practice Plans
                        </h1>
                        <p className="text-gray-400 mt-2">Optimize your training with AI-powered practice recommendations</p>
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
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-300 font-medium">
                                        Welcome, {currentUser?.username}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Ready to level up your skills?
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500/50 transition duration-200">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-blue-600/20 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 002-2H5a2 2 0 00-2 2v4h10z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white">Smart Allocation</h3>
                        </div>
                        <p className="text-gray-400 text-sm">
                            AI-powered time distribution across your chosen focus areas for maximum improvement.
                        </p>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500/50 transition duration-200">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-purple-600/20 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white">Personalized Activities</h3>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Get specific training recommendations tailored to your chosen practice type and focus areas.
                        </p>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-green-500/50 transition duration-200">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-green-600/20 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white">Track Progress</h3>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Keep a history of all your practice plans to track your training journey and improvements.
                        </p>
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span>Practice Calculator</span>
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
                                <span>Practice History</span>
                            </div>
                        </button>
                    </nav>
                </div>

                {/* Content Area */}
                <div className="bg-opacity-50 backdrop-blur-sm">
                    {activeTab === 'calculator' && <PracticePlanCalculator />}
                    {activeTab === 'history' && <PracticeHistory />}
                </div>
            </div>
        </div>
    );
};

export default PracticePlanPage;