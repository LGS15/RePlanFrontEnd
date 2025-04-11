import axios from 'axios';

const API_URL = 'http://localhost:8080';

export const addTeamMember = async (teamId, memberData) => {
    try {
        const response = await axios.post(`${API_URL}/teams/${teamId}/members`, memberData);
        return response.data;
    } catch (error) {
        console.error('Error adding team member:', error);
        throw error;
    }
};

export const getTeamsByOwner = async (ownerId) => {
    try {
        const response = await axios.get(`${API_URL}/teams/owner/${ownerId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching teams by owner:', error);
        throw error;
    }
};

export const createTeam = async (teamData) => {
    try {
        const response = await axios.post(`${API_URL}/teams`, teamData);
        return response.data;
    } catch (error) {
        console.error('Error creating team:', error);
        throw error;
    }
};