/**
 * 🎯 AGENT 2: PIXEL SAMPLING VALIDATOR
 *
 * Post-render visual validation system that verifies rendered content
 * actually appears at the expected position using pixel sampling.
 *
 * Strategy:
 * - Samples 5 strategic points (center + 4 corners) in the expected region
 * - Detects content by checking if pixels are non-background
 * - Calculates confidence score based on content detection rate
 * - Reports validation failures for debugging
 */
class PixelSamplingValidator {
    constructor(renderer) {
        this.renderer = renderer;
        this.validationCache = new Map();
    }

    /**
     * Validate that rendered content appears at expected position
     * @param {Object} params - Validation parameters
     * @param {HTMLCanvasElement} params.canvas - Canvas to validate
     * @param {Object} params.expectedPosition - Expected position {x, y, width, height}
     * @param {string} params.assetSignature - Unique identifier for the asset
     * @param {string} params.elementType - Type of element (image, text, shape)
     * @returns {Object} Validation result
     */
    validatePosition({ canvas, expectedPosition, assetSignature, elementType = 'unknown' }) {
        const startTime = performance.now();

        // Skip validation if disabled
        if (!this.renderer.visualValidation.enabled ||
            !this.renderer.visualValidation.pixelSamplingEnabled) {
            return {
                valid: true,
                skipped: true,
                reason: 'Validation disabled'
            };
        }

        try {
            const ctx = canvas.getContext('2d');
            const { x, y, width, height } = expectedPosition;

            // Define 5 strategic sample points (with 5px inset from edges to avoid edge artifacts)
            const inset = 5;
            const samplePoints = this.calculateSamplePoints(x, y, width, height, inset);

            // Sample each point and detect content
            const samplingResults = samplePoints.map(point => {
                return this.samplePoint(ctx, point);
            });

            // Calculate confidence score
            const contentDetectedCount = samplingResults.filter(r => r.hasContent).length;
            const totalPoints = samplingResults.length;
            const confidence = contentDetectedCount / totalPoints;

            // Determine validation status
            const threshold = this.renderer.visualValidation.validationThreshold;
            const valid = confidence >= threshold;

            // Build validation result
            const validationResult = {
                valid,
                confidence,
                threshold,
                samplePoints: samplingResults,
                expectedPosition: { x, y, width, height },
                elementType,
                assetSignature,
                issue: valid ? null : this.generateIssueDescription(confidence, samplingResults),
                timestamp: Date.now(),
                validationTime: performance.now() - startTime
            };

            // Store result for analysis
            if (this.renderer.visualValidation.logValidation) {
                this.renderer.visualValidation.validationResults.push(validationResult);
            }

            // Log validation result
            this.logValidationResult(validationResult);

            return validationResult;

        } catch (error) {
            console.error('❌ AGENT 2 PIXEL SAMPLING ERROR:', {
                error: error.message,
                stack: error.stack,
                expectedPosition,
                assetSignature
            });

            return {
                valid: false,
                error: error.message,
                expectedPosition,
                assetSignature,
                timestamp: Date.now()
            };
        }
    }

    /**
     * Calculate strategic sample points in the expected region
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} width - Width of region
     * @param {number} height - Height of region
     * @param {number} inset - Inset from edges
     * @returns {Array} Array of sample points
     */
    calculateSamplePoints(x, y, width, height, inset) {
        const points = [];

        // Ensure minimum dimensions for sampling
        if (width < inset * 2 || height < inset * 2) {
            // For very small elements, just sample the center
            points.push({
                x: Math.round(x + width / 2),
                y: Math.round(y + height / 2),
                label: 'center'
            });
            return points;
        }

        // Top-left corner
        points.push({
            x: Math.round(x + inset),
            y: Math.round(y + inset),
            label: 'top-left'
        });

        // Top-right corner
        points.push({
            x: Math.round(x + width - inset),
            y: Math.round(y + inset),
            label: 'top-right'
        });

        // Center
        points.push({
            x: Math.round(x + width / 2),
            y: Math.round(y + height / 2),
            label: 'center'
        });

        // Bottom-left corner
        points.push({
            x: Math.round(x + inset),
            y: Math.round(y + height - inset),
            label: 'bottom-left'
        });

        // Bottom-right corner
        points.push({
            x: Math.round(x + width - inset),
            y: Math.round(y + height - inset),
            label: 'bottom-right'
        });

        return points;
    }

    /**
     * Sample a single point and detect content
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} point - Point to sample {x, y, label}
     * @returns {Object} Sampling result
     */
    samplePoint(ctx, point) {
        try {
            // Get pixel data at this point
            const imageData = ctx.getImageData(point.x, point.y, 1, 1);
            const [r, g, b, a] = imageData.data;

            // Detect content based on color and alpha
            const hasContent = this.detectContent(r, g, b, a);

            return {
                x: point.x,
                y: point.y,
                label: point.label,
                color: { r, g, b, a },
                hasContent,
                isBackground: !hasContent
            };

        } catch (error) {
            console.warn('⚠️ AGENT 2 SAMPLE POINT ERROR:', {
                point,
                error: error.message
            });

            return {
                x: point.x,
                y: point.y,
                label: point.label,
                error: error.message,
                hasContent: false,
                isBackground: true
            };
        }
    }

    /**
     * Detect if pixel contains content (not background)
     * @param {number} r - Red channel
     * @param {number} g - Green channel
     * @param {number} b - Blue channel
     * @param {number} a - Alpha channel
     * @returns {boolean} True if content detected
     */
    detectContent(r, g, b, a) {
        const bgThreshold = this.renderer.visualValidation.backgroundThreshold;
        const alphaThreshold = this.renderer.visualValidation.alphaThreshold;

        // Check if pixel is white background (all RGB > threshold)
        const isWhiteBackground = (r > bgThreshold && g > bgThreshold && b > bgThreshold);

        // Check if pixel has sufficient alpha
        const hasAlpha = (a > alphaThreshold);

        // Content detected if:
        // 1. NOT white background AND has alpha, OR
        // 2. Has significant alpha but darker colors
        return (!isWhiteBackground && hasAlpha) || (hasAlpha && (r < bgThreshold || g < bgThreshold || b < bgThreshold));
    }

    /**
     * Generate issue description for validation failure
     * @param {number} confidence - Confidence score
     * @param {Array} samplingResults - Sampling results
     * @returns {string} Issue description
     */
    generateIssueDescription(confidence, samplingResults) {
        const contentPoints = samplingResults.filter(r => r.hasContent);
        const backgroundPoints = samplingResults.filter(r => r.isBackground);

        if (contentPoints.length === 0) {
            return `No content detected at expected position (0/${samplingResults.length} sample points have content)`;
        } else if (confidence < 0.4) {
            return `Low content detection (${contentPoints.length}/${samplingResults.length} points have content). Content may be at wrong position.`;
        } else {
            return `Partial content detection (${contentPoints.length}/${samplingResults.length} points have content). Confidence: ${(confidence * 100).toFixed(1)}%`;
        }
    }

    /**
     * Log validation result to console
     * @param {Object} result - Validation result
     */
    logValidationResult(result) {
        if (!this.renderer.visualValidation.logValidation) {
            return;
        }

        if (result.valid) {
            console.log('✅ AGENT 2 VISUAL VALIDATION: SUCCESS', {
                elementType: result.elementType,
                confidence: `${(result.confidence * 100).toFixed(1)}%`,
                threshold: `${(result.threshold * 100).toFixed(1)}%`,
                position: result.expectedPosition,
                contentPoints: result.samplePoints.filter(p => p.hasContent).length,
                totalPoints: result.samplePoints.length,
                validationTime: `${result.validationTime.toFixed(2)}ms`,
                signature: result.assetSignature
            });
        } else {
            console.error('❌ AGENT 2 VISUAL VALIDATION: FAILED', {
                elementType: result.elementType,
                issue: result.issue,
                confidence: `${(result.confidence * 100).toFixed(1)}%`,
                threshold: `${(result.threshold * 100).toFixed(1)}%`,
                expectedPosition: result.expectedPosition,
                samplePoints: result.samplePoints.map(p => ({
                    label: p.label,
                    position: `(${p.x}, ${p.y})`,
                    hasContent: p.hasContent,
                    color: p.color ? `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.color.a})` : 'N/A'
                })),
                validationTime: `${result.validationTime.toFixed(2)}ms`,
                signature: result.assetSignature
            });
        }
    }

    /**
     * Perform full canvas scan to find actual position of content (optional diagnostic)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} expectedPosition - Expected position
     * @returns {Object|null} Actual position if found
     */
    scanForActualPosition(ctx, expectedPosition) {
        // This is a diagnostic tool - only use when validation fails
        // Grid search across canvas to find where content actually is
        const gridSize = 20; // Sample every 20 pixels
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;

        const contentRegions = [];

        for (let y = 0; y < canvasHeight; y += gridSize) {
            for (let x = 0; x < canvasWidth; x += gridSize) {
                try {
                    const imageData = ctx.getImageData(x, y, 1, 1);
                    const [r, g, b, a] = imageData.data;

                    if (this.detectContent(r, g, b, a)) {
                        contentRegions.push({ x, y });
                    }
                } catch (error) {
                    // Skip invalid coordinates
                    continue;
                }
            }
        }

        if (contentRegions.length > 0) {
            // Find bounding box of content regions
            const minX = Math.min(...contentRegions.map(p => p.x));
            const maxX = Math.max(...contentRegions.map(p => p.x));
            const minY = Math.min(...contentRegions.map(p => p.y));
            const maxY = Math.max(...contentRegions.map(p => p.y));

            return {
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY,
                pixelCount: contentRegions.length
            };
        }

        return null;
    }
}
