#!/usr/bin/env node

/**
 * Enhanced WebSocket Server with WordPress Integration Testing
 * Supports real-time testing of WordPress environment
 */

const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs');

class EnhancedWebSocketServer {
    constructor(port = 8080) {
        this.port = port;
        this.clients = new Map();
        this.testSessions = new Map();
        this.wordpressTestMode = process.argv.includes('--mode=wordpress-test');

        console.log('🚀 Enhanced WebSocket Server starting...');
        console.log(`WordPress Test Mode: ${this.wordpressTestMode ? 'ENABLED' : 'DISABLED'}`);
    }

    start() {
        // Create HTTP server
        this.server = http.createServer();

        // Create WebSocket server
        this.wss = new WebSocket.Server({ server: this.server });

        this.wss.on('connection', (ws, req) => {
            const clientId = this.generateClientId();
            const clientInfo = {
                id: clientId,
                ws: ws,
                connectedAt: new Date(),
                userAgent: req.headers['user-agent'],
                ip: req.connection.remoteAddress
            };

            this.clients.set(clientId, clientInfo);

            console.log(`✅ Client connected: ${clientId} from ${clientInfo.ip}`);

            // Send welcome message
            this.sendToClient(clientId, {
                type: 'connection',
                clientId: clientId,
                serverMode: this.wordpressTestMode ? 'wordpress-test' : 'standard',
                timestamp: new Date().toISOString(),
                availableCommands: this.getAvailableCommands()
            });

            // Handle messages
            ws.on('message', (data) => {
                this.handleMessage(clientId, data);
            });

            // Handle disconnection
            ws.on('close', () => {
                console.log(`❌ Client disconnected: ${clientId}`);
                this.clients.delete(clientId);
            });

            ws.on('error', (error) => {
                console.error(`❌ WebSocket error for ${clientId}:`, error);
                this.clients.delete(clientId);
            });
        });

        this.server.listen(this.port, () => {
            console.log(`🌐 WebSocket Server running on port ${this.port}`);
            console.log(`🔗 Connect via: ws://localhost:${this.port}`);

            if (this.wordpressTestMode) {
                console.log('🐘 WordPress Test Mode - Ready for integration testing');
                this.startWordPressTestMonitoring();
            }
        });
    }

    generateClientId() {
        return 'client_' + Math.random().toString(36).substr(2, 9);
    }

    sendToClient(clientId, message) {
        const client = this.clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(message));
        }
    }

    broadcast(message) {
        this.clients.forEach((client) => {
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(JSON.stringify(message));
            }
        });
    }

    handleMessage(clientId, data) {
        try {
            const message = JSON.parse(data);
            console.log(`📨 Message from ${clientId}:`, message.type || 'unknown');

            switch (message.type) {
                case 'wordpress-test-start':
                    this.handleWordPressTestStart(clientId, message);
                    break;

                case 'wordpress-test-update':
                    this.handleWordPressTestUpdate(clientId, message);
                    break;

                case 'browser-console-log':
                    this.handleBrowserConsoleLog(clientId, message);
                    break;

                case 'plugin-status-check':
                    this.handlePluginStatusCheck(clientId, message);
                    break;

                case 'timing-test':
                    this.handleTimingTest(clientId, message);
                    break;

                case 'canvas-detection-test':
                    this.handleCanvasDetectionTest(clientId, message);
                    break;

                default:
                    this.handleGenericMessage(clientId, message);
            }

        } catch (error) {
            console.error(`❌ Message parsing error from ${clientId}:`, error);
            this.sendToClient(clientId, {
                type: 'error',
                error: 'Invalid JSON message',
                timestamp: new Date().toISOString()
            });
        }
    }

    handleWordPressTestStart(clientId, message) {
        const testSessionId = this.generateTestSessionId();

        const testSession = {
            id: testSessionId,
            clientId: clientId,
            startTime: new Date(),
            status: 'running',
            steps: [],
            results: []
        };

        this.testSessions.set(testSessionId, testSession);

        console.log(`🧪 WordPress test session started: ${testSessionId}`);

        this.sendToClient(clientId, {
            type: 'wordpress-test-started',
            testSessionId: testSessionId,
            timestamp: new Date().toISOString()
        });

        // Broadcast to other clients
        this.broadcast({
            type: 'test-session-notification',
            message: `WordPress integration test started by ${clientId}`,
            testSessionId: testSessionId,
            timestamp: new Date().toISOString()
        });
    }

    handleWordPressTestUpdate(clientId, message) {
        // Find active test session for this client
        const testSession = Array.from(this.testSessions.values())
            .find(session => session.clientId === clientId && session.status === 'running');

        if (testSession) {
            testSession.steps.push({
                timestamp: new Date().toISOString(),
                message: message.message,
                data: message.data
            });

            // Broadcast real-time update
            this.broadcast({
                type: 'wordpress-test-realtime-update',
                testSessionId: testSession.id,
                step: testSession.steps[testSession.steps.length - 1],
                timestamp: new Date().toISOString()
            });

            console.log(`📊 Test update: ${message.message}`);
        }
    }

    handleBrowserConsoleLog(clientId, message) {
        // Process browser console logs for WordPress environment
        const logData = {
            clientId: clientId,
            timestamp: new Date().toISOString(),
            level: message.level || 'log',
            text: message.text,
            source: message.source || 'unknown'
        };

        // Check for critical plugin messages
        if (this.isCriticalPluginMessage(message.text)) {
            console.log(`🚨 CRITICAL PLUGIN MESSAGE from ${clientId}: ${message.text}`);

            this.broadcast({
                type: 'critical-plugin-message',
                clientId: clientId,
                message: message.text,
                timestamp: new Date().toISOString()
            });
        }

        // Store console logs for analysis
        this.saveConsoleLog(logData);
    }

    handlePluginStatusCheck(clientId, message) {
        console.log(`🔍 Plugin status check from ${clientId}`);

        // Request comprehensive status from client
        this.sendToClient(clientId, {
            type: 'plugin-status-request',
            requestId: message.requestId || 'status_' + Date.now(),
            checks: [
                'fabric_loaded',
                'designer_widget_available',
                'comprehensive_capture_loaded',
                'canvas_elements_found',
                'generate_design_data_function',
                'webpack_modules_loaded'
            ],
            timestamp: new Date().toISOString()
        });
    }

    handleTimingTest(clientId, message) {
        console.log(`⏱️ Timing test from ${clientId}`);

        const timingTest = {
            clientId: clientId,
            testId: message.testId || 'timing_' + Date.now(),
            startTime: new Date(),
            phases: []
        };

        // Send timing test instructions
        this.sendToClient(clientId, {
            type: 'timing-test-instructions',
            testId: timingTest.testId,
            phases: [
                { name: 'dom_ready', description: 'Check state immediately on DOMContentLoaded' },
                { name: 'after_500ms', description: 'Check state 500ms after DOMContentLoaded' },
                { name: 'after_1000ms', description: 'Check state 1000ms after DOMContentLoaded' },
                { name: 'after_2000ms', description: 'Check state 2000ms after DOMContentLoaded' },
                { name: 'after_5000ms', description: 'Check state 5000ms after DOMContentLoaded' }
            ],
            timestamp: new Date().toISOString()
        });
    }

    handleCanvasDetectionTest(clientId, message) {
        console.log(`🎨 Canvas detection test from ${clientId}`);

        this.sendToClient(clientId, {
            type: 'canvas-detection-test-instructions',
            testId: message.testId || 'canvas_' + Date.now(),
            steps: [
                'query_canvas_elements',
                'check_fabric_instances',
                'test_designer_widget_canvas',
                'verify_comprehensive_capture',
                'attempt_generate_design_data'
            ],
            timestamp: new Date().toISOString()
        });
    }

    handleGenericMessage(clientId, message) {
        console.log(`📨 Generic message from ${clientId}:`, message);

        // Echo back with server timestamp
        this.sendToClient(clientId, {
            type: 'message-received',
            originalMessage: message,
            serverTimestamp: new Date().toISOString()
        });
    }

    isCriticalPluginMessage(text) {
        const criticalPatterns = [
            'fabric canvases available',
            'DesignerWidget',
            'COMPREHENSIVE DESIGN DATA CAPTURE',
            'generateDesignData',
            'webpack',
            'Failed to expose',
            'Failed to initialize'
        ];

        return criticalPatterns.some(pattern =>
            text.toLowerCase().includes(pattern.toLowerCase())
        );
    }

    saveConsoleLog(logData) {
        if (!this.wordpressTestMode) return;

        const logFile = path.join(__dirname, 'test-results', `console-logs-${new Date().toISOString().split('T')[0]}.jsonl`);

        try {
            const logLine = JSON.stringify(logData) + '\n';
            fs.appendFileSync(logFile, logLine);
        } catch (error) {
            console.error('❌ Failed to save console log:', error);
        }
    }

    generateTestSessionId() {
        return 'test_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    getAvailableCommands() {
        if (this.wordpressTestMode) {
            return [
                'wordpress-test-start',
                'wordpress-test-update',
                'browser-console-log',
                'plugin-status-check',
                'timing-test',
                'canvas-detection-test'
            ];
        } else {
            return [
                'plugin-status-check',
                'timing-test',
                'canvas-detection-test'
            ];
        }
    }

    startWordPressTestMonitoring() {
        console.log('🔍 Starting WordPress test monitoring...');

        // Check for test results directory
        const resultsDir = path.join(__dirname, 'test-results');
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
            console.log('📁 Created test results directory');
        }

        // Monitor for test completion
        setInterval(() => {
            this.checkTestSessions();
        }, 5000);
    }

    checkTestSessions() {
        const now = new Date();

        this.testSessions.forEach((session, sessionId) => {
            const elapsed = now - session.startTime;

            // Mark sessions as timed out after 10 minutes
            if (elapsed > 10 * 60 * 1000 && session.status === 'running') {
                session.status = 'timeout';
                console.log(`⏰ Test session ${sessionId} timed out`);

                this.broadcast({
                    type: 'test-session-timeout',
                    testSessionId: sessionId,
                    elapsed: elapsed,
                    timestamp: new Date().toISOString()
                });
            }
        });
    }

    getStats() {
        return {
            connectedClients: this.clients.size,
            activeTestSessions: Array.from(this.testSessions.values()).filter(s => s.status === 'running').length,
            totalTestSessions: this.testSessions.size,
            wordpressTestMode: this.wordpressTestMode,
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        };
    }
}

// Start server
const port = process.env.PORT || 8080;
const server = new EnhancedWebSocketServer(port);
server.start();

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down WebSocket server...');
    process.exit(0);
});

module.exports = EnhancedWebSocketServer;