/**
 * AGENT 4 PERFORMANCE OPTIMIZER: Redundancy Elimination System
 *
 * MISSION: Eliminate redundant polling, coordinate cross-system operations,
 *          and improve overall system responsiveness
 *
 * FEATURES:
 * - Cross-system polling coordination
 * - Shared state management
 * - Performance monitoring and optimization
 * - Resource usage minimization
 */

class Agent4RedundancyEliminator {
    constructor() {
        // Prevent duplicate initialization
        if (window.Agent4RedundancyEliminator) {
            console.warn('🔄 AGENT 4: RedundancyEliminator already exists, returning existing instance');
            return window.Agent4RedundancyEliminator;
        }

        this.systemId = 'agent4-redundancy-eliminator';

        // Shared state across all systems
        this.sharedState = {
            fabricLoaded: false,
            canvasDetected: false,
            canvasInstance: null,
            templateEditorsReady: false,
            systemsInitialized: new Set(),
            lastUpdate: Date.now()
        };

        // System registration and coordination
        this.registeredSystems = new Map();
        this.activePollers = new Map();
        this.coordinatedCallbacks = new Map();

        // Performance tracking
        this.performance = {
            pollingAttemptsPrevented: 0,
            redundantCallsEliminated: 0,
            systemResponseTime: new Map(),
            resourceSavings: 0
        };

        // Configuration for optimization
        this.config = {
            stateUpdateThrottle: 100, // Maximum state update frequency (ms)
            coordinationTimeout: 5000, // Maximum coordination time
            maxConcurrentPollers: 2, // Maximum simultaneous pollers
            performanceReportInterval: 10000 // Performance report frequency
        };

        // Global registration
        window.Agent4RedundancyEliminator = this;

        console.log('🚀 AGENT 4: Redundancy Eliminator initialized');
        this.initialize();
    }

    /**
     * Initialize the redundancy elimination system
     */
    initialize() {
        // Set up state monitoring
        this.setupStateMonitoring();

        // Coordinate with existing systems
        this.coordinateExistingSystems();

        // Start performance monitoring
        this.startPerformanceMonitoring();

        // Set up cross-system event coordination
        this.setupEventCoordination();

        console.log('✅ AGENT 4: Redundancy elimination system active');
    }

    /**
     * Register a system for coordination
     */
    registerSystem(systemId, config = {}) {
        if (this.registeredSystems.has(systemId)) {
            console.warn(`🔄 AGENT 4: System '${systemId}' already registered`);
            return this.registeredSystems.get(systemId);
        }

        const systemConfig = {
            id: systemId,
            needsFabric: config.needsFabric || false,
            needsCanvas: config.needsCanvas || false,
            needsTemplateEditors: config.needsTemplateEditors || false,
            pollingFunction: config.pollingFunction || null,
            onStateChange: config.onStateChange || null,
            priority: config.priority || 'normal',
            registered: Date.now()
        };

        this.registeredSystems.set(systemId, systemConfig);
        console.log(`📝 AGENT 4: System '${systemId}' registered for coordination`);

        // If system needs current state, provide it immediately
        if (this.shouldNotifySystem(systemConfig)) {
            this.notifySystem(systemId, this.sharedState);
        }

        return systemConfig;
    }

    /**
     * Coordinate polling requests to prevent redundancy
     */
    async coordinatePolling(systemId, pollingConfig = {}) {
        const {
            checkFunction,
            description = 'polling operation',
            maxAttempts = 10,
            priority = 'normal'
        } = pollingConfig;

        // Check if we already have what this system needs
        if (this.canSatisfyFromSharedState(systemId, pollingConfig)) {
            this.performance.pollingAttemptsPrevented++;
            console.log(`⚡ AGENT 4: Satisfied ${systemId} polling from shared state`);
            return this.getStateForSystem(systemId);
        }

        // Check if similar polling is already in progress
        const existingPoller = this.findSimilarPoller(pollingConfig);
        if (existingPoller) {
            this.performance.redundantCallsEliminated++;
            console.log(`🔗 AGENT 4: Coordinating ${systemId} with existing poller`);
            return this.attachToExistingPoller(systemId, existingPoller);
        }

        // Start new coordinated polling
        return this.startCoordinatedPolling(systemId, pollingConfig);
    }

