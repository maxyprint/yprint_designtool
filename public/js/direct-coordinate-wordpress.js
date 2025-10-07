/**
 * 🎯 DIRECT COORDINATE WORDPRESS INTEGRATION
 *
 * ULTRA-THINK Approach: Non-invasive WordPress Form Integration
 *
 * PURPOSE: Zusätzliche Form-Population für DirectCoordinate OHNE bestehende Systeme zu stören
 * - Ergänzt bestehende Form-Population, ersetzt sie NICHT
 * - Nutzt zusätzliche Form Fields: direct_design_data, direct_coordinate_json
 * - KEINE Änderungen an class-octo-print-designer-public.php
 * - Kann parallel zu bestehenden coordinate capture systems laufen
 * - Optional aktivierbar/deaktivierbar
 *
 * ACTIVATION:
 * - URL Parameter: ?direct_coordinates=1
 * - LocalStorage: directCoordinatesEnabled = 'true'
 * - Debug Interface: window.enableDirectCoordinates()
 *
 * @version 1.0.0
 * @author ULTRA-THINK Integration System
 */

(function() {
    'use strict';

    console.log('🎯 DIRECT COORDINATE WORDPRESS: Initializing non-invasive form integration...');

    /**
     * DirectCoordinate WordPress Form Integration Class
     */
    window.DirectCoordinateWordPress = class {
        constructor() {
            this.enabled = false;
            this.debugMode = false;
            this.populationInterval = null;
            this.lastPopulatedData = null;

            // Configuration
            this.config = {
                // Form field selectors for WordPress integration
                formFields: {
                    designData: [
                        'input[name="direct_design_data"]',
                        '#direct_design_data',
                        'textarea[name="direct_design_data"]'
                    ],
                    coordinateJson: [
                        'input[name="direct_coordinate_json"]',
                        '#direct_coordinate_json',
                        'textarea[name="direct_coordinate_json"]'
                    ]
                },

                // Population frequency (ms)
                populationInterval: 2000,

                // Enable conditions
                enableConditions: [
                    () => this.checkUrlParameter(),
                    () => this.checkLocalStorage(),
                    () => this.checkDebugFlag()
                ]
            };

            this.init();
        }

        /**
         * Initialize the DirectCoordinate WordPress Integration
         */
        init() {
            this.log('info', '🔧 DirectCoordinate WordPress Integration initializing...');

            // Check if system should be enabled
            if (this.shouldEnable()) {
                this.enable();
            }

            // Set up debug interface
            this.setupDebugInterface();

            this.log('info', '✅ DirectCoordinate WordPress Integration ready');
            this.log('info', '💡 Enable via: ?direct_coordinates=1 or window.enableDirectCoordinates()');
        }

        /**
         * Check if system should be enabled based on various conditions
         */
        shouldEnable() {
            return this.config.enableConditions.some(condition => condition());
        }

        /**
         * Check URL parameter activation
         */
        checkUrlParameter() {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('direct_coordinates') === '1';
        }

        /**
         * Check localStorage activation
         */
        checkLocalStorage() {
            try {
                return localStorage.getItem('directCoordinatesEnabled') === 'true';
            } catch (error) {
                return false;
            }
        }

        /**
         * Check debug flag activation
         */
        checkDebugFlag() {
            return window.directCoordinatesForceEnabled === true;
        }

        /**
         * Enable the DirectCoordinate system
         */
        enable() {
            if (this.enabled) {
                this.log('warn', '⚠️ DirectCoordinate WordPress already enabled');
                return;
            }

            this.enabled = true;
            this.log('info', '✅ DirectCoordinate WordPress Integration ENABLED');

            // Start form population
            this.startFormPopulation();

            // Add visual indicator
            this.addVisualIndicator();
        }

        /**
         * Disable the DirectCoordinate system
         */
        disable() {
            if (!this.enabled) {
                this.log('warn', '⚠️ DirectCoordinate WordPress already disabled');
                return;
            }

            this.enabled = false;
            this.log('info', '🛑 DirectCoordinate WordPress Integration DISABLED');

            // Stop form population
            this.stopFormPopulation();

            // Remove visual indicator
            this.removeVisualIndicator();

            // Clear localStorage
            try {
                localStorage.removeItem('directCoordinatesEnabled');
            } catch (error) {
                // Ignore storage errors
            }
        }

        /**
         * Start automated form population
         */
        startFormPopulation() {
            // Clear existing interval
            if (this.populationInterval) {
                clearInterval(this.populationInterval);
            }

            this.log('info', '🔄 Starting automated form population...');

            // Populate immediately
            this.populateWordPressForms();

            // Set up periodic population
            this.populationInterval = setInterval(() => {
                this.populateWordPressForms();
            }, this.config.populationInterval);
        }

        /**
         * Stop automated form population
         */
        stopFormPopulation() {
            if (this.populationInterval) {
                clearInterval(this.populationInterval);
                this.populationInterval = null;
                this.log('info', '🛑 Stopped automated form population');
            }
        }

        /**
         * Populate WordPress form fields with design data
         */
        populateWordPressForms() {
            if (!this.enabled) return;

            try {
                // Get design data from existing systems
                const designData = this.extractDesignData();

                if (!designData) {
                    this.log('debug', '📋 No design data available for population');
                    return;
                }

                // Check if data has changed to avoid unnecessary updates
                const dataString = JSON.stringify(designData);
                if (this.lastPopulatedData === dataString) {
                    this.log('debug', '📋 Design data unchanged, skipping population');
                    return;
                }

                this.lastPopulatedData = dataString;

                // Populate form fields
                this.populateDesignDataFields(designData);
                this.populateCoordinateJsonFields(designData);

                this.log('info', '✅ WordPress forms populated with DirectCoordinate data');
                this.log('debug', '📊 Populated data preview:', {
                    elements: designData.elements?.length || 0,
                    canvas: designData.canvas,
                    timestamp: designData.timestamp
                });

            } catch (error) {
                this.log('error', '❌ Error populating WordPress forms:', error);
            }
        }

        /**
         * Extract design data from available systems (non-invasive approach)
         */
        extractDesignData() {
            let designData = null;

            // Method 1: Use existing EnhancedJSONCoordinateSystem
            if (window.enhancedJSONSystem && typeof window.enhancedJSONSystem.generateDesignData === 'function') {
                try {
                    designData = window.enhancedJSONSystem.generateDesignData();
                    this.log('debug', '📦 Design data extracted via EnhancedJSONCoordinateSystem');
                } catch (error) {
                    this.log('warn', '⚠️ Failed to extract via EnhancedJSONCoordinateSystem:', error);
                }
            }

            // Method 2: Use global generateDesignData function
            if (!designData && typeof window.generateDesignData === 'function') {
                try {
                    designData = window.generateDesignData();
                    this.log('debug', '📦 Design data extracted via global generateDesignData');
                } catch (error) {
                    this.log('warn', '⚠️ Failed to extract via global generateDesignData:', error);
                }
            }

            // Method 3: Direct canvas inspection (fallback)
            if (!designData) {
                designData = this.directCanvasInspection();
                if (designData) {
                    this.log('debug', '📦 Design data extracted via direct canvas inspection');
                }
            }

            // Method 4: Create minimal fallback data
            if (!designData) {
                designData = this.createFallbackDesignData();
                this.log('debug', '📦 Using fallback design data');
            }

            return designData;
        }

        /**
         * Direct canvas inspection as fallback method
         */
        directCanvasInspection() {
            try {
                const canvasElements = document.querySelectorAll('canvas');

                for (const canvasEl of canvasElements) {
                    if (canvasEl.__fabric && canvasEl.__fabric.getObjects) {
                        const canvas = canvasEl.__fabric;
                        const objects = canvas.getObjects();

                        return {
                            timestamp: new Date().toISOString(),
                            canvas: {
                                id: canvasEl.id || 'unknown',
                                width: canvas.width || 0,
                                height: canvas.height || 0,
                                objects_count: objects.length
                            },
                            elements: objects.map((obj, index) => ({
                                index: index,
                                type: obj.type || 'unknown',
                                coordinates: {
                                    x: obj.left || 0,
                                    y: obj.top || 0,
                                    width: obj.width || 0,
                                    height: obj.height || 0
                                }
                            })),
                            metadata: {
                                system: 'DirectCoordinateWordPress',
                                method: 'directCanvasInspection',
                                version: '1.0.0'
                            }
                        };
                    }
                }

            } catch (error) {
                this.log('warn', '⚠️ Direct canvas inspection failed:', error);
            }

            return null;
        }

        /**
         * Create minimal fallback design data
         */
        createFallbackDesignData() {
            return {
                timestamp: new Date().toISOString(),
                canvas: { width: 0, height: 0, objects_count: 0 },
                elements: [],
                metadata: {
                    system: 'DirectCoordinateWordPress',
                    method: 'fallback',
                    version: '1.0.0',
                    note: 'No design data available'
                }
            };
        }

        /**
         * Populate design data form fields
         */
        populateDesignDataFields(designData) {
            const serializedData = JSON.stringify(designData);

            this.config.formFields.designData.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element.value !== serializedData) {
                        element.value = serializedData;

                        // Trigger change event for form frameworks
                        element.dispatchEvent(new Event('change', { bubbles: true }));

                        this.log('debug', `📝 Populated ${selector} with design data`);
                    }
                });
            });
        }

        /**
         * Populate coordinate JSON form fields
         */
        populateCoordinateJsonFields(designData) {
            // Create simplified coordinate-focused data
            const coordinateData = {
                timestamp: designData.timestamp,
                coordinates: designData.elements?.map(el => el.coordinates) || [],
                canvas_dimensions: {
                    width: designData.canvas?.width || 0,
                    height: designData.canvas?.height || 0
                },
                metadata: {
                    system: 'DirectCoordinateWordPress',
                    version: '1.0.0',
                    elements_count: designData.elements?.length || 0
                }
            };

            const serializedCoords = JSON.stringify(coordinateData);

            this.config.formFields.coordinateJson.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element.value !== serializedCoords) {
                        element.value = serializedCoords;

                        // Trigger change event for form frameworks
                        element.dispatchEvent(new Event('change', { bubbles: true }));

                        this.log('debug', `📝 Populated ${selector} with coordinate data`);
                    }
                });
            });
        }

        /**
         * Add visual indicator that DirectCoordinate is active
         */
        addVisualIndicator() {
            // Remove existing indicator first
            this.removeVisualIndicator();

            const indicator = document.createElement('div');
            indicator.id = 'direct-coordinate-indicator';
            indicator.innerHTML = '🎯 DirectCoordinate Active';
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #28a745;
                color: white;
                padding: 8px 16px;
                border-radius: 4px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 12px;
                font-weight: bold;
                z-index: 9999;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                cursor: pointer;
            `;

            // Click to disable
            indicator.addEventListener('click', () => {
                this.disable();
            });

            document.body.appendChild(indicator);
            this.log('info', '👁️ Visual indicator added (click to disable)');
        }

        /**
         * Remove visual indicator
         */
        removeVisualIndicator() {
            const indicator = document.getElementById('direct-coordinate-indicator');
            if (indicator) {
                indicator.remove();
                this.log('info', '👁️ Visual indicator removed');
            }
        }

        /**
         * Setup debug interface
         */
        setupDebugInterface() {
            // Global enable function
            window.enableDirectCoordinates = () => {
                try {
                    localStorage.setItem('directCoordinatesEnabled', 'true');
                } catch (error) {
                    // Fallback to window flag
                    window.directCoordinatesForceEnabled = true;
                }
                this.enable();
                return 'DirectCoordinate WordPress Integration enabled';
            };

            // Global disable function
            window.disableDirectCoordinates = () => {
                this.disable();
                return 'DirectCoordinate WordPress Integration disabled';
            };

            // Global status function
            window.directCoordinateStatus = () => {
                return {
                    enabled: this.enabled,
                    debugMode: this.debugMode,
                    lastPopulated: this.lastPopulatedData ? 'Available' : 'None',
                    formFieldsFound: this.scanForFormFields()
                };
            };

            // Global test function
            window.testDirectCoordinatePopulation = () => {
                if (!this.enabled) {
                    return 'DirectCoordinate not enabled. Use enableDirectCoordinates() first.';
                }
                this.populateWordPressForms();
                return 'Form population triggered';
            };

            this.log('info', '🐛 Debug interface ready:');
            this.log('info', '  - enableDirectCoordinates()');
            this.log('info', '  - disableDirectCoordinates()');
            this.log('info', '  - directCoordinateStatus()');
            this.log('info', '  - testDirectCoordinatePopulation()');
        }

        /**
         * Scan for available form fields
         */
        scanForFormFields() {
            const found = {
                designData: [],
                coordinateJson: []
            };

            // Scan design data fields
            this.config.formFields.designData.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    found.designData.push(`${selector} (${elements.length})`);
                }
            });

            // Scan coordinate JSON fields
            this.config.formFields.coordinateJson.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    found.coordinateJson.push(`${selector} (${elements.length})`);
                }
            });

            return found;
        }

        /**
         * Enable debug mode
         */
        enableDebugMode() {
            this.debugMode = true;
            this.log('info', '🐛 Debug mode enabled');
        }

        /**
         * Disable debug mode
         */
        disableDebugMode() {
            this.debugMode = false;
            this.log('info', '🐛 Debug mode disabled');
        }

        /**
         * Debug logging with levels
         */
        log(level, ...args) {
            const prefix = '[DIRECT-COORDINATE-WP]';

            switch (level) {
                case 'error':
                    console.error(prefix, ...args);
                    break;
                case 'warn':
                    console.warn(prefix, ...args);
                    break;
                case 'debug':
                    if (this.debugMode || window.directCoordinateDebug) {
                        console.log(prefix, '[DEBUG]', ...args);
                    }
                    break;
                default:
                    console.log(prefix, ...args);
            }
        }

        /**
         * Get current system status
         */
        getStatus() {
            return {
                enabled: this.enabled,
                debugMode: this.debugMode,
                populationActive: !!this.populationInterval,
                lastDataUpdate: this.lastPopulatedData ? new Date().toISOString() : null,
                formFieldsAvailable: this.scanForFormFields(),
                version: '1.0.0'
            };
        }
    };

    /**
     * Auto-initialize system
     */
    function initializeDirectCoordinateWordPress() {
        // Check if DirectCoordinateModule is available (optional dependency)
        const hasDirectCoordinateModule = typeof window.DirectCoordinateModule !== 'undefined';

        if (hasDirectCoordinateModule) {
            console.log('🎯 DIRECT COORDINATE WORDPRESS: DirectCoordinateModule detected, enhanced integration available');
        }

        // Initialize the WordPress integration
        window.directCoordinateWordPress = new window.DirectCoordinateWordPress();

        console.log('🎯 DIRECT COORDINATE WORDPRESS: Integration ready');
        console.log('💡 Activation methods:');
        console.log('  - URL: ?direct_coordinates=1');
        console.log('  - Function: enableDirectCoordinates()');
        console.log('  - Status: directCoordinateStatus()');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeDirectCoordinateWordPress);
    } else {
        initializeDirectCoordinateWordPress();
    }

    // A/B Testing Framework Integration
    window.DirectCoordinateABTest = {
        /**
         * Compare DirectCoordinate vs Legacy coordinate systems
         */
        compareCoordinateSystems: function() {
            console.log('🧪 A/B TEST: Comparing coordinate systems...');

            const results = {
                directCoordinate: null,
                legacy: null,
                comparison: null
            };

            try {
                // Get DirectCoordinate data
                if (window.directCoordinateWordPress && window.directCoordinateWordPress.enabled) {
                    results.directCoordinate = window.directCoordinateWordPress.extractDesignData();
                }

                // Get legacy system data
                if (window.enhancedJSONSystem) {
                    results.legacy = window.enhancedJSONSystem.generateDesignData();
                }

                // Compare results
                if (results.directCoordinate && results.legacy) {
                    results.comparison = {
                        elementsMatch: results.directCoordinate.elements?.length === results.legacy.elements?.length,
                        canvasDimensionsMatch: (
                            results.directCoordinate.canvas?.width === results.legacy.canvas?.width &&
                            results.directCoordinate.canvas?.height === results.legacy.canvas?.height
                        ),
                        coordinateAccuracy: this.calculateCoordinateAccuracy(
                            results.directCoordinate.elements,
                            results.legacy.elements
                        )
                    };
                }

                console.log('🧪 A/B TEST Results:', results);
                return results;

            } catch (error) {
                console.error('🧪 A/B TEST Error:', error);
                return { error: error.message };
            }
        },

        /**
         * Calculate coordinate accuracy between systems
         */
        calculateCoordinateAccuracy: function(directElements, legacyElements) {
            if (!directElements || !legacyElements || directElements.length !== legacyElements.length) {
                return 0;
            }

            let matchingCoordinates = 0;
            const tolerance = 1; // 1px tolerance

            for (let i = 0; i < directElements.length; i++) {
                const direct = directElements[i]?.coordinates;
                const legacy = legacyElements[i]?.coordinates;

                if (direct && legacy) {
                    const xMatch = Math.abs(direct.x - legacy.x) <= tolerance;
                    const yMatch = Math.abs(direct.y - legacy.y) <= tolerance;

                    if (xMatch && yMatch) {
                        matchingCoordinates++;
                    }
                }
            }

            return (matchingCoordinates / directElements.length) * 100;
        }
    };

    console.log('🎯 DIRECT COORDINATE WORDPRESS: Module loaded - Ready for non-invasive WordPress integration!');

})();