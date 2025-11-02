// 🧪 MANUAL PNG UPLOAD TEST
// Copy this code into browser console on https://yprint.de/designer/

async function manualPNGTest() {
    console.log('🧪 STARTING MANUAL PNG UPLOAD TEST...');

    // Step 1: Generate a test PNG
    console.log('🎯 Step 1: Generating test PNG...');

    // Check if PNG generation is available
    if (!window.generateDesignData || !window.highDPIPrintExportEngine) {
        console.error('❌ PNG systems not available. Make sure you are on the designer page.');
        return;
    }

    try {
        // Generate design data
        const designData = window.generateDesignData();
        console.log('✅ Design data generated:', {
            timestamp: designData.timestamp,
            template_id: designData.template_id,
            objects_count: designData.canvas?.objects?.length || 'unknown'
        });

        // Generate PNG using the high-DPI engine
        console.log('🖨️ Generating high-DPI PNG...');
        const pngResult = await window.highDPIPrintExportEngine.exportWithTemplateMetadata({
            dpi: 300,
            format: 'png',
            quality: 1
        });

        if (!pngResult || !pngResult.dataUrl) {
            console.error('❌ Failed to generate PNG');
            return;
        }

        console.log('✅ PNG generated successfully:', {
            dimensions: `${pngResult.width}x${pngResult.height}px`,
            dataUrl_length: pngResult.dataUrl.length,
            size_mb: (pngResult.dataUrl.length / 1024 / 1024).toFixed(2)
        });

        // Step 2: Test server upload
        console.log('🔬 Step 2: Testing server upload...');

        // Prepare the data exactly like the real system does
        const formData = new FormData();
        formData.append('action', 'yprint_save_design_print_png');
        formData.append('nonce', window.yprint_ajax?.nonce || window.yprint_save_png_ajax?.nonce || 'test-nonce');
        formData.append('design_id', `manual_test_${Date.now()}`);
        formData.append('design_data', JSON.stringify(designData));
        formData.append('print_png', pngResult.dataUrl);

        console.log('📡 Sending to server...', {
            url: window.yprint_ajax?.ajax_url || 'https://yprint.de/wp-admin/admin-ajax.php',
            action: 'yprint_save_design_print_png',
            nonce: window.yprint_ajax?.nonce || 'test-nonce',
            png_size: pngResult.dataUrl.length,
            png_size_mb: (pngResult.dataUrl.length / 1024 / 1024).toFixed(2)
        });

        // Send the request
        const response = await fetch(window.yprint_ajax?.ajax_url || 'https://yprint.de/wp-admin/admin-ajax.php', {
            method: 'POST',
            body: formData
        });

        console.log('📊 Server response status:', response.status, response.statusText);

        if (response.status === 413) {
            console.error('❌ HTTP 413: Request Entity Too Large - PHP limits too low!');
            console.log('🔧 Required: post_max_size=64M, upload_max_filesize=64M');
            return;
        }

        const responseText = await response.text();
        console.log('📋 Raw server response:', responseText);

        try {
            const jsonResponse = JSON.parse(responseText);
            console.log('📊 Parsed response:', jsonResponse);

            if (jsonResponse.success) {
                console.log('✅ SUCCESS! PNG uploaded successfully');
                if (jsonResponse.data?.png_url) {
                    console.log('🖼️ PNG URL:', jsonResponse.data.png_url);
                }
            } else {
                console.error('❌ Server rejected PNG:', jsonResponse.data);
                console.log('💡 This confirms the hosting limits are still too low');
            }
        } catch (parseError) {
            console.error('❌ Could not parse server response as JSON:', parseError);
            console.log('📋 Raw response was:', responseText);
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

// Step 3: Also test the current PHP configuration
function checkPHPLimits() {
    console.log('🔧 CHECKING PHP CONFIGURATION...');

    // Create a tiny test to see current limits
    const testData = new FormData();
    testData.append('action', 'test');
    testData.append('test_data', 'A'.repeat(1024 * 1024)); // 1MB test

    fetch('/wp-admin/admin-ajax.php', {
        method: 'POST',
        body: testData
    }).then(response => {
        console.log('📊 1MB test response:', response.status);

        // Now test 3MB
        const testData3MB = new FormData();
        testData3MB.append('action', 'test');
        testData3MB.append('test_data', 'A'.repeat(3 * 1024 * 1024)); // 3MB test

        return fetch('/wp-admin/admin-ajax.php', {
            method: 'POST',
            body: testData3MB
        });
    }).then(response => {
        console.log('📊 3MB test response:', response.status);
        if (response.status === 413) {
            console.error('❌ 3MB blocked - upload_max_filesize too low');
        } else {
            console.log('✅ 3MB allowed');
        }
    }).catch(error => {
        console.error('❌ PHP limit test failed:', error);
    });
}

// Run the tests
console.log('🚀 MANUAL PNG TEST READY');
console.log('Run: manualPNGTest() - to test PNG upload');
console.log('Run: checkPHPLimits() - to test PHP limits');

// Auto-run if called directly
if (typeof window !== 'undefined') {
    window.manualPNGTest = manualPNGTest;
    window.checkPHPLimits = checkPHPLimits;
}