/**
 * 🎯 AGENT 3: WooCommerce Order Preview Integration
 *
 * Connects WooCommerce order meta box with canvas rendering system
 * Listens for design-preview-ready events and renders previews
 *
 * Integration Points:
 * - Event: 'octo-design-preview-ready' (triggered by meta box)
 * - Data: window.orderDesignData[orderId]
 * - Renderer: DesignPreviewGenerator + AdminCanvasRenderer
 *
 * Success Criteria:
 * - ✅ Pure vanilla JS (no jQuery dependency for core logic)
 * - ✅ WooCommerce order page detection
 * - ✅ Event-driven architecture
 * - ✅ Comprehensive error handling
 * - ✅ Canvas initialization and rendering
 * - ✅ No conflicts with template editor
 */

class WooCommerceOrderPreview {
    constructor() {
        this.previewInstances = new Map();
        this.initialized = false;
        this.renderQueue = [];
        this.isProcessing = false;

        // Configuration
        this.config = {
            enableAutoRender: true,
            enableConsoleLogging: true,
            renderTimeout: 30000, // 30 second timeout
            retryAttempts: 2,
            enableErrorRecovery: true
        };

        console.log('🎯 WC ORDER PREVIEW: Class instantiated');
    }

    /**
     * Initialize WooCommerce order preview system
     * Auto-detects if we're on a WooCommerce order page
     */
    init() {
        if (this.initialized) {
            console.log('⚠️ WC ORDER PREVIEW: Already initialized');
            return false;
        }

        console.log('🎯 WC ORDER PREVIEW: Initializing...');

        // Check if we're on WooCommerce order page
        if (!this.isWooCommerceOrderPage()) {
            console.log('⚠️ WC ORDER PREVIEW: Not on WooCommerce order page, skipping initialization');
            return false;
        }

        // Setup event listeners
        this.setupEventListeners();

        // Setup DOM mutation observer (for dynamic content)
        this.setupMutationObserver();

        this.initialized = true;
        console.log('✅ WC ORDER PREVIEW: Initialization complete');

        return true;
    }

    /**
     * Check if current page is WooCommerce order edit page
     * @returns {boolean}
     */
    isWooCommerceOrderPage() {
        // Check for WooCommerce admin body classes
        const body = document.body;
        const isOrderEditPage = (
            body.classList.contains('post-type-shop_order') ||
            body.classList.contains('woocommerce_page_wc-orders') ||
            document.querySelector('#woocommerce-order-data') !== null ||
            document.querySelector('.wc-order-design-preview-wrapper') !== null
        );

        // Check URL patterns
        const url = window.location.href;
        const isOrderUrl = (
            url.includes('post_type=shop_order') ||
            url.includes('page=wc-orders') ||
            url.includes('post.php') && url.includes('action=edit')
        );

        // Check for WordPress pagenow global
        const pagenow = window.pagenow;
        const isOrderPagenow = (
            pagenow === 'shop_order' ||
            pagenow === 'woocommerce_page_wc-orders' ||
            pagenow === 'post'
        );

        const result = isOrderEditPage || isOrderUrl || isOrderPagenow;

        console.log('🔍 WC ORDER PREVIEW: Page detection -', {
            isOrderEditPage,
            isOrderUrl,
            isOrderPagenow,
            finalResult: result
        });

        return result;
    }

    /**
     * Setup event listeners for preview generation
     */
    setupEventListeners() {
        console.log('🎯 WC ORDER PREVIEW: Setting up event listeners...');

        // Listen for design-preview-ready event (triggered by meta box)
        document.addEventListener('octo-design-preview-ready', (event) => {
            console.log('🎨 WC ORDER PREVIEW: Received octo-design-preview-ready event', event.detail);
            this.handlePreviewReady(event);
        });

        // Also support jQuery events if jQuery is available
        if (window.jQuery) {
            jQuery(document).on('octo-design-preview-ready', (event, data) => {
                console.log('🎨 WC ORDER PREVIEW: Received jQuery octo-design-preview-ready event', data);
                this.handlePreviewReady({ detail: data });
            });
        }

        console.log('✅ WC ORDER PREVIEW: Event listeners registered');
    }

    /**
     * Setup mutation observer for dynamic content
     */
    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if added node contains design preview container
                            if (node.id && node.id.includes('design-preview-canvas-')) {
                                console.log('🎨 WC ORDER PREVIEW: Detected new canvas element', node.id);
                                // Process any queued renders for this canvas
                                this.processRenderQueue();
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('✅ WC ORDER PREVIEW: Mutation observer active');
    }

    /**
     * Handle preview-ready event
     * @param {CustomEvent} event - Event with order and canvas data
     */
    handlePreviewReady(event) {
        console.log('🎯 WC ORDER PREVIEW: Processing preview-ready event', event);

        try {
            const data = event.detail;

            if (!data || !data.orderId) {
                throw new Error('Invalid event data: missing orderId');
            }

            const { orderId, canvasId, designData } = data;

            console.log('🎨 WC ORDER PREVIEW: Event data -', {
                orderId,
                canvasId,
                hasDesignData: !!designData
            });

            // Validate required data
            if (!canvasId) {
                throw new Error('Missing canvas ID in event data');
            }

            if (!designData) {
                throw new Error('Missing design data in event data');
            }

            // Add to render queue
            this.renderQueue.push({
                orderId,
                canvasId,
                designData,
                timestamp: Date.now(),
                attempts: 0
            });

            console.log('📋 WC ORDER PREVIEW: Added to render queue, queue size:', this.renderQueue.length);

            // Process queue
            this.processRenderQueue();

        } catch (error) {
            console.error('❌ WC ORDER PREVIEW: Error handling preview-ready event:', error);
            this.showError('Event Processing Error: ' + error.message);
        }
    }

    /**
     * Process render queue
     */
    async processRenderQueue() {
        if (this.isProcessing || this.renderQueue.length === 0) {
            return;
        }

        this.isProcessing = true;

        while (this.renderQueue.length > 0) {
            const renderTask = this.renderQueue.shift();

            console.log('🎨 WC ORDER PREVIEW: Processing render task', renderTask);

            try {
                await this.renderDesignPreview(
                    renderTask.orderId,
                    renderTask.canvasId,
                    renderTask.designData
                );
            } catch (error) {
                console.error('❌ WC ORDER PREVIEW: Render task failed', error);

                // Retry logic
                if (this.config.enableErrorRecovery && renderTask.attempts < this.config.retryAttempts) {
                    renderTask.attempts++;
                    this.renderQueue.push(renderTask);
                    console.log('🔄 WC ORDER PREVIEW: Retrying render task, attempt', renderTask.attempts);
                }
            }
        }

        this.isProcessing = false;
    }

    /**
     * Render design preview to canvas
     * @param {number} orderId - WooCommerce order ID
     * @param {string} canvasId - Canvas element ID
     * @param {Object} designData - Design data from order
     */
    async renderDesignPreview(orderId, canvasId, designData) {
        console.log('🎯 WC ORDER PREVIEW: Starting render for order', orderId);

        try {
            // Check if DesignPreviewGenerator is available
            if (typeof window.DesignPreviewGenerator === 'undefined') {
                throw new Error('DesignPreviewGenerator not available - ensure admin-preview-integration.js is loaded');
            }

            // Wait for canvas element to be available
            const canvasElement = await this.waitForCanvasElement(canvasId);
            if (!canvasElement) {
                throw new Error(`Canvas element not found: ${canvasId}`);
            }

            console.log('✅ WC ORDER PREVIEW: Canvas element found', canvasElement);

            // Get or create preview generator instance
            let previewInstance = this.previewInstances.get(orderId);

            if (!previewInstance) {
                console.log('🎨 WC ORDER PREVIEW: Creating new DesignPreviewGenerator instance');

                // Create container ID from canvas ID
                const containerId = canvasElement.parentElement.id || `container-${orderId}`;

                // Ensure container has ID
                if (!canvasElement.parentElement.id) {
                    canvasElement.parentElement.id = containerId;
                }

                // Initialize preview generator
                const generator = new window.DesignPreviewGenerator();
                const initialized = generator.init(containerId);

                if (!initialized) {
                    throw new Error('Failed to initialize DesignPreviewGenerator');
                }

                previewInstance = {
                    generator,
                    containerId,
                    canvasId,
                    orderId
                };

                this.previewInstances.set(orderId, previewInstance);
                console.log('✅ WC ORDER PREVIEW: Preview generator initialized', previewInstance);
            }

            // Generate preview
            console.log('🎨 WC ORDER PREVIEW: Generating preview...');

            await previewInstance.generator.generatePreview(designData, {
                loadingText: 'Rendering order design...',
                enableValidation: true,
                coordinateValidation: true
            });

            console.log('✅ WC ORDER PREVIEW: Preview generated successfully for order', orderId);

            // Trigger success event
            this.triggerEvent('wc-order-preview-success', {
                orderId,
                canvasId,
                timestamp: Date.now()
            });

        } catch (error) {
            console.error('❌ WC ORDER PREVIEW: Render error', error);

            // Show error on canvas
            this.showCanvasError(canvasId, error.message);

            // Trigger error event
            this.triggerEvent('wc-order-preview-error', {
                orderId,
                canvasId,
                error: error.message,
                timestamp: Date.now()
            });

            throw error;
        }
    }

