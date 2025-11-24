/**
 * 🧪 PNG DISCOVERY CONSOLE TESTER
 *
 * Teste das intelligente PNG Discovery System direkt in der Browser-Konsole
 * Kopiere diesen Code in die Browser-Konsole auf einer WooCommerce Order-Seite
 */

// 🧪 PNG DISCOVERY TESTER FUNCTION
async function testPNGDiscovery(orderId, designId = null) {
    console.log('🧪 PNG DISCOVERY TEST: Starting comprehensive test...');
    console.log('📋 Test Parameters:', { orderId, designId });

    if (!window.ajaxurl) {
        console.error('❌ AJAX URL not available. Make sure you are on a WordPress admin page.');
        return;
    }

    try {
        // 🔧 STEP 1: Test PNG Discovery System
        console.log('\n🔍 STEP 1: Testing PNG Discovery with Order Analysis');

        const formData = new FormData();
        formData.append('action', 'yprint_discover_png_files');
        formData.append('identifier', designId || orderId);
        formData.append('order_id', orderId);
        // Get proper nonce from current page
        const nonce = window.octo_print_designer_config?.nonce ||
                     document.querySelector('input[name="_wpnonce"]')?.value ||
                     document.querySelector('#_wpnonce')?.value ||
                     'admin_fallback';

        formData.append('nonce', nonce);
        console.log('🔑 Using nonce:', nonce);

        const response = await fetch(window.ajaxurl, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        console.log('📊 PNG DISCOVERY RESULTS:');
        console.log('✅ Success:', data.success);
        console.log('🔍 Original Identifier:', data.data?.original_identifier);
        console.log('🎯 Search Identifiers Found:', data.data?.search_identifiers);
        console.log('📂 Design Metadata:', data.data?.design_metadata);
        console.log('📁 Discovered Files:', data.data?.files);
        console.log('📈 Total Files Found:', data.data?.count);

        if (data.data?.files && data.data.files.length > 0) {
            console.log('\n🎯 DETAILED FILE ANALYSIS:');
            data.data.files.forEach((file, index) => {
                console.log(`📄 File ${index + 1}:`, {
                    filename: file.filename,
                    matched_identifier: file.matched_identifier,
                    directory: file.directory,
                    size_mb: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                    modified: file.modified_readable,
                    url: file.url
                });
            });

            // 🧪 STEP 2: Test Direct Image Loading
            console.log('\n🖼️ STEP 2: Testing Direct Image Loading');
            const testFile = data.data.files[0];

            const img = new Image();
            img.onload = () => {
                console.log('✅ IMAGE LOAD SUCCESS:', {
                    url: testFile.url,
                    dimensions: `${img.naturalWidth}x${img.naturalHeight}`,
                    filename: testFile.filename
                });
            };
            img.onerror = () => {
                console.error('❌ IMAGE LOAD FAILED:', testFile.url);
            };
            img.src = testFile.url;
        } else {
            console.warn('⚠️ No PNG files found for this order/design');
        }

        // 🔧 STEP 3: Test SimplePNGPreview Integration
        if (window.SimplePNGPreview && data.data?.files?.length > 0) {
            console.log('\n🎯 STEP 3: Testing SimplePNGPreview Integration');

            // Create test container
            const testContainer = document.createElement('div');
            testContainer.id = 'png-test-container';
            testContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; width: 300px; height: 200px; background: white; border: 2px solid #007cba; border-radius: 8px; padding: 10px; z-index: 9999; box-shadow: 0 4px 20px rgba(0,0,0,0.3);';
            document.body.appendChild(testContainer);

            // Test SimplePNGPreview
            const preview = new SimplePNGPreview('png-test-container', orderId);
            const testDesignData = {
                design_id: data.data.search_identifiers[0] || orderId,
                order_id: orderId,
                test_mode: true
            };

            await preview.showPreview(testDesignData);

            // Auto-remove test container after 10 seconds
            setTimeout(() => {
                if (testContainer && testContainer.parentNode) {
                    testContainer.parentNode.removeChild(testContainer);
                    console.log('🗑️ Test container removed');
                }
            }, 10000);
        }

        return data;

    } catch (error) {
        console.error('❌ PNG DISCOVERY TEST FAILED:', error);
        return null;
    }
}

// 🎯 QUICK TEST FUNCTIONS
function quickTestCurrentOrder() {
    // Try to extract order ID from current page
    const urlMatch = window.location.href.match(/post=(\d+)/);
    const orderId = urlMatch ? urlMatch[1] : null;

    if (orderId) {
        console.log('🔍 Testing PNG discovery for current order:', orderId);
        return testPNGDiscovery(orderId);
    } else {
        console.error('❌ Could not detect order ID from current page URL');
        console.log('💡 Usage: testPNGDiscovery(ORDER_ID, OPTIONAL_DESIGN_ID)');
    }
}

function testSpecificOrder(orderId, designId = null) {
    console.log('🧪 Testing specific order:', orderId, 'with design ID:', designId);
    return testPNGDiscovery(orderId, designId);
}

// 🚀 READY MESSAGE
console.log(`
🧪 PNG DISCOVERY CONSOLE TESTER LOADED!

Available functions:
• quickTestCurrentOrder() - Test current WooCommerce order page
• testSpecificOrder(orderId, designId) - Test specific order/design
• testPNGDiscovery(orderId, designId) - Full comprehensive test

Examples:
• quickTestCurrentOrder()
• testSpecificOrder(5391)
• testSpecificOrder(5391, "design_355")
• testPNGDiscovery(5391, "355")

The test will:
1. Analyze order data for design identifiers
2. Search filesystem for matching PNG files
3. Test direct image loading
4. Show live preview if possible
`);

// 🎯 Auto-test if we're on an order page
if (window.location.href.includes('post.php') && window.location.href.includes('post=')) {
    console.log('🔍 Order page detected. Run quickTestCurrentOrder() to test!');
}