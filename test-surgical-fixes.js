console.log('🧪 SURGICAL FIX TESTING: Starting PNG generation to test content contamination fixes...');

// Simulate triggering the emergency fallback 
if (window.saveOnlyPNGGenerator) {
    console.log('🎯 Testing with saveOnlyPNGGenerator instance...');
    window.saveOnlyPNGGenerator.generatePNG().then(result => {
        console.log('✅ TEST COMPLETE: PNG Generation Result:', result);
    }).catch(error => {
        console.log('❌ TEST ERROR:', error);
    });
} else {
    console.log('❌ saveOnlyPNGGenerator not available for testing');
}

console.log('🧪 Test script loaded - check console for results');
