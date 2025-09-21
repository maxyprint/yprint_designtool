#!/usr/bin/env node

/**
 * Test Client for WebSocket AI Testing Server
 * This script tests the WebSocket server functionality
 */

const WebSocket = require('ws');

class TestClient {
    constructor(serverUrl = 'ws://localhost:8080/ws') {
        this.serverUrl = serverUrl;
        this.ws = null;
        this.sessionId = null;
        this.testResults = [];
    }

    async connect() {
        return new Promise((resolve, reject) => {
            console.log('🔌 Connecting to WebSocket server...');

            this.ws = new WebSocket(this.serverUrl);

            this.ws.on('open', () => {
                console.log('✅ Connected to server');
                resolve();
            });

            this.ws.on('message', (data) => {
                this.handleMessage(JSON.parse(data));
            });

            this.ws.on('error', (error) => {
                console.error('❌ Connection error:', error.message);
                reject(error);
            });

            this.ws.on('close', () => {
                console.log('🔌 Connection closed');
            });
        });
    }

    handleMessage(message) {
        console.log(`📨 Received [${message.type}]:`, message);

        switch (message.type) {
            case 'connection':
                this.sessionId = message.sessionId;
                console.log(`🆔 Session established: ${this.sessionId}`);
                break;
            case 'task_started':
                console.log(`🚀 Task started: ${message.taskId}`);
                break;
            case 'progress_update':
                console.log(`📊 Progress: ${message.progress}% - ${message.step}`);
                break;
            case 'task_completed':
                console.log(`✅ Task completed: ${message.taskId}`);
                this.testResults.push(message.result);
                break;
            case 'execution_result':
                console.log(`⚡ Code execution result:`, message.result);
                break;
            case 'validation_result':
                console.log(`✔️ Design validation result:`, message.result);
                break;
            case 'error':
                console.error(`❌ Server error: ${message.message}`);
                break;
        }
    }

    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log(`📤 Sending [${message.type}]:`, message);
            this.ws.send(JSON.stringify(message));
            return true;
        } else {
            console.error('❌ WebSocket not connected');
            return false;
        }
    }

    async runTests() {
        console.log('\n🧪 Starting WebSocket Tests...\n');

        // Wait for connection to be established
        await this.delay(1000);

        // Test 1: Design Test
        console.log('📋 Test 1: Design Test Request');
        this.send({
            type: 'test_request',
            data: {
                testType: 'design_validation',
                designData: {
                    type: 'print_design',
                    elements: [
                        { type: 'text', content: 'Hello World', size: 14 },
                        { type: 'image', src: 'test.jpg', width: 100, height: 100 }
                    ],
                    dimensions: { width: 210, height: 297 }, // A4
                    dpi: 300
                }
            }
        });

        await this.delay(6000); // Wait for test to complete

        // Test 2: Code Execution
        console.log('\n📋 Test 2: Code Execution');
        this.send({
            type: 'code_execution',
            code: `
                function calculatePrintSize(width, height, dpi) {
                    const inchWidth = width / dpi;
                    const inchHeight = height / dpi;
                    return { width: inchWidth, height: inchHeight };
                }

                const result = calculatePrintSize(300, 400, 150);
                console.log('Print size:', result);
                return result;
            `,
            language: 'javascript'
        });

        await this.delay(3000);

        // Test 3: Design Validation
        console.log('\n📋 Test 3: Design Validation');
        this.send({
            type: 'design_validation',
            designData: {
                type: 'business_card',
                dimensions: { width: 85, height: 55 }, // mm
                elements: [
                    { type: 'text', content: 'John Doe', fontSize: 16, color: '#000000' },
                    { type: 'text', content: 'john@example.com', fontSize: 10, color: '#666666' },
                    { type: 'logo', src: 'logo.png', width: 20, height: 20 }
                ],
                colorProfile: 'CMYK',
                bleed: 3,
                safeArea: 5
            }
        });

        await this.delay(3000);

        // Test 4: Ping Test
        console.log('\n📋 Test 4: Ping Test');
        this.send({
            type: 'ping',
            timestamp: new Date().toISOString()
        });

        await this.delay(1000);

        console.log('\n✅ All tests completed!');
        this.printSummary();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    printSummary() {
        console.log('\n📊 Test Summary:');
        console.log(`Session ID: ${this.sessionId}`);
        console.log(`Tests completed: ${this.testResults.length}`);

        if (this.testResults.length > 0) {
            console.log('\nResults:');
            this.testResults.forEach((result, index) => {
                console.log(`  ${index + 1}. ${JSON.stringify(result, null, 2)}`);
            });
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

// Run the test
async function main() {
    const client = new TestClient();

    try {
        await client.connect();
        await client.runTests();
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        client.disconnect();
        process.exit(0);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Interrupted, shutting down...');
    process.exit(0);
});

if (require.main === module) {
    main();
}