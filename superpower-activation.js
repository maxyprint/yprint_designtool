/**
 * 🔥 YPRINT SUPERPOWER ACTIVATION SCRIPT
 * Integrates all 5-agent solutions into the existing WordPress system
 *
 * POWERS ACTIVATED:
 * ✅ Emergency Response System (Agent 5) - Fixed missing methods
 * ✅ Unified Fabric Loading (Agent 2) - Eliminates race conditions
 * ✅ Event Coordination System (Agent 3) - Sequential phase management
 * ✅ Plugin Framework Compatibility (Agent 4) - Confirmed no conflicts
 * ✅ Enhanced Initialization (Agent 1) - Robust fallback systems
 */

class YPrintSuperpowerActivation {
    constructor() {
        console.log('🔥 SUPERPOWER ACTIVATION: Initializing YPrint superpower systems...');

        this.status = {
            emergencySystemActive: false,
            unifiedFabricActive: false,
            eventCoordinationActive: false,
            systemReady: false
        };

        this.activate();
    }

    async activate() {
        console.log('⚡ SUPERPOWER ACTIVATION: Beginning activation sequence...');

        try {
            // Step 1: Verify emergency system is loaded
            await this.verifyEmergencySystem();

            // Step 2: Ensure unified fabric loader is active
            await this.activateUnifiedFabricLoader();

            // Step 3: Initialize event coordination
            await this.activateEventCoordination();

            // Step 4: Integrate with existing systems
            await this.integrateWithExistingSystems();

            // Step 5: Final validation
            await this.validateSuperpowers();

            console.log('🎉 SUPERPOWER ACTIVATION: All systems activated successfully!');

        } catch (error) {
            console.error('❌ SUPERPOWER ACTIVATION: Activation failed:', error);
            this.handleActivationFailure(error);
        }
    }

    async verifyEmergencySystem() {
        console.log('🩹 SUPERPOWER: Verifying emergency response system...');

        // Check if the missing method has been added
        if (window.OptimizedDesignDataCaptureInstance &&
            typeof window.OptimizedDesignDataCaptureInstance.emergencyFabricDetection === 'function') {

            this.status.emergencySystemActive = true;
            console.log('✅ SUPERPOWER: Emergency response system active');
            return true;
        }

        console.warn('⚠️ SUPERPOWER: Emergency system not fully active');
        return false;
    }

    async activateUnifiedFabricLoader() {
        console.log('🎯 SUPERPOWER: Activating unified fabric loader...');

        // Check if unified fabric loader is active
        if (window.unifiedFabricLoader) {
            this.status.unifiedFabricActive = true;
            console.log('✅ SUPERPOWER: Unified fabric loader active');

            // Listen for fabric ready events
            window.addEventListener('fabricReady', (event) => {
                console.log('🔥 SUPERPOWER: Fabric ready via unified loader!');
                this.handleFabricReady(event.detail);
            });

            return true;
        }

        console.warn('⚠️ SUPERPOWER: Unified fabric loader not active');
        return false;
    }

    async activateEventCoordination() {
        console.log('⚡ SUPERPOWER: Activating event coordination system...');

        // Check if event coordination system is active
        if (window.eventCoordinationSystem) {
            console.log('✅ SUPERPOWER: Event coordination system active');

            // Listen for system coordination complete
            window.addEventListener('systemCoordinationComplete', (event) => {
                console.log('🎉 SUPERPOWER: System coordination complete!');
                this.handleSystemReady(event.detail);
            });

            return true;
        }

        console.warn('⚠️ SUPERPOWER: Event coordination system not active');
        return false;
    }

    async integrateWithExistingSystems() {
        console.log('🔧 SUPERPOWER: Integrating with existing systems...');

        // Disable old fabric loading systems to prevent conflicts
        this.disableConflictingSystems();

        // Enhance existing designer ready event handling
        this.enhanceDesignerReadyHandling();

        // Integrate with plugin framework (if present)
        this.integrateWithPluginFramework();

        console.log('✅ SUPERPOWER: Integration complete');
    }

