import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTeamsByOwner } from '../services/TeamService.js'; // Fixed function name

const OwnedTeamsList = () => {
    const [teams, setTeams] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [ownerId, setOwnerId] = useState('');
    const [expandedTeamId, setExpandedTeamId] = useState(null);

    // Fetch teams when ownerId changes
    const fetchTeams = async () => {
        if (!ownerId) return;

        setIsLoading(true);
        try {
            const teamsData = await getTeamsByOwner(ownerId);
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

    const handleSearch = (e) => {
        e.preventDefault();
        fetchTeams();
    };

    const toggleTeamDetails = (teamId) => {
        setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
    };

    // Fetch teams when ownerId changes
    useEffect(() => {
        if (ownerId) {
            fetchTeams();
        }
    }, [ownerId]);

    return (
        <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-500">Manage Your Teams</h2>

            {/* ownerId search-form */}
            <form onSubmit={handleSearch} className="mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-grow">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Owner ID</label>
                        <input
                            type="text"
                            value={ownerId}
                            onChange={(e) => setOwnerId(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200"
                            placeholder="Enter your owner ID"
                        />
                    </div>
                    <div className="md:self-end">
                        <button
                            type="submit"
                            className="w-full md:w-auto px-6 py-2.5 bg-pink-600 text-white font-medium rounded-lg shadow-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition duration-200"
                            disabled={isLoading || !ownerId}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Loading...
                                </span>
                            ) : 'Find Teams'}
                        </button>
                    </div>
                </div>
            </form>

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
                                <div className="pr-6">
                                    <Link
                                        to={`/team/${team.teamId}`}
                                        state={{ teamData: {
                                                ...team,
                                                // Initialize with empty members array for the team page
                                                members: []
                                            }}}
                                        className="px-4 py-2 bg-pink-600 text-white text-sm rounded-lg hover:bg-pink-700 transition duration-200"
                                    >
                                        View Team
                                    </Link>
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
                            </div>
                        ) : ownerId ? (
                            <div>
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <h3 className="mt-2 text-lg font-medium text-white">No Teams Found</h3>
                                <p className="mt-1 text-gray-400">You don't have any teams yet. Create a new team to get started.</p>
                            </div>
                        ) : (
                            <div>
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                                <h3 className="mt-2 text-lg font-medium text-white">Enter Your Owner ID</h3>
                                <p className="mt-1 text-gray-400">Enter your owner ID to see your teams</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnedTeamsList;