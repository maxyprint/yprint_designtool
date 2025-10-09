/**
 * 🚨 MANUAL FABRIC.JS FIX VALIDATION
 * Run this in browser console on /designer page
 */

console.log('🚨 MANUAL FABRIC.JS FIX VALIDATION STARTING...');

// Test 1: Check if Fabric.js is globally available
console.log('\n🧪 TEST 1: Global Fabric.js Availability');
console.log('typeof window.fabric:', typeof window.fabric);
console.log('window.fabric available:', typeof window.fabric !== 'undefined' ? '✅ YES' : '❌ NO');

if (window.fabric) {
    console.log('Fabric.js version:', window.fabric.version || 'Unknown');
    console.log('Fabric.Canvas available:', typeof window.fabric.Canvas === 'function' ? '✅ YES' : '❌ NO');
}

// Test 2: Check DesignerWidget instance
console.log('\n🧪 TEST 2: DesignerWidget Instance');
console.log('window.designerWidgetInstance:', !!window.designerWidgetInstance ? '✅ Available' : '❌ Missing');

if (window.designerWidgetInstance) {
    console.log('fabricCanvas:', !!window.designerWidgetInstance.fabricCanvas ? '✅ Available' : '❌ Missing');

    if (window.designerWidgetInstance.fabricCanvas) {
        try {
            const objects = window.designerWidgetInstance.fabricCanvas.getObjects();
            console.log('Canvas functional (getObjects):', '✅ YES');
            console.log('Canvas objects count:', objects.length);
        } catch (e) {
            console.log('Canvas functional:', '❌ NO -', e.message);
        }
    }
}

// Test 3: Check coordinate systems availability
console.log('\n🧪 TEST 3: Coordinate Systems');
const systems = {
    'Global Function': typeof window.generateDesignData === 'function',
    'YPrint': !!(window.YPrintTools?.CoordinateCapture?.generateDesignData),
    'Production Ready': !!(window.ProductionReadyDesignDataCapture?.generateDesignData),
    'Optimized': !!(window.OptimizedDesignDataCapture?.generateDesignData)
};

Object.entries(systems).forEach(([name, available]) => {
    console.log(`${name}:`, available ? '✅ Available' : '❌ Missing');
});

// Test 4: Test coordinate generation
console.log('\n🧪 TEST 4: Coordinate Generation Test');
if (window.generateDesignData) {
    try {
        const result = window.generateDesignData();
        console.log('Coordinate generation result:', result);

        if (result && result.elements) {
            console.log('✅ SUCCESS: Generated', result.elements.length, 'elements');
        } else if (result && result.error) {
            console.log('⚠️ ERROR:', result.message || result.error);
        } else {
            console.log('⚠️ UNEXPECTED RESULT:', result);
        }
    } catch (e) {
        console.log('❌ GENERATION ERROR:', e.message);
    }
} else {
    console.log('❌ generateDesignData function not available');
}

// Test 5: Check THADDÄUS emergency functions
console.log('\n🧪 TEST 5: THADDÄUS Emergency Functions');
console.log('logCoordinateSystemOutput:', typeof window.logCoordinateSystemOutput === 'function' ? '✅ Available' : '❌ Missing');

if (window.OptimizedDesignDataCaptureInstance) {
    console.log('OptimizedDesignDataCaptureInstance:', '✅ Available');
    console.log('forceCanvasDetection method:', typeof window.OptimizedDesignDataCaptureInstance.forceCanvasDetection === 'function' ? '✅ Available' : '❌ Missing');
} else {
    console.log('OptimizedDesignDataCaptureInstance:', '❌ Missing');
}

// Test 6: Manual THADDÄUS validation trigger
console.log('\n🧪 TEST 6: Manual THADDÄUS Validation');
if (typeof window.runThaddaeusValidation === 'function') {
    console.log('Running manual THADDÄUS validation...');
    window.runThaddaeusValidation();
} else {
    console.log('❌ runThaddaeusValidation function not available');
}

console.log('\n🎯 MANUAL VALIDATION COMPLETE');
console.log('Check console above for detailed results');