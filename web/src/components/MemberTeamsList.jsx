import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTeamsByUser } from '../services/TeamService.js';
import { useAuth } from '../contexts/AuthContext';

const MemberTeamsList = () => {
    const { currentUser } = useAuth();
    const [teams, setTeams] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedTeamId, setExpandedTeamId] = useState(null);

    const fetchTeams = async () => {
        if (!currentUser?.userId) return;

        setIsLoading(true);
        try {
            const teamsData = await getTeamsByUser(currentUser.userId);
            const memberTeams = teamsData.filter(team => team.ownerId !== currentUser.userId);
            setTeams(memberTeams);
            setError(null);
        } catch (err) {
            console.error('Error fetching member teams:', err);
            setError(err.response?.data?.message || 'Error fetching teams');
            setTeams([]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTeamDetails = (teamId) => {
        setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
    };

    useEffect(() => {
        if (currentUser?.userId) {
            fetchTeams();
        }
    }, [currentUser]);

    return (
        <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                    Teams You're In
                </h2>
                <button
                    onClick={fetchTeams}
                    className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg text-white flex items-center space-x-1 transition"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Refreshing...</span>
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

            {/* User info */}
            <div className="mb-6 bg-gray-800/70 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center space-x-3">
                    <div className="bg-blue-600/20 p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-white">Member of {teams.length} teams</h3>
                        <p className="text-sm text-gray-400">Teams where you're a member</p>
                    </div>
                </div>
            </div>

            {/* Teams List */}
            <div className="space-y-4">
                {teams.length > 0 ? (
                    teams.map((team) => (
                        <div key={team.teamId} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500/50 transition duration-200">
                            {/* Team Header */}
                            <div className="flex justify-between items-center">
                                <div
                                    className="px-6 py-4 cursor-pointer flex-grow flex items-center"
                                    onClick={() => toggleTeamDetails(team.teamId)}
                                >
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{team.teamName}</h3>
                                        <p className="text-gray-400">{team.gameName}</p>
                                        <p className="text-sm text-blue-400">You're a member</p>
                                    </div>
                                    <div className="flex items-center ml-auto">
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${expandedTeamId === team.teamId ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="pr-6">
                                    <Link
                                        to={`/team/${team.teamId}`}
                                        state={{ teamData: team }}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition duration-200"
                                    >
                                        View Team
                                    </Link>
                                </div>
                            </div>

                            {/* Team Details (expanded view) */}
                            {expandedTeamId === team.teamId && (
                                <div className="px-6 py-4 bg-gray-800 border-t border-gray-700">
                                    <h4 className="font-semibold text-gray-300 mb-2">Team Details</h4>
                                    <div className="space-y-2 text-gray-300">
                                        <p><span className="font-medium text-gray-400">Team ID:</span> {team.teamId}</p>
                                        <p><span className="font-medium text-gray-400">Game:</span> {team.gameName}</p>
                                        <p><span className="font-medium text-gray-400">Owner ID:</span> {team.ownerId}</p>
                                    </div>
                                    <div className="mt-4 flex space-x-3">
                                        <span className="px-3 py-1.5 bg-blue-600/70 text-blue-100 text-sm rounded-full">
                                            Member
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-dashed border-gray-700">
                        {isLoading ? (
                            <div className="flex justify-center">
                                <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        ) : error ? (
                            <div>
                                <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <h3 className="mt-2 text-lg font-medium text-white">Error Loading Teams</h3>
                                <p className="mt-1 text-gray-400">{error}</p>
                                <button
                                    onClick={fetchTeams}
                                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : (
                            <div>
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                                <h3 className="mt-2 text-lg font-medium text-white">No Teams Found</h3>
                                <p className="mt-1 text-gray-400">You're not a member of any teams yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemberTeamsList;