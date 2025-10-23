/**
 * 🔍 DEBUG: PNG SYSTEM STATUS CHECKER
 * Für gemeinsame Analyse der PNG-Engine Probleme
 */

class PNGSystemDebugger {
    constructor() {
        this.runCompleteAnalysis();
    }

    runCompleteAnalysis() {
        console.log('🔍 PNG DEBUG: ========== COMPLETE SYSTEM ANALYSIS START ==========');

        // 1. Script Loading Analysis
        this.analyzeLoadedScripts();

        // 2. Engine Availability
        this.analyzeEngineAvailability();

        // 3. Template Data Analysis
        this.analyzeTemplateData();

        // 4. Canvas Analysis
        this.analyzeCanvasStatus();

        // 5. WordPress Integration
        this.analyzeWordPressConfig();

        // 6. Current PNG System Status
        this.analyzeCurrentPNGSystem();

        console.log('🔍 PNG DEBUG: ========== COMPLETE SYSTEM ANALYSIS END ==========');
    }

    analyzeLoadedScripts() {
        console.log('🔍 PNG DEBUG: 1. SCRIPT LOADING ANALYSIS');

        const requiredScripts = [
            'high-dpi-png-export-engine.js',
            'png-only-system-integration.js',
            'save-only-png-generator.js',
            'enhanced-json-coordinate-system.js'
        ];

        console.log('📦 PNG DEBUG: Checking loaded scripts...');
        const allScripts = Array.from(document.querySelectorAll('script[src]'));

        requiredScripts.forEach(scriptName => {
            const found = allScripts.find(script => script.src.includes(scriptName));
            console.log(`   ${found ? '✅' : '❌'} ${scriptName}: ${found ? found.src : 'NOT LOADED'}`);
        });

        console.log(`📊 PNG DEBUG: Total scripts loaded: ${allScripts.length}`);
        console.log('🔍 PNG DEBUG: All script sources:', allScripts.map(s => s.src.split('/').pop()));
    }

    analyzeEngineAvailability() {
        console.log('🔍 PNG DEBUG: 2. ENGINE AVAILABILITY ANALYSIS');

        const engines = {
            'window.HighDPIPrintExportEngine': window.HighDPIPrintExportEngine,
            'window.PNGOnlySystemIntegration': window.PNGOnlySystemIntegration,
            'window.SaveOnlyPNGGenerator': window.SaveOnlyPNGGenerator,
            'window.pngOnlySystem': window.pngOnlySystem,
            'window.highDPIExportEngine': window.highDPIExportEngine
        };

        Object.entries(engines).forEach(([name, engine]) => {
            console.log(`   ${engine ? '✅' : '❌'} ${name}: ${engine ? typeof engine : 'undefined'}`);
            if (engine && typeof engine === 'object') {
                console.log(`      - initialized: ${engine.initialized || 'unknown'}`);
                console.log(`      - version: ${engine.version || 'unknown'}`);
            }
        });
    }

    analyzeTemplateData() {
        console.log('🔍 PNG DEBUG: 3. TEMPLATE DATA ANALYSIS');

        // URL Parameters
        const urlParams = new URLSearchParams(window.location.search);
        const templateId = urlParams.get('template_id');
        console.log(`🔗 Template ID from URL: ${templateId || 'NONE'}`);

        // Data attributes
        const templateElement = document.querySelector('[data-template-id]');
        console.log(`📋 Template element: ${templateElement ? templateElement.dataset.templateId : 'NONE'}`);

        // WordPress config
        const wpConfig = window.octo_print_designer_config;
        console.log(`⚙️ WordPress config available: ${!!wpConfig}`);
        if (wpConfig) {
            console.log(`   - ajax_url: ${wpConfig.ajax_url}`);
            console.log(`   - nonce: ${wpConfig.nonce ? 'PRESENT' : 'MISSING'}`);
        }

        // Current URL
        console.log(`🌐 Current URL: ${window.location.href}`);
        console.log(`📍 Current page: ${window.location.pathname}`);
    }

    analyzeCanvasStatus() {
        console.log('🔍 PNG DEBUG: 4. CANVAS STATUS ANALYSIS');

        // Fabric.js availability
        console.log(`🎨 window.fabric available: ${!!window.fabric}`);
        if (window.fabric) {
            console.log(`   - fabric version: ${window.fabric.version || 'unknown'}`);
        }

        // Designer widget
        console.log(`🎛️ window.designerWidgetInstance: ${!!window.designerWidgetInstance}`);
        if (window.designerWidgetInstance) {
            const dwi = window.designerWidgetInstance;
            console.log(`   - fabricCanvas: ${!!dwi.fabricCanvas}`);
            if (dwi.fabricCanvas) {
                const objects = dwi.fabricCanvas.getObjects();
                console.log(`   - canvas objects: ${objects.length}`);
                objects.forEach((obj, idx) => {
                    console.log(`     ${idx}: ${obj.type} (${obj.isBackground ? 'background' : 'design'})`);
                });
            }
        }

        // Canvas elements
        const canvasElements = document.querySelectorAll('canvas');
        console.log(`🖼️ Canvas elements found: ${canvasElements.length}`);
        canvasElements.forEach((canvas, idx) => {
            console.log(`   Canvas ${idx}: ${canvas.id || 'no-id'} (${canvas.width}x${canvas.height})`);
        });
    }