    /**
     * Wait for canvas element to be available in DOM
     * @param {string} canvasId - Canvas element ID
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<HTMLCanvasElement>}
     */
    waitForCanvasElement(canvasId, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            const checkElement = () => {
                const element = document.getElementById(canvasId);

                if (element) {
                    console.log('✅ WC ORDER PREVIEW: Canvas element ready', canvasId);
                    resolve(element);
                    return;
                }

                if (Date.now() - startTime > timeout) {
                    reject(new Error(`Canvas element not found after ${timeout}ms: ${canvasId}`));
                    return;
                }

                // Check again in 100ms
                setTimeout(checkElement, 100);
            };

            checkElement();
        });
    }

    /**
     * Show error message on canvas
     * @param {string} canvasId - Canvas element ID
     * @param {string} message - Error message
     */
    showCanvasError(canvasId, message) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw error background
        ctx.fillStyle = '#fff5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw error border
        ctx.strokeStyle = '#fecaca';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

        // Draw error message
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 14px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('WooCommerce Order Preview Error', canvas.width / 2, canvas.height / 2 - 30);

        ctx.font = '12px Arial, sans-serif';
        ctx.fillStyle = '#666';
        const shortMessage = message.length > 60 ? message.substring(0, 60) + '...' : message;
        ctx.fillText(shortMessage, canvas.width / 2, canvas.height / 2);

        ctx.font = '10px Arial, sans-serif';
        ctx.fillStyle = '#0066cc';
        ctx.fillText('Check browser console for details', canvas.width / 2, canvas.height / 2 + 30);
    }

    /**
     * Show error message (non-canvas fallback)
     * @param {string} message - Error message
     */
    showError(message) {
        console.error('❌ WC ORDER PREVIEW ERROR:', message);

        // Try to show error in UI if possible
        const containers = document.querySelectorAll('.design-preview-error');
        containers.forEach(container => {
            const errorMsg = container.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.textContent = message;
                container.style.display = 'block';
            }
        });
    }

    /**
     * Trigger custom event
     * @param {string} eventName - Event name
     * @param {Object} data - Event data
     */
    triggerEvent(eventName, data) {
        const event = new CustomEvent(eventName, {
            detail: data,
            bubbles: true
        });
        document.dispatchEvent(event);

        console.log('📢 WC ORDER PREVIEW: Triggered event', eventName, data);
    }

    /**
     * Get preview instance for order
     * @param {number} orderId - Order ID
     * @returns {Object|null}
     */
    getPreviewInstance(orderId) {
        return this.previewInstances.get(orderId) || null;
    }

    /**
     * Clear preview for order
     * @param {number} orderId - Order ID
     */
    clearPreview(orderId) {
        const instance = this.previewInstances.get(orderId);
        if (instance && instance.generator) {
            instance.generator.clearPreview();
            console.log('🧹 WC ORDER PREVIEW: Cleared preview for order', orderId);
        }
    }

    /**
     * Get integration status
     * @returns {Object}
     */
    getStatus() {
        return {
            initialized: this.initialized,
            isWooCommerceOrderPage: this.isWooCommerceOrderPage(),
            previewInstanceCount: this.previewInstances.size,
            renderQueueSize: this.renderQueue.length,
            isProcessing: this.isProcessing,
            config: this.config
        };
    }

    /**
     * Cleanup and destroy
     */
    destroy() {
        console.log('🧹 WC ORDER PREVIEW: Cleaning up...');

        this.previewInstances.forEach((instance, orderId) => {
            this.clearPreview(orderId);
        });

        this.previewInstances.clear();
        this.renderQueue = [];
        this.initialized = false;

        console.log('✅ WC ORDER PREVIEW: Cleanup complete');
    }
}

// Auto-initialize on DOM ready (only on WooCommerce order pages)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeWooCommerceOrderPreview();
    });
} else {
    initializeWooCommerceOrderPreview();
}

/**
 * Initialize WooCommerce order preview system
 */
function initializeWooCommerceOrderPreview() {
    // Don't auto-initialize if disabled
    if (window.DISABLE_WC_ORDER_PREVIEW) {
        console.log('⚠️ WC ORDER PREVIEW: Auto-initialization disabled');
        return;
    }

    console.log('🚀 WC ORDER PREVIEW: Auto-initializing...');

    window.wooCommerceOrderPreview = new WooCommerceOrderPreview();
    window.wooCommerceOrderPreview.init();
}

// Global exposure for manual control
window.WooCommerceOrderPreview = WooCommerceOrderPreview;

console.log('✅ WC ORDER PREVIEW: Script loaded and ready');
