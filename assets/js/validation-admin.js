/**
 * Enhanced Measurement Validation - Admin Interface JavaScript
 *
 * Provides real-time validation feedback, interactive dashboard functionality,
 * and AJAX integration for the validation system.
 */

(function($) {
    'use strict';

    // Validation Admin Object
    const ValidationAdmin = {

        // Configuration
        config: {
            ajaxUrl: validationAdmin.ajaxUrl,
            nonce: validationAdmin.nonce,
            strings: validationAdmin.strings,
            debounceDelay: 500,
            validationTimeout: 10000,
            maxRetries: 3
        },

        // State management
        state: {
            currentTemplate: null,
            currentSize: null,
            validationInProgress: false,
            lastValidationResults: null,
            retryCount: 0
        },

        // Cache for performance
        cache: {
            templateSizes: {},
            validationResults: {},
            performanceMetrics: null
        },

        /**
         * Initialize the validation admin interface
         */
        init: function() {
            console.log('ValidationAdmin: Initializing...');

            this.bindEvents();
            this.initializeRealtimeValidation();
            this.initializePerformanceMonitoring();
            this.loadInitialData();

            console.log('ValidationAdmin: Initialization complete');
        },

        /**
         * Bind event handlers
         */
        bindEvents: function() {
            // Template selection
            $(document).on('change', '#template_id', this.onTemplateChange.bind(this));

            // Size selection
            $(document).on('change', '#size_selector', this.onSizeChange.bind(this));

            // Real-time measurement validation
            $(document).on('input', '.measurement-input-group input',
                this.debounce(this.onMeasurementInput.bind(this), this.config.debounceDelay));

            // Form submission
            $(document).on('submit', '#realtime-validation-form', this.onFormSubmit.bind(this));

            // Clear measurements
            $(document).on('click', '#clear-measurements', this.clearMeasurements.bind(this));

            // Template validation actions
            $(document).on('click', '.validate-all-sizes', this.validateAllSizes.bind(this));
            $(document).on('click', '.check-consistency', this.checkConsistency.bind(this));

            // Consistency check
            $(document).on('click', '#run-consistency-check', this.runConsistencyCheck.bind(this));

            // Report generation
            $(document).on('change', '#report_type', this.onReportTypeChange.bind(this));
            $(document).on('submit', '#generate-report-form', this.onGenerateReport.bind(this));
            $(document).on('click', '#export-csv', this.exportReportCSV.bind(this));

            // Dashboard refresh
            $(document).on('click', '.refresh-dashboard', this.refreshDashboard.bind(this));
        },

        /**
         * Initialize real-time validation
         */
        initializeRealtimeValidation: function() {
            // Add visual indicators for validation status
            $('.measurement-input-group').each(function() {
                const $group = $(this);
                const $input = $group.find('input');
                const $feedback = $group.find('.realtime-feedback');

                // Add loading indicator container
                if ($feedback.find('.loading-indicator').length === 0) {
                    $feedback.append('<span class="loading-indicator" style="display: none;"></span>');
                }
            });

            console.log('ValidationAdmin: Real-time validation initialized');
        },

        /**
         * Initialize performance monitoring
         */
        initializePerformanceMonitoring: function() {
            // Set up performance tracking
            this.performanceStartTime = Date.now();

            // Track page load performance
            $(window).on('load', function() {
                const loadTime = Date.now() - ValidationAdmin.performanceStartTime;
                console.log('ValidationAdmin: Page load time:', loadTime + 'ms');
            });
        },

        /**
         * Load initial dashboard data
         */
        loadInitialData: function() {
            this.loadDashboardData();
            this.loadPerformanceMetrics();
        },

        /**
         * Handle template selection change
         */
        onTemplateChange: function(e) {
            const templateId = $(e.target).val();

            if (templateId) {
                this.state.currentTemplate = templateId;
                this.loadTemplateSizes(templateId);
                this.clearMeasurementValidation();
            } else {
                this.state.currentTemplate = null;
                this.clearSizeSelector();
                this.clearMeasurementValidation();
            }
        },

        /**
         * Handle size selection change
         */
        onSizeChange: function(e) {
            const size = $(e.target).val();

            if (size) {
                this.state.currentSize = size;
                this.loadExpectedMeasurements();
            } else {
                this.state.currentSize = null;
                this.clearMeasurementValidation();
            }
        },

        /**
         * Handle measurement input changes
         */
        onMeasurementInput: function(e) {
            const $input = $(e.target);
            const measurementKey = this.extractMeasurementKey($input);
            const value = parseFloat($input.val());

            if (value && this.state.currentTemplate && this.state.currentSize) {
                this.validateSingleMeasurement(measurementKey, value, $input);
            } else {
                this.clearSingleMeasurementFeedback(measurementKey);
            }
        },

        /**
         * Handle form submission
         */
        onFormSubmit: function(e) {
            e.preventDefault();

            if (this.state.validationInProgress) {
                console.log('ValidationAdmin: Validation already in progress');
                return;
            }

            this.runCompleteValidation();
        },

        /**
         * Load template sizes
         */
        loadTemplateSizes: function(templateId) {
            // Check cache first
            if (this.cache.templateSizes[templateId]) {
                this.populateSizeSelector(this.cache.templateSizes[templateId]);
                return;
            }

            this.showLoading('#size_selector');

            $.ajax({
                url: this.config.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'get_template_sizes',
                    template_id: templateId,
                    nonce: this.config.nonce
                },
                timeout: this.config.validationTimeout,
                success: (response) => {
                    this.hideLoading('#size_selector');

                    if (response.success) {
                        const sizes = response.data.sizes;
                        this.cache.templateSizes[templateId] = sizes;
                        this.populateSizeSelector(sizes);
                    } else {
                        this.showError('Failed to load template sizes: ' + (response.data?.message || 'Unknown error'));
                        this.clearSizeSelector();
                    }
                },
                error: (xhr, status, error) => {
                    this.hideLoading('#size_selector');
                    this.handleAjaxError('Failed to load template sizes', xhr, status, error);
                    this.clearSizeSelector();
                }
            });
        },

        /**
         * Populate size selector dropdown
         */
        populateSizeSelector: function(sizes) {
            const $sizeSelect = $('#size_selector');
            $sizeSelect.empty().append('<option value="">' + this.config.strings.selectSize + '</option>');

            if (Array.isArray(sizes)) {
                sizes.forEach(size => {
                    $sizeSelect.append(`<option value="${size.id}">${size.name}</option>`);
                });
            }
        },

        /**
         * Validate single measurement
         */
        validateSingleMeasurement: function(measurementKey, value, $input) {
            const $feedback = this.getFeedbackElement(measurementKey);

            this.showLoadingInFeedback($feedback);

            $.ajax({
                url: this.config.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'validate_single_measurement',
                    template_id: this.state.currentTemplate,
                    size: this.state.currentSize,
                    measurement_key: measurementKey,
                    value: value,
                    nonce: this.config.nonce
                },
                timeout: this.config.validationTimeout,
                success: (response) => {
                    this.hideLoadingInFeedback($feedback);

                    if (response.success) {
                        this.displaySingleMeasurementResult(measurementKey, response.data, $input);
                    } else {
                        this.showFeedbackError($feedback, response.data?.message || 'Validation failed');
                    }
                },
                error: (xhr, status, error) => {
                    this.hideLoadingInFeedback($feedback);
                    this.showFeedbackError($feedback, 'Validation error');
                    this.handleAjaxError('Single measurement validation failed', xhr, status, error);
                }
            });
        },

        /**
         * Run complete validation
         */
        runCompleteValidation: function() {
            const $form = $('#realtime-validation-form');
            const formData = $form.serialize();
            const $resultsContainer = $('#validation-results');
            const $resultsContent = $resultsContainer.find('.results-content');

            this.state.validationInProgress = true;

            // Show results container and loading state
            $resultsContainer.show();
            $resultsContent.html(this.createLoadingHTML(this.config.strings.validating));

            // Update submit button state
            const $submitBtn = $('#validate-measurements');
            $submitBtn.prop('disabled', true).text(this.config.strings.validating);

            const startTime = Date.now();

            $.ajax({
                url: this.config.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'validate_measurement_realtime',
                    form_data: formData,
                    nonce: this.config.nonce
                },
                timeout: this.config.validationTimeout,
                success: (response) => {
                    const processingTime = Date.now() - startTime;
                    console.log('ValidationAdmin: Complete validation took', processingTime + 'ms');

                    this.state.validationInProgress = false;
                    this.resetSubmitButton($submitBtn);

                    if (response.success) {
                        this.state.lastValidationResults = response.data;
                        this.displayValidationResults(response.data, $resultsContent);
                        this.updatePerformanceMetrics(processingTime, response.data.accuracy_score);
                    } else {
                        this.showValidationError($resultsContent, response.data?.message || 'Validation failed');
                    }
                },
                error: (xhr, status, error) => {
                    this.state.validationInProgress = false;
                    this.resetSubmitButton($submitBtn);
                    this.showValidationError($resultsContent, 'Validation request failed');
                    this.handleAjaxError('Complete validation failed', xhr, status, error);
                }
            });
        },

        /**
         * Run template consistency check
         */
        runConsistencyCheck: function() {
            const $button = $('#run-consistency-check');
            const $results = $('#consistency-results');
            const includeStatistical = $('#include-statistical-analysis').is(':checked');
            const detectOutliers = $('#detect-outliers').is(':checked');

            $button.prop('disabled', true).text('Running...');
            $results.html(this.createLoadingHTML('Running consistency check...'));

            $.ajax({
                url: this.config.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'run_template_consistency_check',
                    include_statistical: includeStatistical,
                    detect_outliers: detectOutliers,
                    nonce: this.config.nonce
                },
                timeout: this.config.validationTimeout * 2, // Consistency checks may take longer
                success: (response) => {
                    $button.prop('disabled', false).text('Run Full Consistency Check');

                    if (response.success) {
                        this.displayConsistencyResults(response.data, $results);
                    } else {
                        this.showConsistencyError($results, response.data?.message || 'Consistency check failed');
                    }
                },
                error: (xhr, status, error) => {
                    $button.prop('disabled', false).text('Run Full Consistency Check');
                    this.showConsistencyError($results, 'Consistency check request failed');
                    this.handleAjaxError('Consistency check failed', xhr, status, error);
                }
            });
        },

        /**
         * Display validation results
         */
        displayValidationResults: function(results, $container) {
            let html = '<div class="validation-summary">';

            // Overall status
            html += `<div class="summary-item">
                <strong>Overall Status:</strong>
                <span class="status-${results.status}">${this.formatStatus(results.status)}</span>
            </div>`;

            // Accuracy score
            html += `<div class="summary-item">
                <strong>Accuracy Score:</strong>
                <span class="accuracy-score" data-score="${results.accuracy_score}">${results.accuracy_score}%</span>
            </div>`;

            // Processing time
            html += `<div class="summary-item">
                <strong>Processing Time:</strong>
                <span>${results.processing_time_ms}ms</span>
            </div>`;

            // Additional metrics if available
            if (results.validation_context?.measurements_available) {
                html += `<div class="summary-item">
                    <strong>Reference Data:</strong>
                    <span>Available</span>
                </div>`;
            }

            html += '</div>';

            // Real-time feedback
            if (results.realtime_feedback && results.realtime_feedback.messages.length > 0) {
                html += '<div class="validation-feedback">';
                html += '<h4>Feedback:</h4>';
                html += '<ul>';

                results.realtime_feedback.messages.forEach(message => {
                    html += `<li class="feedback-${results.realtime_feedback.severity_level}">${message}</li>`;
                });

                html += '</ul>';

                // Add suggestions if available
                if (results.realtime_feedback.suggestions && results.realtime_feedback.suggestions.length > 0) {
                    html += '<h5>Suggestions:</h5><ul>';
                    results.realtime_feedback.suggestions.forEach(suggestion => {
                        html += `<li>${suggestion}</li>`;
                    });
                    html += '</ul>';
                }

                html += '</div>';
            }

            $container.html(html);

            // Trigger custom event
            $(document).trigger('validationResultsDisplayed', [results]);
        },

        /**
         * Display single measurement result
         */
        displaySingleMeasurementResult: function(measurementKey, result, $input) {
            const $feedback = this.getFeedbackElement(measurementKey);
            const $inputGroup = $input.closest('.measurement-input-group');

            // Remove previous validation classes
            $inputGroup.removeClass('validation-valid validation-invalid validation-warning');

            if (result.valid) {
                const icon = '✓';
                const message = result.message || 'Valid';
                const accuracy = result.accuracy_percentage ? ` (${result.accuracy_percentage}%)` : '';

                $feedback.html(`<span class="feedback-valid">${icon} ${message}${accuracy}</span>`);
                $inputGroup.addClass('validation-valid');
            } else {
                const icon = '✗';
                const message = result.message || 'Invalid';

                $feedback.html(`<span class="feedback-invalid">${icon} ${message}</span>`);
                $inputGroup.addClass('validation-invalid');
            }

            // Add precision grade if available
            if (result.precision_grade) {
                const gradeClass = result.precision_grade.toLowerCase().replace(' ', '-');
                $feedback.append(`<div class="precision-grade ${gradeClass}">Grade: ${result.precision_grade}</div>`);
            }
        },

        /**
         * Display consistency results
         */
        displayConsistencyResults: function(results, $container) {
            let html = '<div class="consistency-summary">';
            html += '<h4>Consistency Analysis Results</h4>';

            html += `<p><strong>Overall Consistency Score:</strong> ${results.average_consistency_score}%</p>`;
            html += `<p><strong>Templates Analyzed:</strong> ${Object.keys(results.template_results || {}).length}</p>`;
            html += `<p><strong>Meets Threshold:</strong> ${results.overall_consistent ? 'Yes' : 'No'}</p>`;

            // Add detailed results if available
            if (results.template_results && Object.keys(results.template_results).length > 0) {
                html += '<div class="template-consistency-details">';
                html += '<h5>Individual Template Results:</h5>';
                html += '<div class="template-results-grid">';

                Object.entries(results.template_results).forEach(([templateId, templateResult]) => {
                    html += `<div class="template-result-item">
                        <strong>Template ${templateId}:</strong> ${templateResult.consistency_score || 'N/A'}%
                    </div>`;
                });

                html += '</div></div>';
            }

            // Add recommendations
            if (results.recommendations && results.recommendations.length > 0) {
                html += '<div class="consistency-recommendations">';
                html += '<h5>Recommendations:</h5>';
                html += '<ul>';

                results.recommendations.forEach(recommendation => {
                    html += `<li>${recommendation}</li>`;
                });

                html += '</ul>';
                html += '</div>';
            }

            html += '</div>';
            $container.html(html);
        },

        /**
         * Clear measurements form
         */
        clearMeasurements: function() {
            $('#realtime-validation-form')[0].reset();
            $('.realtime-feedback').empty();
            $('#validation-results').hide();
            $('.measurement-input-group').removeClass('validation-valid validation-invalid validation-warning');

            this.state.lastValidationResults = null;

            console.log('ValidationAdmin: Measurements cleared');
        },

        /**
         * Utility functions
         */

        extractMeasurementKey: function($input) {
            const name = $input.attr('name');
            const match = name.match(/measurements\[(\w+)\]/);
            return match ? match[1] : null;
        },

        getFeedbackElement: function(measurementKey) {
            return $(`#feedback_${measurementKey}`);
        },

        showLoading: function(selector) {
            const $element = $(selector);
            $element.after('<span class="spinner is-active loading-temp"></span>');
        },

        hideLoading: function(selector) {
            $(selector).next('.loading-temp').remove();
        },

        showLoadingInFeedback: function($feedback) {
            $feedback.html('<span class="spinner is-active"></span>');
        },

        hideLoadingInFeedback: function($feedback) {
            $feedback.find('.spinner').remove();
        },

        createLoadingHTML: function(message) {
            return `<div class="loading-container">
                <span class="spinner is-active"></span>
                <span class="loading-message">${message}</span>
            </div>`;
        },

        showError: function(message) {
            console.error('ValidationAdmin:', message);
            // Could integrate with WordPress admin notices here
        },

        showFeedbackError: function($feedback, message) {
            $feedback.html(`<span class="feedback-error">✗ ${message}</span>`);
        },

        showValidationError: function($container, message) {
            $container.html(`<div class="notice notice-error"><p>Validation failed: ${message}</p></div>`);
        },

        showConsistencyError: function($container, message) {
            $container.html(`<div class="notice notice-error"><p>Consistency check failed: ${message}</p></div>`);
        },

        formatStatus: function(status) {
            return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        },

        resetSubmitButton: function($button) {
            $button.prop('disabled', false).text('Validate Measurements');
        },

        handleAjaxError: function(context, xhr, status, error) {
            console.error(`ValidationAdmin ${context}:`, {
                status: status,
                error: error,
                response: xhr.responseText
            });

            // Implement retry logic for certain errors
            if (this.state.retryCount < this.config.maxRetries && status !== 'timeout') {
                this.state.retryCount++;
                console.log(`ValidationAdmin: Retrying... (${this.state.retryCount}/${this.config.maxRetries})`);
                // Could implement automatic retry here
            }
        },

        clearSizeSelector: function() {
            $('#size_selector').empty().append('<option value="">Select Size</option>');
        },

        clearMeasurementValidation: function() {
            $('.realtime-feedback').empty();
            $('.measurement-input-group').removeClass('validation-valid validation-invalid validation-warning');
        },

        clearSingleMeasurementFeedback: function(measurementKey) {
            this.getFeedbackElement(measurementKey).empty();
        },

        updatePerformanceMetrics: function(processingTime, accuracyScore) {
            // Store metrics for dashboard updates
            if (!this.cache.performanceMetrics) {
                this.cache.performanceMetrics = {
                    validationTimes: [],
                    accuracyScores: [],
                    totalValidations: 0
                };
            }

            this.cache.performanceMetrics.validationTimes.push(processingTime);
            this.cache.performanceMetrics.accuracyScores.push(accuracyScore);
            this.cache.performanceMetrics.totalValidations++;

            // Keep only last 100 entries
            if (this.cache.performanceMetrics.validationTimes.length > 100) {
                this.cache.performanceMetrics.validationTimes.shift();
                this.cache.performanceMetrics.accuracyScores.shift();
            }
        },

        loadDashboardData: function() {
            // Implementation for loading dashboard data
            console.log('ValidationAdmin: Loading dashboard data...');
        },

        loadPerformanceMetrics: function() {
            // Implementation for loading performance metrics
            console.log('ValidationAdmin: Loading performance metrics...');
        },

        loadExpectedMeasurements: function() {
            // Implementation for loading expected measurements for the selected template/size
            console.log('ValidationAdmin: Loading expected measurements...');
        },

        refreshDashboard: function() {
            // Implementation for refreshing dashboard data
            console.log('ValidationAdmin: Refreshing dashboard...');
        },

        validateAllSizes: function() {
            // Implementation for validating all sizes of current template
            console.log('ValidationAdmin: Validating all sizes...');
        },

        checkConsistency: function() {
            // Implementation for checking consistency of current template
            console.log('ValidationAdmin: Checking consistency...');
        },

        onReportTypeChange: function(e) {
            const reportType = $(e.target).val();
            if (reportType === 'template_specific') {
                $('#template-selection').show();
            } else {
                $('#template-selection').hide();
            }
        },

        onGenerateReport: function(e) {
            e.preventDefault();
            // Implementation for report generation
            console.log('ValidationAdmin: Generating report...');
        },

        exportReportCSV: function() {
            // Implementation for CSV export
            console.log('ValidationAdmin: Exporting CSV...');
        },

        /**
         * Debounce utility function
         */
        debounce: function(func, wait, immediate) {
            let timeout;
            return function executedFunction() {
                const context = this;
                const args = arguments;
                const later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        }
    };

    // Initialize when document is ready
    $(document).ready(function() {
        ValidationAdmin.init();
    });

    // Make ValidationAdmin available globally for debugging
    window.ValidationAdmin = ValidationAdmin;

})(jQuery);