    analyzeWordPressConfig() {
        console.log('🔍 PNG DEBUG: 5. WORDPRESS INTEGRATION ANALYSIS');

        // Global WordPress objects
        const wpObjects = [
            'wp',
            'ajaxurl',
            'wpApiSettings',
            'octo_print_designer_config',
            'yprint_config'
        ];

        wpObjects.forEach(obj => {
            const exists = window[obj];
            console.log(`🔧 window.${obj}: ${exists ? 'AVAILABLE' : 'MISSING'}`);
            if (exists && typeof exists === 'object') {
                console.log(`   - keys: [${Object.keys(exists).slice(0, 5).join(', ')}...]`);
            }
        });

        // Check for WordPress AJAX endpoint
        const ajaxUrl = window.octo_print_designer_config?.ajax_url ||
                       window.ajaxurl ||
                       '/wp-admin/admin-ajax.php';
        console.log(`📡 AJAX URL: ${ajaxUrl}`);

        // Test AJAX availability
        this.testWordPressAJAX(ajaxUrl);
    }

    async testWordPressAJAX(ajaxUrl) {
        console.log('🧪 PNG DEBUG: Testing WordPress AJAX availability...');

        try {
            const formData = new FormData();
            formData.append('action', 'heartbeat');

            const response = await fetch(ajaxUrl, {
                method: 'POST',
                body: formData
            });

            console.log(`📡 AJAX Test: ${response.ok ? '✅ SUCCESS' : '❌ FAILED'} (${response.status})`);

        } catch (error) {
            console.log(`📡 AJAX Test: ❌ ERROR - ${error.message}`);
        }
    }

    analyzeCurrentPNGSystem() {
        console.log('🔍 PNG DEBUG: 6. CURRENT PNG SYSTEM STATUS');

        // Check which PNG system is actually running
        const pngSystems = {
            'Save-Only PNG Generator': window.SaveOnlyPNGGenerator,
            'High-DPI Export Engine': window.HighDPIPrintExportEngine,
            'PNG Integration System': window.PNGOnlySystemIntegration
        };

        let activePNGSystem = 'NONE';
        Object.entries(pngSystems).forEach(([name, system]) => {
            if (system) {
                console.log(`🖨️ ${name}: ✅ LOADED`);
                if (system.initialized) {
                    activePNGSystem = name;
                    console.log(`   → ACTIVE: ${name}`);
                }
            } else {
                console.log(`🖨️ ${name}: ❌ NOT LOADED`);
            }
        });

        console.log(`🎯 ACTIVE PNG SYSTEM: ${activePNGSystem}`);

        // Check PNG generation capabilities
        this.testPNGGenerationCapability();
    }

    testPNGGenerationCapability() {
        console.log('🧪 PNG DEBUG: Testing PNG generation capability...');

        if (window.generateDesignData) {
            console.log('✅ generateDesignData function available');
            try {
                const testData = window.generateDesignData();
                console.log('📊 Test design data:', {
                    hasCanvas: !!testData.canvas,
                    templateId: testData.template_id,
                    designArea: testData.designed_on_area_px,
                    timestamp: testData.timestamp
                });
            } catch (error) {
                console.log('❌ generateDesignData test failed:', error.message);
            }
        } else {
            console.log('❌ generateDesignData function NOT available');
        }

        // Test manual canvas export
        if (window.designerWidgetInstance?.fabricCanvas) {
            console.log('🧪 Testing manual canvas export...');
            try {
                const canvas = window.designerWidgetInstance.fabricCanvas;
                const testPNG = canvas.toDataURL('image/png', 0.1); // Low quality test
                console.log(`✅ Manual canvas export: ${testPNG.length} bytes`);
            } catch (error) {
                console.log('❌ Manual canvas export failed:', error.message);
            }
        }
    }
}

// Auto-start debugger when script loads
console.log('🔍 PNG DEBUG: Debug script loaded - starting analysis...');
const debugger = new PNGSystemDebugger();

// Make debugger globally available for manual testing
window.pngSystemDebugger = debugger;

// Also run analysis when designer loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log('🔍 PNG DEBUG: Re-running analysis after DOM load...');
        new PNGSystemDebugger();
    }, 2000);
});

// Run analysis when designer is ready
window.addEventListener('designerReady', () => {
    console.log('🔍 PNG DEBUG: Re-running analysis after designer ready...');
    new PNGSystemDebugger();
});