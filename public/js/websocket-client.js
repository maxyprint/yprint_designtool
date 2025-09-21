/**
 * WebSocket Client for Real-time AI Testing
 * Integrates with WordPress Plugin Design Tool
 */

class AITestClient {
    constructor(serverUrl = 'ws://localhost:8080/ws') {
        this.serverUrl = serverUrl;
        this.ws = null;
        this.sessionId = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.isConnected = false;
        this.eventListeners = new Map();

        this.init();
    }

    init() {
        this.connect();
        this.setupHeartbeat();
    }

    connect() {
        try {
            console.log('🔌 Connecting to AI Test Server...');
            this.ws = new WebSocket(this.serverUrl);

            this.ws.onopen = (event) => {
                console.log('✅ Connected to AI Test Server');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.emit('connected', event);
            };

            this.ws.onmessage = (event) => {
                this.handleMessage(event);
            };

            this.ws.onclose = (event) => {
                console.log('❌ Disconnected from AI Test Server');
                this.isConnected = false;
                this.emit('disconnected', event);
                this.handleReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.emit('error', error);
            };

        } catch (error) {
            console.error('Failed to connect:', error);
            this.handleReconnect();
        }
    }

    handleMessage(event) {
        try {
            const message = JSON.parse(event.data);
            console.log('📨 Received:', message.type, message);

            switch (message.type) {
                case 'connection':
                    this.sessionId = message.sessionId;
                    this.emit('session_established', message);
                    break;
                case 'task_started':
                    this.emit('test_started', message);
                    break;
                case 'progress_update':
                    this.emit('progress', message);
                    break;
                case 'task_completed':
                    this.emit('test_completed', message);
                    break;
                case 'execution_result':
                    this.emit('code_result', message);
                    break;
                case 'validation_result':
                    this.emit('validation_result', message);
                    break;
                case 'error':
                    this.emit('server_error', message);
                    break;
                case 'pong':
                    // Heartbeat response
                    break;
                default:
                    console.warn('Unknown message type:', message.type);
            }

        } catch (error) {
            console.error('Error parsing message:', error);
        }
    }

    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

            setTimeout(() => {
                this.connect();
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('❌ Max reconnection attempts reached');
            this.emit('connection_failed');
        }
    }

    setupHeartbeat() {
        setInterval(() => {
            if (this.isConnected) {
                this.send({
                    type: 'ping',
                    timestamp: new Date().toISOString()
                });
            }
        }, 30000); // 30 seconds
    }

    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
            return true;
        } else {
            console.warn('WebSocket not connected, message queued');
            return false;
        }
    }

    // Testing Methods
    runDesignTest(designData) {
        console.log('🧪 Running design test...');
        return this.send({
            type: 'test_request',
            data: {
                testType: 'design_validation',
                designData: designData,
                timestamp: new Date().toISOString()
            }
        });
    }

    executeCode(code, language = 'javascript') {
        console.log('⚡ Executing code...');
        return this.send({
            type: 'code_execution',
            code: code,
            language: language,
            timestamp: new Date().toISOString()
        });
    }

    validateDesign(designData) {
        console.log('✅ Validating design...');
        return this.send({
            type: 'design_validation',
            designData: designData,
            validation: {
                checkPrintSpecs: true,
                checkColorProfile: true,
                checkResolution: true,
                checkDimensions: true
            },
            timestamp: new Date().toISOString()
        });
    }

    // Event System
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }

    getStatus() {
        return {
            connected: this.isConnected,
            sessionId: this.sessionId,
            reconnectAttempts: this.reconnectAttempts
        };
    }
}

// WordPress Integration Helper
class WordPressAITestIntegration {
    constructor() {
        this.client = new AITestClient();
        this.setupWordPressIntegration();
        this.setupUI();
    }

    setupWordPressIntegration() {
        // Listen for WordPress events
        this.client.on('connected', () => {
            this.updateConnectionStatus('connected');
        });

        this.client.on('disconnected', () => {
            this.updateConnectionStatus('disconnected');
        });

        this.client.on('test_started', (data) => {
            this.showTestProgress('Test started', 0);
        });

        this.client.on('progress', (data) => {
            this.showTestProgress(data.step, data.progress);
        });

        this.client.on('test_completed', (data) => {
            this.showTestResults(data.result);
        });

        this.client.on('validation_result', (data) => {
            this.showValidationResults(data.result);
        });

        this.client.on('code_result', (data) => {
            this.showCodeResults(data.result);
        });
    }

