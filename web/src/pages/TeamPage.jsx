import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, Navigate } from 'react-router-dom';
import {addTeamMember, getTeamMembers, removeTeamMember} from '../services/TeamService.js';
import { useAuth } from '../contexts/AuthContext';
import CreateReviewSessionForm from '../components/CreateReviewSessionForm.jsx';
import ReviewSessionsList from '../components/ReviewSessionsList.jsx';

const TeamPage = () => {
    const { teamId } = useParams();
    const location = useLocation();
    const teamDataFromState = location.state?.teamData;
    const { currentUser } = useAuth();

    const [team] = useState(teamDataFromState || null);
    const [activeTab, setActiveTab] = useState('overview');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('PLAYER');
    const [isAdding, setIsAdding] = useState(false);
    const [addError, setAddError] = useState(null);
    const [addSuccess, setAddSuccess] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [removingMemberId, setRemovingMemberId] = useState(null);
    const [removeError, setRemoveError] = useState(null);
    const [removeSuccess, setRemoveSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [members, setMembers] = useState([]);
    const [refreshSessionsList, setRefreshSessionsList] = useState(null);

    useEffect(() => {
        if (team) {
            const fetchTeamMembers = async () => {
                try {
                    setIsLoading(true);
                    const response = await getTeamMembers(teamId);
                    setMembers(response.members || []);
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

            const newMember = {
                teamMemberId: result.teamMemberId,
                teamId,
                userId: result.userId,
                username: result.username,
                email: result.email,
                role
            };

            setMembers(prevMembers => [...prevMembers, newMember]);
            setAddSuccess(true);
            setEmail('');
            setRole('PLAYER');
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Error adding team member";
            setAddError(errorMessage);
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!confirm("Are you sure you want to remove this team member?")) {
            return;
        }

        setIsRemoving(true);
        setRemovingMemberId(userId);
        setRemoveSuccess(false);
        setRemoveError(null);

        try {
            await removeTeamMember(teamId, userId);
            setMembers(prevMembers => prevMembers.filter(member => member.userId !== userId));
            setRemoveSuccess(true);
            setTimeout(() => setRemoveSuccess(false), 3000);
        } catch (err) {
            setRemoveError(err.response?.data?.message || "Error removing team member");
            setTimeout(() => setRemoveError(null), 3000);
        } finally {
            setIsRemoving(false);
            setRemovingMemberId(null);
        }
    };

    const handleSessionCreated = (newSession) => {
        console.log('New session created:', newSession);
        if (refreshSessionsList) {
            refreshSessionsList();
        }
        setActiveTab('sessions');
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

    const isOwner = currentUser?.userId === team.ownerId;

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

                {/* Tabs */}
                <div className="mb-6 border-b border-gray-800">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'overview'
                                    ? 'border-pink-500 text-pink-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                            }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('members')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'members'
                                    ? 'border-pink-500 text-pink-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                            }`}
                        >
                            Members ({members.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('sessions')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'sessions'
                                    ? 'border-pink-500 text-pink-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                            }`}
                        >
                            Review Sessions
                        </button>
                        <button
                            onClick={() => setActiveTab('create-session')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'create-session'
                                    ? 'border-pink-500 text-pink-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                            }`}
                        >
                            Create Session
                        </button>
                    </nav>
                </div>

                {/* Status Messages */}
                {removeSuccess && (
                    <div className="mb-4 p-4 bg-green-900/30 border border-green-700 rounded-lg text-green-400 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Team member removed successfully!
                    </div>
                )}

                {removeError && (
                    <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {removeError}
                    </div>
                )}

                {/* Tab Content */}
                <div className="space-y-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Team Info Card */}
                            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                                <h3 className="text-lg font-semibold text-white mb-4">Team Information</h3>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="text-gray-400">Team ID:</span>
                                        <span className="ml-2 text-white font-mono text-xs">{team.teamId}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Game:</span>
                                        <span className="ml-2 text-white">{team.gameName}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Owner:</span>
                                        <span className="ml-2 text-white">{isOwner ? 'You' : team.ownerId}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Members:</span>
                                        <span className="ml-2 text-white">{members.length}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions Card */}
                            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setActiveTab('create-session')}
                                        className="w-full px-4 py-2 bg-pink-600 text-white text-sm rounded-lg hover:bg-pink-700 transition duration-200"
                                    >
                                        Create Review Session
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('sessions')}
                                        className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition duration-200"
                                    >
                                        View Active Sessions
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('members')}
                                        className="w-full px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition duration-200"
                                    >
                                        Manage Members
                                    </button>
                                </div>
                            </div>

                            {/* Recent Activity Card */}
                            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                                <div className="text-sm text-gray-400">
                                    <p>No recent activity to display.</p>
                                    <p className="mt-2">Create a review session to get started!</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Members Tab */}
                    {activeTab === 'members' && (
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
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            </div>
                                        ) : members && members.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-700">
                                                    <thead>
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Username</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                                                        {isOwner && (
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                                        )}
                                                    </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-700">
                                                    {members.map((member) => (
                                                        <tr key={member.teamMemberId}>
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                                                                {member.username || 'Unknown User'}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                                {member.email || 'No email'}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                                <span className={`px-2 py-1 rounded-full text-xs ${getRoleBadgeClass(member.role)}`}>
                                                                    {member.role}
                                                                </span>
                                                            </td>
                                                            {isOwner && (
                                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                                    {/* Owner check for remove button */}
                                                                    {member.role !== 'OWNER' && (
                                                                        <button
                                                                            onClick={() => handleRemoveMember(member.userId)}
                                                                            className="text-red-400 hover:text-red-300 focus:outline-none transition"
                                                                            disabled={isRemoving && removingMemberId === member.userId}
                                                                        >
                                                                            {isRemoving && removingMemberId === member.userId ? (
                                                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                                </svg>
                                                                            ) : (
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                                </svg>
                                                                            )}
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            )}
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
                                                <label className="block text-sm font-medium text-gray-300 mb-2">User Email</label>
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200"
                                                    placeholder="Enter user email"
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
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                    )}

                    {/* Review Sessions Tab */}
                    {activeTab === 'sessions' && (
                        <div>
                            <ReviewSessionsList
                                teamId={teamId}
                                team={team}
                                onRefresh={(refreshFn) => setRefreshSessionsList(() => refreshFn)}
                            />
                        </div>
                    )}

                    {/* Create Session Tab */}
                    {activeTab === 'create-session' && (
                        <div className="max-w-2xl">
                            <CreateReviewSessionForm
                                teamId={teamId}
                                onSessionCreated={handleSessionCreated}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeamPage;
