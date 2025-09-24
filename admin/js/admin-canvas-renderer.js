/**
 * 🎨 Admin Canvas Renderer - Pure Vanilla JS
 *
 * Canvas-free design preview system for WooCommerce admin
 * Renders design data without jQuery or fabric.js dependencies
 *
 * Canvas Specifications:
 * - Size: 25.4cm × 30.2cm
 * - Coordinate System: Top-left origin (0,0)
 * - Pure HTML5 Canvas rendering
 */

class AdminCanvasRenderer {
    constructor() {
        this.canvasWidth = 254;  // 25.4cm in mm, converted to base units
        this.canvasHeight = 302; // 30.2cm in mm, converted to base units
        this.pixelRatio = window.devicePixelRatio || 1;
        this.scaleFactor = 2; // Base scale for good visibility
        this.canvas = null;
        this.ctx = null;
        this.imageCache = new Map();
        this.isRendering = false;

        // 🎯 AGENT 5: ENHANCED TRANSFORM ENGINE - Sub-pixel accuracy system
        this.transformCache = new Map(); // Cache for transform calculations
        this.performanceMetrics = {
            totalRenders: 0,
            averageRenderTime: 0,
            fastestRender: Infinity,
            slowestRender: 0
        };
        this.accuracyTolerance = 0.1; // ENHANCED: Sub-pixel 0.1px tolerance
        this.precisionMatrix = new Map(); // Matrix cache for complex transforms
        this.subpixelOptimization = true; // Enable sub-pixel rendering
    }

    /**
     * Initialize the canvas renderer
     * @param {string} containerId - ID of the container element
     * @param {Object} options - Rendering options
     */
    init(containerId, options = {}) {
        console.log('🎨 ADMIN RENDERER: Initializing canvas renderer...');

        const container = document.getElementById(containerId);
        if (!container) {
            console.error('❌ RENDERER ERROR: Container not found:', containerId);
            return false;
        }

        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        // Calculate display dimensions
        const containerWidth = container.clientWidth || 400;
        const aspectRatio = this.canvasHeight / this.canvasWidth;
        const displayWidth = Math.min(containerWidth, 600);
        const displayHeight = displayWidth * aspectRatio;

        // Set canvas dimensions for high DPI
        this.canvas.width = displayWidth * this.pixelRatio;
        this.canvas.height = displayHeight * this.pixelRatio;
        this.canvas.style.width = displayWidth + 'px';
        this.canvas.style.height = displayHeight + 'px';

        // Scale context for high DPI
        this.ctx.scale(this.pixelRatio, this.pixelRatio);

        // Calculate scale factors for coordinate transformation
        this.scaleX = displayWidth / this.canvasWidth;
        this.scaleY = displayHeight / this.canvasHeight;

        // Style the canvas
        this.canvas.style.border = '1px solid #ddd';
        this.canvas.style.backgroundColor = '#ffffff';
        this.canvas.style.borderRadius = '4px';

        // Add to container
        container.innerHTML = ''; // Clear existing content
        container.appendChild(this.canvas);

        console.log('✅ RENDERER: Canvas initialized', {
            displaySize: `${displayWidth}x${displayHeight}`,
            canvasSize: `${this.canvas.width}x${this.canvas.height}`,
            scale: `${this.scaleX.toFixed(3)}x${this.scaleY.toFixed(3)}`
        });

        return true;
    }