    disableConflictingSystems() {
        console.log('🛑 SUPERPOWER: Disabling conflicting systems...');

        // List of conflicting fabric loading scripts to disable
        const conflictingScripts = [
            'fabric-global-exposer',
            'emergency-fabric-loader',
            'webpack-fabric-extractor',
            'fabric-readiness-detector'
        ];

        conflictingScripts.forEach(scriptName => {
            const elements = document.querySelectorAll(`script[src*="${scriptName}"]`);
            elements.forEach(element => {
                console.log(`🛑 SUPERPOWER: Disabling ${scriptName}`);
                element.disabled = true;
                element.remove();
            });
        });

        // Disable global variables from old systems
        if (window.fabricGlobalExposer) {
            window.fabricGlobalExposer = null;
            console.log('🛑 SUPERPOWER: Disabled fabricGlobalExposer');
        }

        if (window.emergencyFabricLoader) {
            window.emergencyFabricLoader = null;
            console.log('🛑 SUPERPOWER: Disabled emergencyFabricLoader');
        }
    }

    enhanceDesignerReadyHandling() {
        console.log('🚀 SUPERPOWER: Enhancing designer ready handling...');

        // Enhanced designer ready event that waits for all systems
        document.addEventListener('designerReady', (event) => {
            console.log('🎯 SUPERPOWER: Enhanced designer ready handler activated');

            // Ensure all superpower systems are ready before proceeding
            if (this.areAllSystemsReady()) {
                console.log('✅ SUPERPOWER: All systems ready - proceeding with designer initialization');
                this.initializeDesignerWithSuperpowers(event.detail);
            } else {
                console.log('⏳ SUPERPOWER: Waiting for all systems to be ready...');
                this.waitForAllSystems(() => {
                    this.initializeDesignerWithSuperpowers(event.detail);
                });
            }
        });
    }

    integrateWithPluginFramework() {
        if (window.YPrintPlugins) {
            console.log('🔌 SUPERPOWER: Integrating with plugin framework...');

            // Add superpower status to plugin framework
            window.YPrintPlugins.superpowerStatus = () => this.status;

            // Enhanced plugin initialization with superpower coordination
            const originalInitializePlugins = window.YPrintPlugins.initializePlugins;
            window.YPrintPlugins.initializePlugins = () => {
                if (this.areAllSystemsReady()) {
                    return originalInitializePlugins.call(window.YPrintPlugins);
                } else {
                    console.log('🔌 SUPERPOWER: Delaying plugin initialization until superpowers ready');
                    this.waitForAllSystems(() => {
                        originalInitializePlugins.call(window.YPrintPlugins);
                    });
                }
            };

            console.log('✅ SUPERPOWER: Plugin framework integration complete');
        }
    }

    handleFabricReady(fabricDetail) {
        console.log('🔥 SUPERPOWER: Fabric ready event received');
        console.log('🔍 SUPERPOWER: Fabric source:', fabricDetail.source);

        // Notify existing systems about fabric availability
        if (window.OptimizedDesignDataCaptureInstance) {
            console.log('🎯 SUPERPOWER: Notifying design data capture of fabric readiness');
            window.OptimizedDesignDataCaptureInstance.emergencyFabricDetection();
        }
    }

    handleSystemReady(systemDetail) {
        console.log('🎉 SUPERPOWER: System coordination complete');
        this.status.systemReady = true;

        // All phases complete - system is fully operational
        console.log('🚀 SUPERPOWER: YPrint system fully operational with superpowers!');

        // Dispatch superpower ready event
        window.dispatchEvent(new CustomEvent('yprintSuperpowerReady', {
            detail: {
                status: this.status,
                systemDetail,
                timestamp: Date.now()
            }
        }));
    }

    initializeDesignerWithSuperpowers(designerDetail) {
        console.log('🚀 SUPERPOWER: Initializing designer with superpower enhancements...');

        // Enhanced initialization with all systems verified ready
        const enhancedDetail = {
            ...designerDetail,
            superpowerStatus: this.status,
            enhancedSystems: {
                emergencyResponse: this.status.emergencySystemActive,
                unifiedFabric: this.status.unifiedFabricActive,
                eventCoordination: window.eventCoordinationSystem?.getCurrentState()
            }
        };

        // Dispatch enhanced designer ready event
        window.dispatchEvent(new CustomEvent('designerSuperpowerReady', {
            detail: enhancedDetail
        }));

        console.log('✅ SUPERPOWER: Designer initialization enhanced with superpowers');
    }

    areAllSystemsReady() {
        return this.status.emergencySystemActive &&
               this.status.unifiedFabricActive &&
               this.status.systemReady;
    }

