/**
 * 🔍 REAL DESIGN DATA EXTRACTION CONSOLE TESTER
 *
 * This console code extracts ACTUAL design data from WooCommerce orders
 * to find the real design IDs stored in the database.
 */

// 🔍 DESIGN DATA EXTRACTION TESTER
async function testRealDesignDataExtraction(orderId) {
    console.log('🔍 REAL DESIGN DATA EXTRACTION: Starting comprehensive analysis...');
    console.log('📋 Testing Order ID:', orderId);

    if (!window.ajaxurl) {
        console.error('❌ AJAX URL not available. Make sure you are on a WordPress admin page.');
        return null;
    }

    try {
        // 🔧 STEP 1: Get ALL order meta data
        console.log('\n📊 STEP 1: Extracting ALL order meta data...');

        const orderMetaFormData = new FormData();
        orderMetaFormData.append('action', 'yprint_get_order_meta');
        orderMetaFormData.append('order_id', orderId);
        orderMetaFormData.append('nonce', findNonce());

        const orderMetaResponse = await fetch(window.ajaxurl, {
            method: 'POST',
            body: orderMetaFormData
        });

        let orderMeta = null;
        try {
            orderMeta = await orderMetaResponse.json();
        } catch (e) {
            console.warn('⚠️ Order meta endpoint not available, trying alternative method...');
        }

        // 🔧 STEP 2: Try WooCommerce order data endpoint
        console.log('\n📊 STEP 2: Trying WooCommerce order data extraction...');

        const wooOrderFormData = new FormData();
        wooOrderFormData.append('action', 'woocommerce_get_order_details');
        wooOrderFormData.append('order_id', orderId);
        wooOrderFormData.append('security', findNonce());

        let wooOrderData = null;
        try {
            const wooResponse = await fetch(window.ajaxurl, {
                method: 'POST',
                body: wooOrderFormData
            });
            wooOrderData = await wooResponse.json();
        } catch (e) {
            console.warn('⚠️ WooCommerce order endpoint not available...');
        }

        // 🔧 STEP 3: Try PNG discovery system to see what data it finds
        console.log('\n🔍 STEP 3: Testing PNG discovery system...');

        const discoveryFormData = new FormData();
        discoveryFormData.append('action', 'yprint_discover_png_files');
        discoveryFormData.append('identifier', orderId);
        discoveryFormData.append('order_id', orderId);
        discoveryFormData.append('nonce', findNonce());

        const discoveryResponse = await fetch(window.ajaxurl, {
            method: 'POST',
            body: discoveryFormData
        });

        const discoveryData = await discoveryResponse.json();

        console.log('📊 DISCOVERY RESULTS:');
        console.log('✅ Success:', discoveryData.success);
        console.log('🎯 Original Identifier:', discoveryData.data?.original_identifier);
        console.log('🔍 Search Identifiers:', discoveryData.data?.search_identifiers);
        console.log('📂 Design Metadata:', discoveryData.data?.design_metadata);

        // 🔧 STEP 4: Extract real design data from the discovery response
        if (discoveryData.success && discoveryData.data?.design_metadata) {
            console.log('\n🎯 STEP 4: REAL DESIGN DATA FOUND!');

            const designMeta = discoveryData.data.design_metadata;
            console.log('📄 Complete Design Metadata:', designMeta);

            // Try to parse the design data
            let parsedDesignData = null;
            if (typeof designMeta === 'string') {
                try {
                    parsedDesignData = JSON.parse(designMeta);
                } catch (e) {
                    console.warn('⚠️ Could not parse design metadata as JSON:', e);
                }
            } else {
                parsedDesignData = designMeta;
            }

            if (parsedDesignData) {
                console.log('\n🎯 PARSED DESIGN DATA:');
                console.log('🆔 Design ID:', parsedDesignData.design_id || 'NOT FOUND');
                console.log('🏷️ Template View ID:', parsedDesignData.template_view_id || 'NOT FOUND');
                console.log('⏰ Timestamp:', parsedDesignData.timestamp || 'NOT FOUND');
                console.log('🎨 Elements Count:', parsedDesignData.elements?.length || 0);
                console.log('📦 Template Data:', parsedDesignData.template || 'NOT FOUND');

                // Extract the REAL design ID
                const realDesignId = parsedDesignData.design_id ||
                                    parsedDesignData.id ||
                                    parsedDesignData.template?.id ||
                                    null;

                if (realDesignId) {
                    console.log('\n🎯 REAL DESIGN ID FOUND:', realDesignId);

                    // Test PNG search with the real design ID
                    console.log('\n🖼️ STEP 5: Testing PNG discovery with REAL design ID...');

                    const realIdFormData = new FormData();
                    realIdFormData.append('action', 'yprint_discover_png_files');
                    realIdFormData.append('identifier', realDesignId);
                    realIdFormData.append('order_id', orderId);
                    realIdFormData.append('nonce', findNonce());

                    const realIdResponse = await fetch(window.ajaxurl, {
                        method: 'POST',
                        body: realIdFormData
                    });

                    const realIdData = await realIdResponse.json();

                    console.log('🎯 REAL ID PNG SEARCH RESULTS:');
                    console.log('✅ Success:', realIdData.success);
                    console.log('📁 Files Found:', realIdData.data?.files?.length || 0);

                    if (realIdData.data?.files && realIdData.data.files.length > 0) {
                        console.log('\n🎯 SUCCESS! Found PNGs with real design ID:');
                        realIdData.data.files.forEach((file, index) => {
                            console.log(`📄 File ${index + 1}:`, {
                                filename: file.filename,
                                matched_identifier: file.matched_identifier,
                                size_mb: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                                url: file.url
                            });
                        });

                        return {
                            success: true,
                            realDesignId: realDesignId,
                            pngFiles: realIdData.data.files,
                            designData: parsedDesignData
                        };
                    } else {
                        console.warn('⚠️ No PNG files found even with real design ID');
                    }
                } else {
                    console.warn('⚠️ Could not extract real design ID from design data');
                }
            } else {
                console.warn('⚠️ Could not parse design metadata');
            }
        } else {
            console.warn('⚠️ No design metadata found in discovery response');
        }

        // 🔧 STEP 6: Manual inspection of all search identifiers
        console.log('\n🔧 STEP 6: Manual inspection of all search identifiers...');
        if (discoveryData.data?.search_identifiers) {
            for (const identifier of discoveryData.data.search_identifiers) {
                console.log(`🔍 Testing identifier: ${identifier}`);

                const testFormData = new FormData();
                testFormData.append('action', 'yprint_discover_png_files');
                testFormData.append('identifier', identifier);
                testFormData.append('nonce', findNonce());

                const testResponse = await fetch(window.ajaxurl, {
                    method: 'POST',
                    body: testFormData
                });

                const testData = await testResponse.json();

                if (testData.success && testData.data?.files?.length > 0) {
                    console.log(`✅ Found ${testData.data.files.length} files for identifier: ${identifier}`);
                    testData.data.files.forEach(file => {
                        console.log(`  📄 ${file.filename} (${file.matched_identifier})`);
                    });
                } else {
                    console.log(`❌ No files found for identifier: ${identifier}`);
                }
            }
        }

        return {
            success: false,
            orderMeta: orderMeta,
            wooOrderData: wooOrderData,
            discoveryData: discoveryData
        };

    } catch (error) {
        console.error('❌ REAL DESIGN DATA EXTRACTION FAILED:', error);
        return null;
    }
}

// 🔧 Helper function to find nonce
function findNonce() {
    // Try multiple nonce sources
    const nonceSources = [
        () => window.octo_print_designer_config?.nonce,
        () => document.querySelector('input[name="_wpnonce"]')?.value,
        () => document.querySelector('#_wpnonce')?.value,
        () => document.querySelector('input[name="security"]')?.value,
        () => 'admin_fallback'
    ];

    for (const source of nonceSources) {
        const nonce = source();
        if (nonce && nonce !== 'admin_fallback') {
            return nonce;
        }
    }

    return 'admin_fallback';
}

// 🎯 Quick test function for current order page
function quickTestRealDesignData() {
    // Try to extract order ID from current page
    const urlMatch = window.location.href.match(/post=(\d+)/);
    const orderId = urlMatch ? urlMatch[1] : null;

    if (orderId) {
        console.log('🔍 Testing real design data extraction for current order:', orderId);
        return testRealDesignDataExtraction(orderId);
    } else {
        console.error('❌ Could not detect order ID from current page URL');
        console.log('💡 Usage: testRealDesignDataExtraction(ORDER_ID)');
        return null;
    }
}

// 🚀 READY MESSAGE
console.log(`
🔍 REAL DESIGN DATA EXTRACTION TESTER LOADED!

Available functions:
• quickTestRealDesignData() - Test current WooCommerce order page
• testRealDesignDataExtraction(orderId) - Test specific order

Examples:
• quickTestRealDesignData()
• testRealDesignDataExtraction(5391)

This will:
1. Extract ALL order metadata
2. Find design data stored in WooCommerce
3. Parse JSON to find real design ID
4. Test PNG discovery with real design ID
5. Show exact PNG files that match

Goal: Find the ACTUAL database design ID, not the order ID!
`);

// 🎯 Auto-test if we're on an order page
if (window.location.href.includes('post.php') && window.location.href.includes('post=')) {
    console.log('🔍 Order page detected. Run quickTestRealDesignData() to start analysis!');
}