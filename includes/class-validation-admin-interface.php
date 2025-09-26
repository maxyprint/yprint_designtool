<?php
/**
 * Enhanced Measurement Validation - WordPress Admin Interface
 *
 * Provides real-time validation feedback, measurement quality dashboard,
 * and validation controls in the WordPress admin interface.
 *
 * @package Octo_Print_Designer
 * @since 1.0.0
 */

class ValidationAdminInterface {

    private $enhanced_validator;
    private $template_measurement_manager;
    private $validation_page_slug = 'measurement-validation';

    public function __construct() {
        $this->enhanced_validator = new EnhancedMeasurementValidator();
        $this->template_measurement_manager = new TemplateMeasurementManager();

        $this->init_hooks();
    }

    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        // Admin menu and pages
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));

        // AJAX handlers for real-time validation
        add_action('wp_ajax_validate_measurement_realtime', array($this, 'ajax_validate_measurement_realtime'));
        add_action('wp_ajax_get_validation_dashboard_data', array($this, 'ajax_get_validation_dashboard_data'));
        add_action('wp_ajax_run_template_consistency_check', array($this, 'ajax_run_template_consistency_check'));
        add_action('wp_ajax_export_validation_report', array($this, 'ajax_export_validation_report'));

        // Template editor integration
        add_action('add_meta_boxes', array($this, 'add_measurement_validation_metabox'));
        add_action('save_post', array($this, 'validate_template_measurements_on_save'));

        // WooCommerce integration
        add_action('woocommerce_checkout_process', array($this, 'validate_measurements_at_checkout'));
        add_filter('woocommerce_add_to_cart_validation', array($this, 'validate_measurements_add_to_cart'), 10, 6);

        // Settings integration
        add_action('admin_init', array($this, 'register_validation_settings'));
    }

    /**
     * Add admin menu for validation dashboard
     */
    public function add_admin_menu() {
        add_submenu_page(
            'edit.php?post_type=octo_template',
            'Measurement Validation',
            'Measurement Validation',
            'manage_options',
            $this->validation_page_slug,
            array($this, 'render_validation_dashboard')
        );

        add_submenu_page(
            'edit.php?post_type=octo_template',
            'Validation Reports',
            'Validation Reports',
            'manage_options',
            'validation-reports',
            array($this, 'render_validation_reports')
        );
    }

    /**
     * Enqueue admin scripts and styles
     */
    public function enqueue_admin_scripts($hook) {
        if (strpos($hook, $this->validation_page_slug) !== false ||
            strpos($hook, 'validation-reports') !== false ||
            get_post_type() === 'octo_template') {

            wp_enqueue_script(
                'validation-admin-js',
                plugin_dir_url(__FILE__) . '../assets/js/validation-admin.js',
                array('jquery', 'wp-util'),
                '1.0.0',
                true
            );

            wp_enqueue_style(
                'validation-admin-css',
                plugin_dir_url(__FILE__) . '../assets/css/validation-admin.css',
                array(),
                '1.0.0'
            );

            wp_localize_script('validation-admin-js', 'validationAdmin', array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('validation_admin_nonce'),
                'strings' => array(
                    'validating' => __('Validating measurements...', 'octo-print-designer'),
                    'validationComplete' => __('Validation complete', 'octo-print-designer'),
                    'validationFailed' => __('Validation failed', 'octo-print-designer'),
                    'accuracyScore' => __('Accuracy Score', 'octo-print-designer'),
                    'precisionCheck' => __('Precision Check', 'octo-print-designer'),
                    'consistencyCheck' => __('Consistency Check', 'octo-print-designer')
                )
            ));
        }
    }

    /**
     * Render validation dashboard page
     */
    public function render_validation_dashboard() {
        // Get dashboard data
        $performance_metrics = $this->enhanced_validator->getValidationPerformanceMetrics();
        $template_count = wp_count_posts('octo_template')->publish;
        $recent_validations = $this->get_recent_validation_results();

        ?>
        <div class="wrap">
            <h1><?php _e('Measurement Validation Dashboard', 'octo-print-designer'); ?></h1>

            <!-- Performance Overview Cards -->
            <div class="validation-dashboard-cards">
                <div class="validation-card">
                    <h3><?php _e('Total Validations', 'octo-print-designer'); ?></h3>
                    <div class="card-value"><?php echo number_format($performance_metrics['validation_performance']['total_validations']); ?></div>
                </div>

                <div class="validation-card">
                    <h3><?php _e('Average Accuracy Score', 'octo-print-designer'); ?></h3>
                    <div class="card-value accuracy-score" data-score="<?php echo $performance_metrics['validation_performance']['average_accuracy_score']; ?>">
                        <?php echo round($performance_metrics['validation_performance']['average_accuracy_score'], 1); ?>%
                    </div>
                </div>

                <div class="validation-card">
                    <h3><?php _e('Average Processing Time', 'octo-print-designer'); ?></h3>
                    <div class="card-value"><?php echo $performance_metrics['validation_performance']['average_validation_time_ms']; ?>ms</div>
                </div>

                <div class="validation-card">
                    <h3><?php _e('Error Rate', 'octo-print-designer'); ?></h3>
                    <div class="card-value error-rate" data-rate="<?php echo $performance_metrics['validation_performance']['error_rate_percentage']; ?>">
                        <?php echo $performance_metrics['validation_performance']['error_rate_percentage']; ?>%
                    </div>
                </div>
            </div>

            <!-- Real-time Validation Interface -->
            <div class="validation-section">
                <h2><?php _e('Real-time Measurement Validation', 'octo-print-designer'); ?></h2>
                <div class="validation-form">
                    <form id="realtime-validation-form">
                        <?php wp_nonce_field('validation_admin_nonce', 'validation_nonce'); ?>

                        <div class="form-row">
                            <label for="template_id"><?php _e('Template:', 'octo-print-designer'); ?></label>
                            <select id="template_id" name="template_id" required>
                                <option value=""><?php _e('Select Template', 'octo-print-designer'); ?></option>
                                <?php
                                $templates = get_posts(array('post_type' => 'octo_template', 'posts_per_page' => -1));
                                foreach ($templates as $template) {
                                    echo '<option value="' . $template->ID . '">' . esc_html($template->post_title) . '</option>';
                                }
                                ?>
                            </select>
                        </div>

                        <div class="form-row">
                            <label for="size_selector"><?php _e('Size:', 'octo-print-designer'); ?></label>
                            <select id="size_selector" name="size" required>
                                <option value=""><?php _e('Select Size', 'octo-print-designer'); ?></option>
                            </select>
                        </div>

                        <div class="measurement-inputs">
                            <h4><?php _e('Measurement Values (cm)', 'octo-print-designer'); ?></h4>
                            <div class="measurement-grid">
                                <?php
                                $measurement_labels = [
                                    'A' => 'Chest',
                                    'B' => 'Hem Width',
                                    'C' => 'Height from Shoulder',
                                    'D' => 'Sleeve Length',
                                    'E' => 'Sleeve Opening',
                                    'F' => 'Shoulder to Shoulder',
                                    'G' => 'Neck Opening',
                                    'H' => 'Biceps',
                                    'J' => 'Rib Height'
                                ];

                                foreach ($measurement_labels as $key => $label) {
                                    echo '<div class="measurement-input-group">';
                                    echo '<label for="measurement_' . $key . '">' . $label . ' (' . $key . '):</label>';
                                    echo '<input type="number" id="measurement_' . $key . '" name="measurements[' . $key . ']" step="0.1" min="0" max="1000" />';
                                    echo '<div class="realtime-feedback" id="feedback_' . $key . '"></div>';
                                    echo '</div>';
                                }
                                ?>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="button button-primary" id="validate-measurements">
                                <?php _e('Validate Measurements', 'octo-print-designer'); ?>
                            </button>
                            <button type="button" class="button" id="clear-measurements">
                                <?php _e('Clear', 'octo-print-designer'); ?>
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Validation Results Display -->
                <div id="validation-results" class="validation-results" style="display: none;">
                    <h3><?php _e('Validation Results', 'octo-print-designer'); ?></h3>
                    <div class="results-content"></div>
                </div>
            </div>

            <!-- Template Consistency Check -->
            <div class="validation-section">
                <h2><?php _e('Template Consistency Analysis', 'octo-print-designer'); ?></h2>
                <div class="consistency-controls">
                    <button type="button" class="button button-secondary" id="run-consistency-check">
                        <?php _e('Run Full Consistency Check', 'octo-print-designer'); ?>
                    </button>
                    <div class="consistency-options">
                        <label>
                            <input type="checkbox" id="include-statistical-analysis" checked />
                            <?php _e('Include Statistical Analysis', 'octo-print-designer'); ?>
                        </label>
                        <label>
                            <input type="checkbox" id="detect-outliers" checked />
                            <?php _e('Detect Outliers', 'octo-print-designer'); ?>
                        </label>
                    </div>
                </div>
                <div id="consistency-results" class="consistency-results"></div>
            </div>

            <!-- Recent Validation History -->
            <div class="validation-section">
                <h2><?php _e('Recent Validation History', 'octo-print-designer'); ?></h2>
                <div class="validation-history-table">
                    <table class="wp-list-table widefat fixed striped">
                        <thead>
                            <tr>
                                <th><?php _e('Timestamp', 'octo-print-designer'); ?></th>
                                <th><?php _e('Template', 'octo-print-designer'); ?></th>
                                <th><?php _e('Size', 'octo-print-designer'); ?></th>
                                <th><?php _e('Accuracy Score', 'octo-print-designer'); ?></th>
                                <th><?php _e('Status', 'octo-print-designer'); ?></th>
                                <th><?php _e('Processing Time', 'octo-print-designer'); ?></th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($recent_validations as $validation): ?>
                            <tr>
                                <td><?php echo date('Y-m-d H:i:s', $validation['timestamp']); ?></td>
                                <td><?php echo esc_html($validation['template_title']); ?></td>
                                <td><?php echo esc_html($validation['size']); ?></td>
                                <td class="accuracy-score" data-score="<?php echo $validation['accuracy_score']; ?>">
                                    <?php echo $validation['accuracy_score']; ?>%
                                </td>
                                <td class="validation-status <?php echo $validation['status']; ?>">
                                    <?php echo ucfirst($validation['status']); ?>
                                </td>
                                <td><?php echo $validation['processing_time']; ?>ms</td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <script type="text/javascript">
        jQuery(document).ready(function($) {
            // Real-time validation functionality
            $('#template_id').on('change', function() {
                var templateId = $(this).val();
                if (templateId) {
                    loadTemplateSizes(templateId);
                }
            });

            $('.measurement-input-group input').on('input', function() {
                var measurementKey = $(this).attr('name').match(/\[(\w+)\]/)[1];
                var value = $(this).val();

                if (value && $('#template_id').val() && $('#size_selector').val()) {
                    validateSingleMeasurement(measurementKey, value);
                }
            });

            $('#realtime-validation-form').on('submit', function(e) {
                e.preventDefault();
                runCompleteValidation();
            });

            $('#run-consistency-check').on('click', function() {
                runTemplateConsistencyCheck();
            });

            function loadTemplateSizes(templateId) {
                $.post(validationAdmin.ajaxUrl, {
                    action: 'get_template_sizes',
                    template_id: templateId,
                    nonce: validationAdmin.nonce
                }, function(response) {
                    if (response.success) {
                        var sizeSelect = $('#size_selector');
                        sizeSelect.empty().append('<option value="">Select Size</option>');

                        $.each(response.data.sizes, function(i, size) {
                            sizeSelect.append('<option value="' + size.id + '">' + size.name + '</option>');
                        });
                    }
                });
            }

            function validateSingleMeasurement(measurementKey, value) {
                var feedbackDiv = $('#feedback_' + measurementKey);
                feedbackDiv.html('<span class="spinner is-active"></span>');

                $.post(validationAdmin.ajaxUrl, {
                    action: 'validate_single_measurement',
                    template_id: $('#template_id').val(),
                    size: $('#size_selector').val(),
                    measurement_key: measurementKey,
                    value: value,
                    nonce: validationAdmin.nonce
                }, function(response) {
                    if (response.success) {
                        var result = response.data;
                        var feedbackClass = result.valid ? 'feedback-valid' : 'feedback-invalid';
                        var feedbackIcon = result.valid ? '✓' : '✗';
                        var feedbackText = result.valid ? 'Valid' : result.message;

                        feedbackDiv.html('<span class="' + feedbackClass + '">' + feedbackIcon + ' ' + feedbackText + '</span>');
                    } else {
                        feedbackDiv.html('<span class="feedback-error">✗ Validation error</span>');
                    }
                });
            }

            function runCompleteValidation() {
                var $form = $('#realtime-validation-form');
                var formData = $form.serialize();

                $('#validation-results').show();
                $('.results-content').html('<div class="spinner is-active"></div> Validating measurements...');

                $.post(validationAdmin.ajaxUrl, {
                    action: 'validate_measurement_realtime',
                    form_data: formData,
                    nonce: validationAdmin.nonce
                }, function(response) {
                    if (response.success) {
                        displayValidationResults(response.data);
                    } else {
                        $('.results-content').html('<div class="notice notice-error"><p>Validation failed: ' + response.data.message + '</p></div>');
                    }
                });
            }

            function displayValidationResults(results) {
                var html = '<div class="validation-summary">';
                html += '<div class="summary-item"><strong>Overall Status:</strong> <span class="status-' + results.status + '">' + results.status + '</span></div>';
                html += '<div class="summary-item"><strong>Accuracy Score:</strong> <span class="accuracy-score" data-score="' + results.accuracy_score + '">' + results.accuracy_score + '%</span></div>';
                html += '<div class="summary-item"><strong>Processing Time:</strong> ' + results.processing_time_ms + 'ms</div>';
                html += '</div>';

                if (results.realtime_feedback && results.realtime_feedback.messages.length > 0) {
                    html += '<div class="validation-feedback">';
                    html += '<h4>Feedback:</h4><ul>';
                    $.each(results.realtime_feedback.messages, function(i, message) {
                        html += '<li class="feedback-' + results.realtime_feedback.severity_level + '">' + message + '</li>';
                    });
                    html += '</ul></div>';
                }

                $('.results-content').html(html);
            }

            function runTemplateConsistencyCheck() {
                $('#consistency-results').html('<div class="spinner is-active"></div> Running consistency check...');

                $.post(validationAdmin.ajaxUrl, {
                    action: 'run_template_consistency_check',
                    include_statistical: $('#include-statistical-analysis').is(':checked'),
                    detect_outliers: $('#detect-outliers').is(':checked'),
                    nonce: validationAdmin.nonce
                }, function(response) {
                    if (response.success) {
                        displayConsistencyResults(response.data);
                    } else {
                        $('#consistency-results').html('<div class="notice notice-error"><p>Consistency check failed</p></div>');
                    }
                });
            }

            function displayConsistencyResults(results) {
                var html = '<div class="consistency-summary">';
                html += '<h4>Consistency Analysis Results</h4>';
                html += '<p><strong>Overall Consistency Score:</strong> ' + results.average_consistency_score + '%</p>';
                html += '<p><strong>Templates Analyzed:</strong> ' + Object.keys(results.template_results).length + '</p>';

                if (results.recommendations && results.recommendations.length > 0) {
                    html += '<div class="consistency-recommendations">';
                    html += '<h5>Recommendations:</h5><ul>';
                    $.each(results.recommendations, function(i, recommendation) {
                        html += '<li>' + recommendation + '</li>';
                    });
                    html += '</ul></div>';
                }

                html += '</div>';
                $('#consistency-results').html(html);
            }
        });
        </script>
        <?php
    }

    /**
     * Render validation reports page
     */
    public function render_validation_reports() {
        ?>
        <div class="wrap">
            <h1><?php _e('Validation Reports', 'octo-print-designer'); ?></h1>

            <div class="validation-reports-section">
                <h2><?php _e('Generate Validation Report', 'octo-print-designer'); ?></h2>

                <form id="generate-report-form">
                    <?php wp_nonce_field('validation_admin_nonce', 'validation_nonce'); ?>

                    <div class="form-row">
                        <label for="report_type"><?php _e('Report Type:', 'octo-print-designer'); ?></label>
                        <select id="report_type" name="report_type">
                            <option value="comprehensive"><?php _e('Comprehensive Validation Report', 'octo-print-designer'); ?></option>
                            <option value="template_specific"><?php _e('Template-Specific Report', 'octo-print-designer'); ?></option>
                            <option value="performance"><?php _e('Performance Analysis Report', 'octo-print-designer'); ?></option>
                            <option value="error_analysis"><?php _e('Error Analysis Report', 'octo-print-designer'); ?></option>
                        </select>
                    </div>

                    <div class="form-row" id="template-selection" style="display: none;">
                        <label for="report_template_id"><?php _e('Template:', 'octo-print-designer'); ?></label>
                        <select id="report_template_id" name="template_id">
                            <option value=""><?php _e('Select Template', 'octo-print-designer'); ?></option>
                            <?php
                            $templates = get_posts(array('post_type' => 'octo_template', 'posts_per_page' => -1));
                            foreach ($templates as $template) {
                                echo '<option value="' . $template->ID . '">' . esc_html($template->post_title) . '</option>';
                            }
                            ?>
                        </select>
                    </div>

                    <div class="form-row">
                        <label for="date_range"><?php _e('Date Range:', 'octo-print-designer'); ?></label>
                        <select id="date_range" name="date_range">
                            <option value="7"><?php _e('Last 7 Days', 'octo-print-designer'); ?></option>
                            <option value="30"><?php _e('Last 30 Days', 'octo-print-designer'); ?></option>
                            <option value="90"><?php _e('Last 90 Days', 'octo-print-designer'); ?></option>
                            <option value="all"><?php _e('All Time', 'octo-print-designer'); ?></option>
                        </select>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="button button-primary">
                            <?php _e('Generate Report', 'octo-print-designer'); ?>
                        </button>
                        <button type="button" class="button" id="export-csv">
                            <?php _e('Export as CSV', 'octo-print-designer'); ?>
                        </button>
                    </div>
                </form>

                <div id="report-results" class="report-results"></div>
            </div>
        </div>

        <script type="text/javascript">
        jQuery(document).ready(function($) {
            $('#report_type').on('change', function() {
                if ($(this).val() === 'template_specific') {
                    $('#template-selection').show();
                } else {
                    $('#template-selection').hide();
                }
            });

            $('#generate-report-form').on('submit', function(e) {
                e.preventDefault();
                generateValidationReport();
            });

            function generateValidationReport() {
                var formData = $('#generate-report-form').serialize();
                $('#report-results').html('<div class="spinner is-active"></div> Generating report...');

                $.post(validationAdmin.ajaxUrl, {
                    action: 'export_validation_report',
                    form_data: formData,
                    nonce: validationAdmin.nonce
                }, function(response) {
                    if (response.success) {
                        $('#report-results').html(response.data.html);
                    } else {
                        $('#report-results').html('<div class="notice notice-error"><p>Report generation failed</p></div>');
                    }
                });
            }
        });
        </script>
        <?php
    }

    /**
     * Add measurement validation metabox to template editor
     */
    public function add_measurement_validation_metabox() {
        add_meta_box(
            'measurement-validation',
            __('Measurement Validation', 'octo-print-designer'),
            array($this, 'render_measurement_validation_metabox'),
            'octo_template',
            'normal',
            'high'
        );
    }

    /**
     * Render measurement validation metabox
     */
    public function render_measurement_validation_metabox($post) {
        $template_id = $post->ID;
        $measurements = $this->template_measurement_manager->get_measurements($template_id);
        $template_sizes = $this->template_measurement_manager->get_template_sizes($template_id);

        // Run validation on current measurements
        $validation_results = [];
        foreach ($measurements as $size => $size_measurements) {
            $measurement_values = array_map(function($m) { return $m['value_cm']; }, $size_measurements);
            $validation_result = $this->enhanced_validator->validateMeasurementRealtime(
                $measurement_values,
                $template_id,
                $size
            );
            $validation_results[$size] = $validation_result;
        }

        ?>
        <div class="measurement-validation-metabox">
            <div class="validation-summary">
                <h4><?php _e('Template Measurement Validation Summary', 'octo-print-designer'); ?></h4>
                <?php if (empty($measurements)): ?>
                    <p class="no-measurements"><?php _e('No measurements found for this template.', 'octo-print-designer'); ?></p>
                <?php else: ?>
                    <div class="size-validation-grid">
                        <?php foreach ($validation_results as $size => $result): ?>
                            <div class="size-validation-item">
                                <h5><?php echo esc_html($size); ?></h5>
                                <div class="validation-status <?php echo is_array($result) ? $result['status'] : 'error'; ?>">
                                    <?php
                                    if (is_array($result)) {
                                        echo ucfirst($result['status']);
                                        if (isset($result['accuracy_score'])) {
                                            echo ' (' . $result['accuracy_score'] . '% accuracy)';
                                        }
                                    } else {
                                        echo 'Error';
                                    }
                                    ?>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>

            <div class="validation-actions">
                <button type="button" class="button button-secondary validate-all-sizes">
                    <?php _e('Re-validate All Sizes', 'octo-print-designer'); ?>
                </button>
                <button type="button" class="button button-secondary check-consistency">
                    <?php _e('Check Consistency', 'octo-print-designer'); ?>
                </button>
            </div>

            <div class="validation-details" id="template-validation-details">
                <!-- Detailed validation results will be loaded here via AJAX -->
            </div>
        </div>
        <?php
    }

    /**
     * AJAX handler for real-time measurement validation
     */
    public function ajax_validate_measurement_realtime() {
        check_ajax_referer('validation_admin_nonce', 'nonce');

        try {
            parse_str($_POST['form_data'], $form_data);

            $template_id = intval($form_data['template_id']);
            $size = sanitize_text_field($form_data['size']);
            $measurements = array_map('floatval', $form_data['measurements']);

            // Remove empty measurements
            $measurements = array_filter($measurements, function($value) {
                return $value > 0;
            });

            if (empty($measurements)) {
                wp_send_json_error(array('message' => 'No valid measurements provided'));
            }

            $validation_result = $this->enhanced_validator->validateMeasurementRealtime(
                $measurements,
                $template_id,
                $size
            );

            if (is_wp_error($validation_result)) {
                wp_send_json_error(array('message' => $validation_result->get_error_message()));
            }

            wp_send_json_success($validation_result);

        } catch (Exception $e) {
            wp_send_json_error(array('message' => 'Validation failed: ' . $e->getMessage()));
        }
    }

    /**
     * AJAX handler for template consistency check
     */
    public function ajax_run_template_consistency_check() {
        check_ajax_referer('validation_admin_nonce', 'nonce');

        try {
            $include_statistical = isset($_POST['include_statistical']) && $_POST['include_statistical'] === 'true';
            $detect_outliers = isset($_POST['detect_outliers']) && $_POST['detect_outliers'] === 'true';

            // Get all template measurements
            $templates = get_posts(array('post_type' => 'octo_template', 'posts_per_page' => -1));
            $template_measurements = [];
            $reference_templates = [];

            foreach ($templates as $template) {
                $measurements = $this->template_measurement_manager->get_measurements($template->ID);
                if (!empty($measurements)) {
                    $template_measurements[$template->ID] = $measurements;
                    $reference_templates[$template->ID] = $measurements; // Using same data as reference
                }
            }

            $consistency_result = $this->enhanced_validator->validateTemplateConsistency(
                $template_measurements,
                $reference_templates,
                array(
                    'include_statistical' => $include_statistical,
                    'detect_outliers' => $detect_outliers
                )
            );

            wp_send_json_success($consistency_result);

        } catch (Exception $e) {
            wp_send_json_error(array('message' => 'Consistency check failed: ' . $e->getMessage()));
        }
    }

    /**
     * AJAX handler for validation dashboard data
     */
    public function ajax_get_validation_dashboard_data() {
        check_ajax_referer('validation_admin_nonce', 'nonce');

        try {
            $dashboard_data = array(
                'performance_metrics' => $this->enhanced_validator->getValidationPerformanceMetrics(),
                'template_count' => wp_count_posts('octo_template')->publish,
                'recent_validations' => $this->get_recent_validation_results(10)
            );

            wp_send_json_success($dashboard_data);

        } catch (Exception $e) {
            wp_send_json_error(array('message' => 'Failed to load dashboard data: ' . $e->getMessage()));
        }
    }

    /**
     * Validate template measurements on save
     */
    public function validate_template_measurements_on_save($post_id) {
        if (get_post_type($post_id) !== 'octo_template') {
            return;
        }

        // Run validation and store results
        $measurements = $this->template_measurement_manager->get_measurements($post_id);
        $validation_summary = array();

        foreach ($measurements as $size => $size_measurements) {
            $measurement_values = array_map(function($m) { return $m['value_cm']; }, $size_measurements);
            $validation_result = $this->enhanced_validator->validateMeasurementRealtime(
                $measurement_values,
                $post_id,
                $size
            );

            if (!is_wp_error($validation_result)) {
                $validation_summary[$size] = array(
                    'status' => $validation_result['status'],
                    'accuracy_score' => $validation_result['accuracy_score'],
                    'timestamp' => current_time('timestamp')
                );
            }
        }

        update_post_meta($post_id, '_measurement_validation_summary', $validation_summary);
    }

    /**
     * Register validation settings
     */
    public function register_validation_settings() {
        register_setting('octo_print_designer_settings', 'validation_precision_tolerance');
        register_setting('octo_print_designer_settings', 'validation_enable_realtime');
        register_setting('octo_print_designer_settings', 'validation_enable_checkout');
        register_setting('octo_print_designer_settings', 'validation_statistical_analysis');
    }

    /**
     * Get recent validation results
     */
    private function get_recent_validation_results($limit = 20) {
        // This would typically query a validation log table
        // For now, returning mock data
        return array(
            array(
                'timestamp' => current_time('timestamp') - 3600,
                'template_title' => 'Basic T-Shirt',
                'size' => 'M',
                'accuracy_score' => 95.2,
                'status' => 'valid',
                'processing_time' => 12.5
            ),
            array(
                'timestamp' => current_time('timestamp') - 7200,
                'template_title' => 'Premium Hoodie',
                'size' => 'L',
                'accuracy_score' => 87.8,
                'status' => 'warning',
                'processing_time' => 18.3
            )
        );
    }
}

// Initialize the admin interface
if (is_admin()) {
    new ValidationAdminInterface();
}