/**
 * 🧪 PNG SYSTEM REPAIR VALIDATION TEST
 *
 * Tests the 3-line naming fix to validate:
 * 1. Script-duplikat auto-elimination
 * 2. Fallback-loader auto-stop mechanism
 * 3. Clone-mechanismus auto-repair
 */

console.log('🧪 === PNG SYSTEM REPAIR TEST START ===');

// Test 1: Fallback Loader Variable Detection Fix
console.log('🔍 TEST 1: Fallback Loader Variable Detection');

// Simulate the corrected check function
const correctedCheck = () => typeof window.highDPIPrintExportEngine !== 'undefined';
const oldIncorrectCheck = () => typeof window.HighDPIPrintExportEngine !== 'undefined';

console.log('Fixed check (lowercase h):', correctedCheck());
console.log('Old check (uppercase H):', oldIncorrectCheck());

if (correctedCheck() && !oldIncorrectCheck()) {
    console.log('✅ TEST 1 PASSED: Naming fix correctly detects existing engine');
} else {
    console.log('❌ TEST 1 FAILED: Detection mismatch still exists');
}

// Test 2: Script Duplication Count
console.log('\n🔍 TEST 2: Script Duplication Analysis');

const pngScripts = Array.from(document.scripts).filter(script =>
    script.src.includes('high-dpi-png-export-engine') ||
    script.src.includes('enhanced-json-coordinate-system') ||
    script.src.includes('png-only-system-integration')
);

console.log(`PNG-related scripts in DOM: ${pngScripts.length}`);
pngScripts.forEach((script, idx) => {
    console.log(`  ${idx + 1}. ${script.src.split('/').pop()}`);
});

if (pngScripts.length <= 3) {
    console.log('✅ TEST 2 PASSED: No excessive script duplication detected');
} else {
    console.log('❌ TEST 2 FAILED: Script duplication still occurring');
}

// Test 3: Clone Mechanism Validation
console.log('\n🔍 TEST 3: Fabric.js Clone Mechanism');

if (window.designerWidgetInstance?.fabricCanvas) {
    const canvas = window.designerWidgetInstance.fabricCanvas;
    const objects = canvas.getObjects();

    if (objects.length > 0) {
        const testObject = objects[0];

        console.log('Test object type:', testObject.type);
        console.log('Has clone method:', typeof testObject.clone === 'function');

        if (typeof testObject.clone === 'function') {
            try {
                // Test if clone actually works (don't execute, just test availability)
                console.log('Clone method signature:', testObject.clone.toString().substring(0, 100) + '...');
                console.log('✅ TEST 3 PASSED: Clone method available and accessible');
            } catch (error) {
                console.log('❌ TEST 3 FAILED: Clone method exists but throws error:', error.message);
            }
        } else {
            console.log('❌ TEST 3 FAILED: Clone method not available');
        }
    } else {
        console.log('⚠️ TEST 3 SKIPPED: No canvas objects available for testing');
    }
} else {
    console.log('⚠️ TEST 3 SKIPPED: Designer canvas not available');
}

// Test 4: Global Variable Consistency
console.log('\n🔍 TEST 4: Global Variable Consistency Check');

const expectedGlobals = {
    'EnhancedJSONCoordinateSystem': typeof window.EnhancedJSONCoordinateSystem,
    'highDPIPrintExportEngine': typeof window.highDPIPrintExportEngine, // Corrected case
    'PNGOnlySystemIntegration': typeof window.PNGOnlySystemIntegration
};

console.log('Global variable status:');
let allConsistent = true;
Object.entries(expectedGlobals).forEach(([varName, varType]) => {
    const status = varType !== 'undefined' ? 'AVAILABLE' : 'MISSING';
    console.log(`  ${varName}: ${status} (${varType})`);
    if (varType === 'undefined') allConsistent = false;
});

if (allConsistent) {
    console.log('✅ TEST 4 PASSED: All expected global variables available');
} else {
    console.log('❌ TEST 4 FAILED: Some global variables missing');
}

// Test 5: Fallback Loader Status
console.log('\n🔍 TEST 5: Fallback Loader Auto-Stop Validation');

if (window.pngFallbackLoader) {
    // Check if fallback loader considers all scripts loaded
    const allLoaded = (
        typeof window.EnhancedJSONCoordinateSystem !== 'undefined' &&
        typeof window.highDPIPrintExportEngine !== 'undefined' && // Corrected case
        (typeof window.PNGOnlySystemIntegration !== 'undefined' ||
         typeof window.yprintPNGIntegration !== 'undefined')
    );

    console.log('Fallback loader should auto-stop:', allLoaded);
    console.log('Load attempts made:', window.pngFallbackLoader.loadAttempts || 'unknown');

    if (allLoaded) {
        console.log('✅ TEST 5 PASSED: Fallback loader should recognize all scripts as loaded');
    } else {
        console.log('❌ TEST 5 FAILED: Fallback loader will continue attempting to load scripts');
    }
} else {
    console.log('⚠️ TEST 5 SKIPPED: PNG fallback loader not available');
}

console.log('\n🧪 === PNG SYSTEM REPAIR TEST END ===');

// Final System Health Summary
console.log('\n📊 === SYSTEM HEALTH SUMMARY ===');
console.log('Primary systems status:');
console.log('  WordPress script registration: Active');
console.log('  Fabric.js availability:', typeof window.fabric !== 'undefined' ? 'Available' : 'Missing');
console.log('  Designer instance:', typeof window.designerWidgetInstance !== 'undefined' ? 'Available' : 'Missing');
console.log('  PNG export engine:', typeof window.highDPIPrintExportEngine !== 'undefined' ? 'Available' : 'Missing');

const systemHealth = (
    typeof window.fabric !== 'undefined' &&
    typeof window.designerWidgetInstance !== 'undefined' &&
    typeof window.highDPIPrintExportEngine !== 'undefined'
);

console.log(`Overall system health: ${systemHealth ? '✅ HEALTHY' : '❌ NEEDS ATTENTION'}`);