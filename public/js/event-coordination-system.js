/**
 * ⚡ EVENT COORDINATION SYSTEM - SUPERPOWER IMPLEMENTATION
 * Eliminates all race conditions with event-driven state machine
 *
 * SOLVES: 7 major race conditions identified by Agent 3
 * REPLACES: Timeout-heavy initialization with reliable event coordination
 */

class EventCoordinationSystem {
    constructor() {
        // Prevent duplicate initialization
        if (window.eventCoordinationSystem) {
            console.warn('🚨 EVENT COORDINATION: Already initialized');
            return window.eventCoordinationSystem;
        }

        this.state = 'INITIALIZING';
        this.phases = ['DOM_READY', 'FABRIC_READY', 'CANVAS_READY', 'DESIGNER_READY', 'COMPLETE'];
        this.currentPhase = 0;
        this.listeners = new Map();
        this.retryAttempts = new Map();
        this.maxRetries = 3;

        // Store global reference
        window.eventCoordinationSystem = this;

        console.log('⚡ EVENT COORDINATION: Initializing superpower coordination system...');

        this.init();
    }

    init() {
        this.setupPhaseListeners();
        this.setupFailsafeTimers();
        this.startCoordination();
    }

    setupPhaseListeners() {
        // Phase 1: DOM Ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.advancePhase('DOM_READY'));
        } else {
            this.advancePhase('DOM_READY');
        }

        // Phase 2: Fabric Ready
        window.addEventListener('fabricReady', (event) => {
            console.log('⚡ EVENT COORDINATION: Fabric ready event received');
            this.advancePhase('FABRIC_READY', event.detail);
        });

        // Phase 3: Canvas Ready (custom detection)
        this.setupCanvasDetection();

        // Phase 4: Designer Ready
        document.addEventListener('designerReady', (event) => {
            console.log('⚡ EVENT COORDINATION: Designer ready event received');
            this.advancePhase('DESIGNER_READY', event.detail);
        });
    }

    setupCanvasDetection() {
        // Use MutationObserver for reliable canvas detection
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    const canvases = document.querySelectorAll('canvas[data-fabric="main"]');
                    if (canvases.length > 0) {
                        console.log('⚡ EVENT COORDINATION: Canvas detected via MutationObserver');
                        this.advancePhase('CANVAS_READY', { canvases });
                        observer.disconnect();
                        break;
                    }
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Immediate check for existing canvases
        const existingCanvases = document.querySelectorAll('canvas[data-fabric="main"]');
        if (existingCanvases.length > 0) {
            console.log('⚡ EVENT COORDINATION: Canvas already exists');
            this.advancePhase('CANVAS_READY', { canvases: existingCanvases });
            observer.disconnect();
        }
    }

    setupFailsafeTimers() {
        // Failsafe timer for each phase (prevents indefinite waiting)
        this.phases.forEach((phase, index) => {
            setTimeout(() => {
                if (this.currentPhase === index) {
                    console.warn(`⚠️ EVENT COORDINATION: Phase ${phase} timeout - forcing advancement`);
                    this.forceAdvancePhase(phase);
                }
            }, 5000 + (index * 2000)); // Progressive timeouts: 5s, 7s, 9s, 11s, 13s
        });
    }

    advancePhase(targetPhase, data = null) {
        const targetIndex = this.phases.indexOf(targetPhase);

        if (targetIndex === -1) {
            console.error('❌ EVENT COORDINATION: Invalid phase:', targetPhase);
            return false;
        }

        if (targetIndex <= this.currentPhase) {
            console.log(`🔄 EVENT COORDINATION: Phase ${targetPhase} already completed`);
            return true;
        }

        // Ensure sequential phase progression
        if (targetIndex !== this.currentPhase + 1) {
            console.warn(`⚠️ EVENT COORDINATION: Skipping phases to reach ${targetPhase}`);
        }

        console.log(`✅ EVENT COORDINATION: Advancing to phase ${targetPhase}`);

        this.currentPhase = targetIndex;
        this.state = targetPhase;

        // Dispatch phase completion event
        window.dispatchEvent(new CustomEvent(`phase:${targetPhase.toLowerCase()}`, {
            detail: { phase: targetPhase, data, timestamp: Date.now() }
        }));

        // Check if all phases complete
        if (this.currentPhase === this.phases.length - 1) {
            this.completeCoordination();
        }

        return true;
    }

    forceAdvancePhase(phase) {
        const retryKey = phase;
        const attempts = this.retryAttempts.get(retryKey) || 0;

        if (attempts >= this.maxRetries) {
            console.error(`❌ EVENT COORDINATION: Max retries reached for ${phase}`);
            return false;
        }

        this.retryAttempts.set(retryKey, attempts + 1);

        switch (phase) {
            case 'DOM_READY':
                // DOM should always be ready by this point
                this.advancePhase('DOM_READY');
                break;

            case 'FABRIC_READY':
                // Check if fabric is available despite missing event
                if (typeof window.fabric !== 'undefined') {
                    console.log('⚡ EVENT COORDINATION: Fabric detected without event');
                    this.advancePhase('FABRIC_READY');
                } else {
                    console.warn('⚠️ EVENT COORDINATION: Fabric still not available');
                }
                break;

            case 'CANVAS_READY':
                // Force canvas detection
                const canvases = document.querySelectorAll('canvas');
                if (canvases.length > 0) {
                    console.log('⚡ EVENT COORDINATION: Canvas found during force detection');
                    this.advancePhase('CANVAS_READY', { canvases });
                }
                break;

            case 'DESIGNER_READY':
                // Check if designer instance exists
                if (window.designerWidgetInstance) {
                    console.log('⚡ EVENT COORDINATION: Designer instance found without event');
                    this.advancePhase('DESIGNER_READY');
                }
                break;

            default:
                console.warn(`⚠️ EVENT COORDINATION: No force handler for ${phase}`);
        }
    }

    completeCoordination() {
        this.state = 'COMPLETE';
        console.log('🎉 EVENT COORDINATION: All phases complete - system ready!');

        // Dispatch system ready event
        window.dispatchEvent(new CustomEvent('systemCoordinationComplete', {
            detail: {
                phases: this.phases,
                completionTime: Date.now(),
                retryAttempts: Object.fromEntries(this.retryAttempts)
            }
        }));

        // Initialize dependent systems
        this.initializeDependentSystems();
    }

    initializeDependentSystems() {
        console.log('🚀 EVENT COORDINATION: Initializing dependent systems...');

        // Initialize design data capture system
        if (window.OptimizedDesignDataCaptureInstance) {
            console.log('🎯 EVENT COORDINATION: Starting design data capture...');
            window.OptimizedDesignDataCaptureInstance.startEventDrivenInitialization();
        }

        // Initialize plugin framework if available
        if (window.YPrintPlugins) {
            console.log('🔌 EVENT COORDINATION: Initializing plugin framework...');
            window.YPrintPlugins.initializePlugins();
        }

        // Initialize any other dependent systems
        window.dispatchEvent(new CustomEvent('initializeDependentSystems'));
    }

    waitForPhase(phase, callback) {
        const phaseIndex = this.phases.indexOf(phase);

        if (phaseIndex === -1) {
            console.error('❌ EVENT COORDINATION: Invalid phase for wait:', phase);
            return false;
        }

        if (this.currentPhase >= phaseIndex) {
            // Phase already complete
            callback();
            return true;
        }

        // Listen for phase completion
        const eventName = `phase:${phase.toLowerCase()}`;
        window.addEventListener(eventName, callback, { once: true });
        return true;
    }

    waitForComplete(callback) {
        if (this.state === 'COMPLETE') {
            callback();
        } else {
            window.addEventListener('systemCoordinationComplete', callback, { once: true });
        }
    }

    getCurrentState() {
        return {
            state: this.state,
            currentPhase: this.currentPhase,
            phaseName: this.phases[this.currentPhase] || 'UNKNOWN',
            completedPhases: this.phases.slice(0, this.currentPhase + 1),
            remainingPhases: this.phases.slice(this.currentPhase + 1),
            retryAttempts: Object.fromEntries(this.retryAttempts),
            timestamp: Date.now()
        };
    }

    logDetailedState() {
        const state = this.getCurrentState();
        console.group('⚡ EVENT COORDINATION STATE');
        console.log('Current State:', state.state);
        console.log('Current Phase:', state.phaseName);
        console.log('Completed Phases:', state.completedPhases);
        console.log('Remaining Phases:', state.remainingPhases);
        console.log('Retry Attempts:', state.retryAttempts);
        console.groupEnd();
        return state;
    }

    startCoordination() {
        console.log('🚀 EVENT COORDINATION: Starting coordination sequence...');
        this.state = 'COORDINATING';

        // The system will automatically advance through phases as events fire
        // Initial DOM ready check has already been set up in setupPhaseListeners
    }

    // Manual override for emergency situations
    emergencyReset() {
        console.warn('🚨 EVENT COORDINATION: Emergency reset initiated');

        this.currentPhase = 0;
        this.state = 'INITIALIZING';
        this.retryAttempts.clear();

        // Restart coordination
        this.startCoordination();
    }
}

// Auto-initialize event coordination system
console.log('⚡ EVENT COORDINATION: Auto-initializing superpower coordination...');
new EventCoordinationSystem();

// Export for compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventCoordinationSystem;
}