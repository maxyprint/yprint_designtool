/**
 * 🎯 FABRIC READINESS DETECTOR - Stage 2 Foundation
 *
 * Löst Root-Cause #1 & #2: Fabric.js extraction timing
 * Wartet auf webpack chunks DANN extrahiert fabric.js sicher
 */

console.log('🎯 FABRIC READINESS: Starting fabric foundation detector...');

class FabricReadinessDetector {
    constructor() {
        this.maxAttempts = 100; // 5 Sekunden bei 50ms intervals
        this.attempt = 0;
        this.startTime = performance.now();

        this.init();
    }

    async init() {
        try {
            // CRITICAL: Warte auf webpack foundation
            console.log('🎯 FABRIC READINESS: Waiting for webpack foundation...');
            await window.webpackReady;
            console.log('🎯 FABRIC READINESS: Webpack foundation ready - starting fabric extraction');

            // Jetzt sicher fabric extraction versuchen
            this.attemptFabricExtraction();

        } catch (error) {
            console.error('❌ FABRIC READINESS: Webpack foundation failed:', error);
            this.onFabricTimeout();
        }
    }

    attemptFabricExtraction() {
        // Sofortige Prüfung
        if (this.checkFabricReady()) {
            this.onFabricReady();
            return;
        }

        // Versuche fabric extraction
        if (this.extractFabricFromWebpack()) {
            // Extraction erfolgreich, prüfe ergebnis
            setTimeout(() => {
                if (this.checkFabricReady()) {
                    this.onFabricReady();
                } else {
                    this.startPolling();
                }
            }, 100);
        } else {
            // Extraction fehlgeschlagen, polling
            this.startPolling();
        }
    }

    checkFabricReady() {
        // Prüfe window.fabric availability
        if (typeof window.fabric !== 'undefined' && window.fabric.Canvas) {
            return true;
        }
        return false;
    }

    extractFabricFromWebpack() {
        try {
            // Prüfe webpack chunk availability (sollte jetzt verfügbar sein)
            if (typeof window.webpackChunkocto_print_designer === 'undefined') {
                console.warn('🎯 FABRIC READINESS: webpack chunk not available despite webpackReady event');
                return false;
            }

            // Versuche fabric extraction (basierend auf webpack-fabric-extractor.js)
            const webpackChunk = window.webpackChunkocto_print_designer;

            // Durchsuche webpack modules nach fabric
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

                                    // Prüfe ob das fabric.js ist
                                    if (moduleExports.fabric && moduleExports.fabric.Canvas) {
                                        window.fabric = moduleExports.fabric;
                                        console.log('🎯 FABRIC READINESS: fabric.js successfully extracted from webpack');
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

            return false;

        } catch (error) {
            console.warn('🎯 FABRIC READINESS: Fabric extraction error:', error);
            return false;
        }
    }

    startPolling() {
        const poll = () => {
            this.attempt++;

            if (this.checkFabricReady()) {
                this.onFabricReady();
                return;
            }

            if (this.attempt >= this.maxAttempts) {
                this.onFabricTimeout();
                return;
            }

            // Log progress every 10 attempts (500ms)
            if (this.attempt % 10 === 0) {
                console.log(`🎯 FABRIC READINESS: Attempt ${this.attempt}/${this.maxAttempts} - waiting for fabric.js...`);
            }

            setTimeout(poll, 50);
        };

        poll();
    }

    onFabricReady() {
        const readyTime = performance.now() - this.startTime;
        console.log(`✅ FABRIC READINESS: Ready after ${readyTime.toFixed(2)}ms (attempt ${this.attempt})`);

        // Set global promise resolver
        if (window.fabricReadyResolver) {
            window.fabricReadyResolver();
        }

        // Fire ready event
        document.dispatchEvent(new CustomEvent('fabricReady', {
            detail: {
                readyTime: readyTime,
                attempts: this.attempt,
                fabric: window.fabric,
                canvasAvailable: !!(window.fabric && window.fabric.Canvas)
            }
        }));

        console.log('🎯 FABRIC READINESS: fabricReady event fired - Stage 2 complete');
    }

    onFabricTimeout() {
        const timeoutTime = performance.now() - this.startTime;
        console.error(`❌ FABRIC READINESS: Timeout after ${timeoutTime.toFixed(2)}ms (${this.maxAttempts} attempts)`);
        console.error('❌ FABRIC READINESS: fabric.js never became available');

        // Fire timeout event for graceful degradation
        document.dispatchEvent(new CustomEvent('fabricTimeout', {
            detail: {
                timeoutTime: timeoutTime,
                attempts: this.attempt
            }
        }));
    }
}

// Global Promise für andere Scripts
window.fabricReady = new Promise((resolve) => {
    window.fabricReadyResolver = resolve;
});

// Debug interface
window.debugFabricReadiness = () => ({
    detector: window.fabricReadinessDetector,
    fabric: window.fabric,
    canvasAvailable: !!(window.fabric && window.fabric.Canvas),
    promise: window.fabricReady
});

// Initialize immediately
window.fabricReadinessDetector = new FabricReadinessDetector();

console.log('🎯 FABRIC READINESS: Detector loaded - Stage 2 foundation active');