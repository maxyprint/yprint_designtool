/**
 * Enhanced Measurement Interface for Two-Point Selection
 * Issue #22 Implementation: Streamlined 3-step workflow with real-time validation
 *
 * Integrates with existing multi-view-point-to-point-selector.js
 * Enhances user experience with automatic assignment and validation
 */

class EnhancedMeasurementInterface {
    constructor() {
        this.currentMode = 'none';
        this.selectedMeasurementKey = '';
        this.templateId = null;
        this.currentViewId = null;
        this.pointSelectionInProgress = false;
        this.points = [];
        this.statusPanel = null;
        this.validationCache = new Map();

        // UI Elements
        this.measurementModeBtn = null;
        this.measurementSelectorGroup = null;
        this.measurementDropdown = null;
        this.measurementPreview = null;

        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Initialize the enhanced measurement interface
     */
    init() {
        console.log('🚀 Enhanced Measurement Interface: Initializing...');

        this.setupUIElements();
        this.setupEventListeners();
        this.loadTemplateData();

        console.log('✅ Enhanced Measurement Interface: Ready');
    }

    /**
     * Setup UI element references
     */
    setupUIElements() {
        this.measurementModeBtn = document.getElementById('measurement-mode-btn');
        this.measurementSelectorGroup = document.getElementById('measurement-selector-group');
        this.measurementDropdown = document.getElementById('measurement-type-select');
        this.measurementPreview = document.getElementById('measurement-preview');
        this.statusPanel = document.getElementById('measurement-status-panel');

        // Get template ID from hidden input or global
        const templateIdInput = document.getElementById('template-id-input');
        if (templateIdInput) {
            this.templateId = parseInt(templateIdInput.value);
        }

        console.log('📋 UI Elements Setup:', {
            templateId: this.templateId,
            elementsFound: {
                modeBtn: !!this.measurementModeBtn,
                selectorGroup: !!this.measurementSelectorGroup,
                dropdown: !!this.measurementDropdown,
                preview: !!this.measurementPreview,
                statusPanel: !!this.statusPanel
            }
        });
    }

    /**
     * Setup event listeners for enhanced interface
     */
    setupEventListeners() {
        // Measurement mode button click
        if (this.measurementModeBtn) {
            this.measurementModeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMeasurementMode();
            });
        }

        // Measurement type selection
        if (this.measurementDropdown) {
            this.measurementDropdown.addEventListener('change', (e) => {
                this.onMeasurementTypeSelected(e.target.value);
            });
        }

