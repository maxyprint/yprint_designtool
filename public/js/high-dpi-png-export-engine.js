/**
 * 🧪 MINIMAL HIGH-DPI PNG EXPORT ENGINE
 * Forensic Test Implementation - Forces Immediate Failure
 *
 * PURPOSE: Bypass Fabric.js deadlock and test emergency fallback
 */

console.log('🧪 Loading Minimal High-DPI Export Engine...');

// Ensure namespace exists
window.OctoPrintDesigner = window.OctoPrintDesigner || {};

class HighDPIPrintExportEngine {
    constructor() {
        this.initialized = true;
        this.version = '1.0.0-minimal';
        this.debugMode = true;

        console.log('🧪 MINIMAL HIGH-DPI PRINT ENGINE: Initializing for forced failure...');
        this.markReady();
    }

    /**
     * Main export method - FORCES IMMEDIATE FAILURE
     * This bypasses the Fabric.js deadlock and triggers emergency fallback
     */
    generateEnhancedPrintPNG(canvas, printAreaPx, templateConfig) {
        console.log('--- ENGINE REACHED: FORCING EXPORT FAILURE ---');
        console.log('🧪 Canvas received:', !!canvas);
        console.log('🧪 PrintArea received:', printAreaPx);
        console.log('🧪 Template config received:', !!templateConfig);

        // Immediate forced failure to test emergency pathway
        throw new Error('Forced Engine Bypass for Deadlock Test');
    }

    /**
     * Alternative export method - also fails immediately
     */
    exportWithTemplateMetadata(options) {
        console.log('--- ALTERNATIVE ENGINE METHOD: FORCING FAILURE ---');
        console.log('🧪 Export options received:', options);

        // Immediate forced failure
        throw new Error('Alternative Export Method: Forced Failure');
    }

    /**
     * Print machine export method - required by PNG-only integration
     */
    exportForPrintMachine(options) {
        console.log('--- PRINT MACHINE METHOD: FORCING FAILURE ---');
        console.log('🧪 Print machine options received:', options);

        // Immediate forced failure to trigger fallback
        throw new Error('Print Machine Export: Forced Failure for Testing');
    }

    /**
     * Validation method to confirm engine is loaded
     */
    isEngineReady() {
        console.log('🧪 Minimal Engine Ready Check: TRUE');
        return true;
    }

    markReady() {
        this.initialized = true;

        // Expose globally
        window.highDPIPrintExportEngine = this;

        // Dispatch ready event
        window.dispatchEvent(new CustomEvent('yprintPrintEngineReady', {
            detail: { instance: this }
        }));
    }
}

// Minimal engine also available in OctoPrintDesigner namespace
window.OctoPrintDesigner.highDPIExportEngine = {
    generateEnhancedPrintPNG: function(canvas, printAreaPx, templateConfig) {
        console.log('--- ENGINE REACHED: FORCING EXPORT FAILURE ---');
        throw new Error('Forced Engine Bypass for Deadlock Test');
    }
};

// Auto-initialize minimal engine
console.log('🧪 MINIMAL HIGH-DPI PRINT ENGINE: Auto-initializing...');
window.highDPIPrintExportEngine = new HighDPIPrintExportEngine();

console.log('✅ Minimal High-DPI Export Engine loaded - Ready to force failure');
console.log('🧪 Engine will immediately throw error to test emergency fallback');