// LOAD AND TEST VISUAL SYSTEM - Complete browser console script
// Ensures the visual PNG system is loaded and tests all functionality

console.log('🔄 LOADING VISUAL SYSTEM: Starting complete load and test sequence');

// Step 1: Force reload the save-only-png-generator.js to get visual functions
async function loadVisualPNGSystem() {
    console.log('📥 LOADING: Checking if visual functions are already available...');

    // Check if visual functions are already loaded
    if (typeof window.generatePNGForDownloadVisual === 'function') {
        console.log('✅ LOADING: Visual functions already available');
        return true;
    }

    console.log('🔄 LOADING: Visual functions not found, attempting to reload script...');

    try {
        // Try to reload the script dynamically
        const script = document.createElement('script');
        script.src = '/public/js/save-only-png-generator.js?v=' + Date.now();
        script.onload = () => {
            console.log('✅ LOADING: Script reloaded successfully');
        };
        script.onerror = () => {
            console.error('❌ LOADING: Failed to reload script');
        };
        document.head.appendChild(script);

        // Wait a moment for the script to load
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if functions are now available
        if (typeof window.generatePNGForDownloadVisual === 'function') {
            console.log('✅ LOADING: Visual functions now available after reload');
            return true;
        } else {
            console.warn('⚠️ LOADING: Functions still not available, may need manual browser refresh');
            return false;
        }

    } catch (error) {
        console.error('❌ LOADING: Error during script reload:', error);
        return false;
    }
}

// Step 2: Comprehensive system test
async function runCompleteVisualTest() {
    console.log('\n🧪 TESTING: Starting comprehensive visual PNG system test');

    const designer = window.designerInstance;
    if (!designer?.fabricCanvas) {
        console.error('❌ TESTING: No designer or canvas found');
        return false;
    }

    const canvas = designer.fabricCanvas;

    // Test 1: Function availability
    console.log('\n--- Test 1: Function Availability ---');
    const functions = [
        'detectCanvasPrintZones',
        'generateVisualCanvasSnapshot',
        'generateMultiViewVisualPNGs',
        'generatePNGForDownloadVisual',
        'generatePNGForSaveVisual'
    ];

    const availableFunctions = {};
    functions.forEach(funcName => {
        const isAvailable = typeof window[funcName] === 'function' || typeof eval(funcName) === 'function';
        availableFunctions[funcName] = isAvailable;
        console.log(`${funcName}: ${isAvailable ? '✅' : '❌'}`);
    });

    if (!availableFunctions.generatePNGForDownloadVisual) {
        console.error('❌ TESTING: Core visual functions not loaded - check console for errors');
        return false;
    }

    // Test 2: Print zone detection
    console.log('\n--- Test 2: Print Zone Detection ---');
    let printZones = [];
    try {
        if (typeof detectCanvasPrintZones === 'function') {
            printZones = detectCanvasPrintZones(canvas, designer);
            console.log(`✅ Print zones detected: ${printZones.length}`);
        } else {
            console.error('❌ detectCanvasPrintZones function not accessible');
        }
    } catch (error) {
        console.error('❌ Error in print zone detection:', error);
    }

    // Test 3: Canvas content analysis
    console.log('\n--- Test 3: Canvas Content Analysis ---');
    const allObjects = canvas.getObjects();
    const designObjects = allObjects.filter(obj => {
        return obj.selectable === true && obj.visible === true &&
               obj.excludeFromExport !== true &&
               obj !== designer.printZoneRect &&
               obj !== designer.safeZoneRect &&
               !obj.isBackground;
    });

    console.log('Canvas analysis:', {
        totalObjects: allObjects.length,
        designObjects: designObjects.length,
        printZones: printZones.length,
        hasDesigner: !!designer,
        hasCanvas: !!canvas
    });

    if (designObjects.length === 0) {
        console.warn('⚠️ No design objects found - add some content to test properly');
    }

    // Test 4: Visual PNG generation
    console.log('\n--- Test 4: Visual PNG Generation ---');
    try {
        const downloadResult = await window.generatePNGForDownloadVisual();

        if (downloadResult && downloadResult.success) {
            console.log('✅ Visual PNG generation successful:', {
                viewName: downloadResult.viewName,
                pngLength: downloadResult.pngData?.length || 0,
                totalViews: downloadResult.allResults?.length || 0
            });

            // Quick content check
            if (downloadResult.pngData && downloadResult.pngData.length > 5000) {
                console.log('✅ Generated PNG appears to have content');
            } else {
                console.warn('⚠️ Generated PNG might be empty or small');
            }

            return true;
        } else {
            console.error('❌ Visual PNG generation failed:', downloadResult);
            return false;
        }
    } catch (error) {
        console.error('❌ Error during PNG generation:', error);
        return false;
    }
}

