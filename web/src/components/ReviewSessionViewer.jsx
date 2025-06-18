import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessionById, leaveReviewSession } from '../services/ReviewSessionService.js';
import webSocketService from '../services/WebSocketService.js';
import YouTubePlayer from '../components/YouTubePlayer.jsx';
import { useAuth } from '../contexts/AuthContext';

const ReviewSessionViewer = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const playerRef = useRef(null);
    const [session, setSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [isAddingNote, setIsAddingNote] = useState(false);

    // Video state
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        let isComponentMounted = true;
        let hasInitialized = false;

        const initializeSession = async () => {
            if (hasInitialized) {
                console.log('Session already initialized, skipping...');
                return;
            }
            hasInitialized = true;

            try {
                console.log('🚀 Initializing session:', sessionId);

                // First, get session data
                const sessionData = await getSessionById(sessionId);

                if (!isComponentMounted) return;

                setSession(sessionData);
                console.log(' Session data loaded:', sessionData);

                // Connect to WebSocket with longer delay for stability
                setTimeout(async () => {
                    if (isComponentMounted) {
                        await connectToWebSocket();
                    }
                }, 1000); // Increased delay

            } catch (err) {
                console.error('❌ Error initializing session:', err);
                if (isComponentMounted) {
                    setError(err.response?.data?.message || err.message || 'Error loading session');
                }
            } finally {
                if (isComponentMounted) {
                    setIsLoading(false);
                }
            }
        };

        // Only initialize if we haven't done so already
        if (!hasInitialized) {
            initializeSession();
        }

        // Cleanup function
        return () => {
            isComponentMounted = false;
            console.log('🧹 Cleaning up session viewer...');

            // Only unsubscribe, don't disconnect (let other instances use the connection)
            if (sessionId) {
                webSocketService.unsubscribeFromSession(sessionId);
            }

            // Only disconnect if no other subscriptions exist
            setTimeout(() => {
                if (webSocketService.subscriptions.size === 0) {
                    console.log('No active subscriptions, disconnecting...');
                    webSocketService.disconnect();
                }
            }, 500);
        };
    }, [sessionId]);

    const connectToWebSocket = async () => {
        try {
            console.log('🔌 Connecting to WebSocket...');
            setConnectionError(null);

            // Check if already connected
            if (webSocketService.isConnected()) {
                console.log(' WebSocket already connected, subscribing...');
                await subscribeToSession();
                return;
            }

            // Connect with timeout
            const connectionPromise = webSocketService.connect();
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Connection timeout')), 10000)
            );

            await Promise.race([connectionPromise, timeoutPromise]);
            console.log(' WebSocket connected successfully');

            // Wait for connection to stabilize
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Subscribe to session messages
            if (webSocketService.isConnected()) {
                await subscribeToSession();
            } else {
                throw new Error('Connection lost after connecting');
            }

        } catch (err) {
            console.error('❌ WebSocket connection failed:', err);
            setConnectionError(err.message);
            setIsConnected(false);

            // Retry with exponential backoff (only once)
            if (!err.message.includes('timeout')) {
                setTimeout(() => {
                    console.log('🔄 Retrying WebSocket connection...');
                    connectToWebSocket();
                }, 5000);
            }
        }
    };

    const subscribeToSession = async () => {
        try {
            const subscription = webSocketService.subscribeToSession(sessionId, handleWebSocketMessage);

            if (subscription) {
                setIsConnected(true);
                console.log('📡 Successfully subscribed to session messages');

                // Request sync after subscription is confirmed
                setTimeout(() => {
                    if (webSocketService.isConnected()) {
                        console.log('🔄 Requesting initial sync...');
                        webSocketService.requestSync(sessionId);
                    }
                }, 1000); // Reduced delay
            } else {
                throw new Error('Failed to subscribe to session');
            }
        } catch (err) {
            console.error('❌ Failed to subscribe to session:', err);
            setConnectionError(err.message);
            throw err;
        }
    };

    // FIXED MESSAGE HANDLER - REPLACE YOUR EXISTING ONE
    const handleWebSocketMessage = (message) => {
        console.log('📨 Processing WebSocket message:', message);

        switch (message.type) {
            case 'PLAY':
                // Remove user filtering - all users should sync to the same state
                if (playerRef.current) {
                    console.log('▶️ Applying PLAY command');
                    playerRef.current.seekTo(message.payload.timestamp / 1000);
                    setTimeout(() => {
                        playerRef.current.play();
                        setIsPlaying(true);
                        setCurrentTime(message.payload.timestamp / 1000);
                    }, 100);
                }
                break;

            case 'PAUSE':
                if (playerRef.current) {
                    console.log('⏸️ Applying PAUSE command');
                    playerRef.current.seekTo(message.payload.timestamp / 1000);
                    setTimeout(() => {
                        playerRef.current.pause();
                        setIsPlaying(false);
                        setCurrentTime(message.payload.timestamp / 1000);
                    }, 100);
                }
                break;

            case 'SEEK':
                if (playerRef.current) {
                    console.log('⏭️ Applying SEEK command');
                    playerRef.current.seekTo(message.payload.timestamp / 1000);
                    setCurrentTime(message.payload.timestamp / 1000);

                    setTimeout(() => {
                        if (message.payload.isPlaying && !playerRef.current.isPlaying()) {
                            playerRef.current.play();
                            setIsPlaying(true);
                        } else if (!message.payload.isPlaying && playerRef.current.isPlaying()) {
                            playerRef.current.pause();
                            setIsPlaying(false);
                        }
                    }, 100);
                }
                break;

            case 'NOTE_ADDED':
                // Notes should still filter out current user to avoid duplicates
                { const isFromCurrentUser = message.userId === currentUser?.userId;
                if (!isFromCurrentUser) {
                    setNotes(prev => [...prev, {
                        id: message.payload.noteId || Date.now(),
                        content: message.payload.content,
                        timestamp: message.payload.videoTimestamp,
                        author: message.payload.authorName || message.username,
                        createdAt: new Date(message.timestamp)
                    }]);
                }
                break; }

            case 'SYNC_RESPONSE':
                if (playerRef.current) {
                    console.log('🔄 Applying SYNC response:', message.payload);
                    const syncTime = message.payload.timestamp / 1000;
                    const syncPlaying = message.payload.isPlaying;

                    // Always apply the sync response when it's received
                    // This ensures initial sync works properly
                    console.log('📊 Sync details:', {
                        currentTime: currentTime,
                        syncTime: syncTime,
                        currentPlaying: isPlaying,
                        syncPlaying: syncPlaying,
                        shouldSync: true // Always sync on SYNC_RESPONSE
                    });

                    // Apply the synchronized state
                    playerRef.current.seekTo(syncTime);
                    setCurrentTime(syncTime);

                    setTimeout(() => {
                        if (syncPlaying && !playerRef.current.isPlaying()) {
                            console.log('▶️ Starting playback from sync');
                            playerRef.current.play();
                            setIsPlaying(true);
                        } else if (!syncPlaying && playerRef.current.isPlaying()) {
                            console.log('⏸️ Pausing playback from sync');
                            playerRef.current.pause();
                            setIsPlaying(false);
                        } else {
                            console.log('✅ Playback state already matches sync');
                            setIsPlaying(syncPlaying);
                        }
                    }, 100);
                }
                break;

            case 'USER_JOINED':
                setParticipants(prev => [...prev, {
                    userId: message.userId,
                    username: message.username
                }]);
                break;

            case 'USER_LEFT':
                setParticipants(prev =>
                    prev.filter(p => p.userId !== message.userId)
                );
                break;

            default:
                console.log('❓ Unknown message type:', message.type);
        }
    };

    const handlePlay = () => {
        if (playerRef.current && isConnected) {
            const timestamp = Math.floor(playerRef.current.getCurrentTime() * 1000);
            console.log('▶️ Sending PLAY command:', { sessionId, timestamp });

            // Apply action locally immediately for responsiveness
            playerRef.current.play();
            setIsPlaying(true);

            // Send to other users via WebSocket
            webSocketService.sendPlay(sessionId, timestamp);
        } else {
            console.warn('Cannot play: player or WebSocket not ready');
        }
    };

    const handlePause = () => {
        if (playerRef.current && isConnected) {
            const timestamp = Math.floor(playerRef.current.getCurrentTime() * 1000);
            console.log('⏸️ Sending PAUSE command:', { sessionId, timestamp });

            // Apply action locally immediately for responsiveness
            playerRef.current.pause();
            setIsPlaying(false);

            // Send to other users via WebSocket
            webSocketService.sendPause(sessionId, timestamp);
        } else {
            console.warn('Cannot pause: player or WebSocket not ready');
        }
    };

    const handleSeek = (e) => {
        if (playerRef.current && isConnected) {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            const newTime = pos * duration;
            const timestamp = Math.floor(newTime * 1000);

            console.log('⏭️ Sending SEEK command:', { sessionId, timestamp, isPlaying });

            // Apply action locally immediately for responsiveness
            playerRef.current.seekTo(newTime);
            setCurrentTime(newTime);

            // Send to other users via WebSocket
            webSocketService.sendSeek(sessionId, timestamp, isPlaying);
        } else {
            console.warn('Cannot seek: player or WebSocket not ready');
        }
    };

    const handleAddNote = () => {
        if (newNote.trim() && playerRef.current && isConnected) {
            const noteData = {
                noteId: Date.now().toString(),
                content: newNote.trim(),
                videoTimestamp: Math.floor(playerRef.current.getCurrentTime() * 1000)
            };

            webSocketService.sendNote(sessionId, noteData);
            setNotes(prev => [
                ...prev,
                {
                    id: noteData.noteId,
                    content: noteData.content,
                    timestamp: noteData.videoTimestamp,
                    author: currentUser?.username || 'You',
                    createdAt: new Date()
                }
            ]);
            setNewNote('');
            setIsAddingNote(false);
        }
    };

    const handleLeaveSession = async () => {
        if (confirm('Are you sure you want to leave this session?')) {
            try {
                await leaveReviewSession(sessionId);
                navigate(-1);
            } catch (err) {
                console.error('Error leaving session:', err);
            }
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const retryConnection = () => {
        setConnectionError(null);
        connectToWebSocket();
    };

    // KEEP ALL YOUR EXISTING JSX RETURN BELOW - NO CHANGES NEEDED
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-pink-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p>Loading session...</p>
                </div>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Error Loading Session</h2>
                    <p className="text-gray-400 mb-4">{error || 'Session not found'}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto p-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">{session.title}</h1>
                        <div className="flex items-center space-x-4 mt-2">
                            <p className="text-gray-400">{session.description}</p>
                            <span className="px-2 py-1 rounded-full text-xs bg-red-600/70 text-red-100">
                                YouTube
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className={`px-3 py-1 rounded-full text-sm ${
                            isConnected ? 'bg-green-600/70 text-green-100' : 'bg-red-600/70 text-red-100'
                        }`}>
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </div>
                        {connectionError && (
                            <button
                                onClick={retryConnection}
                                className="px-3 py-1 rounded-full text-sm bg-yellow-600/70 text-yellow-100 hover:bg-yellow-700/70 transition"
                            >
                                Retry Connection
                            </button>
                        )}
                        <button
                            onClick={handleLeaveSession}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            Leave Session
                        </button>
                    </div>
                </div>

                {/* Connection Error Banner */}
                {connectionError && (
                    <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span>WebSocket connection failed: {connectionError}</span>
                            </div>
                            <button
                                onClick={retryConnection}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Video Player */}
                    <div className="lg:col-span-3">
                        <div className="bg-gray-800 rounded-lg overflow-hidden">
                            <YouTubePlayer
                                ref={playerRef}
                                videoUrl={session.videoUrl}
                                onTimeUpdate={setCurrentTime}
                                onDurationChange={setDuration}
                                className="w-full"
                            />

                            {/* Video Controls */}
                            <div className="p-4 space-y-4">
                                {/* Progress Bar */}
                                <div
                                    className="w-full h-2 bg-gray-700 rounded-full cursor-pointer"
                                    onClick={handleSeek}
                                >
                                    <div
                                        className="h-full bg-pink-500 rounded-full transition-all duration-100"
                                        style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                                    />
                                </div>

                                {/* Control Buttons */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={isPlaying ? handlePause : handlePlay}
                                            disabled={!isConnected}
                                            className="flex items-center justify-center w-10 h-10 bg-pink-600 rounded-full hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isPlaying ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                        <span className="text-sm">
                                            {formatTime(currentTime)} / {formatTime(duration)}
                                        </span>
                                    </div>

                                    <div className="text-sm text-gray-400">
                                        {isConnected ? 'Synchronized playback' : 'Not synchronized'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Participants */}
                        <div className="bg-gray-800 rounded-lg p-4">
                            <h3 className="font-semibold mb-3">Participants ({session.activeParticipants || 0})</h3>
                            <div className="space-y-2">
                                {participants.map((participant) => (
                                    <div key={participant.userId} className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm">{participant.username}</span>
                                    </div>
                                ))}
                                {participants.length === 0 && (
                                    <p className="text-gray-400 text-sm">No other participants visible</p>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="bg-gray-800 rounded-lg p-4">
                            <h3 className="font-semibold mb-3">Notes</h3>

                            {/* Add Note */}
                            <div className="mb-4">
                                {isAddingNote ? (
                                    <div className="space-y-2">
                                        <textarea
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            placeholder="Add a note at current timestamp..."
                                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-sm resize-none"
                                            rows={3}
                                        />
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={handleAddNote}
                                                disabled={!isConnected}
                                                className="px-3 py-1 bg-pink-600 text-white text-sm rounded hover:bg-pink-700 transition disabled:opacity-50"
                                            >
                                                Add
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsAddingNote(false);
                                                    setNewNote('');
                                                }}
                                                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsAddingNote(true)}
                                        disabled={!isConnected}
                                        className="w-full px-3 py-2 bg-gray-700 text-gray-300 text-sm rounded hover:bg-gray-600 transition disabled:opacity-50"
                                    >
                                        + Add Note
                                    </button>
                                )}
                            </div>

                            {/* Notes List */}
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {notes.map((note) => (
                                    <div key={note.id} className="bg-gray-700 p-3 rounded text-sm">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-medium text-pink-400">{note.author}</span>
                                            <span className="text-xs text-gray-400">
                                                {formatTime(note.timestamp / 1000)}
                                            </span>
                                        </div>
                                        <p className="text-gray-300">{note.content}</p>
                                    </div>
                                ))}
                                {notes.length === 0 && (
                                    <p className="text-gray-400 text-sm text-center py-4">
                                        No notes yet. Add the first one!
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewSessionViewer;