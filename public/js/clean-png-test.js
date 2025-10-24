/**
 * 🧪 CLEAN PNG STORAGE TEST
 * Minimal test function to isolate the storage issue
 */

window.cleanPNGTest = {
    async testPNGStorage() {
        console.log('🧪 === CLEAN PNG STORAGE TEST ===');

        try {
            // Create simple test canvas
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 200;
            const ctx = canvas.getContext('2d');

            // Draw simple test pattern
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(50, 50, 100, 100);
            ctx.fillStyle = '#ffffff';
            ctx.font = '20px Arial';
            ctx.fillText('TEST', 80, 110);

            const testPNG = canvas.toDataURL('image/png');
            console.log(`🧪 Generated test PNG: ${testPNG.length} chars`);

            // Test AJAX directly
            const testData = {
                action: 'yprint_save_design_print_png',
                design_id: 'clean_test_' + Date.now(),
                print_png: testPNG,
                nonce: window.octo_print_designer_config?.nonce,
                print_area_px: JSON.stringify({x: 0, y: 0, width: 200, height: 200}),
                print_area_mm: JSON.stringify({width: 50, height: 50}),
                template_id: 'clean_test',
                save_type: 'clean_test'
            };

            console.log('🧪 Sending AJAX request...');

            const response = await fetch(window.octo_print_designer_config.ajax_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(testData)
            });

            const result = await response.json();
            console.log('🧪 AJAX Response:', result);

            if (result.success) {
                console.log('✅ CLEAN TEST: PNG storage working!');
            } else {
                console.log('❌ CLEAN TEST: Storage failed:', result.data);
            }

            return result;

        } catch (error) {
            console.error('❌ CLEAN TEST ERROR:', error);
            return { success: false, error: error.message };
        }
    }
};

console.log('🧪 Clean PNG test loaded. Run: cleanPNGTest.testPNGStorage()');