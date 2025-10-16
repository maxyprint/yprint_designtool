/**
 * 🛒 WOOCOMMERCE PNG INTEGRATION v1.0
 * WordPress/WooCommerce integration for PNG Plugin
 *
 * PURPOSE: Upload PNG exports to WooCommerce without Core-Designer modification
 * ARCHITECTURE: Separate AJAX handlers, isolated from coordinate system
 */

(function() {
    'use strict';

    console.log('🛒 WC PNG INTEGRATION: Loading WooCommerce integration...');

    /**
     * WooCommerce PNG Integration Module
     * Handles PNG uploads independently of Core-Designer
     */
    window.YPrintWCIntegration = {
        version: '1.0.0',

        // Upload configuration
        config: {
            maxFileSize: 5 * 1024 * 1024, // 5MB
            allowedFormats: ['image/png'],
            uploadPath: '/wp-content/uploads/yprint-designs/',
            ajaxAction: 'yprint_upload_png',
            nonceAction: 'yprint_png_nonce'
        },

        // Upload statistics
        stats: {
            uploadsToday: 0,
            totalUploads: 0,
            lastUpload: null
        },

        /**
         * Initialize WooCommerce integration
         */
        initialize() {
            console.log('🛒 WC INTEGRATION: Initializing...');

            // Validate WordPress environment
            if (typeof window.ajaxurl === 'undefined') {
                console.warn('⚠️ WC INTEGRATION: WordPress AJAX URL not available');
                return false;
            }

            // Validate jQuery
            if (typeof $ === 'undefined') {
                console.warn('⚠️ WC INTEGRATION: jQuery not available');
                return false;
            }

            // Add integration methods to PNG Plugin
            this.enhancePNGPlugin();

            console.log('✅ WC INTEGRATION: Initialization complete');
            return true;
        },

        /**
         * Enhance PNG Plugin with WooCommerce capabilities
         */
        enhancePNGPlugin() {
            if (!window.YPrintPNGPlugin) {
                console.warn('⚠️ WC INTEGRATION: PNG Plugin not available for enhancement');
                return;
            }

            // Add WooCommerce upload method
            window.YPrintPNGPlugin.uploadToWooCommerce = this.uploadPNG.bind(this);
            window.YPrintPNGPlugin.batchUploadToWooCommerce = this.batchUpload.bind(this);
            window.YPrintPNGPlugin.getUploadStats = () => this.stats;

            console.log('✅ WC INTEGRATION: PNG Plugin enhanced with WooCommerce capabilities');
        },

        /**
         * Upload PNG to WooCommerce
         */
        async uploadPNG(pngDataURL, metadata = {}) {
            console.log('🛒 WC INTEGRATION: Starting PNG upload to WooCommerce...');

            return new Promise((resolve, reject) => {
                try {
                    // Validate PNG data
                    if (!this.validatePNGData(pngDataURL)) {
                        throw new Error('Invalid PNG data provided');
                    }

                    // Check file size
                    const fileSize = this.calculateDataURLSize(pngDataURL);
                    if (fileSize > this.config.maxFileSize) {
                        throw new Error(`File size ${Math.round(fileSize / 1024)}KB exceeds limit of ${Math.round(this.config.maxFileSize / 1024)}KB`);
                    }

                    // Prepare upload data
                    const uploadData = {
                        action: this.config.ajaxAction,
                        png_data: pngDataURL,
                        design_metadata: JSON.stringify({
                            width: metadata.width || 400,
                            height: metadata.height || 300,
                            resolution: metadata.resolution || 'standard',
                            plugin_version: this.version,
                            timestamp: Date.now(),
                            file_size: fileSize,
                            ...metadata
                        }),
                        security: this.getNonce()
                    };

                    console.log('🛒 WC INTEGRATION: Sending PNG data to WordPress...');

                    // Make AJAX request
                    $.post(window.ajaxurl, uploadData)
                        .done((response) => {
                            console.log('🛒 WC INTEGRATION: Upload response received:', response);

                            if (response.success) {
                                // Update statistics
                                this.updateUploadStats(fileSize);

                                // Fire success event
                                this.fireUploadEvent('success', response.data);

                                resolve({
                                    success: true,
                                    png_path: response.data.png_path,
                                    png_url: response.data.png_url,
                                    file_size: response.data.file_size,
                                    timestamp: response.data.timestamp,
                                    attachment_id: response.data.attachment_id || null
                                });
                            } else {
                                const errorMessage = response.data || 'Upload failed';
                                console.error('🛒 WC INTEGRATION: Upload failed:', errorMessage);

                                this.fireUploadEvent('error', { error: errorMessage });
                                reject(new Error(errorMessage));
                            }
                        })
                        .fail((xhr, status, error) => {
                            const errorMessage = `AJAX request failed: ${status} - ${error}`;
                            console.error('🛒 WC INTEGRATION: AJAX error:', errorMessage);

                            this.fireUploadEvent('error', { error: errorMessage });
                            reject(new Error(errorMessage));
                        });

                } catch (error) {
                    console.error('🛒 WC INTEGRATION: Upload error:', error);
                    this.fireUploadEvent('error', { error: error.message });
                    reject(error);
                }
            });
        },

        /**
         * Batch upload multiple PNGs
         */
        async batchUpload(pngDataURLs, metadata = {}) {
            console.log(`🛒 WC INTEGRATION: Batch uploading ${pngDataURLs.length} PNGs...`);

            const results = [];
            const batchId = Date.now().toString();

            this.fireUploadEvent('batch-start', {
                batchId,
                count: pngDataURLs.length
            });

            for (const [index, pngDataURL] of pngDataURLs.entries()) {
                try {
                    console.log(`🛒 WC INTEGRATION: Uploading PNG ${index + 1}/${pngDataURLs.length}`);

                    const result = await this.uploadPNG(pngDataURL, {
                        ...metadata,
                        batch_id: batchId,
                        batch_index: index,
                        batch_total: pngDataURLs.length
                    });

                    results.push({ success: true, data: result, index });

                    // Fire progress event
                    this.fireUploadEvent('batch-progress', {
                        batchId,
                        completed: index + 1,
                        total: pngDataURLs.length,
                        result
                    });

                } catch (error) {
                    console.error(`🛒 WC INTEGRATION: Batch upload ${index + 1} failed:`, error);
                    results.push({ success: false, error: error.message, index });

                    // Fire error event
                    this.fireUploadEvent('batch-error', {
                        batchId,
                        index,
                        error: error.message
                    });
                }

                // Add delay between uploads to prevent server overload
                if (index < pngDataURLs.length - 1) {
                    await this.delay(100);
                }
            }

            const successCount = results.filter(r => r.success).length;
            console.log(`🛒 WC INTEGRATION: Batch upload complete (${successCount}/${pngDataURLs.length} successful)`);

            this.fireUploadEvent('batch-complete', {
                batchId,
                results,
                successCount,
                totalCount: pngDataURLs.length
            });

            return results;
        },

        /**
         * Validate PNG data
         */
        validatePNGData(pngDataURL) {
            if (!pngDataURL || typeof pngDataURL !== 'string') {
                return false;
            }

            // Check data URL format
            if (!pngDataURL.startsWith('data:image/png;base64,')) {
                return false;
            }

            // Basic base64 validation
            const base64Data = pngDataURL.split(',')[1];
            if (!base64Data || base64Data.length < 100) {
                return false;
            }

            return true;
        },

        /**
         * Calculate data URL file size
         */
        calculateDataURLSize(dataURL) {
            const base64Data = dataURL.split(',')[1];
            const padding = (base64Data.match(/=/g) || []).length;
            return Math.floor((base64Data.length * 3) / 4 - padding);
        },

        /**
         * Get WordPress nonce for security
         */
        getNonce() {
            // In real WordPress environment, this would be provided by wp_create_nonce()
            // For testing, return a mock nonce
            if (typeof window.yprint_png_nonce !== 'undefined') {
                return window.yprint_png_nonce;
            }
            return 'mock_nonce_' + Date.now();
        },

        /**
         * Update upload statistics
         */
        updateUploadStats(fileSize) {
            this.stats.uploadsToday++;
            this.stats.totalUploads++;
            this.stats.lastUpload = {
                timestamp: Date.now(),
                fileSize: fileSize
            };
        },

        /**
         * Fire upload events
         */
        fireUploadEvent(type, data) {
            if (window.YPrintPlugins && window.YPrintPlugins.eventBus) {
                window.YPrintPlugins.eventBus.dispatchEvent(new CustomEvent(`wc:upload:${type}`, {
                    detail: data
                }));
            }

            console.log(`🛒 WC EVENT: ${type}`, data);
        },

        /**
         * Utility: Add delay
         */
        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        /**
         * Get upload configuration
         */
        getConfig() {
            return { ...this.config };
        },

        /**
         * Update configuration
         */
        updateConfig(newConfig) {
            this.config = { ...this.config, ...newConfig };
            console.log('🛒 WC INTEGRATION: Configuration updated:', this.config);
        }
    };

    // Auto-initialize if WordPress environment is detected
    if (typeof window.ajaxurl !== 'undefined') {
        window.YPrintWCIntegration.initialize();
    } else {
        console.log('🛒 WC INTEGRATION: WordPress environment not detected, manual initialization required');
    }

    console.log('✅ WC PNG INTEGRATION: Module loaded successfully');

})();