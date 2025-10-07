/**
 * 🎯 WEBPACK READINESS DETECTOR - Stage 1 Foundation
 *
 * Löst Root-Cause #1: Webpack Chunk Race Condition
 * Wartet auf webpack chunks BEVOR andere Scripts starten
 */

console.log('🎯 WEBPACK READINESS: Starting webpack foundation detector...');

class WebpackReadinessDetector {
    constructor() {
        this.maxAttempts = 200; // 10 Sekunden bei 50ms intervals
        this.attempt = 0;
        this.startTime = performance.now();

        this.init();
    }

    init() {
        // Sofortige Prüfung
        if (this.checkWebpackReady()) {
            this.onWebpackReady();
            return;
        }

        // Polling als backup
        this.startPolling();
    }

    checkWebpackReady() {
        // Prüfe webpack chunk availability
        if (typeof window.webpackChunkocto_print_designer !== 'undefined') {
            console.log('🎯 WEBPACK READINESS: webpackChunkocto_print_designer found');
            return true;
        }

        // Prüfe webpack require system
        if (typeof window.__webpack_require__ !== 'undefined') {
            console.log('🎯 WEBPACK READINESS: __webpack_require__ found');
            return true;
        }

        return false;
    }

    startPolling() {
        const poll = () => {
            this.attempt++;

            if (this.checkWebpackReady()) {
                this.onWebpackReady();
                return;
            }

            if (this.attempt >= this.maxAttempts) {
                this.onWebpackTimeout();
                return;
            }

            // Log progress every 20 attempts (1 second)
            if (this.attempt % 20 === 0) {
                console.log(`🎯 WEBPACK READINESS: Attempt ${this.attempt}/${this.maxAttempts} - waiting for webpack chunks...`);
            }

            setTimeout(poll, 50);
        };

        poll();
    }

    onWebpackReady() {
        const readyTime = performance.now() - this.startTime;
        console.log(`✅ WEBPACK READINESS: Ready after ${readyTime.toFixed(2)}ms (attempt ${this.attempt})`);

        // Set global promise resolver
        if (window.webpackReadyResolver) {
            window.webpackReadyResolver();
        }

        // Fire ready event
        document.dispatchEvent(new CustomEvent('webpackReady', {
            detail: {
                readyTime: readyTime,
                attempts: this.attempt,
                webpackChunk: window.webpackChunkocto_print_designer,
                webpackRequire: window.__webpack_require__
            }
        }));

        console.log('🎯 WEBPACK READINESS: webpackReady event fired - Stage 1 complete');
    }

    onWebpackTimeout() {
        const timeoutTime = performance.now() - this.startTime;
        console.error(`❌ WEBPACK READINESS: Timeout after ${timeoutTime.toFixed(2)}ms (${this.maxAttempts} attempts)`);
        console.error('❌ WEBPACK READINESS: webpack chunks never became available');

        // Fire timeout event for graceful degradation
        document.dispatchEvent(new CustomEvent('webpackTimeout', {
            detail: {
                timeoutTime: timeoutTime,
                attempts: this.attempt
            }
        }));
    }
}

// Global Promise für andere Scripts
window.webpackReady = new Promise((resolve) => {
    window.webpackReadyResolver = resolve;
});

// Debug interface
window.debugWebpackReadiness = () => ({
    detector: window.webpackReadinessDetector,
    webpackChunk: window.webpackChunkocto_print_designer,
    webpackRequire: window.__webpack_require__,
    promise: window.webpackReady
});

// Initialize immediately
window.webpackReadinessDetector = new WebpackReadinessDetector();

console.log('🎯 WEBPACK READINESS: Detector loaded - Stage 1 foundation active');