import React, { useState, useEffect, useRef } from 'react';

const YouTubePlayer = ({
                           videoUrl,
                           onTimeUpdate,
                           onDurationChange,
                           onPlay,
                           onPause,
                           onSeek,
                           className = ""
                       }) => {
    const [isReady, setIsReady] = useState(false);
    const [videoId, setVideoId] = useState(null);
    const [error, setError] = useState(null);
    const youtubePlayerRef = useRef(null);
    const containerRef = useRef(null);

    // Extract YouTube video ID from various YouTube URL formats
    const extractYouTubeVideoId = (url) => {
        if (!url) return null;

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

    // Load YouTube API
    const loadYouTubeAPI = () => {
        return new Promise((resolve, reject) => {
            // Check if API is already loaded
            if (window.YT && window.YT.Player) {
                resolve();
                return;
            }

            // Check if script is already loading
            if (window.YTAPILoading) {
                // Wait for the existing load to complete
                const checkAPI = setInterval(() => {
                    if (window.YT && window.YT.Player) {
                        clearInterval(checkAPI);
                        resolve();
                    }
                }, 100);
                return;
            }

            window.YTAPILoading = true;

            // Create script tag
            const script = document.createElement('script');
            script.src = 'https://www.youtube.com/iframe_api';
            script.async = true;
            script.onload = () => {
                // API is loaded but not necessarily ready
            };
            script.onerror = () => {
                window.YTAPILoading = false;
                reject(new Error('Failed to load YouTube API'));
            };
            document.head.appendChild(script);

            // YouTube API ready callback
            window.onYouTubeIframeAPIReady = () => {
                window.YTAPILoading = false;
                resolve();
            };
        });
    };

    // Initialize YouTube player
    useEffect(() => {
        const initializePlayer = async () => {
            try {
                const extractedVideoId = extractYouTubeVideoId(videoUrl);

                if (!extractedVideoId) {
                    setError('Invalid YouTube URL. Please provide a valid YouTube video link.');
                    return;
                }

                setVideoId(extractedVideoId);
                setError(null);

                // Load YouTube API
                await loadYouTubeAPI();

                // Initialize player
                if (containerRef.current) {
                    initializeYouTubePlayer(extractedVideoId);
                }

            } catch (err) {
                console.error('Error initializing YouTube player:', err);
                setError('Failed to load YouTube player. Please try again.');
            }
        };

        if (videoUrl) {
            initializePlayer();
        }

        return () => {
            if (youtubePlayerRef.current) {
                try {
                    youtubePlayerRef.current.destroy();
                    youtubePlayerRef.current = null;
                } catch (e) {
                    console.log('Error destroying YouTube player:', e);
                }
            }
        };
    }, [videoUrl]);

    const initializeYouTubePlayer = (videoId) => {
        if (!window.YT || !containerRef.current) return;

        try {
            // Clear any existing content
            containerRef.current.innerHTML = '';

            youtubePlayerRef.current = new window.YT.Player(containerRef.current, {
                videoId: videoId,
                width: '100%',
                height: '100%',
                playerVars: {
                    controls: 0,      // Hide YouTube controls (we'll use custom ones)
                    disablekb: 1,     // Disable keyboard controls
                    fs: 0,            // Hide fullscreen button
                    modestbranding: 1, // Minimal YouTube branding
                    rel: 0,           // Don't show related videos
                    iv_load_policy: 3, // Hide annotations
                    cc_load_policy: 0, // Hide captions by default
                    playsinline: 1,   // Play inline on mobile
                    origin: window.location.origin // Required for iframe API
                },
                events: {
                    onReady: (event) => {
                        console.log('YouTube player ready');
                        setIsReady(true);
                        setError(null);

                        const duration = event.target.getDuration();
                        if (onDurationChange) onDurationChange(duration);
                    },
                    onStateChange: (event) => {
                        const isCurrentlyPlaying = event.data === window.YT.PlayerState.PLAYING;

                        if (isCurrentlyPlaying && onPlay) {
                            onPlay();
                        } else if (event.data === window.YT.PlayerState.PAUSED && onPause) {
                            onPause();
                        }
                    },
                    onError: (event) => {
                        console.error('YouTube player error:', event.data);
                        let errorMessage = 'Error loading video. ';

                        switch (event.data) {
                            case 2:
                                errorMessage += 'Invalid video ID.';
                                break;
                            case 5:
                                errorMessage += 'HTML5 player error.';
                                break;
                            case 100:
                                errorMessage += 'Video not found or private.';
                                break;
                            case 101:
                            case 150:
                                errorMessage += 'Video cannot be embedded.';
                                break;
                            default:
                                errorMessage += 'Please try again.';
                        }

                        setError(errorMessage);
                        setIsReady(false);
                    }
                }
            });

            // Start time update interval
            const interval = setInterval(() => {
                if (youtubePlayerRef.current && youtubePlayerRef.current.getCurrentTime && isReady) {
                    try {
                        const time = youtubePlayerRef.current.getCurrentTime();
                        if (onTimeUpdate) onTimeUpdate(time);
                    } catch (e) {
                        // Player might not be ready yet
                    }
                }
            }, 100);

            return () => clearInterval(interval);
        } catch (error) {
            console.error('Error initializing YouTube player:', error);
            setError('Failed to initialize video player.');
        }
    };

    // Expose player control methods
    useEffect(() => {
        if (containerRef.current && youtubePlayerRef.current && isReady) {
            containerRef.current.play = () => {
                try {
                    youtubePlayerRef.current.playVideo();
                } catch (e) {
                    console.error('Error playing video:', e);
                }
            };

            containerRef.current.pause = () => {
                try {
                    youtubePlayerRef.current.pauseVideo();
                } catch (e) {
                    console.error('Error pausing video:', e);
                }
            };

            containerRef.current.seekTo = (time) => {
                try {
                    youtubePlayerRef.current.seekTo(time, true);
                    if (onSeek) onSeek(time);
                } catch (e) {
                    console.error('Error seeking video:', e);
                }
            };

            containerRef.current.getCurrentTime = () => {
                try {
                    return youtubePlayerRef.current.getCurrentTime() || 0;
                } catch (e) {
                    return 0;
                }
            };

            containerRef.current.getDuration = () => {
                try {
                    return youtubePlayerRef.current.getDuration() || 0;
                } catch (e) {
                    return 0;
                }
            };

            containerRef.current.isPlaying = () => {
                try {
                    return youtubePlayerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING;
                } catch (e) {
                    return false;
                }
            };
        }
    }, [isReady, onSeek]);

    if (!videoUrl) {
        return (
            <div className={`bg-gray-900 flex items-center justify-center aspect-video ${className}`}>
                <p className="text-gray-400">No YouTube URL provided</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-gray-900 flex items-center justify-center aspect-video ${className}`}>
                <div className="text-center p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-400 text-sm">{error}</p>
                    <p className="text-gray-400 text-xs mt-2">
                        Supported formats: youtube.com/watch?v=..., youtu.be/..., etc.
                    </p>
                </div>
            </div>
        );
    }

    if (!isReady) {
        return (
            <div className={`bg-gray-900 flex items-center justify-center aspect-video ${className}`}>
                <div className="text-center">
                    <svg className="animate-spin h-8 w-8 text-red-500 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-400 text-sm">Loading YouTube video...</p>
                    {videoId && (
                        <p className="text-gray-500 text-xs mt-1">Video ID: {videoId}</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            <div
                ref={containerRef}
                className="w-full aspect-video bg-black rounded-lg overflow-hidden"
            />
        </div>
    );
};

export default YouTubePlayer;