    waitForAllSystems(callback) {
        const checkReady = () => {
            if (this.areAllSystemsReady()) {
                callback();
            } else {
                setTimeout(checkReady, 100);
            }
        };
        checkReady();
    }

    async validateSuperpowers() {
        console.log('🔍 SUPERPOWER: Validating all superpower systems...');

        const validations = [
            this.validateEmergencySystem(),
            this.validateUnifiedFabricLoader(),
            this.validateEventCoordination(),
            this.validateSystemIntegration()
        ];

        const results = await Promise.all(validations);
        const allValid = results.every(result => result);

        if (allValid) {
            console.log('✅ SUPERPOWER: All systems validated successfully');
            this.status.systemReady = true;
        } else {
            console.error('❌ SUPERPOWER: Validation failed for some systems');
            throw new Error('Superpower validation failed');
        }
    }

    validateEmergencySystem() {
        const hasMethod = window.OptimizedDesignDataCaptureInstance &&
                         typeof window.OptimizedDesignDataCaptureInstance.emergencyFabricDetection === 'function';

        console.log('🩹 SUPERPOWER VALIDATION: Emergency system:', hasMethod ? '✅' : '❌');
        return hasMethod;
    }

    validateUnifiedFabricLoader() {
        const hasLoader = window.unifiedFabricLoader &&
                         typeof window.unifiedFabricLoader.getStatus === 'function';

        console.log('🎯 SUPERPOWER VALIDATION: Unified fabric loader:', hasLoader ? '✅' : '❌');
        return hasLoader;
    }

    validateEventCoordination() {
        const hasCoordination = window.eventCoordinationSystem &&
                               typeof window.eventCoordinationSystem.getCurrentState === 'function';

        console.log('⚡ SUPERPOWER VALIDATION: Event coordination:', hasCoordination ? '✅' : '❌');
        return hasCoordination;
    }

    validateSystemIntegration() {
        const hasWaitForFabric = typeof window.waitForFabric === 'function';
        const hasSuperpowerEvent = true; // We define this ourselves

        console.log('🔧 SUPERPOWER VALIDATION: System integration:', hasWaitForFabric ? '✅' : '❌');
        return hasWaitForFabric;
    }

    handleActivationFailure(error) {
        console.error('🚨 SUPERPOWER: Activation failure - implementing fallback');

        // Implement graceful degradation
        window.dispatchEvent(new CustomEvent('yprintSuperpowerFailure', {
            detail: {
                error: error.message,
                status: this.status,
                fallbackMode: true
            }
        }));

        // Basic fallback functionality
        this.implementBasicFallback();
    }

    implementBasicFallback() {
        console.log('🚑 SUPERPOWER: Implementing basic fallback functionality...');

        // Ensure basic fabric loading still works
        if (!window.fabric && !window.unifiedFabricLoader) {
            console.log('🚑 SUPERPOWER: Loading fabric via emergency CDN...');
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js';
            script.onload = () => {
                console.log('🚑 SUPERPOWER: Emergency fabric loaded');
                window.dispatchEvent(new CustomEvent('fabricReady', {
                    detail: { source: 'emergency-fallback' }
                }));
            };
            document.head.appendChild(script);
        }
    }

    getSuperpowerStatus() {
        return {
            ...this.status,
            unifiedFabricStatus: window.unifiedFabricLoader?.getStatus(),
            eventCoordinationStatus: window.eventCoordinationSystem?.getCurrentState(),
            timestamp: Date.now()
        };
    }

    logSuperpowerStatus() {
        const status = this.getSuperpowerStatus();
        console.group('🔥 YPRINT SUPERPOWER STATUS');
        console.log('Emergency System:', status.emergencySystemActive ? '✅' : '❌');
        console.log('Unified Fabric:', status.unifiedFabricActive ? '✅' : '❌');
        console.log('Event Coordination:', status.eventCoordinationStatus?.state || 'Unknown');
        console.log('System Ready:', status.systemReady ? '✅' : '❌');
        console.log('Full Status:', status);
        console.groupEnd();
        return status;
    }
}

// Auto-activate superpowers
console.log('🔥 YPRINT SUPERPOWER: Auto-activating superpower systems...');
window.yprintSuperpowerActivation = new YPrintSuperpowerActivation();

// Global status checker
window.checkSuperpowerStatus = () => window.yprintSuperpowerActivation.logSuperpowerStatus();

// Export for compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YPrintSuperpowerActivation;
}