// Step 3: Integration readiness check
function checkIntegrationReadiness() {
    console.log('\n🔧 INTEGRATION: Checking readiness for seamless integration');

    const checks = {
        designerAvailable: !!window.designerInstance,
        canvasAvailable: !!window.designerInstance?.fabricCanvas,
        visualFunctionsLoaded: typeof window.generatePNGForDownloadVisual === 'function',
        legacyFunctionsPresent: typeof window.generatePNGForDownload === 'function',
        fabricJSAvailable: typeof fabric !== 'undefined',
        clipPathSupported: typeof window.designerInstance?.fabricCanvas?.clipPath !== 'undefined'
    };

    console.log('Integration checks:', checks);

    const allChecksPass = Object.values(checks).every(check => check);

    if (allChecksPass) {
        console.log('✅ INTEGRATION: System ready for seamless function replacement');
        console.log('ℹ️ Next step: Replace legacy functions with visual equivalents');
    } else {
        console.warn('⚠️ INTEGRATION: Some checks failed - may need troubleshooting');
    }

    return checks;
}

// Main execution sequence
async function executeCompleteTest() {
    console.log('🚀 MAIN: Starting complete visual PNG system validation');

    // Step 1: Ensure visual system is loaded
    const systemLoaded = await loadVisualPNGSystem();

    if (!systemLoaded) {
        console.error('❌ MAIN: Could not load visual system - manual refresh may be needed');
        console.log('ℹ️ MANUAL FIX: Try refreshing the page and re-running this script');
        return;
    }

    // Step 2: Run comprehensive tests
    const testsPassed = await runCompleteVisualTest();

    // Step 3: Check integration readiness
    const integrationChecks = checkIntegrationReadiness();

    // Final summary
    console.log('\n📊 FINAL SUMMARY:');
    console.log('- Visual System Loaded:', systemLoaded ? '✅' : '❌');
    console.log('- Tests Passed:', testsPassed ? '✅' : '❌');
    console.log('- Integration Ready:', Object.values(integrationChecks).every(c => c) ? '✅' : '❌');

    if (systemLoaded && testsPassed) {
        console.log('\n🎉 SUCCESS: Visual PNG system is working correctly!');
        console.log('ℹ️ NEXT STEP: Ready to replace legacy functions for seamless integration');
    } else {
        console.log('\n❌ ISSUES FOUND: Check individual test results above');
    }

    return {
        loaded: systemLoaded,
        tested: testsPassed,
        integrationReady: Object.values(integrationChecks).every(c => c)
    };
}

// Execute the complete test sequence
executeCompleteTest().then(results => {
    console.log('\n🏁 EXECUTION COMPLETE:', results);
}).catch(error => {
    console.error('❌ EXECUTION FAILED:', error);
});

// Provide manual debugging helpers
window.debugVisualPNG = {
    loadSystem: loadVisualPNGSystem,
    runTest: runCompleteVisualTest,
    checkIntegration: checkIntegrationReadiness,
    fullSequence: executeCompleteTest
};

console.log('🛠️ DEBUG HELPERS: Available as window.debugVisualPNG');
console.log('   Example: window.debugVisualPNG.fullSequence()');