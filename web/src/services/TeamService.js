import axios from 'axios';

const API_URL = 'http://localhost:8080';

// Helper function to get auth header
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.warn('No token found in localStorage');
        return {};
    }

    return {
        'Authorization': `Bearer ${token}`
    };
};

export const createTeam = async (teamData) => {
    try {
        const headers = getAuthHeader();
        console.log('Creating team with token:', headers.Authorization ? 'Token present' : 'No token');

        const response = await axios.post(`${API_URL}/teams`, teamData, {
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating team:', error);

        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};

export const deleteTeam = async (teamId) => {
    try {
        const headers = getAuthHeader();
        console.log('Deleting team with token:', headers.Authorization ? 'Token present' : 'No token');

        const response = await axios.delete(`${API_URL}/teams/${teamId}`, {
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting team:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};

export const getTeamsByOwner = async (ownerId) => {
    try {
        // Make sure we have fresh headers for each request
        const headers = getAuthHeader();
        console.log('Fetching teams with auth header:', headers.Authorization ? 'Token present' : 'No token');

        const response = await axios.get(`${API_URL}/teams/owner/${ownerId}`, {
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching teams by owner:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};

export const getTeamsByUser = async (userId) => {
    try {
        const headers = getAuthHeader();
        console.log('Fetching teams by user with auth header:', headers.Authorization ? 'Token present' : 'No token');

        const response = await axios.get(`${API_URL}/teams/user/${userId}`, {
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching teams by user:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};

export const addTeamMember = async (teamId, memberData) => {
    try {
        const headers = getAuthHeader();

        const response = await axios.post(`${API_URL}/teams/${teamId}/members`, memberData, {
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error adding team member:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};

export const removeTeamMember = async (teamId, userId) => {
    try {
        const headers = getAuthHeader();

        const response = await axios.delete(`${API_URL}/teams/${teamId}/members/${userId}`, {
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error removing team member:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};

export const getTeamMembers = async (teamId) => {
    try {
        const headers = getAuthHeader();

        const response = await axios.get(`${API_URL}/teams/${teamId}/members`, {
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching team members:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};