#!/usr/bin/env node

/**
 * Enhanced Test Client for Plugin-Specific WebSocket AI Testing
 * Tests all new Octo Print Designer specific features
 */

const WebSocket = require('ws');

class EnhancedTestClient {
    constructor(serverUrl = 'ws://localhost:8080/ws') {
        this.serverUrl = serverUrl;
        this.ws = null;
        this.sessionId = null;
        this.testResults = [];
    }

    async connect() {
        return new Promise((resolve, reject) => {
            console.log('🔌 Connecting to Enhanced WebSocket server...');

            this.ws = new WebSocket(this.serverUrl);

            this.ws.on('open', () => {
                console.log('✅ Connected to enhanced server');
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
            case 'print_spec_result':
                console.log(`📐 Print Spec Test completed - Score: ${message.result.score}%`);
                this.testResults.push(message.result);
                break;
            case 'canvas_analysis_result':
                console.log(`🎨 Canvas Analysis completed - ${message.result.totalElements} elements found`);
                this.testResults.push(message.result);
                break;
            case 'reference_line_validation_result':
                console.log(`📏 Reference Line Validation - ${message.result.lineCount} lines, Score: ${message.result.score}%`);
                this.testResults.push(message.result);
                break;
            case 'size_calculation_result':
                console.log(`📊 Size Calculation completed - Closest: ${message.result.closestStandardSize?.name}`);
                this.testResults.push(message.result);
                break;
            case 'woocommerce_sync_result':
                console.log(`🛍️ WooCommerce Sync completed - ${message.result.productsSynced} products synced`);
                this.testResults.push(message.result);
                break;
            default:
                console.log(`📝 ${message.type}:`, message.message || 'Event received');
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

    async runEnhancedTests() {
        console.log('\n🧪 Starting Enhanced Plugin-Specific Tests...\n');

        // Wait for connection to be established
        await this.delay(1000);

        // Test 1: Print Specification Test
        console.log('📋 Test 1: Print Specification Analysis');
        this.send({
            type: 'print_spec_test',
            designData: {
                dpi: 150, // Low DPI to trigger warning
                color_profile: 'RGB', // RGB instead of CMYK to trigger warning
                dimensions: { width: 85, height: 55 },
                print_specifications: {
                    bleed: 2, // Low bleed to trigger warning
                    safe_area: 3 // Low safe area to trigger warning
                }
            }
        });

        await this.delay(3000);

        // Test 2: Canvas Analysis
        console.log('\n📋 Test 2: Canvas Element Analysis');
        this.send({
            type: 'canvas_analysis',
            canvasData: {
                elements: [
                    { type: 'text', fontSize: 6, content: 'Too small text' }, // Small font to trigger warning
                    { type: 'text', fontSize: 14, content: 'Normal text' },
                    { type: 'image', width: 300, height: 50 }, // Unusual aspect ratio
                    { type: 'image', width: 100, height: 100 },
                    { type: 'rect', width: 50, height: 30 },
                    { type: 'circle', radius: 25 }
                ]
            }
        });

        await this.delay(3000);

        // Test 3: Reference Line Validation
        console.log('\n📋 Test 3: Reference Line Validation');
        this.send({
            type: 'reference_line_validation',
            referenceLines: [
                { x1: 10, y1: 10, x2: 100, y2: 10, name: 'Top Line' },
                { x1: 10, y1: 50, x2: 100, y2: 50, name: 'Middle Line' },
                { x1: 10, y1: 10, x2: 10, y2: 100, name: 'Left Line' },
                { x1: 12, y1: 12, x2: 12, y2: 102, name: 'A' } // Overlapping line with short name
            ]
        });

        await this.delay(2000);

        // Test 4: Size Calculation
        console.log('\n📋 Test 4: Size Factor Calculation');
        this.send({
            type: 'size_calculation',
            dimensions: { width: 210, height: 297 }, // A4 size
            referenceData: { baseWidth: 100, baseHeight: 100 }
        });

        await this.delay(2000);

        // Test 5: WooCommerce Sync Test
        console.log('\n📋 Test 5: WooCommerce Sync Simulation');
        this.send({
            type: 'woocommerce_sync_test',
            productData: {
                templateId: 123,
                products: [
                    { name: 'Business Card', variations: 5 },
                    { name: 'Flyer A5', variations: 3 },
                    { name: 'Poster A2', variations: 8 }
                ]
            }
        });

        await this.delay(4000);

        console.log('\n✅ All enhanced tests completed!');
        this.printEnhancedSummary();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    printEnhancedSummary() {
        console.log('\n📊 Enhanced Test Summary:');
        console.log(`Session ID: ${this.sessionId}`);
        console.log(`Plugin-specific tests completed: ${this.testResults.length}`);

        if (this.testResults.length > 0) {
            console.log('\n📈 Results Overview:');
            this.testResults.forEach((result, index) => {
                if (result.score !== undefined) {
                    const quality = result.quality || (result.score >= 80 ? 'Good' : 'Needs Improvement');
                    console.log(`  ${index + 1}. Score: ${result.score}% - Quality: ${quality}`);
                }

                if (result.issues && result.issues.length > 0) {
                    console.log(`     Issues: ${result.issues.length}`);
                }

                if (result.recommendations && result.recommendations.length > 0) {
                    console.log(`     Recommendations: ${result.recommendations.length}`);
                }

                if (result.totalElements !== undefined) {
                    console.log(`     Canvas Elements: ${result.totalElements} (${result.complexity} complexity)`);
                }

                if (result.productsSynced !== undefined) {
                    console.log(`     WooCommerce: ${result.productsSynced} products, ${result.variationsCreated} variations`);
                }

                console.log('');
            });

            // Detailed results
            console.log('\n📋 Detailed Results:');
            this.testResults.forEach((result, index) => {
                console.log(`\n--- Test ${index + 1} Details ---`);
                console.log(JSON.stringify(result, null, 2));
            });
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

// Run the enhanced test
async function main() {
    const client = new EnhancedTestClient();

    try {
        await client.connect();
        await client.runEnhancedTests();
    } catch (error) {
        console.error('Enhanced test failed:', error);
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