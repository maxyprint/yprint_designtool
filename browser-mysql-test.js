/**
 * 🔍 BROWSER-BASED MYSQL DIAGNOSTIC
 * Direct browser console test for MySQL limits and PNG storage
 */

console.log('🔍 BROWSER MYSQL TEST: Starting comprehensive diagnostic...');

// Test MySQL limits and PNG storage capability
async function runMySQLDiagnostic() {
    console.log('🔍 MYSQL DIAGNOSTIC: Testing database limits and PNG storage...');

    const config = window.octo_print_designer_config;
    if (!config) {
        console.error('❌ WordPress AJAX configuration not available');
        return false;
    }

    // 1. Test basic AJAX connectivity
    console.log('📡 Testing AJAX connectivity...');

    try {
        const testResponse = await fetch(config.ajax_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'heartbeat',
                _wpnonce: config.nonce || ''
            })
        });

        console.log(`📡 AJAX Response Status: ${testResponse.status} ${testResponse.statusText}`);

        if (!testResponse.ok) {
            console.error(`❌ AJAX connectivity failed: ${testResponse.status}`);
            return false;
        }

        // 2. Test PNG storage with a small test PNG
        console.log('🖼️ Testing PNG storage with sample data...');

        // Create a small test PNG (1x1 pixel)
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 1, 1);
        const smallTestPNG = canvas.toDataURL('image/png');

        console.log(`🖼️ Small test PNG size: ${smallTestPNG.length} characters`);

        const smallPngTest = await testPNGStorage(smallTestPNG, 'small_test');

        if (!smallPngTest.success) {
            console.error('❌ Small PNG storage failed:', smallPngTest.error);
            return false;
        }

        console.log('✅ Small PNG storage successful');

        // 3. Test with progressively larger PNGs
        console.log('📈 Testing with larger PNG sizes...');

        const sizes = [
            { width: 100, height: 100, name: 'medium_test' },
            { width: 500, height: 500, name: 'large_test' },
            { width: 1312, height: 840, name: 'production_size_test' }
        ];

        for (const size of sizes) {
            const testCanvas = document.createElement('canvas');
            testCanvas.width = size.width;
            testCanvas.height = size.height;
            const testCtx = testCanvas.getContext('2d');

            // Fill with pattern to make it non-compressible
            for (let x = 0; x < size.width; x += 10) {
                for (let y = 0; y < size.height; y += 10) {
                    testCtx.fillStyle = `rgb(${x % 255}, ${y % 255}, ${(x + y) % 255})`;
                    testCtx.fillRect(x, y, 10, 10);
                }
            }

            const testPNG = testCanvas.toDataURL('image/png', 1.0);
            const sizeMB = (testPNG.length / 1024 / 1024).toFixed(2);

            console.log(`🖼️ Testing ${size.width}x${size.height} PNG: ${testPNG.length} chars (${sizeMB} MB)`);

            const result = await testPNGStorage(testPNG, size.name);

            if (result.success) {
                console.log(`✅ ${size.width}x${size.height} PNG storage successful`);
            } else {
                console.error(`❌ ${size.width}x${size.height} PNG storage failed:`, result.error);

                // If this size fails, we've found the limit
                console.log(`🚨 PNG SIZE LIMIT REACHED: ${sizeMB} MB`);
                break;
            }
        }

        return true;

    } catch (error) {
        console.error('❌ MySQL diagnostic failed:', error);
        return false;
    }
}

// Helper function to test PNG storage
async function testPNGStorage(pngData, testId) {
    const config = window.octo_print_designer_config;

    const formData = new URLSearchParams({
        action: 'yprint_store_png',
        design_id: `test_${testId}_${Date.now()}`,
        print_png: pngData,
        save_type: 'mysql_diagnostic_test',
        nonce: config.nonce || ''
    });

    try {
        const response = await fetch(config.ajax_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });

        if (!response.ok) {
            return {
                success: false,
                error: `HTTP ${response.status}: ${response.statusText}`
            };
        }

        const result = await response.json();

        if (result.success) {
            return { success: true, data: result.data };
        } else {
            return {
                success: false,
                error: result.data || 'Unknown error'
            };
        }

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Auto-run the diagnostic
setTimeout(() => {
    runMySQLDiagnostic().then(success => {
        if (success) {
            console.log('🎉 MYSQL DIAGNOSTIC: Completed successfully');
        } else {
            console.log('❌ MYSQL DIAGNOSTIC: Failed - check errors above');
        }
    });
}, 3000);

// Make functions globally available
window.runMySQLDiagnostic = runMySQLDiagnostic;
window.testPNGStorage = testPNGStorage;

console.log('🔍 BROWSER MYSQL TEST: Script loaded, diagnostic will run in 3 seconds...');
console.log('💡 Manual execution: runMySQLDiagnostic()');