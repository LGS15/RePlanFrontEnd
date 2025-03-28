import React from 'react';
import CreateTeamForm from '../components/CreateTeamForm.jsx';

const TeamManagementPage = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Team Management</h1>
            <CreateTeamForm />

        </div>
    );
};

export default TeamManagementPage;