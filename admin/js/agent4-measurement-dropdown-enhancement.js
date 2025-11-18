/**
 * AGENT 4 - FRONTEND SPECIALIST: Dynamic Measurement Dropdown Enhancement
 *
 * This module provides enhanced measurement dropdown functionality with:
 * 1. Dynamic AJAX loading from wp_template_measurements database
 * 2. Loading states and error handling
 * 3. Real-time database integration
 * 4. Enhanced user feedback
 */

class Agent4MeasurementDropdownEnhancer {
    constructor(multiViewSelector) {
        this.selector = multiViewSelector;
        this.loadingStates = {
            isLoading: false,
            hasError: false,
            errorMessage: null
        };
        this.retryAttempts = 0;
        this.maxRetryAttempts = 3;
        this.retryDelay = 1000; // 1 second
    }

    /**
     * AGENT 4: Enhanced measurement types loader with comprehensive error handling
     */
    async loadMeasurementTypesEnhanced() {
        const dropdown = document.getElementById('measurement-type-selector');

        if (!dropdown) {
            console.error('❌ AGENT 4: Measurement dropdown not found');
            return false;
        }

        try {
            // AGENT 4: Show loading state
            this.setMeasurementDropdownLoading(true);
            console.log('🔄 AGENT 4: Loading measurement types from wp_template_measurements database...');

            // AGENT 4: Make AJAX call to fetch measurements
            const response = await fetch(pointToPointAjax.ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'get_template_measurements',
                    template_id: this.selector.templateId,
                    nonce: pointToPointAjax.nonce
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success && data.data && data.data.measurement_types) {
                // AGENT 4: Successfully loaded measurements
                this.selector.measurementTypes = data.data.measurement_types;
                const measurementCount = Object.keys(this.selector.measurementTypes).length;

                console.log(`✅ AGENT 4: Successfully loaded ${measurementCount} measurement types from database`);

                // AGENT 4: Populate dropdown with dynamic data
                this.populateMeasurementDropdownDynamic();

                // AGENT 4: Track successful load
                this.trackMeasurementLoadSuccess(measurementCount);

                // AGENT 4: Reset retry attempts
                this.retryAttempts = 0;

                return true;

            } else {
                throw new Error(data.data?.message || 'Invalid response structure from server');
            }

        } catch (error) {
            console.error('❌ AGENT 4: Error loading measurement types:', error.message);

            // AGENT 4: Handle retry logic
            if (this.retryAttempts < this.maxRetryAttempts) {
                this.retryAttempts++;
                console.log(`🔄 AGENT 4: Retrying measurement load (attempt ${this.retryAttempts}/${this.maxRetryAttempts})`);

                await this.delay(this.retryDelay);
                return await this.loadMeasurementTypesEnhanced();
            }

            // AGENT 4: Show error state
            this.setMeasurementDropdownError(error.message);

            // AGENT 4: Track error
            this.trackMeasurementLoadError(error.message);

            // AGENT 4: Fall back to static measurements
            this.loadFallbackMeasurementTypes();

            return false;

        } finally {
            // AGENT 4: Always clear loading state
            this.setMeasurementDropdownLoading(false);
        }
    }

    /**
     * AGENT 4: Set dropdown to loading state with spinner and loading text
     */
    setMeasurementDropdownLoading(isLoading) {
        const dropdown = document.getElementById('measurement-type-selector');
        if (!dropdown) return;

        this.loadingStates.isLoading = isLoading;
        this.loadingStates.hasError = false;

        if (isLoading) {
            dropdown.innerHTML = `
                <option value="" disabled selected>
                    🔄 Loading measurement types from database...
                </option>
            `;
            dropdown.disabled = true;
            dropdown.style.opacity = '0.7';
            dropdown.style.cursor = 'wait';

            // AGENT 4: Add loading class for CSS animations
            dropdown.classList.add('agent4-loading');

        } else {
            dropdown.disabled = false;
            dropdown.style.opacity = '1';
            dropdown.style.cursor = 'pointer';
            dropdown.classList.remove('agent4-loading');
        }
    }

