import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, Navigate } from 'react-router-dom';
import { addTeamMember, getTeamMembers } from '../services/TeamService.js';

const TeamPage = () => {
    const { teamId } = useParams();
    const location = useLocation();
    const teamDataFromState = location.state?.teamData;

    // Hooks
    const [team, setTeam] = useState(teamDataFromState || null);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('PLAYER');
    const [isAdding, setIsAdding] = useState(false);
    const [addError, setAddError] = useState(null);
    const [addSuccess, setAddSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(true);



    // Fetch team members when component mounts
    useEffect(() => {
        // Only fetch if we have a team
        if (team) {
            const fetchTeamMembers = async () => {
                try {
                    setIsLoading(true);
                    const response = await getTeamMembers(teamId);
                    setTeam({
                        ...team,
                        members: response.members || []
                    });
                } catch (err) {
                    console.error("Error fetching team members:", err);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchTeamMembers();
        }
    }, [teamId, team]);

    if (!team) {
        return <Navigate to="/team-management" replace />;
    }


    const handleAddMember = async (e) => {
        e.preventDefault();
        setIsAdding(true);
        setAddSuccess(false);
        setAddError(null);

        try {
            const memberData = { email, role };
            const result = await addTeamMember(teamId, memberData);

            // Update local state to include the new member
            const newMember = {
                teamMemberId: result.teamMemberId,
                teamId,
                userId: result.userId,
                role
            };

            setTeam({
                ...team,
                members: [...(team.members || []), newMember]
            });

            setAddSuccess(true);
            setEmail('');
            setRole('PLAYER');
        } catch (err) {
            setAddError(err.response?.data?.message || "Error adding team member");
        } finally {
            setIsAdding(false);
        }
    };

    // Get role badge color
    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'OWNER':
                return 'bg-purple-600/70 text-purple-100';
            case 'COACH':
                return 'bg-blue-600/70 text-blue-100';
            case 'PLAYER':
                return 'bg-green-600/70 text-green-100';
            default:
                return 'bg-gray-600/70 text-gray-100';
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Back button */}
                <div className="mb-4">
                    <Link
                        to="/team-management"
                        className="inline-flex items-center text-gray-300 hover:text-white transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back to Teams
                    </Link>
                </div>

                {/* Team Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-500">
                        {team.teamName}
                    </h1>
                    <p className="text-gray-400 mt-2">{team.gameName}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Team Members Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                            <div className="px-6 py-4 border-b border-gray-700">
                                <h2 className="text-xl font-bold">Team Members</h2>
                            </div>
                            <div className="p-6">
                                {isLoading ? (
                                    <div className="flex justify-center py-8">
                                        <svg className="animate-spin h-8 w-8 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                ) : team.members && team.members.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-700">
                                            <thead>
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User ID</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                                            </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-700">
                                            {team.members.map((member) => (
                                                <tr key={member.teamMemberId}>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">{member.userId}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                            <span className={`px-2 py-1 rounded-full text-xs ${getRoleBadgeClass(member.role)}`}>
                                                                {member.role}
                                                            </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-400">
                                        <p>No team members yet. Add members using the form.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Add Member Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                            <div className="px-6 py-4 border-b border-gray-700">
                                <h2 className="text-xl font-bold">Add Member</h2>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleAddMember} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">User ID</label>
                                        <input
                                            type="text"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200"
                                            placeholder="Enter user ID"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                                        <select
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200"
                                            required
                                        >
                                            <option value="PLAYER">Player</option>
                                            <option value="COACH">Coach</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full px-4 py-2 bg-pink-600 text-white font-medium rounded-lg shadow-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition duration-200"
                                        disabled={isAdding || !email}
                                    >
                                        {isAdding ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Adding...
                                            </span>
                                        ) : 'Add Member'}
                                    </button>

                                    {addSuccess && (
                                        <div className="mt-3 p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-400">
                                            Member added successfully!
                                        </div>
                                    )}

                                    {addError && (
                                        <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400">
                                            {addError}
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamPage;