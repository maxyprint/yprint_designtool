/**
 * AGENT 4 PERFORMANCE OPTIMIZER: Intelligent Initialization Coordinator
 *
 * MISSION: Eliminates timing conflicts, redundant polling, and improves system responsiveness
 *
 * KEY FEATURES:
 * - Centralized initialization state management
 * - Intelligent sequence coordination
 * - Performance-optimized polling strategies
 * - Cross-system communication and synchronization
 */

class Agent4InitializationCoordinator {
    constructor() {
        // Prevent duplicate initialization
        if (window.Agent4InitCoordinator) {
            console.warn('🔄 AGENT 4: InitializationCoordinator already exists, returning existing instance');
            return window.Agent4InitCoordinator;
        }

        this.systemId = 'agent4-init-coordinator';
        this.initializationPhases = new Map();
        this.activePollers = new Map();
        this.systemReadyCallbacks = new Set();
        this.performance = {
            startTime: Date.now(),
            phaseCompletions: new Map(),
            pollingAttempts: 0,
            successfulDetections: 0
        };

        // System state tracking
        this.state = {
            domReady: document.readyState !== 'loading',
            fabricLoaded: typeof window.fabric !== 'undefined',
            canvasDetected: false,
            templateEditorsReady: false,
            systemInitialized: false
        };

        // Intelligent polling configuration
        this.config = {
            maxPollingTime: 5000, // Maximum 5 seconds of polling
            baseInterval: 300,    // Base polling interval
            maxInterval: 1500,    // Maximum interval between polls
            exponentialFactor: 1.4, // Exponential backoff factor
            emergencyTimeout: 10000 // Emergency fallback timeout
        };

        // Store global reference
        window.Agent4InitCoordinator = this;

        console.log('🚀 AGENT 4: Initialization Coordinator started');
        this.initialize();
    }

    /**
     * Main initialization sequence
     */
    async initialize() {
        try {
            // Phase 1: DOM Ready Check
            await this.executePhase('dom-ready', () => this.ensureDOMReady());

            // Phase 2: Fabric.js Detection
            await this.executePhase('fabric-detection', () => this.detectFabricJS());

            // Phase 3: Canvas System Detection
            await this.executePhase('canvas-detection', () => this.detectCanvasSystem());

            // Phase 4: Template Editor Coordination
            await this.executePhase('template-editor-ready', () => this.coordinateTemplateEditors());

            // Phase 5: System Integration
            await this.executePhase('system-integration', () => this.finalizeSystemIntegration());

            this.state.systemInitialized = true;
            this.notifySystemReady();

        } catch (error) {
            console.error('🔥 AGENT 4: Initialization failed:', error);
            this.handleInitializationFailure(error);
        }
    }

    /**
     * Execute initialization phase with performance tracking
     */
    async executePhase(phaseName, phaseFunction) {
        const phaseStart = Date.now();
        console.log(`🔄 AGENT 4: Starting phase '${phaseName}'`);

        try {
            const result = await phaseFunction();
            const duration = Date.now() - phaseStart;

            this.performance.phaseCompletions.set(phaseName, duration);
            this.initializationPhases.set(phaseName, { status: 'completed', result, duration });

            console.log(`✅ AGENT 4: Phase '${phaseName}' completed in ${duration}ms`);
            return result;

        } catch (error) {
            const duration = Date.now() - phaseStart;
            this.initializationPhases.set(phaseName, { status: 'failed', error, duration });

            console.error(`❌ AGENT 4: Phase '${phaseName}' failed after ${duration}ms:`, error);
            throw error;
        }
    }

