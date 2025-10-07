/**
 * 🎯 DIRECT COORDINATE MODULE - Ultra-Simple Parallel Coordinate System
 *
 * PHILOSOPHY: Pure 1:1 Fabric.js coordinate capture WITHOUT transformations
 * APPROACH: Runs PARALLEL to existing systems - does NOT replace them
 * PURPOSE: Alternative API for simple coordinate capture and testing
 *
 * API:
 * - window.DirectCoordinates.capture(obj) - Capture single object coordinates
 * - window.DirectCoordinates.generateData() - Generate complete design data
 * - window.DirectCoordinates.debug() - Debug comparison with legacy systems
 */

(function() {
    'use strict';

    console.log('🎯 DIRECT COORDINATE MODULE: Initializing parallel coordinate system...');

    class DirectCoordinateModule {
        constructor() {
            this.version = '1.0.0';
            this.namespace = 'DirectCoordinates';
            this.debug = false;

            console.log(`🔧 ${this.namespace} v${this.version}: Ready for parallel operation`);
        }

        /**
         * 🎯 CORE FUNCTION: Capture single object coordinates (1:1 Fabric.js)
         * NO transformations, NO calculations, PURE fabric properties
         */
        capture(fabricObject) {
            if (!fabricObject) {
                return { error: 'No fabric object provided' };
            }

            // Pure 1:1 Fabric.js property extraction
            const coordinates = {
                // Basic positioning (direct from Fabric.js)
                left: fabricObject.left || 0,
                top: fabricObject.top || 0,

                // Dimensions (direct from Fabric.js)
                width: fabricObject.width || 0,
                height: fabricObject.height || 0,

                // Scaling (direct from Fabric.js)
                scaleX: fabricObject.scaleX || 1,
                scaleY: fabricObject.scaleY || 1,

                // Rotation (direct from Fabric.js)
                angle: fabricObject.angle || 0,

                // Object type (direct from Fabric.js)
                type: fabricObject.type || 'unknown',

                // Calculated actual dimensions (for convenience)
                actualWidth: (fabricObject.width || 0) * (fabricObject.scaleX || 1),
                actualHeight: (fabricObject.height || 0) * (fabricObject.scaleY || 1),

                // Capture timestamp
                captured_at: new Date().toISOString()
            };

            if (this.debug) {
                console.log(`📍 DirectCoordinates.capture():`, coordinates);
            }

            return coordinates;
        }

        /**
         * 🎯 ALTERNATIVE TO generateDesignData() - Simple canvas capture
         * Pure fabric coordinate extraction without complex logic
         */
        generateData() {
            console.log('🎯 DirectCoordinates.generateData(): Starting simple coordinate capture...');

            try {
                // Simple canvas discovery (no complex validation)
                const canvas = this.findCanvas();
                if (!canvas) {
                    return {
                        error: 'No fabric canvas found',
                        timestamp: new Date().toISOString(),
                        system: 'DirectCoordinates'
                    };
                }

                // Get all objects from canvas
                const objects = canvas.getObjects();

                // Capture coordinates for each object (pure 1:1)
                const elements = objects.map((obj, index) => ({
                    index: index,
                    id: obj.id || `element_${index}`,
                    ...this.capture(obj)
                }));

                // Simple design data structure
                const designData = {
                    // Timestamp
                    timestamp: new Date().toISOString(),

                    // Canvas basics (no complex calculations)
                    canvas: {
                        width: canvas.width || 0,
                        height: canvas.height || 0,
                        zoom: canvas.getZoom ? canvas.getZoom() : 1.0,
                        object_count: objects.length
                    },

                    // Pure coordinate data
                    elements: elements,

                    // System identification
                    system: {
                        name: 'DirectCoordinateModule',
                        version: this.version,
                        method: 'direct_fabric_capture',
                        philosophy: 'pure_1to1_coordinates'
                    }
                };

                console.log(`✅ DirectCoordinates: Captured ${elements.length} elements with pure coordinates`);

                if (this.debug) {
                    console.log('🎯 DirectCoordinates.generateData() result:', designData);
                }

                return designData;

            } catch (error) {
                console.error('❌ DirectCoordinates.generateData() error:', error);
                return {
                    error: error.message,
                    timestamp: new Date().toISOString(),
                    system: 'DirectCoordinates'
                };
            }
        }

        /**
         * Simple canvas discovery (no complex validation)
         */
        findCanvas() {
            // Try common canvas references
            if (window.canvas && window.canvas.getObjects) {
                return window.canvas;
            }

            if (window.fabricCanvas && window.fabricCanvas.getObjects) {
                return window.fabricCanvas;
            }

            // Try canvas singleton manager
            if (window.canvasSingletonManager && window.canvasSingletonManager.canvas) {
                return window.canvasSingletonManager.canvas;
            }

            // Try finding in global scope
            for (let key in window) {
                if (window[key] &&
                    typeof window[key] === 'object' &&
                    typeof window[key].getObjects === 'function') {
                    console.log(`🎯 DirectCoordinates: Found canvas via window.${key}`);
                    return window[key];
                }
            }

            console.warn('⚠️ DirectCoordinates: No fabric canvas found');
            return null;
        }

        /**
         * 🔍 DEBUG COMPARISON: Compare DirectCoordinates with legacy systems
         */
        debug() {
            console.log('🔍 DIRECT COORDINATES DEBUG: Comparing with legacy systems...');

            const results = {
                DirectCoordinates: null,
                LegacySystems: {}
            };

            // Capture with DirectCoordinates
            try {
                results.DirectCoordinates = this.generateData();
                console.log('✅ DirectCoordinates capture: SUCCESS');
            } catch (error) {
                results.DirectCoordinates = { error: error.message };
                console.log('❌ DirectCoordinates capture: FAILED');
            }

            // Test legacy systems for comparison
            const legacySystems = [
                'generateDesignData',
                'enhancedJSONSystem',
                'optimizedCaptureInstance'
            ];

            legacySystems.forEach(systemName => {
                try {
                    let result = null;

                    if (systemName === 'generateDesignData' && typeof window.generateDesignData === 'function') {
                        result = window.generateDesignData();
                    } else if (systemName === 'enhancedJSONSystem' && window.enhancedJSONSystem) {
                        result = window.enhancedJSONSystem.generateDesignData();
                    } else if (systemName === 'optimizedCaptureInstance' && window.optimizedCaptureInstance) {
                        result = window.optimizedCaptureInstance.generateDesignData();
                    }

                    if (result) {
                        results.LegacySystems[systemName] = {
                            status: 'SUCCESS',
                            elements_count: result.elements ? result.elements.length : 0,
                            has_coordinates: !!(result.elements && result.elements[0] && result.elements[0].coordinates)
                        };
                        console.log(`✅ ${systemName}: SUCCESS (${results.LegacySystems[systemName].elements_count} elements)`);
                    } else {
                        results.LegacySystems[systemName] = { status: 'NO_DATA' };
                        console.log(`⚠️ ${systemName}: NO_DATA`);
                    }

                } catch (error) {
                    results.LegacySystems[systemName] = { status: 'ERROR', error: error.message };
                    console.log(`❌ ${systemName}: ERROR - ${error.message}`);
                }
            });

            // Comparison summary
            console.log('\n📊 SYSTEM COMPARISON SUMMARY:');
            console.log('DirectCoordinates elements:', results.DirectCoordinates?.elements?.length || 0);

            Object.entries(results.LegacySystems).forEach(([system, data]) => {
                console.log(`${system} elements:`, data.elements_count || 0);
            });

            return results;
        }

        /**
         * Enable/disable debug mode
         */
        setDebug(enabled) {
            this.debug = enabled;
            console.log(`🔧 DirectCoordinates debug mode: ${enabled ? 'ENABLED' : 'DISABLED'}`);
        }

        /**
         * Get module info
         */
        getInfo() {
            return {
                name: 'DirectCoordinateModule',
                version: this.version,
                namespace: this.namespace,
                philosophy: 'Pure 1:1 Fabric.js coordinate capture',
                api: [
                    'DirectCoordinates.capture(obj)',
                    'DirectCoordinates.generateData()',
                    'DirectCoordinates.debug()',
                    'DirectCoordinates.setDebug(boolean)'
                ]
            };
        }
    }

    // Initialize and expose the module
    const directCoordinates = new DirectCoordinateModule();

    // Expose to global scope with its own namespace
    window.DirectCoordinates = {
        // Main API methods
        capture: (obj) => directCoordinates.capture(obj),
        generateData: () => directCoordinates.generateData(),

        // Debug and utility methods
        debug: () => directCoordinates.debug(),
        setDebug: (enabled) => directCoordinates.setDebug(enabled),
        getInfo: () => directCoordinates.getInfo(),

        // Version info
        version: directCoordinates.version
    };

    console.log('✅ DIRECT COORDINATE MODULE: Successfully initialized and ready for parallel operation!');
    console.log('💡 USAGE:');
    console.log('   DirectCoordinates.generateData() - Alternative to generateDesignData()');
    console.log('   DirectCoordinates.capture(obj) - Capture single object coordinates');
    console.log('   DirectCoordinates.debug() - Compare with legacy systems');
    console.log('   DirectCoordinates.setDebug(true) - Enable debug mode');

})();