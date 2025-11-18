/**
 * 🎯 AGENT 3: MEASUREMENT DATABASE INTEGRATION SYSTEM
 * Issue #22 Enhancement: Auto-assignment with Issue #19 database connection
 *
 * Provides seamless integration between measurement definition system and
 * Issue #19 measurement database for automatic target value retrieval and validation.
 */

class MeasurementDatabaseIntegration {
    constructor() {
        this.endpoint = window.ajaxurl || '/wp-admin/admin-ajax.php';
        this.nonce = window.pointToPointAjax?.nonce || '';
        this.templateId = null;
        this.currentSize = 'M';
        this.measurementDatabase = {};
        this.sizingData = {};

        console.log('🎯 AGENT 3: MeasurementDatabaseIntegration initialized');
        this.initializeIntegration();
    }

    /**
     * 🚀 Initialize Database Integration
     */
    async initializeIntegration() {
        console.log('🚀 AGENT 3: Initializing database integration...');

        // Get template ID from global context
        this.templateId = this.detectTemplateId();

        if (this.templateId) {
            console.log(`📋 AGENT 3: Template ID detected: ${this.templateId}`);
            await this.loadMeasurementDatabase();
        } else {
            console.warn('⚠️ AGENT 3: Template ID not found - using fallback data');
            this.loadFallbackData();
        }
    }

    /**
     * 🔍 Detect Template ID from Various Sources
     */
    detectTemplateId() {
        // Try multiple sources for template ID
        const sources = [
            () => window.templateId,
            () => window.currentTemplateId,
            () => document.querySelector('[name="post_ID"]')?.value,
            () => new URLSearchParams(window.location.search).get('post'),
            () => document.querySelector('#post_ID')?.value,
            () => window.multiViewSelector?.templateId
        ];

        for (const source of sources) {
            try {
                const id = source();
                if (id) {
                    console.log(`✅ AGENT 3: Template ID found via source: ${id}`);
                    return id;
                }
            } catch (error) {
                // Continue to next source
            }
        }

        console.warn('⚠️ AGENT 3: Template ID not found in any source');
        return null;
    }

    /**
     * 💾 Load Measurement Database from Issue #19
     */
    async loadMeasurementDatabase() {
        console.log('💾 AGENT 3: Loading measurement database from Issue #19...');

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'get_database_measurement_types', // Issue #19 database endpoint
                    template_id: this.templateId,
                    include_sizing_data: 'true',
                    include_target_values: 'true',
                    nonce: this.nonce
                })
            });

            const data = await response.json();

            if (data.success && data.data) {
                this.processDatabaseResponse(data.data);
                console.log('✅ AGENT 3: Database loaded successfully');
            } else {
                console.warn('⚠️ AGENT 3: Database endpoint failed, trying legacy...');
                await this.loadLegacyMeasurements();
            }

        } catch (error) {
            console.error('❌ AGENT 3: Database loading failed:', error);
            await this.loadLegacyMeasurements();
        }
    }

    /**
     * 🔄 Load Legacy Measurements as Fallback
     */
    async loadLegacyMeasurements() {
        console.log('🔄 AGENT 3: Loading legacy measurements...');

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'get_template_measurements', // Legacy endpoint
                    template_id: this.templateId,
                    nonce: this.nonce
                })
            });

            const data = await response.json();

            if (data.success && data.data) {
                this.processLegacyResponse(data.data);
                console.log('✅ AGENT 3: Legacy data loaded');
            } else {
                console.warn('⚠️ AGENT 3: Legacy endpoint also failed, using fallback');
                this.loadFallbackData();
            }

        } catch (error) {
            console.error('❌ AGENT 3: Legacy loading failed:', error);
            this.loadFallbackData();
        }
    }

    /**
     * 📊 Process Database Response from Issue #19
     */
    processDatabaseResponse(data) {
        console.log('📊 AGENT 3: Processing database response...');

        // Store measurement types
        this.measurementDatabase = data.measurement_types || {};

        // Store sizing data for each measurement type and size
        this.sizingData = data.sizing_data || {};

        // Store additional metadata
        this.databaseMetadata = {
            total_measurement_types: data.total_measurement_types || 0,
            total_sizes: data.total_sizes || 0,
            total_measurements: data.total_measurements || 0,
            coverage_percentage: data.coverage_stats?.coverage_percentage || 0,
            last_updated: data.last_updated || null
        };

        console.log(`📊 AGENT 3: Processed ${Object.keys(this.measurementDatabase).length} measurement types`);
        console.log(`📊 AGENT 3: Database coverage: ${this.databaseMetadata.coverage_percentage}%`);
    }

    /**
     * 🔄 Process Legacy Response
     */
    processLegacyResponse(data) {
        console.log('🔄 AGENT 3: Processing legacy response...');

        this.measurementDatabase = data.measurement_types || {};

        // Create basic sizing data from template sizes
        this.sizingData = {};
        const templateSizes = data.template_sizes || [];

        templateSizes.forEach(size => {
            Object.keys(this.measurementDatabase).forEach(key => {
                if (!this.sizingData[key]) this.sizingData[key] = {};
                // Use basic fallback values for legacy data
                this.sizingData[key][size.id] = this.generateFallbackValue(key, size.id);
            });
        });

        this.databaseMetadata = {
            source: 'legacy',
            measurement_count: Object.keys(this.measurementDatabase).length
        };

        console.log('🔄 AGENT 3: Legacy data processed');
    }

    /**
     * 🔧 Load Fallback Data
     */
    loadFallbackData() {
        console.log('🔧 AGENT 3: Loading fallback measurement data...');

        // Comprehensive measurement types based on typical garment measurements
        this.measurementDatabase = {
            'A': {
                label: 'Chest',
                description: 'Chest width measurement',
                category: 'horizontal'
            },
            'B': {
                label: 'Hem Width',
                description: 'Width at the bottom hem',
                category: 'horizontal'
            },
            'C': {
                label: 'Height from Shoulder',
                description: 'Vertical length from shoulder to bottom',
                category: 'vertical'
            },
            'D': {
                label: 'Sleeve Length',
                description: 'Length of the sleeve',
                category: 'vertical'
            },
            'E': {
                label: 'Sleeve Opening',
                description: 'Width of sleeve opening',
                category: 'horizontal'
            },
            'F': {
                label: 'Shoulder to Shoulder',
                description: 'Width across shoulders',
                category: 'horizontal'
            },
            'G': {
                label: 'Neck Opening',
                description: 'Neck circumference',
                category: 'circular'
            },
            'H': {
                label: 'Biceps',
                description: 'Bicep circumference',
                category: 'circular'
            },
            'J': {
                label: 'Rib Height',
                description: 'Height to rib area',
                category: 'vertical'
            }
        };

        // Generate fallback sizing data
        this.generateFallbackSizingData();

        this.databaseMetadata = {
            source: 'fallback',
            note: 'Using default measurement values - connect Issue #19 database for accurate data'
        };

        console.log('🔧 AGENT 3: Fallback data loaded');
    }

    /**
     * 📏 Generate Fallback Sizing Data
     */
    generateFallbackSizingData() {
        const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

        sizes.forEach(size => {
            Object.keys(this.measurementDatabase).forEach(key => {
                if (!this.sizingData[key]) this.sizingData[key] = {};
                this.sizingData[key][size] = this.generateFallbackValue(key, size);
            });
        });
    }

    /**
     * 🎯 Generate Fallback Value for Measurement
     */
    generateFallbackValue(measurementKey, size) {
        // Size multipliers
        const sizeMultipliers = {
            'XS': 0.85,
            'S': 0.92,
            'M': 1.0,
            'L': 1.08,
            'XL': 1.16,
            'XXL': 1.24
        };

        // Base values for different measurement types
        const baseValues = {
            'A': 52.0,  // Chest
            'B': 48.0,  // Hem Width
            'C': 68.0,  // Height from Shoulder
            'D': 22.0,  // Sleeve Length
            'E': 12.0,  // Sleeve Opening
            'F': 44.0,  // Shoulder to Shoulder
            'G': 18.0,  // Neck Opening
            'H': 32.0,  // Biceps
            'J': 15.0   // Rib Height
        };

        const baseValue = baseValues[measurementKey] || 50.0;
        const multiplier = sizeMultipliers[size] || 1.0;

        return Math.round((baseValue * multiplier) * 10) / 10; // Round to 1 decimal place
    }

    /**
     * 🎯 Get Target Value for Measurement
     */
    getTargetValue(measurementKey, size = null) {
        const useSize = size || this.currentSize;

        console.log(`🎯 AGENT 3: Getting target value for ${measurementKey} (size ${useSize})`);

        try {
            if (this.sizingData[measurementKey] && this.sizingData[measurementKey][useSize]) {
                const value = this.sizingData[measurementKey][useSize];
                console.log(`✅ AGENT 3: Target value found: ${value}cm`);
                return value;
            }

            // Fallback to any available size
            if (this.sizingData[measurementKey]) {
                const availableSizes = Object.keys(this.sizingData[measurementKey]);
                if (availableSizes.length > 0) {
                    const fallbackValue = this.sizingData[measurementKey][availableSizes[0]];
                    console.log(`⚠️ AGENT 3: Using fallback size (${availableSizes[0]}): ${fallbackValue}cm`);
                    return fallbackValue;
                }
            }

            // Final fallback
            const fallbackValue = this.generateFallbackValue(measurementKey, useSize);
            console.log(`🔧 AGENT 3: Generated fallback value: ${fallbackValue}cm`);
            return fallbackValue;

        } catch (error) {
            console.error('❌ AGENT 3: Error getting target value:', error);
            return 50.0; // Ultimate fallback
        }
    }

    /**
     * 📊 Get Measurement Information
     */
    getMeasurementInfo(measurementKey) {
        const measurement = this.measurementDatabase[measurementKey];

        if (measurement) {
            return {
                key: measurementKey,
                label: measurement.label,
                description: measurement.description || measurement.label,
                category: measurement.category || 'unknown',
                targetValue: this.getTargetValue(measurementKey),
                hasTargetData: !!this.sizingData[measurementKey]
            };
        }

        return null;
    }

    /**
     * 📋 Get All Available Measurements
     */
    getAllMeasurements() {
        return Object.keys(this.measurementDatabase).map(key => {
            return {
                key,
                ...this.getMeasurementInfo(key)
            };
        });
    }

    /**
     * 🔄 Set Current Size
     */
    setCurrentSize(size) {
        this.currentSize = size;
        console.log(`🔄 AGENT 3: Current size set to ${size}`);
    }

    /**
     * 💾 Save Measurement Assignment
     */
    async saveMeasurementAssignment(measurementData) {
        console.log('💾 AGENT 3: Saving measurement assignment to database...');

        // Enhance measurement data with database information
        const enhancedData = {
            ...measurementData,
            template_id: this.templateId,
            current_size: this.currentSize,
            target_value: this.getTargetValue(measurementData.measurement_key),
            database_source: this.databaseMetadata.source || 'unknown',
            auto_assigned: true,
            created_via: 'measurement_definition_system'
        };

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'save_measurement_assignment', // Enhanced save endpoint
                    measurement_data: JSON.stringify(enhancedData),
                    nonce: this.nonce
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ AGENT 3: Measurement assignment saved successfully');
                return result;
            } else {
                throw new Error(result.data || 'Save failed');
            }

        } catch (error) {
            console.error('❌ AGENT 3: Failed to save measurement assignment:', error);

            // Fallback to existing save method
            return this.fallbackSave(enhancedData);
        }
    }

    /**
     * 🔄 Fallback Save Method
     */
    async fallbackSave(measurementData) {
        console.log('🔄 AGENT 3: Using fallback save method...');

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'save_reference_line_assignment', // Legacy endpoint
                    measurement_data: JSON.stringify(measurementData),
                    nonce: this.nonce
                })
            });

            const result = await response.json();
            console.log('✅ AGENT 3: Fallback save completed');
            return result;

        } catch (error) {
            console.error('❌ AGENT 3: Fallback save also failed:', error);
            throw error;
        }
    }

    /**
     * 📊 Get Database Statistics
     */
    getDatabaseStats() {
        return {
            ...this.databaseMetadata,
            measurement_types_count: Object.keys(this.measurementDatabase).length,
            sizing_data_count: Object.keys(this.sizingData).length,
            current_template: this.templateId,
            current_size: this.currentSize
        };
    }

    /**
     * 🧪 Test Database Connection
     */
    async testConnection() {
        console.log('🧪 AGENT 3: Testing database connection...');

        const tests = {
            hasEndpoint: !!this.endpoint,
            hasNonce: !!this.nonce,
            hasTemplateId: !!this.templateId,
            hasMeasurementTypes: Object.keys(this.measurementDatabase).length > 0,
            hasSizingData: Object.keys(this.sizingData).length > 0,
            databaseSource: this.databaseMetadata.source
        };

        // Test actual database connectivity
        if (this.templateId) {
            try {
                const response = await fetch(this.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'test_measurement_database_connection',
                        template_id: this.templateId,
                        nonce: this.nonce
                    })
                });

                const result = await response.json();
                tests.connectionTest = result.success ? 'passed' : 'failed';
                tests.connectionDetails = result.data;

            } catch (error) {
                tests.connectionTest = 'error';
                tests.connectionError = error.message;
            }
        }

        console.log('📊 AGENT 3: Connection test results:', tests);
        return tests;
    }
}

// Initialize database integration when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 AGENT 3: DOM ready - initializing database integration...');

    // Create global instance
    window.measurementDatabaseIntegration = new MeasurementDatabaseIntegration();

    // Wait for measurement definition system and integrate
    const checkIntegration = setInterval(() => {
        if (window.measurementDefinitionSystem) {
            console.log('✅ AGENT 3: Integrating with measurement definition system...');

            // Enhance measurement definition system with database integration
            const originalFetchTargetValue = window.measurementDefinitionSystem.fetchTargetValue;

            window.measurementDefinitionSystem.fetchTargetValue = async function(measurementKey) {
                console.log(`🔗 AGENT 3: Enhanced target value fetch for ${measurementKey}`);

                // Use database integration for target values
                const targetValue = window.measurementDatabaseIntegration.getTargetValue(measurementKey);

                this.targetValue = targetValue;

                // Update UI
                const targetElement = document.querySelector('.target-value');
                if (targetElement) {
                    const size = window.measurementDatabaseIntegration.currentSize;
                    targetElement.textContent = `${targetValue}cm (Size ${size})`;
                }

                console.log(`✅ AGENT 3: Enhanced target value: ${targetValue}cm`);
                return targetValue;
            };

            // Enhance save functionality
            const originalSave = window.measurementDefinitionSystem.saveMeasurement;

            window.measurementDefinitionSystem.saveMeasurement = async function() {
                console.log('🔗 AGENT 3: Enhanced measurement save...');

                // Use database integration for saving
                const measurementData = {
                    measurement_key: this.selectedMeasurementType,
                    measurement_label: this.selector.measurementTypes[this.selectedMeasurementType].label,
                    start: this.selectedPoints[0],
                    end: this.selectedPoints[1],
                    lengthPx: Math.sqrt(
                        Math.pow(this.selectedPoints[1].x - this.selectedPoints[0].x, 2) +
                        Math.pow(this.selectedPoints[1].y - this.selectedPoints[0].y, 2)
                    ),
                    measured_length: this.measuredLength,
                    target_value: this.targetValue,
                    accuracy: this.accuracy,
                    created_via: 'measurement_definition_system',
                    auto_assigned: true
                };

                try {
                    await window.measurementDatabaseIntegration.saveMeasurementAssignment(measurementData);
                    console.log('✅ AGENT 3: Enhanced save completed');
                    this.closeMeasurementPanel();
                } catch (error) {
                    console.error('❌ AGENT 3: Enhanced save failed:', error);
                }
            };

            console.log('🔗 AGENT 3: Integration complete');
            clearInterval(checkIntegration);
        }
    }, 1000);

    // Timeout after 30 seconds
    setTimeout(() => {
        clearInterval(checkIntegration);
    }, 30000);
});

console.log('🎯 AGENT 3: MeasurementDatabaseIntegration class loaded');