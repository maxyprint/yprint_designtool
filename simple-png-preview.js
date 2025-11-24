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
    constructor(containerId) {
        console.log('🎯 SIMPLE PNG PREVIEW: Constructor called', {
            containerId: containerId,
            timestamp: new Date().toISOString()
        });

        this.container = document.getElementById(containerId);
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
            containerHTML: this.container.outerHTML
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
        const baseUrl = window.location.origin;

        const urls = [
            // Primary: yprint-print-pngs directory (from PNG storage handler)
            `${baseUrl}/wp-content/uploads/yprint-print-pngs/${designId}.png`,

            // Secondary: octo-print-designer previews (from API docs)
            `${baseUrl}/wp-content/uploads/octo-print-designer/previews/${designId}/preview.png`,
            `${baseUrl}/wp-content/uploads/octo-print-designer/previews/${designId}/shirt-preview-front.png`,

            // Tertiary: design-pngs directory (from public class)
            `${baseUrl}/wp-content/uploads/design-pngs/${designId}.png`,

            // Quaternary: yprint-designs directory (from test files)
            `${baseUrl}/wp-content/uploads/yprint-designs/design-${designId}.png`,

            // Fallback: numbered variants
            `${baseUrl}/wp-content/uploads/octo-print-designer/previews/${designId}/preview-5338.png`
        ];

        console.log('🔗 SIMPLE PNG PREVIEW: Generated URL list', {
            totalUrls: urls.length,
            urls: urls
        });

        return urls;
    }

    /**
     * Try to load PNG from database via AJAX
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
            formData.append('action', 'yprint_get_existing_png');
            formData.append('identifier', designId);

            // Try to get nonce from various sources
            const nonce = window.octo_print_designer_config?.nonce ||
                         document.querySelector('input[name="_wpnonce"]')?.value ||
                         'fallback_nonce';

            formData.append('nonce', nonce);

            console.log('📡 SIMPLE PNG PREVIEW: Sending AJAX request', {
                action: 'yprint_get_existing_png',
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
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            console.log('📡 SIMPLE PNG PREVIEW: AJAX response data', {
                success: data.success,
                data: data.data,
                fullResponse: data
            });

            if (data.success && data.data?.url) {
                console.log('✅ SIMPLE PNG PREVIEW: PNG found via AJAX', {
                    pngUrl: data.data.url
                });
                return data.data.url;
            } else {
                console.log('ℹ️ SIMPLE PNG PREVIEW: No PNG found via AJAX', {
                    reason: data.data?.message || 'Unknown'
                });
                return null;
            }

        } catch (error) {
            console.error('❌ SIMPLE PNG PREVIEW: AJAX retrieval failed', {
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