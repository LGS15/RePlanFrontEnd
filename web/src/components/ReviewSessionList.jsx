import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getActiveSessionsByTeam, joinReviewSession, endReviewSession } from '../services/ReviewSessionService.js';
import { useAuth } from '../contexts/AuthContext';

const ReviewSessionsList = ({ teamId, team, onRefresh }) => {
    const { currentUser } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [joiningSessionId, setJoiningSessionId] = useState(null);
    const [endingSessionId, setEndingSessionId] = useState(null);
    const [actionSuccess, setActionSuccess] = useState(null);

    const fetchActiveSessions = async () => {
        if (!teamId) return;

        setIsLoading(true);
        setError(null);

        try {
            const activeSessions = await getActiveSessionsByTeam(teamId);
            setSessions(activeSessions || []);
        } catch (err) {
            console.error('Error fetching active sessions:', err);
            setError(err.response?.data?.message || 'Error loading active sessions');
            setSessions([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveSessions();
    }, [teamId]);

    useEffect(() => {
        if (onRefresh) {
            onRefresh(() => fetchActiveSessions);
        }
    }, [onRefresh]);

    const handleJoinSession = async (sessionId) => {
        setJoiningSessionId(sessionId);
        setActionSuccess(null);

        try {
            const result = await joinReviewSession(sessionId);
            setActionSuccess(`Successfully joined session: ${result.message}`);

            await fetchActiveSessions();

            setTimeout(() => setActionSuccess(null), 3000);
        } catch (err) {
            console.error('Error joining session:', err);
            setError(err.response?.data?.message || 'Error joining session');
            setTimeout(() => setError(null), 3000);
        } finally {
            setJoiningSessionId(null);
        }
    };

    const handleEndSession = async (sessionId, sessionTitle) => {
        if (!confirm(`Are you sure you want to end the session "${sessionTitle}"? This action cannot be undone.`)) {
            return;
        }

        setEndingSessionId(sessionId);
        setActionSuccess(null);

        try {
            const result = await endReviewSession(sessionId);
            setActionSuccess(`Session ended: ${result.message}`);

            setSessions(prevSessions =>
                prevSessions.filter(session => session.sessionId !== sessionId)
            );

            setTimeout(() => setActionSuccess(null), 3000);
        } catch (err) {
            console.error('Error ending session:', err);
            setError(err.response?.data?.message || 'Error ending session');
            setTimeout(() => setError(null), 3000);
        } finally {
            setEndingSessionId(null);
        }
    };

    const formatVideoUrl = (url) => {
        if (url.length > 50) {
            return url.substring(0, 47) + '...';
        }
        return url;
    };

    const isOwner = currentUser?.userId === team?.ownerId;
    const canEndSession = (session) => {
        return isOwner || session.createdBy === currentUser?.userId;
    };

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Active Review Sessions</h3>
                <button
                    onClick={fetchActiveSessions}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded text-white flex items-center space-x-1 transition"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Refreshing...</span>
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Refresh</span>
                        </>
                    )}
                </button>
            </div>

            <div className="p-6">
                {/* Status Messages */}
                {actionSuccess && (
                    <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-400 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {actionSuccess}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                )}

                {/* Sessions List */}
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <svg className="animate-spin h-8 w-8 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : sessions.length > 0 ? (
                    <div className="space-y-4">
                        {sessions.map((session) => (
                            <div key={session.sessionId} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-pink-500/50 transition duration-200">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                    <div className="flex-1 mb-4 md:mb-0">
                                        <h4 className="text-lg font-semibold text-white mb-2">{session.title}</h4>

                                        {session.description && (
                                            <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                                                {session.description}
                                            </p>
                                        )}

                                        <div className="space-y-1 text-sm text-gray-400">
                                            <p>
                                                <span className="font-medium">Video:</span>
                                                <a
                                                    href={session.videoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ml-1 text-blue-400 hover:text-blue-300 transition"
                                                >
                                                    {formatVideoUrl(session.videoUrl)}
                                                </a>
                                            </p>
                                            <p>
                                                <span className="font-medium">Participants:</span> {session.activeParticipants || 0}
                                            </p>
                                            <p>
                                                <span className="font-medium">Status:</span>
                                                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                                                    session.status === 'ACTIVE'
                                                        ? 'bg-green-600/70 text-green-100'
                                                        : 'bg-gray-600/70 text-gray-100'
                                                }`}>
                                                    {session.status}
                                                </span>
                                            </p>
                                            {session.isPlaying !== undefined && (
                                                <p>
                                                    <span className="font-medium">Playback:</span>
                                                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                                                        session.isPlaying
                                                            ? 'bg-blue-600/70 text-blue-100'
                                                            : 'bg-yellow-600/70 text-yellow-100'
                                                    }`}>
                                                        {session.isPlaying ? 'Playing' : 'Paused'}
                                                    </span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col space-y-2 md:ml-4">
                                        {/* Join Session Button */}
                                        <button
                                            onClick={() => handleJoinSession(session.sessionId)}
                                            disabled={joiningSessionId === session.sessionId}
                                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {joiningSessionId === session.sessionId ? (
                                                <span className="flex items-center justify-center">
                                                    <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Joining...
                                                </span>
                                            ) : 'Join Session'}
                                        </button>

                                        {/* End Session Button */}
                                        {canEndSession(session) && (
                                            <button
                                                onClick={() => handleEndSession(session.sessionId, session.title)}
                                                disabled={endingSessionId === session.sessionId}
                                                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {endingSessionId === session.sessionId ? (
                                                    <span className="flex items-center justify-center">
                                                        <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Ending...
                                                    </span>
                                                ) : 'End Session'}
                                            </button>
                                        )}

                                        {/* View Details Link */}
                                        <Link
                                            to={`/review-session/${session.sessionId}`}
                                            className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-500 transition duration-200 text-center"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <svg className="mx-auto h-12 w-12 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                        <h3 className="text-lg font-medium text-white mb-2">No Active Sessions</h3>
                        <p className="text-sm">Create a new review session to get started with video analysis.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewSessionsList;