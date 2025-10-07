/**
 * 🎯 DESIGNER READINESS DETECTOR - Stage 3 Foundation
 *
 * Löst Root-Cause #2 & #3: DesignerWidget exposure timing
 * Wartet auf designer.bundle.js DANN detektiert DesignerWidget availability
 */

console.log('🎯 DESIGNER READINESS: Starting designer foundation detector...');

class DesignerReadinessDetector {
    constructor() {
        this.maxAttempts = 100; // 5 Sekunden bei 50ms intervals
        this.attempt = 0;
        this.startTime = performance.now();

        this.init();
    }

    async init() {
        try {
            // CRITICAL: Warte auf fabric foundation
            console.log('🎯 DESIGNER READINESS: Waiting for fabric foundation...');
            await window.fabricReady;
            console.log('🎯 DESIGNER READINESS: Fabric foundation ready - starting designer detection');

            // Kurze Verzögerung für designer.bundle.js load
            setTimeout(() => {
                this.attemptDesignerDetection();
            }, 100);

        } catch (error) {
            console.error('❌ DESIGNER READINESS: Fabric foundation failed:', error);
            this.onDesignerTimeout();
        }
    }

    attemptDesignerDetection() {
        // Sofortige Prüfung
        if (this.checkDesignerReady()) {
            this.onDesignerReady();
            return;
        }

        // Polling starten
        this.startPolling();
    }

    checkDesignerReady() {
        // Prüfe verschiedene DesignerWidget availability patterns

        // 1. Global instance
        if (window.designerWidget || window.designerWidgetInstance) {
            console.log('🎯 DESIGNER READINESS: Designer instance found');
            return true;
        }

        // 2. DesignerWidget class
        if (window.DesignerWidget && typeof window.DesignerWidget === 'function') {
            console.log('🎯 DESIGNER READINESS: DesignerWidget class found');
            return true;
        }

        // 3. Webpack-exposed DesignerWidget
        if (this.checkWebpackDesignerWidget()) {
            console.log('🎯 DESIGNER READINESS: Webpack DesignerWidget found');
            return true;
        }

        return false;
    }

    checkWebpackDesignerWidget() {
        try {
            // Prüfe webpack chunk für DesignerWidget
            if (typeof window.webpackChunkocto_print_designer !== 'undefined') {
                const webpackChunk = window.webpackChunkocto_print_designer;

                if (webpackChunk && Array.isArray(webpackChunk)) {
                    for (const chunk of webpackChunk) {
                        if (chunk && chunk[1]) {
                            const modules = chunk[1];
                            for (const moduleId in modules) {
                                const module = modules[moduleId];
                                if (typeof module === 'function') {
                                    try {
                                        const moduleExports = {};
                                        module(moduleExports, {}, moduleId);

                                        // Prüfe verschiedene DesignerWidget export patterns
                                        if (moduleExports.DesignerWidget ||
                                            moduleExports.default?.DesignerWidget ||
                                            (moduleExports.default && typeof moduleExports.default === 'function' &&
                                             moduleExports.default.name === 'DesignerWidget')) {

                                            // Expose global wenn gefunden
                                            window.DesignerWidget = moduleExports.DesignerWidget ||
                                                                   moduleExports.default?.DesignerWidget ||
                                                                   moduleExports.default;
                                            return true;
                                        }
                                    } catch (e) {
                                        // Module extraction fehlgeschlagen, weiter
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return false;
        } catch (error) {
            console.warn('🎯 DESIGNER READINESS: Webpack DesignerWidget check error:', error);
            return false;
        }
    }

    startPolling() {
        const poll = () => {
            this.attempt++;

            if (this.checkDesignerReady()) {
                this.onDesignerReady();
                return;
            }

            if (this.attempt >= this.maxAttempts) {
                this.onDesignerTimeout();
                return;
            }

            // Log progress every 10 attempts (500ms)
            if (this.attempt % 10 === 0) {
                console.log(`🎯 DESIGNER READINESS: Attempt ${this.attempt}/${this.maxAttempts} - waiting for DesignerWidget...`);
            }

            setTimeout(poll, 50);
        };

        poll();
    }

    onDesignerReady() {
        const readyTime = performance.now() - this.startTime;
        console.log(`✅ DESIGNER READINESS: Ready after ${readyTime.toFixed(2)}ms (attempt ${this.attempt})`);

        // Set global promise resolver
        if (window.designerReadyResolver) {
            window.designerReadyResolver();
        }

        // Sammle designer info
        const designerInfo = {
            readyTime: readyTime,
            attempts: this.attempt,
            hasDesignerWidget: !!window.DesignerWidget,
            hasDesignerInstance: !!(window.designerWidget || window.designerWidgetInstance),
            instance: window.designerWidget || window.designerWidgetInstance,
            class: window.DesignerWidget
        };

        // Fire ready event
        document.dispatchEvent(new CustomEvent('designerReady', {
            detail: designerInfo
        }));

        console.log('🎯 DESIGNER READINESS: designerReady event fired - Stage 3 complete');
        console.log('✅ ALL FOUNDATIONS READY: System ready for dependent scripts');
    }

    onDesignerTimeout() {
        const timeoutTime = performance.now() - this.startTime;
        console.error(`❌ DESIGNER READINESS: Timeout after ${timeoutTime.toFixed(2)}ms (${this.maxAttempts} attempts)`);
        console.error('❌ DESIGNER READINESS: DesignerWidget never became available');

        // Fire timeout event for graceful degradation
        document.dispatchEvent(new CustomEvent('designerTimeout', {
            detail: {
                timeoutTime: timeoutTime,
                attempts: this.attempt,
                availableGlobals: {
                    DesignerWidget: !!window.DesignerWidget,
                    designerWidget: !!window.designerWidget,
                    designerWidgetInstance: !!window.designerWidgetInstance
                }
            }
        }));
    }
}

// Global Promise für andere Scripts
window.designerReady = new Promise((resolve) => {
    window.designerReadyResolver = resolve;
});

// Debug interface
window.debugDesignerReadiness = () => ({
    detector: window.designerReadinessDetector,
    DesignerWidget: window.DesignerWidget,
    designerWidget: window.designerWidget,
    designerWidgetInstance: window.designerWidgetInstance,
    promise: window.designerReady
});

// Initialize immediately
window.designerReadinessDetector = new DesignerReadinessDetector();

console.log('🎯 DESIGNER READINESS: Detector loaded - Stage 3 foundation active');