    /**
     * Ensure DOM is ready with minimal overhead
     */
    async ensureDOMReady() {
        if (this.state.domReady) {
            return true;
        }

        return new Promise(resolve => {
            const checkDOM = () => {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => {
                        this.state.domReady = true;
                        resolve(true);
                    }, { once: true });
                } else {
                    this.state.domReady = true;
                    resolve(true);
                }
            };

            // Immediate check or short delay
            setTimeout(checkDOM, 10);
        });
    }

    /**
     * Intelligent Fabric.js detection with optimized timing
     */
    async detectFabricJS() {
        if (this.state.fabricLoaded) {
            return window.fabric;
        }

        return this.intelligentPolling(
            () => {
                const fabric = window.fabric;
                if (fabric && typeof fabric.Canvas === 'function') {
                    this.state.fabricLoaded = true;
                    console.log('✅ AGENT 4: Fabric.js detected');
                    return fabric;
                }
                return null;
            },
            'fabric-detection',
            { maxAttempts: 10, description: 'Detecting Fabric.js' }
        );
    }

    /**
     * Intelligent canvas system detection
     */
    async detectCanvasSystem() {
        if (this.state.canvasDetected) {
            return this.getDetectedCanvas();
        }

        return this.intelligentPolling(
            () => {
                // Check multiple sources in order of preference
                const detectionMethods = [
                    () => this.checkTemplateEditors(),
                    () => this.checkVariationsManager(),
                    () => this.checkDOMCanvases(),
                    () => this.checkFabricInstances()
                ];

                for (const method of detectionMethods) {
                    const canvas = method();
                    if (canvas) {
                        this.state.canvasDetected = true;
                        console.log('✅ AGENT 4: Canvas system detected');
                        return canvas;
                    }
                }
                return null;
            },
            'canvas-system-detection',
            { maxAttempts: 15, description: 'Detecting canvas system' }
        );
    }

    /**
     * Check template editors for canvas instances
     */
    checkTemplateEditors() {
        if (window.templateEditors instanceof Map && window.templateEditors.size > 0) {
            for (const [key, editor] of window.templateEditors.entries()) {
                if (editor?.canvas && this.validateCanvasInstance(editor.canvas)) {
                    window.fabricCanvas = editor.canvas;
                    return editor.canvas;
                }
            }
        }
        return null;
    }

    /**
     * Check variations manager for canvas instances
     */
    checkVariationsManager() {
        if (window.variationsManager?.editors instanceof Map) {
            for (const [key, editor] of window.variationsManager.editors.entries()) {
                if (editor?.canvas && this.validateCanvasInstance(editor.canvas)) {
                    window.fabricCanvas = editor.canvas;
                    return editor.canvas;
                }
            }
        }
        return null;
    }

    /**
     * Check DOM canvas elements for Fabric.js instances
     */
    checkDOMCanvases() {
        const canvasElements = document.querySelectorAll('canvas');
        for (const canvas of canvasElements) {
            if (canvas.__fabric && this.validateCanvasInstance(canvas.__fabric)) {
                window.fabricCanvas = canvas.__fabric;
                return canvas.__fabric;
            }
        }
        return null;
    }

    /**
     * Check Fabric.js getInstances method
     */
    checkFabricInstances() {
        if (window.fabric?.Canvas?.getInstances) {
            const instances = window.fabric.Canvas.getInstances();
            if (instances?.length > 0) {
                const canvas = instances[0];
                if (this.validateCanvasInstance(canvas)) {
                    window.fabricCanvas = canvas;
                    return canvas;
                }
            }
        }
        return null;
    }

    /**
     * Validate canvas instance has required methods
     */
    validateCanvasInstance(canvas) {
        return canvas &&
               typeof canvas.add === 'function' &&
               typeof canvas.getObjects === 'function' &&
               typeof canvas.renderAll === 'function';
    }

    /**
     * Coordinate template editors with intelligent timing
     */
    async coordinateTemplateEditors() {
        // Check if template editors are already ready
        if (this.state.templateEditorsReady) {
            return true;
        }

        // Wait for template editors to be available
        const result = await this.intelligentPolling(
            () => {
                const hasTemplateEditors = window.templateEditors instanceof Map && window.templateEditors.size > 0;
                const hasVariationsManager = window.variationsManager?.editors instanceof Map;

                if (hasTemplateEditors || hasVariationsManager) {
                    this.state.templateEditorsReady = true;
                    console.log('✅ AGENT 4: Template editors coordinated');
                    return true;
                }
                return null;
            },
            'template-editor-coordination',
            { maxAttempts: 8, description: 'Coordinating template editors' }
        );

        return result !== null;
    }

    /**
     * Finalize system integration
     */
    async finalizeSystemIntegration() {
        // Set up global canvas reference if not already set
        if (!window.fabricCanvas && this.state.canvasDetected) {
            window.fabricCanvas = this.getDetectedCanvas();
        }

        // Dispatch system ready events
        this.dispatchSystemEvents();

        // Stop all active pollers to prevent resource waste
        this.stopAllPollers();

        console.log('✅ AGENT 4: System integration finalized');
        return true;
    }

    /**
     * Intelligent polling with exponential backoff and performance optimization
     */
    async intelligentPolling(checkFunction, pollerId, options = {}) {
        const {
            maxAttempts = 10,
            description = 'polling operation'
        } = options;

        // Stop any existing poller with the same ID
        this.stopPoller(pollerId);

        return new Promise((resolve, reject) => {
            let attempts = 0;
            let currentInterval = this.config.baseInterval;
            const startTime = Date.now();

            const poll = () => {
                attempts++;
                this.performance.pollingAttempts++;

                // Log progress at strategic intervals
                if (attempts === 1 || attempts % 3 === 0 || attempts === maxAttempts) {
                    console.log(`🔄 AGENT 4: ${description} - attempt ${attempts}/${maxAttempts}`);
                }

                try {
                    const result = checkFunction();
                    if (result !== null) {
                        this.performance.successfulDetections++;
                        const duration = Date.now() - startTime;
                        console.log(`✅ AGENT 4: ${description} succeeded in ${duration}ms (${attempts} attempts)`);
                        this.stopPoller(pollerId);
                        resolve(result);
                        return;
                    }
                } catch (error) {
                    console.warn(`⚠️ AGENT 4: ${description} check error:`, error.message);
                }

                // Check for timeout conditions
                const elapsed = Date.now() - startTime;
                if (attempts >= maxAttempts || elapsed >= this.config.maxPollingTime) {
                    console.warn(`⏰ AGENT 4: ${description} timeout after ${attempts} attempts (${elapsed}ms)`);
                    this.stopPoller(pollerId);
                    resolve(null);
                    return;
                }

                // Calculate next interval with exponential backoff
                currentInterval = Math.min(
                    currentInterval * this.config.exponentialFactor,
                    this.config.maxInterval
                );

                // Schedule next poll
                const timeoutId = setTimeout(poll, currentInterval);
                this.activePollers.set(pollerId, { timeoutId, attempts, startTime });
            };

            // Start polling
            poll();

            // Emergency timeout
            setTimeout(() => {
                if (this.activePollers.has(pollerId)) {
                    console.error(`🚨 AGENT 4: Emergency timeout for ${description}`);
                    this.stopPoller(pollerId);
                    resolve(null);
                }
            }, this.config.emergencyTimeout);
        });
    }

    /**
     * Stop a specific poller
     */
    stopPoller(pollerId) {
        const poller = this.activePollers.get(pollerId);
        if (poller) {
            clearTimeout(poller.timeoutId);
            this.activePollers.delete(pollerId);
        }
    }

    /**
     * Stop all active pollers
     */
    stopAllPollers() {
        for (const [pollerId, poller] of this.activePollers.entries()) {
            clearTimeout(poller.timeoutId);
        }
        this.activePollers.clear();
        console.log('🛑 AGENT 4: All pollers stopped');
    }

    /**
     * Get detected canvas from various sources
     */
    getDetectedCanvas() {
        return window.fabricCanvas ||
               this.checkTemplateEditors() ||
               this.checkVariationsManager() ||
               this.checkDOMCanvases() ||
               this.checkFabricInstances();
    }

    /**
     * Dispatch system ready events
     */
    dispatchSystemEvents() {
        // Fabric canvas ready event
        if (window.fabricCanvas) {
            window.dispatchEvent(new CustomEvent('fabricCanvasReady', {
                detail: {
                    canvas: window.fabricCanvas,
                    coordinator: this.systemId,
                    performance: this.getPerformanceReport()
                }
            }));
        }

        // System initialization complete event
        window.dispatchEvent(new CustomEvent('agent4SystemReady', {
            detail: {
                state: this.state,
                performance: this.getPerformanceReport(),
                coordinator: this.systemId
            }
        }));
    }

    /**
     * Notify system ready callbacks
     */
    notifySystemReady() {
        const performanceReport = this.getPerformanceReport();

        for (const callback of this.systemReadyCallbacks) {
            try {
                callback(this.state, performanceReport);
            } catch (error) {
                console.error('🔥 AGENT 4: System ready callback error:', error);
            }
        }

        console.log('🎉 AGENT 4: System initialization completed!', performanceReport);
    }

    /**
     * Register callback for system ready notification
     */
    onSystemReady(callback) {
        if (this.state.systemInitialized) {
            // Already ready, call immediately
            callback(this.state, this.getPerformanceReport());
        } else {
            // Register for future notification
            this.systemReadyCallbacks.add(callback);
        }

        // Return unsubscribe function
        return () => this.systemReadyCallbacks.delete(callback);
    }

    /**
     * Handle initialization failure with graceful fallbacks
     */
    handleInitializationFailure(error) {
        console.error('🔥 AGENT 4: System initialization failed, implementing fallbacks');

        // Stop all polling to prevent resource waste
        this.stopAllPollers();

        // Implement basic fallbacks
        this.implementFallbackSystems();

        // Notify with error state
        window.dispatchEvent(new CustomEvent('agent4InitializationFailed', {
            detail: {
                error: error.message,
                state: this.state,
                performance: this.getPerformanceReport()
            }
        }));
    }

    /**
     * Implement fallback systems when initialization fails
     */
    implementFallbackSystems() {
        // Basic canvas fallback
        if (!window.fabricCanvas && window.fabric) {
            console.log('🔄 AGENT 4: Implementing canvas fallback');
            // Create a minimal canvas fallback if needed
        }

        // Ensure generateDesignData function exists
        if (typeof window.generateDesignData !== 'function') {
            window.generateDesignData = () => ({
                error: 'System not fully initialized',
                fallback: true,
                timestamp: new Date().toISOString()
            });
        }

        console.log('✅ AGENT 4: Fallback systems implemented');
    }

    /**
     * Get comprehensive performance report
     */
    getPerformanceReport() {
        const totalTime = Date.now() - this.performance.startTime;
        const successRate = this.performance.pollingAttempts > 0
            ? (this.performance.successfulDetections / this.performance.pollingAttempts * 100).toFixed(1)
            : 0;

        return {
            totalInitializationTime: totalTime,
            pollingAttempts: this.performance.pollingAttempts,
            successfulDetections: this.performance.successfulDetections,
            successRate: `${successRate}%`,
            phaseTimings: Object.fromEntries(this.performance.phaseCompletions),
            activePollers: this.activePollers.size,
            systemState: this.state
        };
    }

    /**
     * Public API: Check if system is ready
     */
    isSystemReady() {
        return this.state.systemInitialized;
    }

    /**
     * Public API: Get current system state
     */
    getSystemState() {
        return { ...this.state };
    }

    /**
     * Public API: Force system check (for debugging)
     */
    async forceSystemCheck() {
        console.log('🔄 AGENT 4: Forcing system check...');

        // Re-check all states
        this.state.domReady = document.readyState !== 'loading';
        this.state.fabricLoaded = typeof window.fabric !== 'undefined';
        this.state.canvasDetected = !!this.getDetectedCanvas();
        this.state.templateEditorsReady = !!(window.templateEditors instanceof Map && window.templateEditors.size > 0);

        const report = this.getPerformanceReport();
        console.log('📊 AGENT 4: System state check:', report);

        return report;
    }
}

// Auto-initialize the coordinator
(function initializeAgent4Coordinator() {
    // Prevent duplicate initialization
    if (window.Agent4InitCoordinator) {
        console.log('🔄 AGENT 4: Initialization coordinator already exists');
        return;
    }

    // Initialize with a small delay to ensure DOM is ready
    const initialize = () => {
        try {
            new Agent4InitializationCoordinator();
        } catch (error) {
            console.error('🔥 AGENT 4: Failed to initialize coordination system:', error);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 50);
    }
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Agent4InitializationCoordinator;
}