    /**
     * AGENT 4: Set dropdown to error state with retry option
     */
    setMeasurementDropdownError(errorMessage) {
        const dropdown = document.getElementById('measurement-type-selector');
        if (!dropdown) return;

        this.loadingStates.hasError = true;
        this.loadingStates.errorMessage = errorMessage;

        dropdown.innerHTML = `
            <option value="" disabled selected style="color: #d32f2f;">
                ❌ Error: ${errorMessage}
            </option>
            <option value="retry" style="color: #1976d2;">
                🔄 Click to retry loading measurements
            </option>
        `;

        // AGENT 4: Add error event listener
        dropdown.addEventListener('change', this.handleErrorRetry.bind(this), { once: true });
    }

    /**
     * AGENT 4: Handle retry when user selects retry option
     */
    async handleErrorRetry(event) {
        if (event.target.value === 'retry') {
            console.log('🔄 AGENT 4: User initiated measurement retry');
            this.retryAttempts = 0; // Reset retry counter
            await this.loadMeasurementTypesEnhanced();
        }
    }

    /**
     * AGENT 4: Dynamic dropdown population with enhanced status indicators
     */
    populateMeasurementDropdownDynamic() {
        const dropdown = document.getElementById('measurement-type-selector');
        if (!dropdown) return;

        // AGENT 4: Clear dropdown and add default option
        dropdown.innerHTML = '<option value="">📏 Select Measurement Type...</option>';

        if (!this.selector.measurementTypes || Object.keys(this.selector.measurementTypes).length === 0) {
            dropdown.innerHTML += '<option value="" disabled>No measurement types available</option>';
            return;
        }

        // AGENT 4: Enhanced population with database-driven data
        Object.entries(this.selector.measurementTypes).forEach(([key, data]) => {
            const option = document.createElement('option');
            option.value = key;

            // AGENT 4: Get measurement status from integration bridge
            const status = this.getMeasurementStatus(key);
            const displayText = this.formatMeasurementOption(key, data, status);

            option.textContent = displayText;
            option.setAttribute('data-measurement-key', key);
            option.setAttribute('data-status', status.type);

            // AGENT 4: Apply status-based styling
            this.applyMeasurementOptionStyling(option, status);

            dropdown.appendChild(option);
        });

        // AGENT 4: Add success indicator
        this.addDropdownSuccessIndicator(dropdown);

        console.log(`✅ AGENT 4: Populated dropdown with ${Object.keys(this.selector.measurementTypes).length} measurement types`);
    }

    /**
     * AGENT 4: Get comprehensive measurement status
     */
    getMeasurementStatus(measurementKey) {
        if (!this.selector || !measurementKey) {
            return { type: 'unknown', icon: '❓', suffix: '[UNKNOWN]', color: '#666' };
        }

        const hasReferenceLines = this.selector.checkMeasurementHasReferenceLines?.(measurementKey) || false;
        const isPrimary = this.selector.isPrimaryMeasurement?.(measurementKey) || false;
        const hasConflicts = this.selector.checkMeasurementConflicts?.(measurementKey) || false;
        const precisionLevel = this.selector.getPrecisionLevel?.(measurementKey) || 1;

        if (hasConflicts) {
            return {
                type: 'conflict',
                icon: '⚠️',
                suffix: '[CONFLICT]',
                color: '#d32f2f',
                backgroundColor: '#ffebee'
            };
        } else if (isPrimary && hasReferenceLines) {
            return {
                type: 'primary-ready',
                icon: '🎯',
                suffix: `[PRIMARY] P${precisionLevel}`,
                color: '#2e7d32',
                backgroundColor: '#e8f5e8'
            };
        } else if (hasReferenceLines) {
            return {
                type: 'linked',
                icon: '🔗',
                suffix: `[LINKED] P${precisionLevel}`,
                color: '#f57c00',
                backgroundColor: '#fff8e1'
            };
        } else {
            return {
                type: 'available',
                icon: '⭕',
                suffix: '[AVAILABLE]',
                color: '#666',
                backgroundColor: 'transparent'
            };
        }
    }

    /**
     * AGENT 4: Format measurement option text with status
     */
    formatMeasurementOption(key, data, status) {
        const category = this.selector.getMeasurementCategory?.(key) || 'general';
        return `${status.icon} ${key} - ${data.label} ${status.suffix} [${category.toUpperCase()}]`;
    }

    /**
     * AGENT 4: Apply status-based styling to option
     */
    applyMeasurementOptionStyling(option, status) {
        option.style.color = status.color;
        if (status.backgroundColor && status.backgroundColor !== 'transparent') {
            option.style.backgroundColor = status.backgroundColor;
        }

        if (status.type === 'conflict') {
            option.disabled = true;
        }

        if (status.type === 'primary-ready') {
            option.style.fontWeight = 'bold';
        }
    }

    /**
     * AGENT 4: Add success indicator to dropdown
     */
    addDropdownSuccessIndicator(dropdown) {
        const successOption = document.createElement('option');
        successOption.disabled = true;
        successOption.style.color = '#4caf50';
        successOption.style.fontStyle = 'italic';
        successOption.style.fontSize = '0.9em';
        successOption.textContent = `✅ Loaded from wp_template_measurements database`;

        dropdown.appendChild(successOption);
    }

    /**
     * AGENT 4: Load fallback measurements if database fails
     */
    loadFallbackMeasurementTypes() {
        console.log('🔄 AGENT 4: Loading fallback measurement types...');

        // AGENT 4: Static fallback measurements
        const fallbackMeasurements = {
            'A': { label: 'Chest', description: 'Brustumfang' },
            'B': { label: 'Hem Width', description: 'Saumweite' },
            'C': { label: 'Height from Shoulder', description: 'Höhe ab Schulter' },
            'D': { label: 'Shoulder Width', description: 'Schulterbreite' },
            'E': { label: 'Sleeve Length', description: 'Ärmellänge' },
            'F': { label: 'Back Length', description: 'Rückenlänge' },
            'G': { label: 'Armhole Width', description: 'Armausschnitt Breite' },
            'H': { label: 'Neck Width', description: 'Halsausschnitt Breite' }
        };

        this.selector.measurementTypes = fallbackMeasurements;
        this.populateFallbackDropdown();

        console.log('✅ AGENT 4: Loaded fallback measurements');
    }

    /**
     * AGENT 4: Populate dropdown with fallback measurements
     */
    populateFallbackDropdown() {
        const dropdown = document.getElementById('measurement-type-selector');
        if (!dropdown) return;

        dropdown.innerHTML = '<option value="">⚠️ Using fallback measurements...</option>';

        Object.entries(this.selector.measurementTypes).forEach(([key, data]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = `${key} - ${data.label} [FALLBACK]`;
            option.style.color = '#ff9800';
            dropdown.appendChild(option);
        });
    }

    /**
     * AGENT 4: Track successful measurement load
     */
    trackMeasurementLoadSuccess(count) {
        const timestamp = Date.now();
        const logEntry = {
            timestamp,
            type: 'measurement_load_success',
            agent: 'AGENT_4',
            data: {
                measurement_count: count,
                template_id: this.selector.templateId,
                load_time: timestamp - (this.loadStartTime || timestamp)
            }
        };

        if (this.selector.debug) {
            this.selector.debug.log(`📊 AGENT 4: Measurement load successful - ${count} types loaded`);
        }

        console.log('📊 AGENT 4: Measurement load metrics:', logEntry);
    }

    /**
     * AGENT 4: Track measurement load error
     */
    trackMeasurementLoadError(errorMessage) {
        const timestamp = Date.now();
        const logEntry = {
            timestamp,
            type: 'measurement_load_error',
            agent: 'AGENT_4',
            data: {
                error_message: errorMessage,
                template_id: this.selector.templateId,
                retry_attempts: this.retryAttempts
            }
        };

        if (this.selector.debug) {
            this.selector.debug.error(`❌ AGENT 4: Measurement load failed - ${errorMessage}`);
        }

        console.error('📊 AGENT 4: Measurement load error metrics:', logEntry);
    }

    /**
     * AGENT 4: Utility delay function for retries
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * AGENT 4: Initialize click-to-refresh functionality
     */
    initializeDropdownInteractivity() {
        const dropdown = document.getElementById('measurement-type-selector');
        if (!dropdown) return;

        // AGENT 4: Add click listener for refresh
        dropdown.addEventListener('click', (event) => {
            if (dropdown.value === '' && !this.loadingStates.isLoading) {
                console.log('🔄 AGENT 4: User clicked dropdown - refreshing measurements');
                this.loadMeasurementTypesEnhanced();
            }
        });

        // AGENT 4: Add change listener for selection tracking
        dropdown.addEventListener('change', (event) => {
            const selectedKey = event.target.value;
            if (selectedKey && selectedKey !== 'retry') {
                console.log(`🎯 AGENT 4: User selected measurement type: ${selectedKey}`);
                this.trackMeasurementSelection(selectedKey);
            }
        });
    }

    /**
     * AGENT 4: Track measurement selection
     */
    trackMeasurementSelection(measurementKey) {
        const timestamp = Date.now();
        const measurementData = this.selector.measurementTypes[measurementKey];

        const logEntry = {
            timestamp,
            type: 'measurement_selection',
            agent: 'AGENT_4',
            data: {
                measurement_key: measurementKey,
                measurement_label: measurementData?.label || measurementKey,
                template_id: this.selector.templateId
            }
        };

        console.log('📊 AGENT 4: Measurement selection tracked:', logEntry);
    }

    /**
     * AGENT 4: Initialize CSS styles for loading states
     */
    initializeStyles() {
        const styleId = 'agent4-measurement-dropdown-styles';
        if (document.getElementById(styleId)) return;

        const styles = `
            <style id="${styleId}">
                .agent4-loading {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: agent4-loading-shimmer 2s infinite;
                }

                @keyframes agent4-loading-shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                #measurement-type-selector:focus {
                    outline: 2px solid #1976d2;
                    outline-offset: 1px;
                }

                .agent4-dropdown-container {
                    position: relative;
                    display: inline-block;
                }

                .agent4-loading-overlay {
                    position: absolute;
                    top: 0;
                    right: 5px;
                    height: 100%;
                    width: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    pointer-events: none;
                }

                .agent4-loading-spinner {
                    width: 12px;
                    height: 12px;
                    border: 2px solid #1976d2;
                    border-top: 2px solid transparent;
                    border-radius: 50%;
                    animation: agent4-spinner 1s linear infinite;
                }

                @keyframes agent4-spinner {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

// AGENT 4: Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 AGENT 4: Measurement Dropdown Enhancement initialized');

    // Wait for multiViewPointToPointSelector to be available
    const initializeEnhancer = () => {
        if (window.multiViewPointToPointSelector) {
            window.agent4MeasurementEnhancer = new Agent4MeasurementDropdownEnhancer(window.multiViewPointToPointSelector);
            window.agent4MeasurementEnhancer.initializeStyles();
            window.agent4MeasurementEnhancer.initializeDropdownInteractivity();
            console.log('✅ AGENT 4: Enhancement attached to existing selector');
        } else {
            setTimeout(initializeEnhancer, 500); // Retry after 500ms
        }
    };

    initializeEnhancer();
});

// AGENT 4: Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Agent4MeasurementDropdownEnhancer;
}