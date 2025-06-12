import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.subscriptions = new Map();
        this.messageHandlers = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    connect() {
        return new Promise((resolve, reject) => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    reject(new Error('No authentication token found'));
                    return;
                }

                const headers = { Authorization: `Bearer ${token}` };

                this.client = new Client({
                    webSocketFactory: () => {
                        console.log('Creating SockJS connection...');
                        return new SockJS('http://localhost:8080/ws/review-session');
                    },
                    connectHeaders: headers,
                    debug: (str) => {
                        console.log('STOMP Debug:', str);
                    },
                    reconnectDelay: 5000,
                    heartbeatIncoming: 4000,
                    heartbeatOutgoing: 4000,

                    onConnect: (frame) => {
                        console.log('✅ Connected to WebSocket:', frame);
                        this.connected = true;
                        this.reconnectAttempts = 0;
                        resolve();
                    },

                    onStompError: (frame) => {
                        console.error('❌ STOMP error:', frame);
                        this.connected = false;
                        reject(new Error(`WebSocket connection failed: ${frame.headers.message || 'Unknown STOMP error'}`));
                    },

                    onWebSocketError: (error) => {
                        console.error('❌ WebSocket error:', error);
                        this.connected = false;
                        reject(error);
                    },

                    onDisconnect: () => {
                        console.log('🔌 Disconnected from WebSocket');
                        this.connected = false;

                        // Attempt to reconnect if not manually disconnected
                        if (this.reconnectAttempts < this.maxReconnectAttempts) {
                            this.reconnectAttempts++;
                            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                            setTimeout(() => {
                                this.connect();
                            }, 3000 * this.reconnectAttempts);
                        }
                    },

                    onWebSocketClose: (event) => {
                        console.log('🔌 WebSocket closed:', event);
                        this.connected = false;
                    }
                });

                console.log('🚀 Activating WebSocket client...');
                this.client.activate();

            } catch (error) {
                console.error('Error creating WebSocket connection:', error);
                reject(error);
            }
        });
    }

    disconnect() {
        if (this.client) {
            console.log('🔌 Manually disconnecting WebSocket...');

            // Unsubscribe from all subscriptions
            this.subscriptions.forEach((subscription) => {
                try {
                    subscription.unsubscribe();
                } catch (error) {
                    console.error('Error unsubscribing:', error);
                }
            });

            this.subscriptions.clear();
            this.messageHandlers.clear();

            // Deactivate the client
            this.client.deactivate();
            this.connected = false;
            this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect

            console.log('WebSocket disconnected');
        }
    }

    subscribeToSession(sessionId, messageHandler) {
        if (!this.connected || !this.client) {
            console.error('WebSocket not connected - cannot subscribe');
            return null;
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
                    console.error('Error parsing message:', error, 'Raw message:', message.body);
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
        return this.connected && this.client && this.client.connected;
    }

    // Utility method to wait for connection
    waitForConnection(timeout = 10000) {
        return new Promise((resolve, reject) => {
            if (this.isConnected()) {
                resolve();
                return;
            }

            const startTime = Date.now();
            const checkConnection = () => {
                if (this.isConnected()) {
                    resolve();
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error('WebSocket connection timeout'));
                } else {
                    setTimeout(checkConnection, 100);
                }
            };

            checkConnection();
        });
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;