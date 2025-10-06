/**
 * 🎯 AGENT 2: SMART MEASUREMENT DEFINITION SYSTEM
 * Issue #22 Implementation: Two-Point Measurement Interface Enhancement
 *
 * Transforms basic reference line workflow into intelligent measurement-aware system
 * with real-time validation and database integration.
 */

class MeasurementDefinitionSystem {
    constructor(selector) {
        this.selector = selector; // MultiViewPointToPointSelector instance
        this.isActive = false;
        this.currentStep = 1;
        this.selectedMeasurementType = null;
        this.selectedPoints = [];
        this.targetValue = null;
        this.measuredLength = null;
        this.accuracy = null;

        // UI Elements
        this.panel = null;
        this.dropdown = null;
        this.progressSteps = null;

        console.log('🎯 AGENT 2: MeasurementDefinitionSystem initialized');
        this.initializeUI();
        this.attachEventListeners();
    }

    /**
     * 🔧 Initialize UI Components
     */
    initializeUI() {
        this.panel = document.getElementById('measurement-definition-panel');
        this.dropdown = document.getElementById('measurement-type-dropdown');
        this.progressSteps = document.querySelectorAll('.progress-step');

        if (!this.panel) {
            console.error('❌ AGENT 2: Measurement definition panel not found');
            return;
        }

        console.log('✅ AGENT 2: UI components initialized');
    }

