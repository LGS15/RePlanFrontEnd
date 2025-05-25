import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CreateTeamForm from '../components/CreateTeamForm.jsx';
import OwnedTeamsList from '../components/OwnedTeamsList.jsx';

const TeamManagementPage = () => {
    const [activeTab, setActiveTab] = useState('create');
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-500">
                            Team Management
                        </h1>
                        <p className="text-gray-400 mt-2">Create and manage your Esports teams</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 border-b border-gray-800">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('create')}
                            data-tab="create"
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'create'
                                    ? 'border-pink-500 text-pink-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                            }`}
                        >
                            Create Team
                        </button>
                        <button
                            onClick={() => setActiveTab('manage')}
                            data-tab="manage"
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'manage'
                                    ? 'border-pink-500 text-pink-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                            }`}
                        >
                            Manage Teams
                        </button>
                    </nav>
                </div>

                {/* Content Area */}
                <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-lg overflow-hidden">
                    {activeTab === 'create' && <CreateTeamForm />}
                    {activeTab === 'manage' && <OwnedTeamsList />}
                </div>
            </div>
        </div>
    );
};

export default TeamManagementPage;