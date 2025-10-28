/**
 * 🚀 AJAX HANDLER DIAGNOSIS
 * Direct browser console test for yprint_store_png WordPress AJAX handler
 *
 * USAGE: Copy this entire script into browser console on your live site
 */

console.log('🚀 AJAX HANDLER DIAGNOSIS: Starting WordPress AJAX handler test...');

async function diagnoseAJAXHandler() {
    console.log('🔍 STEP 1: Testing WordPress AJAX handler registration');

    // 1. Determine AJAX URL
    let ajaxurl;

    // Try multiple methods to get the correct AJAX URL
    if (window.ajaxurl) {
        ajaxurl = window.ajaxurl;
        console.log('✅ Found ajaxurl in window.ajaxurl:', ajaxurl);
    } else if (window.octo_print_designer_config?.ajax_url) {
        ajaxurl = window.octo_print_designer_config.ajax_url;
        console.log('✅ Found ajaxurl in config:', ajaxurl);
    } else {
        // Fallback: construct from current URL
        const currentURL = new URL(window.location.href);
        ajaxurl = `${currentURL.protocol}//${currentURL.host}/wp-admin/admin-ajax.php`;
        console.log('⚠️ Using fallback ajaxurl:', ajaxurl);
    }

    // 2. Test minimal AJAX call - just action, no data
    console.log('🧪 STEP 2: Testing minimal AJAX call (action only)');

    try {
        const minimalTest = await fetch(ajaxurl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'yprint_store_png'
            })
        });

        console.log(`📡 Response Status: ${minimalTest.status} ${minimalTest.statusText}`);

        const responseText = await minimalTest.text();
        console.log('📋 Raw Response Text:', responseText);

        // Analyze response
        if (responseText === '-1') {
            console.log('✅ HANDLER REGISTERED: WordPress returned -1 (nonce failure - expected)');
            console.log('🎯 RESULT: Handler exists but needs proper authentication');
            return 'handler_registered_needs_auth';

        } else if (responseText === '0') {
            console.log('✅ HANDLER REGISTERED: WordPress returned 0 (general failure - expected)');
            console.log('🎯 RESULT: Handler exists but failed validation');
            return 'handler_registered_validation_failed';

        } else if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
            console.log('❌ HANDLER NOT REGISTERED: Server returned HTML page');
            console.log('🎯 RESULT: WordPress did not recognize the action');
            console.log('📋 HTML Response Preview:', responseText.substring(0, 200) + '...');
            return 'handler_not_registered';

        } else if (responseText.includes('Fatal error') || responseText.includes('PHP')) {
            console.log('⚠️ HANDLER CRASHES: PHP error in handler');
            console.log('🎯 RESULT: Handler exists but has PHP errors');
            console.log('📋 Error Details:', responseText);
            return 'handler_has_php_errors';

        } else {
            console.log('🤔 UNEXPECTED RESPONSE: Unknown response format');
            console.log('📋 Response:', responseText);
            return 'unexpected_response';
        }

    } catch (error) {
        console.error('❌ AJAX REQUEST FAILED:', error);
        return 'ajax_request_failed';
    }
}

async function testWithAuthentication() {
    console.log('🔐 STEP 3: Testing with authentication (if available)');

    const config = window.octo_print_designer_config;
    let ajaxurl = config?.ajax_url || window.ajaxurl || '/wp-admin/admin-ajax.php';

    if (!config?.nonce) {
        console.log('⚠️ No nonce available - skipping authenticated test');
        return false;
    }

    try {
        const authTest = await fetch(ajaxurl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'yprint_store_png',
                nonce: config.nonce,
                design_id: 'test_diagnosis',
                save_type: 'diagnosis_test'
                // Intentionally no PNG data to test parameter validation
            })
        });

        const authResponseText = await authTest.text();
        console.log('🔐 Authenticated Response:', authResponseText);

        if (authResponseText.includes('"success"')) {
            console.log('✅ HANDLER WORKING: Returned JSON response');
            return 'handler_working';
        } else if (authResponseText.includes('missing') || authResponseText.includes('required')) {
            console.log('✅ HANDLER WORKING: Proper parameter validation');
            return 'handler_validating';
        } else {
            console.log('❓ HANDLER STATUS UNCLEAR:', authResponseText);
            return 'unclear';
        }

    } catch (error) {
        console.error('❌ Authenticated test failed:', error);
        return 'auth_test_failed';
    }
}

