import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createReviewSession } from '../services/ReviewSessionService.js';
import { useAuth } from '../contexts/AuthContext';

const CreateReviewSessionForm = ({ teamId, onSessionCreated }) => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [formData, setFormData] = useState({
        videoUrl: '',
        title: '',
        description: ''
    });
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Validate YouTube URL
    const validateYouTubeUrl = (url) => {
        if (!url) return false;

        const youtubePatterns = [
            /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /^https?:\/\/(www\.)?youtube\.com\/watch\?.*v=([^&\n?#]+)/
        ];

        return youtubePatterns.some(pattern => pattern.test(url));
    };

    // Extract video ID for preview
    const extractVideoId = (url) => {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/watch\?.*v=([^&\n?#]+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            // Validation
            if (!formData.videoUrl.trim()) {
                throw new Error('YouTube URL is required');
            }

            if (!validateYouTubeUrl(formData.videoUrl)) {
                throw new Error('Please enter a valid YouTube URL (youtube.com or youtu.be)');
            }

            if (!formData.title.trim()) {
                throw new Error('Title is required');
            }

            if (formData.title.length > 200) {
                throw new Error('Title must be less than 200 characters');
            }

            if (formData.description.length > 1000) {
                throw new Error('Description must be less than 1000 characters');
            }

            const sessionData = {
                teamId: teamId,
                videoUrl: formData.videoUrl.trim(),
                title: formData.title.trim(),
                description: formData.description.trim() || null
            };

            const createdSession = await createReviewSession(sessionData);
            setResult(createdSession);

            // Reset form
            setFormData({
                videoUrl: '',
                title: '',
                description: ''
            });

            // Callback to parent component if provided
            if (onSessionCreated) {
                onSessionCreated(createdSession);
            }

        } catch (err) {
            console.error('Error creating review session:', err);
            const errorMessage = err.response?.data?.message ||
                err.message ||
                'Failed to create review session. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const videoId = formData.videoUrl ? extractVideoId(formData.videoUrl) : null;
    const isValidUrl = formData.videoUrl ? validateYouTubeUrl(formData.videoUrl) : false;

    return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-6">Create Review Session</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* YouTube URL Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        YouTube URL *
                    </label>
                    <input
                        type="url"
                        name="videoUrl"
                        value={formData.videoUrl}
                        onChange={handleInputChange}
                        className={`w-full bg-gray-700 border rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200 ${
                            formData.videoUrl && !isValidUrl
                                ? 'border-red-500'
                                : 'border-gray-600'
                        }`}
                        placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                        required
                    />

                    {/* URL Validation Feedback */}
                    {formData.videoUrl && (
                        <div className="mt-2">
                            {isValidUrl ? (
                                <div className="flex items-center text-green-400 text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Valid YouTube URL {videoId && `(ID: ${videoId})`}
                                </div>
                            ) : (
                                <div className="flex items-center text-red-400 text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Please enter a valid YouTube URL
                                </div>
                            )}
                        </div>
                    )}

                    <p className="text-xs text-gray-400 mt-2">
                        Supported formats: youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...
                    </p>

                    {/* Video Preview */}
                    {isValidUrl && videoId && (
                        <div className="mt-4">
                            <p className="text-sm text-gray-300 mb-2">Preview:</p>
                            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                                <img
                                    src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                    alt="Video thumbnail"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Title Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Session Title *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        maxLength={200}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200"
                        placeholder="e.g., Match vs Team Alpha - Round 1"
                        required
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        {formData.title.length}/200 characters
                    </p>
                </div>

                {/* Description Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description (Optional)
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        maxLength={1000}
                        rows={4}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200 resize-vertical"
                        placeholder="Add notes about what to focus on during this review session..."
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        {formData.description.length}/1000 characters
                    </p>
                </div>

                {/* Creator Information */}
                <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                    <div className="flex items-center space-x-3">
                        <div className="bg-red-600/20 p-2 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-300">
                                <span className="font-medium">Session Host:</span> {currentUser?.username || 'Loading...'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                YouTube video • Synchronized playback • Real-time notes
                            </p>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div>
                    <button
                        type="submit"
                        disabled={isLoading || !isValidUrl}
                        className={`w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white font-medium rounded-lg shadow-lg hover:from-pink-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition duration-200 ${
                            isLoading || !isValidUrl ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating Session...
                            </span>
                        ) : 'Create Review Session'}
                    </button>
                </div>
            </form>

            {/* Success Message */}
            {result && (
                <div className="mt-6 p-4 bg-green-900/30 border border-green-700 rounded-lg text-green-400 animate-fade-in">
                    <div className="flex">
                        <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="font-medium">Review session created successfully!</p>
                            <p className="text-sm mt-1">Session ID: {result.sessionId}</p>
                            <p className="text-sm">Title: {result.title}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mt-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400 animate-fade-in">
                    <div className="flex">
                        <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="font-medium">Error creating session</p>
                            <p className="text-sm mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateReviewSessionForm;