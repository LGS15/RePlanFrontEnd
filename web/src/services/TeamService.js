import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const axiosInstance = axios.create({
    baseURL : API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const createTeam = async (teamData) => {
    const response = await axiosInstance.post('/teams', teamData);
    return response.data;
}

export const addTeamMember = async (teamId, memberData) => {
    const response = await axiosInstance.post(`/teams/${teamId}/members`, memberData);
    return response.data;
}

export const getTeamsForOwner = async (ownerId) => {
    const response = await axiosInstance.get(`/teams/owner/${ownerId}`);
    return response.data;
}

