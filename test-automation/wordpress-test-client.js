#!/usr/bin/env node

/**
 * WordPress Test Client - Connects to WordPress test environment via WebSocket
 * Provides real-time testing interface
 */

const WebSocket = require('ws');
const readline = require('readline');

class WordPressTestClient {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.websocketUrl = process.env.WEBSOCKET_URL || 'ws://localhost:8083';
        this.clientId = null;

        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log('🧪 WordPress Test Client');
        console.log('========================');
        console.log(`Connecting to: ${this.websocketUrl}`);
    }

    async connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.websocketUrl);

                this.ws.on('open', () => {
                    console.log('✅ Connected to WebSocket server');
                    this.connected = true;
                    resolve();
                });

                this.ws.on('message', (data) => {
                    this.handleMessage(data);
                });

                this.ws.on('close', () => {
                    console.log('❌ WebSocket connection closed');
                    this.connected = false;
                });

                this.ws.on('error', (error) => {
                    console.error('❌ WebSocket error:', error.message);
                    reject(error);
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    handleMessage(data) {
        try {
            const message = JSON.parse(data);

            switch (message.type) {
                case 'connection':
                    this.clientId = message.clientId;
                    console.log(`🆔 Client ID: ${this.clientId}`);
                    console.log(`🏗️ Server Mode: ${message.serverMode}`);
                    console.log(`📋 Available Commands:`, message.availableCommands);
                    this.showMainMenu();
                    break;

                case 'wordpress-test-started':
                    console.log(`🧪 WordPress test session started: ${message.testSessionId}`);
                    break;

                case 'wordpress-test-realtime-update':
                    console.log(`📊 Test Update: ${message.step.message}`);
                    if (message.step.data) {
                        console.log(`   Data:`, JSON.stringify(message.step.data, null, 2));
                    }
                    break;

                case 'critical-plugin-message':
                    console.log(`🚨 CRITICAL: ${message.message}`);
                    break;

                case 'plugin-status-request':
                    console.log(`🔍 Plugin status check requested`);
                    break;

                case 'timing-test-instructions':
                    console.log(`⏱️ Timing test instructions received`);
                    console.log(`Test ID: ${message.testId}`);
                    console.log(`Phases:`, message.phases);
                    break;

                case 'canvas-detection-test-instructions':
                    console.log(`🎨 Canvas detection test instructions received`);
                    console.log(`Test ID: ${message.testId}`);
                    console.log(`Steps:`, message.steps);
                    break;

                case 'test-session-notification':
                    console.log(`📢 ${message.message}`);
                    break;

                case 'test-session-timeout':
                    console.log(`⏰ Test session ${message.testSessionId} timed out`);
                    break;

                default:
                    console.log(`📨 Message:`, message);
            }

        } catch (error) {
            console.error('❌ Error parsing message:', error);
        }
    }

    sendMessage(message) {
        if (this.connected && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.log('❌ Not connected to WebSocket server');
        }
    }

    showMainMenu() {
        console.log('\n📋 WordPress Test Menu:');
        console.log('========================');
        console.log('1. Start WordPress Integration Test');
        console.log('2. Plugin Status Check');
        console.log('3. Timing Test');
        console.log('4. Canvas Detection Test');
        console.log('5. Monitor Browser Console');
        console.log('6. Send Custom Message');
        console.log('7. Show Server Stats');
        console.log('0. Exit');
        console.log('========================\n');

        this.rl.question('Select option (0-7): ', (answer) => {
            this.handleMenuChoice(answer.trim());
        });
    }

    handleMenuChoice(choice) {
        switch (choice) {
            case '1':
                this.startWordPressTest();
                break;
            case '2':
                this.pluginStatusCheck();
                break;
            case '3':
                this.timingTest();
                break;
            case '4':
                this.canvasDetectionTest();
                break;
            case '5':
                this.monitorBrowserConsole();
                break;
            case '6':
                this.sendCustomMessage();
                break;
            case '7':
                this.showServerStats();
                break;
            case '0':
                this.exit();
                break;
            default:
                console.log('❌ Invalid choice. Please try again.');
                this.showMainMenu();
        }
    }

    startWordPressTest() {
        console.log('🧪 Starting WordPress Integration Test...');

        this.sendMessage({
            type: 'wordpress-test-start',
            timestamp: new Date().toISOString()
        });

        // Return to menu after a delay
        setTimeout(() => {
            this.showMainMenu();
        }, 2000);
    }

    pluginStatusCheck() {
        console.log('🔍 Requesting plugin status check...');

        this.sendMessage({
            type: 'plugin-status-check',
            requestId: 'status_' + Date.now(),
            timestamp: new Date().toISOString()
        });

        setTimeout(() => {
            this.showMainMenu();
        }, 2000);
    }

    timingTest() {
        console.log('⏱️ Starting timing test...');

        this.sendMessage({
            type: 'timing-test',
            testId: 'timing_' + Date.now(),
            timestamp: new Date().toISOString()
        });

        setTimeout(() => {
            this.showMainMenu();
        }, 2000);
    }

    canvasDetectionTest() {
        console.log('🎨 Starting canvas detection test...');

        this.sendMessage({
            type: 'canvas-detection-test',
            testId: 'canvas_' + Date.now(),
            timestamp: new Date().toISOString()
        });

        setTimeout(() => {
            this.showMainMenu();
        }, 2000);
    }

    monitorBrowserConsole() {
        console.log('👁️ Browser console monitoring mode activated');
        console.log('Send browser console logs as browser-console-log messages');
        console.log('Press Enter to return to menu...\n');

        this.rl.question('', () => {
            this.showMainMenu();
        });
    }

    sendCustomMessage() {
        this.rl.question('Enter custom message (JSON): ', (input) => {
            try {
                const message = JSON.parse(input);
                this.sendMessage(message);
                console.log('✅ Custom message sent');
            } catch (error) {
                console.error('❌ Invalid JSON:', error.message);
            }

            setTimeout(() => {
                this.showMainMenu();
            }, 1000);
        });
    }

    showServerStats() {
        console.log('📊 Requesting server statistics...');

        this.sendMessage({
            type: 'get-stats',
            timestamp: new Date().toISOString()
        });

        setTimeout(() => {
            this.showMainMenu();
        }, 2000);
    }

    exit() {
        console.log('👋 Goodbye!');
        this.rl.close();
        if (this.ws) {
            this.ws.close();
        }
        process.exit(0);
    }

    async run() {
        try {
            await this.connect();
            console.log('🎯 WordPress Test Client ready!');

            // Handle graceful shutdown
            process.on('SIGINT', () => {
                this.exit();
            });

        } catch (error) {
            console.error('❌ Failed to start test client:', error.message);
            process.exit(1);
        }
    }
}

// Start client if called directly
if (require.main === module) {
    const client = new WordPressTestClient();
    client.run();
}

module.exports = WordPressTestClient;