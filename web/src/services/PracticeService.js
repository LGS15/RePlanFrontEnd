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

/**
 * @param {Object} practiceRequest
 * @param {string} practiceRequest.practiceType
 * @param {Array} practiceRequest.focusAreas
 * @param {number} practiceRequest.availableHours
 * @param {string} practiceRequest.teamId
 * @returns {Promise<Object>}
 */
export const calculatePracticeAllocation = async (practiceRequest) => {
    try {
        const headers = getAuthHeader();
        console.log('Calculating practice allocation with token:', headers.Authorization ? 'Token present' : 'No token');

        const response = await axios.post(`${API_URL}/practice-calculator/calculate`, practiceRequest, {
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error calculating practice allocation:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};

/**
 * @returns {Promise<Array>}
 */
export const getAvailableFocuses = async () => {
    try {
        const headers = getAuthHeader();
        console.log('Fetching available focuses with token:', headers.Authorization ? 'Token present' : 'No token');

        const response = await axios.get(`${API_URL}/practice-calculator/focuses`, {
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching available focuses:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};

/**
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export const getCurrentUserPracticeHistory = async (limit = 10) => {
    try {
        const headers = getAuthHeader();
        console.log('Fetching current user practice history with token:', headers.Authorization ? 'Token present' : 'No token');

        const response = await axios.get(`${API_URL}/practice-calculator/history`, {
            params: { limit },
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching current user practice history:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};

/**
 * @param {string} userId
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export const getUserPracticeHistory = async (userId, limit = 10) => {
    try {
        const headers = getAuthHeader();
        console.log('Fetching user practice history with token:', headers.Authorization ? 'Token present' : 'No token');

        const response = await axios.get(`${API_URL}/practice-calculator/history/${userId}`, {
            params: { limit },
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user practice history:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};

/**
 * @param {string} teamId
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export const getTeamPracticeHistory = async (teamId, limit = 10) => {
    try {
        const headers = getAuthHeader();
        console.log('Fetching team practice history with token:', headers.Authorization ? 'Token present' : 'No token');

        const response = await axios.get(`${API_URL}/practice-calculator/team/${teamId}/history`, {
            params: { limit },
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching team practice history:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};

export const PRACTICE_FOCUS = {
    AIM_TRAINING: 'AIM_TRAINING',
    GAME_SENSE: 'GAME_SENSE',
    MOVEMENT_MECHANICS: 'MOVEMENT_MECHANICS',
    MAP_KNOWLEDGE: 'MAP_KNOWLEDGE',
    TEAM_COORDINATION: 'TEAM_COORDINATION',
    STRATEGY_REVIEW: 'STRATEGY_REVIEW',
    VOD_ANALYSIS: 'VOD_ANALYSIS',
    COMMUNICATION: 'COMMUNICATION',
    POST_PLANT_SCENARIOS: 'POST_PLANT_SCENARIOS',
    SITE_HOLDS: 'SITE_HOLDS'
};


export const PRACTICE_TYPE = {
    INDIVIDUAL: 'INDIVIDUAL',
    TEAM: 'TEAM'
};

/**
 * @param {Object} request
 * @returns {Object}
 */
export const validatePracticeRequest = (request) => {
    const errors = [];

    if (!request.availableHours || request.availableHours < 1 || request.availableHours > 50) {
        errors.push('Available hours must be between 1 and 50');
    }

    if (!request.focusAreas || !Array.isArray(request.focusAreas) || request.focusAreas.length === 0 || request.focusAreas.length > 3) {
        errors.push('Must provide 1-3 focus areas');
    }

    if (request.focusAreas && Array.isArray(request.focusAreas)) {
        const uniqueFocuses = new Set(request.focusAreas);
        if (uniqueFocuses.size !== request.focusAreas.length) {
            errors.push('Focus areas must be unique');
        }
    }

    if (!request.practiceType || !Object.values(PRACTICE_TYPE).includes(request.practiceType)) {
        errors.push('Invalid practice type. Must be INDIVIDUAL or TEAM');
    }

    if (request.teamId && request.teamId.trim() !== '') {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(request.teamId)) {
            errors.push('Invalid team ID format');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const getPopularCombinations = async () => {
    try {
        const headers = getAuthHeader();
        console.log('Fetching popular combinations with token:', headers.Authorization ? 'Token present' : 'No token');

        const response = await axios.get(`${API_URL}/practice-calculator/popular`, {
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching popular combinations:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};

/**
 * @param {number} hours -
 * @returns {string} Formatted duration string
 */
export const formatPracticeDuration = (hours) => {
    if (!hours || hours === 0) return '0 minutes';

    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);

    if (wholeHours === 0) {
        return `${minutes} minutes`;
    } else if (minutes === 0) {
        return `${wholeHours} hour${wholeHours > 1 ? 's' : ''}`;
    } else {
        return `${wholeHours}h ${minutes}m`;
    }
};