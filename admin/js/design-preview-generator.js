/**
 * 🔄 Design Preview Generator - Data Processing Engine
 *
 * Processes extracted design data and generates preview renders
 * Handles data validation, transformation, and rendering coordination
 *
 * Compatible with WooCommerce admin context (no jQuery dependency)
 */

class DesignPreviewGenerator {
    constructor() {
        this.renderer = null;
        this.currentData = null;
        this.previewCallbacks = new Map();
        this.errorHandlers = new Map();
    }

    /**
     * Initialize the preview generator
     * @param {string} containerId - Container element ID
     * @param {Object} options - Configuration options
     */
    init(containerId, options = {}) {
        console.log('🔄 PREVIEW GENERATOR: Initializing...');

        // Initialize renderer
        this.renderer = new window.AdminCanvasRenderer();
        const success = this.renderer.init(containerId, options);

        if (!success) {
            console.error('❌ PREVIEW GENERATOR: Failed to initialize renderer');
            return false;
        }

        console.log('✅ PREVIEW GENERATOR: Initialized successfully');
        return true;
    }

    /**
     * Validate design data structure
     * @param {Object} designData - Design data to validate
     * @returns {Object} Validation result
     */
    validateDesignData(designData) {
        const result = {
            isValid: false,
            errors: [],
            warnings: [],
            imageCount: 0
        };

        try {
            if (!designData || typeof designData !== 'object') {
                result.errors.push('Design data is not a valid object');
                return result;
            }

            const viewKeys = Object.keys(designData);
            if (viewKeys.length === 0) {
                result.errors.push('No design views found');
                return result;
            }

            // Validate first view (main design)
            const firstView = designData[viewKeys[0]];
            if (!firstView) {
                result.errors.push('First design view is empty');
                return result;
            }

            // Check for required properties
            if (!firstView.view_name) {
                result.warnings.push('View name is missing');
            }

            if (!firstView.system_id) {
                result.warnings.push('System ID is missing');
            }

            // Validate images array
            if (!firstView.images || !Array.isArray(firstView.images)) {
                result.errors.push('Images array is missing or invalid');
                return result;
            }

            result.imageCount = firstView.images.length;

            // Validate each image
            firstView.images.forEach((img, index) => {
                if (!img.id) {
                    result.warnings.push(`Image ${index}: Missing ID`);
                }

                if (!img.url) {
                    result.errors.push(`Image ${index}: Missing URL`);
                    return;
                }

                // Validate URL format
                try {
                    new URL(img.url);
                } catch (e) {
                    result.errors.push(`Image ${index}: Invalid URL format`);
                }

                // Check transform data
                if (img.transform) {
                    const transform = img.transform;
                    const requiredProps = ['left', 'top', 'scaleX', 'scaleY'];

                    requiredProps.forEach(prop => {
                        if (typeof transform[prop] !== 'number') {
                            result.warnings.push(`Image ${index}: Transform ${prop} is not a number`);
                        }
                    });
                } else {
                    result.warnings.push(`Image ${index}: No transform data`);
                }
            });

            // Set valid if no errors
            result.isValid = result.errors.length === 0;

            console.log('📊 DATA VALIDATION:', result);
            return result;

        } catch (error) {
            result.errors.push(`Validation error: ${error.message}`);
            console.error('❌ VALIDATION ERROR:', error);
            return result;
        }
    }

    /**
     * 🎯 ENHANCED PREVIEW GENERATOR
     * Generate preview from design data with transform validation and performance tracking
     * @param {Object} designData - Design data object
     * @param {Object} options - Rendering options
     */
    async generatePreview(designData, options = {}) {
        console.log('🔄 PREVIEW GENERATOR: Generating preview...', designData);

        const startTime = performance.now();

        try {
            // Store current data
            this.currentData = designData;

            // Validate data
            const validation = this.validateDesignData(designData);
            if (!validation.isValid) {
                throw new Error(`Invalid design data: ${validation.errors.join(', ')}`);
            }

            // Show warnings if any
            if (validation.warnings.length > 0) {
                console.warn('⚠️ PREVIEW WARNINGS:', validation.warnings);
            }

            // 🎯 TRANSFORM ACCURACY TEST: Test with known coordinates before rendering
            if (options.testAccuracy !== false) {
                const accuracyTest = this.renderer.testTransformAccuracy();
                if (accuracyTest.failed > 0) {
                    console.warn('⚠️ TRANSFORM ACCURACY: Some tests failed', accuracyTest);
                }
            }

            // Generate preview with loading state
            await this.renderer.renderWithLoading(
                designData,
                options.loadingText || `Rendering ${validation.imageCount} elements...`
            );

            const totalTime = performance.now() - startTime;

            // 🎯 GET PERFORMANCE REPORT
            const performanceReport = this.renderer.getPerformanceReport();

            // Trigger success callbacks
            this.triggerCallbacks('success', {
                designData,
                validation,
                renderer: this.renderer,
                performance: {
                    totalTime: `${totalTime.toFixed(2)}ms`,
                    ...performanceReport
                }
            });

            console.log('✅ PREVIEW GENERATOR: Preview generated successfully', {
                totalTime: `${totalTime.toFixed(2)}ms`,
                images: validation.imageCount,
                performance: performanceReport
            });

        } catch (error) {
            console.error('❌ PREVIEW GENERATION ERROR:', error);

            // Trigger error callbacks
            this.triggerCallbacks('error', {
                error,
                designData
            });

            // Show error on canvas
            this.showError(error.message);
        }
    }

