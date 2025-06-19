import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {deleteTeam, getTeamsByOwner} from '../services/TeamService.js';
import { useAuth } from '../contexts/AuthContext';

const OwnedTeamsList = () => {
    const { currentUser } = useAuth();
    const [teams, setTeams] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedTeamId, setExpandedTeamId] = useState(null);
    const [deletingTeamId, setDeletingTeamId] = useState(null);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    // Fetch teams when component mounts or currentUser changes
    const fetchTeams = async () => {
        if (!currentUser?.userId) return;

        setIsLoading(true);
        try {
            const teamsData = await getTeamsByOwner(currentUser.userId);
            setTeams(teamsData);
            setError(null);
        } catch (err) {
            console.error('Error fetching teams:', err);
            setError(err.response?.data?.message || 'Error fetching teams');
            setTeams([]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTeamDetails = (teamId) => {
        setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
    };

    const handleDeleteTeam = async (teamId, teamName) => {
        if (!confirm(`Are you sure you want to delete the team "${teamName}"? This action cannot be undone.`)) {
            return;
        }

        setDeletingTeamId(teamId);
        setDeleteSuccess(false);
        setDeleteError(null);

        try {
            await deleteTeam(teamId);

            // Remove the deleted team from the local state
            setTeams(prevTeams => prevTeams.filter(team => team.teamId !== teamId));

            setDeleteSuccess(true);
            setTimeout(() => setDeleteSuccess(false), 3000);
        } catch (err) {
            console.error('Error deleting team:', err);
            setDeleteError(err.response?.data?.message || 'Error deleting team');
            setTimeout(() => setDeleteError(null), 3000);
        } finally {
            setDeletingTeamId(null);
        }
    };

    // Fetch teams when currentUser changes
    useEffect(() => {
        if (currentUser?.userId) {
            fetchTeams();
        }
    }, [currentUser]);

    return (
        <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-500">
                    Manage Your Teams
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
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                    <div className="bg-pink-600/20 p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-white">{currentUser?.username || 'Loading user...'}</h3>
                        <p className="text-sm text-gray-400">User ID: {currentUser?.userId || 'Loading...'}</p>
                    </div>
                </div>
            </div>

            {/* Status Messages */}
            {deleteSuccess && (
                <div className="mb-4 p-4 bg-green-900/30 border border-green-700 rounded-lg text-green-400 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Team deleted successfully!
                </div>
            )}

            {deleteError && (
                <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {deleteError}
                </div>
            )}

            {/* Teams List */}
            <div className="space-y-4">
                {teams.length > 0 ? (
                    teams.map((team) => (
                        <div key={team.teamId} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-pink-500/50 transition duration-200">
                            {/* Team-Header */}
                            <div className="flex justify-between items-center">
                                <div
                                    className="px-6 py-4 cursor-pointer flex-grow flex items-center"
                                    onClick={() => toggleTeamDetails(team.teamId)}
                                >
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{team.teamName}</h3>
                                        <p className="text-gray-400">{team.gameName}</p>
                                    </div>
                                    <div className="flex items-center ml-auto">
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${expandedTeamId === team.teamId ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="pr-6 flex space-x-2">
                                    <Link
                                        to={`/team/${team.teamId}`}
                                        state={{ teamData: team }}
                                        className="px-4 py-2 bg-pink-600 text-white text-sm rounded-lg hover:bg-pink-700 transition duration-200"
                                    >
                                        View Team
                                    </Link>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteTeam(team.teamId, team.teamName);
                                        }}
                                        disabled={deletingTeamId === team.teamId}
                                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        data-cy="delete-team-btn"
                                    >
                                        {deletingTeamId === team.teamId ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Deleting...
                                            </span>
                                        ) : 'Delete'}
                                    </button>
                                </div>
                            </div>

                            {/* Team-Details (expanded view) */}
                            {expandedTeamId === team.teamId && (
                                <div className="px-6 py-4 bg-gray-800 border-t border-gray-700">
                                    <h4 className="font-semibold text-gray-300 mb-2">Team Details</h4>
                                    <div className="space-y-2 text-gray-300">
                                        <p><span className="font-medium text-gray-400">Team ID:</span> {team.teamId}</p>
                                        <p><span className="font-medium text-gray-400">Game:</span> {team.gameName}</p>
                                        <p><span className="font-medium text-gray-400">Owner:</span> {team.ownerId}</p>
                                    </div>
                                    <div className="mt-4 flex space-x-3">
                                        <button className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition">
                                            Invite Member
                                        </button>
                                        <button className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition">
                                            Edit Team
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTeam(team.teamId, team.teamName)}
                                            disabled={deletingTeamId === team.teamId}
                                            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition disabled:opacity-50"
                                        >
                                            {deletingTeamId === team.teamId ? 'Deleting...' : 'Delete Team'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-dashed border-gray-700">
                        {isLoading ? (
                            <div className="flex justify-center">
                                <svg className="animate-spin h-8 w-8 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                                <h3 className="mt-2 text-lg font-medium text-white">No Teams Found</h3>
                                <p className="mt-1 text-gray-400">You don't have any teams yet. Create a new team to get started.</p>
                                <button
                                    onClick={() => document.querySelector('button[data-tab="create"]')?.click()}
                                    className="mt-4 px-5 py-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-full text-white hover:from-red-600 hover:to-pink-700 transition"
                                >
                                    Create Your First Team
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnedTeamsList;