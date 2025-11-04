// 🔍 TEMPLATE ID DEBUG TEST
// Copy this into browser console on https://yprint.de/designer/?template_id=3657&color=black

function testTemplateIdDetection() {
    console.log('🔍 TEMPLATE ID DEBUG TEST STARTING...');

    // Test current URL
    console.log('📍 Current URL:', window.location.href);
    console.log('📍 Current search:', window.location.search);

    // Test URLSearchParams
    const urlParams = new URLSearchParams(window.location.search);
    console.log('📍 URLSearchParams object:', urlParams);

    // Test each parameter method
    const templateId1 = urlParams.get('template_id');
    const templateId2 = urlParams.get('template');
    const templateId3 = urlParams.get('tid');

    console.log('🔍 URL Parameter Tests:');
    console.log('  template_id:', templateId1);
    console.log('  template:', templateId2);
    console.log('  tid:', templateId3);

    // Test all URL parameters
    console.log('🔍 All URL Parameters:');
    for (const [key, value] of urlParams.entries()) {
        console.log(`  ${key}: ${value}`);
    }

    // Test the exact code from the engine
    let templateId = urlParams.get('template_id') || urlParams.get('template') || urlParams.get('tid');
    console.log('🎯 Final result (engine logic):', templateId);

    // Test if the high-DPI engine function exists and works
    if (window.highDPIPrintExportEngine && window.highDPIPrintExportEngine.getCurrentTemplateId) {
        console.log('🔍 Testing actual engine function...');
        try {
            const engineResult = window.highDPIPrintExportEngine.getCurrentTemplateId();
            console.log('🎯 Engine getCurrentTemplateId result:', engineResult);
        } catch (error) {
            console.error('❌ Engine getCurrentTemplateId failed:', error);
        }
    } else {
        console.log('❌ highDPIPrintExportEngine.getCurrentTemplateId not available');
    }

    // Test manual template ID setting
    console.log('🔧 Manual template ID test:');
    if (templateId1) {
        console.log('✅ Would return template_id:', templateId1);

        // Test the database fetch with this ID
        console.log('🔍 Testing database fetch with template ID:', templateId1);
        if (window.highDPIPrintExportEngine && window.highDPIPrintExportEngine.fetchTemplatePrintArea) {
            console.log('🎯 About to test fetchTemplatePrintArea...');
            // Note: We won't actually call it since it would fail without the ID being set
        }
    } else {
        console.log('❌ No template_id found in URL parameters');
    }
}

// Auto-run
if (typeof window !== 'undefined') {
    window.testTemplateIdDetection = testTemplateIdDetection;
    console.log('🚀 TEMPLATE ID DEBUG TEST READY');
    console.log('Run: testTemplateIdDetection() - to debug template ID detection');
}