/**
 * 🎯 STAGED SCRIPT COORDINATOR - Event-based Script Loading
 *
 * Konvertiert alle race condition Scripts zu event listeners
 * Löst Root-Cause #3: Save Button dependency chain
 * Löst Root-Cause #4: Canvas creation race
 */

console.log('🎯 STAGED COORDINATOR: Starting event-based script coordination...');

class StagedScriptCoordinator {
    constructor() {
        this.initializationQueue = [];
        this.completedStages = new Set();

        this.setupEventListeners();
        this.setupGlobalAPI();
    }

    setupEventListeners() {
        // Stage 1: Webpack Ready
        document.addEventListener('webpackReady', (event) => {
            console.log('🎯 COORDINATOR: Stage 1 (webpack) ready', event.detail);
            this.completedStages.add('webpack');
            this.executeQueuedInitializers('webpack');
        });

        // Stage 2: Fabric Ready
        document.addEventListener('fabricReady', (event) => {
            console.log('🎯 COORDINATOR: Stage 2 (fabric) ready', event.detail);
            this.completedStages.add('fabric');
            this.executeQueuedInitializers('fabric');
        });

        // Stage 3: Designer Ready
        document.addEventListener('designerReady', (event) => {
            console.log('🎯 COORDINATOR: Stage 3 (designer) ready', event.detail);
            this.completedStages.add('designer');
            this.executeQueuedInitializers('designer');

            // CRITICAL: Aktiviere Save Buttons jetzt
            this.activateSaveButtons();

            // CRITICAL: Starte alle dependent scripts
            this.initializeDependentScripts(event.detail);
        });

        // Error Handling
        document.addEventListener('webpackTimeout', () => {
            console.error('🎯 COORDINATOR: Webpack timeout - using fallback initialization');
            this.handleFallbackInitialization();
        });

        document.addEventListener('fabricTimeout', () => {
            console.error('🎯 COORDINATOR: Fabric timeout - using fallback initialization');
            this.handleFallbackInitialization();
        });

        document.addEventListener('designerTimeout', () => {
            console.error('🎯 COORDINATOR: Designer timeout - using fallback initialization');
            this.handleFallbackInitialization();
        });
    }

    setupGlobalAPI() {
        // Global API für andere Scripts
        window.stageCoordinator = {
            // Registriere Scripts für bestimmte Stages
            registerForStage: (stage, callback) => this.registerForStage(stage, callback),

            // Prüfe Stage Status
            isStageReady: (stage) => this.completedStages.has(stage),

            // Warte auf Stage
            waitForStage: (stage) => this.waitForStage(stage),

            // Status Check
            getStatus: () => this.getStatus()
        };

        console.log('🎯 COORDINATOR: Global API available as window.stageCoordinator');
    }

    registerForStage(stage, callback) {
        if (this.completedStages.has(stage)) {
            // Stage bereits ready, sofort ausführen
            callback();
        } else {
            // In Queue für später
            this.initializationQueue.push({ stage, callback });
        }
    }

    executeQueuedInitializers(stage) {
        const toExecute = this.initializationQueue.filter(item => item.stage === stage);
        const remaining = this.initializationQueue.filter(item => item.stage !== stage);

        this.initializationQueue = remaining;

        toExecute.forEach(item => {
            try {
                item.callback();
            } catch (error) {
                console.error(`🎯 COORDINATOR: Error executing ${stage} callback:`, error);
            }
        });

        console.log(`🎯 COORDINATOR: Executed ${toExecute.length} callbacks for stage ${stage}`);
    }

    activateSaveButtons() {
        console.log('🎯 COORDINATOR: Activating save buttons...');

        // Find all save-related buttons
        const saveButtonSelectors = [
            '.save-design',
            '.designer-save',
            '[data-action="save"]',
            '.btn-save',
            '.save-btn',
            '#save-design',
            '.add-to-cart-button',
            '.designer-action-button',
            '.save-design-button'
        ];

        let activatedCount = 0;

        saveButtonSelectors.forEach(selector => {
            const buttons = document.querySelectorAll(selector);
            buttons.forEach(button => {
                if (button.disabled) {
                    button.disabled = false;
                    button.style.opacity = '1';
                    button.style.cursor = 'pointer';
                    activatedCount++;
                }
            });
        });

        console.log(`✅ COORDINATOR: Activated ${activatedCount} save buttons`);

        // Fire custom event for save button activation
        document.dispatchEvent(new CustomEvent('saveButtonsActivated', {
            detail: { activatedCount }
        }));
    }

    initializeDependentScripts(designerInfo) {
        console.log('🎯 COORDINATOR: Initializing dependent scripts...');

        // Initialisiere Design Data Capture Systems
        this.initializeDataCaptureSystems(designerInfo);

        // Initialisiere Save Fix Systems
        this.initializeSaveFixSystems(designerInfo);

        // Initialisiere Canvas Fix Systems
        this.initializeCanvasFixSystems(designerInfo);

        console.log('✅ COORDINATOR: All dependent scripts initialized');
    }

    initializeDataCaptureSystems(designerInfo) {
        // Ersetze optimized-design-data-capture.js sofortige Ausführung
        if (window.OptimizedDesignDataCapture) {
            try {
                console.log('🎯 COORDINATOR: Initializing OptimizedDesignDataCapture...');
                const instance = new window.OptimizedDesignDataCapture();
                window.optimizedCaptureInstance = instance;
            } catch (error) {
                console.error('🎯 COORDINATOR: OptimizedDesignDataCapture init error:', error);
            }
        }

        // Ersetze enhanced-json-coordinate-system.js sofortige Ausführung
        if (window.EnhancedJSONCoordinateSystem) {
            try {
                console.log('🎯 COORDINATOR: Initializing EnhancedJSONCoordinateSystem...');
                const instance = new window.EnhancedJSONCoordinateSystem();
                window.enhancedJSONSystem = instance;
            } catch (error) {
                console.error('🎯 COORDINATOR: EnhancedJSONCoordinateSystem init error:', error);
            }
        }

        // Setup generateDesignData function
        if (!window.generateDesignData) {
            window.generateDesignData = () => {
                if (window.optimizedCaptureInstance) {
                    return window.optimizedCaptureInstance.generateDesignData();
                } else if (window.enhancedJSONSystem) {
                    return window.enhancedJSONSystem.generateDesignData();
                } else {
                    console.warn('🎯 COORDINATOR: No data capture system available');
                    return null;
                }
            };
        }
    }

    initializeSaveFixSystems(designerInfo) {
        // Aktiviere permanent-save-fix.js Logic
        if (window.PermanentSaveFix) {
            try {
                console.log('🎯 COORDINATOR: Initializing PermanentSaveFix...');
                window.permanentSaveFixInstance = new window.PermanentSaveFix();
            } catch (error) {
                console.error('🎯 COORDINATOR: PermanentSaveFix init error:', error);
            }
        }
    }

    initializeCanvasFixSystems(designerInfo) {
        // Aktiviere fabric-canvas-element-fix.js
        if (window.fabricCanvasElementFix) {
            try {
                console.log('🎯 COORDINATOR: Applying fabric canvas element fixes...');
                window.fabricCanvasElementFix();
            } catch (error) {
                console.error('🎯 COORDINATOR: Fabric canvas fix error:', error);
            }
        }
    }

    waitForStage(stage) {
        return new Promise((resolve) => {
            if (this.completedStages.has(stage)) {
                resolve();
            } else {
                this.registerForStage(stage, resolve);
            }
        });
    }

    handleFallbackInitialization() {
        console.log('🎯 COORDINATOR: Starting fallback initialization...');

        // Nach 2 Sekunden fallback, auch ohne complete stage detection
        setTimeout(() => {
            if (!this.completedStages.has('designer')) {
                console.log('🎯 COORDINATOR: Fallback - activating basic functionality');
                this.activateSaveButtons();

                // Basic fallback initialization
                document.dispatchEvent(new CustomEvent('fallbackReady', {
                    detail: { mode: 'fallback', timestamp: Date.now() }
                }));
            }
        }, 2000);
    }

    getStatus() {
        return {
            completedStages: Array.from(this.completedStages),
            queuedInitializers: this.initializationQueue.length,
            isFullyReady: this.completedStages.has('designer'),
            availableGlobals: {
                webpack: typeof window.webpackChunkocto_print_designer !== 'undefined',
                fabric: !!(window.fabric && window.fabric.Canvas),
                designer: !!(window.DesignerWidget || window.designerWidget)
            }
        };
    }
}

// Initialize immediately
window.stagedScriptCoordinator = new StagedScriptCoordinator();

// Convenience functions for scripts
window.whenDesignerReady = (callback) => {
    window.stageCoordinator.registerForStage('designer', callback);
};

window.whenFabricReady = (callback) => {
    window.stageCoordinator.registerForStage('fabric', callback);
};

window.whenWebpackReady = (callback) => {
    window.stageCoordinator.registerForStage('webpack', callback);
};

console.log('🎯 STAGED COORDINATOR: Event-based coordination active - ready for dependent scripts');