        // Status panel close button
        if (this.statusPanel) {
            const closeBtn = this.statusPanel.querySelector('.status-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.hideStatusPanel();
                });
            }
        }

        // Integration with existing multi-view system
        this.integrateWithExistingSystem();
    }

    /**
     * Toggle measurement mode on/off
     */
    toggleMeasurementMode() {
        if (this.currentMode === 'measurement') {
            this.disableMeasurementMode();
        } else {
            this.enableMeasurementMode();
        }
    }

    /**
     * Enable measurement mode
     */
    enableMeasurementMode() {
        console.log('🎯 Enabling Measurement Mode');

        this.currentMode = 'measurement';

        // Update UI
        if (this.measurementModeBtn) {
            this.measurementModeBtn.classList.add('active');
            this.measurementModeBtn.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        }

        if (this.measurementSelectorGroup) {
            this.measurementSelectorGroup.style.display = 'flex';
            this.measurementSelectorGroup.classList.add('active');
        }

        // Disable other toolbar modes
        this.disableOtherModes();

        // Show instructions
        this.updatePreviewText('Select measurement type from dropdown');
    }

    /**
     * Disable measurement mode
     */
    disableMeasurementMode() {
        console.log('❌ Disabling Measurement Mode');

        this.currentMode = 'none';
        this.selectedMeasurementKey = '';
        this.points = [];
        this.pointSelectionInProgress = false;

        // Update UI
        if (this.measurementModeBtn) {
            this.measurementModeBtn.classList.remove('active');
            this.measurementModeBtn.style.background = '';
        }

        if (this.measurementSelectorGroup) {
            this.measurementSelectorGroup.style.display = 'none';
            this.measurementSelectorGroup.classList.remove('active');
        }

        if (this.measurementDropdown) {
            this.measurementDropdown.value = '';
        }

        this.hideStatusPanel();
        this.updatePreviewText('Click two points on template');
    }

    /**
     * Handle measurement type selection
     */
    async onMeasurementTypeSelected(measurementKey) {
        console.log('📏 Measurement Type Selected:', measurementKey);

        if (!measurementKey) {
            this.selectedMeasurementKey = '';
            this.updatePreviewText('Select measurement type');
            return;
        }

        this.selectedMeasurementKey = measurementKey;

        // Get expected value for this measurement
        await this.loadExpectedValue(measurementKey);

        // Update UI for point selection
        this.updatePreviewText('Click first point on template');
        this.showStatusPanel();

        // Enable canvas interaction
        this.enableCanvasInteraction();
    }

    /**
     * Load expected measurement value
     */
    async loadExpectedValue(measurementKey) {
        try {
            const response = await this.makeAjaxRequest('get_expected_measurement_value', {
                template_id: this.templateId,
                measurement_key: measurementKey,
                size_key: 'M' // Default to M size
            });

            if (response.success) {
                const expectedValue = response.data.expected_value;
                const label = response.data.label;

                console.log(`📊 Expected value for ${measurementKey}: ${expectedValue}cm`);

                // Update status panel
                this.updateStatusPanel({
                    measurementKey: measurementKey,
                    label: label,
                    expectedValue: expectedValue
                });
            }
        } catch (error) {
            console.warn('⚠️ Could not load expected value:', error);
        }
    }

    /**
     * Enable canvas interaction for point selection
     */
    enableCanvasInteraction() {
        const canvas = document.getElementById('template-canvas');
        if (!canvas) return;

        canvas.style.cursor = 'crosshair';

        // Remove existing listeners to prevent conflicts
        canvas.removeEventListener('click', this.boundCanvasClick);

        // Add our click listener
        this.boundCanvasClick = (e) => this.onCanvasClick(e);
        canvas.addEventListener('click', this.boundCanvasClick);

        console.log('🎨 Canvas interaction enabled for measurement mode');
    }

    /**
     * Handle canvas click for point selection
     */
    async onCanvasClick(e) {
        if (this.currentMode !== 'measurement' || !this.selectedMeasurementKey) {
            return;
        }

        const canvas = e.target;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.points.push({ x, y });

        console.log(`📍 Point ${this.points.length} selected:`, { x, y });

        // Trigger canvas visualization update
        if (window.enhancedCanvasRenderer) {
            const event = new CustomEvent('measurementPreview', {
                detail: {
                    points: [...this.points],
                    measurementKey: this.selectedMeasurementKey,
                    currentDistance: this.points.length === 2 ?
                        this.calculateDistance(this.points[0], this.points[1]) : 0
                }
            });
            document.dispatchEvent(event);
        }

        if (this.points.length === 1) {
            // First point selected
            this.updatePreviewText('Click second point on template');
            this.updateStatusProgress(50, 'Select second point');
        } else if (this.points.length === 2) {
            // Second point selected - complete measurement
            await this.completeMeasurement();
        }
    }

    /**
     * Complete measurement after two points selected
     */
    async completeMeasurement() {
        console.log('✅ Completing measurement with two points');

        const [point1, point2] = this.points;
        const pixelDistance = this.calculateDistance(point1, point2);

        // Show progress
        this.updateStatusProgress(75, 'Validating measurement...');

        // Validate measurement in real-time
        try {
            const validationResult = await this.validateMeasurement(pixelDistance);

            // Create reference line data
            const referenceLineData = {
                measurement_key: this.selectedMeasurementKey,
                lengthPx: Math.round(pixelDistance * 100) / 100,
                start: { x: Math.round(point1.x), y: Math.round(point1.y) },
                end: { x: Math.round(point2.x), y: Math.round(point2.y) },
                view_id: this.currentViewId || 'default',
                created_at: new Date().toISOString(),
                validation: validationResult
            };

            // Save measurement assignment
            await this.saveMeasurementAssignment(referenceLineData);

            // Trigger canvas visualization with final validation
            if (window.enhancedCanvasRenderer) {
                const event = new CustomEvent('measurementValidated', {
                    detail: {
                        points: [point1, point2],
                        validation: validationResult,
                        measurementKey: this.selectedMeasurementKey,
                        measuredValue: validationResult.measured_cm || Math.round(pixelDistance * 0.1),
                        expectedValue: validationResult.expected_values?.average || 50
                    }
                });
                document.dispatchEvent(event);
            }

            // Complete the workflow
            this.updateStatusProgress(100, 'Measurement saved!');

            // Reset for next measurement
            setTimeout(() => {
                this.resetForNextMeasurement();
            }, 2000);

        } catch (error) {
            console.error('❌ Error completing measurement:', error);
            this.updateStatusProgress(0, 'Error saving measurement');
        }
    }

    /**
     * Validate measurement in real-time
     */
    async validateMeasurement(pixelDistance) {
        try {
            const response = await this.makeAjaxRequest('validate_measurement_realtime', {
                template_id: this.templateId,
                measurement_key: this.selectedMeasurementKey,
                pixel_length: pixelDistance,
                view_id: this.currentViewId || 'default'
            });

            if (response.success) {
                const validation = response.data.validation;
                const measuredCm = response.data.measured_cm;

                console.log('✅ Measurement validation:', {
                    measured: measuredCm + 'cm',
                    accuracy: validation.accuracy + '%',
                    status: validation.status
                });

                // Update UI with validation results
                this.showValidationFeedback(validation, measuredCm);

                return validation;
            }
        } catch (error) {
            console.warn('⚠️ Validation failed:', error);
            return { status: 'unknown', accuracy: 0 };
        }
    }

    /**
     * Save measurement assignment
     */
    async saveMeasurementAssignment(referenceLineData) {
        try {
            const response = await this.makeAjaxRequest('save_measurement_assignment', {
                template_id: this.templateId,
                measurement_key: this.selectedMeasurementKey,
                reference_line_data: JSON.stringify(referenceLineData)
            });

            if (response.success) {
                console.log('💾 Measurement assignment saved:', response.data.message);

                // Trigger refresh of any existing reference line displays
                this.triggerReferenceLineRefresh();

                return true;
            } else {
                throw new Error(response.data || 'Save failed');
            }
        } catch (error) {
            console.error('❌ Save measurement assignment failed:', error);
            throw error;
        }
    }

    /**
     * Calculate distance between two points
     */
    calculateDistance(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Update status panel content
     */
    updateStatusPanel(data) {
        if (!this.statusPanel) return;

        const typeLabel = this.statusPanel.querySelector('.measurement-type-label');
        const expectedValue = this.statusPanel.querySelector('.expected-value-text');
        const expectedDiv = this.statusPanel.querySelector('.expected-value');

        if (typeLabel) {
            typeLabel.textContent = `${data.measurementKey} - ${data.label}`;
        }

        if (expectedValue && expectedDiv) {
            expectedValue.textContent = data.expectedValue + ' cm';
            expectedDiv.style.display = 'block';
        }
    }

    /**
     * Update status panel progress
     */
    updateStatusProgress(percentage, text) {
        if (!this.statusPanel) return;

        const progressFill = this.statusPanel.querySelector('.progress-fill');
        const progressText = this.statusPanel.querySelector('.progress-text');

        if (progressFill) {
            progressFill.style.width = percentage + '%';
        }

        if (progressText) {
            progressText.textContent = text;
        }
    }

    /**
     * Show validation feedback
     */
    showValidationFeedback(validation, measuredCm) {
        // Update measurement value display
        const measurementValue = this.statusPanel?.querySelector('.measurement-value');
        if (measurementValue) {
            measurementValue.textContent = measuredCm + ' cm';

            // Apply validation styling
            measurementValue.className = 'measurement-value ' + validation.status;
        }

        // Update preview with validation state
        if (this.measurementPreview) {
            this.measurementPreview.className = 'measurement-preview ' + validation.status;

            const previewValue = this.measurementPreview.querySelector('.preview-value');
            if (!previewValue) {
                const valueSpan = document.createElement('span');
                valueSpan.className = 'preview-value';
                this.measurementPreview.appendChild(valueSpan);
            }

            this.measurementPreview.querySelector('.preview-value').textContent =
                `${measuredCm}cm (${validation.accuracy}%)`;
        }

        console.log(`🎯 Validation feedback: ${validation.status} - ${validation.recommendation}`);
    }

    /**
     * Show status panel
     */
    showStatusPanel() {
        if (this.statusPanel) {
            this.statusPanel.style.display = 'block';
        }
    }

    /**
     * Hide status panel
     */
    hideStatusPanel() {
        if (this.statusPanel) {
            this.statusPanel.style.display = 'none';
        }
    }

    /**
     * Update preview text
     */
    updatePreviewText(text) {
        const previewLabel = document.querySelector('#measurement-preview .preview-label');
        if (previewLabel) {
            previewLabel.textContent = text;
        }
    }

    /**
     * Reset for next measurement
     */
    resetForNextMeasurement() {
        this.points = [];
        this.pointSelectionInProgress = false;

        // Reset dropdown
        if (this.measurementDropdown) {
            this.measurementDropdown.value = '';
        }

        this.selectedMeasurementKey = '';
        this.hideStatusPanel();
        this.updatePreviewText('Select measurement type from dropdown');

        // Reset canvas cursor
        const canvas = document.getElementById('template-canvas');
        if (canvas) {
            canvas.style.cursor = 'default';
        }
    }

    /**
     * Disable other toolbar modes
     */
    disableOtherModes() {
        const modeButtons = document.querySelectorAll('.mode-select');
        modeButtons.forEach(btn => {
            if (btn.id !== 'measurement-mode-btn') {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * Integrate with existing multi-view system
     */
    integrateWithExistingSystem() {
        // Check if multi-view system is available
        if (typeof multiViewPointToPointSelector !== 'undefined') {
            console.log('🔗 Integrating with existing multi-view system');

            // Listen for view changes
            const viewTabs = document.querySelectorAll('.view-tab');
            viewTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    this.currentViewId = e.target.dataset.viewId ||
                                       e.target.closest('.view-tab')?.dataset.viewId;
                    console.log('👁️ View changed to:', this.currentViewId);
                });
            });
        }
    }

    /**
     * Trigger refresh of reference line displays
     */
    triggerReferenceLineRefresh() {
        // Trigger custom event for other systems to listen to
        const event = new CustomEvent('measurementAssignmentSaved', {
            detail: {
                templateId: this.templateId,
                measurementKey: this.selectedMeasurementKey
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Make AJAX request using existing pointToPointAjax configuration
     */
    async makeAjaxRequest(action, data) {
        if (typeof pointToPointAjax === 'undefined') {
            throw new Error('pointToPointAjax not available');
        }

        const formData = new FormData();
        formData.append('action', action);
        formData.append('nonce', pointToPointAjax.nonce);

        Object.keys(data).forEach(key => {
            formData.append(key, data[key]);
        });

        const response = await fetch(pointToPointAjax.ajaxurl, {
            method: 'POST',
            body: formData
        });

        return await response.json();
    }

    /**
     * Load template data
     */
    loadTemplateData() {
        // Set template ID from hidden input if not already set
        if (!this.templateId) {
            const templateInput = document.getElementById('template-id-input');
            if (templateInput) {
                this.templateId = parseInt(templateInput.value);
            }
        }

        console.log('📋 Template data loaded:', { templateId: this.templateId });
    }
}

// Initialize Enhanced Measurement Interface when DOM is ready
let enhancedMeasurementInterface;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        enhancedMeasurementInterface = new EnhancedMeasurementInterface();
    });
} else {
    enhancedMeasurementInterface = new EnhancedMeasurementInterface();
}

// Global access for debugging and integration
window.enhancedMeasurementInterface = enhancedMeasurementInterface;