    /**
     * Check if we can satisfy a system's needs from shared state
     */
    canSatisfyFromSharedState(systemId, config) {
        const system = this.registeredSystems.get(systemId);
        if (!system) return false;

        if (system.needsFabric && !this.sharedState.fabricLoaded) return false;
        if (system.needsCanvas && !this.sharedState.canvasDetected) return false;
        if (system.needsTemplateEditors && !this.sharedState.templateEditorsReady) return false;

        return true;
    }

    /**
     * Find similar active pollers to avoid redundancy
     */
    findSimilarPoller(config) {
        for (const [pollerId, pollerInfo] of this.activePollers.entries()) {
            if (this.pollersAreSimilar(config, pollerInfo.config)) {
                return pollerId;
            }
        }
        return null;
    }

    /**
     * Check if two pollers are looking for similar things
     */
    pollersAreSimilar(config1, config2) {
        // Simple similarity check - can be enhanced
        const type1 = this.getPollingType(config1);
        const type2 = this.getPollingType(config2);
        return type1 === type2;
    }

    /**
     * Determine polling type from configuration
     */
    getPollingType(config) {
        const description = config.description || '';
        if (description.includes('fabric')) return 'fabric';
        if (description.includes('canvas')) return 'canvas';
        if (description.includes('template')) return 'template';
        return 'generic';
    }

    /**
     * Attach system to existing poller
     */
    async attachToExistingPoller(systemId, existingPollerId) {
        const pollerInfo = this.activePollers.get(existingPollerId);
        if (!pollerInfo) {
            throw new Error(`Poller ${existingPollerId} not found`);
        }

        // Add system to coordinated callbacks
        if (!this.coordinatedCallbacks.has(existingPollerId)) {
            this.coordinatedCallbacks.set(existingPollerId, new Set());
        }
        this.coordinatedCallbacks.get(existingPollerId).add(systemId);

        // Wait for existing poller to complete
        return pollerInfo.promise;
    }

    /**
     * Start new coordinated polling operation
     */
    async startCoordinatedPolling(systemId, config) {
        // Check concurrent poller limit
        if (this.activePollers.size >= this.config.maxConcurrentPollers) {
            console.warn(`⚠️ AGENT 4: Max concurrent pollers reached, queuing ${systemId}`);
            await this.waitForPollerSlot();
        }

        const pollerId = `${systemId}-${Date.now()}`;
        const startTime = Date.now();

        console.log(`🔄 AGENT 4: Starting coordinated polling for ${systemId}`);

        const promise = new Promise(async (resolve, reject) => {
            let attempts = 0;
            const maxAttempts = config.maxAttempts || 10;
            const baseDelay = 300;

            const poll = async () => {
                attempts++;

                try {
                    // Run the check function
                    const result = await config.checkFunction();

                    if (result !== null && result !== undefined) {
                        // Update shared state
                        this.updateSharedState(config, result);

                        // Notify all coordinated systems
                        this.notifyCoordinatedSystems(pollerId, result);

                        // Clean up
                        this.cleanupPoller(pollerId);

                        resolve(result);
                        return;
                    }
                } catch (error) {
                    console.warn(`⚠️ AGENT 4: Polling check error for ${systemId}:`, error.message);
                }

                if (attempts >= maxAttempts) {
                    console.warn(`⏰ AGENT 4: Polling timeout for ${systemId} after ${attempts} attempts`);
                    this.cleanupPoller(pollerId);
                    resolve(null);
                    return;
                }

                // Exponential backoff
                const delay = Math.min(baseDelay * Math.pow(1.5, attempts), 1500);
                setTimeout(poll, delay);
            };

            // Start polling
            poll();
        });

        // Store poller info
        this.activePollers.set(pollerId, {
            systemId,
            config,
            promise,
            startTime
        });

        return promise;
    }