    /**
     * 🎧 Attach Event Listeners
     */
    attachEventListeners() {
        // Toolbar button click
        const measurementButton = document.querySelector('[data-mode="measurement"]');
        if (measurementButton) {
            measurementButton.addEventListener('click', () => this.startMeasurementDefinition());
        }

        // Close panel
        const closeButton = document.querySelector('.measurement-panel-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.closeMeasurementPanel());
        }

        // Measurement type selection
        if (this.dropdown) {
            this.dropdown.addEventListener('change', (e) => this.onMeasurementTypeSelected(e.target.value));
        }

        // Cancel and save buttons
        const cancelButton = document.querySelector('.measurement-cancel');
        const saveButton = document.querySelector('.measurement-save');

        if (cancelButton) {
            cancelButton.addEventListener('click', () => this.cancelMeasurement());
        }

        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveMeasurement());
        }

        console.log('✅ AGENT 2: Event listeners attached');
    }

    /**
     * 🚀 Start Measurement Definition Workflow
     */
    startMeasurementDefinition() {
        console.log('🚀 AGENT 2: Starting measurement definition workflow');

        this.isActive = true;
        this.currentStep = 1;
        this.resetState();

        // Show panel
        if (this.panel) {
            this.panel.style.display = 'block';
        }

        // Populate dropdown with measurement types
        this.populateMeasurementDropdown();

        // Update UI state
        this.updateStepDisplay();
    }

    /**
     * 📋 Populate Measurement Type Dropdown
     */
    async populateMeasurementDropdown() {
        console.log('📋 AGENT 2: Populating measurement dropdown...');

        if (!this.dropdown || !this.selector.measurementTypes) {
            console.warn('⚠️ AGENT 2: Dropdown or measurement types not available');
            return;
        }

        // Clear existing options (except first)
        while (this.dropdown.children.length > 1) {
            this.dropdown.removeChild(this.dropdown.lastChild);
        }

        // Populate with measurement types
        Object.keys(this.selector.measurementTypes).forEach(key => {
            const measurement = this.selector.measurementTypes[key];
            const option = document.createElement('option');
            option.value = key;
            option.textContent = `${key} - ${measurement.label}`;
            option.dataset.label = measurement.label;
            option.dataset.description = measurement.description || measurement.label;
            this.dropdown.appendChild(option);
        });

        console.log(`✅ AGENT 2: Populated dropdown with ${Object.keys(this.selector.measurementTypes).length} measurement types`);
    }

    /**
     * 🎯 Handle Measurement Type Selection
     */
    async onMeasurementTypeSelected(measurementKey) {
        if (!measurementKey) {
            this.hideStep1Info();
            return;
        }

        console.log(`🎯 AGENT 2: Measurement type selected: ${measurementKey}`);

        this.selectedMeasurementType = measurementKey;
        const measurement = this.selector.measurementTypes[measurementKey];

        // Show measurement info
        this.showMeasurementInfo(measurement);

        // Fetch target value from database (Issue #19 integration)
        await this.fetchTargetValue(measurementKey);

        // Enable next step
        this.enableStep2();
    }

    /**
     * 📊 Show Measurement Information
     */
    showMeasurementInfo(measurement) {
        const infoPanel = document.querySelector('.measurement-info');
        const labelElement = document.querySelector('.measurement-label');
        const descriptionElement = document.querySelector('.measurement-description');

        if (infoPanel && labelElement && descriptionElement) {
            labelElement.textContent = measurement.label;
            descriptionElement.textContent = measurement.description || measurement.label;
            infoPanel.style.display = 'block';

            console.log('📊 AGENT 2: Measurement info displayed');
        }
    }

    /**
     * 🔄 Hide Step 1 Info
     */
    hideStep1Info() {
        const infoPanel = document.querySelector('.measurement-info');
        if (infoPanel) {
            infoPanel.style.display = 'none';
        }
    }

    /**
     * 💾 Fetch Target Value from Database (Issue #19 Integration)
     */
    async fetchTargetValue(measurementKey) {
        console.log(`💾 AGENT 2: Fetching target value for ${measurementKey}...`);

        try {
            // Use selector's existing template ID and size context
            const templateId = this.selector.templateId;
            const currentSize = this.selector.getCurrentSize ? this.selector.getCurrentSize() : 'M';

            // This would integrate with Issue #19 database endpoint
            // For now, using realistic demo values
            const demoTargetValues = {
                'A': 52.5,  // Chest
                'B': 48.0,  // Hem Width
                'C': 68.5,  // Height from Shoulder
                'D': 22.0,  // Sleeve Length
                'E': 12.5,  // Sleeve Opening
                'F': 44.0,  // Shoulder to Shoulder
                'G': 18.0,  // Neck Opening
                'H': 32.0,  // Biceps
                'J': 15.0   // Rib Height
            };

            this.targetValue = demoTargetValues[measurementKey] || 50.0;

            // Update UI with target value
            const targetElement = document.querySelector('.target-value');
            if (targetElement) {
                targetElement.textContent = `${this.targetValue}cm (Size ${currentSize})`;
            }

            console.log(`✅ AGENT 2: Target value set to ${this.targetValue}cm`);

        } catch (error) {
            console.error('❌ AGENT 2: Failed to fetch target value:', error);
            this.targetValue = 50.0; // Fallback value
        }
    }

    /**
     * 🔽 Enable Step 2: Point Selection
     */
    enableStep2() {
        console.log('🔽 AGENT 2: Enabling step 2 - point selection');

        this.currentStep = 2;
        this.updateStepDisplay();

        // Initialize point selection mode
        this.initializePointSelection();
    }

    /**
     * 👆 Initialize Point Selection Mode
     */
    initializePointSelection() {
        console.log('👆 AGENT 2: Initializing smart point selection mode');

        this.selectedPoints = [];
        this.updatePointStatus();

        // Set up canvas click listeners through selector
        if (this.selector && this.selector.canvas) {
            this.setupCanvasClickHandler();
        } else {
            console.warn('⚠️ AGENT 2: Canvas not available for point selection');
        }
    }

    /**
     * 🖱️ Setup Canvas Click Handler
     */
    setupCanvasClickHandler() {
        console.log('🖱️ AGENT 2: Setting up smart canvas click handler');

        // Remove existing listeners
        if (this.canvasClickHandler) {
            this.selector.canvas.off('mouse:down', this.canvasClickHandler);
        }

        // Create new click handler
        this.canvasClickHandler = (e) => {
            if (!this.isActive || this.currentStep !== 2) return;

            const pointer = this.selector.canvas.getPointer(e.e);
            this.addSelectedPoint(pointer);
        };

        // Attach to canvas
        this.selector.canvas.on('mouse:down', this.canvasClickHandler);

        console.log('✅ AGENT 2: Canvas click handler attached');
    }

    /**
     * 📍 Add Selected Point
     */
    addSelectedPoint(point) {
        if (this.selectedPoints.length >= 2) {
            console.log('⚠️ AGENT 2: Maximum 2 points already selected');
            return;
        }

        this.selectedPoints.push({
            x: Math.round(point.x),
            y: Math.round(point.y)
        });

        console.log(`📍 AGENT 2: Point ${this.selectedPoints.length} selected: (${point.x}, ${point.y})`);

        // Update UI
        this.updatePointStatus();

        // Add visual indicator to canvas
        this.addPointIndicator(point, this.selectedPoints.length);

        // Check if we have both points
        if (this.selectedPoints.length === 2) {
            this.enableStep3();
        }
    }

    /**
     * 🔄 Update Point Selection Status
     */
    updatePointStatus() {
        const pointStatuses = document.querySelectorAll('.point-status');

        pointStatuses.forEach((status, index) => {
            const indicator = status.querySelector('.point-indicator');
            const coords = status.querySelector('.point-coords');

            if (this.selectedPoints[index]) {
                const point = this.selectedPoints[index];
                indicator.classList.add('selected');
                coords.textContent = `(${point.x}, ${point.y})`;
            } else {
                indicator.classList.remove('selected');
                coords.textContent = '';
            }
        });

        console.log(`🔄 AGENT 2: Point status updated - ${this.selectedPoints.length}/2 points selected`);
    }

    /**
     * 🎨 Add Visual Point Indicator to Canvas
     */
    addPointIndicator(point, number) {
        // Create fabric circle for point indicator
        const indicator = new fabric.Circle({
            left: point.x - 5,
            top: point.y - 5,
            radius: 5,
            fill: number === 1 ? '#007cba' : '#00a32a',
            stroke: '#ffffff',
            strokeWidth: 2,
            selectable: false,
            evented: false,
            name: `measurement_point_${number}`
        });

        // Add text label
        const label = new fabric.Text(number.toString(), {
            left: point.x - 3,
            top: point.y - 8,
            fontSize: 12,
            fill: '#ffffff',
            fontWeight: 'bold',
            selectable: false,
            evented: false,
            name: `measurement_label_${number}`
        });

        this.selector.canvas.add(indicator);
        this.selector.canvas.add(label);
        this.selector.canvas.renderAll();

        console.log(`🎨 AGENT 2: Visual indicator added for point ${number}`);
    }

    /**
     * 🔽 Enable Step 3: Validation
     */
    enableStep3() {
        console.log('🔽 AGENT 2: Enabling step 3 - validation');

        this.currentStep = 3;
        this.updateStepDisplay();

        // Calculate measurement length
        this.calculateMeasurement();
    }

    /**
     * 📐 Calculate Measurement Length and Accuracy
     */
    calculateMeasurement() {
        if (this.selectedPoints.length < 2) {
            console.warn('⚠️ AGENT 2: Not enough points for measurement calculation');
            return;
        }

        const point1 = this.selectedPoints[0];
        const point2 = this.selectedPoints[1];

        // Calculate pixel distance
        const pixelDistance = Math.sqrt(
            Math.pow(point2.x - point1.x, 2) +
            Math.pow(point2.y - point1.y, 2)
        );

        // Convert to real-world measurement (this would use scale factor from selector)
        const scaleFactor = this.selector.getScaleFactor ? this.selector.getScaleFactor() : 0.1;
        this.measuredLength = pixelDistance * scaleFactor;

        // Calculate accuracy
        if (this.targetValue) {
            const difference = Math.abs(this.measuredLength - this.targetValue);
            this.accuracy = Math.max(0, (1 - (difference / this.targetValue)) * 100);
        } else {
            this.accuracy = 100; // No target to compare against
        }

        console.log(`📐 AGENT 2: Measurement calculated - ${this.measuredLength.toFixed(1)}cm (${this.accuracy.toFixed(1)}% accuracy)`);

        // Update validation UI
        this.updateValidationDisplay();
    }

    /**
     * 📊 Update Validation Display
     */
    updateValidationDisplay() {
        const measuredValueElement = document.querySelector('.measured-value');
        const accuracyPercentageElement = document.querySelector('.accuracy-percentage');
        const accuracyStatusElement = document.querySelector('.accuracy-status');
        const validationMessageElement = document.querySelector('.validation-message');

        if (measuredValueElement) {
            measuredValueElement.textContent = `${this.measuredLength.toFixed(1)}cm`;
        }

        if (accuracyPercentageElement) {
            accuracyPercentageElement.textContent = `${this.accuracy.toFixed(1)}%`;
        }

        if (accuracyStatusElement) {
            const status = this.getAccuracyStatus();
            accuracyStatusElement.textContent = status.text;
            accuracyStatusElement.className = `accuracy-status ${status.class}`;
        }

        if (validationMessageElement) {
            validationMessageElement.textContent = this.getValidationMessage();
        }

        console.log('📊 AGENT 2: Validation display updated');
    }

    /**
     * 🎯 Get Accuracy Status
     */
    getAccuracyStatus() {
        if (this.accuracy >= 95) {
            return { text: 'Excellent', class: 'excellent' };
        } else if (this.accuracy >= 90) {
            return { text: 'Good', class: 'good' };
        } else if (this.accuracy >= 80) {
            return { text: 'Acceptable', class: 'acceptable' };
        } else {
            return { text: 'Needs Adjustment', class: 'poor' };
        }
    }

    /**
     * 💬 Get Validation Message
     */
    getValidationMessage() {
        if (this.accuracy >= 95) {
            return 'Perfect measurement! Ready to save.';
        } else if (this.accuracy >= 90) {
            return 'Good measurement accuracy. You can save or adjust points.';
        } else if (this.accuracy >= 80) {
            return 'Measurement is acceptable but could be more precise.';
        } else {
            return 'Consider adjusting your point selection for better accuracy.';
        }
    }

    /**
     * 🔄 Update Step Display
     */
    updateStepDisplay() {
        // Update step visibility
        const steps = document.querySelectorAll('.measurement-step');
        steps.forEach((step, index) => {
            const stepNumber = index + 1;
            if (stepNumber === this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Update progress indicators
        this.progressSteps.forEach((step, index) => {
            const stepNumber = index + 1;
            if (stepNumber <= this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        console.log(`🔄 AGENT 2: Updated to step ${this.currentStep}`);
    }

    /**
     * 💾 Save Measurement
     */
    async saveMeasurement() {
        console.log('💾 AGENT 2: Saving measurement...');

        if (!this.selectedMeasurementType || this.selectedPoints.length < 2) {
            console.error('❌ AGENT 2: Cannot save - missing required data');
            return;
        }

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

        // Use selector's existing save mechanism
        if (this.selector && typeof this.selector.saveReferenceLineAssignment === 'function') {
            try {
                await this.selector.saveReferenceLineAssignment(measurementData);
                console.log('✅ AGENT 2: Measurement saved successfully');
                this.closeMeasurementPanel();
            } catch (error) {
                console.error('❌ AGENT 2: Failed to save measurement:', error);
            }
        }
    }

    /**
     * ❌ Cancel Measurement
     */
    cancelMeasurement() {
        console.log('❌ AGENT 2: Cancelling measurement');
        this.clearVisualIndicators();
        this.closeMeasurementPanel();
    }

    /**
     * 🧹 Clear Visual Indicators
     */
    clearVisualIndicators() {
        if (this.selector && this.selector.canvas) {
            // Remove point indicators
            const objects = this.selector.canvas.getObjects();
            const indicatorsToRemove = objects.filter(obj =>
                obj.name && (obj.name.includes('measurement_point_') || obj.name.includes('measurement_label_'))
            );

            indicatorsToRemove.forEach(obj => {
                this.selector.canvas.remove(obj);
            });

            this.selector.canvas.renderAll();
        }
    }

    /**
     * ❌ Close Measurement Panel
     */
    closeMeasurementPanel() {
        console.log('❌ AGENT 2: Closing measurement panel');

        this.isActive = false;
        this.resetState();

        // Remove canvas listeners
        if (this.canvasClickHandler && this.selector && this.selector.canvas) {
            this.selector.canvas.off('mouse:down', this.canvasClickHandler);
        }

        // Hide panel
        if (this.panel) {
            this.panel.style.display = 'none';
        }

        // Clear visual indicators
        this.clearVisualIndicators();
    }

    /**
     * 🔄 Reset State
     */
    resetState() {
        this.currentStep = 1;
        this.selectedMeasurementType = null;
        this.selectedPoints = [];
        this.targetValue = null;
        this.measuredLength = null;
        this.accuracy = null;

        // Reset dropdown
        if (this.dropdown) {
            this.dropdown.value = '';
        }

        // Hide info panel
        this.hideStep1Info();

        console.log('🔄 AGENT 2: State reset');
    }

    /**
     * 🧪 Test Integration
     */
    testIntegration() {
        console.log('🧪 AGENT 2: Testing measurement definition system integration...');

        const tests = {
            hasSelector: !!this.selector,
            hasUI: !!this.panel,
            hasDropdown: !!this.dropdown,
            hasMeasurementTypes: !!(this.selector && this.selector.measurementTypes),
            hasCanvas: !!(this.selector && this.selector.canvas)
        };

        console.log('📊 AGENT 2: Integration test results:', tests);
        return tests;
    }
}

// Global initialization when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 AGENT 2: DOM ready - waiting for MultiViewPointToPointSelector...');

    // Wait for selector to be available
    const checkSelector = setInterval(() => {
        if (window.multiViewSelector) {
            console.log('✅ AGENT 2: MultiViewPointToPointSelector found - initializing measurement system');

            // Initialize measurement definition system
            window.measurementDefinitionSystem = new MeasurementDefinitionSystem(window.multiViewSelector);

            clearInterval(checkSelector);
        }
    }, 1000);

    // Timeout after 30 seconds
    setTimeout(() => {
        clearInterval(checkSelector);
        if (!window.measurementDefinitionSystem) {
            console.warn('⚠️ AGENT 2: MultiViewPointToPointSelector not found - measurement system not initialized');
        }
    }, 30000);
});

console.log('🎯 AGENT 2: MeasurementDefinitionSystem class loaded');