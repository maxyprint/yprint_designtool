/**
 * 🎯 ULTRA-SIMPLE PNG PREVIEW SYSTEM
 * Direct URL-based PNG display with comprehensive debugging
 *
 * Features:
 * - URL pattern-based PNG loading
 * - Fallback chain with multiple sources
 * - Extensive console logging for debugging
 * - No dependencies on Fabric.js or Canvas
 */

class SimplePNGPreview {
    constructor(containerId, orderId = null) {
        console.log('🎯 SIMPLE PNG PREVIEW: Constructor called', {
            containerId: containerId,
            orderId: orderId,
            timestamp: new Date().toISOString()
        });

        this.container = document.getElementById(containerId);
        this.orderId = orderId; // Store order ID for intelligent design data lookup
        this.debug = true; // Enable detailed logging

        if (!this.container) {
            console.error('❌ SIMPLE PNG PREVIEW: Container not found!', {
                containerId: containerId,
                availableElements: document.querySelectorAll('[id*="preview"]')
            });
            return;
        }

        console.log('✅ SIMPLE PNG PREVIEW: Container found', {
            container: this.container,
            containerHTML: this.container.outerHTML,
            orderId: this.orderId
        });

        this.init();
    }

    init() {
        console.log('🔧 SIMPLE PNG PREVIEW: Initializing...');

        // Set up container styles for preview display
        this.container.style.position = 'relative';
        this.container.style.minHeight = '200px';
        this.container.style.border = '1px solid #ddd';
        this.container.style.borderRadius = '4px';
        this.container.style.padding = '10px';

        console.log('✅ SIMPLE PNG PREVIEW: Initialization complete');
    }

    /**
     * Generate possible PNG URLs for a design
     */
    generatePNGUrls(designData) {
        console.log('🔗 SIMPLE PNG PREVIEW: Generating PNG URLs', {
            designData: designData,
            designId: designData?.design_id || 'unknown'
        });

        const designId = designData?.design_id || designData?.id || 'test';
        const orderId = designData?.order_id || designId;
        const baseUrl = window.location.origin;

        // Generate timestamp-based variants for recent designs
        const now = Date.now();
        const timestampVariants = [];

        // Try timestamps from the last 24 hours (common PNG generation window)
        for (let hours = 0; hours < 24; hours++) {
            const timestamp = Math.floor((now - (hours * 60 * 60 * 1000)) / 1000);
            timestampVariants.push(timestamp);
        }

        const urls = [
            // Primary: yprint-print-pngs directory (from PNG storage handler)
            `${baseUrl}/wp-content/uploads/yprint-print-pngs/${designId}.png`,

            // NEW: design-pngs directory with design_id_timestamp pattern (actual storage pattern)
            `${baseUrl}/wp-content/uploads/design-pngs/design_${designId}_${Math.floor(now/1000)}.png`,
            `${baseUrl}/wp-content/uploads/design-pngs/design_${orderId}_${Math.floor(now/1000)}.png`,

            // Secondary: octo-print-designer previews (from API docs)
            `${baseUrl}/wp-content/uploads/octo-print-designer/previews/${designId}/preview.png`,
            `${baseUrl}/wp-content/uploads/octo-print-designer/previews/${designId}/shirt-preview-front.png`,

            // Tertiary: design-pngs directory (from public class)
            `${baseUrl}/wp-content/uploads/design-pngs/${designId}.png`,
            `${baseUrl}/wp-content/uploads/design-pngs/${orderId}.png`,

            // Quaternary: yprint-designs directory (from test files)
            `${baseUrl}/wp-content/uploads/yprint-designs/design-${designId}.png`,

            // Fallback: numbered variants
            `${baseUrl}/wp-content/uploads/octo-print-designer/previews/${designId}/preview-5338.png`
        ];

        // Add recent timestamp variants for design_pngs (last 3 hours)
        for (let i = 0; i < 3; i++) {
            const recentTimestamp = Math.floor((now - (i * 60 * 60 * 1000)) / 1000);
            urls.push(`${baseUrl}/wp-content/uploads/design-pngs/design_${designId}_${recentTimestamp}.png`);
            urls.push(`${baseUrl}/wp-content/uploads/design-pngs/design_${orderId}_${recentTimestamp}.png`);
        }

        console.log('🔗 SIMPLE PNG PREVIEW: Generated URL list', {
            totalUrls: urls.length,
            urls: urls,
            designId: designId,
            orderId: orderId,
            timestampNow: Math.floor(now/1000)
        });

        return urls;
    }

    /**
     * Try to load PNG from database via AJAX with filesystem discovery
     */
    async tryAJAXRetrieval(designId) {
        console.log('📡 SIMPLE PNG PREVIEW: Attempting AJAX retrieval', {
            designId: designId,
            ajaxUrl: window.ajaxurl || 'undefined'
        });

        if (!window.ajaxurl) {
            console.warn('⚠️ SIMPLE PNG PREVIEW: No AJAX URL available, skipping database retrieval');
            return null;
        }

        try {
            const formData = new FormData();
            formData.append('action', 'yprint_discover_png_files');
            formData.append('identifier', designId);

            // Pass order_id if available for intelligent design data lookup
            if (this.orderId) {
                formData.append('order_id', this.orderId);
                console.log('📡 SIMPLE PNG PREVIEW: Including order_id for intelligent search: ' + this.orderId);
            }

            // Try to get nonce from various sources (prioritize existing ones)
            const nonce = window.octo_print_designer_config?.nonce ||
                         document.querySelector('input[name="_wpnonce"]')?.value ||
                         document.querySelector('#_wpnonce')?.value ||
                         window.ajaxurl?.split('admin-ajax.php')[0] + 'admin.php?_wpnonce=' ||
                         'admin_fallback';

            formData.append('nonce', nonce);

            console.log('📡 SIMPLE PNG PREVIEW: Sending PNG discovery request', {
                action: 'yprint_discover_png_files',
                identifier: designId,
                nonce: nonce,
                formData: Array.from(formData.entries())
            });

            const response = await fetch(window.ajaxurl, {
                method: 'POST',
                body: formData
            });

            console.log('📡 SIMPLE PNG PREVIEW: AJAX response received', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (!response.ok) {
                // Fallback to original method
                return this.tryOriginalAJAXRetrieval(designId);
            }

            const data = await response.json();

            console.log('📡 SIMPLE PNG PREVIEW: PNG discovery response', {
                success: data.success,
                data: data.data,
                fullResponse: data
            });

            if (data.success && data.data?.files && data.data.files.length > 0) {
                const latestFile = data.data.files[0]; // Most recent file
                console.log('✅ SIMPLE PNG PREVIEW: PNG discovered via filesystem', {
                    file: latestFile,
                    totalFiles: data.data.files.length
                });
                return latestFile.url;
            } else {
                console.log('ℹ️ SIMPLE PNG PREVIEW: No PNG files discovered', {
                    reason: data.data?.message || 'No files found'
                });
                // Fallback to original method
                return this.tryOriginalAJAXRetrieval(designId);
            }

        } catch (error) {
            console.error('❌ SIMPLE PNG PREVIEW: PNG discovery failed', {
                error: error.message,
                stack: error.stack
            });
            // Fallback to original method
            return this.tryOriginalAJAXRetrieval(designId);
        }
    }

    /**
     * Fallback to original AJAX retrieval method
     */
    async tryOriginalAJAXRetrieval(designId) {
        try {
            const formData = new FormData();
            formData.append('action', 'yprint_get_existing_png');
            formData.append('identifier', designId);

            const nonce = window.octo_print_designer_config?.nonce ||
                         document.querySelector('input[name="_wpnonce"]')?.value ||
                         'fallback_nonce';

            formData.append('nonce', nonce);

            console.log('📡 SIMPLE PNG PREVIEW: Trying original AJAX method', {
                action: 'yprint_get_existing_png',
                identifier: designId
            });

            const response = await fetch(window.ajaxurl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success && data.data?.url) {
                console.log('✅ SIMPLE PNG PREVIEW: PNG found via original AJAX', {
                    pngUrl: data.data.url
                });
                return data.data.url;
            } else {
                console.log('ℹ️ SIMPLE PNG PREVIEW: No PNG found via original AJAX', {
                    reason: data.data?.message || 'Unknown'
                });
                return null;
            }

        } catch (error) {
            console.error('❌ SIMPLE PNG PREVIEW: Original AJAX failed', {
                error: error.message,
                stack: error.stack
            });
            return null;
        }
    }

    /**
     * Try to load PNG from direct URLs with fallback chain
     */
    async tryDirectURLs(urls) {
        console.log('🌐 SIMPLE PNG PREVIEW: Starting direct URL testing', {
            totalUrls: urls.length
        });

        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];

            console.log(`🌐 SIMPLE PNG PREVIEW: Testing URL ${i + 1}/${urls.length}`, {
                url: url
            });

            try {
                const success = await this.testImageURL(url);

                if (success) {
                    console.log('✅ SIMPLE PNG PREVIEW: PNG found via direct URL', {
                        url: url,
                        index: i + 1
                    });
                    return url;
                }

            } catch (error) {
                console.warn(`⚠️ SIMPLE PNG PREVIEW: URL ${i + 1} failed`, {
                    url: url,
                    error: error.message
                });
            }
        }

