/**
 * 🚀 SYSTEM BOOTSTRAPPER
 *
 * Orchestriert die kontrollierte Initialisierung der neuen PNG-Architektur
 * Stellt sicher, dass alle Dependencies geladen sind bevor Systeme starten
 */

class SystemBootstrapper {
    constructor() {
        this.isInitialized = false;
        this.initializationStarted = false;
        this.systemStates = new Map();
        this.dependencyGraph = new Map();
        this.initializationOrder = [];

        console.log('🚀 SYSTEM BOOTSTRAPPER: Initializing...');

        // Bind methods
        this.init = this.init.bind(this);
        this.initializeSystem = this.initializeSystem.bind(this);
        this.checkSystemHealth = this.checkSystemHealth.bind(this);
    }

    /**
     * 🎯 Main Initialization Entry Point
     */
    async init(forceReinitialization = false) {
        if (this.isInitialized && !forceReinitialization) {
            console.log('✅ SYSTEM BOOTSTRAPPER: Already initialized');
            return this.getSystemStatus();
        }

        if (this.initializationStarted && !forceReinitialization) {
            console.log('⏳ SYSTEM BOOTSTRAPPER: Initialization in progress...');
            return this._waitForInitialization();
        }

        this.initializationStarted = true;
        console.log('🚀 SYSTEM BOOTSTRAPPER: Starting system initialization...');

        try {
            // Define dependency graph
            this._defineDependencyGraph();

            // Wait for core dependencies
            await this._waitForCoreDependencies();

            // Initialize systems in correct order
            await this._initializeSystemsSequentially();

            // Validate system health
            const healthCheck = await this.checkSystemHealth();

            if (healthCheck.allHealthy) {
                this.isInitialized = true;
                console.log('✅ SYSTEM BOOTSTRAPPER: All systems initialized successfully');

                // Dispatch ready event
                document.dispatchEvent(new CustomEvent('yprint:systemsReady', {
                    detail: {
                        status: this.getSystemStatus(),
                        healthCheck
                    }
                }));

                return { success: true, status: this.getSystemStatus(), healthCheck };
            } else {
                throw new Error('System health check failed');
            }

        } catch (error) {
            console.error('❌ SYSTEM BOOTSTRAPPER: Initialization failed:', error);
            this.initializationStarted = false;
            return { success: false, error: error.message };
        }
    }

    /**
     * 🏗️ Define System Dependencies
     */
    _defineDependencyGraph() {
        console.log('🏗️ SYSTEM BOOTSTRAPPER: Defining dependency graph...');

        // Define systems and their dependencies
        this.dependencyGraph.set('unifiedTemplateDataAccess', {
            dependencies: ['fabric', 'designer'],
            instance: () => window.unifiedTemplateDataAccess,
            init: async (instance) => {
                // UnifiedTemplateDataAccess doesn't need explicit init
                return { success: true };
            }
        });

        this.dependencyGraph.set('centralizedViewState', {
            dependencies: ['unifiedTemplateDataAccess', 'designer'],
            instance: () => window.centralizedViewState,
            init: async (instance) => {
                return await instance.init();
            }
        });

        this.dependencyGraph.set('consolidatedPNGPipeline', {
            dependencies: ['unifiedTemplateDataAccess', 'centralizedViewState', 'fabric'],
            instance: () => window.consolidatedPNGPipeline,
            init: async (instance) => {
                return await instance.init();
            }
        });

        // Define initialization order based on dependencies
        this.initializationOrder = [
            'unifiedTemplateDataAccess',
            'centralizedViewState',
            'consolidatedPNGPipeline'
        ];

        console.log('✅ SYSTEM BOOTSTRAPPER: Dependency graph defined');
    }

    /**
     * ⏳ Wait for Core Dependencies
     */
    async _waitForCoreDependencies() {
        console.log('⏳ SYSTEM BOOTSTRAPPER: Waiting for core dependencies...');

        const maxWait = 10000; // 10 seconds
        const checkInterval = 100;
        let elapsed = 0;

        const requiredDependencies = {
            fabric: () => window.fabric,
            designer: () => window.designerInstance || window.designerWidgetInstance,
            ajaxUrl: () => window.yprint_ajax?.ajax_url || window.ajaxurl
        };

        while (elapsed < maxWait) {
            const missingDeps = [];

            for (const [name, checker] of Object.entries(requiredDependencies)) {
                if (!checker()) {
                    missingDeps.push(name);
                }
            }

            if (missingDeps.length === 0) {
                console.log('✅ SYSTEM BOOTSTRAPPER: All core dependencies available');
                return true;
            }

            if (elapsed % 1000 === 0) { // Log every second
                console.log(`⏳ SYSTEM BOOTSTRAPPER: Still waiting for: ${missingDeps.join(', ')}`);
            }

            await new Promise(resolve => setTimeout(resolve, checkInterval));
            elapsed += checkInterval;
        }

        throw new Error(`Core dependencies not available: ${Object.keys(requiredDependencies).filter(name => !requiredDependencies[name]()).join(', ')}`);
    }