    /**
     * Update shared state when new information is discovered
     */
    updateSharedState(config, result) {
        const now = Date.now();
        let updated = false;

        // Update fabric state
        if (config.description?.includes('fabric') && result && !this.sharedState.fabricLoaded) {
            this.sharedState.fabricLoaded = true;
            window.fabric = result;
            updated = true;
        }

        // Update canvas state
        if ((config.description?.includes('canvas') || result?.add) && result && !this.sharedState.canvasDetected) {
            this.sharedState.canvasDetected = true;
            this.sharedState.canvasInstance = result;
            window.fabricCanvas = result;
            updated = true;
        }

        // Update template editor state
        if (config.description?.includes('template') && result && !this.sharedState.templateEditorsReady) {
            this.sharedState.templateEditorsReady = true;
            updated = true;
        }

        if (updated) {
            this.sharedState.lastUpdate = now;
            this.notifySystemsOfStateChange();
        }
    }

    /**
     * Notify all coordinated systems attached to a poller
     */
    notifyCoordinatedSystems(pollerId, result) {
        const coordinatedSystems = this.coordinatedCallbacks.get(pollerId);
        if (coordinatedSystems) {
            for (const systemId of coordinatedSystems) {
                this.notifySystem(systemId, result);
            }
        }
    }

    /**
     * Notify a specific system of state changes
     */
    notifySystem(systemId, data) {
        const system = this.registeredSystems.get(systemId);
        if (system && system.onStateChange) {
            try {
                system.onStateChange(data, this.sharedState);
            } catch (error) {
                console.error(`🔥 AGENT 4: Error notifying system ${systemId}:`, error);
            }
        }
    }

    /**
     * Notify all registered systems of shared state changes
     */
    notifySystemsOfStateChange() {
        // Throttle notifications to prevent spam
        if (!this._notificationThrottle) {
            this._notificationThrottle = setTimeout(() => {
                for (const [systemId, system] of this.registeredSystems.entries()) {
                    if (this.shouldNotifySystem(system)) {
                        this.notifySystem(systemId, this.sharedState);
                    }
                }
                this._notificationThrottle = null;
            }, this.config.stateUpdateThrottle);
        }
    }

    /**
     * Check if a system should be notified of current state
     */
    shouldNotifySystem(system) {
        if (system.needsFabric && this.sharedState.fabricLoaded) return true;
        if (system.needsCanvas && this.sharedState.canvasDetected) return true;
        if (system.needsTemplateEditors && this.sharedState.templateEditorsReady) return true;
        return false;
    }

    /**
     * Get state data appropriate for a specific system
     */
    getStateForSystem(systemId) {
        const system = this.registeredSystems.get(systemId);
        if (!system) return this.sharedState;

        const stateData = {};

        if (system.needsFabric && this.sharedState.fabricLoaded) {
            stateData.fabric = window.fabric;
        }

        if (system.needsCanvas && this.sharedState.canvasDetected) {
            stateData.canvas = this.sharedState.canvasInstance;
        }

        if (system.needsTemplateEditors && this.sharedState.templateEditorsReady) {
            stateData.templateEditorsReady = true;
        }

        return stateData;
    }

    /**
     * Clean up completed poller
     */
    cleanupPoller(pollerId) {
        this.activePollers.delete(pollerId);
        this.coordinatedCallbacks.delete(pollerId);

        // Track performance
        const endTime = Date.now();
        if (this.performance.systemResponseTime.has(pollerId)) {
            const startTime = this.performance.systemResponseTime.get(pollerId);
            const duration = endTime - startTime;
            this.performance.resourceSavings += Math.max(0, duration - 1000); // Savings from coordination
        }
    }

    /**
     * Wait for a poller slot to become available
     */
    async waitForPollerSlot() {
        return new Promise(resolve => {
            const checkSlot = () => {
                if (this.activePollers.size < this.config.maxConcurrentPollers) {
                    resolve();
                } else {
                    setTimeout(checkSlot, 100);
                }
            };
            checkSlot();
        });
    }

    /**
     * Set up state monitoring to detect external changes
     */
    setupStateMonitoring() {
        // Monitor for external fabric loading
        Object.defineProperty(window, '_fabricLoaded', {
            get: () => this.sharedState.fabricLoaded,
            set: (value) => {
                if (value && !this.sharedState.fabricLoaded) {
                    this.sharedState.fabricLoaded = true;
                    this.notifySystemsOfStateChange();
                }
            }
        });

        // Monitor for external canvas detection
        const originalFabricCanvas = window.fabricCanvas;
        Object.defineProperty(window, 'fabricCanvas', {
            get: () => this.sharedState.canvasInstance || originalFabricCanvas,
            set: (value) => {
                if (value && !this.sharedState.canvasDetected) {
                    this.sharedState.canvasDetected = true;
                    this.sharedState.canvasInstance = value;
                    this.notifySystemsOfStateChange();
                }
            }
        });

        console.log('👁️ AGENT 4: State monitoring active');
    }