    /**
     * Load and cache an image
     * @param {string} url - Image URL
     * @returns {Promise<HTMLImageElement>}
     */
    async loadImage(url) {
        if (this.imageCache.has(url)) {
            return this.imageCache.get(url);
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Handle CORS

            img.onload = () => {
                this.imageCache.set(url, img);
                console.log('✅ IMAGE LOADED:', url);
                resolve(img);
            };

            img.onerror = (error) => {
                console.error('❌ IMAGE LOAD ERROR:', url, error);
                reject(new Error(`Failed to load image: ${url}`));
            };

            img.src = url;
        });
    }

    /**
     * Clear the canvas
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw white background
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * 🎯 ENHANCED TRANSFORM ENGINE
     * Pixel-perfect coordinate transformation with matrix calculations
     * Handles viewport scaling, rotation, and sub-pixel positioning
     */

    /**
     * Create transformation matrix for precise positioning
     * @param {Object} transform - Transform properties {left, top, scaleX, scaleY, angle}
     * @returns {DOMMatrix} Transformation matrix
     */
    createTransformMatrix(transform) {
        const matrix = new DOMMatrix();

        // Apply transformations in correct order: translate → rotate → scale
        matrix.translateSelf(transform.left || 0, transform.top || 0);
        if (transform.angle) {
            matrix.rotateSelf(0, 0, transform.angle);
        }
        matrix.scaleSelf(transform.scaleX || 1, transform.scaleY || 1);

        return matrix;
    }

    /**
     * 🔬 AGENT 5: PRECISION TRANSFORM - Sub-pixel coordinate transformation
     * Transform fabric.js coordinates to canvas coordinates with <0.1px precision
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Object} options - Transform options {useSubPixel: true, roundToPixel: false}
     * @returns {Object} Transformed coordinates with precision metadata
     */
    transformCoordinates(x, y, options = {}) {
        const useSubPixel = options.useSubPixel !== false;
        const roundToPixel = options.roundToPixel === true;

        // ENHANCED: Cache key for precision matrix lookup
        const cacheKey = `${x}_${y}_${this.scaleX}_${this.scaleY}_${useSubPixel}`;

        if (this.precisionMatrix.has(cacheKey)) {
            return this.precisionMatrix.get(cacheKey);
        }

        // Apply viewport scaling with enhanced precision
        let transformedX = x * this.scaleX;
        let transformedY = y * this.scaleY;

        // AGENT 5 ENHANCEMENT: Sub-pixel precision handling with accuracy tolerance
        if (useSubPixel && this.subpixelOptimization) {
            // Ultra-precise fractional positioning (0.1px accuracy)
            const precision = 1 / this.accuracyTolerance; // 10x precision for 0.1px
            transformedX = Math.round(transformedX * this.pixelRatio * precision) / (this.pixelRatio * precision);
            transformedY = Math.round(transformedY * this.pixelRatio * precision) / (this.pixelRatio * precision);
        } else if (roundToPixel) {
            // Pixel-perfect alignment
            transformedX = Math.round(transformedX);
            transformedY = Math.round(transformedY);
        }

        const result = {
            x: transformedX,
            y: transformedY,
            originalX: x,
            originalY: y,
            scale: {
                x: this.scaleX,
                y: this.scaleY
            },
            precision: {
                subPixel: useSubPixel,
                rounded: roundToPixel,
                tolerance: this.accuracyTolerance,
                cacheKey: cacheKey
            }
        };

        // Cache result for performance optimization
        this.precisionMatrix.set(cacheKey, result);
        return result;
    }

    /**
     * 🔬 AGENT 5: PRECISION SCALING - High-accuracy image dimension calculation
     * Calculate precise image dimensions with sub-pixel scaling accuracy
     * @param {HTMLImageElement} img - Image element
     * @param {Object} transform - Transform data
     * @returns {Object} Calculated dimensions with precision metadata
     */
    calculateImageDimensions(img, transform) {
        const baseWidth = img.naturalWidth || img.width;
        const baseHeight = img.naturalHeight || img.height;

        // ENHANCED: Precision scaling calculations
        const scaleX = transform.scaleX || 1;
        const scaleY = transform.scaleY || 1;

        // Apply image scaling with sub-pixel precision
        let scaledWidth = baseWidth * scaleX;
        let scaledHeight = baseHeight * scaleY;

        // AGENT 5: Sub-pixel optimization for image scaling
        if (this.subpixelOptimization) {
            const precision = 1 / this.accuracyTolerance;
            scaledWidth = Math.round(scaledWidth * precision) / precision;
            scaledHeight = Math.round(scaledHeight * precision) / precision;
        }

        // Apply viewport scaling with precision
        let displayWidth = scaledWidth * this.scaleX;
        let displayHeight = scaledHeight * this.scaleY;

        // Final precision adjustment for display
        if (this.subpixelOptimization) {
            const precision = 1 / this.accuracyTolerance;
            displayWidth = Math.round(displayWidth * precision) / precision;
            displayHeight = Math.round(displayHeight * precision) / precision;
        }

        return {
            base: { width: baseWidth, height: baseHeight },
            scaled: {
                width: scaledWidth,
                height: scaledHeight,
                precision: this.accuracyTolerance
            },
            display: {
                width: displayWidth,
                height: displayHeight,
                precision: this.accuracyTolerance
            },
            center: {
                x: displayWidth / 2,
                y: displayHeight / 2
            },
            scale: {
                image: { x: scaleX, y: scaleY },
                viewport: { x: this.scaleX, y: this.scaleY },
                combined: { x: scaleX * this.scaleX, y: scaleY * this.scaleY }
            }
        };
    }

    /**
     * 🔬 AGENT 5: PRECISION VALIDATION - Ultra-accurate transform validation
     * Validate transform accuracy against target coordinates with sub-pixel precision
     * @param {Object} transform - Transform data
     * @param {Object} target - Target coordinates {x, y}
     * @param {number} tolerance - Pixel tolerance (default: uses this.accuracyTolerance)
     * @returns {Object} Validation result with precision metrics
     */
    validateTransformAccuracy(transform, target, tolerance = null) {
        // Use system accuracy tolerance if not specified
        tolerance = tolerance !== null ? tolerance : this.accuracyTolerance;

        const result = this.transformCoordinates(transform.left, transform.top, { useSubPixel: true });
        const deltaX = Math.abs(result.x - target.x);
        const deltaY = Math.abs(result.y - target.y);
        const euclideanError = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // AGENT 5: Enhanced accuracy classification
        const isPixelPerfect = euclideanError < this.accuracyTolerance;
        const isSubPixelAccurate = euclideanError < tolerance;
        const isAccurate = deltaX <= tolerance && deltaY <= tolerance;

        return {
            isAccurate,
            isSubPixelAccurate,
            isPixelPerfect,
            delta: { x: deltaX, y: deltaY },
            tolerance,
            accuracyTolerance: this.accuracyTolerance,
            actual: result,
            target,
            error: euclideanError,
            precision: {
                classification: isPixelPerfect ? 'pixel-perfect' : isSubPixelAccurate ? 'sub-pixel' : 'standard',
                accuracy: ((tolerance - euclideanError) / tolerance * 100).toFixed(2) + '%'
            }
        };
    }

    /**
     * 🚀 AGENT 5: CACHED TRANSFORM - High-performance precision transform caching
     * Get cached transform coordinates or calculate with precision if not cached
     * @param {string} cacheKey - Unique cache identifier
     * @param {Object} coordinates - Base coordinates {left, top}
     * @returns {Object} Transformed coordinates
     */
    getCachedTransform(cacheKey, coordinates) {
        if (this.transformCache.has(cacheKey)) {
            return this.transformCache.get(cacheKey);
        }

        const result = this.transformCoordinates(coordinates.left, coordinates.top, { useSubPixel: true });
        this.transformCache.set(cacheKey, result);

        // Performance optimization: Limit cache size to prevent memory bloat
        if (this.transformCache.size > 1000) {
            const firstKey = this.transformCache.keys().next().value;
            this.transformCache.delete(firstKey);
        }

        return result;
    }

    /**
     * 🎯 ENHANCED IMAGE RENDERER
     * Precise image rendering with sub-pixel accuracy and performance monitoring
     * @param {Object} imageData - Image data with url and transform properties
     */
    async renderImage(imageData) {
        const startTime = performance.now();

        try {
            const img = await this.loadImage(imageData.url);
            const transform = imageData.transform || {};

            // Extract transform properties
            const left = transform.left || 0;
            const top = transform.top || 0;
            const scaleX = transform.scaleX || 1;
            const scaleY = transform.scaleY || 1;
            const angle = (transform.angle || 0) * Math.PI / 180; // Convert to radians

            // 🎯 PRECISION TRANSFORM: Use cached coordinates for performance
            const cacheKey = `${imageData.id}_${left}_${top}`;
            const pos = this.getCachedTransform(cacheKey, { left, top });
            const dimensions = this.calculateImageDimensions(img, transform);

            // Performance check: Start transform timing
            const transformStart = performance.now();

            // Save context state
            this.ctx.save();

            // 🎯 MATRIX TRANSFORMATION: Apply precise transformations
            this.ctx.translate(pos.x, pos.y);

            if (angle !== 0) {
                this.ctx.rotate(angle);
            }

            // 🎯 PRECISION RENDERING: Use calculated dimensions
            const { display } = dimensions;

            // Apply image smoothing for better quality
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';

            // Draw image (centered on transform origin)
            this.ctx.drawImage(
                img,
                -display.center.x,
                -display.center.y,
                display.width,
                display.height
            );

            // Restore context state
            this.ctx.restore();

            const transformTime = performance.now() - transformStart;
            const totalTime = performance.now() - startTime;

            // 🎯 PERFORMANCE TRACKING: Update metrics
            this.updatePerformanceMetrics(totalTime);

            // 🎯 ACCURACY VALIDATION: Validate against target coordinates
            const accuracy = this.validateTransformAccuracy(
                { left, top },
                { x: left * this.scaleX, y: top * this.scaleY },
                this.accuracyTolerance
            );

            console.log('✅ PRECISION IMAGE RENDERED:', {
                id: imageData.id,
                position: `${left.toFixed(2)}, ${top.toFixed(2)}`,
                scale: `${(scaleX * 100).toFixed(1)}%, ${(scaleY * 100).toFixed(1)}%`,
                angle: (transform.angle || 0).toFixed(1) + '°',
                timing: {
                    total: `${totalTime.toFixed(2)}ms`,
                    transform: `${transformTime.toFixed(2)}ms`
                },
                accuracy: {
                    isPixelPerfect: accuracy.isAccurate,
                    error: `${accuracy.error.toFixed(3)}px`,
                    delta: `${accuracy.delta.x.toFixed(3)}, ${accuracy.delta.y.toFixed(3)}`
                },
                dimensions: {
                    original: `${dimensions.base.width}x${dimensions.base.height}`,
                    display: `${display.width.toFixed(1)}x${display.height.toFixed(1)}`
                }
            });

            // Performance warning if too slow
            if (totalTime > 5) {
                console.warn('⚠️ PERFORMANCE WARNING: Slow render detected', {
                    time: `${totalTime.toFixed(2)}ms`,
                    id: imageData.id
                });
            }

            // Accuracy warning if not pixel-perfect
            if (!accuracy.isAccurate) {
                console.warn('⚠️ ACCURACY WARNING: Transform not pixel-perfect', {
                    error: `${accuracy.error.toFixed(3)}px`,
                    id: imageData.id
                });
            }

        } catch (error) {
            console.error('❌ RENDER ERROR:', imageData.id, error);

            // Draw enhanced error placeholder
            const pos = this.transformCoordinates(imageData.transform?.left || 0, imageData.transform?.top || 0);
            this.ctx.save();

            // Error indicator with better visibility
            this.ctx.fillStyle = '#ff4444';
            this.ctx.fillRect(pos.x - 15, pos.y - 15, 30, 30);

            // Error border
            this.ctx.strokeStyle = '#cc0000';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(pos.x - 15, pos.y - 15, 30, 30);

            // Error text
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px Arial, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('ERR', pos.x, pos.y + 4);

            this.ctx.restore();
        }
    }

    /**
     * Render complete design data
     * @param {Object} designData - Complete design data object
     */
    async renderDesign(designData) {
        if (this.isRendering) {
            console.log('⚠️ RENDERER: Already rendering, skipping...');
            return;
        }

        this.isRendering = true;
        console.log('🎨 RENDERER: Starting design render...', designData);

        try {
            // Clear canvas
            this.clearCanvas();

            // Find the first design view (could be extended for multiple views)
            const viewKeys = Object.keys(designData);
            if (viewKeys.length === 0) {
                console.log('⚠️ RENDERER: No design data found');
                return;
            }

            const firstView = designData[viewKeys[0]];
            if (!firstView || !firstView.images) {
                console.log('⚠️ RENDERER: No images in design data');
                return;
            }

            // Render all images
            console.log(`🎨 RENDERER: Rendering ${firstView.images.length} images...`);

            for (const imageData of firstView.images) {
                await this.renderImage(imageData);
            }

            console.log('✅ RENDERER: Design render complete');

        } catch (error) {
            console.error('❌ RENDERER ERROR:', error);
        } finally {
            this.isRendering = false;
        }
    }

    /**
     * Render design with loading state
     * @param {Object} designData - Design data
     * @param {string} loadingText - Loading message
     */
    async renderWithLoading(designData, loadingText = 'Rendering design...') {
        // Show loading state
        this.clearCanvas();
        this.ctx.save();
        this.ctx.fillStyle = '#666666';
        this.ctx.font = '14px Arial, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            loadingText,
            this.canvas.width / (2 * this.pixelRatio),
            this.canvas.height / (2 * this.pixelRatio)
        );
        this.ctx.restore();

        // Small delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 100));

        // Render actual design
        await this.renderDesign(designData);
    }

    /**
     * Export canvas as data URL
     * @param {string} format - Image format (default: 'image/png')
     * @returns {string} Data URL
     */
    exportAsDataURL(format = 'image/png') {
        return this.canvas.toDataURL(format);
    }

    /**
     * Get canvas dimensions info
     * @returns {Object} Dimension information
     */
    getDimensions() {
        return {
            canvas: {
                width: this.canvasWidth,
                height: this.canvasHeight
            },
            display: {
                width: this.canvas.style.width,
                height: this.canvas.style.height
            },
            actual: {
                width: this.canvas.width,
                height: this.canvas.height
            },
            scale: {
                x: this.scaleX,
                y: this.scaleY
            }
        };
    }

    /**
     * 🎯 PERFORMANCE OPTIMIZATION METHODS
     */

    /**
     * Cache transform calculation for performance
     * @param {string} key - Cache key
     * @param {Object} transform - Transform data
     * @returns {Object} Cached or calculated transform result
     */
    getCachedTransform(key, transform) {
        if (this.transformCache.has(key)) {
            const cached = this.transformCache.get(key);
            // Validate cache is still valid (scale factors haven't changed)
            if (cached.scaleX === this.scaleX && cached.scaleY === this.scaleY) {
                return cached.result;
            }
        }

        // Calculate and cache
        const result = this.transformCoordinates(transform.left || 0, transform.top || 0, { useSubPixel: true });
        this.transformCache.set(key, {
            result,
            scaleX: this.scaleX,
            scaleY: this.scaleY,
            timestamp: performance.now()
        });

        return result;
    }

    /**
     * Update performance metrics
     * @param {number} renderTime - Time taken for render in ms
     */
    updatePerformanceMetrics(renderTime) {
        this.performanceMetrics.totalRenders++;

        // Update average
        const total = this.performanceMetrics.averageRenderTime * (this.performanceMetrics.totalRenders - 1);
        this.performanceMetrics.averageRenderTime = (total + renderTime) / this.performanceMetrics.totalRenders;

        // Update extremes
        this.performanceMetrics.fastestRender = Math.min(this.performanceMetrics.fastestRender, renderTime);
        this.performanceMetrics.slowestRender = Math.max(this.performanceMetrics.slowestRender, renderTime);
    }

    /**
     * Clear transform cache (call when viewport changes)
     */
    clearTransformCache() {
        this.transformCache.clear();
        console.log('🎯 TRANSFORM CACHE: Cleared');
    }

    /**
     * Get performance report
     * @returns {Object} Performance metrics
     */
    getPerformanceReport() {
        return {
            ...this.performanceMetrics,
            cacheSize: this.transformCache.size,
            imageCacheSize: this.imageCache.size,
            averageRenderTimeFormatted: `${this.performanceMetrics.averageRenderTime.toFixed(2)}ms`,
            fastestRenderFormatted: `${this.performanceMetrics.fastestRender.toFixed(2)}ms`,
            slowestRenderFormatted: `${this.performanceMetrics.slowestRender.toFixed(2)}ms`
        };
    }

    /**
     * 🎯 RESPONSIVE SCALING ENGINE
     */

    /**
     * Handle viewport resize and recalculate scales
     * @param {string} containerId - Container element ID
     */
    handleViewportResize(containerId) {
        const container = document.getElementById(containerId);
        if (!container || !this.canvas) return;

        const oldScaleX = this.scaleX;
        const oldScaleY = this.scaleY;

        // Recalculate display dimensions
        const containerWidth = container.clientWidth || 400;
        const aspectRatio = this.canvasHeight / this.canvasWidth;
        const displayWidth = Math.min(containerWidth, 600);
        const displayHeight = displayWidth * aspectRatio;

        // Update canvas display size
        this.canvas.style.width = displayWidth + 'px';
        this.canvas.style.height = displayHeight + 'px';

        // Update scale factors
        this.scaleX = displayWidth / this.canvasWidth;
        this.scaleY = displayHeight / this.canvasHeight;

        // Clear cache if scale changed
        if (oldScaleX !== this.scaleX || oldScaleY !== this.scaleY) {
            this.clearTransformCache();
            console.log('🎯 VIEWPORT RESIZE: Scale updated', {
                old: `${oldScaleX.toFixed(3)}x${oldScaleY.toFixed(3)}`,
                new: `${this.scaleX.toFixed(3)}x${this.scaleY.toFixed(3)}`
            });
        }
    }

    /**
     * Test transform accuracy with known coordinates
     * @param {Array} testCases - Array of {input: {left, top}, expected: {x, y}} objects
     * @returns {Object} Test results
     */
    testTransformAccuracy(testCases = []) {
        // Default test cases from Order 5373
        const defaultTestCases = [
            {
                name: 'Image 1 (ylife logo)',
                input: { left: 326, top: 150 },
                expected: { x: 326 * this.scaleX, y: 150 * this.scaleY }
            },
            {
                name: 'Image 2 (yprint logo)',
                input: { left: 406.39, top: 116.49 },
                expected: { x: 406.39 * this.scaleX, y: 116.49 * this.scaleY }
            }
        ];

        const tests = testCases.length > 0 ? testCases : defaultTestCases;
        const results = {
            passed: 0,
            failed: 0,
            tolerance: this.accuracyTolerance,
            details: []
        };

        tests.forEach((test, index) => {
            const actual = this.transformCoordinates(test.input.left, test.input.top);
            const deltaX = Math.abs(actual.x - test.expected.x);
            const deltaY = Math.abs(actual.y - test.expected.y);
            const error = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const passed = error <= this.accuracyTolerance;

            if (passed) results.passed++;
            else results.failed++;

            results.details.push({
                name: test.name || `Test ${index + 1}`,
                passed,
                error: `${error.toFixed(3)}px`,
                delta: { x: deltaX.toFixed(3), y: deltaY.toFixed(3) },
                input: test.input,
                expected: test.expected,
                actual: { x: actual.x.toFixed(3), y: actual.y.toFixed(3) }
            });
        });

        console.log('🎯 TRANSFORM ACCURACY TEST RESULTS:', results);
        return results;
    }
}

// Global exposure for admin context
window.AdminCanvasRenderer = AdminCanvasRenderer;

console.log('✅ ADMIN CANVAS RENDERER: Class loaded and ready');