    /**
     * 🔄 Initialize Systems Sequentially
     */
    async _initializeSystemsSequentially() {
        console.log('🔄 SYSTEM BOOTSTRAPPER: Initializing systems in order...');

        for (const systemName of this.initializationOrder) {
            const systemConfig = this.dependencyGraph.get(systemName);

            try {
                console.log(`🔧 SYSTEM BOOTSTRAPPER: Initializing ${systemName}...`);

                // Check if system instance exists
                const instance = systemConfig.instance();
                if (!instance) {
                    throw new Error(`System instance not found: ${systemName}`);
                }

                // Check dependencies
                await this._waitForSystemDependencies(systemName, systemConfig.dependencies);

                // Initialize the system
                const result = await systemConfig.init(instance);

                if (result === true || (result && result.success)) {
                    this.systemStates.set(systemName, {
                        status: 'initialized',
                        instance,
                        timestamp: Date.now()
                    });
                    console.log(`✅ SYSTEM BOOTSTRAPPER: ${systemName} initialized successfully`);
                } else {
                    throw new Error(`Initialization returned false or error: ${JSON.stringify(result)}`);
                }

            } catch (error) {
                console.error(`❌ SYSTEM BOOTSTRAPPER: Failed to initialize ${systemName}:`, error);
                this.systemStates.set(systemName, {
                    status: 'failed',
                    error: error.message,
                    timestamp: Date.now()
                });
                throw new Error(`System initialization failed: ${systemName} - ${error.message}`);
            }
        }
    }

    /**
     * 🔍 Wait for System Dependencies
     */
    async _waitForSystemDependencies(systemName, dependencies) {
        const maxWait = 5000;
        const checkInterval = 100;
        let elapsed = 0;

        while (elapsed < maxWait) {
            const missingDeps = [];

            for (const dep of dependencies) {
                if (dep === 'fabric' && !window.fabric) {
                    missingDeps.push(dep);
                } else if (dep === 'designer' && !(window.designerInstance || window.designerWidgetInstance)) {
                    missingDeps.push(dep);
                } else if (dep !== 'fabric' && dep !== 'designer') {
                    // Check if it's a system dependency
                    const depState = this.systemStates.get(dep);
                    if (!depState || depState.status !== 'initialized') {
                        missingDeps.push(dep);
                    }
                }
            }

            if (missingDeps.length === 0) {
                return true;
            }

            await new Promise(resolve => setTimeout(resolve, checkInterval));
            elapsed += checkInterval;
        }

        throw new Error(`Dependencies not ready for ${systemName}: ${missingDeps.join(', ')}`);
    }

    /**
     * ⏳ Wait for Initialization to Complete
     */
    async _waitForInitialization() {
        const maxWait = 15000;
        const checkInterval = 100;
        let elapsed = 0;

        while (elapsed < maxWait && !this.isInitialized) {
            await new Promise(resolve => setTimeout(resolve, checkInterval));
            elapsed += checkInterval;
        }

        if (this.isInitialized) {
            return this.getSystemStatus();
        } else {
            throw new Error('Initialization timeout');
        }
    }

    /**
     * 🏥 System Health Check
     */
    async checkSystemHealth() {
        console.log('🏥 SYSTEM BOOTSTRAPPER: Running system health check...');

        const healthResults = {
            unifiedTemplateDataAccess: await this._checkTemplateDataAccessHealth(),
            centralizedViewState: await this._checkViewStateHealth(),
            consolidatedPNGPipeline: await this._checkPNGPipelineHealth()
        };

        const allHealthy = Object.values(healthResults).every(result => result.healthy);

        console.log('📊 SYSTEM BOOTSTRAPPER: Health check results:', healthResults);

        return {
            allHealthy,
            results: healthResults,
            timestamp: Date.now()
        };
    }

    /**
     * 🩺 Individual Health Checkers
     */
    async _checkTemplateDataAccessHealth() {
        try {
            const instance = window.unifiedTemplateDataAccess;
            if (!instance) return { healthy: false, error: 'Instance not found' };

            const templateId = instance.getTemplateId();
            return {
                healthy: true,
                data: { templateId, hasInstance: !!instance }
            };
        } catch (error) {
            return { healthy: false, error: error.message };
        }
    }

