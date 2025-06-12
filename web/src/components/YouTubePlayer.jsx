import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';

const YouTubePlayer = React.forwardRef(({
                                            videoUrl,
                                            onTimeUpdate,
                                            onDurationChange,
                                            onPlay,
                                            onPause,
                                            onSeek,
                                            className = ""
                                        }, ref) => {
    const [isReady, setIsReady] = useState(false);
    const [videoId, setVideoId] = useState(null);
    const [error, setError] = useState(null);
    const youtubePlayerRef = useRef(null);
    const containerRef = useRef(null);

    // Expose player methods via ref
    useImperativeHandle(ref, () => ({
        play: () => {
            if (youtubePlayerRef.current) {
                youtubePlayerRef.current.playVideo();
            }
        },
        pause: () => {
            if (youtubePlayerRef.current) {
                youtubePlayerRef.current.pauseVideo();
            }
        },
        seekTo: (time) => {
            if (youtubePlayerRef.current) {
                youtubePlayerRef.current.seekTo(time, true);
                if (onSeek) onSeek(time);
            }
        },
        getCurrentTime: () => {
            return youtubePlayerRef.current ? youtubePlayerRef.current.getCurrentTime() : 0;
        },
        getDuration: () => {
            return youtubePlayerRef.current ? youtubePlayerRef.current.getDuration() : 0;
        },
        isPlaying: () => {
            return youtubePlayerRef.current ?
                youtubePlayerRef.current.getPlayerState() === window.YT?.PlayerState?.PLAYING :
                false;
        }
    }), [onSeek]);

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

    // Initialize YouTube player when API is ready and DOM is ready
    useEffect(() => {
        if (!videoUrl) return;

        const initPlayer = () => {
            console.log('🎬 Starting YouTube player initialization...');

            const extractedVideoId = extractYouTubeVideoId(videoUrl);
            if (!extractedVideoId) {
                setError('Invalid YouTube URL');
                return;
            }

            console.log('✅ Video ID:', extractedVideoId);
            setVideoId(extractedVideoId);

            // Wait for both YouTube API and DOM container
            const checkAndInit = () => {
                console.log('🔍 Checking readiness...', {
                    hasYT: !!window.YT?.Player,
                    hasContainer: !!containerRef.current
                });

                if (window.YT?.Player && containerRef.current) {
                    console.log('🚀 Both YouTube API and container ready!');
                    createPlayer(extractedVideoId);
                } else {
                    console.log('⏳ Waiting for YouTube API or container...');
                    setTimeout(checkAndInit, 100);
                }
            };

            checkAndInit();
        };

        const createPlayer = (videoId) => {
            try {
                console.log('🎬 Creating YouTube player...');

                // Clear container
                if (containerRef.current) {
                    containerRef.current.innerHTML = '';
                }

                youtubePlayerRef.current = new window.YT.Player(containerRef.current, {
                    videoId: videoId,
                    width: '100%',
                    height: '100%',
                    playerVars: {
                        controls: 0,
                        disablekb: 1,
                        fs: 0,
                        modestbranding: 1,
                        rel: 0,
                        iv_load_policy: 3,
                        cc_load_policy: 0,
                        playsinline: 1,
                        origin: window.location.origin
                    },
                    events: {
                        onReady: (event) => {
                            console.log('🎉 YouTube player ready!');
                            setIsReady(true);
                            setError(null);

                            const duration = event.target.getDuration();
                            if (onDurationChange) onDurationChange(duration);
                        },
                        onStateChange: (event) => {
                            const isPlaying = event.data === window.YT.PlayerState.PLAYING;
                            if (isPlaying && onPlay) onPlay();
                            else if (event.data === window.YT.PlayerState.PAUSED && onPause) onPause();
                        },
                        onError: (event) => {
                            console.error('💥 YouTube player error:', event.data);
                            let errorMessage = 'Error loading video: ';
                            switch (event.data) {
                                case 2: errorMessage += 'Invalid video ID'; break;
                                case 5: errorMessage += 'HTML5 player error'; break;
                                case 100: errorMessage += 'Video not found or private'; break;
                                case 101:
                                case 150: errorMessage += 'Video cannot be embedded'; break;
                                default: errorMessage += 'Unknown error';
                            }
                            setError(errorMessage);
                            setIsReady(false);
                        }
                    }
                });
            } catch (error) {
                console.error('💥 Error creating player:', error);
                setError('Failed to create video player');
            }
        };

        // Load YouTube API if not already loaded
        if (!window.YT) {
            console.log('📥 Loading YouTube API...');

            const script = document.createElement('script');
            script.src = 'https://www.youtube.com/iframe_api';
            script.async = true;
            document.head.appendChild(script);

            window.onYouTubeIframeAPIReady = () => {
                console.log('✅ YouTube API loaded!');
                initPlayer();
            };
        } else {
            console.log('✅ YouTube API already available');
            initPlayer();
        }

        // Cleanup
        return () => {
            if (youtubePlayerRef.current?.destroy) {
                try {
                    youtubePlayerRef.current.destroy();
                } catch (e) {
                    console.log('Cleanup error:', e);
                }
            }
        };
    }, [videoUrl]);

    // Time update interval
    useEffect(() => {
        if (!isReady || !youtubePlayerRef.current) return;

        const interval = setInterval(() => {
            try {
                const time = youtubePlayerRef.current.getCurrentTime();
                if (onTimeUpdate) onTimeUpdate(time);
            } catch (e) {
                // Player might not be ready
            }
        }, 100);

        return () => clearInterval(interval);
    }, [isReady, onTimeUpdate]);

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
                </div>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            {/* Always render the container, even when loading */}
            <div
                ref={containerRef}
                className="w-full aspect-video bg-black rounded-lg overflow-hidden"
            />

            {/* Loading overlay */}
            {!isReady && (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-gray-400 text-sm">Loading YouTube video...</p>
                        {videoId && (
                            <p className="text-gray-500 text-xs mt-1">Video ID: {videoId}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});

// Set display name for debugging
YouTubePlayer.displayName = 'YouTubePlayer';

export default YouTubePlayer;