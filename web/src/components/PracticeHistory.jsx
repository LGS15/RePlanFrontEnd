import React, { useState, useEffect } from 'react';
import {
    getCurrentUserPracticeHistory,
    getTeamPracticeHistory,
    formatPracticeDuration
} from '../services/PracticeService.js';
import { useAuth } from '../contexts/AuthContext';

const PracticeHistory = ({ selectedTeam = null, forceIndividual = false }) => {
    const { currentUser } = useAuth();
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedPlan, setExpandedPlan] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(10);
    const [hasMorePages, setHasMorePages] = useState(false);
    const [isLoadingPage, setIsLoadingPage] = useState(false);

    useEffect(() => {
        fetchPracticeHistory();
    }, [selectedTeam, forceIndividual, currentPage]);

    const fetchPracticeHistory = async () => {
        try {
            if (currentPage === 0) {
                setIsLoading(true);
            } else {
                setIsLoadingPage(true);
            }

            let historyData;
            if (selectedTeam && !forceIndividual) {
                historyData = await getTeamPracticeHistory(selectedTeam.teamId, currentPage, pageSize);
            } else {
                historyData = await getCurrentUserPracticeHistory(currentPage, pageSize);
            }

            setHistory(historyData);
            setHasMorePages(historyData.length === pageSize);
            setError(null);
        } catch (err) {
            console.error('Error fetching practice history:', err);
            setError(err.response?.data?.message || 'Error loading practice history');
        } finally {
            setIsLoading(false);
            setIsLoadingPage(false);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
            setExpandedPlan(null); // Close expanded plans when changing pages
        }
    };

    const handleNextPage = () => {
        if (hasMorePages) {
            setCurrentPage(currentPage + 1);
            setExpandedPlan(null);
        }
    };

    const handleRefresh = () => {
        setCurrentPage(0);
        fetchPracticeHistory();
    };

    const togglePlanDetails = (planId) => {
        setExpandedPlan(expandedPlan === planId ? null : planId);
    };

    const getFocusDisplayName = (focusKey) => {
        const focusMap = {
            'AIM_TRAINING': 'Aim Training',
            'GAME_SENSE': 'Game Sense',
            'MOVEMENT_MECHANICS': 'Movement',
            'MAP_KNOWLEDGE': 'Map Knowledge',
            'TEAM_COORDINATION': 'Team Coordination',
            'STRATEGY_REVIEW': 'Strategy Review',
            'VOD_ANALYSIS': 'VOD Analysis',
            'COMMUNICATION': 'Communication',
            'POST_PLANT_SCENARIOS': 'Post-Plant Scenarios',
            'SITE_HOLDS': 'Site Holds'
        };
        return focusMap[focusKey] || focusKey;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex justify-center items-center h-32">
                    <svg className="animate-spin h-8 w-8 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700 relative">
            <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <h3 className="text-xl font-bold text-white">
                        {selectedTeam && !forceIndividual ? `Practice History - ${selectedTeam.teamName}` : 'Practice History'}
                    </h3>
                    {currentPage > 0 && (
                        <span className="text-sm text-gray-400">
                            Page {currentPage + 1}
                        </span>
                    )}
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isLoading || isLoadingPage}
                    className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded text-white flex items-center space-x-1 transition disabled:opacity-50"
                >
                    {isLoading || isLoadingPage ? (
                        <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Loading...</span>
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Refresh</span>
                        </>
                    )}
                </button>
            </div>

            <div className="p-6">
                {error && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                )}

                {history.length > 0 ? (
                    <>
                        <div className="space-y-4">
                            {history.map((plan) => (
                                <div key={plan.planId} className="bg-gray-700/50 rounded-lg border border-gray-600 hover:border-pink-500/50 transition duration-200">
                                    {/* Plan Header */}
                                    <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => togglePlanDetails(plan.planId)}>
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-2 rounded-full ${plan.practiceType === 'TEAM' ? 'bg-blue-600/20' : 'bg-purple-600/20'}`}>
                                                {plan.practiceType === 'TEAM' ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white">
                                                    {plan.totalHours}h {plan.practiceType} Practice
                                                </h4>
                                                <p className="text-sm text-gray-400">
                                                    {Object.keys(plan.breakdown).length} focus areas • {formatDate(plan.generatedAt)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <div className="text-right">
                                                <div className="text-sm text-pink-400 font-medium">
                                                    {Object.keys(plan.breakdown).map(focus => getFocusDisplayName(focus)).join(', ')}
                                                </div>
                                            </div>
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${expandedPlan === plan.planId ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Plan Details (expanded view) */}
                                    {expandedPlan === plan.planId && (
                                        <div className="px-4 pb-4 border-t border-gray-600">
                                            <div className="pt-4 space-y-4">
                                                <h5 className="font-medium text-gray-300">Time Allocation Breakdown</h5>

                                                {Object.entries(plan.breakdown).map(([focusKey, allocation]) => (
                                                    <div key={focusKey} className="bg-gray-800 p-3 rounded-lg">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="font-medium text-white">{getFocusDisplayName(focusKey)}</span>
                                                            <span className="text-pink-400 font-medium">
                                                                {formatPracticeDuration(allocation.hours)} ({allocation.percentage}%)
                                                            </span>
                                                        </div>

                                                        {/* Progress Bar */}
                                                        <div className="w-full bg-gray-600 rounded-full h-1.5 mb-3">
                                                            <div
                                                                className="bg-gradient-to-r from-pink-500 to-red-500 h-1.5 rounded-full"
                                                                style={{ width: `${allocation.percentage}%` }}
                                                            ></div>
                                                        </div>

                                                        {/* Suggested Activities */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                                                            {allocation.suggestedActivities.slice(0, 4).map((activity, index) => (
                                                                <div key={index} className="flex items-center text-xs text-gray-400">
                                                                    <div className="w-1 h-1 bg-pink-500 rounded-full mr-2"></div>
                                                                    {activity}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Action Buttons */}
                                                <div className="flex space-x-2 pt-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const planText = `Practice Plan - ${plan.totalHours}h ${plan.practiceType}\nGenerated: ${formatDate(plan.generatedAt)}\n\n` +
                                                                Object.entries(plan.breakdown).map(([focus, allocation]) =>
                                                                    `${getFocusDisplayName(focus)}: ${formatPracticeDuration(allocation.hours)} (${allocation.percentage}%)\n` +
                                                                    allocation.suggestedActivities.map(activity => `  • ${activity}`).join('\n')
                                                                ).join('\n\n');

                                                            navigator.clipboard.writeText(planText);
                                                        }}
                                                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                                                    >
                                                        Copy Plan
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        <div className="mt-6 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 0 || isLoadingPage}
                                    className="px-3 py-2 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    <span>Previous</span>
                                </button>

                                <span className="text-sm text-gray-400">
                                    Page {currentPage + 1}
                                </span>

                                <button
                                    onClick={handleNextPage}
                                    disabled={!hasMorePages || isLoadingPage}
                                    className="px-3 py-2 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                                >
                                    <span>Next</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            <div className="text-sm text-gray-400">
                                Showing {history.length} practice plans
                                {hasMorePages && ' (more available)'}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <svg className="mx-auto h-12 w-12 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        <h3 className="text-lg font-medium text-white mb-2">
                            {selectedTeam && !forceIndividual ? 'No Team Practice Plans Yet' : 'No Practice Plans Yet'}
                        </h3>
                        <p className="text-sm">Generate your first practice plan to see it here.</p>
                    </div>
                )}
            </div>

            {/* Loading overlay for page changes */}
            {isLoadingPage && (
                <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center rounded-lg">
                    <div className="bg-gray-800 p-4 rounded-lg flex items-center space-x-3">
                        <svg className="animate-spin h-5 w-5 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-white">Loading page...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PracticeHistory;