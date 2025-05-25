import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getTeamsByOwner, getTeamsByUser } from '../services/TeamService.js';
import { useAuth } from '../contexts/AuthContext';

const TeamDashboard = () => {
    const { currentUser } = useAuth();
    const [ownedTeams, setOwnedTeams] = useState([]);
    const [memberTeams, setMemberTeams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAllTeams = useCallback(async () => {
        if (!currentUser?.userId) return;

        setIsLoading(true);
        try {
            const [ownedData, allUserTeams] = await Promise.all([
                getTeamsByOwner(currentUser.userId),
                getTeamsByUser(currentUser.userId)
            ]);

            setOwnedTeams(ownedData);
            // Show ALL teams the user is part of (including owned teams)
            setMemberTeams(allUserTeams);
            setError(null);
        } catch (err) {
            console.error('Error fetching teams:', err);
            setError('Error loading teams');
        } finally {
            setIsLoading(false);
        }
    }, [currentUser?.userId]);

    useEffect(() => {
        fetchAllTeams();
    }, [fetchAllTeams]);

    const StatCard = ({ title, value, icon, color, description }) => (
        <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-${color}-500/50 transition duration-200`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-sm font-medium">{title}</p>
                    <p className={`text-3xl font-bold text-${color}-400`}>{value}</p>
                    <p className="text-gray-500 text-xs mt-1">{description}</p>
                </div>
                <div className={`p-3 bg-${color}-600/20 rounded-full`}>
                    {icon}
                </div>
            </div>
        </div>
    );

    const TeamCard = ({ team, isOwner }) => (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-pink-500/50 transition duration-200">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-semibold text-white">{team.teamName}</h3>
                    <p className="text-gray-400 text-sm">{team.gameName}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                    isOwner
                        ? 'bg-purple-600/70 text-purple-100'
                        : 'bg-blue-600/70 text-blue-100'
                }`}>
                    {isOwner ? 'Owner' : 'Member'}
                </span>
            </div>
            <Link
                to={`/team/${team.teamId}`}
                state={{ teamData: team }}
                className="block w-full px-4 py-2 bg-pink-600 text-white text-sm rounded-lg hover:bg-pink-700 transition duration-200 text-center"
            >
                View Team
            </Link>
        </div>
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                    <div className="flex justify-center items-center h-64">
                        <svg className="animate-spin h-12 w-12 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                        Dashboard
                    </h1>
                    <p className="text-gray-400 mt-2">Welcome back, {currentUser?.username}!</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500/50 transition duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Teams Owned</p>
                                <p className="text-3xl font-bold text-purple-400">{ownedTeams.length}</p>
                                <p className="text-gray-500 text-xs mt-1">Teams you manage</p>
                            </div>
                            <div className="p-3 bg-purple-600/20 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500/50 transition duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">All Teams</p>
                                <p className="text-3xl font-bold text-blue-400">{memberTeams.length}</p>
                                <p className="text-gray-500 text-xs mt-1">Total teams you're in</p>
                            </div>
                            <div className="p-3 bg-blue-600/20 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-green-500/50 transition duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Quick Stats</p>
                                <p className="text-3xl font-bold text-green-400">{ownedTeams.length} / {memberTeams.length}</p>
                                <p className="text-gray-500 text-xs mt-1">Owned / Total</p>
                            </div>
                            <div className="p-3 bg-green-600/20 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v4h10z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                    <div className="flex flex-wrap gap-4">
                        <Link
                            to="/team-management"
                            className="px-6 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white font-medium rounded-lg shadow-lg hover:from-pink-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition duration-200"
                        >
                            Create New Team
                        </Link>
                        <button
                            onClick={fetchAllTeams}
                            className="px-6 py-3 bg-gray-700 text-white font-medium rounded-lg shadow-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-200"
                        >
                            Refresh Teams
                        </button>
                    </div>
                </div>

                {/* Teams Overview */}
                <div className="grid grid-cols-1 gap-8">
                    {/* All Teams */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">All Your Teams</h2>
                            <Link
                                to="/team-management"
                                className="text-pink-400 hover:text-pink-300 text-sm transition"
                            >
                                Manage Teams →
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {memberTeams.length > 0 ? (
                                memberTeams.map((team) => {
                                    const isOwner = team.ownerId === currentUser.userId;
                                    return (
                                        <TeamCard key={team.teamId} team={team} isOwner={isOwner} />
                                    );
                                })
                            ) : (
                                <div className="col-span-full bg-gray-800/50 rounded-lg p-8 border border-dashed border-gray-700 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                    </svg>
                                    <h3 className="text-lg font-medium text-white mb-2">No Teams Yet</h3>
                                    <p className="text-gray-400 text-sm mb-4">Create your first team or get invited to join one!</p>
                                    <Link
                                        to="/team-management"
                                        className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
                                    >
                                        Create Your First Team
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mt-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamDashboard;