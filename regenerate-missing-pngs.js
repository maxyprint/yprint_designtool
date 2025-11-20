/**
 * 🔄 REGENERATE MISSING PNGs FOR EXISTING DESIGNS
 *
 * This script loads existing design data and triggers real PNG generation
 * using the same canvas export system that works for new designs.
 */

window.regenerateMissingPNGs = {

    /**
     * Load design data from database by design ID
     */
    async loadDesignData(designId) {
        try {
            console.log(`🔄 [REGEN] Loading design data for ID: ${designId}`);

            const formData = new FormData();
            formData.append('action', 'octo_load_design');
            formData.append('design_id', designId);
            formData.append('nonce', this.findNonce());

            const response = await fetch(octoPrintDesigner.ajaxUrl, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.data?.message || 'Failed to load design');
            }

            const designData = JSON.parse(result.data.design_data);
            console.log(`✅ [REGEN] Design data loaded: ${designData.elements?.length || 0} elements`);

            return designData;

        } catch (error) {
            console.error(`❌ [REGEN] Failed to load design ${designId}:`, error);
            throw error;
        }
    },

    /**
     * Generate PNG from design data using the real canvas system
     */
    async generatePNGFromDesign(designData, designId) {
        try {
            console.log(`🖼️ [REGEN] Generating PNG for design ${designId}...`);

            // Check if PNG generator is available
            if (!window.saveOnlyPNGGenerator) {
                throw new Error('PNG Generator not initialized');
            }

            // Temporarily set the design data in the PNG generator
            const originalDesignData = window.saveOnlyPNGGenerator.getCurrentDesignData();

            // Create a mock canvas state with the loaded design data
            const mockCanvasState = {
                elements: designData.elements || [],
                template: designData.template || {},
                templateId: designData.templateId,
                metadata: designData.metadata || {}
            };

            // Set the design data in the PNG generator
            if (typeof window.saveOnlyPNGGenerator.setDesignData === 'function') {
                window.saveOnlyPNGGenerator.setDesignData(mockCanvasState);
            } else {
                console.warn('⚠️ [REGEN] setDesignData method not available, using canvas directly');
            }

            // Generate enhanced PNG with 300 DPI
            const enhancedResult = await window.saveOnlyPNGGenerator.generateEnhancedPNG(
                mockCanvasState,
                'regeneration_request'
            );

            // Restore original design data
            if (originalDesignData && typeof window.saveOnlyPNGGenerator.setDesignData === 'function') {
                window.saveOnlyPNGGenerator.setDesignData(originalDesignData);
            }

            if (!enhancedResult || !enhancedResult.dataUrl) {
                throw new Error('PNG generation returned empty result');
            }

            console.log(`✅ [REGEN] PNG generated for design ${designId}, size: ${enhancedResult.dataUrl.length} chars`);
            return enhancedResult.dataUrl;

        } catch (error) {
            console.error(`❌ [REGEN] PNG generation failed for design ${designId}:`, error);
            throw error;
        }
    },

    /**
     * Save PNG to database using the real save handler
     */
    async savePNGToDatabase(designId, pngDataUrl) {
        try {
            console.log(`💾 [REGEN] Saving PNG for design ${designId} to database...`);

            // Convert data URL to blob
            const response = await fetch(pngDataUrl);
            const blob = await response.blob();

            // Create form data for PNG save
            const pngFormData = new FormData();
            pngFormData.append('action', 'save_design_png');
            pngFormData.append('design_id', designId);
            pngFormData.append('png_file', blob, `design_${designId}_regenerated.png`);
            pngFormData.append('nonce', this.findNonce());

            const pngResponse = await fetch(octoPrintDesigner.ajaxUrl, {
                method: 'POST',
                body: pngFormData
            });

            const pngData = await pngResponse.json();

            if (pngData.success) {
                console.log(`✅ [REGEN] PNG saved successfully for design ${designId}`);
                console.log(`📁 PNG file location: ${pngData.data.file_url}`);
                console.log(`💾 PNG file path: ${pngData.data.file_path}`);
                return {
                    success: true,
                    file_url: pngData.data.file_url,
                    file_path: pngData.data.file_path
                };
            } else {
                throw new Error(pngData.data.message || 'Failed to save PNG');
            }

        } catch (error) {
            console.error(`❌ [REGEN] Failed to save PNG for design ${designId}:`, error);
            throw error;
        }
    },

    /**
     * Find security nonce from page
     */
    findNonce() {
        // Try different nonce sources
        let nonce = null;

        // Method 1: From designer form
        const nonceField = document.querySelector('#octo_print_provider_nonce');
        if (nonceField) {
            nonce = nonceField.value;
        }

        // Method 2: From page script variables
        if (!nonce && typeof window.octo_print_designer_data !== 'undefined') {
            nonce = window.octo_print_designer_data.nonce;
        }

        // Method 3: From any nonce field
        if (!nonce) {
            const anyNonceField = document.querySelector('[name*="nonce"]');
            if (anyNonceField) {
                nonce = anyNonceField.value;
            }
        }

        return nonce || 'fallback-nonce';
    },

    /**
     * Regenerate PNG for a single design ID
     */
    async regenerateDesignPNG(designId) {
        try {
            console.log(`🔄 [REGEN] Starting PNG regeneration for design ${designId}`);

            // 1. Load design data
            const designData = await this.loadDesignData(designId);

            // 2. Generate PNG from design data
            const pngDataUrl = await this.generatePNGFromDesign(designData, designId);

            // 3. Save PNG to database
            const saveResult = await this.savePNGToDatabase(designId, pngDataUrl);

            console.log(`✅ [REGEN] Complete! Design ${designId} PNG regenerated successfully`);
            return saveResult;

        } catch (error) {
            console.error(`❌ [REGEN] Failed to regenerate PNG for design ${designId}:`, error);
            throw error;
        }
    },

    /**
     * Regenerate PNGs for multiple designs (from order)
     */
    async regenerateOrderPNGs(orderId) {
        try {
            console.log(`🔄 [REGEN] Starting PNG regeneration for order ${orderId}`);

            // Get designs from order via refresh print data
            const formData = new FormData();
            formData.append('action', 'octo_refresh_print_data');
            formData.append('order_id', orderId);
            formData.append('nonce', this.findNonce());

            const response = await fetch(octoPrintDesigner.ajaxUrl, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!result.success || !result.data.designs) {
                throw new Error('Failed to load order designs');
            }

            const designs = result.data.designs;
            console.log(`📋 [REGEN] Found ${designs.length} designs in order ${orderId}`);

            const results = [];

            for (const design of designs) {
                if (!design.print_file_url || !design.print_file_path) {
                    console.log(`🔄 [REGEN] Design ${design.design_id} missing PNG, regenerating...`);
                    try {
                        const regenerateResult = await this.regenerateDesignPNG(design.design_id);
                        results.push({
                            design_id: design.design_id,
                            success: true,
                            ...regenerateResult
                        });
                    } catch (error) {
                        console.error(`❌ [REGEN] Failed to regenerate design ${design.design_id}:`, error);
                        results.push({
                            design_id: design.design_id,
                            success: false,
                            error: error.message
                        });
                    }
                } else {
                    console.log(`✅ [REGEN] Design ${design.design_id} already has PNG: ${design.print_file_url}`);
                    results.push({
                        design_id: design.design_id,
                        success: true,
                        skipped: true,
                        existing_url: design.print_file_url
                    });
                }
            }

            console.log(`✅ [REGEN] Order ${orderId} PNG regeneration complete!`);
            return results;

        } catch (error) {
            console.error(`❌ [REGEN] Failed to regenerate order PNGs:`, error);
            throw error;
        }
    }
};

// 🛠️ USAGE FUNCTIONS FOR CONSOLE

/**
 * Regenerate PNG for a specific design ID
 */
window.regenerateDesignPNG = function(designId) {
    return window.regenerateMissingPNGs.regenerateDesignPNG(designId);
};

/**
 * Regenerate all missing PNGs for an order
 */
window.regenerateOrderPNGs = function(orderId) {
    return window.regenerateMissingPNGs.regenerateOrderPNGs(orderId);
};

console.log('🔄 [REGENERATE PNGs] System loaded! Available functions:');
console.log('- regenerateDesignPNG(designId) - Regenerate PNG for specific design');
console.log('- regenerateOrderPNGs(orderId) - Regenerate missing PNGs for entire order');
console.log('- regenerateMissingPNGs.* - Access full API');