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
    const [participants, setParticipants] = useState([]);
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [isAddingNote, setIsAddingNote] = useState(false);

    // Video state
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const initializeSession = async () => {
            try {
                const sessionData = await getSessionById(sessionId);
                setSession(sessionData);

                await webSocketService.connect();
                setIsConnected(true);

                webSocketService.subscribeToSession(sessionId, handleWebSocketMessage);

                webSocketService.requestSync(sessionId);

            } catch (err) {
                console.error('Error initializing session:', err);
                setError(err.response?.data?.message || 'Error loading session');
            } finally {
                setIsLoading(false);
            }
        };

        initializeSession();

        return () => {
            webSocketService.unsubscribeFromSession(sessionId);
            webSocketService.disconnect();
        };
    }, [sessionId]);

    const handleWebSocketMessage = (message) => {
        console.log('Received WebSocket message:', message);

        switch (message.type) {
            case 'PLAY':
                if (playerRef.current && message.userId !== currentUser?.userId) {
                    playerRef.current.seekTo(message.payload.timestamp / 1000);
                    setTimeout(() => playerRef.current.play(), 100);
                    setIsPlaying(true);
                    setCurrentTime(message.payload.timestamp / 1000);
                }
                break;

            case 'PAUSE':
                if (playerRef.current && message.userId !== currentUser?.userId) {
                    playerRef.current.seekTo(message.payload.timestamp / 1000);
                    setTimeout(() => playerRef.current.pause(), 100);
                    setIsPlaying(false);
                    setCurrentTime(message.payload.timestamp / 1000);
                }
                break;

            case 'SEEK':
                if (playerRef.current && message.userId !== currentUser?.userId) {
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
                setNotes(prev => [...prev, {
                    id: message.payload.noteId || Date.now(),
                    content: message.payload.content,
                    timestamp: message.payload.videoTimestamp,
                    author: message.payload.authorName || message.username,
                    createdAt: new Date(message.timestamp)
                }]);
                break;

            case 'SYNC_RESPONSE':
                if (playerRef.current) {
                    playerRef.current.seekTo(message.payload.timestamp / 1000);
                    setCurrentTime(message.payload.timestamp / 1000);

                    setTimeout(() => {
                        if (message.payload.isPlaying) {
                            playerRef.current.play();
                            setIsPlaying(true);
                        } else {
                            playerRef.current.pause();
                            setIsPlaying(false);
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
                console.log('Unknown message type:', message.type);
        }
    };

    const handlePlay = () => {
        if (playerRef.current && isConnected) {
            const timestamp = Math.floor(playerRef.current.getCurrentTime() * 1000);
            webSocketService.sendPlay(sessionId, timestamp);
            playerRef.current.play();
            setIsPlaying(true);
        }
    };

    const handlePause = () => {
        if (playerRef.current && isConnected) {
            const timestamp = Math.floor(playerRef.current.getCurrentTime() * 1000);
            webSocketService.sendPause(sessionId, timestamp);
            playerRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleSeek = (e) => {
        if (playerRef.current && isConnected) {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            const newTime = pos * duration;
            const timestamp = Math.floor(newTime * 1000);

            playerRef.current.seekTo(newTime);
            setCurrentTime(newTime);

            webSocketService.sendSeek(sessionId, timestamp, isPlaying);
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
                        <button
                            onClick={handleLeaveSession}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            Leave Session
                        </button>
                    </div>
                </div>

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
                                            className="flex items-center justify-center w-10 h-10 bg-pink-600 rounded-full hover:bg-pink-700 transition"
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
                                        Synchronized YouTube playback
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
                                                className="px-3 py-1 bg-pink-600 text-white text-sm rounded hover:bg-pink-700 transition"
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
                                        className="w-full px-3 py-2 bg-gray-700 text-gray-300 text-sm rounded hover:bg-gray-600 transition"
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