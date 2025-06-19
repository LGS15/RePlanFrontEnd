import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTeam } from '../services/TeamService.js';
import { useAuth } from '../contexts/AuthContext';

const CreateTeamForm = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [teamName, setTeamName] = useState('');
    const [gameName, setGameName] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Predefined game options
    const gameOptions = [
        { value: '', label: 'Select a game' },
        { value: 'league-of-legends', label: 'League of Legends' },
        { value: 'valorant', label: 'Valorant' },
        { value: 'csgo', label: 'CS:GO' },
        { value: 'dota2', label: 'Dota 2' },
        { value: 'overwatch', label: 'Overwatch' },
        { value: 'rocket-league', label: 'Rocket League' },
        { value: 'fortnite', label: 'Fortnite' },
        { value: 'apex-legends', label: 'Apex Legends' },
        { value: 'other', label: 'Other' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Use the currentUser ID as the ownerId
            const ownerId = currentUser?.userId;

            if (!ownerId) {
                throw new Error('You must be logged in to create a team');
            }

            const teamData = { teamName, gameName, ownerId };
            const createdTeam = await createTeam(teamData);
            setResult(createdTeam);
            setError(null);

            // Navigate to the team page after a delay
            if (createdTeam && createdTeam.teamId) {
                setTimeout(() => {
                    navigate(`/team/${createdTeam.teamId}`, {
                        state: { teamData: createdTeam }
                    });
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'There seems to have been an error. Please try again later.');
            setResult(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-500">Create New Team</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Team Name Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Team Name</label>
                        <input
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200"
                            placeholder="Enter team name"
                            required
                            data-cy="team-name"
                        />
                    </div>

                    {/* Game Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Game</label>
                        <select
                            value={gameName}
                            onChange={(e) => setGameName(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200"
                            required
                            data-cy="game-name"
                        >
                            {gameOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Owner ID information - now automatic */}
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-300">
                        <span className="font-medium">Owner:</span> {currentUser?.username || 'Loading user...'}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                        Your account will be automatically set as the team owner
                    </p>
                </div>

                {/* Submit Button */}
                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white font-medium rounded-lg shadow-lg hover:from-pink-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        data-cy="create-team-btn"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating...
                            </span>
                        ) : 'Create Team'}
                    </button>
                </div>
            </form>

            {/* Success Message */}
            {result && (
                <div className="mt-6 p-4 bg-green-900/30 border border-green-700 rounded-lg text-green-400 animate-fade-in">
                    <div className="flex">
                        <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="font-medium">Team created successfully!</p>
                            <p className="text-sm mt-1">Team: {result.teamName} (ID: {result.teamId})</p>
                            <p className="text-sm mt-1">Redirecting to team page...</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mt-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400 animate-fade-in">
                    <div className="flex">
                        <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="font-medium">Error creating team</p>
                            <p className="text-sm mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateTeamForm;