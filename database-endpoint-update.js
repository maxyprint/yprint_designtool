/**
 * 🛡️ AGENT-6 DATABASE BRIDGE SPECIALIST: JavaScript Update
 *
 * Updated loadMeasurementTypes() function to use the new database endpoint
 * This replaces the existing function in multi-view-point-to-point-selector.js
 */

/**
 * AGENT-6 ENHANCEMENT: Updated measurement loading with database integration
 * Uses get_database_measurement_types endpoint instead of legacy get_template_measurements
 */
async loadMeasurementTypes() {
    console.log('🛡️ AGENT-6: Loading measurement types from database...');

    try {
        // AGENT-6: Try new database endpoint first
        const databaseResponse = await fetch(pointToPointAjax.ajaxurl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'get_database_measurement_types', // NEW DATABASE ENDPOINT
                template_id: this.templateId,
                nonce: pointToPointAjax.nonce
            })
        });

        const databaseData = await databaseResponse.json();

        if (databaseData.success && databaseData.data.data_source === 'database') {
            console.log('✅ AGENT-6: Successfully loaded from database endpoint');

            // Enhanced measurement types with database metadata
            this.measurementTypes = databaseData.data.measurement_types;
            this.templateSizes = databaseData.data.template_sizes || [];
            this.coverageStats = databaseData.data.coverage_stats || {};

            // Store additional database information
            this.databaseIntegration = {
                active: true,
                totalMeasurementTypes: databaseData.data.total_measurement_types,
                totalSizes: databaseData.data.total_sizes,
                totalMeasurements: databaseData.data.total_measurements,
                coveragePercentage: databaseData.data.coverage_stats?.coverage_percentage || 0
            };

            this.populateEnhancedMeasurementDropdown();

            // Log success metrics
            console.log(`🛡️ AGENT-6 Database Integration Success:
                • Template ID: ${this.templateId}
                • Measurement Types: ${this.databaseIntegration.totalMeasurementTypes}
                • Template Sizes: ${this.databaseIntegration.totalSizes}
                • Coverage: ${this.databaseIntegration.coveragePercentage}%`
            );

            return true; // Success with database

        } else {
            console.warn('⚠️ AGENT-6: Database endpoint failed, falling back to legacy...');
            throw new Error('Database endpoint not available');
        }

    } catch (databaseError) {
        console.error('❌ AGENT-6: Database endpoint error:', databaseError);

        // FALLBACK: Use legacy endpoint
        try {
            console.log('🔄 AGENT-6: Attempting legacy fallback...');

            const legacyResponse = await fetch(pointToPointAjax.ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'get_template_measurements', // LEGACY ENDPOINT
                    template_id: this.templateId,
                    nonce: pointToPointAjax.nonce
                })
            });

            const legacyData = await legacyResponse.json();

            if (legacyData.success) {
                console.log('⚠️ AGENT-6: Using legacy endpoint (limited functionality)');

                this.measurementTypes = legacyData.data.measurement_types;
                this.templateSizes = legacyData.data.template_sizes || [];

                // Mark as legacy integration
                this.databaseIntegration = {
                    active: false,
                    legacy: true,
                    limitation: 'No database coverage statistics available'
                };

                this.populateMeasurementDropdown(); // Use basic dropdown

                return false; // Success but with legacy

            } else {
                throw new Error('Legacy endpoint also failed');
            }

        } catch (legacyError) {
            console.error('❌ AGENT-6: Both endpoints failed:', legacyError);

            // Final fallback - use hardcoded values
            this.useHardcodedMeasurementTypes();
            return false;
        }
    }
}

/**
 * AGENT-6 ENHANCEMENT: Enhanced dropdown population with database metadata
 */
populateEnhancedMeasurementDropdown() {
    const dropdown = document.getElementById('measurement-type-select');
    if (!dropdown) {
        console.error('❌ AGENT-6: Measurement dropdown element not found');
        return;
    }

    // Clear existing options
    dropdown.innerHTML = '<option value="">Select measurement type...</option>';

    // Add database-enhanced options
    Object.entries(this.measurementTypes).forEach(([key, typeData]) => {
        const option = document.createElement('option');
        option.value = key;

        // Enhanced option text with metadata
        let optionText = `${key}: ${typeData.label}`;

        // Add category information
        if (typeData.category) {
            optionText += ` (${typeData.category})`;
        }

        // Add size coverage information
        if (typeData.found_in_sizes && typeData.found_in_sizes.length > 0) {
            optionText += ` - ${typeData.found_in_sizes.length} sizes`;
        }

        option.textContent = optionText;

        // Add data attributes for advanced functionality
        option.setAttribute('data-category', typeData.category || 'unknown');
        option.setAttribute('data-description', typeData.description || '');

        if (typeData.found_in_sizes) {
            option.setAttribute('data-sizes', typeData.found_in_sizes.join(','));
        }

        dropdown.appendChild(option);
    });

    // Add database integration status indicator
    if (this.databaseIntegration && this.databaseIntegration.active) {
        const statusDiv = document.getElementById('database-integration-status') || this.createDatabaseStatusIndicator();
        statusDiv.innerHTML = `
            <div class="database-status success">
                ✅ Database Integration Active
                <small>
                    ${this.databaseIntegration.totalMeasurementTypes} types,
                    ${this.databaseIntegration.coveragePercentage}% coverage
                </small>
            </div>
        `;
    }

    console.log('✅ AGENT-6: Enhanced dropdown populated with database metadata');
}

/**
 * AGENT-6 ENHANCEMENT: Create database status indicator
 */
createDatabaseStatusIndicator() {
    const container = document.getElementById('point-to-point-container');
    if (!container) return null;

    const statusDiv = document.createElement('div');
    statusDiv.id = 'database-integration-status';
    statusDiv.className = 'database-integration-status';

    // Add CSS for styling
    const style = document.createElement('style');
    style.textContent = `
        .database-integration-status {
            margin: 10px 0;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
        }
        .database-status.success {
            background-color: rgba(76, 175, 80, 0.1);
            border: 1px solid #4caf50;
            color: #4caf50;
        }
        .database-status.legacy {
            background-color: rgba(255, 193, 7, 0.1);
            border: 1px solid #ffc107;
            color: #ff8f00;
        }
        .database-status small {
            display: block;
            margin-top: 2px;
            opacity: 0.8;
        }
    `;

    if (!document.querySelector('#agent6-database-styles')) {
        style.id = 'agent6-database-styles';
        document.head.appendChild(style);
    }

    container.insertBefore(statusDiv, container.firstChild);
    return statusDiv;
}

/**
 * AGENT-6 ENHANCEMENT: Fallback to hardcoded values with warning
 */
useHardcodedMeasurementTypes() {
    console.warn('⚠️ AGENT-6: Using hardcoded fallback measurement types');

    this.measurementTypes = {
        'A': { label: 'Chest', category: 'horizontal', description: 'Brustumfang' },
        'B': { label: 'Hem Width', category: 'horizontal', description: 'Saumweite' },
        'C': { label: 'Height from Shoulder', category: 'vertical', description: 'Höhe ab Schulter' }
    };

    this.databaseIntegration = {
        active: false,
        legacy: false,
        hardcoded: true,
        warning: 'Database and legacy endpoints both failed'
    };

    this.populateMeasurementDropdown(); // Basic dropdown

    // Show warning indicator
    const statusDiv = document.getElementById('database-integration-status') || this.createDatabaseStatusIndicator();
    if (statusDiv) {
        statusDiv.innerHTML = `
            <div class="database-status legacy">
                ⚠️ Hardcoded Fallback Active
                <small>Database integration unavailable - limited functionality</small>
            </div>
        `;
    }
}

/**
 * AGENT-6 ENHANCEMENT: Get database integration status
 */
getDatabaseIntegrationStatus() {
    return this.databaseIntegration || { active: false };
}

/**
 * AGENT-6 ENHANCEMENT: Validate measurement assignment with database data
 */
validateMeasurementAssignment(measurementKey, referenceLineData) {
    const status = this.getDatabaseIntegrationStatus();

    if (!status.active) {
        console.warn('⚠️ AGENT-6: Limited validation - database integration inactive');
        return {
            valid: true,
            warnings: ['Database integration inactive - basic validation only'],
            quality: 50
        };
    }

    const measurementType = this.measurementTypes[measurementKey];
    if (!measurementType) {
        return {
            valid: false,
            errors: [`Unknown measurement key: ${measurementKey}`],
            quality: 0
        };
    }

    // Enhanced validation with database metadata
    const validation = {
        valid: true,
        warnings: [],
        errors: [],
        quality: 100
    };

    // Check size coverage
    if (measurementType.found_in_sizes && measurementType.found_in_sizes.length === 0) {
        validation.warnings.push('No sizes found for this measurement type');
        validation.quality -= 20;
    }

    // Check category compatibility
    if (measurementType.category === 'vertical' && referenceLineData.orientation === 'horizontal') {
        validation.warnings.push('Measurement category mismatch - vertical measurement on horizontal line');
        validation.quality -= 15;
    }

    validation.valid = validation.errors.length === 0;

    return validation;
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadMeasurementTypes,
        populateEnhancedMeasurementDropdown,
        validateMeasurementAssignment
    };
}