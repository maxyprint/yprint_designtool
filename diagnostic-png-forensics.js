/**
 * 🔍 FORENSIC DIAGNOSTIC SCRIPT
 * Sammelt kritische Daten zu den PNG-Storage-Problemen
 *
 * VERWENDUNG: Paste this into browser console on YPrint Designer page
 */

window.pngForensics = {

    // 📊 Frage 1a: Nonce-Timing-Analysis
    analyzeNonceTiming() {
        console.log('🔍 === NONCE TIMING ANALYSIS ===');

        const pageLoadTime = performance.timing.navigationStart;
        const currentTime = Date.now();
        const timeSincePageLoad = currentTime - pageLoadTime;

        console.log('⏰ Page Load Time:', new Date(pageLoadTime).toISOString());
        console.log('⏰ Current Time:', new Date(currentTime).toISOString());
        console.log('⏰ Time Since Page Load:', (timeSincePageLoad / 1000).toFixed(2), 'seconds');
        console.log('⏰ Time Since Page Load:', (timeSincePageLoad / 60000).toFixed(2), 'minutes');

        // Check nonce in global config
        const globalNonce = window.octo_print_designer_config?.nonce ||
                           window.octoPrintDesigner?.nonce;
        console.log('🔑 Global Nonce Available:', !!globalNonce);
        console.log('🔑 Global Nonce Value:', globalNonce);

        // WordPress nonce lifetime is typically 12-24 hours
        const WORDPRESS_NONCE_LIFETIME_MS = 12 * 60 * 60 * 1000; // 12 hours conservative
        const isLikelyExpired = timeSincePageLoad > WORDPRESS_NONCE_LIFETIME_MS;

        console.log('⚠️ Likely Nonce Expired (>12h):', isLikelyExpired);

        return {
            pageLoadTime,
            currentTime,
            timeSincePageLoadMs: timeSincePageLoad,
            timeSincePageLoadMinutes: timeSincePageLoad / 60000,
            globalNonceAvailable: !!globalNonce,
            globalNonce,
            likelyExpired: isLikelyExpired
        };
    },

    // 📊 Frage 2a: Base64 Payload-Größe
    analyzePayloadSize() {
        console.log('🔍 === PAYLOAD SIZE ANALYSIS ===');

        if (!window.designerWidgetInstance?.fabricCanvas) {
            console.log('❌ No fabric canvas available for analysis');
            return null;
        }

        const canvas = window.designerWidgetInstance.fabricCanvas;

        // Generate test PNG at different qualities
        const testResults = [];

        [0.1, 0.5, 0.8, 1.0].forEach(quality => {
            try {
                const dataURL = canvas.toDataURL('image/png', quality);
                const base64Data = dataURL.split(',')[1];
                const base64SizeBytes = base64Data.length;
                const estimatedBinarySizeBytes = base64SizeBytes * 0.75; // Base64 overhead ~33%

                testResults.push({
                    quality,
                    base64SizeBytes,
                    base64SizeMB: (base64SizeBytes / 1024 / 1024).toFixed(2),
                    estimatedBinarySizeMB: (estimatedBinarySizeBytes / 1024 / 1024).toFixed(2),
                    dataURLLength: dataURL.length
                });

                console.log(`📊 Quality ${quality}: ${(base64SizeBytes / 1024 / 1024).toFixed(2)}MB base64, estimated ${(estimatedBinarySizeBytes / 1024 / 1024).toFixed(2)}MB binary`);
            } catch (error) {
                console.log(`❌ Failed to generate PNG at quality ${quality}:`, error);
            }
        });

        // Check if any size exceeds common PHP limits
        const commonPHPLimits = {
            post_max_size: 8 * 1024 * 1024, // 8MB common default
            upload_max_filesize: 2 * 1024 * 1024, // 2MB common default
            memory_limit: 128 * 1024 * 1024 // 128MB common default
        };

        testResults.forEach(result => {
            result.exceedsPostMaxSize = result.base64SizeBytes > commonPHPLimits.post_max_size;
            result.exceedsUploadMaxFilesize = result.base64SizeBytes > commonPHPLimits.upload_max_filesize;
        });

        return testResults;
    },

    // 📊 Frage 3a: Enhanced Clone Output Analysis
    analyzeEnhancedCloneOutput() {
        console.log('🔍 === ENHANCED CLONE OUTPUT ANALYSIS ===');

        if (!window.designerWidgetInstance?.fabricCanvas) {
            console.log('❌ No fabric canvas available for analysis');
            return null;
        }

        const canvas = window.designerWidgetInstance.fabricCanvas;
        const objects = canvas.getObjects();

        if (objects.length === 0) {
            console.log('❌ No objects on canvas for analysis');
            return null;
        }

        const testObject = objects[0];

        // Test enhanced metadata generation
        if (window.HighDPIPrintExportEngine || window.highDPIPrintExportEngine) {
            const engine = window.HighDPIPrintExportEngine || window.highDPIPrintExportEngine;

            if (engine.extractPrintMetadata) {
                try {
                    const enhancedMetadata = engine.extractPrintMetadata(testObject);
                    console.log('✅ Enhanced Metadata Generated:', enhancedMetadata);

                    // Check for potentially problematic characters
                    const metadataJSON = JSON.stringify(enhancedMetadata);
                    const hasSpecialChars = /[^\x20-\x7E]/.test(metadataJSON);
                    const hasQuotes = metadataJSON.includes('"');
                    const hasBackslashes = metadataJSON.includes('\\');

                    console.log('🔍 Metadata JSON Length:', metadataJSON.length);
                    console.log('🔍 Has Non-ASCII Chars:', hasSpecialChars);
                    console.log('🔍 Has Quotes:', hasQuotes);
                    console.log('🔍 Has Backslashes:', hasBackslashes);

                    return {
                        enhancedMetadata,
                        metadataJSON,
                        metadataJSONLength: metadataJSON.length,
                        hasSpecialChars,
                        hasQuotes,
                        hasBackslashes
                    };
                } catch (error) {
                    console.log('❌ Enhanced Metadata Generation Failed:', error);
                    return { error: error.message };
                }
            } else {
                console.log('❌ extractPrintMetadata method not available');
                return null;
            }
        } else {
            console.log('❌ High-DPI Engine not available');
            return null;
        }
    },

    // 🧪 Isolation Test: Minimal PNG Storage
    testMinimalPNGStorage() {
        console.log('🔍 === MINIMAL PNG STORAGE TEST ===');

        // Create minimal test canvas
        const testCanvas = document.createElement('canvas');
        testCanvas.width = 100;
        testCanvas.height = 100;
        const ctx = testCanvas.getContext('2d');

        // Draw simple red rectangle
        ctx.fillStyle = 'red';
        ctx.fillRect(10, 10, 80, 80);

        const minimalDataURL = testCanvas.toDataURL('image/png', 0.1);
        const minimalBase64 = minimalDataURL.split(',')[1];
        const minimalSizeBytes = minimalBase64.length;

        console.log('🧪 Minimal PNG Size:', (minimalSizeBytes / 1024).toFixed(2), 'KB');
        console.log('🧪 Minimal DataURL Length:', minimalDataURL.length);

        // Test AJAX call with minimal data
        const testData = {
            action: 'yprint_save_design_print_png',
            design_id: 'test_minimal_' + Date.now(),
            print_png: minimalDataURL,
            nonce: window.octo_print_designer_config?.nonce || window.octoPrintDesigner?.nonce,
            print_area_px: JSON.stringify({x: 0, y: 0, width: 100, height: 100}),
            print_area_mm: JSON.stringify({width: 25, height: 25}),
            template_id: 'test',
            save_type: 'forensic_test'
        };

        console.log('🧪 Testing minimal AJAX call...');

        return fetch(window.octo_print_designer_config?.ajax_url || '/wp-admin/admin-ajax.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(testData)
        })
        .then(response => response.json())
        .then(result => {
            console.log('✅ Minimal PNG Storage Test Result:', result);
            return {
                success: result.success,
                data: result.data,
                minimalSizeBytes,
                testData
            };
        })
        .catch(error => {
            console.log('❌ Minimal PNG Storage Test Failed:', error);
            return {
                success: false,
                error: error.message,
                minimalSizeBytes,
                testData
            };
        });
    },

    // 🔄 Complete Forensic Analysis
    async runCompleteAnalysis() {
        console.log('🚨 === COMPLETE PNG FORENSIC ANALYSIS ===');

        const results = {
            timestamp: new Date().toISOString(),
            nonceTiming: this.analyzeNonceTiming(),
            payloadSize: this.analyzePayloadSize(),
            enhancedCloneOutput: this.analyzeEnhancedCloneOutput()
        };

        console.log('🧪 Running minimal storage test...');
        results.minimalStorageTest = await this.testMinimalPNGStorage();

        console.log('📋 === FORENSIC ANALYSIS COMPLETE ===');
        console.log('📋 Copy this data for debugging:', JSON.stringify(results, null, 2));

        return results;
    }
};

// Auto-run analysis if requested
console.log('🔍 PNG Forensics loaded. Run pngForensics.runCompleteAnalysis() for complete analysis');