    /**
     * Coordinate with existing systems
     */
    coordinateExistingSystems() {
        // Check if initialization coordinator exists
        if (window.Agent4InitCoordinator) {
            console.log('🤝 AGENT 4: Coordinating with initialization system');
            window.Agent4InitCoordinator.onSystemReady((state) => {
                this.sharedState = { ...this.sharedState, ...state };
                this.notifySystemsOfStateChange();
            });
        }

        // Check for existing fabric instances
        if (window.fabric && !this.sharedState.fabricLoaded) {
            this.sharedState.fabricLoaded = true;
            console.log('✅ AGENT 4: Detected existing Fabric.js');
        }

        // Check for existing canvas instances
        if (window.fabricCanvas && !this.sharedState.canvasDetected) {
            this.sharedState.canvasDetected = true;
            this.sharedState.canvasInstance = window.fabricCanvas;
            console.log('✅ AGENT 4: Detected existing canvas');
        }
    }

    /**
     * Set up cross-system event coordination
     */
    setupEventCoordination() {
        // Listen for fabric ready events
        window.addEventListener('fabricCanvasReady', (event) => {
            if (!this.sharedState.canvasDetected && event.detail?.canvas) {
                this.sharedState.canvasDetected = true;
                this.sharedState.canvasInstance = event.detail.canvas;
                this.notifySystemsOfStateChange();
            }
        });

        // Listen for system ready events
        window.addEventListener('agent4SystemReady', (event) => {
            if (event.detail?.state) {
                this.sharedState = { ...this.sharedState, ...event.detail.state };
                this.notifySystemsOfStateChange();
            }
        });

        console.log('🔗 AGENT 4: Event coordination established');
    }

    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        setInterval(() => {
            this.logPerformanceReport();
        }, this.config.performanceReportInterval);
    }

    /**
     * Log performance report
     */
    logPerformanceReport() {
        if (this.performance.pollingAttemptsPrevented > 0 || this.performance.redundantCallsEliminated > 0) {
            console.log('📊 AGENT 4: Performance Report', {
                pollingAttemptsPrevented: this.performance.pollingAttemptsPrevented,
                redundantCallsEliminated: this.performance.redundantCallsEliminated,
                activePollers: this.activePollers.size,
                registeredSystems: this.registeredSystems.size,
                resourceSavingsMs: this.performance.resourceSavings
            });
        }
    }

    /**
     * Public API: Get performance metrics
     */
    getPerformanceMetrics() {
        return {
            ...this.performance,
            activePollers: this.activePollers.size,
            registeredSystems: this.registeredSystems.size,
            sharedState: this.sharedState
        };
    }

    /**
     * Public API: Force state refresh
     */
    refreshState() {
        // Re-check all states
        this.sharedState.fabricLoaded = typeof window.fabric !== 'undefined';
        this.sharedState.canvasDetected = !!window.fabricCanvas;
        this.sharedState.canvasInstance = window.fabricCanvas || null;
        this.sharedState.templateEditorsReady = !!(window.templateEditors instanceof Map && window.templateEditors.size > 0);
        this.sharedState.lastUpdate = Date.now();

        this.notifySystemsOfStateChange();
        console.log('🔄 AGENT 4: State refreshed', this.sharedState);
    }

    /**
     * Public API: Stop all active pollers (for cleanup)
     */
    stopAllPollers() {
        console.log('🛑 AGENT 4: Stopping all active pollers');
        this.activePollers.clear();
        this.coordinatedCallbacks.clear();
    }
}

// Auto-initialize the redundancy eliminator
(function initializeRedundancyEliminator() {
    if (window.Agent4RedundancyEliminator) {
        console.log('🔄 AGENT 4: Redundancy eliminator already exists');
        return;
    }

    const initialize = () => {
        try {
            new Agent4RedundancyEliminator();
        } catch (error) {
            console.error('🔥 AGENT 4: Failed to initialize redundancy eliminator:', error);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 25);
    }
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Agent4RedundancyEliminator;
}