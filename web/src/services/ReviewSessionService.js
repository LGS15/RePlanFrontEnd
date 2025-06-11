import axios from 'axios';

const API_URL = 'http://localhost:8080';

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

export const createReviewSession = async (sessionData) => {
    try {
        const headers = getAuthHeader();
        console.log('Creating review session with token:', headers.Authorization ? 'Token present' : 'No token');

        const response = await axios.post(`${API_URL}/review-sessions`, sessionData, {
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating review session:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};

export const joinReviewSession = async (sessionId) => {
    try {
        const headers = getAuthHeader();
        console.log('Joining review session with token:', headers.Authorization ? 'Token present' : 'No token');

        const response = await axios.post(`${API_URL}/review-sessions/join`,
            { sessionId },
            {
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error joining review session:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};

export const leaveReviewSession = async (sessionId) => {
    try {
        const headers = getAuthHeader();
        console.log('Leaving review session with token:', headers.Authorization ? 'Token present' : 'No token');

        const response = await axios.post(`${API_URL}/review-sessions/leave`,
            { sessionId },
            {
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error leaving review session:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};

export const endReviewSession = async (sessionId) => {
    try {
        const headers = getAuthHeader();
        console.log('Ending review session with token:', headers.Authorization ? 'Token present' : 'No token');

        const response = await axios.post(`${API_URL}/review-sessions/end`,
            { sessionId },
            {
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error ending review session:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};

export const getActiveSessionsByTeam = async (teamId) => {
    try {
        const headers = getAuthHeader();
        console.log('Fetching active sessions with token:', headers.Authorization ? 'Token present' : 'No token');

        const response = await axios.get(`${API_URL}/review-sessions/team/${teamId}/active`, {
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching active sessions:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};

export const getSessionById = async (sessionId) => {
    try {
        const headers = getAuthHeader();
        console.log('Fetching session by ID with token:', headers.Authorization ? 'Token present' : 'No token');

        const response = await axios.get(`${API_URL}/review-sessions/${sessionId}`, {
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching session by ID:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};