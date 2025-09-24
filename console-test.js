// Schneller Console-Test für Design Data Capture
console.log('🧪 QUICK TEST: Design Data Capture Verification');

// Test 1: Optimized Capture
if (typeof window.optimizedCaptureInstance !== 'undefined') {
    console.log('✅ Optimized Capture: Available');
    try {
        const result = window.optimizedCaptureInstance.generateDesignData();
        console.log('✅ Optimized Capture: Working', result.error ? 'ERROR' : 'SUCCESS');
    } catch (e) {
        console.log('❌ Optimized Capture: Error', e.message);
    }
} else {
    console.log('❌ Optimized Capture: Not found');
}

// Test 2: Enhanced JSON
if (typeof window.enhancedJSONSystem !== 'undefined') {
    console.log('✅ Enhanced JSON: Available');
    try {
        const result = window.enhancedJSONSystem.generateDesignData();
        console.log('✅ Enhanced JSON: Working', result.error ? 'ERROR' : 'SUCCESS');
    } catch (e) {
        console.log('❌ Enhanced JSON: Error', e.message);
    }
} else {
    console.log('❌ Enhanced JSON: Not found');
}

// Test 3: Global Function
if (typeof window.generateDesignData === 'function') {
    console.log('✅ Global Function: Available');
    try {
        const result = window.generateDesignData();
        console.log('✅ Global Function: Working', result.error ? 'ERROR' : 'SUCCESS');
        console.log('📋 Result Structure:', {
            hasTimestamp: !!result.timestamp,
            hasTemplateId: !!result.template_view_id,
            hasElements: Array.isArray(result.elements),
            elementCount: result.elements ? result.elements.length : 0
        });
    } catch (e) {
        console.log('❌ Global Function: Error', e.message);
    }
} else {
    console.log('❌ Global Function: Not found');
}

console.log('🧪 TEST COMPLETE');