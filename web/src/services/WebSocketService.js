// Replace your entire WebSocketService.js with this version

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
    constructor() {
        if (WebSocketService.instance) {
            return WebSocketService.instance;
        }

        this.client = null;
        this.connected = false;
        this.subscriptions = new Map();
        this.messageHandlers = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 3;
        this.isConnecting = false;
        this.isDisconnecting = false;

        WebSocketService.instance = this;
        return this;
    }

    connect() {
        return new Promise((resolve, reject) => {
            // Prevent multiple simultaneous connection attempts
            if (this.isConnecting) {
                console.log('⏳ Connection already in progress...');
                // Wait for existing connection attempt
                const checkConnection = () => {
                    if (!this.isConnecting) {
                        if (this.connected) {
                            resolve();
                        } else {
                            reject(new Error('Connection failed'));
                        }
                    } else {
                        setTimeout(checkConnection, 100);
                    }
                };
                checkConnection();
                return;
            }

            // If already connected, resolve immediately
            if (this.connected && this.client && this.client.connected) {
                console.log('✅ Already connected to WebSocket');
                return resolve();
            }

            this.isConnecting = true;

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.isConnecting = false;
                    reject(new Error('No authentication token found'));
                    return;
                }

                const headers = { Authorization: `Bearer ${token}` };

                // Clean up existing client if any
                if (this.client) {
                    try {
                        this.client.deactivate();
                    } catch (e) {
                        console.log('Cleaned up existing client');
                    }
                }

                this.client = new Client({
                    webSocketFactory: () => {
                        console.log('Creating SockJS connection...');
                        return new SockJS('http://localhost:8080/ws/review-session');
                    },
                    connectHeaders: headers,
                    debug: (str) => {
                        // Only log important messages to reduce noise
                        if (str.includes('CONNECT') || str.includes('ERROR') || str.includes('DISCONNECT')) {
                            console.log('STOMP Debug:', str);
                        }
                    },
                    reconnectDelay: 0, // Disable auto-reconnect, we'll handle it manually
                    heartbeatIncoming: 10000,
                    heartbeatOutgoing: 10000,

                    onConnect: (frame) => {
                        console.log('✅ Connected to WebSocket');
                        this.connected = true;
                        this.isConnecting = false;
                        this.reconnectAttempts = 0;
                        resolve();
                    },

                    onStompError: (frame) => {
                        console.error('❌ STOMP error:', frame.headers.message || 'Unknown error');
                        this.connected = false;
                        this.isConnecting = false;
                        reject(new Error(`WebSocket connection failed: ${frame.headers.message || 'Unknown STOMP error'}`));
                    },

                    onWebSocketError: (error) => {
                        console.error('❌ WebSocket error:', error);
                        this.connected = false;
                        this.isConnecting = false;
                        reject(error);
                    },

                    onDisconnect: () => {
                        console.log('🔌 Disconnected from WebSocket');
                        this.connected = false;
                        this.isConnecting = false;

                        // Only attempt manual reconnect if not disconnecting intentionally
                        if (!this.isDisconnecting && this.reconnectAttempts < this.maxReconnectAttempts) {
                            this.reconnectAttempts++;
                            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                            setTimeout(() => {
                                if (!this.connected && !this.isDisconnecting) {
                                    this.connect().catch(console.error);
                                }
                            }, 3000 * this.reconnectAttempts);
                        }
                    },

                    onWebSocketClose: (event) => {
                        console.log('🔌 WebSocket closed');
                        this.connected = false;
                        this.isConnecting = false;
                    }
                });

                console.log('🚀 Activating WebSocket client...');
                this.client.activate();

            } catch (error) {
                console.error('Error creating WebSocket connection:', error);
                this.isConnecting = false;
                reject(error);
            }
        });
    }

    disconnect() {
        if (this.client) {
            console.log('🔌 Manually disconnecting WebSocket...');
            this.isDisconnecting = true;

            // Set max attempts to prevent auto-reconnect
            this.reconnectAttempts = this.maxReconnectAttempts;

            // Unsubscribe from all subscriptions
            this.subscriptions.forEach((subscription, sessionId) => {
                try {
                    subscription.unsubscribe();
                } catch (error) {
                    console.error('Error unsubscribing:', error);
                }
            });

            this.subscriptions.clear();
            this.messageHandlers.clear();

            // Deactivate the client
            try {
                this.client.deactivate();
            } catch (error) {
                console.error('Error deactivating client:', error);
            }

            this.client = null;
            this.connected = false;
            this.isConnecting = false;

            // Reset disconnecting flag after a short delay
            setTimeout(() => {
                this.isDisconnecting = false;
            }, 1000);

            console.log('WebSocket disconnected');
        }
    }

    subscribeToSession(sessionId, messageHandler) {
        if (!this.connected || !this.client) {
            console.error('WebSocket not connected - cannot subscribe');
            return null;
        }

        // Check if already subscribed to this session
        if (this.subscriptions.has(sessionId)) {
            console.log(`Already subscribed to session: ${sessionId}`);
            return this.subscriptions.get(sessionId);
        }

        const destination = `/topic/session/${sessionId}`;

        try {
            console.log(`📡 Subscribing to: ${destination}`);

            const subscription = this.client.subscribe(destination, (message) => {
                try {
                    const data = JSON.parse(message.body);
                    console.log('📨 Received message:', data);
                    messageHandler(data);
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            });

            this.subscriptions.set(sessionId, subscription);
            this.messageHandlers.set(sessionId, messageHandler);

            console.log(`📡 Successfully subscribed to session: ${sessionId}`);
            return subscription;

        } catch (error) {
            console.error('Error subscribing to session:', error);
            return null;
        }
    }

    unsubscribeFromSession(sessionId) {
        const subscription = this.subscriptions.get(sessionId);
        if (subscription) {
            try {
                subscription.unsubscribe();
                this.subscriptions.delete(sessionId);
                this.messageHandlers.delete(sessionId);
                console.log(`🚫 Unsubscribed from session: ${sessionId}`);
            } catch (error) {
                console.error('Error unsubscribing from session:', error);
            }
        }
    }

    sendMessage(destination, payload) {
        if (!this.connected || !this.client) {
            console.error('WebSocket not connected - cannot send message');
            return false;
        }

        try {
            this.client.publish({
                destination: destination,
                body: JSON.stringify(payload)
            });
            return true;
        } catch (error) {
            console.error('Error sending message:', error);
            return false;
        }
    }

    sendPlay(sessionId, timestamp) {
        const sent = this.sendMessage(`/app/session/${sessionId}/play`, {
            timestamp: timestamp,
            isPlaying: true
        });

        if (sent) {
            console.log('▶️ Sent play command:', { sessionId, timestamp });
        }
    }

    sendPause(sessionId, timestamp) {
        const sent = this.sendMessage(`/app/session/${sessionId}/pause`, {
            timestamp: timestamp,
            isPlaying: false
        });

        if (sent) {
            console.log('⏸️ Sent pause command:', { sessionId, timestamp });
        }
    }

    sendSeek(sessionId, timestamp, isPlaying) {
        const sent = this.sendMessage(`/app/session/${sessionId}/seek`, {
            timestamp: timestamp,
            isPlaying: isPlaying
        });

        if (sent) {
            console.log('⏭️ Sent seek command:', { sessionId, timestamp, isPlaying });
        }
    }

    requestSync(sessionId) {
        const sent = this.sendMessage(`/app/session/${sessionId}/sync`, {});

        if (sent) {
            console.log('🔄 Requested sync for session:', sessionId);
        }
    }

    sendNote(sessionId, noteData) {
        const sent = this.sendMessage(`/app/session/${sessionId}/note`, noteData);

        if (sent) {
            console.log('📝 Sent note:', { sessionId, noteData });
        }
    }

    isConnected() {
        return this.connected && this.client && this.client.connected && !this.isConnecting;
    }
}

// Create singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;