        console.log('❌ SIMPLE PNG PREVIEW: All direct URLs failed');
        return null;
    }

    /**
     * Test if an image URL is accessible
     */
    testImageURL(url) {
        return new Promise((resolve) => {
            const img = new Image();

            img.onload = () => {
                console.log('✅ URL TEST: Image loaded successfully', {
                    url: url,
                    width: img.naturalWidth,
                    height: img.naturalHeight
                });
                resolve(true);
            };

            img.onerror = (error) => {
                console.warn('❌ URL TEST: Image load failed', {
                    url: url,
                    error: error
                });
                resolve(false);
            };

            img.src = url;
        });
    }

    /**
     * Display PNG preview with loading states
     */
    displayPNG(url) {
        console.log('🖼️ SIMPLE PNG PREVIEW: Displaying PNG', {
            url: url
        });

        // Clear container
        this.container.innerHTML = '';

        // Create image element
        const img = document.createElement('img');
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';
        img.style.margin = '0 auto';

        // Add loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.innerHTML = '🔄 Loading PNG preview...';
        loadingDiv.style.textAlign = 'center';
        loadingDiv.style.color = '#666';
        loadingDiv.style.padding = '20px';

        this.container.appendChild(loadingDiv);

        img.onload = () => {
            console.log('✅ SIMPLE PNG PREVIEW: PNG displayed successfully', {
                url: url,
                dimensions: `${img.naturalWidth}x${img.naturalHeight}`
            });

            // Remove loading indicator
            this.container.removeChild(loadingDiv);

            // Add image
            this.container.appendChild(img);

            // Add info text
            const infoDiv = document.createElement('div');
            infoDiv.innerHTML = `<small style="color: #666;">PNG Preview (${img.naturalWidth}x${img.naturalHeight})</small>`;
            infoDiv.style.textAlign = 'center';
            infoDiv.style.marginTop = '5px';
            this.container.appendChild(infoDiv);
        };

        img.onerror = () => {
            console.error('❌ SIMPLE PNG PREVIEW: Failed to display PNG', {
                url: url
            });

            loadingDiv.innerHTML = '❌ PNG preview failed to load';
            loadingDiv.style.color = '#dc3545';
        };

        img.src = url;
    }

    /**
     * Show error message with debug info
     */
    showError(message, debugInfo = {}) {
        console.error('❌ SIMPLE PNG PREVIEW: Error occurred', {
            message: message,
            debugInfo: debugInfo
        });

        this.container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #dc3545;">
                <div style="font-size: 16px; margin-bottom: 10px;">❌ ${message}</div>
                <details style="margin-top: 10px;">
                    <summary style="cursor: pointer; font-size: 12px;">Debug Information</summary>
                    <pre style="background: #f8f9fa; padding: 10px; margin-top: 5px; text-align: left; font-size: 10px; overflow-x: auto;">
${JSON.stringify(debugInfo, null, 2)}
                    </pre>
                </details>
            </div>
        `;
    }

    /**
     * Main method: Show PNG preview for design data
     */
    async showPreview(designData) {
        console.log('🎯 SIMPLE PNG PREVIEW: Starting preview process', {
            designData: designData,
            timestamp: new Date().toISOString()
        });

        try {
            const designId = designData?.design_id || designData?.id;

            if (!designId) {
                throw new Error('No design ID found in design data');
            }

            // Show loading state
            this.container.innerHTML = '<div style="text-align: center; padding: 20px;">🔄 Searching for PNG...</div>';

            // Step 1: Try AJAX database retrieval
            console.log('🔄 SIMPLE PNG PREVIEW: Step 1 - AJAX database retrieval');
            const ajaxUrl = await this.tryAJAXRetrieval(designId);

            if (ajaxUrl) {
                this.displayPNG(ajaxUrl);
                return;
            }

            // Step 2: Try direct URL patterns
            console.log('🔄 SIMPLE PNG PREVIEW: Step 2 - Direct URL pattern testing');
            const urls = this.generatePNGUrls(designData);
            const directUrl = await this.tryDirectURLs(urls);

            if (directUrl) {
                this.displayPNG(directUrl);
                return;
            }

            // Step 3: Show not found message
            console.log('🔄 SIMPLE PNG PREVIEW: Step 3 - No PNG found, showing not found message');
            this.showError('PNG preview not available', {
                designId: designId,
                testedUrls: urls,
                designData: designData
            });

        } catch (error) {
            console.error('❌ SIMPLE PNG PREVIEW: Fatal error in showPreview', {
                error: error.message,
                stack: error.stack,
                designData: designData
            });

            this.showError('PNG preview system error', {
                error: error.message,
                designData: designData
            });
        }
    }
}

// Global exposure for easy testing
window.SimplePNGPreview = SimplePNGPreview;

// Auto-initialization for elements with data-png-preview attribute
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 SIMPLE PNG PREVIEW: DOM ready, looking for auto-init elements');

    const elements = document.querySelectorAll('[data-png-preview]');
    console.log('🎯 SIMPLE PNG PREVIEW: Found elements for auto-init', {
        count: elements.length,
        elements: Array.from(elements).map(el => ({
            id: el.id,
            dataset: el.dataset
        }))
    });

    elements.forEach(element => {
        const designData = JSON.parse(element.dataset.pngPreview || '{}');
        const preview = new SimplePNGPreview(element.id);
        preview.showPreview(designData);
    });
});

console.log('✅ SIMPLE PNG PREVIEW: Script loaded and ready');