    async _checkViewStateHealth() {
        try {
            const instance = window.centralizedViewState;
            if (!instance) return { healthy: false, error: 'Instance not found' };

            const state = instance.getCurrentState();
            return {
                healthy: true,
                data: state
            };
        } catch (error) {
            return { healthy: false, error: error.message };
        }
    }

    async _checkPNGPipelineHealth() {
        try {
            const instance = window.consolidatedPNGPipeline;
            if (!instance) return { healthy: false, error: 'Instance not found' };

            const debugInfo = instance.getDebugInfo();
            return {
                healthy: debugInfo.isInitialized,
                data: debugInfo
            };
        } catch (error) {
            return { healthy: false, error: error.message };
        }
    }

    /**
     * 📊 Get System Status
     */
    getSystemStatus() {
        return {
            isInitialized: this.isInitialized,
            initializationStarted: this.initializationStarted,
            systems: Array.from(this.systemStates.entries()).reduce((acc, [name, state]) => {
                acc[name] = {
                    status: state.status,
                    timestamp: state.timestamp,
                    hasError: !!state.error
                };
                return acc;
            }, {}),
            readySystemsCount: Array.from(this.systemStates.values()).filter(state => state.status === 'initialized').length,
            totalSystems: this.initializationOrder.length
        };
    }

    /**
     * 🔄 Reinitialize Specific System
     */
    async reinitializeSystem(systemName) {
        console.log(`🔄 SYSTEM BOOTSTRAPPER: Reinitializing ${systemName}...`);

        const systemConfig = this.dependencyGraph.get(systemName);
        if (!systemConfig) {
            throw new Error(`Unknown system: ${systemName}`);
        }

        try {
            const instance = systemConfig.instance();
            if (!instance) {
                throw new Error(`System instance not found: ${systemName}`);
            }

            const result = await systemConfig.init(instance);

            if (result === true || (result && result.success)) {
                this.systemStates.set(systemName, {
                    status: 'initialized',
                    instance,
                    timestamp: Date.now()
                });
                console.log(`✅ SYSTEM BOOTSTRAPPER: ${systemName} reinitialized successfully`);
                return { success: true };
            } else {
                throw new Error(`Reinitialization failed: ${JSON.stringify(result)}`);
            }

        } catch (error) {
            console.error(`❌ SYSTEM BOOTSTRAPPER: Failed to reinitialize ${systemName}:`, error);
            this.systemStates.set(systemName, {
                status: 'failed',
                error: error.message,
                timestamp: Date.now()
            });
            return { success: false, error: error.message };
        }
    }

    /**
     * 🔧 Get System Instance
     */
    getSystemInstance(systemName) {
        const systemState = this.systemStates.get(systemName);
        return systemState && systemState.status === 'initialized' ? systemState.instance : null;
    }

    /**
     * 🧹 Emergency Reset
     */
    async emergencyReset() {
        console.warn('🧹 SYSTEM BOOTSTRAPPER: Performing emergency reset...');

        this.isInitialized = false;
        this.initializationStarted = false;
        this.systemStates.clear();

        // Clear any global states
        if (window.centralizedViewState) {
            window.centralizedViewState.clearQueue();
        }

        // Wait a bit then reinitialize
        await new Promise(resolve => setTimeout(resolve, 500));
        return this.init(true);
    }

    /**
     * 🐛 Get Debug Information
     */
    getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            initializationStarted: this.initializationStarted,
            systemStates: Object.fromEntries(this.systemStates),
            dependencyGraph: Array.from(this.dependencyGraph.keys()),
            initializationOrder: this.initializationOrder,
            coreDependencies: {
                fabric: !!window.fabric,
                designer: !!(window.designerInstance || window.designerWidgetInstance),
                ajax: !!(window.yprint_ajax || window.ajaxurl)
            }
        };
    }
}

// Global instance
window.systemBootstrapper = new SystemBootstrapper();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SystemBootstrapper;
}

console.log('✅ SYSTEM BOOTSTRAPPER: Loaded and ready for initialization');

// Auto-initialize when DOM is ready (if not already initialized)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 SYSTEM BOOTSTRAPPER: DOM ready, starting auto-initialization...');
        setTimeout(() => window.systemBootstrapper.init(), 100);
    });
} else {
    // DOM already ready, initialize with delay to allow other scripts to load
    setTimeout(() => {
        console.log('🚀 SYSTEM BOOTSTRAPPER: Starting delayed auto-initialization...');
        window.systemBootstrapper.init();
    }, 500);
}