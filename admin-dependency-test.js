/**
 * 🧪 ADMIN DEPENDENCY VERIFICATION TEST
 * Tests if generateDesignData() is now available after dependency fix
 */

console.log('🧪 [ADMIN TEST] Starting dependency verification...');

// Test 1: Check basic dependencies
console.log('📦 [DEP TEST] Checking core dependencies:');
console.log('  jQuery:', typeof window.$);
console.log('  Fabric.js:', typeof window.fabric);
console.log('  vendor bundle:', typeof window.webpackJsonp || 'loaded');

// Test 2: Check design capture system
console.log('🎯 [CAPTURE TEST] Checking design capture system:');
console.log('  OptimizedCapture:', typeof window.optimizedCaptureInstance);
console.log('  EnhancedJSON:', typeof window.enhancedJSONSystem);

// Test 3: THE CRITICAL TEST - generateDesignData availability
console.log('🚀 [CRITICAL TEST] Checking generateDesignData():');
if (typeof window.generateDesignData === 'function') {
    console.log('✅ SUCCESS: generateDesignData() function is available!');

    try {
        const testData = window.generateDesignData();
        console.log('📊 Test execution successful:', typeof testData);
        console.log('📋 Test data structure:', {
            timestamp: testData.timestamp || 'missing',
            template_view_id: testData.template_view_id || 'missing',
            elements_count: testData.elements ? testData.elements.length : 0
        });
    } catch (error) {
        console.log('⚠️  Function exists but execution failed:', error.message);
    }
} else {
    console.log('❌ FAIL: generateDesignData() function still not available');
    console.log('🔍 Available functions:', Object.keys(window).filter(k => k.includes('generate') || k.includes('design')));
}

// Test 4: Fabric.js canvas detection
console.log('🎨 [CANVAS TEST] Canvas availability:');
if (window.fabric) {
    const canvases = document.querySelectorAll('canvas');
    console.log('  Canvas elements found:', canvases.length);
    canvases.forEach((canvas, i) => {
        console.log(`  Canvas ${i}:`, canvas.id, canvas.width + 'x' + canvas.height);
    });
}

console.log('🏁 [ADMIN TEST] Dependency verification complete!');