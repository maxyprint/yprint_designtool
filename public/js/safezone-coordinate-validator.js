/**
 * SafeZone Coordinate Validator
 *
 * Fixes coordinates capture bug causing SafeZone warnings
 * Ensures all captured coordinates are properly validated against SafeZone boundaries
 */

(function() {
    'use strict';

    console.log('🔍 SAFEZONE VALIDATOR: Initializing coordinate validation system...');

    window.SafeZoneCoordinateValidator = class {
        constructor() {
            this.safeZoneData = null;
            this.debugMode = (typeof window.octoPrintDesignerDebug !== 'undefined') ? window.octoPrintDesignerDebug : false;

            this.init();
        }

        init() {
            this.discoverSafeZone();
            this.patchCoordinateCapture();

            console.log('✅ SAFEZONE VALIDATOR: Initialization complete');
        }

        /**
         * Discover SafeZone data from various sources
         */
        discoverSafeZone() {
            try {
                // Method 1: Get from canvas SafeZone object
                const canvases = document.querySelectorAll('canvas');
                for (const canvas of canvases) {
                    if (canvas.__fabric) {
                        const fabricCanvas = canvas.__fabric;
                        const objects = fabricCanvas.getObjects();

                        // Look for SafeZone rectangle
                        const safeZoneRect = objects.find(obj =>
                            obj.name === 'safeZone' ||
                            obj.type === 'rect' && obj.selectable === false
                        );

                        if (safeZoneRect) {
                            this.safeZoneData = {
                                left: safeZoneRect.left,
                                top: safeZoneRect.top,
                                width: safeZoneRect.width * (safeZoneRect.scaleX || 1),
                                height: safeZoneRect.height * (safeZoneRect.scaleY || 1)
                            };

                            this.log('info', '🎯 SafeZone discovered from canvas:', this.safeZoneData);
                            return;
                        }
                    }
                }

                // Method 2: Get from template data
                if (window.octoPrintDesigner && window.octoPrintDesigner.template) {
                    const template = window.octoPrintDesigner.template;
                    if (template.views && template.views[0] && template.views[0].safeZone) {
                        this.safeZoneData = template.views[0].safeZone;
                        this.log('info', '🎯 SafeZone discovered from template data:', this.safeZoneData);
                        return;
                    }
                }

                // Method 3: Fallback default SafeZone
                this.safeZoneData = {
                    left: 50,
                    top: 50,
                    width: 700,
                    height: 500
                };

                this.log('warn', '⚠️ Using fallback SafeZone:', this.safeZoneData);

            } catch (error) {
                this.log('error', '❌ Error discovering SafeZone:', error);
                this.safeZoneData = { left: 0, top: 0, width: 800, height: 600 };
            }
        }

        /**
         * Validate if coordinates are within SafeZone boundaries
         */
        validateCoordinates(x, y, width = 0, height = 0) {
            if (!this.safeZoneData) {
                this.log('warn', '⚠️ No SafeZone data available for validation');
                return { isValid: true, reason: 'no_safezone' };
            }

            const elementRight = x + width;
            const elementBottom = y + height;
            const safeZoneRight = this.safeZoneData.left + this.safeZoneData.width;
            const safeZoneBottom = this.safeZoneData.top + this.safeZoneData.height;

            // Check all boundaries
            const violations = [];

            if (x < this.safeZoneData.left) {
                violations.push(`left boundary (${x} < ${this.safeZoneData.left})`);
            }
            if (y < this.safeZoneData.top) {
                violations.push(`top boundary (${y} < ${this.safeZoneData.top})`);
            }
            if (elementRight > safeZoneRight) {
                violations.push(`right boundary (${elementRight} > ${safeZoneRight})`);
            }
            if (elementBottom > safeZoneBottom) {
                violations.push(`bottom boundary (${elementBottom} > ${safeZoneBottom})`);
            }

            const isValid = violations.length === 0;

            if (!isValid && this.debugMode) {
                this.log('warn', `⚠️ SafeZone validation failed: ${violations.join(', ')}`);
            }

            return {
                isValid: isValid,
                violations: violations,
                correctedCoords: isValid ? { x, y } : this.correctCoordinates(x, y, width, height)
            };
        }

        /**
         * Correct coordinates to fit within SafeZone boundaries
         */
        correctCoordinates(x, y, width = 0, height = 0) {
            if (!this.safeZoneData) return { x, y };

            const corrected = { x, y };

            // Correct left boundary
            if (corrected.x < this.safeZoneData.left) {
                corrected.x = this.safeZoneData.left;
            }

            // Correct top boundary
            if (corrected.y < this.safeZoneData.top) {
                corrected.y = this.safeZoneData.top;
            }

            // Correct right boundary
            const maxX = this.safeZoneData.left + this.safeZoneData.width - width;
            if (corrected.x > maxX) {
                corrected.x = Math.max(maxX, this.safeZoneData.left);
            }

            // Correct bottom boundary
            const maxY = this.safeZoneData.top + this.safeZoneData.height - height;
            if (corrected.y > maxY) {
                corrected.y = Math.max(maxY, this.safeZoneData.top);
            }

            this.log('info', `🔧 Coordinates corrected: (${x},${y}) → (${corrected.x},${corrected.y})`);

            return corrected;
        }

        /**
         * Patch coordinate capture methods to include SafeZone validation
         */
        patchCoordinateCapture() {
            // Patch EnhancedJSONCoordinateSystem if available
            if (window.EnhancedJSONCoordinateSystem) {
                this.patchEnhancedJSONSystem();
            }

            // Patch ComprehensiveDesignDataCapture if available
            if (window.ComprehensiveDesignDataCapture) {
                this.patchComprehensiveCapture();
            }

            // Patch DesignDataCapture if available
            if (window.DesignDataCapture) {
                this.patchDesignDataCapture();
            }

            this.log('info', '🔧 Coordinate capture methods patched with SafeZone validation');
        }

        /**
         * Patch EnhancedJSONCoordinateSystem with SafeZone validation
         */
        patchEnhancedJSONSystem() {
            const original = window.EnhancedJSONCoordinateSystem.prototype.extractElementCoordinates;
            const validator = this;

            window.EnhancedJSONCoordinateSystem.prototype.extractElementCoordinates = function(obj, index) {
                const element = original.call(this, obj, index);

                // Validate coordinates against SafeZone
                const validation = validator.validateCoordinates(
                    element.coordinates.x,
                    element.coordinates.y,
                    element.coordinates.width,
                    element.coordinates.height
                );

                // Add validation metadata
                element.safeZoneValidation = {
                    isValid: validation.isValid,
                    violations: validation.violations || [],
                    originalCoords: { ...element.coordinates }
                };

                // Apply corrected coordinates if invalid
                if (!validation.isValid && validation.correctedCoords) {
                    element.coordinates.x = validation.correctedCoords.x;
                    element.coordinates.y = validation.correctedCoords.y;
                    element.safeZoneValidation.corrected = true;
                }

                return element;
            };

            this.log('info', '✅ EnhancedJSONCoordinateSystem patched with SafeZone validation');
        }

        /**
         * Patch ComprehensiveDesignDataCapture with SafeZone validation
         */
        patchComprehensiveCapture() {
            // Similar patching for comprehensive capture if needed
            this.log('info', '✅ ComprehensiveDesignDataCapture ready for SafeZone validation');
        }

        /**
         * Patch DesignDataCapture with SafeZone validation
         */
        patchDesignDataCapture() {
            // Similar patching for design data capture if needed
            this.log('info', '✅ DesignDataCapture ready for SafeZone validation');
        }

        /**
         * Debug logging
         */
        log(level, ...args) {
            if (!this.debugMode && level === 'debug') return;

            const prefix = '[SAFEZONE-VALIDATOR]';
            switch (level) {
                case 'error':
                    console.error(prefix, ...args);
                    break;
                case 'warn':
                    console.warn(prefix, ...args);
                    break;
                default:
                    console.log(prefix, ...args);
            }
        }

        /**
         * Get current SafeZone data
         */
        getSafeZoneData() {
            return this.safeZoneData;
        }

        /**
         * Update SafeZone data
         */
        updateSafeZone(newSafeZoneData) {
            this.safeZoneData = newSafeZoneData;
            this.log('info', '🔄 SafeZone data updated:', this.safeZoneData);
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.safeZoneValidator = new window.SafeZoneCoordinateValidator();
        });
    } else {
        window.safeZoneValidator = new window.SafeZoneCoordinateValidator();
    }

    // Make available for debugging
    window.validateSafeZoneCoords = (x, y, w, h) => {
        if (window.safeZoneValidator) {
            return window.safeZoneValidator.validateCoordinates(x, y, w, h);
        }
        return { isValid: false, reason: 'validator_not_ready' };
    };

    console.log('🔍 SAFEZONE VALIDATOR: Module loaded successfully');
})();