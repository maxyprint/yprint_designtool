/**
 * 🔬 WOOCOMMERCE FIX VERIFICATION TESTER
 *
 * This console code specifically tests the WooCommerce integration fix
 * to verify that REAL design data is being extracted instead of test data.
 */

// 🔬 WC FIX VERIFICATION TESTER
async function verifyWooCommerceFix(orderId) {
    console.log('🔬 WC FIX VERIFICATION: Starting comprehensive verification...');
    console.log('📋 Testing Order ID:', orderId);

    if (!window.ajaxurl) {
        console.error('❌ AJAX URL not available. Make sure you are on a WordPress admin page.');
        return null;
    }

    try {
        // 🔧 STEP 1: Test the new PNG discovery system with order analysis
        console.log('\n🔍 STEP 1: Testing PNG Discovery System (Post-Fix)...');

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

        console.log('📊 PNG DISCOVERY RESULTS (POST-FIX):');
        console.log('✅ Success:', discoveryData.success);
        console.log('🎯 Original Identifier:', discoveryData.data?.original_identifier);
        console.log('🔍 Search Identifiers:', discoveryData.data?.search_identifiers);
        console.log('📂 Design Metadata:', discoveryData.data?.design_metadata);
        console.log('📁 Files Found:', discoveryData.data?.files?.length || 0);

        // 🔧 STEP 2: Analyze the design metadata for real vs test data
        if (discoveryData.success && discoveryData.data?.design_metadata) {
            console.log('\n🔍 STEP 2: Analyzing Design Metadata Quality...');

            const designMeta = discoveryData.data.design_metadata;
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
                console.log('\n📊 DESIGN DATA QUALITY ANALYSIS:');

                // Check if it's test mode
                const isTestMode = parsedDesignData.test_mode === true;
                console.log('🧪 Is Test Mode:', isTestMode ? '❌ YES (BAD)' : '✅ NO (GOOD)');

                // Check design ID vs order ID
                const designId = parsedDesignData.design_id || parsedDesignData.id;
                const isOrderIdAsDesignId = designId == orderId;
                console.log('🆔 Design ID:', designId);
                console.log('🔄 Order ID as Design ID:', isOrderIdAsDesignId ? '❌ YES (BAD)' : '✅ NO (GOOD)');

                // Check elements count
                const elementsCount = parsedDesignData.elements?.length || 0;
                console.log('🎨 Elements Count:', elementsCount, elementsCount > 0 ? '✅ (GOOD)' : '⚠️ (SUSPICIOUS)');

                // Check template view ID
                const templateViewId = parsedDesignData.template_view_id;
                console.log('🏷️ Template View ID:', templateViewId || 'NOT FOUND');

                // Check timestamp
                const timestamp = parsedDesignData.timestamp;
                console.log('⏰ Timestamp:', timestamp || 'NOT FOUND');

                // 🎯 OVERALL ASSESSMENT
                console.log('\n🎯 OVERALL FIX ASSESSMENT:');
                if (!isTestMode && !isOrderIdAsDesignId && elementsCount > 0) {
                    console.log('✅ SUCCESS: Real design data detected! Fix is working!');

                    // Test PNG discovery with the real design ID
                    if (designId && designId != orderId) {
                        console.log('\n🖼️ STEP 3: Testing PNG discovery with real design ID...');

                        const realIdFormData = new FormData();
                        realIdFormData.append('action', 'yprint_discover_png_files');
                        realIdFormData.append('identifier', designId);
                        realIdFormData.append('order_id', orderId);
                        realIdFormData.append('nonce', findNonce());

                        const realIdResponse = await fetch(window.ajaxurl, {
                            method: 'POST',
                            body: realIdFormData
                        });

                        const realIdData = await realIdResponse.json();

                        console.log('🎯 PNG DISCOVERY WITH REAL DESIGN ID:');
                        console.log('✅ Success:', realIdData.success);
                        console.log('📁 Files Found:', realIdData.data?.files?.length || 0);

                        if (realIdData.data?.files && realIdData.data.files.length > 0) {
                            console.log('\n🎯 PNG FILES FOUND WITH REAL DESIGN ID:');
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
                                fixWorking: true,
                                realDesignId: designId,
                                pngFiles: realIdData.data.files,
                                designData: parsedDesignData,
                                assessment: 'REAL_DATA_WITH_PNGS'
                            };
                        } else {
                            console.log('⚠️ Real design ID found but no matching PNGs');
                            return {
                                success: true,
                                fixWorking: true,
                                realDesignId: designId,
                                designData: parsedDesignData,
                                assessment: 'REAL_DATA_NO_PNGS'
                            };
                        }
                    }
                } else {
                    console.log('❌ FAILED: Still getting test/fake data! Fix not working properly.');
                    console.log('🔍 Issues detected:');
                    if (isTestMode) console.log('  - Test mode is still enabled');
                    if (isOrderIdAsDesignId) console.log('  - Order ID is being used as design ID');
                    if (elementsCount === 0) console.log('  - No design elements found');

                    return {
                        success: false,
                        fixWorking: false,
                        issues: {
                            testMode: isTestMode,
                            orderIdAsDesignId: isOrderIdAsDesignId,
                            noElements: elementsCount === 0
                        },
                        assessment: 'STILL_TEST_DATA'
                    };
                }
            } else {
                console.warn('⚠️ Could not parse design metadata');
            }
        } else {
            console.warn('⚠️ No design metadata found in discovery response');
        }

        return {
            success: false,
            discoveryData: discoveryData,
            assessment: 'NO_DESIGN_METADATA'
        };

    } catch (error) {
        console.error('❌ WC FIX VERIFICATION FAILED:', error);
        return null;
    }
}

// 🔧 Helper function to find nonce
function findNonce() {
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

// 🎯 Quick verification for current order page
function quickVerifyCurrentOrder() {
    const urlMatch = window.location.href.match(/post=(\d+)/);
    const orderId = urlMatch ? urlMatch[1] : null;

    if (orderId) {
        console.log('🔬 Verifying WooCommerce fix for current order:', orderId);
        return verifyWooCommerceFix(orderId);
    } else {
        console.error('❌ Could not detect order ID from current page URL');
        console.log('💡 Usage: verifyWooCommerceFix(ORDER_ID)');
        return null;
    }
}

// 🚀 READY MESSAGE
console.log(`
🔬 WOOCOMMERCE FIX VERIFICATION TESTER LOADED!

Available functions:
• quickVerifyCurrentOrder() - Verify fix on current WooCommerce order page
• verifyWooCommerceFix(orderId) - Verify fix for specific order

Examples:
• quickVerifyCurrentOrder()
• verifyWooCommerceFix(5391)

This will verify that the WooCommerce integration fix is working by:
1. Testing PNG discovery system post-fix
2. Analyzing design metadata quality (real vs test data)
3. Checking if order ID is incorrectly used as design ID
4. Verifying PNG files are found with correct design ID
5. Providing clear SUCCESS/FAILED assessment

🎯 Goal: Confirm the fix extracts REAL design data, not test data!
`);

// 🎯 Auto-verify if we're on an order page
if (window.location.href.includes('post.php') && window.location.href.includes('post=')) {
    console.log('🔍 Order page detected. Run quickVerifyCurrentOrder() to verify the fix!');
}