    /**
     * Show error message on canvas
     * @param {string} message - Error message
     */
    showError(message) {
        if (!this.renderer) return;

        this.renderer.clearCanvas();

        const ctx = this.renderer.ctx;
        const canvas = this.renderer.canvas;
        const pixelRatio = this.renderer.pixelRatio;

        ctx.save();

        // Error background
        ctx.fillStyle = '#fff5f5';
        ctx.fillRect(0, 0, canvas.width / pixelRatio, canvas.height / pixelRatio);

        // Error border
        ctx.strokeStyle = '#fecaca';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, (canvas.width / pixelRatio) - 20, (canvas.height / pixelRatio) - 20);

        // Error text
        ctx.fillStyle = '#dc2626';
        ctx.font = '14px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
            'Preview Error',
            canvas.width / (2 * pixelRatio),
            canvas.height / (2 * pixelRatio) - 10
        );

        ctx.font = '12px Arial, sans-serif';
        ctx.fillStyle = '#666666';
        ctx.fillText(
            message.substring(0, 50) + (message.length > 50 ? '...' : ''),
            canvas.width / (2 * pixelRatio),
            canvas.height / (2 * pixelRatio) + 15
        );

        ctx.restore();
    }

    /**
     * Process design data from various sources
     * @param {string|Object} dataSource - JSON string, object, or meta field selector
     * @returns {Object} Processed design data
     */
    processDataSource(dataSource) {
        console.log('🔄 PROCESSING DATA SOURCE:', typeof dataSource, dataSource);

        try {
            // If it's already an object, return as-is
            if (typeof dataSource === 'object' && dataSource !== null) {
                return dataSource;
            }

            // If it's a JSON string, parse it
            if (typeof dataSource === 'string') {
                // Check if it looks like a CSS selector (starts with # or .)
                if (dataSource.startsWith('#') || dataSource.startsWith('.')) {
                    const element = document.querySelector(dataSource);
                    if (element) {
                        const value = element.value || element.textContent || element.innerHTML;
                        return JSON.parse(value);
                    } else {
                        throw new Error(`Element not found: ${dataSource}`);
                    }
                }

                // Try to parse as JSON directly
                return JSON.parse(dataSource);
            }

            throw new Error('Invalid data source type');

        } catch (error) {
            console.error('❌ DATA PROCESSING ERROR:', error);
            throw new Error(`Failed to process data source: ${error.message}`);
        }
    }

    /**
     * Register callback for preview events
     * @param {string} event - Event name ('success', 'error', 'loading')
     * @param {Function} callback - Callback function
     */
    onPreview(event, callback) {
        if (!this.previewCallbacks.has(event)) {
            this.previewCallbacks.set(event, []);
        }
        this.previewCallbacks.get(event).push(callback);
    }

    /**
     * Trigger callbacks for an event
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    triggerCallbacks(event, data) {
        const callbacks = this.previewCallbacks.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ CALLBACK ERROR (${event}):`, error);
                }
            });
        }
    }

    /**
     * Create preview from meta field data
     * @param {string} metaFieldSelector - CSS selector for meta field
     * @param {Object} options - Options
     */
    async createPreviewFromMeta(metaFieldSelector, options = {}) {
        try {
            console.log('🔄 CREATING PREVIEW FROM META:', metaFieldSelector);

            const element = document.querySelector(metaFieldSelector);
            if (!element) {
                throw new Error(`Meta field element not found: ${metaFieldSelector}`);
            }

            const jsonData = element.value || element.textContent;
            if (!jsonData.trim()) {
                throw new Error('Meta field is empty');
            }

            const designData = JSON.parse(jsonData);
            await this.generatePreview(designData, options);

        } catch (error) {
            console.error('❌ META PREVIEW ERROR:', error);
            this.showError(`Meta Field Error: ${error.message}`);
        }
    }

    /**
     * Export current preview as image
     * @param {string} format - Image format
     * @returns {string} Data URL
     */
    exportPreview(format = 'image/png') {
        if (!this.renderer) {
            throw new Error('Renderer not initialized');
        }
        return this.renderer.exportAsDataURL(format);
    }

    /**
     * Get current preview dimensions
     * @returns {Object} Dimensions info
     */
    getPreviewInfo() {
        if (!this.renderer) return null;

        return {
            dimensions: this.renderer.getDimensions(),
            hasData: !!this.currentData,
            validation: this.currentData ? this.validateDesignData(this.currentData) : null
        };
    }

    /**
     * Clear current preview
     */
    clearPreview() {
        if (this.renderer) {
            this.renderer.clearCanvas();
        }
        this.currentData = null;
        console.log('🔄 PREVIEW CLEARED');
    }

    /**
     * 🎯 TRANSFORM ENGINE INTEGRATION
     */

    /**
     * Test transform accuracy with specific coordinates
     * @param {Array} testCases - Optional test cases
     * @returns {Object} Test results
     */
    testTransformAccuracy(testCases = []) {
        if (!this.renderer) {
            console.error('❌ ACCURACY TEST: Renderer not initialized');
            return { error: 'Renderer not initialized' };
        }

        return this.renderer.testTransformAccuracy(testCases);
    }

    /**
     * Get detailed performance metrics
     * @returns {Object} Performance report
     */
    getPerformanceMetrics() {
        if (!this.renderer) {
            return { error: 'Renderer not initialized' };
        }

        return this.renderer.getPerformanceReport();
    }

    /**
     * Handle viewport resize
     * @param {string} containerId - Container element ID
     */
    handleResize(containerId) {
        if (this.renderer) {
            this.renderer.handleViewportResize(containerId);

            // Re-render current design if available
            if (this.currentData) {
                this.generatePreview(this.currentData, { loadingText: 'Adapting to viewport...' });
            }
        }
    }

    /**
     * Create precision test preview with known coordinates
     * @param {Object} options - Test options
     */
    async createPrecisionTestPreview(options = {}) {
        const testData = {
            "precision_test": {
                "view_name": "Precision Test View",
                "system_id": "test_precision",
                "variation_id": "test_var",
                "images": [
                    {
                        "id": "precision_test_1",
                        "url": "https://yprint.de/wp-content/uploads/octo-print-designer/user-images/17/11092025ylifelogowhite-1.png",
                        "transform": {"left": 326, "top": 150, "scaleX": 0.113, "scaleY": 0.113, "angle": 0}
                    },
                    {
                        "id": "precision_test_2",
                        "url": "https://yprint.de/wp-content/uploads/octo-print-designer/user-images/17/yprint-logo.png",
                        "transform": {"left": 406.39, "top": 116.49, "scaleX": 0.050, "scaleY": 0.050, "angle": 0}
                    }
                ]
            }
        };

        console.log('🎯 PRECISION TEST: Rendering with exact Order 5373 coordinates...');

        await this.generatePreview(testData, {
            loadingText: 'Running precision test...',
            testAccuracy: true,
            ...options
        });

        // Return test results
        return this.testTransformAccuracy();
    }

    /**
     * Benchmark rendering performance
     * @param {number} iterations - Number of test iterations
     * @returns {Object} Benchmark results
     */
    async benchmarkPerformance(iterations = 5) {
        if (!this.renderer || !this.currentData) {
            return { error: 'No data available for benchmarking' };
        }

        console.log(`🎯 BENCHMARK: Running ${iterations} iterations...`);

        const results = [];
        const startTime = performance.now();

        for (let i = 0; i < iterations; i++) {
            const iterationStart = performance.now();
            await this.renderer.renderDesign(this.currentData);
            const iterationTime = performance.now() - iterationStart;
            results.push(iterationTime);
        }

        const totalTime = performance.now() - startTime;
        const averageTime = results.reduce((a, b) => a + b, 0) / results.length;
        const minTime = Math.min(...results);
        const maxTime = Math.max(...results);

        const benchmark = {
            iterations,
            totalTime: `${totalTime.toFixed(2)}ms`,
            averageTime: `${averageTime.toFixed(2)}ms`,
            minTime: `${minTime.toFixed(2)}ms`,
            maxTime: `${maxTime.toFixed(2)}ms`,
            performance: this.getPerformanceMetrics(),
            results: results.map(r => `${r.toFixed(2)}ms`)
        };

        console.log('🎯 BENCHMARK RESULTS:', benchmark);
        return benchmark;
    }
}

// Demo data for testing
window.DEMO_DESIGN_DATA = {
    "167359_189542": {
        "view_name": "Design View",
        "system_id": "189542",
        "variation_id": "167359",
        "images": [
            {
                "id": "img_1758699902386_119",
                "url": "https://yprint.de/wp-content/uploads/octo-print-designer/user-images/17/11092025ylifelogowhite-1.png",
                "transform": {"left": 326, "top": 150, "scaleX": 0.113, "scaleY": 0.113, "angle": 0}
            },
            {
                "id": "img_1758699907869_875",
                "url": "https://yprint.de/wp-content/uploads/octo-print-designer/user-images/17/yprint-logo.png",
                "transform": {"left": 406.39, "top": 116.49, "scaleX": 0.050, "scaleY": 0.050, "angle": 0}
            }
        ]
    }
};

// Global exposure for admin context
window.DesignPreviewGenerator = DesignPreviewGenerator;

console.log('✅ DESIGN PREVIEW GENERATOR: Class loaded and ready');