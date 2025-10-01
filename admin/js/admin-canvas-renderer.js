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

        // 🎯 HIVE MIND: DESIGNER-OFFSET COMPENSATION
        // Designer adds Canvas-Container offset during capture (transformCoordinates)
        // Renderer must subtract this offset to achieve 1:1 alignment
        this.designerOffset = {
            x: 0,  // Will be extracted from design_data metadata or calculated
            y: 0,  // Will be extracted from design_data metadata or calculated
            detected: false,
            source: null  // 'metadata' or 'calculated' or 'default'
        };

        // 🎯 CANVAS DIMENSION SCALING COMPENSATION
        // Designer may capture on different canvas size (e.g., 1100×850 vs 780×580)
        // Renderer must scale coordinates to match current canvas dimensions
        this.canvasScaling = {
            scaleX: 1.0,  // Will be calculated from metadata.canvas_dimensions
            scaleY: 1.0,  // Will be calculated from metadata.canvas_dimensions
            detected: false,
            source: null,  // 'metadata' or 'heuristic' or 'none'
            originalDimensions: null,  // {width, height} from capture
            currentDimensions: null    // {width, height} for rendering
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

        // 🎯 AGENT 8: RENDERING STATISTICS for Self-Diagnostic System
        this.renderingStatistics = {
            renderedObjects: [],  // Track all successfully rendered objects
            errors: [],           // Track rendering errors
            startTime: null,
            endTime: null
        };
    }

    /**
     * Initialize the canvas renderer
     * @param {string} containerId - ID of the container element
     * @param {Object} options - Rendering options
     * @param {Object} options.canvasDimensions - Original canvas dimensions {width, height}
     */
    init(containerId, options = {}) {
        console.log('🎨 ADMIN RENDERER: Initializing canvas renderer...');

        // 🎯 FIX 7: Dynamic Canvas Dimension Detection
        // Use actual canvas dimensions from design_data to ensure coordinate space alignment
        if (options.canvasDimensions) {
            const originalWidth = options.canvasDimensions.width;
            const originalHeight = options.canvasDimensions.height;

            if (originalWidth && originalHeight && originalWidth > 0 && originalHeight > 0) {
                this.storedCanvasWidth = this.canvasWidth; // Store default for scaling calculation
                this.storedCanvasHeight = this.canvasHeight;
                this.canvasWidth = originalWidth;
                this.canvasHeight = originalHeight;

                console.log(`🎯 FIX 7: Using canvas dimensions from design data: ${originalWidth}×${originalHeight}`);
                console.log(`🎯 FIX 7: Previous default was: ${this.storedCanvasWidth}×${this.storedCanvasHeight}`);

                // Update dimension preservation tracking
                this.dimensionPreservation.originalWidth = originalWidth;
                this.dimensionPreservation.originalHeight = originalHeight;
            }
        }

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

        // Force block display to prevent inline layout issues
        this.canvas.style.display = 'block';
        this.canvas.style.margin = '0';

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
            // 🎯 AGENT 3: Check if this is a color (hex/rgb) or image URL
            const isColor = /^(#[0-9A-Fa-f]{3,8}|rgb|rgba|hsl|hsla)/i.test(templateUrl);

            if (isColor) {
                // 🎯 AGENT 9 FIX: Admin preview background override for white/light backgrounds
                let previewColor = templateUrl;
                const isWhiteOrLight = /^(#[fF]{3,6}|#[fF]{3,6}[fF]{2}|rgb\(255,\s*255,\s*255\)|rgba\(255,\s*255,\s*255,\s*[01]?\.?\d*\))$/i.test(templateUrl);

                if (isWhiteOrLight) {
                    // Replace white with preview-friendly light gray for visibility
                    previewColor = '#f0f0f0';
                    console.log('🎯 AGENT 9 BACKGROUND: Replaced white background with preview-friendly color', {
                        original: templateUrl,
                        preview: previewColor,
                        reason: 'White background makes white images invisible in admin preview'
                    });
                }

                // Render solid color background
                if (this.backgroundRenderer.logBackgroundRender) {
                    console.log('🎯 AGENT 3 BACKGROUND: Rendering solid color:', previewColor);
                }
                this.ctx.save();
                this.ctx.fillStyle = previewColor;
                this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
                this.ctx.restore();

                const renderTime = performance.now() - startTime;
                console.log(`🎯 AGENT 3 BACKGROUND: Color background rendered in ${renderTime.toFixed(2)}ms`);
                return;
            }

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
     * 🎯 HIVE MIND: DESIGNER-OFFSET EXTRACTION
     * Extracts offset values that Designer added during capture (transformCoordinates)
     * Designer adds canvasRect.left/top - containerRect.left/top to coordinates
     * Renderer must detect and compensate this offset for 1:1 alignment
     * @param {Object} designData - Design data with potential metadata.designer_offset
     */
    extractDesignerOffset(designData) {
        // Strategy 1: Check for explicit offset metadata (future-proof)
        if (designData.metadata && designData.metadata.designer_offset) {
            this.designerOffset.x = parseFloat(designData.metadata.designer_offset.x || 0);
            this.designerOffset.y = parseFloat(designData.metadata.designer_offset.y || 0);
            this.designerOffset.detected = true;
            this.designerOffset.source = 'metadata';
            console.log('🎯 HIVE MIND: Designer offset extracted from metadata:', this.designerOffset);
            return;
        }

        // Strategy 2: Calculate offset from canvas_info if available
        if (designData.canvas_info && designData.canvas_info.offset) {
            this.designerOffset.x = parseFloat(designData.canvas_info.offset.x || 0);
            this.designerOffset.y = parseFloat(designData.canvas_info.offset.y || 0);
            this.designerOffset.detected = true;
            this.designerOffset.source = 'canvas_info';
            console.log('🎯 HIVE MIND: Designer offset extracted from canvas_info:', this.designerOffset);
            return;
        }

        // Strategy 3: Heuristic detection based on coordinate patterns
        // If all elements have suspiciously similar offset patterns, detect it

        // 🎯 DEBUG: Log incoming data structure
        console.log('🎯 HIVE MIND DEBUG: extractDesignerOffset received data:', {
            hasObjects: !!designData.objects,
            hasElements: !!designData.elements,
            hasDesignData: !!designData.design_data,
            topLevelKeys: Object.keys(designData).slice(0, 5),
            dataPreview: JSON.stringify(designData).substring(0, 200) + '...'
        });

        // Extract elements from various data structures
        let elements = [];
        let dataStructure = 'unknown';

        // PATH 1: Try direct objects access first
        if (designData.objects && Array.isArray(designData.objects)) {
            console.log('🎯 EXTRACTION PATH 1: Found designData.objects');
            elements = designData.objects;
            dataStructure = 'direct.objects';
        }
        // PATH 2: Try direct elements access
        else if (designData.elements && Array.isArray(designData.elements)) {
            console.log('🎯 EXTRACTION PATH 2: Found designData.elements');
            elements = designData.elements;
            dataStructure = 'direct.elements';
        }
        // PATH 3: Try nested design_data structure (WooCommerce order format)
        else if (designData.design_data && designData.design_data.design_elements) {
            console.log('🎯 EXTRACTION PATH 3: Found nested design_data.design_elements');
            // Iterate through design_elements to find element_data
            const designElements = designData.design_data.design_elements;
            for (const itemKey in designElements) {
                console.log('🎯 PATH 3: Checking item:', itemKey);
                const item = designElements[itemKey];
                if (item.element_data && item.element_data.objects) {
                    console.log('✅ PATH 3: Found objects in item', itemKey);
                    elements = item.element_data.objects;
                    dataStructure = 'nested.design_elements';
                    break; // Use first item's objects
                }
            }
        }
        // PATH 4: Try view-based structure (transformed format)
        else {
            console.log('🎯 EXTRACTION PATH 4: Checking for view-based structure...');
            const viewKeys = Object.keys(designData);
            console.log('🎯 PATH 4: Top-level keys:', viewKeys);

            if (viewKeys.length > 0) {
                const firstViewKey = viewKeys[0];
                const firstView = designData[firstViewKey];

                console.log('🎯 PATH 4: Checking first view:', firstViewKey, {
                    hasImages: !!firstView?.images,
                    isArray: Array.isArray(firstView?.images)
                });

                if (firstView && firstView.images && Array.isArray(firstView.images)) {
                    console.log('✅ PATH 4: Found view-based images array');
                    elements = firstView.images;
                    dataStructure = 'view.images';
                }
            }
        }

        console.log('🎯 HIVE MIND DEBUG: Element extraction result:', {
            elementsFound: elements.length,
            dataStructure: dataStructure,
            sampleElement: elements[0] ? {
                left: elements[0].left || elements[0].transform?.left,
                top: elements[0].top || elements[0].transform?.top
            } : null
        });
        // Strategy 3: AGGRESSIVE HEURISTIC FOR LEGACY DATA
        if (elements.length > 0) {
            const sampleSize = Math.min(5, elements.length);
            const samples = elements.slice(0, sampleSize);
            // Support both direct coordinates and transform object
            const avgX = samples.reduce((sum, el) => sum + (el.x || el.left || el.transform?.left || 0), 0) / sampleSize;
            const avgY = samples.reduce((sum, el) => sum + (el.y || el.top || el.transform?.top || 0), 0) / sampleSize;

            console.log('🎯 HIVE MIND DEBUG: Heuristic calculation:', {
                sampleSize,
                avgX: avgX.toFixed(1),
                avgY: avgY.toFixed(1),
                sampleCoords: samples.map(el => ({
                    x: el.x || el.left || el.transform?.left,
                    y: el.y || el.top || el.transform?.top
                }))
            });

            // Check if this is legacy data (no metadata)
            const isLegacyData = !designData.metadata?.designer_offset &&
                                 (designData.metadata?.source === 'db_processed_views' ||
                                  !designData.metadata?.capture_version);

            // 🎯 HIVE MIND FIX: Smart threshold based on element count
            const xThreshold = elements.length === 1 ? 380 : 400;
            const yThreshold = elements.length === 1 ? 180 : 200;

            console.log('🎯 HIVE MIND: Legacy offset detection:', {
                isLegacyData,
                elementCount: elements.length,
                thresholds: { x: xThreshold, y: yThreshold },
                avgPosition: { x: avgX.toFixed(1), y: avgY.toFixed(1) },
                willTrigger: avgX > xThreshold || avgY > yThreshold,
                source: designData.metadata?.source
            });

            if (isLegacyData && (avgX > xThreshold || avgY > yThreshold)) {
                // Estimate offset based on typical canvas position (780×580)
                // Elements centered at ~390 suggest ~60px offset from container
                const estimatedOffsetX = Math.min(Math.max(avgX - 330, 0), 100);
                const estimatedOffsetY = Math.min(Math.max(avgY - 165, 0), 80);

                if (estimatedOffsetX > 20 || estimatedOffsetY > 20) {
                    this.designerOffset.x = estimatedOffsetX;
                    this.designerOffset.y = estimatedOffsetY;
                    this.designerOffset.detected = true;
                    this.designerOffset.source = 'heuristic_legacy_compensation';

                    console.log('🎯 HIVE MIND: Legacy offset detected:', {
                        isLegacyData,
                        elementCount: elements.length,
                        thresholds: { x: xThreshold, y: yThreshold },
                        avgPosition: { x: avgX.toFixed(1), y: avgY.toFixed(1) },
                        estimatedOffset: {
                            x: estimatedOffsetX.toFixed(1),
                            y: estimatedOffsetY.toFixed(1)
                        },
                        confidence: estimatedOffsetX > 40 || estimatedOffsetY > 40 ? 'HIGH' : 'MEDIUM'
                    });
                    return;
                }
            }

            // If heuristic inconclusive, log for debugging
            if (avgX > 40 && avgX < 200 && avgY > 40 && avgY < 200) {
                this.designerOffset.x = 0;
                this.designerOffset.y = 0;
                this.designerOffset.detected = false;
                this.designerOffset.source = 'heuristic_inconclusive';
                console.log('🎯 HIVE MIND: Designer offset heuristic inconclusive:', {
                    avgX: avgX.toFixed(1),
                    avgY: avgY.toFixed(1),
                    note: 'Coordinates suggest possible offset, but not confident enough to compensate'
                });
                return;
            }
        }

        // Strategy 4: Default - No offset compensation (safest for legacy data)
        this.designerOffset.x = 0;
        this.designerOffset.y = 0;
        this.designerOffset.detected = false;
        this.designerOffset.source = 'default_no_offset';
        console.log('🎯 HIVE MIND: No designer offset detected, using zero offset (safe default)');
    }

    /**
     * 🎯 CANVAS DIMENSION SCALING DETECTION
     * Detects if design was captured on different canvas dimensions
     * Calculates scaling factors to compensate for size mismatch
     * @param {Object} designData - Design data with potential metadata.canvas_dimensions
     */
    extractCanvasScaling(designData) {
        this.canvasScaling.currentDimensions = {
            width: this.canvasWidth,
            height: this.canvasHeight
        };

        // Strategy 1: Check for explicit canvas dimensions in metadata
        if (designData.metadata && designData.metadata.canvas_dimensions) {
            this.canvasScaling.originalDimensions = {
                width: parseInt(designData.metadata.canvas_dimensions.width),
                height: parseInt(designData.metadata.canvas_dimensions.height)
            };

            this.canvasScaling.scaleX = this.canvasWidth / this.canvasScaling.originalDimensions.width;
            this.canvasScaling.scaleY = this.canvasHeight / this.canvasScaling.originalDimensions.height;
            this.canvasScaling.detected = (
                this.canvasScaling.originalDimensions.width !== this.canvasWidth ||
                this.canvasScaling.originalDimensions.height !== this.canvasHeight
            );
            this.canvasScaling.source = 'metadata';

            console.log('🎯 CANVAS SCALING: Dimension mismatch detected from metadata:', {
                original: `${this.canvasScaling.originalDimensions.width}×${this.canvasScaling.originalDimensions.height}`,
                current: `${this.canvasWidth}×${this.canvasHeight}`,
                scaleX: this.canvasScaling.scaleX.toFixed(3),
                scaleY: this.canvasScaling.scaleY.toFixed(3)
            });
            return;
        }

        // Strategy 2: Heuristic detection for legacy data
        const elements = designData.objects || designData.elements || [];
        if (elements.length > 0) {
            // Multi-strategy heuristic detection for canvas size
            // Strategy 2a: Analyze element bounds (max X/Y values)
            let maxX = 0, maxY = 0;
            let avgX = 0, avgY = 0;

            for (const el of elements) {
                const x = el.left || el.x || 0;
                const y = el.top || el.y || 0;
                const width = (el.width || 0) * (el.scaleX || 1);
                const height = (el.height || 0) * (el.scaleY || 1);

                maxX = Math.max(maxX, x + width);
                maxY = Math.max(maxY, y + height);
                avgX += x;
                avgY += y;
            }

            avgX /= elements.length;
            avgY /= elements.length;

            // Strategy 2b: Check coordinate density patterns
            // Count elements in different quadrants to determine likely canvas size
            let confidence = 0;
            let estimatedWidth = this.canvasWidth;
            let estimatedHeight = this.canvasHeight;

            // Heuristic: Common canvas size 1100×850 (responsive mode)
            // Multiple detection criteria for higher confidence
            const criteria = {
                avgPositionHigh: avgX > 350 || avgY > 250,  // Average position suggests larger canvas
                maxBoundsExceed: maxX > 780 || maxY > 580,  // Element bounds exceed current canvas
                coordinateDensity: avgX > 400 || avgY > 300 // High coordinate values (50%+ of 780/580)
            };

            // Calculate confidence score
            if (criteria.maxBoundsExceed) confidence += 0.9;  // Strong indicator
            if (criteria.coordinateDensity) confidence += 0.6; // Medium indicator
            if (criteria.avgPositionHigh) confidence += 0.4;   // Weak indicator

            // If confidence > 0.5, assume larger canvas (1100×850)
            if (confidence > 0.5) {
                estimatedWidth = 1100;
                estimatedHeight = 850;
                this.canvasScaling.originalDimensions = { width: estimatedWidth, height: estimatedHeight };

                // 🎯 BUG FIX: BIDIRECTIONAL SCALING
                // Old logic: Always scale DOWN (780/1100 = 0.709)
                // New logic: Dynamic scaling based on current vs original
                this.canvasScaling.scaleX = this.canvasWidth / estimatedWidth;  // Could be UP or DOWN
                this.canvasScaling.scaleY = this.canvasHeight / estimatedHeight;
                this.canvasScaling.detected = true;
                this.canvasScaling.source = 'heuristic';

                console.log('🎯 CANVAS SCALING: Heuristic detection suggests different canvas size:', {
                    analysis: {
                        avgPosition: `${avgX.toFixed(0)}, ${avgY.toFixed(0)}`,
                        maxBounds: `${maxX.toFixed(0)}, ${maxY.toFixed(0)}`,
                        criteria: criteria,
                        confidence: confidence.toFixed(2)
                    },
                    estimatedOriginal: `${estimatedWidth}×${estimatedHeight}`,
                    current: `${this.canvasWidth}×${this.canvasHeight}`,
                    scaleX: this.canvasScaling.scaleX.toFixed(3),
                    scaleY: this.canvasScaling.scaleY.toFixed(3),
                    direction: this.canvasScaling.scaleX > 1 ? 'SCALE UP' : 'SCALE DOWN'
                });
                return;
            }
        }

        // Strategy 3: No scaling needed
        this.canvasScaling.scaleX = 1.0;
        this.canvasScaling.scaleY = 1.0;
        this.canvasScaling.detected = false;
        this.canvasScaling.source = 'none';
        this.canvasScaling.originalDimensions = this.canvasScaling.currentDimensions;
        console.log('🎯 CANVAS SCALING: No dimension mismatch detected, using 1:1 scaling');
    }

    /**
     * 🎯 AGENT 2: COORDINATE PRESERVATION - Zero-transformation coordinate system
     * Apply zero transformations to preserve exact original coordinates
     * 🎯 HIVE MIND: Now includes Designer-Offset compensation
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Object} options - Transform options
     * @returns {Object} Preserved coordinates with validation metadata
     */
    preserveCoordinates(x, y, options = {}) {
        // 🎯 AGENT 2: NO TRANSFORMATION MODE - Return exact coordinates
        if (this.coordinatePreservation.noTransformMode) {
            // 🎯 HIVE MIND: Apply Designer-Offset compensation
            // Designer added offset during capture, we subtract it during render
            let compensatedX = x - this.designerOffset.x;
            let compensatedY = y - this.designerOffset.y;

            // 🎯 CANVAS SCALING: Apply dimension scaling compensation
            // Designer may have captured on different canvas size, scale coordinates
            if (this.canvasScaling.detected) {
                compensatedX = compensatedX * this.canvasScaling.scaleX;
                compensatedY = compensatedY * this.canvasScaling.scaleY;
            }

            const result = {
                x: compensatedX, // EXACT preservation with offset + scaling compensation
                y: compensatedY, // EXACT preservation with offset + scaling compensation
                originalX: x,
                originalY: y,
                offsetCompensation: {
                    applied: this.designerOffset.detected,
                    offsetX: this.designerOffset.x,
                    offsetY: this.designerOffset.y,
                    source: this.designerOffset.source
                },
                scalingCompensation: {
                    applied: this.canvasScaling.detected,
                    scaleX: this.canvasScaling.scaleX,
                    scaleY: this.canvasScaling.scaleY,
                    source: this.canvasScaling.source,
                    originalCanvas: this.canvasScaling.originalDimensions,
                    currentCanvas: this.canvasScaling.currentDimensions
                },
                preservation: {
                    noTransformation: true,
                    exactCoordinates: true,
                    scaleApplied: this.canvasScaling.detected,
                    offsetCompensated: this.designerOffset.detected,
                    agent: 'AGENT_2_COORDINATE_PRESERVATION_WITH_HIVE_MIND_OFFSET_AND_SCALING'
                }
            };

            // 🎯 AGENT 2 + HIVE MIND: COORDINATE VALIDATION LOGGING
            if (this.coordinatePreservation.validateCoordinates) {
                console.log('🎯 AGENT 2 + HIVE MIND COORDINATE PRESERVATION:', {
                    input: `${x}, ${y}`,
                    designerOffset: `${this.designerOffset.x}, ${this.designerOffset.y}`,
                    output: `${result.x}, ${result.y}`,
                    offsetApplied: this.designerOffset.detected,
                    offsetSource: this.designerOffset.source,
                    transformation: 'NONE - 1:1 Replica Mode + Offset Compensation'
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

            // 🎯 AGENT 6 FIX: Ensure image is fully decoded before rendering
            try {
                await img.decode();
                console.log('🎯 AGENT 6 IMAGE DECODE: Image fully decoded and ready', {
                    src: (imageData.src || imageData.url).substring(0, 50) + '...',
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                    complete: img.complete
                });
            } catch (decodeError) {
                console.error('❌ AGENT 6 DECODE ERROR:', {
                    error: decodeError,
                    message: decodeError.message || 'Unknown decode error',
                    name: decodeError.name || 'Unknown',
                    code: decodeError.code || 'N/A',
                    src: (imageData.src || imageData.url).substring(0, 50) + '...'
                });
                // Continue anyway - image may still be usable
            }

            // 🎯 AGENT 4: Extract exact positioning from design data
            const left = imageData.left || 0;
            const top = imageData.top || 0;
            const scaleX = imageData.scaleX || 1;
            const scaleY = imageData.scaleY || 1;
            const angle = (imageData.angle || 0) * Math.PI / 180;

            // 🎯 AGENT 4: Apply coordinate preservation (no transformation)
            // 🎯 HIVE MIND: Apply offset compensation in noTransformMode
            // 🎯 CANVAS SCALING: Apply dimension scaling compensation
            let position;
            if (this.coordinatePreservation.noTransformMode) {
                let x = left - this.designerOffset.x;
                let y = top - this.designerOffset.y;

                // Apply canvas dimension scaling
                if (this.canvasScaling.detected) {
                    x = x * this.canvasScaling.scaleX;
                    y = y * this.canvasScaling.scaleY;
                }

                position = { x, y };
            } else {
                position = this.preserveCoordinates(left, top);
            }

            // 🎯 AGENT 9 COORDINATE VERIFICATION: Comprehensive coordinate tracking
            const coordinateVerification = {
                originalData: {
                    left: imageData.left,
                    top: imageData.top,
                    width: imageData.width,
                    height: imageData.height
                },
                extractedCoordinates: {
                    left: left,
                    top: top,
                    scaleX: scaleX,
                    scaleY: scaleY,
                    angle: angle
                },
                canvasRelativePosition: {
                    x: position.x,
                    y: position.y,
                    description: 'Position on 780×580 canvas'
                },
                physicalCanvasPosition: {
                    x: position.x * this.pixelRatio,
                    y: position.y * this.pixelRatio,
                    description: `Position on ${this.canvas.width}×${this.canvas.height} physical canvas (devicePixelRatio: ${this.pixelRatio})`
                },
                imageInfo: {
                    src: (imageData.src || imageData.url).substring(0, 80) + '...',
                    naturalSize: `${img.naturalWidth}×${img.naturalHeight}`
                },
                coordinatePreservationMode: {
                    noTransformMode: this.coordinatePreservation.noTransformMode,
                    preserveOriginalCoords: this.coordinatePreservation.preserveOriginalCoords
                }
            };

            console.log('🎯 AGENT 9 COORDINATE VERIFICATION:', coordinateVerification);

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
            // 🎯 CANVAS SCALING: Apply dimension scaling to display size
            let displayWidth = baseWidth * scaleX;
            let displayHeight = baseHeight * scaleY;

            if (this.canvasScaling.detected) {
                displayWidth = displayWidth * this.canvasScaling.scaleX;
                displayHeight = displayHeight * this.canvasScaling.scaleY;
            }

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

            // 🎯 AGENT 6: PRE-RENDER DIAGNOSTICS - Verify all parameters before drawImage()
            const preRenderDiagnostics = {
                imageState: {
                    complete: img.complete,
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                    hasValidDimensions: img.naturalWidth > 0 && img.naturalHeight > 0,
                    src: (imageData.src || imageData.url).substring(0, 50) + '...'
                },
                canvasContext: {
                    isValid: !!this.ctx,
                    hasDrawImage: typeof this.ctx.drawImage === 'function',
                    currentTransform: this.ctx.getTransform ? this.ctx.getTransform() : 'unavailable'
                },
                renderParameters: {
                    position: { x: 0, y: 0 },
                    dimensions: { width: displayWidth, height: displayHeight },
                    allFinite: isFinite(displayWidth) && isFinite(displayHeight),
                    allPositive: displayWidth > 0 && displayHeight > 0
                }
            };

            console.log('🎯 AGENT 6 PRE-RENDER DIAGNOSTICS:', preRenderDiagnostics);

            // 🎯 AGENT 6: Verify critical conditions before drawing
            if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
                console.error('❌ AGENT 6 PRE-RENDER VALIDATION FAILED: Image not ready for rendering', preRenderDiagnostics);
                throw new Error('Image not ready: complete=' + img.complete + ', naturalWidth=' + img.naturalWidth);
            }

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

            // 🎯 AGENT 8: Track successfully rendered object for Self-Diagnostic System
            if (isEffectivelyVisible) {
                this.renderingStatistics.renderedObjects.push({
                    type: 'image',
                    id: imageData.id,
                    left: position.x,
                    top: position.y,
                    actualLeft: position.x,
                    actualTop: position.y,
                    width: displayWidth,
                    height: displayHeight,
                    actualWidth: displayWidth,
                    actualHeight: displayHeight,
                    scaleX: scaleX,
                    scaleY: scaleY,
                    actualScaleX: scaleX,
                    actualScaleY: scaleY,
                    angle: angle * 180 / Math.PI,
                    actualAngle: angle * 180 / Math.PI,
                    renderSuccess: true,
                    renderTime: renderTime
                });
            }

        } catch (error) {
            // 🎯 AGENT 6 FIX: ENHANCED ERROR LOGGING - Extract all DOMException details
            console.error('❌ AGENT 6 IMAGE RENDER ERROR - ENHANCED DIAGNOSTICS:', {
                // Error object details
                errorObject: error,
                errorType: error.constructor.name,
                errorName: error.name || 'Unknown',
                errorMessage: error.message || 'No message available',
                errorCode: error.code || 'No code',
                errorStack: error.stack || 'No stack trace',

                // DOMException specific properties
                isDOMException: error instanceof DOMException,
                DOMSTRING: error.DOMSTRING || 'N/A',

                // Image data context
                imageContext: {
                    src: (imageData.src || imageData.url) ? (imageData.src || imageData.url).substring(0, 100) : 'No src',
                    type: imageData.type || 'unknown',
                    left: imageData.left,
                    top: imageData.top,
                    scaleX: imageData.scaleX,
                    scaleY: imageData.scaleY,
                    angle: imageData.angle
                },

                // Additional error serialization attempts
                errorKeys: Object.keys(error),
                errorValues: Object.getOwnPropertyNames(error).reduce((acc, key) => {
                    try {
                        acc[key] = error[key];
                    } catch (e) {
                        acc[key] = 'Unable to access';
                    }
                    return acc;
                }, {}),

                // Error toString
                errorString: error.toString(),

                // JSON serialization attempt
                errorJSON: (() => {
                    try {
                        return JSON.stringify(error);
                    } catch (e) {
                        return 'Cannot JSON stringify: ' + e.message;
                    }
                })()
            });

            // 🎯 AGENT 4: Enhanced error visualization
            // 🎯 HIVE MIND: Apply offset compensation in noTransformMode
            const position = this.coordinatePreservation.noTransformMode
                ? { x: (imageData.left || 0) - this.designerOffset.x, y: (imageData.top || 0) - this.designerOffset.y }
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

            // 🎯 AGENT 8: Track rendering error for Self-Diagnostic System
            this.renderingStatistics.errors.push({
                type: 'image',
                id: imageData.id,
                error: error.message || 'Unknown error',
                errorType: error.name || 'Error'
            });
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
            let fontSize = (textData.fontSize || 16) * scaleY; // Scale font size

            // 🎯 CANVAS SCALING: Apply dimension scaling to font size
            if (this.canvasScaling.detected) {
                fontSize = fontSize * this.canvasScaling.scaleY;
            }

            const fontWeight = textData.fontWeight || 'normal';
            const fontStyle = textData.fontStyle || 'normal';
            const textAlign = textData.textAlign || 'left';

            // 🎯 AGENT 5: Color properties
            const fill = textData.fill || '#000000';
            const stroke = textData.stroke || null;
            const strokeWidth = textData.strokeWidth || 0;

            // 🎯 AGENT 5: Apply coordinate preservation (no transformation)
            // 🎯 HIVE MIND: Apply offset compensation in noTransformMode
            // 🎯 CANVAS SCALING: Apply dimension scaling compensation
            let position;
            if (this.coordinatePreservation.noTransformMode) {
                let x = left - this.designerOffset.x;
                let y = top - this.designerOffset.y;

                // Apply canvas dimension scaling
                if (this.canvasScaling.detected) {
                    x = x * this.canvasScaling.scaleX;
                    y = y * this.canvasScaling.scaleY;
                }

                position = { x, y };
            } else {
                position = this.preserveCoordinates(left, top);
            }

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

            // Apply scaling with canvas dimension scaling
            let finalScaleX = scaleX;
            let finalScaleY = scaleY;

            // 🎯 CANVAS SCALING: Apply dimension scaling to element scale
            if (this.canvasScaling.detected) {
                finalScaleX = scaleX * this.canvasScaling.scaleX;
                finalScaleY = scaleY * this.canvasScaling.scaleY;
            }

            this.ctx.scale(finalScaleX, finalScaleY);

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
            // 🎯 HIVE MIND: Apply offset compensation in noTransformMode
            const position = this.coordinatePreservation.noTransformMode
                ? { x: (textData.left || 0) - this.designerOffset.x, y: (textData.top || 0) - this.designerOffset.y }
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
            // 🎯 HIVE MIND: Apply offset compensation in noTransformMode
            // 🎯 CANVAS SCALING: Apply dimension scaling compensation
            let position;
            if (this.coordinatePreservation.noTransformMode) {
                let x = left - this.designerOffset.x;
                let y = top - this.designerOffset.y;

                // Apply canvas dimension scaling
                if (this.canvasScaling.detected) {
                    x = x * this.canvasScaling.scaleX;
                    y = y * this.canvasScaling.scaleY;
                }

                position = { x, y };
            } else {
                position = this.preserveCoordinates(left, top);
            }

            // 🎯 AGENT 6: Calculate exact dimensions with preserved scaling
            // 🎯 CANVAS SCALING: Apply dimension scaling to display size
            let displayWidth = width * scaleX;
            let displayHeight = height * scaleY;

            if (this.canvasScaling.detected) {
                displayWidth = displayWidth * this.canvasScaling.scaleX;
                displayHeight = displayHeight * this.canvasScaling.scaleY;
            }

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
            // 🎯 HIVE MIND: Apply offset compensation in noTransformMode
            const position = this.coordinatePreservation.noTransformMode
                ? { x: (shapeData.left || 0) - this.designerOffset.x, y: (shapeData.top || 0) - this.designerOffset.y }
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
            // 🎯 AGENT 3: ENHANCED COMPATIBILITY FIX - Robust nested transform extraction
            // Handle multiple data structure formats with detailed logging

            // STEP 1: Extract image URL from multiple possible locations
            const imageUrl = imageData.url || imageData.src;
            if (!imageUrl) {
                console.error('❌ AGENT 3 RENDER ERROR: No image URL found', {
                    imageData: imageData,
                    hasUrl: !!imageData.url,
                    hasSrc: !!imageData.src,
                    keys: Object.keys(imageData)
                });
                throw new Error('Image URL missing - neither url nor src property found');
            }

            console.log('🎯 AGENT 3 COORDINATE EXTRACTION: Starting deep extraction...', {
                id: imageData.id,
                dataStructure: {
                    hasUrl: !!imageData.url,
                    hasSrc: !!imageData.src,
                    hasLeft: imageData.left !== undefined,
                    hasTop: imageData.top !== undefined,
                    hasTransformObj: !!imageData.transform,
                    transformKeys: imageData.transform ? Object.keys(imageData.transform) : []
                }
            });

            const img = await this.loadImage(imageUrl);

            // 🎯 AGENT 3: STEP 2 - Deep extraction from nested transform object
            // Extract transform object if it exists
            const transform = imageData.transform || {};

            // ENHANCED: Try multiple extraction strategies in priority order
            // Strategy 1: Direct flat properties (highest priority)
            // Strategy 2: Nested transform object properties
            // Strategy 3: Default values (fallback)

            let left, top, scaleX, scaleY, angle;

            // Extract LEFT coordinate with detailed logging
            if (imageData.left !== undefined) {
                left = imageData.left;
                console.log('🎯 AGENT 3: LEFT from flat property:', left);
            } else if (transform.left !== undefined) {
                left = transform.left;
                console.log('🎯 AGENT 3: LEFT from transform.left:', left);
            } else {
                left = 0;
                console.warn('⚠️ AGENT 3: LEFT defaulted to 0 - no source found');
            }

            // Extract TOP coordinate with detailed logging
            if (imageData.top !== undefined) {
                top = imageData.top;
                console.log('🎯 AGENT 3: TOP from flat property:', top);
            } else if (transform.top !== undefined) {
                top = transform.top;
                console.log('🎯 AGENT 3: TOP from transform.top:', top);
            } else {
                top = 0;
                console.warn('⚠️ AGENT 3: TOP defaulted to 0 - no source found');
            }

            // Extract SCALEX with detailed logging
            if (imageData.scaleX !== undefined) {
                scaleX = imageData.scaleX;
                console.log('🎯 AGENT 3: SCALEX from flat property:', scaleX);
            } else if (transform.scaleX !== undefined) {
                scaleX = transform.scaleX;
                console.log('🎯 AGENT 3: SCALEX from transform.scaleX:', scaleX);
            } else {
                scaleX = 1;
                console.warn('⚠️ AGENT 3: SCALEX defaulted to 1 - no source found');
            }

            // Extract SCALEY with detailed logging
            if (imageData.scaleY !== undefined) {
                scaleY = imageData.scaleY;
                console.log('🎯 AGENT 3: SCALEY from flat property:', scaleY);
            } else if (transform.scaleY !== undefined) {
                scaleY = transform.scaleY;
                console.log('🎯 AGENT 3: SCALEY from transform.scaleY:', scaleY);
            } else {
                scaleY = 1;
                console.warn('⚠️ AGENT 3: SCALEY defaulted to 1 - no source found');
            }

            // Extract ANGLE with detailed logging
            let angleSource;
            if (imageData.angle !== undefined) {
                angleSource = imageData.angle;
                console.log('🎯 AGENT 3: ANGLE from flat property:', angleSource);
            } else if (transform.angle !== undefined) {
                angleSource = transform.angle;
                console.log('🎯 AGENT 3: ANGLE from transform.angle:', angleSource);
            } else {
                angleSource = 0;
                console.log('🎯 AGENT 3: ANGLE defaulted to 0');
            }
            angle = angleSource * Math.PI / 180; // Convert to radians

            // 🎯 AGENT 3: COMPREHENSIVE EXTRACTION LOG
            console.log('🎯 AGENT 3 EXTRACTION COMPLETE:', {
                id: imageData.id,
                url: imageUrl.substring(0, 50) + '...',
                extractionSources: {
                    left: imageData.left !== undefined ? 'flat' : (transform.left !== undefined ? 'nested' : 'default'),
                    top: imageData.top !== undefined ? 'flat' : (transform.top !== undefined ? 'nested' : 'default'),
                    scaleX: imageData.scaleX !== undefined ? 'flat' : (transform.scaleX !== undefined ? 'nested' : 'default'),
                    scaleY: imageData.scaleY !== undefined ? 'flat' : (transform.scaleY !== undefined ? 'nested' : 'default'),
                    angle: imageData.angle !== undefined ? 'flat' : (transform.angle !== undefined ? 'nested' : 'default')
                },
                extractedValues: {
                    left: left,
                    top: top,
                    scaleX: scaleX,
                    scaleY: scaleY,
                    angleDegrees: angleSource,
                    angleRadians: angle
                },
                validationFlags: {
                    hasValidCoords: left !== undefined && top !== undefined,
                    hasValidScale: scaleX > 0 && scaleY > 0,
                    allExtracted: left !== 0 || top !== 0 || scaleX !== 1 || scaleY !== 1
                }
            });

            // 🎯 AGENT 3: STEP 3 - Validate extracted coordinates before rendering
            if (!isFinite(left) || !isFinite(top) || isNaN(left) || isNaN(top)) {
                console.error('❌ AGENT 3 VALIDATION FAILED: Invalid coordinates extracted', {
                    left: left,
                    top: top,
                    scaleX: scaleX,
                    scaleY: scaleY
                });
                throw new Error('Invalid coordinates - cannot render with NaN or Infinity values');
            }

            // 🎯 AGENT 3: STEP 4 - Apply coordinate preservation mode
            // Use exact extracted coordinates without transformation
            let renderX, renderY;

            if (this.coordinatePreservation.noTransformMode) {
                // NO TRANSFORM MODE: Use exact extracted coordinates
                // 🎯 HIVE MIND: Apply designer offset compensation
                renderX = left - this.designerOffset.x;
                renderY = top - this.designerOffset.y;
                console.log('🎯 AGENT 3 + HIVE MIND: Using NO-TRANSFORM mode with offset compensation:', {
                    originalX: left,
                    originalY: top,
                    offsetX: this.designerOffset.x,
                    offsetY: this.designerOffset.y,
                    renderX,
                    renderY
                });
            } else {
                // LEGACY TRANSFORM MODE: Apply coordinate transformation
                const cacheKey = `${imageData.id}_${left}_${top}`;
                const pos = this.getCachedTransform(cacheKey, { left, top });
                renderX = pos.x;
                renderY = pos.y;
                console.log('🎯 AGENT 3: Using TRANSFORM mode - scaled coordinates:', { renderX, renderY });
            }

            // 🎯 AGENT 3: STEP 5 - Calculate image dimensions with extracted scaling
            const baseWidth = img.naturalWidth || img.width;
            const baseHeight = img.naturalHeight || img.height;

            // Apply extracted scale factors to get final display size
            const displayWidth = baseWidth * scaleX;
            const displayHeight = baseHeight * scaleY;

            console.log('🎯 AGENT 3 DIMENSION CALCULATION:', {
                baseSize: `${baseWidth}×${baseHeight}`,
                extractedScale: `${scaleX}×${scaleY}`,
                finalDisplay: `${displayWidth.toFixed(1)}×${displayHeight.toFixed(1)}`,
                renderPosition: `${renderX.toFixed(1)}, ${renderY.toFixed(1)}`
            });

            // 🎯 AGENT 3: STEP 6 - Validate dimensions before rendering
            if (!displayWidth || !displayHeight || displayWidth <= 0 || displayHeight <= 0 ||
                !isFinite(displayWidth) || !isFinite(displayHeight)) {
                console.error('❌ AGENT 3 DIMENSION VALIDATION FAILED:', {
                    displayWidth, displayHeight, baseWidth, baseHeight, scaleX, scaleY
                });
                throw new Error('Invalid dimensions calculated - cannot render');
            }

            // Performance check: Start transform timing
            const transformStart = performance.now();

            // Save context state
            this.ctx.save();

            // 🎯 AGENT 3: STEP 7 - Apply transformations using extracted coordinates
            // Translate to the EXACT extracted position
            this.ctx.translate(renderX, renderY);

            if (angle !== 0) {
                this.ctx.rotate(angle);
                console.log('🎯 AGENT 3: Rotation applied:', (angle * 180 / Math.PI).toFixed(1) + '°');
            }

            // Apply image smoothing for better quality
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';

            // 🎯 AGENT 3: CRITICAL FIX - Use TOP-LEFT origin rendering (not centered)
            // The extracted coordinates are already top-left position
            // DO NOT use center-based rendering like fabric.js
            console.log('🎯 AGENT 3 RENDERING: Drawing image at TOP-LEFT origin (0,0) with dimensions:', {
                width: displayWidth.toFixed(1),
                height: displayHeight.toFixed(1)
            });

            this.ctx.drawImage(
                img,
                0, 0,  // TOP-LEFT origin - matches extracted coordinates
                displayWidth,
                displayHeight
            );

            // Restore context state
            this.ctx.restore();

            const transformTime = performance.now() - transformStart;
            const totalTime = performance.now() - startTime;

            // 🎯 PERFORMANCE TRACKING: Update metrics
            this.updatePerformanceMetrics(totalTime);

            // 🎯 AGENT 3: STEP 8 - Success logging with extraction details
            console.log('✅ AGENT 3 IMAGE RENDER SUCCESS:', {
                id: imageData.id,
                url: imageUrl.substring(0, 50) + '...',
                extraction: {
                    leftSource: imageData.left !== undefined ? 'flat' : 'nested',
                    topSource: imageData.top !== undefined ? 'flat' : 'nested',
                    coordinatesExtracted: { left, top },
                    scalesExtracted: { scaleX, scaleY },
                    angleExtracted: angleSource + '°'
                },
                rendering: {
                    position: `${renderX.toFixed(2)}, ${renderY.toFixed(2)}`,
                    dimensions: `${displayWidth.toFixed(1)}×${displayHeight.toFixed(1)}`,
                    coordinateMode: this.coordinatePreservation.noTransformMode ? 'NO-TRANSFORM' : 'TRANSFORM',
                    renderOrigin: 'TOP-LEFT'
                },
                validation: {
                    coordsValid: isFinite(left) && isFinite(top),
                    dimsValid: displayWidth > 0 && displayHeight > 0,
                    scaleValid: scaleX > 0 && scaleY > 0,
                    canvasVisible: renderX < this.canvasWidth && renderY < this.canvasHeight
                },
                performance: {
                    totalTime: `${totalTime.toFixed(2)}ms`,
                    transformTime: `${transformTime.toFixed(2)}ms`,
                    status: totalTime < 5 ? 'FAST' : 'SLOW'
                }
            });

            // Performance warning if too slow
            if (totalTime > 5) {
                console.warn('⚠️ AGENT 3 PERFORMANCE WARNING: Slow render detected', {
                    time: `${totalTime.toFixed(2)}ms`,
                    id: imageData.id,
                    threshold: '5ms'
                });
            }

            // Canvas bounds warning
            if (renderX > this.canvasWidth || renderY > this.canvasHeight) {
                console.warn('⚠️ AGENT 3 POSITION WARNING: Image may be outside canvas bounds', {
                    renderPosition: `${renderX.toFixed(1)}, ${renderY.toFixed(1)}`,
                    canvasSize: `${this.canvasWidth}×${this.canvasHeight}`,
                    imageSize: `${displayWidth.toFixed(1)}×${displayHeight.toFixed(1)}`,
                    id: imageData.id
                });
            }

        } catch (error) {
            console.error('❌ AGENT 3 RENDER ERROR:', {
                id: imageData.id,
                error: error.message,
                stack: error.stack,
                imageData: {
                    hasUrl: !!imageData.url,
                    hasSrc: !!imageData.src,
                    hasLeft: imageData.left !== undefined,
                    hasTop: imageData.top !== undefined,
                    hasTransform: !!imageData.transform,
                    transformKeys: imageData.transform ? Object.keys(imageData.transform) : []
                }
            });

            // Draw enhanced error placeholder with nested property support
            let errorX = 0, errorY = 0;

            // Try to extract position for error indicator from nested transform
            if (imageData.left !== undefined) {
                errorX = imageData.left;
            } else if (imageData.transform?.left !== undefined) {
                errorX = imageData.transform.left;
            }

            if (imageData.top !== undefined) {
                errorY = imageData.top;
            } else if (imageData.transform?.top !== undefined) {
                errorY = imageData.transform.top;
            }

            console.log('🎯 AGENT 3 ERROR INDICATOR: Positioning at:', { errorX, errorY });

            this.ctx.save();

            // Error indicator with better visibility
            this.ctx.fillStyle = '#ff4444';
            this.ctx.fillRect(errorX - 15, errorY - 15, 30, 30);

            // Error border
            this.ctx.strokeStyle = '#cc0000';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(errorX - 15, errorY - 15, 30, 30);

            // Error text
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px Arial, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('ERR', errorX, errorY + 4);

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

        // 🎯 AGENT 6: Start performance monitoring
        window.hiveMindMonitor?.startRender();

        console.log('🎯 AGENT 7 RENDERING PIPELINE: Starting integrated render...', designData);

        // 🎯 FIX 7: Update canvas dimensions from design data if provided
        if (options.canvasDimensions) {
            const { width, height } = options.canvasDimensions;
            if (width && height && width > 0 && height > 0) {
                if (this.canvasWidth !== width || this.canvasHeight !== height) {
                    console.log(`🎯 FIX 7: Updating canvas dimensions from ${this.canvasWidth}×${this.canvasHeight} to ${width}×${height}`);
                    this.canvasWidth = width;
                    this.canvasHeight = height;
                    this.dimensionPreservation.originalWidth = width;
                    this.dimensionPreservation.originalHeight = height;

                    // Recalculate scale factors for display
                    const displayWidth = parseInt(this.canvas.style.width) || width;
                    const displayHeight = parseInt(this.canvas.style.height) || height;
                    this.scaleX = displayWidth / this.canvasWidth;
                    this.scaleY = displayHeight / this.canvasHeight;

                    console.log(`🎯 FIX 7: Updated scale factors: scaleX=${this.scaleX.toFixed(4)}, scaleY=${this.scaleY.toFixed(4)}`);
                }
            }
        }

        // 🎯 AGENT 8: Reset rendering statistics for new render
        this.renderingStatistics = {
            renderedObjects: [],
            errors: [],
            startTime: startTime,
            endTime: null
        };

        // 🎯 HIVE MIND: Extract Designer-Offset from design_data metadata
        this.extractDesignerOffset(designData);

        // 🎯 CANVAS SCALING: Extract canvas dimension scaling from metadata
        this.extractCanvasScaling(designData);

        // 🎯 AGENT 8: Initialize Design Fidelity Comparator
        const fidelityComparator = new DesignFidelityComparator(designData);
        console.log('🎯 AGENT 8: Original Design Metrics:', fidelityComparator.original);

        try {
            // 🎯 AGENT 7: Clear canvas and prepare for rendering
            this.clearCanvas();

            // 🎯 AGENT 7: Handle different data formats (objects array vs legacy format)
            let objectsToRender = [];
            let backgroundUrl = null;

            if (designData.objects && Array.isArray(designData.objects)) {
                // New format: direct objects array
                objectsToRender = designData.objects;
                backgroundUrl = designData.background || designData.mockup_url || options.backgroundUrl;
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
                    backgroundUrl = firstView.background || firstView.mockup_url || options.backgroundUrl;
                }
            }

            // 🎨 AGENT 7: LOG BACKGROUND URL FOR DEBUGGING
            console.log('🎨 AGENT 7: Background URL extracted:', backgroundUrl || 'NO BACKGROUND URL FOUND');

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

            // 🎯 AGENT 8: Mark rendering complete
            this.renderingStatistics.endTime = performance.now();

            // 🎯 AGENT 8: Capture rendered state and compare
            console.log('🎯 AGENT 8: Capturing rendered state...');
            fidelityComparator.captureRenderedState(this.canvas, this);

            const fidelityReport = fidelityComparator.compareDesignFidelity();
            console.log('🎯 AGENT 8: DESIGN FIDELITY REPORT:', fidelityReport);

            if (!fidelityReport.success) {
                console.error('❌ AGENT 8: DESIGN FIDELITY ISSUES DETECTED:');
                fidelityReport.issues.forEach(issue => {
                    console.error(`  ❌ ${issue.type}:`, issue);
                });
            }

            // 🎯 AGENT 7: FINAL VALIDATION & QUALITY CHECK
            const qualityCheck = this.performQualityCheck(renderResults, designData, fidelityReport);

            // 🎯 AGENT 6: End performance monitoring and record fidelity score
            window.hiveMindMonitor?.endRender();
            window.hiveMindMonitor?.recordFidelityScore(qualityCheck.fidelityScore);

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
     * 🎯 AGENT 7+8: QUALITY CHECK SYSTEM
     * Perform 1:1 replica quality validation with AGENT 8 fidelity scoring
     * @param {Object} renderResults - Rendering results
     * @param {Object} originalData - Original design data
     * @param {Object} fidelityReport - AGENT 8 fidelity report
     * @returns {Object} Quality check results
     */
    performQualityCheck(renderResults, originalData, fidelityReport = null) {
        const qualityCheck = {
            is1to1Replica: false,
            coordinatePreservation: true,
            dimensionAccuracy: true,
            renderingSuccess: true,
            fidelityScore: 0,
            fidelityIssues: [],
            score: 0,
            issues: []
        };

        // 🎯 AGENT 8: Use fidelity report if available
        if (fidelityReport) {
            qualityCheck.fidelityScore = fidelityReport.fidelityScore;
            qualityCheck.fidelityIssues = fidelityReport.issues;
            qualityCheck.is1to1Replica = fidelityReport.fidelityScore === 100;
            qualityCheck.score = fidelityReport.fidelityScore;

            // Add fidelity issues to main issues list
            if (fidelityReport.issues.length > 0) {
                qualityCheck.issues.push(...fidelityReport.issues.map(issue =>
                    `${issue.type}: ${issue.message || JSON.stringify(issue)}`
                ));
            }
        } else {
            // Legacy quality check (fallback if AGENT 8 not available)
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
        }

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

/**
 * 🎯 DESIGN FIDELITY COMPARATOR
 * Extracts and compares metrics between original design data and rendered output
 * Part of the 7-Agent Canvas Rendering System
 */
class DesignFidelityComparator {
    constructor(originalDesignData) {
        this.original = this.extractOriginalMetrics(originalDesignData);
        this.rendered = null;
    }

    extractOriginalMetrics(designData) {
        return {
            canvas: {
                width: designData.canvas?.width || 780,
                height: designData.canvas?.height || 580,
                aspectRatio: (designData.canvas?.width || 780) / (designData.canvas?.height || 580)
            },
            background: {
                url: designData.background || designData.mockup_url || null,
                expected: !!(designData.background || designData.mockup_url)
            },
            elements: this.extractElementMetrics(designData),
            timestamp: Date.now(),
            source: 'original_design_data'
        };
    }

    extractElementMetrics(designData) {
        const elements = [];
        const objects = designData.objects || this.flattenElements(designData);

        objects.forEach((obj, index) => {
            elements.push({
                index: index,
                type: obj.type || 'image',
                id: obj.id,
                position: {
                    left: obj.left || obj.x || 0,
                    top: obj.top || obj.y || 0
                },
                dimensions: {
                    width: obj.width || 0,
                    height: obj.height || 0
                },
                transform: {
                    scaleX: obj.scaleX || 1,
                    scaleY: obj.scaleY || 1,
                    angle: obj.angle || 0
                },
                src: obj.src || obj.url || null
            });
        });

        return elements;
    }

    flattenElements(designData) {
        // Handle nested view structure
        const viewKeys = Object.keys(designData);
        if (viewKeys.length === 0) return [];

        const firstView = designData[viewKeys[0]];
        if (firstView && firstView.images) {
            return firstView.images;
        }

        return [];
    }

    /**
     * 🎯 AGENT 2: RENDERED STATE CAPTURE SPECIALIST
     * Capture the current rendered state of the canvas
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {AdminCanvasRenderer} canvasRenderer - Canvas renderer instance
     * @returns {Object} Captured rendered state
     */
    captureRenderedState(canvas, canvasRenderer) {
        this.rendered = {
            canvas: this.captureCanvasMetrics(canvas),
            background: this.captureBackgroundState(canvas),
            elements: this.captureRenderedElements(canvasRenderer),
            timestamp: Date.now(),
            source: 'rendered_canvas_state'
        };

        return this.rendered;
    }

    /**
     * 🎯 AGENT 2: CANVAS METRICS CAPTURE
     * Capture canvas dimensions, styling, and viewport information
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @returns {Object} Canvas metrics
     */
    captureCanvasMetrics(canvas) {
        const rect = canvas.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(canvas);
        const container = canvas.parentElement;
        const containerStyle = window.getComputedStyle(container);

        return {
            width: canvas.width / (window.devicePixelRatio || 1),
            height: canvas.height / (window.devicePixelRatio || 1),
            aspectRatio: (canvas.width / (window.devicePixelRatio || 1)) /
                        (canvas.height / (window.devicePixelRatio || 1)),

            styleWidth: parseInt(canvas.style.width) || rect.width,
            styleHeight: parseInt(canvas.style.height) || rect.height,

            visible: rect.width > 0 && rect.height > 0,
            inViewport: rect.top < window.innerHeight && rect.bottom > 0,

            containerFlex: containerStyle.display === 'flex',
            containerMinHeight: parseInt(containerStyle.minHeight) || 0
        };
    }

    /**
     * 🎯 AGENT 2 + FIX 5: BACKGROUND STATE CAPTURE (Multi-Region Sampling)
     * Capture background rendering state by sampling multiple canvas regions
     * Samples 5 regions (corners + center) to avoid false positives from logos positioned away from origin
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @returns {Object} Background state with region details
     */
    captureBackgroundState(canvas) {
        const ctx = canvas.getContext('2d');
        const sampleSize = 20; // Sample 20×20 pixels per region

        // Define 5 sampling regions: corners + center
        const regions = [
            { x: 0, y: 0, name: 'top-left' }, // Top-left corner
            { x: canvas.width - sampleSize, y: 0, name: 'top-right' }, // Top-right corner
            { x: Math.floor((canvas.width - sampleSize) / 2), y: Math.floor((canvas.height - sampleSize) / 2), name: 'center' }, // Center
            { x: 0, y: canvas.height - sampleSize, name: 'bottom-left' }, // Bottom-left corner
            { x: canvas.width - sampleSize, y: canvas.height - sampleSize, name: 'bottom-right' } // Bottom-right corner
        ];

        let totalWhitePixels = 0;
        let totalSampledPixels = 0;
        const regionResults = [];

        regions.forEach(region => {
            // Ensure sampling region is within canvas bounds
            const x = Math.max(0, Math.min(region.x, canvas.width - sampleSize));
            const y = Math.max(0, Math.min(region.y, canvas.height - sampleSize));
            const width = Math.min(sampleSize, canvas.width - x);
            const height = Math.min(sampleSize, canvas.height - y);

            const imageData = ctx.getImageData(x, y, width, height);
            let whitePixelCount = 0;

            for (let i = 0; i < imageData.data.length; i += 4) {
                const r = imageData.data[i];
                const g = imageData.data[i + 1];
                const b = imageData.data[i + 2];
                if (r > 250 && g > 250 && b > 250) whitePixelCount++;
            }

            const regionPixels = imageData.data.length / 4;
            const regionWhitePercentage = (whitePixelCount / regionPixels) * 100;

            regionResults.push({
                region: region.name,
                whitePercentage: regionWhitePercentage.toFixed(1),
                hasContent: regionWhitePercentage < 95
            });

            totalWhitePixels += whitePixelCount;
            totalSampledPixels += regionPixels;
        });

        const overallWhitePercentage = (totalWhitePixels / totalSampledPixels) * 100;
        const hasContent = regionResults.some(r => r.hasContent);

        return {
            loaded: hasContent,
            whitePercentage: overallWhitePercentage,
            isEmpty: !hasContent,
            regionDetails: regionResults,
            samplingInfo: {
                regionsChecked: regions.length,
                sampleSize: `${sampleSize}×${sampleSize}px`,
                totalPixelsSampled: totalSampledPixels
            }
        };
    }

    /**
     * 🎯 AGENT 2: RENDERED ELEMENTS CAPTURE
     * Capture all rendered elements with their actual positions and dimensions
     * @param {AdminCanvasRenderer} canvasRenderer - Canvas renderer instance
     * @returns {Array} Array of rendered element data
     */
    captureRenderedElements(canvasRenderer) {
        const renderedElements = [];

        if (canvasRenderer.renderingStatistics && canvasRenderer.renderingStatistics.renderedObjects) {
            canvasRenderer.renderingStatistics.renderedObjects.forEach((obj, index) => {
                renderedElements.push({
                    index: index,
                    type: obj.type,
                    position: {
                        left: obj.actualLeft || obj.left,
                        top: obj.actualTop || obj.top
                    },
                    dimensions: {
                        width: obj.actualWidth || obj.width,
                        height: obj.actualHeight || obj.height
                    },
                    transform: {
                        scaleX: obj.actualScaleX || obj.scaleX,
                        scaleY: obj.actualScaleY || obj.scaleY,
                        angle: obj.actualAngle || obj.angle
                    },
                    renderSuccess: obj.renderSuccess || false
                });
            });
        }

        return renderedElements;
    }

    /**
     * 🎯 AGENT 3: DESIGN FIDELITY COMPARISON ENGINE
     * Compare original design data with rendered output
     * @returns {Object} Comparison result with fidelity score and issues
     */
    compareDesignFidelity() {
        if (!this.rendered) {
            return {
                success: false,
                error: 'Rendered state not captured yet'
            };
        }

        const comparison = {
            canvas: this.compareCanvas(),
            background: this.compareBackground(),
            elements: this.compareElements(),
            timestamp: Date.now()
        };

        const issues = [
            ...comparison.canvas.issues,
            ...comparison.background.issues,
            ...comparison.elements.issues
        ];

        return {
            success: issues.length === 0,
            fidelityScore: this.calculateFidelityScore(comparison),
            issues: issues,
            comparison: comparison
        };
    }

    /**
     * 🎯 AGENT 3: CANVAS COMPARISON METHOD
     * Compare canvas dimensions and configuration
     * @returns {Object} Canvas comparison result
     */
    compareCanvas() {
        const orig = this.original.canvas;
        const rend = this.rendered.canvas;
        const issues = [];

        const widthDiff = Math.abs(orig.width - rend.width);
        if (widthDiff > 1) {
            issues.push({
                type: 'canvas_width_mismatch',
                expected: orig.width,
                actual: rend.width,
                difference: widthDiff,
                severity: 'critical'
            });
        }

        const heightDiff = Math.abs(orig.height - rend.height);
        if (heightDiff > 1) {
            issues.push({
                type: 'canvas_height_mismatch',
                expected: orig.height,
                actual: rend.height,
                difference: heightDiff,
                severity: 'critical'
            });
        }

        const ratioDiff = Math.abs(orig.aspectRatio - rend.aspectRatio);
        if (ratioDiff > 0.01) {
            issues.push({
                type: 'canvas_aspect_ratio_mismatch',
                expected: orig.aspectRatio.toFixed(3),
                actual: rend.aspectRatio.toFixed(3),
                difference: ratioDiff.toFixed(3),
                severity: 'critical',
                likelyCause: 'Canvas squashed by container CSS'
            });
        }

        if (rend.containerFlex) {
            issues.push({
                type: 'container_uses_flex',
                severity: 'high',
                likelyCause: 'Flex container may compress canvas',
                recommendation: 'Use display:block instead'
            });
        }

        if (rend.containerMinHeight < orig.height) {
            issues.push({
                type: 'container_min_height_too_small',
                expected: `>= ${orig.height}px`,
                actual: `${rend.containerMinHeight}px`,
                severity: 'high',
                likelyCause: 'Container height constraint'
            });
        }

        return {
            match: issues.length === 0,
            issues: issues,
            metrics: { original: orig, rendered: rend }
        };
    }

    /**
     * 🎯 AGENT 3: BACKGROUND COMPARISON METHOD
     * Compare background rendering state
     * @returns {Object} Background comparison result
     */
    compareBackground() {
        const orig = this.original.background;
        const rend = this.rendered.background;
        const issues = [];

        if (orig.expected && !rend.loaded) {
            issues.push({
                type: 'background_missing',
                expected: 'Mockup background loaded',
                actual: `${rend.whitePercentage.toFixed(1)}% white pixels`,
                severity: 'critical',
                likelyCause: 'Background URL not passed to renderer',
                expectedUrl: orig.url
            });
        }

        if (rend.isEmpty) {
            issues.push({
                type: 'canvas_appears_empty',
                actual: `${rend.whitePercentage.toFixed(1)}% white/empty`,
                severity: 'critical',
                likelyCause: 'No content rendered or rendering failed silently'
            });
        }

        return {
            match: issues.length === 0,
            issues: issues,
            metrics: { original: orig, rendered: rend }
        };
    }

    /**
     * 🎯 AGENT 3: ELEMENTS COMPARISON METHOD
     * Compare element count and positioning
     * @returns {Object} Elements comparison result
     */
    compareElements() {
        const orig = this.original.elements;
        const rend = this.rendered.elements;
        const issues = [];

        if (orig.length !== rend.length) {
            issues.push({
                type: 'element_count_mismatch',
                expected: orig.length,
                actual: rend.length,
                severity: 'critical',
                likelyCause: 'Some elements failed to render'
            });
        }

        const maxElements = Math.max(orig.length, rend.length);
        for (let i = 0; i < maxElements; i++) {
            const origEl = orig[i];
            const rendEl = rend[i];

            if (!origEl) {
                issues.push({
                    type: 'extra_element_rendered',
                    elementIndex: i,
                    severity: 'medium'
                });
                continue;
            }

            if (!rendEl) {
                issues.push({
                    type: 'element_not_rendered',
                    elementIndex: i,
                    elementType: origEl.type,
                    severity: 'critical'
                });
                continue;
            }

            const leftDiff = Math.abs(origEl.position.left - rendEl.position.left);
            const topDiff = Math.abs(origEl.position.top - rendEl.position.top);

            if (leftDiff > 1 || topDiff > 1) {
                issues.push({
                    type: 'element_position_mismatch',
                    elementIndex: i,
                    elementType: origEl.type,
                    expected: origEl.position,
                    actual: rendEl.position,
                    difference: { left: leftDiff, top: topDiff },
                    severity: leftDiff > 10 || topDiff > 10 ? 'high' : 'medium',
                    likelyCause: 'Coordinate transformation or scaling issue'
                });
            }
        }

        return {
            match: issues.length === 0,
            issues: issues,
            metrics: { original: orig, rendered: rend }
        };
    }

    /**
     * 🎯 AGENT 3: FIDELITY SCORE CALCULATOR
     * Calculate overall fidelity score based on comparison issues
     * @param {Object} comparison - Comparison result object
     * @returns {number} Fidelity score (0-100)
     */
    calculateFidelityScore(comparison) {
        const countBySeverity = (issues, severity) =>
            issues.filter(i => i.severity === severity).length;

        const criticalIssues = countBySeverity([
            ...comparison.canvas.issues,
            ...comparison.background.issues,
            ...comparison.elements.issues
        ], 'critical');

        const highIssues = countBySeverity([
            ...comparison.canvas.issues,
            ...comparison.background.issues,
            ...comparison.elements.issues
        ], 'high');

        const mediumIssues = countBySeverity([
            ...comparison.canvas.issues,
            ...comparison.background.issues,
            ...comparison.elements.issues
        ], 'medium');

        let score = 100;
        score -= criticalIssues * 50;
        score -= highIssues * 20;
        score -= mediumIssues * 5;

        return Math.max(0, score);
    }
}

// Global exposure for admin context
window.AdminCanvasRenderer = AdminCanvasRenderer;
window.DesignFidelityComparator = DesignFidelityComparator;

console.log('✅ ADMIN CANVAS RENDERER: Class loaded and ready');
console.log('✅ DESIGN FIDELITY COMPARATOR: Class loaded and ready');