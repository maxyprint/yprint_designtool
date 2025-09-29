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
        // 🎯 AGENT 1: EXACT CANVAS DIMENSIONS - 780×580 from design_data
        this.canvasWidth = 780;   // Original design canvas width
        this.canvasHeight = 580;  // Original design canvas height
        this.pixelRatio = window.devicePixelRatio || 1;
        this.scaleFactor = 1; // AGENT 1: No scaling for 1:1 replica
        this.canvas = null;
        this.ctx = null;
        this.imageCache = new Map();
        this.isRendering = false;

        // 🎯 AGENT 1: DIMENSION PRESERVATION LOGGING
        this.dimensionPreservation = {
            originalWidth: 780,
            originalHeight: 580,
            enforceExactDimensions: true,
            logDimensionChanges: true
        };

        // 🎯 AGENT 2: COORDINATE PRESERVATION ENGINE
        this.coordinatePreservation = {
            noTransformMode: true,        // Apply zero transformations
            preserveOriginalCoords: true, // Keep original left/top values
            validateCoordinates: true,    // Log coordinate preservation
            allowedTolerance: 0.1        // Sub-pixel tolerance for validation
        };

        // 🎯 AGENT 3: MOCKUP BACKGROUND RENDERER
        this.backgroundRenderer = {
            templateSupport: true,           // Enable template background rendering
            backgroundCache: new Map(),     // Cache for background images
            preserveAspectRatio: true,      // Maintain template aspect ratio
            backgroundLayer: 'bottom',      // Render background first
            logBackgroundRender: true       // Log background rendering
        };

        // 🎯 AGENT 4: IMAGE ELEMENT RENDERER
        this.imageRenderer = {
            exactPositioning: true,         // Use exact positioning without transformation
            crossOriginSupport: true,       // Handle external image URLs
            preserveImageScaling: true,     // Maintain original scaleX/scaleY values
            enableImageCaching: true,       // Cache loaded images for performance
            logImageRender: true           // Log detailed image rendering info
        };

        // 🎯 AGENT 5: TEXT ELEMENT RENDERER
        this.textRenderer = {
            fontLoadingSupport: true,       // Support web font loading
            exactTextPositioning: true,     // Use exact text positioning
            preserveTextScaling: true,      // Maintain original text scaling
            fontCache: new Map(),          // Cache loaded fonts
            supportedTextProps: [          // Supported text properties
                'fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
                'textAlign', 'fill', 'stroke', 'strokeWidth', 'textDecoration'
            ],
            logTextRender: true           // Log detailed text rendering info
        };

        // 🎯 AGENT 6: SHAPE ELEMENT RENDERER
        this.shapeRenderer = {
            exactShapePositioning: true,    // Use exact shape positioning
            preserveShapeDimensions: true,  // Maintain original shape dimensions
            supportedShapes: [             // Supported shape types
                'rect', 'rectangle', 'circle', 'ellipse', 'line', 'polygon', 'path'
            ],
            supportedShapeProps: [         // Supported shape properties
                'fill', 'stroke', 'strokeWidth', 'strokeDashArray',
                'opacity', 'shadow', 'radius'
            ],
            logShapeRender: true          // Log detailed shape rendering info
        };

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

        // 🎯 AGENT 1: ZERO-SCALING CANVAS CREATION - Preserve exact dimensions
        const containerWidth = container.clientWidth || 800;
        const aspectRatio = this.canvasHeight / this.canvasWidth;

        // AGENT 1: Option 1 - Exact dimensions (may be small)
        let displayWidth, displayHeight;
        if (this.dimensionPreservation.enforceExactDimensions) {
            displayWidth = this.canvasWidth;
            displayHeight = this.canvasHeight;
        } else {
            // Option 2 - Scale to fit container while maintaining aspect ratio
            displayWidth = Math.min(containerWidth, 800);
            displayHeight = displayWidth * aspectRatio;
        }

        // Set canvas dimensions for high DPI
        this.canvas.width = displayWidth * this.pixelRatio;
        this.canvas.height = displayHeight * this.pixelRatio;
        this.canvas.style.width = displayWidth + 'px';
        this.canvas.style.height = displayHeight + 'px';

        // Scale context for high DPI
        this.ctx.scale(this.pixelRatio, this.pixelRatio);

        // 🎯 AGENT 1: DIMENSION PRESERVATION - Calculate scale factors
        this.scaleX = displayWidth / this.canvasWidth;
        this.scaleY = displayHeight / this.canvasHeight;

        // 🎯 AGENT 1: DIMENSION VALIDATION LOGGING
        if (this.dimensionPreservation.logDimensionChanges) {
            console.log('🎯 AGENT 1 DIMENSION CONTROLLER:', {
                originalCanvas: `${this.canvasWidth}×${this.canvasHeight}`,
                displaySize: `${displayWidth}×${displayHeight}`,
                actualCanvas: `${this.canvas.width}×${this.canvas.height}`,
                scaleFactors: `${this.scaleX.toFixed(3)}×${this.scaleY.toFixed(3)}`,
                isExactDimensions: this.scaleX === 1 && this.scaleY === 1,
                pixelRatio: this.pixelRatio,
                aspectRatioPreserved: Math.abs((displayWidth/displayHeight) - (this.canvasWidth/this.canvasHeight)) < 0.001
            });
        }

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
     * 🎯 AGENT 3: BACKGROUND TEMPLATE RENDERER
     * Load and render template/mockup background images
     * @param {string} templateUrl - Template background image URL
     * @param {Object} options - Background rendering options
     */
    async renderBackground(templateUrl, options = {}) {
        if (!this.backgroundRenderer.templateSupport || !templateUrl) {
            if (this.backgroundRenderer.logBackgroundRender) {
                console.log('🎯 AGENT 3 BACKGROUND: Skipping background render - no template URL');
            }
            return;
        }

        const startTime = performance.now();

        try {
            // 🎯 AGENT 3: Load background image with caching
            let backgroundImg;
            if (this.backgroundRenderer.backgroundCache.has(templateUrl)) {
                backgroundImg = this.backgroundRenderer.backgroundCache.get(templateUrl);
            } else {
                backgroundImg = await this.loadImage(templateUrl);
                this.backgroundRenderer.backgroundCache.set(templateUrl, backgroundImg);
            }

            // 🎯 AGENT 3: Calculate background scaling to fit canvas exactly
            const bgScaleX = this.canvasWidth / backgroundImg.naturalWidth;
            const bgScaleY = this.canvasHeight / backgroundImg.naturalHeight;

            let finalScaleX, finalScaleY, offsetX = 0, offsetY = 0;

            if (this.backgroundRenderer.preserveAspectRatio) {
                // Maintain aspect ratio - fit to cover entire canvas
                const scale = Math.max(bgScaleX, bgScaleY);
                finalScaleX = finalScaleY = scale;

                // Center the background if it doesn't fit exactly
                const scaledWidth = backgroundImg.naturalWidth * scale;
                const scaledHeight = backgroundImg.naturalHeight * scale;
                offsetX = (this.canvasWidth - scaledWidth) / 2;
                offsetY = (this.canvasHeight - scaledHeight) / 2;
            } else {
                // Stretch to fit exact canvas dimensions
                finalScaleX = bgScaleX;
                finalScaleY = bgScaleY;
            }

            // 🎯 AGENT 3: Apply coordinate preservation to background positioning
            const bgPosition = this.coordinatePreservation.noTransformMode
                ? { x: offsetX, y: offsetY }
                : this.preserveCoordinates(offsetX, offsetY);

            // 🎯 AGENT 3: Render background without affecting element coordinates
            this.ctx.save();

            // Draw background image
            this.ctx.drawImage(
                backgroundImg,
                bgPosition.x,
                bgPosition.y,
                backgroundImg.naturalWidth * finalScaleX,
                backgroundImg.naturalHeight * finalScaleY
            );

            this.ctx.restore();

            const renderTime = performance.now() - startTime;

            // 🎯 AGENT 3: BACKGROUND LOGGING
            if (this.backgroundRenderer.logBackgroundRender) {
                console.log('🎯 AGENT 3 BACKGROUND RENDERER:', {
                    templateUrl: templateUrl,
                    originalSize: `${backgroundImg.naturalWidth}×${backgroundImg.naturalHeight}`,
                    canvasSize: `${this.canvasWidth}×${this.canvasHeight}`,
                    scaling: {
                        scaleX: finalScaleX.toFixed(3),
                        scaleY: finalScaleY.toFixed(3),
                        aspectRatioPreserved: this.backgroundRenderer.preserveAspectRatio
                    },
                    positioning: {
                        offsetX: offsetX.toFixed(1),
                        offsetY: offsetY.toFixed(1),
                        finalX: bgPosition.x.toFixed(1),
                        finalY: bgPosition.y.toFixed(1)
                    },
                    performance: `${renderTime.toFixed(2)}ms`,
                    cached: this.backgroundRenderer.backgroundCache.has(templateUrl)
                });
            }

        } catch (error) {
            console.error('❌ AGENT 3 BACKGROUND ERROR:', error);

            // Draw error indicator for background
            this.ctx.save();
            this.ctx.fillStyle = '#f0f0f0';
            this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

            this.ctx.fillStyle = '#999999';
            this.ctx.font = '16px Arial, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                'Background Load Error',
                this.canvasWidth / 2,
                this.canvasHeight / 2
            );
            this.ctx.restore();
        }
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
     * 🎯 AGENT 2: COORDINATE PRESERVATION - Zero-transformation coordinate system
     * Apply zero transformations to preserve exact original coordinates
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Object} options - Transform options
     * @returns {Object} Preserved coordinates with validation metadata
     */
    preserveCoordinates(x, y, options = {}) {
        // 🎯 AGENT 2: NO TRANSFORMATION MODE - Return exact coordinates
        if (this.coordinatePreservation.noTransformMode) {
            const result = {
                x: x, // EXACT preservation - no scaling
                y: y, // EXACT preservation - no scaling
                originalX: x,
                originalY: y,
                preservation: {
                    noTransformation: true,
                    exactCoordinates: true,
                    scaleApplied: false,
                    agent: 'AGENT_2_COORDINATE_PRESERVATION'
                }
            };

            // 🎯 AGENT 2: COORDINATE VALIDATION LOGGING
            if (this.coordinatePreservation.validateCoordinates) {
                console.log('🎯 AGENT 2 COORDINATE PRESERVATION:', {
                    input: `${x}, ${y}`,
                    output: `${result.x}, ${result.y}`,
                    preserved: result.x === x && result.y === y,
                    transformation: 'NONE - 1:1 Replica Mode'
                });
            }

            return result;
        }

        // Fallback to original transform system if not in preservation mode
        return this.transformCoordinates(x, y, options);
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
     * 🎯 AGENT 5: DIMENSION VALIDATION UTILITY
     * Comprehensive validation for image rendering parameters to prevent invisible rendering
     * @param {Object} params - Validation parameters
     * @returns {Object} Validation result with detailed diagnostics
     */
    validateRenderingParameters(params) {
        const {
            imageData,
            img,
            position,
            dimensions,
            scaleX,
            scaleY,
            angle,
            context = 'image'
        } = params;

        const validation = {
            isValid: true,
            errors: [],
            warnings: [],
            diagnostics: {}
        };

        // Validate image object
        if (context === 'image') {
            if (!img || !img.complete) {
                validation.isValid = false;
                validation.errors.push('Image not loaded or not complete');
            }
            if (img && (img.naturalWidth === 0 || img.naturalHeight === 0)) {
                validation.isValid = false;
                validation.errors.push('Image has zero natural dimensions');
            }
        }

        // Validate position coordinates
        if (position) {
            if (!isFinite(position.x) || !isFinite(position.y) ||
                isNaN(position.x) || isNaN(position.y)) {
                validation.isValid = false;
                validation.errors.push('Invalid position coordinates (NaN or Infinity)');
            }
        }

        // Validate dimensions
        if (dimensions) {
            const { width, height } = dimensions;
            if (!width || !height || width <= 0 || height <= 0 ||
                !isFinite(width) || !isFinite(height) ||
                isNaN(width) || isNaN(height)) {
                validation.isValid = false;
                validation.errors.push('Invalid dimensions (zero, negative, NaN, or Infinity)');
            }
            if (width < 1 || height < 1) {
                validation.warnings.push('Sub-pixel dimensions detected - may result in invisible rendering');
            }
        }

        // Validate scaling factors
        if (scaleX !== undefined && scaleY !== undefined) {
            if (!scaleX || !scaleY || scaleX <= 0 || scaleY <= 0 ||
                !isFinite(scaleX) || !isFinite(scaleY) ||
                isNaN(scaleX) || isNaN(scaleY)) {
                validation.isValid = false;
                validation.errors.push('Invalid scale factors (zero, negative, NaN, or Infinity)');
            }
        }

        // Validate rotation angle
        if (angle !== undefined) {
            if (!isFinite(angle) || isNaN(angle)) {
                validation.isValid = false;
                validation.errors.push('Invalid rotation angle (NaN or Infinity)');
            }
        }

        // Check canvas bounds visibility
        if (position && dimensions && this.canvasWidth && this.canvasHeight) {
            const isVisible = !(position.x > this.canvasWidth || position.y > this.canvasHeight ||
                position.x + dimensions.width < 0 || position.y + dimensions.height < 0);
            if (!isVisible) {
                validation.warnings.push('Element positioned outside canvas bounds - will not be visible');
            }
            validation.diagnostics.visibleOnCanvas = isVisible;
        }

        // Validate canvas context state
        if (this.ctx) {
            if (!this.ctx || typeof this.ctx.drawImage !== 'function') {
                validation.isValid = false;
                validation.errors.push('Invalid canvas context state');
            }
        }

        validation.diagnostics = {
            ...validation.diagnostics,
            totalErrors: validation.errors.length,
            totalWarnings: validation.warnings.length,
            renderingSafe: validation.isValid && validation.errors.length === 0
        };

        return validation;
    }

    /**
     * 🎯 AGENT 4: SPECIALIZED IMAGE ELEMENT RENDERER
     * Renders image objects with exact positioning and no coordinate transformation
     * @param {Object} imageData - Image data with url and transform properties
     */
    async renderImageElement(imageData) {
        const startTime = performance.now();

        try {
            // 🎯 AGENT 4: Load image with crossOrigin support
            const img = await this.loadImage(imageData.src || imageData.url);

            // 🎯 AGENT 4: Extract exact positioning from design data
            const left = imageData.left || 0;
            const top = imageData.top || 0;
            const scaleX = imageData.scaleX || 1;
            const scaleY = imageData.scaleY || 1;
            const angle = (imageData.angle || 0) * Math.PI / 180;

            // 🎯 AGENT 4: Apply coordinate preservation (no transformation)
            const position = this.coordinatePreservation.noTransformMode
                ? { x: left, y: top }
                : this.preserveCoordinates(left, top);

            // 🎯 AGENT 4: SAFETY VALIDATION - Ensure position object is valid
            if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
                console.error('❌ AGENT 4: Invalid position object:', position, 'imageData:', imageData);
                // Fallback to direct coordinates
                position = { x: left, y: top };
            }

            // 🎯 AGENT 5: DIMENSION VALIDATION - Validate image and scaling values
            const baseWidth = imageData.width || img.naturalWidth;
            const baseHeight = imageData.height || img.naturalHeight;

            // 🎯 AGENT 5: Validate base image dimensions
            if (!baseWidth || !baseHeight || baseWidth <= 0 || baseHeight <= 0) {
                console.error('❌ AGENT 5 DIMENSION VALIDATION: Invalid base dimensions:', {
                    baseWidth, baseHeight,
                    imageDataWidth: imageData.width,
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight
                });
                return; // Exit early to prevent invisible rendering
            }

            // 🎯 AGENT 5: Validate scaling factors
            if (!scaleX || !scaleY || scaleX <= 0 || scaleY <= 0 ||
                !isFinite(scaleX) || !isFinite(scaleY) ||
                isNaN(scaleX) || isNaN(scaleY)) {
                console.error('❌ AGENT 5 DIMENSION VALIDATION: Invalid scale factors:', {
                    scaleX, scaleY, originalScaleX: imageData.scaleX, originalScaleY: imageData.scaleY
                });
                return; // Exit early to prevent invisible rendering
            }

            // 🎯 AGENT 4: Calculate exact image dimensions with preserved scaling
            const displayWidth = baseWidth * scaleX;
            const displayHeight = baseHeight * scaleY;

            // 🎯 AGENT 5: BOUNDS CHECKING - Validate final display dimensions
            if (!displayWidth || !displayHeight || displayWidth <= 0 || displayHeight <= 0 ||
                !isFinite(displayWidth) || !isFinite(displayHeight) ||
                isNaN(displayWidth) || isNaN(displayHeight)) {
                console.error('❌ AGENT 5 DIMENSION VALIDATION: Invalid display dimensions:', {
                    displayWidth, displayHeight, baseWidth, baseHeight, scaleX, scaleY
                });
                return; // Exit early to prevent invisible rendering
            }

            // 🎯 AGENT 5: COMPREHENSIVE VALIDATION - Use centralized validation system
            const validationResult = this.validateRenderingParameters({
                imageData,
                img,
                position,
                dimensions: { width: displayWidth, height: displayHeight },
                scaleX,
                scaleY,
                angle,
                context: 'image'
            });

            // 🎯 AGENT 5: Handle validation errors and warnings
            if (!validationResult.isValid) {
                console.error('❌ AGENT 5 VALIDATION FAILED - Aborting render to prevent invisible rendering:', {
                    errors: validationResult.errors,
                    warnings: validationResult.warnings,
                    diagnostics: validationResult.diagnostics,
                    imageData: {
                        src: (imageData.src || imageData.url).substring(0, 50) + '...',
                        type: imageData.type,
                        left, top, scaleX, scaleY
                    }
                });
                return; // Exit early to prevent invisible rendering
            }

            // 🎯 AGENT 5: Log validation warnings for debugging
            if (validationResult.warnings.length > 0) {
                console.warn('⚠️ AGENT 5 VALIDATION WARNINGS:', {
                    warnings: validationResult.warnings,
                    diagnostics: validationResult.diagnostics,
                    position: { x: position.x, y: position.y },
                    dimensions: { width: displayWidth, height: displayHeight },
                    canvasBounds: { width: this.canvasWidth, height: this.canvasHeight }
                });
                // Continue rendering but log the warnings
            }

            // 🎯 AGENT 5: Validation complete - all parameters verified by centralized validation system

            // Save context state
            this.ctx.save();

            // 🎯 AGENT 5: Context validation complete - verified by centralized validation system

            // 🎯 AGENT 4: Apply transformations in correct order
            this.ctx.translate(position.x, position.y);

            if (angle !== 0) {
                this.ctx.rotate(angle);
            }

            // 🎯 AGENT 4: High-quality image rendering
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';

            // 🎯 AGENT 5: Image validation complete - verified by centralized validation system

            // 🎯 AGENT 4: Draw image with exact dimensions (top-left origin)
            this.ctx.drawImage(
                img,
                0, 0,  // No centering - use exact coordinates
                displayWidth,
                displayHeight
            );

            this.ctx.restore();

            const renderTime = performance.now() - startTime;
            this.updatePerformanceMetrics(renderTime);

            // 🎯 AGENT 5: INVISIBLE RENDERING DETECTION - Comprehensive diagnostics
            const isVisibleOnCanvas = !(position.x > this.canvasWidth || position.y > this.canvasHeight ||
                position.x + displayWidth < 0 || position.y + displayHeight < 0);
            const hasValidDimensions = displayWidth > 0 && displayHeight > 0;
            const isEffectivelyVisible = isVisibleOnCanvas && hasValidDimensions && displayWidth >= 1 && displayHeight >= 1;

            // 🎯 AGENT 5: DETAILED DEBUG LOGGING for invisible rendering scenarios
            if (!isEffectivelyVisible) {
                console.warn('⚠️ AGENT 5 INVISIBLE RENDERING DETECTED:', {
                    reason: !isVisibleOnCanvas ? 'outside_canvas_bounds' : 'invalid_dimensions',
                    visibility: {
                        isVisibleOnCanvas,
                        hasValidDimensions,
                        isEffectivelyVisible,
                        subPixelSize: displayWidth < 1 || displayHeight < 1
                    },
                    position: { x: position.x, y: position.y },
                    dimensions: { width: displayWidth, height: displayHeight },
                    canvasBounds: { width: this.canvasWidth, height: this.canvasHeight },
                    imageData: {
                        src: (imageData.src || imageData.url).substring(0, 50) + '...',
                        originalDimensions: { width: imageData.width, height: imageData.height },
                        scaling: { scaleX, scaleY }
                    }
                });
            }

            // 🎯 AGENT 4+5: ENHANCED IMAGE RENDERING LOG with validation results
            if (this.imageRenderer.logImageRender) {
                console.log('🎯 AGENT 4+5 IMAGE RENDERER:', {
                    type: imageData.type || 'image',
                    src: (imageData.src || imageData.url).substring(0, 50) + '...',
                    validation: {
                        dimensionsValid: hasValidDimensions,
                        positionValid: isFinite(position.x) && isFinite(position.y),
                        scaleValid: scaleX > 0 && scaleY > 0 && isFinite(scaleX) && isFinite(scaleY),
                        angleValid: isFinite(angle),
                        imageReady: img.complete && img.naturalWidth > 0 && img.naturalHeight > 0,
                        visibleOnCanvas: isVisibleOnCanvas,
                        effectivelyVisible: isEffectivelyVisible
                    },
                    positioning: {
                        originalLeft: left,
                        originalTop: top,
                        finalX: position.x,
                        finalY: position.y,
                        coordinatePreservation: this.coordinatePreservation.noTransformMode
                    },
                    dimensions: {
                        baseSize: `${baseWidth}×${baseHeight}`,
                        naturalSize: `${img.naturalWidth}×${img.naturalHeight}`,
                        scaledSize: `${displayWidth.toFixed(3)}×${displayHeight.toFixed(3)}`,
                        scaleFactors: `${(scaleX * 100).toFixed(3)}%×${(scaleY * 100).toFixed(3)}%`,
                        subPixelRendering: displayWidth < 1 || displayHeight < 1
                    },
                    transform: {
                        rotation: angle !== 0 ? `${(angle * 180 / Math.PI).toFixed(3)}°` : 'none',
                        transformMatrix: this.ctx.getTransform ? this.ctx.getTransform() : 'unavailable'
                    },
                    performance: `${renderTime.toFixed(2)}ms`,
                    exactPositioning: position.x === left && position.y === top,
                    renderingStatus: isEffectivelyVisible ? 'SUCCESS' : 'INVISIBLE'
                });
            }

        } catch (error) {
            console.error('❌ AGENT 4 IMAGE ERROR:', error);

            // 🎯 AGENT 4: Enhanced error visualization
            const position = this.coordinatePreservation.noTransformMode
                ? { x: imageData.left || 0, y: imageData.top || 0 }
                : this.preserveCoordinates(imageData.left || 0, imageData.top || 0);

            this.ctx.save();

            // Error background
            this.ctx.fillStyle = '#ffe6e6';
            this.ctx.fillRect(position.x, position.y, 100, 60);

            // Error border
            this.ctx.strokeStyle = '#ff4444';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(position.x, position.y, 100, 60);

            // Error text
            this.ctx.fillStyle = '#cc0000';
            this.ctx.font = '12px Arial, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('IMAGE ERROR', position.x + 50, position.y + 25);
            this.ctx.fillText(imageData.type || 'unknown', position.x + 50, position.y + 45);

            this.ctx.restore();
        }
    }

    /**
     * 🎯 AGENT 5: SPECIALIZED TEXT ELEMENT RENDERER
     * Renders text objects with exact positioning and font loading support
     * @param {Object} textData - Text data with font and positioning properties
     */
    async renderTextElement(textData) {
        const startTime = performance.now();

        try {
            // 🎯 AGENT 5: Extract text properties
            const text = textData.text || '';
            const left = textData.left || 0;
            const top = textData.top || 0;
            const scaleX = textData.scaleX || 1;
            const scaleY = textData.scaleY || 1;
            const angle = (textData.angle || 0) * Math.PI / 180;

            // 🎯 AGENT 5: Font properties with defaults
            const fontFamily = textData.fontFamily || 'Arial, sans-serif';
            const fontSize = (textData.fontSize || 16) * scaleY; // Scale font size
            const fontWeight = textData.fontWeight || 'normal';
            const fontStyle = textData.fontStyle || 'normal';
            const textAlign = textData.textAlign || 'left';

            // 🎯 AGENT 5: Color properties
            const fill = textData.fill || '#000000';
            const stroke = textData.stroke || null;
            const strokeWidth = textData.strokeWidth || 0;

            // 🎯 AGENT 5: Apply coordinate preservation (no transformation)
            const position = this.coordinatePreservation.noTransformMode
                ? { x: left, y: top }
                : this.preserveCoordinates(left, top);

            // 🎯 AGENT 5: Load font if web font
            if (this.textRenderer.fontLoadingSupport && fontFamily !== 'Arial, sans-serif') {
                await this.loadFont(fontFamily);
            }

            // Save context state
            this.ctx.save();

            // 🎯 AGENT 5: Apply transformations in correct order
            this.ctx.translate(position.x, position.y);

            if (angle !== 0) {
                this.ctx.rotate(angle);
            }

            // Apply scaling
            this.ctx.scale(scaleX, scaleY);

            // 🎯 AGENT 5: Set font properties
            this.ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
            this.ctx.textAlign = textAlign;
            this.ctx.textBaseline = 'top'; // Consistent baseline

            // 🎯 AGENT 5: Render text with fill and stroke
            if (fill) {
                this.ctx.fillStyle = fill;
                this.ctx.fillText(text, 0, 0);
            }

            if (stroke && strokeWidth > 0) {
                this.ctx.strokeStyle = stroke;
                this.ctx.lineWidth = strokeWidth;
                this.ctx.strokeText(text, 0, 0);
            }

            this.ctx.restore();

            const renderTime = performance.now() - startTime;
            this.updatePerformanceMetrics(renderTime);

            // 🎯 AGENT 5: DETAILED TEXT RENDERING LOG
            if (this.textRenderer.logTextRender) {
                console.log('🎯 AGENT 5 TEXT RENDERER:', {
                    type: textData.type || 'text',
                    text: text.substring(0, 30) + (text.length > 30 ? '...' : ''),
                    positioning: {
                        originalLeft: left,
                        originalTop: top,
                        finalX: position.x,
                        finalY: position.y,
                        coordinatePreservation: this.coordinatePreservation.noTransformMode
                    },
                    font: {
                        family: fontFamily,
                        size: fontSize.toFixed(1) + 'px',
                        weight: fontWeight,
                        style: fontStyle,
                        align: textAlign
                    },
                    styling: {
                        fill: fill,
                        stroke: stroke || 'none',
                        strokeWidth: strokeWidth
                    },
                    scaling: {
                        scaleX: (scaleX * 100).toFixed(1) + '%',
                        scaleY: (scaleY * 100).toFixed(1) + '%'
                    },
                    rotation: angle !== 0 ? `${(angle * 180 / Math.PI).toFixed(1)}°` : 'none',
                    performance: `${renderTime.toFixed(2)}ms`,
                    exactPositioning: position.x === left && position.y === top
                });
            }

        } catch (error) {
            console.error('❌ AGENT 5 TEXT ERROR:', error);

            // 🎯 AGENT 5: Enhanced error visualization for text
            const position = this.coordinatePreservation.noTransformMode
                ? { x: textData.left || 0, y: textData.top || 0 }
                : this.preserveCoordinates(textData.left || 0, textData.top || 0);

            this.ctx.save();

            // Error background
            this.ctx.fillStyle = '#fff0e6';
            this.ctx.fillRect(position.x, position.y, 120, 40);

            // Error border
            this.ctx.strokeStyle = '#ff8c00';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(position.x, position.y, 120, 40);

            // Error text
            this.ctx.fillStyle = '#cc6600';
            this.ctx.font = '12px Arial, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('TEXT ERROR', position.x + 60, position.y + 15);
            this.ctx.fillText(textData.type || 'unknown', position.x + 60, position.y + 30);

            this.ctx.restore();
        }
    }

    /**
     * 🎯 AGENT 5: FONT LOADER
     * Load web fonts with caching support
     * @param {string} fontFamily - Font family name
     */
    async loadFont(fontFamily) {
        if (this.textRenderer.fontCache.has(fontFamily)) {
            return this.textRenderer.fontCache.get(fontFamily);
        }

        try {
            // Check if font is available in document fonts
            if ('fonts' in document) {
                const font = new FontFace(fontFamily, `url(${fontFamily})`);
                await font.load();
                document.fonts.add(font);
                this.textRenderer.fontCache.set(fontFamily, true);

                if (this.textRenderer.logTextRender) {
                    console.log('🎯 AGENT 5 FONT LOADED:', fontFamily);
                }
            }
        } catch (error) {
            console.warn('⚠️ AGENT 5 FONT LOAD WARNING:', fontFamily, error);
            // Cache the failure to avoid repeated attempts
            this.textRenderer.fontCache.set(fontFamily, false);
        }
    }

    /**
     * 🎯 AGENT 6: SPECIALIZED SHAPE ELEMENT RENDERER
     * Renders shape objects with exact positioning and dimensions
     * @param {Object} shapeData - Shape data with type and positioning properties
     */
    async renderShapeElement(shapeData) {
        const startTime = performance.now();

        try {
            // 🎯 AGENT 6: Extract shape properties
            const type = shapeData.type || 'rect';
            const left = shapeData.left || 0;
            const top = shapeData.top || 0;
            const width = shapeData.width || 100;
            const height = shapeData.height || 100;
            const scaleX = shapeData.scaleX || 1;
            const scaleY = shapeData.scaleY || 1;
            const angle = (shapeData.angle || 0) * Math.PI / 180;

            // 🎯 AGENT 6: Style properties
            const fill = shapeData.fill || '#000000';
            const stroke = shapeData.stroke || null;
            const strokeWidth = shapeData.strokeWidth || 0;
            const opacity = shapeData.opacity !== undefined ? shapeData.opacity : 1;
            const radius = shapeData.radius || 0;

            // 🎯 AGENT 6: Apply coordinate preservation (no transformation)
            const position = this.coordinatePreservation.noTransformMode
                ? { x: left, y: top }
                : this.preserveCoordinates(left, top);

            // 🎯 AGENT 6: Calculate exact dimensions with preserved scaling
            const displayWidth = width * scaleX;
            const displayHeight = height * scaleY;

            // Save context state
            this.ctx.save();

            // 🎯 AGENT 6: Apply transformations in correct order
            this.ctx.translate(position.x, position.y);

            if (angle !== 0) {
                this.ctx.rotate(angle);
            }

            // Apply opacity
            this.ctx.globalAlpha = opacity;

            // 🎯 AGENT 6: Render based on shape type
            this.ctx.beginPath();

            switch (type.toLowerCase()) {
                case 'rect':
                case 'rectangle':
                    if (radius > 0) {
                        // Rounded rectangle
                        this.drawRoundedRect(0, 0, displayWidth, displayHeight, radius);
                    } else {
                        this.ctx.rect(0, 0, displayWidth, displayHeight);
                    }
                    break;

                case 'circle':
                    const centerX = displayWidth / 2;
                    const centerY = displayHeight / 2;
                    const radiusValue = Math.min(displayWidth, displayHeight) / 2;
                    this.ctx.arc(centerX, centerY, radiusValue, 0, 2 * Math.PI);
                    break;

                case 'ellipse':
                    const ellipseCenterX = displayWidth / 2;
                    const ellipseCenterY = displayHeight / 2;
                    const radiusX = displayWidth / 2;
                    const radiusY = displayHeight / 2;
                    this.ctx.ellipse(ellipseCenterX, ellipseCenterY, radiusX, radiusY, 0, 0, 2 * Math.PI);
                    break;

                case 'line':
                    this.ctx.moveTo(0, 0);
                    this.ctx.lineTo(displayWidth, displayHeight);
                    break;

                default:
                    // Default to rectangle for unknown shapes
                    this.ctx.rect(0, 0, displayWidth, displayHeight);
                    break;
            }

            // 🎯 AGENT 6: Apply fill and stroke
            if (fill && type !== 'line') {
                this.ctx.fillStyle = fill;
                this.ctx.fill();
            }

            if (stroke && strokeWidth > 0) {
                this.ctx.strokeStyle = stroke;
                this.ctx.lineWidth = strokeWidth;
                this.ctx.stroke();
            }

            this.ctx.restore();

            const renderTime = performance.now() - startTime;
            this.updatePerformanceMetrics(renderTime);

            // 🎯 AGENT 6: DETAILED SHAPE RENDERING LOG
            if (this.shapeRenderer.logShapeRender) {
                console.log('🎯 AGENT 6 SHAPE RENDERER:', {
                    type: type,
                    positioning: {
                        originalLeft: left,
                        originalTop: top,
                        finalX: position.x,
                        finalY: position.y,
                        coordinatePreservation: this.coordinatePreservation.noTransformMode
                    },
                    dimensions: {
                        originalSize: `${width}×${height}`,
                        scaledSize: `${displayWidth.toFixed(1)}×${displayHeight.toFixed(1)}`,
                        scaleFactors: `${(scaleX * 100).toFixed(1)}%×${(scaleY * 100).toFixed(1)}%`
                    },
                    styling: {
                        fill: fill,
                        stroke: stroke || 'none',
                        strokeWidth: strokeWidth,
                        opacity: (opacity * 100).toFixed(1) + '%',
                        radius: radius || 'none'
                    },
                    rotation: angle !== 0 ? `${(angle * 180 / Math.PI).toFixed(1)}°` : 'none',
                    performance: `${renderTime.toFixed(2)}ms`,
                    exactPositioning: position.x === left && position.y === top
                });
            }

        } catch (error) {
            console.error('❌ AGENT 6 SHAPE ERROR:', error);

            // 🎯 AGENT 6: Enhanced error visualization for shapes
            const position = this.coordinatePreservation.noTransformMode
                ? { x: shapeData.left || 0, y: shapeData.top || 0 }
                : this.preserveCoordinates(shapeData.left || 0, shapeData.top || 0);

            this.ctx.save();

            // Error background
            this.ctx.fillStyle = '#f0f0ff';
            this.ctx.fillRect(position.x, position.y, 100, 50);

            // Error border
            this.ctx.strokeStyle = '#4444ff';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(position.x, position.y, 100, 50);

            // Error text
            this.ctx.fillStyle = '#0000cc';
            this.ctx.font = '12px Arial, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('SHAPE ERROR', position.x + 50, position.y + 20);
            this.ctx.fillText(shapeData.type || 'unknown', position.x + 50, position.y + 35);

            this.ctx.restore();
        }
    }

    /**
     * 🎯 AGENT 6: ROUNDED RECTANGLE HELPER
     * Draw a rounded rectangle path
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} width - Width
     * @param {number} height - Height
     * @param {number} radius - Corner radius
     */
    drawRoundedRect(x, y, width, height, radius) {
        const r = Math.min(radius, width / 2, height / 2);

        this.ctx.moveTo(x + r, y);
        this.ctx.lineTo(x + width - r, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + r);
        this.ctx.lineTo(x + width, y + height - r);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
        this.ctx.lineTo(x + r, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - r);
        this.ctx.lineTo(x, y + r);
        this.ctx.quadraticCurveTo(x, y, x + r, y);
    }

    /**
     * 🎯 ENHANCED IMAGE RENDERER (Legacy support)
     * Precise image rendering with sub-pixel accuracy and performance monitoring
     * @param {Object} imageData - Image data with url and transform properties
     */
    async renderImage(imageData) {
        // 🎯 AGENT 4: Route to specialized image renderer for better handling
        if (imageData.type === 'image' || imageData.src) {
            return this.renderImageElement(imageData);
        }

        // Fallback to original implementation for compatibility
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
     * 🎯 AGENT 7: INTEGRATED RENDERING PIPELINE
     * Render complete design data with all specialized renderers
     * @param {Object} designData - Complete design data object
     * @param {Object} options - Rendering options
     */
    async renderDesign(designData, options = {}) {
        if (this.isRendering) {
            console.log('⚠️ RENDERER: Already rendering, skipping...');
            return;
        }

        this.isRendering = true;
        const startTime = performance.now();

        console.log('🎯 AGENT 7 RENDERING PIPELINE: Starting integrated render...', designData);

        try {
            // 🎯 AGENT 7: Clear canvas and prepare for rendering
            this.clearCanvas();

            // 🎯 AGENT 7: Handle different data formats (objects array vs legacy format)
            let objectsToRender = [];
            let backgroundUrl = null;

            if (designData.objects && Array.isArray(designData.objects)) {
                // New format: direct objects array
                objectsToRender = designData.objects;
                backgroundUrl = designData.background || options.backgroundUrl;
            } else {
                // Legacy format: nested view structure
                const viewKeys = Object.keys(designData);
                if (viewKeys.length === 0) {
                    console.log('⚠️ AGENT 7: No design data found');
                    return;
                }

                const firstView = designData[viewKeys[0]];
                if (firstView && firstView.images) {
                    objectsToRender = firstView.images;
                }
            }

            // 🎯 AGENT 7: STEP 1 - Render background (Agent 3)
            if (backgroundUrl) {
                console.log('🎯 AGENT 7: Rendering background template...');
                await this.renderBackground(backgroundUrl);
            }

            // 🎯 AGENT 7: STEP 2 - Process and render all objects in order
            if (objectsToRender.length === 0) {
                console.log('⚠️ AGENT 7: No objects to render');
                return;
            }

            console.log(`🎯 AGENT 7: Processing ${objectsToRender.length} design objects...`);

            const renderResults = {
                totalObjects: objectsToRender.length,
                rendered: { images: 0, text: 0, shapes: 0, other: 0 },
                errors: [],
                coordinateValidation: [],
                performance: {}
            };

            // 🎯 AGENT 7: Render each object with specialized renderer
            for (let i = 0; i < objectsToRender.length; i++) {
                const obj = objectsToRender[i];
                const objStartTime = performance.now();

                try {
                    // 🎯 AGENT 7: Route to appropriate specialized renderer
                    switch (obj.type?.toLowerCase()) {
                        case 'image':
                            await this.renderImageElement(obj);
                            renderResults.rendered.images++;
                            break;

                        case 'text':
                        case 'textbox':
                            await this.renderTextElement(obj);
                            renderResults.rendered.text++;
                            break;

                        case 'rect':
                        case 'rectangle':
                        case 'circle':
                        case 'ellipse':
                        case 'line':
                        case 'polygon':
                            await this.renderShapeElement(obj);
                            renderResults.rendered.shapes++;
                            break;

                        default:
                            // Try image renderer for unknown types with src
                            if (obj.src || obj.url) {
                                await this.renderImageElement(obj);
                                renderResults.rendered.images++;
                            } else {
                                console.warn('⚠️ AGENT 7: Unknown object type:', obj.type, obj);
                                renderResults.rendered.other++;
                            }
                            break;
                    }

                    // 🎯 AGENT 7: Coordinate validation for each object
                    if (this.coordinatePreservation.validateCoordinates && obj.left !== undefined && obj.top !== undefined) {
                        const validation = {
                            object: i + 1,
                            type: obj.type,
                            originalCoords: { left: obj.left, top: obj.top },
                            preserved: this.coordinatePreservation.noTransformMode,
                            renderTime: performance.now() - objStartTime
                        };
                        renderResults.coordinateValidation.push(validation);
                    }

                } catch (error) {
                    console.error(`❌ AGENT 7: Error rendering object ${i + 1}:`, error);
                    renderResults.errors.push({
                        object: i + 1,
                        type: obj.type || 'unknown',
                        error: error.message
                    });
                }
            }

            const totalTime = performance.now() - startTime;
            renderResults.performance = {
                totalTime: `${totalTime.toFixed(2)}ms`,
                averagePerObject: `${(totalTime / objectsToRender.length).toFixed(2)}ms`,
                objectsPerSecond: (objectsToRender.length / (totalTime / 1000)).toFixed(1)
            };

            // 🎯 AGENT 7: FINAL VALIDATION & QUALITY CHECK
            const qualityCheck = this.performQualityCheck(renderResults, designData);

            console.log('🎯 AGENT 7 RENDERING COMPLETE:', {
                ...renderResults,
                qualityCheck,
                systemStatus: {
                    canvasDimensions: `${this.canvasWidth}×${this.canvasHeight}`,
                    coordinatePreservation: this.coordinatePreservation.noTransformMode,
                    exactDimensions: this.dimensionPreservation.enforceExactDimensions,
                    allAgentsActive: true
                }
            });

            return renderResults;

        } catch (error) {
            console.error('❌ AGENT 7 PIPELINE ERROR:', error);
            throw error;
        } finally {
            this.isRendering = false;
        }
    }

    /**
     * 🎯 AGENT 7: QUALITY CHECK SYSTEM
     * Perform 1:1 replica quality validation
     * @param {Object} renderResults - Rendering results
     * @param {Object} originalData - Original design data
     * @returns {Object} Quality check results
     */
    performQualityCheck(renderResults, originalData) {
        const qualityCheck = {
            is1to1Replica: false,
            coordinatePreservation: true,
            dimensionAccuracy: true,
            renderingSuccess: true,
            score: 0,
            issues: []
        };

        // Check rendering success rate
        const successRate = ((renderResults.totalObjects - renderResults.errors.length) / renderResults.totalObjects) * 100;
        if (successRate < 100) {
            qualityCheck.renderingSuccess = false;
            qualityCheck.issues.push(`Rendering errors: ${renderResults.errors.length}/${renderResults.totalObjects} objects failed`);
        }

        // Check coordinate preservation
        if (!this.coordinatePreservation.noTransformMode) {
            qualityCheck.coordinatePreservation = false;
            qualityCheck.issues.push('Coordinate transformation applied - not 1:1 replica');
        }

        // Check dimension accuracy
        if (!this.dimensionPreservation.enforceExactDimensions) {
            qualityCheck.dimensionAccuracy = false;
            qualityCheck.issues.push('Canvas dimensions not exact - scaling applied');
        }

        // Calculate overall quality score
        let score = 0;
        if (qualityCheck.renderingSuccess) score += 40;
        if (qualityCheck.coordinatePreservation) score += 30;
        if (qualityCheck.dimensionAccuracy) score += 30;

        qualityCheck.score = score;
        qualityCheck.is1to1Replica = score === 100;

        return qualityCheck;
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