async function testWithMinimalPNG() {
    console.log('🖼️ STEP 4: Testing with minimal PNG data');

    const config = window.octo_print_designer_config;
    let ajaxurl = config?.ajax_url || window.ajaxurl || '/wp-admin/admin-ajax.php';

    // Create smallest possible PNG (1x1 pixel)
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, 0, 1, 1);
    const minimalPNG = canvas.toDataURL('image/png');

    console.log(`🖼️ Minimal PNG size: ${minimalPNG.length} characters`);

    try {
        const pngTest = await fetch(ajaxurl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'yprint_store_png',
                nonce: config?.nonce || '',
                design_id: 'test_minimal_png',
                print_png: minimalPNG,
                save_type: 'minimal_test'
            })
        });

        const pngResponseText = await pngTest.text();
        console.log('🖼️ PNG Test Response:', pngResponseText);

        try {
            const pngResponseJSON = JSON.parse(pngResponseText);
            if (pngResponseJSON.success) {
                console.log('🎉 PNG STORAGE WORKING: Successfully stored minimal PNG');
                console.log('📋 Response Data:', pngResponseJSON.data);
                return 'png_storage_working';
            } else {
                console.log('❌ PNG Storage failed:', pngResponseJSON.data);
                return 'png_storage_failed';
            }
        } catch (jsonError) {
            console.log('📋 Non-JSON response:', pngResponseText);
            return 'non_json_response';
        }

    } catch (error) {
        console.error('❌ PNG test failed:', error);
        return 'png_test_failed';
    }
}

// Main diagnostic function
async function runCompleteAJAXDiagnosis() {
    console.log('🚀 COMPLETE AJAX DIAGNOSIS: Starting comprehensive test...');
    console.log('================================================');

    const step1 = await diagnoseAJAXHandler();
    console.log(`\n🔍 STEP 1 RESULT: ${step1}`);

    if (step1 === 'handler_registered_needs_auth' || step1 === 'handler_registered_validation_failed') {
        const step2 = await testWithAuthentication();
        console.log(`\n🔐 STEP 2 RESULT: ${step2}`);

        if (step2 === 'handler_working' || step2 === 'handler_validating') {
            const step3 = await testWithMinimalPNG();
            console.log(`\n🖼️ STEP 3 RESULT: ${step3}`);
        }
    }

    console.log('\n🎯 DIAGNOSIS COMPLETE');
    console.log('================================================');

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   Handler Registration: ${step1}`);

    if (step1.includes('registered')) {
        console.log('   ✅ WordPress AJAX handler is registered');
        console.log('   🎯 Next: Test with actual PNG data');
    } else if (step1 === 'handler_not_registered') {
        console.log('   ❌ WordPress AJAX handler NOT registered');
        console.log('   🎯 Next: Check PHP code - add_action missing');
    } else if (step1 === 'handler_has_php_errors') {
        console.log('   ⚠️ Handler registered but has PHP errors');
        console.log('   🎯 Next: Fix PHP syntax/logic errors');
    }
}

// Auto-run diagnosis
setTimeout(() => {
    runCompleteAJAXDiagnosis();
}, 1000);

// Make functions globally available for manual testing
window.diagnoseAJAXHandler = diagnoseAJAXHandler;
window.testWithAuthentication = testWithAuthentication;
window.testWithMinimalPNG = testWithMinimalPNG;
window.runCompleteAJAXDiagnosis = runCompleteAJAXDiagnosis;

console.log('🚀 AJAX DIAGNOSIS: Script loaded, diagnosis will run in 1 second');
console.log('💡 Manual execution: runCompleteAJAXDiagnosis()');