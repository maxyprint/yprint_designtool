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

        // 🎯 AGENT 7: RENDERING VALIDATION & INTEGRATION SYSTEM
        this.integrationSystem = {
            enabledRenderers: {
                background: true,    // Agent 3 - Background renderer
                images: true,        // Agent 4 - Image renderer
                text: true,          // Agent 5 - Text renderer
                shapes: true         // Agent 6 - Shape renderer
            },
            renderingOrder: ['background', 'images', 'text', 'shapes'],
            validationEnabled: true,     // Enable 1:1 replica validation
            coordinateValidation: true,  // Validate coordinate preservation
            performanceMonitoring: true, // Monitor rendering performance
            replicaQualityCheck: true   // Check for 1:1 replica achievement
        };
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
            imageCount: 0,
            dataSource: 'unknown', // Track data source
            hasOrderWrapper: false // Track if wrapped in order response
        };

        try {
            if (!designData || typeof designData !== 'object') {
                result.errors.push('Design data is not a valid object');
                return result;
            }

            // 🎯 AGENT 4: ORDER DATA WRAPPER DETECTION
            // Check if data is wrapped in WooCommerce order response format
            if (designData.order_id && designData.design_data) {
                console.log('🎯 AGENT 4: Order response wrapper detected, extracting nested design_data...');
                result.hasOrderWrapper = true;
                result.dataSource = 'woocommerce_order';

                // Extract nested design data
                designData = designData.design_data;

                if (!designData || typeof designData !== 'object') {
                    result.errors.push('Order response contains invalid nested design_data');
                    return result;
                }
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

            // 🎯 AGENT 5: ENHANCED VALIDATION with Data Structure Guidance
            if (!firstView.images || !Array.isArray(firstView.images)) {
                // Check if data might be in Hive Mind format
                if (designData.objects && Array.isArray(designData.objects)) {
                    result.errors.push('Data structure incompatibility: Found Hive Mind "objects" array but Canvas Reconstruction Engine expects "images" array. Use transformDataStructure() method to convert.');
                } else if (designData.elements && Array.isArray(designData.elements)) {
                    result.errors.push('Data structure incompatibility: Found legacy "elements" array but Canvas Reconstruction Engine expects "images" array. Use transformDataStructure() method to convert.');
                } else {
                    result.errors.push('Images array is missing or invalid - no compatible data structure found');
                }
                return result;
            }

            result.imageCount = firstView.images.length;

            // Validate each image
            firstView.images.forEach((img, index) => {
                if (!img.id) {
                    result.warnings.push(`Image ${index}: Missing ID`);
                }

                // 🎯 COMPATIBILITY FIX: Accept both url and src properties
                const imageUrl = img.url || img.src;
                if (!imageUrl) {
                    result.errors.push(`Image ${index}: Missing URL (neither url nor src property found)`);
                    return;
                }

                // Validate URL format
                try {
                    new URL(imageUrl);
                } catch (e) {
                    result.errors.push(`Image ${index}: Invalid URL format`);
                }

                // 🎯 AGENT 5: ENHANCED COORDINATE VALIDATION - Support both flat and nested properties
                // Check if properties are at root level (flat format) or in transform object (nested format)
                const hasFlatProps = img.left !== undefined && img.top !== undefined;
                const hasTransformObj = img.transform && typeof img.transform === 'object';

                if (!hasFlatProps && !hasTransformObj) {
                    result.warnings.push(`Image ${index}: No coordinate data (neither flat properties nor transform object)`);
                    return;
                }

                // Use flat properties if available, otherwise use transform object
                const coords = hasFlatProps ? img : (img.transform || {});
                const requiredProps = ['left', 'top', 'scaleX', 'scaleY'];

                requiredProps.forEach(prop => {
                    if (typeof coords[prop] !== 'number') {
                        result.warnings.push(`Image ${index}: ${prop} is not a number`);
                    } else if (isNaN(coords[prop])) {
                        result.errors.push(`Image ${index}: ${prop} is NaN`);
                    }
                });

                // 🎯 AGENT 2: COORDINATE PRESERVATION VALIDATION
                // Validate coordinate ranges for 780x580 canvas
                if (coords.left !== undefined) {
                    if (coords.left < -1000 || coords.left > 2000) {
                        result.warnings.push(`Image ${index}: Left coordinate (${coords.left}) may be outside expected range`);
                    }
                }
                if (coords.top !== undefined) {
                    if (coords.top < -1000 || coords.top > 2000) {
                        result.warnings.push(`Image ${index}: Top coordinate (${coords.top}) may be outside expected range`);
                    }
                }
                if (coords.scaleX !== undefined) {
                    if (coords.scaleX <= 0 || coords.scaleX > 10) {
                        result.warnings.push(`Image ${index}: ScaleX (${coords.scaleX}) may be outside expected range`);
                    }
                }
                if (coords.scaleY !== undefined) {
                    if (coords.scaleY <= 0 || coords.scaleY > 10) {
                        result.warnings.push(`Image ${index}: ScaleY (${coords.scaleY}) may be outside expected range`);
                    }
                }

                // 🎯 AGENT 4: COORDINATE PRECISION VALIDATION
                // Check for coordinate transformation artifacts (excessive decimal precision)
                const checkPrecision = (value, name) => {
                    if (typeof value === 'number' && !isNaN(value)) {
                        const decimalPlaces = (value.toString().split('.')[1] || '').length;
                        if (decimalPlaces > 6) {
                            result.warnings.push(`Image ${index}: ${name} has excessive decimal precision (${decimalPlaces} places) - possible transformation artifact`);
                        }
                    }
                };

                checkPrecision(coords.left, 'left');
                checkPrecision(coords.top, 'top');
                checkPrecision(coords.scaleX, 'scaleX');
                checkPrecision(coords.scaleY, 'scaleY');
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
     * 🎯 AGENT 5: COMPREHENSIVE DATA STRUCTURE VALIDATION
     * Validates data structure compatibility and provides guidance
     * @param {Object} designData - Design data to validate
     * @returns {Object} Detailed validation result with compatibility information
     */
    validateDataStructureCompatibility(designData) {
        const result = {
            isCompatible: false,
            format: 'unknown',
            needsTransformation: false,
            compatibilityErrors: [],
            compatibilityWarnings: [],
            detectedStructures: [],
            orderMetadata: null, // 🎯 AGENT 4: Track order-specific metadata
            canvasDimensions: null // 🎯 AGENT 4: Track canvas dimensions
        };

        if (!designData || typeof designData !== 'object') {
            result.compatibilityErrors.push('Invalid design data: not an object');
            return result;
        }

        // 🎯 AGENT 4: ORDER RESPONSE WRAPPER DETECTION
        // Check if data is wrapped in WooCommerce order response format
        if (designData.order_id && designData.design_data) {
            console.log('🎯 AGENT 4: Order response wrapper detected in compatibility check');
            result.detectedStructures.push('woocommerce_order_wrapper');

            // Extract order metadata
            result.orderMetadata = {
                order_id: designData.order_id,
                mockup_url: designData.mockup_url,
                has_design_data: designData.has_design_data,
                has_mockup_url: designData.has_mockup_url,
                has_canvas_dimensions: designData.has_canvas_dimensions,
                timestamp: designData.timestamp
            };

            // Extract canvas dimensions from order response if available
            if (designData.canvas_dimensions) {
                result.canvasDimensions = {
                    width: designData.canvas_dimensions.width,
                    height: designData.canvas_dimensions.height,
                    source: 'order_response'
                };
                console.log('🎯 AGENT 4: Canvas dimensions from order response:', result.canvasDimensions);
            }

            // Check if order has design data
            if (!designData.has_design_data || !designData.design_data) {
                result.compatibilityErrors.push('Order response indicates no design data available');
                result.format = 'woocommerce_order_no_data';
                return result;
            }

            // Extract nested design data for further validation
            designData = designData.design_data;

            if (!designData || typeof designData !== 'object') {
                result.compatibilityErrors.push('Order response contains invalid nested design_data');
                return result;
            }
        }

        // Check for Hive Mind objects format
        if (designData.objects && Array.isArray(designData.objects)) {
            result.detectedStructures.push('hive_mind_objects');
            result.format = 'hive_mind_objects';
            result.needsTransformation = true;
            result.compatibilityWarnings.push('Hive Mind objects format detected - requires transformation to Canvas Reconstruction format');

            // Validate objects structure
            const imageObjects = designData.objects.filter(obj => obj.type === 'image');
            if (imageObjects.length === 0) {
                result.compatibilityErrors.push('No image objects found in Hive Mind data');
            } else {
                result.compatibilityWarnings.push(`${imageObjects.length} image objects found - will be converted to images array`);
            }
        }

        // Check for elements format
        if (designData.elements && Array.isArray(designData.elements)) {
            result.detectedStructures.push('elements');
            result.format = 'elements';
            result.needsTransformation = true;
            result.compatibilityWarnings.push('Legacy elements format detected - requires transformation to Canvas Reconstruction format');
        }

        // Check for Canvas Reconstruction format
        const firstViewKey = Object.keys(designData)[0];
        if (firstViewKey && designData[firstViewKey] && designData[firstViewKey].images) {
            result.detectedStructures.push('canvas_reconstruction');
            result.format = 'canvas_reconstruction';
            result.isCompatible = true;
            result.needsTransformation = false;
        }

        // 🎯 AGENT 3: DESIGN_ELEMENTS FORMAT DETECTION
        // Check for design_elements format (from WC order extraction)
        if (designData.design_elements && typeof designData.design_elements === 'object') {
            result.detectedStructures.push('design_elements_wrapper');

            // Check if at least one element has element_data
            const elements = Object.values(designData.design_elements);
            const hasValidElement = elements.some(el => el && el.element_data);

            if (hasValidElement) {
                result.format = 'design_elements_wrapper';
                result.isCompatible = true;
                result.needsTransformation = true;
                console.log('🎯 AGENT 8: design_elements format detected, will transform');
            } else {
                result.compatibilityErrors.push('design_elements found but no valid element_data');
            }
        }

        // Set compatibility based on transformation capability
        if (result.needsTransformation && result.compatibilityErrors.length === 0) {
            result.isCompatible = true;
        }

        return result;
    }

    /**
     * 🎯 AGENT 6: DIAGNOSE PREVIOUS TRANSFORMATION ERRORS
     * Analyzes why data transformation failed and provides guidance
     * @param {Object} originalData - Original design data that failed transformation
     * @returns {string} Diagnostic message with guidance
     */
    diagnosePreviousError(originalData) {
        let diagnosis = 'Transformation failed: ';

        if (!originalData || typeof originalData !== 'object') {
            return diagnosis + 'Original data is null or not an object.';
        }

        const hasObjects = originalData.objects && Array.isArray(originalData.objects);
        const hasElements = originalData.elements && Array.isArray(originalData.elements);
        const hasViewStructure = Object.keys(originalData).some(key =>
            originalData[key] && originalData[key].images && Array.isArray(originalData[key].images)
        );

        if (!hasObjects && !hasElements && !hasViewStructure) {
            return diagnosis + 'No compatible data structure found (missing objects, elements, or view-based images arrays).';
        }

        if (hasObjects) {
            const imageObjects = originalData.objects.filter(obj => obj.type === 'image');
            if (imageObjects.length === 0) {
                return diagnosis + 'Objects array found but contains no image objects.';
            }
            return diagnosis + `Objects array found with ${imageObjects.length} image objects but transformation logic failed.`;
        }

        if (hasElements) {
            const imageElements = originalData.elements.filter(el => el.type === 'image');
            if (imageElements.length === 0) {
                return diagnosis + 'Elements array found but contains no image elements.';
            }
            return diagnosis + `Elements array found with ${imageElements.length} image elements but transformation logic failed.`;
        }

        return diagnosis + 'Unknown transformation failure.';
    }

    /**
     * 🎯 AGENT 6: GENERATE ERROR CONTEXT
     * Provides detailed context for validation errors
     * @param {Object} originalData - Original design data
     * @param {Object} transformedData - Transformed design data
     * @param {Object} validation - Validation result
     * @returns {string} Error context message
     */
    generateErrorContext(originalData, transformedData, validation) {
        let context = '';

        // Analysis original vs transformed
        const originalFormat = originalData.objects ? 'objects' :
                              originalData.elements ? 'elements' : 'view-based';

        const transformedFormat = Object.keys(transformedData)[0];
        const firstView = transformedData[transformedFormat];

        context += `Original format: ${originalFormat}, Transformed to: view-based. `;

        if (firstView && firstView.images) {
            context += `Transformation produced ${firstView.images.length} images. `;
        } else {
            context += 'Transformation failed to produce images array. ';
        }

        // Analysis specific validation errors
        const hasImagesError = validation.errors.some(err => err.includes('Images array'));
        if (hasImagesError && originalData.objects) {
            context += 'Issue: Hive Mind objects → images transformation may have failed. ';
        }

        return context;
    }

    /**
     * 🎯 AGENT 7: ENHANCED INTEGRATED PREVIEW GENERATOR
     * Generate preview using all 7 specialized agents for 1:1 replica rendering
     * @param {Object} designData - Design data object
     * @param {Object} options - Rendering options
     */
    async generatePreview(designData, options = {}) {
        console.log('🎯 AGENT 7 PREVIEW GENERATOR: Starting integrated preview generation...', designData);

        const startTime = performance.now();

        try {
            // 🎯 AGENT 6: PRE-TRANSFORMATION COMPATIBILITY CHECK
            const compatibilityCheck = this.validateDataStructureCompatibility(designData);
            console.log('🎯 AGENT 6: Data structure compatibility analysis:', compatibilityCheck);

            if (!compatibilityCheck.isCompatible) {
                const errorMessage = `Data structure incompatibility: ${compatibilityCheck.compatibilityErrors.join(', ')}. Detected format: ${compatibilityCheck.format}`;
                console.error('❌ AGENT 6: Compatibility check failed:', errorMessage);
                throw new Error(errorMessage);
            }

            // 🎯 AGENT 3: DATA STRUCTURE TRANSFORMATION
            // Transform data structure before validation and rendering
            const transformedData = this.transformDataStructure(designData);
            if (!transformedData) {
                // 🎯 AGENT 6: ENHANCED ERROR REPORTING
                const diagnosisResult = this.diagnosePreviousError(designData);
                throw new Error(`Failed to transform design data structure. ${diagnosisResult}`);
            }

            // Store transformed data
            this.currentData = transformedData;

            // 🎯 AGENT 7: Enhanced data validation
            const validation = this.validateDesignData(transformedData);
            if (!validation.isValid) {
                // 🎯 AGENT 6: ENHANCED ERROR CONTEXT
                const errorContext = this.generateErrorContext(designData, transformedData, validation);
                throw new Error(`Invalid design data: ${validation.errors.join(', ')}. ${errorContext}`);
            }

            // Show warnings if any
            if (validation.warnings.length > 0) {
                console.warn('⚠️ AGENT 7 PREVIEW WARNINGS:', validation.warnings);
            }

            // 🎯 AGENT 7 + FIX 7: Prepare integrated rendering options with canvas dimensions
            const renderOptions = {
                ...options,
                enableValidation: this.integrationSystem.validationEnabled,
                coordinateValidation: this.integrationSystem.coordinateValidation,
                performanceMonitoring: this.integrationSystem.performanceMonitoring,
                // 🎯 FIX 7: Pass original canvas dimensions for coordinate space alignment
                canvasDimensions: {
                    width: transformedData.canvas?.width || designData.canvas?.width || 780,
                    height: transformedData.canvas?.height || designData.canvas?.height || 580
                }
            };

            console.log('🎯 FIX 7: Canvas dimensions for rendering:', renderOptions.canvasDimensions);

            // 🎯 AGENT 7: Execute integrated rendering pipeline
            console.log('🎯 AGENT 7: Executing 7-agent rendering pipeline...');

            const renderResults = await this.renderer.renderDesign(transformedData, renderOptions);

            const totalTime = performance.now() - startTime;

            // 🎯 AGENT 7: Compile comprehensive results
            const integratedResults = {
                designData: transformedData,
                validation,
                renderResults,
                agents: {
                    agent1_dimensionController: this.renderer.dimensionPreservation,
                    agent2_coordinatePreservation: this.renderer.coordinatePreservation,
                    agent3_backgroundRenderer: this.renderer.backgroundRenderer,
                    agent4_imageRenderer: this.renderer.imageRenderer,
                    agent5_textRenderer: this.renderer.textRenderer,
                    agent6_shapeRenderer: this.renderer.shapeRenderer,
                    agent7_integration: this.integrationSystem
                },
                performance: {
                    totalGenerationTime: `${totalTime.toFixed(2)}ms`,
                    renderingTime: renderResults?.performance?.totalTime || 'N/A',
                    ...this.renderer.getPerformanceReport()
                },
                qualityAssurance: {
                    is1to1Replica: renderResults?.qualityCheck?.is1to1Replica || false,
                    qualityScore: renderResults?.qualityCheck?.score || 0,
                    coordinatePreservation: this.renderer.coordinatePreservation.noTransformMode,
                    exactDimensions: this.renderer.dimensionPreservation.enforceExactDimensions,
                    issues: renderResults?.qualityCheck?.issues || []
                }
            };

            // 🎯 AGENT 7: Trigger success callbacks with comprehensive data
            this.triggerCallbacks('success', integratedResults);

            console.log('🎯 AGENT 7 PREVIEW GENERATION COMPLETE:', {
                systemStatus: 'ALL_7_AGENTS_ACTIVE',
                is1to1Replica: integratedResults.qualityAssurance.is1to1Replica,
                qualityScore: `${integratedResults.qualityAssurance.qualityScore}/100`,
                totalTime: `${totalTime.toFixed(2)}ms`,
                objectsRendered: renderResults?.totalObjects || 0,
                errors: renderResults?.errors?.length || 0,
                agentSystemIntegrated: true
            });

            return integratedResults;

        } catch (error) {
            console.error('❌ AGENT 7 PREVIEW GENERATION ERROR:', error);

            // Trigger error callbacks
            this.triggerCallbacks('error', {
                error,
                designData,
                agent: 'AGENT_7_INTEGRATION_SYSTEM'
            });

            // Show error on canvas
            this.showError(error.message);
            throw error;
        }
    }

    /**
     * 🎯 AGENT 6: ENHANCED ERROR DISPLAY WITH GUIDANCE
     * Show error message on canvas with diagnostic information
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

        // 🎯 AGENT 6: ENHANCED ERROR MESSAGING
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 14px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
            'Canvas Reconstruction Error',
            canvas.width / (2 * pixelRatio),
            canvas.height / (2 * pixelRatio) - 40
        );

        // Main error message
        ctx.font = '11px Arial, sans-serif';
        ctx.fillStyle = '#666666';
        const maxLength = 60;
        const shortMessage = message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
        ctx.fillText(
            shortMessage,
            canvas.width / (2 * pixelRatio),
            canvas.height / (2 * pixelRatio) - 10
        );

        // 🎯 AGENT 6: PROVIDE GUIDANCE
        ctx.font = '10px Arial, sans-serif';
        ctx.fillStyle = '#0066cc';

        // 🎯 AGENT 4: ORDER-SPECIFIC ERROR GUIDANCE
        if (message.includes('Order response')) {
            ctx.fillText(
                'WooCommerce order data format issue detected',
                canvas.width / (2 * pixelRatio),
                canvas.height / (2 * pixelRatio) + 15
            );
            ctx.fillText(
                'Check order meta fields for design_data',
                canvas.width / (2 * pixelRatio),
                canvas.height / (2 * pixelRatio) + 30
            );
        } else if (message.includes('no design data available')) {
            ctx.fillText(
                'Order has no design data in _design_data meta field',
                canvas.width / (2 * pixelRatio),
                canvas.height / (2 * pixelRatio) + 15
            );
            ctx.fillText(
                'Verify order was created with design tool',
                canvas.width / (2 * pixelRatio),
                canvas.height / (2 * pixelRatio) + 30
            );
        } else if (message.includes('Canvas dimensions')) {
            ctx.fillText(
                'Missing canvas dimensions - using defaults',
                canvas.width / (2 * pixelRatio),
                canvas.height / (2 * pixelRatio) + 15
            );
            ctx.fillText(
                'Check design_data.canvas.width/height',
                canvas.width / (2 * pixelRatio),
                canvas.height / (2 * pixelRatio) + 30
            );
        } else if (message.includes('Data structure incompatibility')) {
            ctx.fillText(
                'Hive Mind → Canvas format mismatch detected',
                canvas.width / (2 * pixelRatio),
                canvas.height / (2 * pixelRatio) + 15
            );
            ctx.fillText(
                'Check console for transformation details',
                canvas.width / (2 * pixelRatio),
                canvas.height / (2 * pixelRatio) + 30
            );
        } else if (message.includes('Images array is missing')) {
            ctx.fillText(
                'Try using transformDataStructure() method',
                canvas.width / (2 * pixelRatio),
                canvas.height / (2 * pixelRatio) + 15
            );
        } else {
            ctx.fillText(
                'See browser console for detailed error information',
                canvas.width / (2 * pixelRatio),
                canvas.height / (2 * pixelRatio) + 15
            );
        }

        ctx.restore();

        // 🎯 AGENT 6: LOG DETAILED ERROR INFORMATION
        console.group('🎯 AGENT 6: Canvas Reconstruction Error Details');
        console.error('Error Message:', message);
        console.log('Current Data:', this.currentData);
        console.log('Renderer State:', {
            hasRenderer: !!this.renderer,
            canvasElement: this.renderer?.canvas,
            context: this.renderer?.ctx
        });
        console.groupEnd();
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
     * 🎯 AGENT 3: DATA STRUCTURE TRANSFORMATION ENGINE
     * Transform data structure from Hive Mind Analysis format to Canvas Reconstruction format
     * @param {Object} designData - Design data from various sources
     * @returns {Object} Transformed data compatible with Canvas Reconstruction Engine
     */
    transformDataStructure(designData) {
        console.log('🎯 AGENT 3: Starting data structure transformation...', designData);

        if (!designData || typeof designData !== 'object') {
            console.error('❌ AGENT 3: Invalid design data for transformation');
            return null;
        }

        // 🎯 AGENT 4: ORDER RESPONSE WRAPPER HANDLING (MUST BE FIRST!)
        // Check if data is wrapped in WooCommerce order response format
        // This unwraps the outer layer to expose inner wrappers like design_elements
        let orderMetadata = null;
        let canvasDimensionsFromOrder = null;

        if (designData.order_id && designData.design_data) {
            console.log('🎯 AGENT 4: Order response wrapper detected in transformation');

            // Preserve order metadata for reference
            orderMetadata = {
                order_id: designData.order_id,
                mockup_url: designData.mockup_url,
                timestamp: designData.timestamp
            };

            // Preserve canvas dimensions from order response
            if (designData.canvas_dimensions) {
                canvasDimensionsFromOrder = {
                    width: designData.canvas_dimensions.width,
                    height: designData.canvas_dimensions.height
                };
                console.log('🎯 AGENT 4: Preserved canvas dimensions from order:', canvasDimensionsFromOrder);
            }

            // Check if order has design data
            if (!designData.has_design_data || !designData.design_data) {
                console.error('❌ AGENT 4: Order response indicates no design data available');
                return null;
            }

            // Extract nested design data
            designData = designData.design_data;
            console.log('🎯 AGENT 4: Unwrapped order wrapper, checking inner structure...', {
                hasDesignElements: !!designData.design_elements,
                hasObjects: !!designData.objects,
                hasImages: !!Object.keys(designData)[0] && !!designData[Object.keys(designData)[0]]?.images
            });

            if (!designData || typeof designData !== 'object') {
                console.error('❌ AGENT 4: Order response contains invalid nested design_data');
                return null;
            }
        }

        // 🎯 AGENT 8: Transform design_elements wrapper format (AFTER ORDER UNWRAP!)
        // Now that order wrapper is unwrapped, design_elements is accessible at root level
        if (designData.design_elements && typeof designData.design_elements === 'object') {
            console.log('🎯 AGENT 8: Transforming design_elements wrapper...');

            const elements = Object.values(designData.design_elements);
            const firstElement = elements[0];

            if (firstElement && firstElement.element_data) {
                console.log('✅ AGENT 8: Extracted element_data from design_elements');
                designData = firstElement.element_data;

                // Log transformation details
                console.log('🎯 AGENT 8: Transformed structure:', {
                    hasObjects: !!designData.objects,
                    hasBackground: !!designData.background,
                    hasCanvas: !!designData.canvas
                });
            } else {
                console.error('❌ AGENT 8: design_elements found but no valid element_data');
                return null;
            }
        }

        // If data already has view-based structure with images, return as-is
        const firstViewKey = Object.keys(designData)[0];
        if (firstViewKey && designData[firstViewKey] && designData[firstViewKey].images) {
            console.log('✅ AGENT 3: Data already in Canvas Reconstruction format');

            // 🎯 AGENT 4: CANVAS DIMENSION RESTORATION
            // If canvas dimensions were in order response but missing in design data, restore them
            if (canvasDimensionsFromOrder && designData[firstViewKey]) {
                const firstView = designData[firstViewKey];
                if (!firstView.canvas || !firstView.canvas.width || !firstView.canvas.height) {
                    console.log('🎯 AGENT 4: Restoring canvas dimensions from order response');
                    firstView.canvas = canvasDimensionsFromOrder;
                } else {
                    console.log('🎯 AGENT 4: Canvas dimensions already present in design data');
                }
            }

            return designData;
        }

        // Check if data has 'objects' array (Hive Mind Analysis format)
        if (designData.objects && Array.isArray(designData.objects)) {
            console.log('🎯 AGENT 3: Converting from Hive Mind objects format...');

            const transformedData = this.convertObjectsToImages(designData, canvasDimensionsFromOrder);
            console.log('✅ AGENT 3: Successfully transformed objects to images format', transformedData);
            return transformedData;
        }

        // Check if data has 'elements' array (legacy format)
        if (designData.elements && Array.isArray(designData.elements)) {
            console.log('🎯 AGENT 3: Converting from elements format...');

            const transformedData = this.convertElementsToImages(designData, canvasDimensionsFromOrder);
            console.log('✅ AGENT 3: Successfully transformed elements to images format', transformedData);
            return transformedData;
        }

        console.warn('⚠️ AGENT 3: Unknown data structure format, returning as-is');
        return designData;
    }

    /**
     * 🎯 AGENT 3: Convert objects array to Canvas Reconstruction images format
     * @param {Object} designData - Data with objects array
     * @param {Object} canvasDimensionsFromOrder - Canvas dimensions from order response (optional)
     * @returns {Object} Canvas Reconstruction compatible format
     */
    convertObjectsToImages(designData, canvasDimensionsFromOrder = null) {
        const images = [];

        designData.objects.forEach((obj, index) => {
            if (obj.type === 'image' && obj.src) {
                // 🎯 AGENT 2: EXACT COORDINATE PRESERVATION - Flatten properties for AdminCanvasRenderer compatibility
                images.push({
                    id: obj.id || `hive_img_${index}`,
                    url: obj.src,  // Map src to url for renderImage compatibility
                    src: obj.src,  // Keep src for renderImageElement compatibility
                    type: 'image',
                    // Flatten coordinate properties for direct access by AdminCanvasRenderer
                    left: parseFloat(obj.left || 0),
                    top: parseFloat(obj.top || 0),
                    width: parseFloat(obj.width || 0),
                    height: parseFloat(obj.height || 0),
                    scaleX: parseFloat(obj.scaleX || 1),
                    scaleY: parseFloat(obj.scaleY || 1),
                    angle: parseFloat(obj.angle || 0),
                    // Keep transform object for backward compatibility
                    transform: {
                        left: parseFloat(obj.left || 0),
                        top: parseFloat(obj.top || 0),
                        width: parseFloat(obj.width || 0),
                        height: parseFloat(obj.height || 0),
                        scaleX: parseFloat(obj.scaleX || 1),
                        scaleY: parseFloat(obj.scaleY || 1),
                        angle: parseFloat(obj.angle || 0)
                    }
                });
            }
        });

        // 🎯 AGENT 4: CANVAS DIMENSION EXTRACTION with fallback priority
        // Priority: 1) Order response, 2) Design data canvas, 3) Default 780x580
        let canvasWidth = 780;
        let canvasHeight = 580;
        let dimensionSource = 'default';

        if (canvasDimensionsFromOrder) {
            canvasWidth = canvasDimensionsFromOrder.width || 780;
            canvasHeight = canvasDimensionsFromOrder.height || 580;
            dimensionSource = 'order_response';
            console.log('🎯 AGENT 4: Using canvas dimensions from order response');
        } else if (designData.canvas) {
            canvasWidth = designData.canvas.width || 780;
            canvasHeight = designData.canvas.height || 580;
            dimensionSource = 'design_data';
            console.log('🎯 AGENT 4: Using canvas dimensions from design data');
        } else {
            console.log('🎯 AGENT 4: Using default canvas dimensions (780x580)');
        }

        console.log(`🎯 AGENT 4: Canvas dimensions - Width: ${canvasWidth}, Height: ${canvasHeight} (source: ${dimensionSource})`);

        // Create view-based structure for Canvas Reconstruction Engine
        const viewId = 'hive_mind_view';
        return {
            [viewId]: {
                view_name: 'Hive Mind Design View',
                system_id: designData.system_id || Date.now().toString(),
                variation_id: designData.variation_id || viewId,
                images: images,
                canvas: {
                    width: canvasWidth,
                    height: canvasHeight,
                    _dimension_source: dimensionSource // Track source for debugging
                },
                // 🎯 AGENT 12 FIX: Preserve background/mockup URL from original data
                background: designData.background || designData.mockup_url || null,
                // 🎯 AGENT 7 FIX: Preserve metadata to prevent legacy correction on modern data
                metadata: designData.metadata || null
            }
        };
    }

    /**
     * 🎯 AGENT 3: Convert elements array to Canvas Reconstruction images format
     * @param {Object} designData - Data with elements array
     * @param {Object} canvasDimensionsFromOrder - Canvas dimensions from order response (optional)
     * @returns {Object} Canvas Reconstruction compatible format
     */
    convertElementsToImages(designData, canvasDimensionsFromOrder = null) {
        const images = [];

        designData.elements.forEach((element, index) => {
            if (element.type === 'image' && element.src) {
                images.push({
                    id: element.id || `element_img_${index}`,
                    url: element.src,
                    transform: {
                        left: parseFloat(element.left || 0),
                        top: parseFloat(element.top || 0),
                        width: parseFloat(element.width || 0),
                        height: parseFloat(element.height || 0),
                        scaleX: parseFloat(element.scaleX || 1),
                        scaleY: parseFloat(element.scaleY || 1),
                        angle: parseFloat(element.angle || 0)
                    }
                });
            }
        });

        // 🎯 AGENT 4: CANVAS DIMENSION EXTRACTION with fallback priority
        let canvasWidth = 780;
        let canvasHeight = 580;
        let dimensionSource = 'default';

        if (canvasDimensionsFromOrder) {
            canvasWidth = canvasDimensionsFromOrder.width || 780;
            canvasHeight = canvasDimensionsFromOrder.height || 580;
            dimensionSource = 'order_response';
            console.log('🎯 AGENT 4: Using canvas dimensions from order response (elements)');
        } else if (designData.canvas) {
            canvasWidth = designData.canvas.width || 780;
            canvasHeight = designData.canvas.height || 580;
            dimensionSource = 'design_data';
            console.log('🎯 AGENT 4: Using canvas dimensions from design data (elements)');
        } else {
            console.log('🎯 AGENT 4: Using default canvas dimensions (elements: 780x580)');
        }

        const viewId = designData.template_view_id || 'elements_view';
        return {
            [viewId]: {
                view_name: 'Elements Design View',
                system_id: designData.system_id || Date.now().toString(),
                variation_id: designData.variation_id || viewId,
                images: images,
                canvas: {
                    width: canvasWidth,
                    height: canvasHeight,
                    _dimension_source: dimensionSource
                },
                // 🎯 AGENT 12 FIX: Preserve background/mockup URL from original data
                background: designData.background || designData.mockup_url || null,
                // 🎯 AGENT 7 FIX: Preserve metadata to prevent legacy correction on modern data
                metadata: designData.metadata || null
            }
        };
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