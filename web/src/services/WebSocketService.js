import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.subscriptions = new Map();
        this.messageHandlers = new Map();
    }

    connect() {
        return new Promise((resolve, reject) => {
            try {
                const token = localStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                this.client = new Client({
                    webSocketFactory: () => new SockJS('http://localhost:8080/ws/review-session'),
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
                        resolve();
                    },
                    onStompError: (frame) => {
                        console.error('❌ STOMP error:', frame);
                        this.connected = false;
                        reject(new Error(`WebSocket connection failed: ${frame.headers.message || 'Unknown error'}`));
                    },
                    onWebSocketError: (error) => {
                        console.error('❌ WebSocket error:', error);
                        this.connected = false;
                        reject(error);
                    },
                    onDisconnect: () => {
                        console.log('🔌 Disconnected from WebSocket');
                        this.connected = false;
                    }
                });

                this.client.activate();
            } catch (error) {
                console.error('Error connecting to WebSocket:', error);
                reject(error);
            }
        });
    }

    disconnect() {
        if (this.client && this.connected) {
            this.subscriptions.forEach((subscription) => {
                subscription.unsubscribe();
            });
            this.subscriptions.clear();
            this.messageHandlers.clear();

            this.client.deactivate();
            this.connected = false;
            console.log('WebSocket disconnected');
        }
    }

    subscribeToSession(sessionId, messageHandler) {
        if (!this.connected || !this.client) {
            console.error('WebSocket not connected');
            return null;
        }

        const destination = `/topic/session/${sessionId}`;

        try {
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

            console.log(`📡 Subscribed to session: ${sessionId}`);
            return subscription;
        } catch (error) {
            console.error('Error subscribing to session:', error);
            return null;
        }
    }

    unsubscribeFromSession(sessionId) {
        const subscription = this.subscriptions.get(sessionId);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(sessionId);
            this.messageHandlers.delete(sessionId);
            console.log(`🚫 Unsubscribed from session: ${sessionId}`);
        }
    }

    sendPlay(sessionId, timestamp) {
        if (!this.connected || !this.client) {
            console.error('WebSocket not connected');
            return;
        }

        try {
            this.client.publish({
                destination: `/app/session/${sessionId}/play`,
                body: JSON.stringify({
                    timestamp: timestamp,
                    isPlaying: true
                })
            });
            console.log('▶️ Sent play command:', { sessionId, timestamp });
        } catch (error) {
            console.error('Error sending play command:', error);
        }
    }

    sendPause(sessionId, timestamp) {
        if (!this.connected || !this.client) {
            console.error('WebSocket not connected');
            return;
        }

        try {
            this.client.publish({
                destination: `/app/session/${sessionId}/pause`,
                body: JSON.stringify({
                    timestamp: timestamp,
                    isPlaying: false
                })
            });
            console.log('⏸️ Sent pause command:', { sessionId, timestamp });
        } catch (error) {
            console.error('Error sending pause command:', error);
        }
    }

    sendSeek(sessionId, timestamp, isPlaying) {
        if (!this.connected || !this.client) {
            console.error('WebSocket not connected');
            return;
        }

        try {
            this.client.publish({
                destination: `/app/session/${sessionId}/seek`,
                body: JSON.stringify({
                    timestamp: timestamp,
                    isPlaying: isPlaying
                })
            });
            console.log('⏭️ Sent seek command:', { sessionId, timestamp, isPlaying });
        } catch (error) {
            console.error('Error sending seek command:', error);
        }
    }

    requestSync(sessionId) {
        if (!this.connected || !this.client) {
            console.error('WebSocket not connected');
            return;
        }

        try {
            this.client.publish({
                destination: `/app/session/${sessionId}/sync`,
                body: JSON.stringify({})
            });
            console.log('🔄 Requested sync for session:', sessionId);
        } catch (error) {
            console.error('Error requesting sync:', error);
        }
    }

    isConnected() {
        return this.connected;
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;