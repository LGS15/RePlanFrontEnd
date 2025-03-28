import React, { useState } from 'react';
import { createTeam } from '../services/TeamService.js';

const CreateTeamForm = () => {
    const [teamName, setTeamName] = useState('');
    const [gameName, setGameName] = useState('');
    const [ownerId, setOwnerId] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const teamData = { teamName, gameName, ownerId };
            const createdTeam = await createTeam(teamData);
            setResult(createdTeam);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating team');
            setResult(null);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Create Team</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1">Team Name:</label>
                    <input
                        className="border p-2 rounded w-full"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block mb-1">Game Name:</label>
                    <input
                        className="border p-2 rounded w-full"
                        value={gameName}
                        onChange={(e) => setGameName(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block mb-1">Owner ID:</label>
                    <input
                        className="border p-2 rounded w-full"
                        value={ownerId}
                        onChange={(e) => setOwnerId(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                    Create Team
                </button>
            </form>
            {result && (
                <div className="mt-4 p-2 border border-green-500 text-green-700">
                    Team created: {result.teamName} (ID: {result.teamId})
                </div>
            )}
            {error && (
                <div className="mt-4 p-2 border border-red-500 text-red-700">
                    {error}
                </div>
            )}
        </div>
    );
};

export default CreateTeamForm;