    setupUI() {
        // Add AI Test panel to WordPress admin
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.createTestPanel();
            });
        } else {
            this.createTestPanel();
        }
    }

    createTestPanel() {
        const testPanel = document.createElement('div');
        testPanel.id = 'ai-test-panel';
        testPanel.style.cssText = `
            position: fixed;
            top: 32px;
            right: 20px;
            width: 300px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        testPanel.innerHTML = `
            <div style="padding: 15px; border-bottom: 1px solid #eee;">
                <h3 style="margin: 0; font-size: 14px; font-weight: 600;">
                    🤖 AI Test Integration
                </h3>
                <div id="connection-status" style="font-size: 12px; margin-top: 5px;">
                    Connecting...
                </div>
            </div>
            <div style="padding: 15px;">
                <button id="test-current-design" style="width: 100%; padding: 8px; margin-bottom: 10px; background: #0073aa; color: white; border: none; border-radius: 3px; cursor: pointer;">
                    Test Current Design
                </button>
                <button id="validate-design" style="width: 100%; padding: 8px; margin-bottom: 10px; background: #00a32a; color: white; border: none; border-radius: 3px; cursor: pointer;">
                    Validate Design
                </button>
                <div id="test-progress" style="display: none;">
                    <div style="font-size: 12px; margin-bottom: 5px;" id="progress-text">Initializing...</div>
                    <div style="background: #f0f0f0; border-radius: 10px; overflow: hidden;">
                        <div id="progress-bar" style="background: #0073aa; height: 20px; width: 0%; transition: width 0.3s;"></div>
                    </div>
                </div>
                <div id="test-results" style="display: none; margin-top: 10px; padding: 10px; background: #f9f9f9; border-radius: 3px; font-size: 12px;">
                </div>
            </div>
        `;

        document.body.appendChild(testPanel);

        // Add event listeners
        document.getElementById('test-current-design').addEventListener('click', () => {
            this.testCurrentDesign();
        });

        document.getElementById('validate-design').addEventListener('click', () => {
            this.validateCurrentDesign();
        });
    }

    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            if (status === 'connected') {
                statusElement.innerHTML = '✅ Connected to AI Test Server';
                statusElement.style.color = 'green';
            } else {
                statusElement.innerHTML = '❌ Disconnected';
                statusElement.style.color = 'red';
            }
        }
    }

    showTestProgress(step, progress) {
        const progressElement = document.getElementById('test-progress');
        const progressText = document.getElementById('progress-text');
        const progressBar = document.getElementById('progress-bar');

        if (progressElement && progressText && progressBar) {
            progressElement.style.display = 'block';
            progressText.textContent = step;
            progressBar.style.width = `${progress}%`;
        }
    }

    showTestResults(result) {
        const resultsElement = document.getElementById('test-results');
        const progressElement = document.getElementById('test-progress');

        if (resultsElement && progressElement) {
            progressElement.style.display = 'none';
            resultsElement.style.display = 'block';

            resultsElement.innerHTML = `
                <strong>Test Results:</strong><br>
                Tests Run: ${result.testsRun}<br>
                Passed: ${result.testsPassed}<br>
                Failed: ${result.testsFailed}<br>
                Execution Time: ${result.executionTime}ms
            `;
        }
    }

    showValidationResults(result) {
        const resultsElement = document.getElementById('test-results');

        if (resultsElement) {
            resultsElement.style.display = 'block';

            const statusColor = result.isValid ? 'green' : 'red';
            const statusText = result.isValid ? 'Valid' : 'Issues Found';

            resultsElement.innerHTML = `
                <strong>Validation Results:</strong><br>
                <span style="color: ${statusColor}">Status: ${statusText}</span><br>
                Score: ${result.score}/100<br>
                ${result.issues.length > 0 ? `Issues: ${result.issues.join(', ')}` : ''}
            `;
        }
    }

    showCodeResults(result) {
        const resultsElement = document.getElementById('test-results');

        if (resultsElement) {
            resultsElement.style.display = 'block';

            resultsElement.innerHTML = `
                <strong>Execution Results:</strong><br>
                Status: ${result.success ? 'Success' : 'Failed'}<br>
                Execution Time: ${result.executionTime}ms<br>
                ${result.output ? `Output: ${result.output}` : ''}
            `;
        }
    }

    testCurrentDesign() {
        // Get current design data from WordPress/plugin
        const designData = this.getCurrentDesignData();
        this.client.runDesignTest(designData);
    }

    validateCurrentDesign() {
        const designData = this.getCurrentDesignData();
        this.client.validateDesign(designData);
    }

    getCurrentDesignData() {
        // This would integrate with your actual plugin data
        // For now, returning mock data
        return {
            type: 'print_design',
            elements: [
                { type: 'text', content: 'Sample Text', size: 12 },
                { type: 'image', src: 'sample.jpg', width: 100, height: 100 }
            ],
            dimensions: { width: 200, height: 300 },
            dpi: 300,
            colorProfile: 'CMYK'
        };
    }

    // Public API for other scripts
    getClient() {
        return this.client;
    }
}

// Initialize when script loads
let wpAITest = null;

if (typeof window !== 'undefined') {
    // Browser environment
    window.AITestClient = AITestClient;
    window.WordPressAITestIntegration = WordPressAITestIntegration;

    // Auto-initialize in WordPress admin
    if (window.location.pathname.includes('wp-admin')) {
        wpAITest = new WordPressAITestIntegration();
        window.wpAITest = wpAITest;
    }
} else if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = { AITestClient, WordPressAITestIntegration };
}