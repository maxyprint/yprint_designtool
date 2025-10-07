/**
 * 🔌 DIRECT COORDINATE TESTING INTEGRATION
 *
 * Einfache Integration des DirectCoordinate Testing Frameworks
 * in bestehende Seiten ohne Störung des Produktivbetriebs
 *
 * USAGE:
 * 1. Script in bestehende Seite einbinden
 * 2. URL Parameter ?coordinate_testing=1 verwenden
 * 3. Testing Interface erscheint automatisch
 */

(function() {
    'use strict';

    console.log('🔌 COORDINATE TESTING INTEGRATION: Checking activation...');

    // Check if testing should be activated
    const urlParams = new URLSearchParams(window.location.search);
    const isTestingActive = urlParams.get('coordinate_testing') === '1';

    if (!isTestingActive) {
        console.log('🔌 COORDINATE TESTING: Not activated. Use ?coordinate_testing=1 to activate.');
        return;
    }

    console.log('🔌 COORDINATE TESTING: Active! Setting up integration...');

    // Integration Manager
    window.CoordinateTestingIntegration = class {
        constructor() {
            this.initialized = false;
            this.testingFrameworkLoaded = false;
            this.uiCreated = false;

            this.init();
        }

        async init() {
            console.log('🚀 COORDINATE TESTING INTEGRATION: Initializing...');

            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupIntegration());
            } else {
                this.setupIntegration();
            }
        }

        async setupIntegration() {
            try {
                // Load the testing framework if not already loaded
                await this.loadTestingFramework();

                // Wait for framework to initialize
                await this.waitForFramework();

                // Create testing UI
                this.createTestingUI();

                // Set up keyboard shortcuts
                this.setupKeyboardShorts();

                this.initialized = true;
                console.log('✅ COORDINATE TESTING INTEGRATION: Setup complete!');

            } catch (error) {
                console.error('❌ COORDINATE TESTING INTEGRATION: Setup failed:', error);
            }
        }

        /**
         * Load the testing framework script dynamically
         */
        async loadTestingFramework() {
            // Check if already loaded
            if (typeof window.DirectCoordinateTester !== 'undefined') {
                this.testingFrameworkLoaded = true;
                return;
            }

            console.log('📥 Loading DirectCoordinate Testing Framework...');

            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = './js/direct-coordinate-tester.js';
                script.onload = () => {
                    this.testingFrameworkLoaded = true;
                    console.log('✅ Testing framework loaded successfully');
                    resolve();
                };
                script.onerror = () => {
                    reject(new Error('Failed to load testing framework'));
                };
                document.head.appendChild(script);
            });
        }

        /**
         * Wait for framework to initialize
         */
        async waitForFramework() {
            console.log('⏳ Waiting for framework initialization...');

            let attempts = 0;
            const maxAttempts = 20;

            while (attempts < maxAttempts) {
                if (typeof window.DirectCoordinateTest !== 'undefined') {
                    console.log('✅ Framework ready!');
                    return;
                }

                await this.delay(500);
                attempts++;
            }

            throw new Error('Framework initialization timeout');
        }

        /**
         * Create floating testing UI
         */
        createTestingUI() {
            if (this.uiCreated) return;

            console.log('🎨 Creating testing UI...');

            // Create main container
            const container = document.createElement('div');
            container.id = 'coordinate-testing-ui';
            container.innerHTML = this.getUIHTML();

            // Apply styles
            const style = document.createElement('style');
            style.textContent = this.getUICSS();
            document.head.appendChild(style);

            // Add to page
            document.body.appendChild(container);

            // Set up event listeners
            this.setupUIEvents();

            this.uiCreated = true;
            console.log('✅ Testing UI created');
        }

        /**
         * Get HTML for testing UI
         */
        getUIHTML() {
            return `
                <div class="coord-test-panel" id="coordTestPanel">
                    <div class="coord-test-header">
                        <h3>🧪 Coordinate Testing</h3>
                        <div class="coord-test-controls">
                            <button class="coord-test-btn coord-test-btn-minimize" id="minimizeBtn">−</button>
                            <button class="coord-test-btn coord-test-btn-close" id="closeBtn">×</button>
                        </div>
                    </div>

                    <div class="coord-test-content" id="coordTestContent">
                        <div class="coord-test-status" id="testingStatus">
                            <div class="coord-test-loading">Initializing...</div>
                        </div>

                        <div class="coord-test-actions">
                            <button class="coord-test-action-btn" onclick="window.testingIntegration.runQuickTest()">
                                🎯 Quick Test
                            </button>
                            <button class="coord-test-action-btn" onclick="window.testingIntegration.showOverlay()">
                                🎨 Visual Overlay
                            </button>
                            <button class="coord-test-action-btn" onclick="window.testingIntegration.runFullSuite()">
                                🚀 Full Suite
                            </button>
                            <button class="coord-test-action-btn" onclick="window.testingIntegration.openConsole()">
                                🛠️ Console
                            </button>
                        </div>

                        <div class="coord-test-results" id="testResults">
                            <div class="coord-test-info">
                                <strong>Available Systems:</strong> <span id="systemCount">-</span><br>
                                <strong>Status:</strong> <span id="frameworkStatus">Initializing</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="coord-test-toggle" id="coordTestToggle" title="Toggle Coordinate Testing">
                    🧪
                </div>
            `;
        }

        /**
         * Get CSS for testing UI
         */
        getUICSS() {
            return `
                #coordinate-testing-ui {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 99999;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 13px;
                }

                .coord-test-panel {
                    background: white;
                    border: 2px solid #007cba;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    width: 300px;
                    max-height: 500px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }

                .coord-test-panel.minimized .coord-test-content {
                    display: none;
                }

                .coord-test-header {
                    background: linear-gradient(135deg, #007cba 0%, #005a87 100%);
                    color: white;
                    padding: 10px 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: move;
                }

                .coord-test-header h3 {
                    margin: 0;
                    font-size: 14px;
                    font-weight: 600;
                }

                .coord-test-controls {
                    display: flex;
                    gap: 5px;
                }

                .coord-test-btn {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    width: 20px;
                    height: 20px;
                    border-radius: 3px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 12px;
                    transition: background 0.2s ease;
                }

                .coord-test-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                .coord-test-content {
                    padding: 15px;
                }

                .coord-test-status {
                    background: #f8f9fa;
                    border: 1px solid #e9ecef;
                    border-radius: 4px;
                    padding: 10px;
                    margin-bottom: 15px;
                }

                .coord-test-loading {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .coord-test-loading::before {
                    content: '';
                    width: 12px;
                    height: 12px;
                    border: 2px solid #f3f3f3;
                    border-top: 2px solid #007cba;
                    border-radius: 50%;
                    animation: coord-test-spin 1s linear infinite;
                }

                @keyframes coord-test-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .coord-test-actions {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    margin-bottom: 15px;
                }

                .coord-test-action-btn {
                    background: #007cba;
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 11px;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }

                .coord-test-action-btn:hover {
                    background: #005a87;
                    transform: translateY(-1px);
                }

                .coord-test-action-btn:active {
                    transform: translateY(0);
                }

                .coord-test-results {
                    background: #f8f9fa;
                    border: 1px solid #e9ecef;
                    border-radius: 4px;
                    padding: 10px;
                    font-size: 11px;
                    line-height: 1.4;
                }

                .coord-test-info {
                    color: #495057;
                }

                .coord-test-toggle {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: #007cba;
                    color: white;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    cursor: pointer;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                    transition: all 0.3s ease;
                    z-index: 99998;
                }

                .coord-test-toggle:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                }

                .coord-test-hidden {
                    display: none !important;
                }

                /* Success/Error states */
                .coord-test-success {
                    background: #d4edda !important;
                    border-color: #c3e6cb !important;
                    color: #155724 !important;
                }

                .coord-test-error {
                    background: #f8d7da !important;
                    border-color: #f5c6cb !important;
                    color: #721c24 !important;
                }

                .coord-test-warning {
                    background: #fff3cd !important;
                    border-color: #ffeaa7 !important;
                    color: #856404 !important;
                }
            `;
        }

        /**
         * Set up UI event listeners
         */
        setupUIEvents() {
            // Minimize/maximize
            document.getElementById('minimizeBtn').addEventListener('click', () => {
                const panel = document.getElementById('coordTestPanel');
                panel.classList.toggle('minimized');
            });

            // Close panel
            document.getElementById('closeBtn').addEventListener('click', () => {
                document.getElementById('coordinate-testing-ui').style.display = 'none';
            });

            // Toggle visibility
            document.getElementById('coordTestToggle').addEventListener('click', () => {
                const ui = document.getElementById('coordinate-testing-ui');
                ui.style.display = ui.style.display === 'none' ? 'block' : 'none';
            });

            // Make panel draggable
            this.makeDraggable();

            // Update status regularly
            setInterval(() => this.updateStatus(), 2000);
            this.updateStatus();
        }

        /**
         * Make panel draggable
         */
        makeDraggable() {
            const panel = document.getElementById('coordTestPanel');
            const header = panel.querySelector('.coord-test-header');

            let isDragging = false;
            let dragOffset = { x: 0, y: 0 };

            header.addEventListener('mousedown', (e) => {
                isDragging = true;
                const rect = panel.getBoundingClientRect();
                dragOffset.x = e.clientX - rect.left;
                dragOffset.y = e.clientY - rect.top;
                document.addEventListener('mousemove', handleDrag);
                document.addEventListener('mouseup', stopDrag);
            });

            function handleDrag(e) {
                if (!isDragging) return;

                const container = document.getElementById('coordinate-testing-ui');
                container.style.left = (e.clientX - dragOffset.x) + 'px';
                container.style.top = (e.clientY - dragOffset.y) + 'px';
                container.style.right = 'auto';
            }

            function stopDrag() {
                isDragging = false;
                document.removeEventListener('mousemove', handleDrag);
                document.removeEventListener('mouseup', stopDrag);
            }
        }

        /**
         * Update status display
         */
        updateStatus() {
            const systemCountEl = document.getElementById('systemCount');
            const frameworkStatusEl = document.getElementById('frameworkStatus');
            const statusEl = document.getElementById('testingStatus');

            if (typeof window.DirectCoordinateTest !== 'undefined') {
                const systems = window.DirectCoordinateTest.getCoordinateSystems();
                const systemCount = Object.keys(systems).length;

                systemCountEl.textContent = systemCount;
                frameworkStatusEl.textContent = 'Ready';
                statusEl.className = 'coord-test-status coord-test-success';
                statusEl.innerHTML = '<strong>✅ Framework Ready</strong><br>All systems operational';
            } else {
                systemCountEl.textContent = '0';
                frameworkStatusEl.textContent = 'Loading...';
                statusEl.className = 'coord-test-status coord-test-warning';
                statusEl.innerHTML = '<div class="coord-test-loading">Loading framework...</div>';
            }
        }

        /**
         * Setup keyboard shortcuts
         */
        setupKeyboardShorts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl+Shift+T: Toggle testing UI
                if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                    e.preventDefault();
                    const ui = document.getElementById('coordinate-testing-ui');
                    ui.style.display = ui.style.display === 'none' ? 'block' : 'none';
                }

                // Ctrl+Shift+C: Quick coordinate test
                if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                    e.preventDefault();
                    this.runQuickTest();
                }

                // Ctrl+Shift+V: Visual overlay
                if (e.ctrlKey && e.shiftKey && e.key === 'V') {
                    e.preventDefault();
                    this.showOverlay();
                }
            });

            console.log('⌨️  Keyboard shortcuts active:');
            console.log('   Ctrl+Shift+T: Toggle testing UI');
            console.log('   Ctrl+Shift+C: Quick coordinate test');
            console.log('   Ctrl+Shift+V: Visual overlay');
        }

        /**
         * Testing action methods
         */
        async runQuickTest() {
            if (typeof window.DirectCoordinateTest === 'undefined') {
                this.showMessage('Framework not ready', 'error');
                return;
            }

            this.showMessage('Running quick test...', 'info');

            try {
                const result = await window.DirectCoordinateTest.compareSystemsAccuracy();
                const summary = result.summary;

                this.showMessage(
                    `Quick Test Complete<br>
                    Systems: ${summary.totalSystems}<br>
                    Accuracy: ${summary.overallAccuracy}<br>
                    Best: ${summary.mostAccurateSystem?.name || 'N/A'}`,
                    'success'
                );

                console.log('🧪 Quick Test Results:', result);
            } catch (error) {
                this.showMessage(`Test failed: ${error.message}`, 'error');
            }
        }

        showOverlay() {
            if (typeof window.DirectCoordinateTest === 'undefined') {
                this.showMessage('Framework not ready', 'error');
                return;
            }

            try {
                window.DirectCoordinateTest.visualizeCoordinates();
                this.showMessage('Visual overlay activated', 'success');
            } catch (error) {
                this.showMessage(`Overlay failed: ${error.message}`, 'error');
            }
        }

        async runFullSuite() {
            if (typeof window.DirectCoordinateTest === 'undefined') {
                this.showMessage('Framework not ready', 'error');
                return;
            }

            this.showMessage('Running full test suite...', 'info');

            try {
                const accuracyResult = await window.DirectCoordinateTest.compareSystemsAccuracy();
                const performanceResult = await window.DirectCoordinateTest.measurePerformance();
                const report = await window.DirectCoordinateTest.generateReport();

                this.showMessage(
                    `Full Suite Complete<br>
                    Overall: ${report.summary.overallAssessment}<br>
                    See console for details`,
                    'success'
                );

                console.log('🚀 Full Test Suite Results:');
                console.log('📊 Accuracy:', accuracyResult);
                console.log('⚡ Performance:', performanceResult);
                console.log('📄 Report:', report);
            } catch (error) {
                this.showMessage(`Suite failed: ${error.message}`, 'error');
            }
        }

        openConsole() {
            console.log('🛠️  COORDINATE TESTING CONSOLE');
            console.log('Available commands:');
            console.log('  DirectCoordinateTest.compareSystemsAccuracy()');
            console.log('  DirectCoordinateTest.measurePerformance()');
            console.log('  DirectCoordinateTest.validateConsistency()');
            console.log('  DirectCoordinateTest.generateReport()');
            console.log('  DirectCoordinateTest.visualizeCoordinates()');
            console.log('  DirectCoordinateTest.getTestResults()');

            this.showMessage('Console commands logged', 'success');
        }

        /**
         * Show message in UI
         */
        showMessage(message, type) {
            const statusEl = document.getElementById('testingStatus');
            const className = `coord-test-status coord-test-${type}`;

            statusEl.className = className;
            statusEl.innerHTML = message;

            // Reset to normal after 3 seconds
            setTimeout(() => {
                this.updateStatus();
            }, 3000);
        }

        /**
         * Utility delay function
         */
        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    };

    // Initialize integration
    window.testingIntegration = new window.CoordinateTestingIntegration();

    console.log('🔌 COORDINATE TESTING INTEGRATION: Ready!');

})();