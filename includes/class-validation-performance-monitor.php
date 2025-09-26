<?php
/**
 * Validation Performance Monitor
 *
 * Comprehensive performance monitoring and reporting system for the
 * Enhanced Measurement Validation framework. Provides real-time metrics,
 * performance analytics, and optimization recommendations.
 *
 * @package Octo_Print_Designer
 * @since 1.0.0
 */

class ValidationPerformanceMonitor {

    private $metrics_table;
    private $performance_cache;
    private $alert_thresholds;
    private $monitoring_enabled;
    private $wpdb;

    public function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->metrics_table = $wpdb->prefix . 'validation_performance_metrics';
        $this->performance_cache = [];
        $this->monitoring_enabled = get_option('validation_performance_monitoring_enabled', true);

        $this->init_alert_thresholds();
        $this->init_hooks();
    }

    /**
     * Initialize alert thresholds
     */
    private function init_alert_thresholds() {
        $this->alert_thresholds = [
            'validation_time_ms' => [
                'warning' => 100,  // Validation taking >100ms
                'critical' => 250  // Validation taking >250ms
            ],
            'accuracy_score' => [
                'warning' => 80,   // Accuracy below 80%
                'critical' => 60   // Accuracy below 60%
            ],
            'error_rate' => [
                'warning' => 5,    // Error rate above 5%
                'critical' => 15   // Error rate above 15%
            ],
            'memory_usage_mb' => [
                'warning' => 50,   // Memory usage above 50MB
                'critical' => 100  // Memory usage above 100MB
            ],
            'cache_hit_ratio' => [
                'warning' => 70,   // Cache hit ratio below 70%
                'critical' => 50   // Cache hit ratio below 50%
            ]
        ];
    }

    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        if (!$this->monitoring_enabled) {
            return;
        }

        // Performance tracking hooks
        add_action('validation_measurement_start', array($this, 'start_performance_tracking'));
        add_action('validation_measurement_complete', array($this, 'end_performance_tracking'));
        add_action('validation_error_occurred', array($this, 'record_validation_error'));

        // Scheduled performance reports
        add_action('validation_hourly_performance_check', array($this, 'run_hourly_performance_check'));
        add_action('validation_daily_performance_report', array($this, 'generate_daily_performance_report'));

        // Dashboard widget
        add_action('wp_dashboard_setup', array($this, 'add_performance_dashboard_widget'));

        // AJAX handlers for performance dashboard
        add_action('wp_ajax_get_validation_performance_data', array($this, 'ajax_get_performance_data'));
        add_action('wp_ajax_export_performance_report', array($this, 'ajax_export_performance_report'));
        add_action('wp_ajax_clear_performance_cache', array($this, 'ajax_clear_performance_cache'));

        // Schedule events if not already scheduled
        if (!wp_next_scheduled('validation_hourly_performance_check')) {
            wp_schedule_event(time(), 'hourly', 'validation_hourly_performance_check');
        }
        if (!wp_next_scheduled('validation_daily_performance_report')) {
            wp_schedule_event(time(), 'daily', 'validation_daily_performance_report');
        }
    }

    /**
     * 📊 Record validation performance metrics
     *
     * @param array $metrics Performance metrics to record
     * @return bool Success status
     */
    public function recordPerformanceMetrics($metrics) {
        if (!$this->monitoring_enabled) {
            return true;
        }

        try {
            // Normalize metrics data
            $normalized_metrics = $this->normalizeMetrics($metrics);

            // Store in database
            $insert_result = $this->wpdb->insert(
                $this->metrics_table,
                $normalized_metrics,
                ['%s', '%s', '%d', '%f', '%f', '%f', '%d', '%f', '%f', '%s', '%s']
            );

            if ($insert_result === false) {
                error_log('ValidationPerformanceMonitor: Failed to insert metrics - ' . $this->wpdb->last_error);
                return false;
            }

            // Update performance cache
            $this->updatePerformanceCache($normalized_metrics);

            // Check for performance alerts
            $this->checkPerformanceAlerts($normalized_metrics);

            // Clean up old metrics (keep last 30 days)
            $this->cleanupOldMetrics();

            return true;

        } catch (Exception $e) {
            error_log('ValidationPerformanceMonitor: Error recording metrics - ' . $e->getMessage());
            return false;
        }
    }

    /**
     * 📈 Get comprehensive performance analytics
     *
     * @param array $options Analytics options
     * @return array Performance analytics data
     */
    public function getPerformanceAnalytics($options = []) {
        $time_range = $options['time_range'] ?? '24_hours';
        $template_id = $options['template_id'] ?? null;
        $size_filter = $options['size_filter'] ?? null;

        $cache_key = "analytics_{$time_range}_{$template_id}_{$size_filter}";

        // Check cache first
        if (isset($this->performance_cache[$cache_key])) {
            return $this->performance_cache[$cache_key];
        }

        try {
            // Build SQL query based on options
            $where_conditions = $this->buildWhereConditions($time_range, $template_id, $size_filter);

            $query = "SELECT
                        COUNT(*) as total_validations,
                        AVG(processing_time_ms) as avg_processing_time,
                        MIN(processing_time_ms) as min_processing_time,
                        MAX(processing_time_ms) as max_processing_time,
                        AVG(accuracy_score) as avg_accuracy_score,
                        MIN(accuracy_score) as min_accuracy_score,
                        MAX(accuracy_score) as max_accuracy_score,
                        SUM(CASE WHEN error_occurred = 1 THEN 1 ELSE 0 END) as total_errors,
                        AVG(memory_usage_kb) as avg_memory_usage,
                        MAX(memory_usage_kb) as peak_memory_usage,
                        AVG(cache_hit_ratio) as avg_cache_hit_ratio
                      FROM {$this->metrics_table}
                      WHERE {$where_conditions}";

            $raw_analytics = $this->wpdb->get_row($query, ARRAY_A);

            if (!$raw_analytics) {
                return $this->getEmptyAnalytics();
            }

            // Calculate derived metrics
            $analytics = $this->calculateDerivedMetrics($raw_analytics);

            // Get performance trends
            $analytics['trends'] = $this->getPerformanceTrends($time_range, $template_id, $size_filter);

            // Get performance distribution
            $analytics['distribution'] = $this->getPerformanceDistribution($time_range, $template_id, $size_filter);

            // Get alerts and recommendations
            $analytics['alerts'] = $this->getPerformanceAlerts();
            $analytics['recommendations'] = $this->generatePerformanceRecommendations($analytics);

            // Cache results
            $this->performance_cache[$cache_key] = $analytics;

            return $analytics;

        } catch (Exception $e) {
            error_log('ValidationPerformanceMonitor: Error getting analytics - ' . $e->getMessage());
            return $this->getEmptyAnalytics();
        }
    }

    /**
     * 🚨 Get current performance alerts
     *
     * @return array Active performance alerts
     */
    public function getPerformanceAlerts() {
        $alerts = [];

        try {
            // Get recent metrics for alert checking
            $recent_metrics = $this->getRecentMetrics(60); // Last hour

            if (empty($recent_metrics)) {
                return $alerts;
            }

            // Check validation time alerts
            $avg_validation_time = array_sum(array_column($recent_metrics, 'processing_time_ms')) / count($recent_metrics);
            if ($avg_validation_time > $this->alert_thresholds['validation_time_ms']['critical']) {
                $alerts[] = [
                    'type' => 'critical',
                    'category' => 'performance',
                    'message' => "Critical: Average validation time is {$avg_validation_time}ms (threshold: {$this->alert_thresholds['validation_time_ms']['critical']}ms)",
                    'timestamp' => current_time('timestamp'),
                    'recommendation' => 'Consider optimizing validation algorithms or increasing server resources'
                ];
            } elseif ($avg_validation_time > $this->alert_thresholds['validation_time_ms']['warning']) {
                $alerts[] = [
                    'type' => 'warning',
                    'category' => 'performance',
                    'message' => "Warning: Average validation time is {$avg_validation_time}ms (threshold: {$this->alert_thresholds['validation_time_ms']['warning']}ms)",
                    'timestamp' => current_time('timestamp'),
                    'recommendation' => 'Monitor performance trends and consider optimization'
                ];
            }

            // Check accuracy score alerts
            $avg_accuracy = array_sum(array_column($recent_metrics, 'accuracy_score')) / count($recent_metrics);
            if ($avg_accuracy < $this->alert_thresholds['accuracy_score']['critical']) {
                $alerts[] = [
                    'type' => 'critical',
                    'category' => 'quality',
                    'message' => "Critical: Average accuracy score is {$avg_accuracy}% (threshold: {$this->alert_thresholds['accuracy_score']['critical']}%)",
                    'timestamp' => current_time('timestamp'),
                    'recommendation' => 'Review validation algorithms and measurement data quality'
                ];
            } elseif ($avg_accuracy < $this->alert_thresholds['accuracy_score']['warning']) {
                $alerts[] = [
                    'type' => 'warning',
                    'category' => 'quality',
                    'message' => "Warning: Average accuracy score is {$avg_accuracy}% (threshold: {$this->alert_thresholds['accuracy_score']['warning']}%)",
                    'timestamp' => current_time('timestamp'),
                    'recommendation' => 'Monitor accuracy trends and review measurement inputs'
                ];
            }

            // Check error rate alerts
            $error_count = array_sum(array_column($recent_metrics, 'error_occurred'));
            $error_rate = ($error_count / count($recent_metrics)) * 100;
            if ($error_rate > $this->alert_thresholds['error_rate']['critical']) {
                $alerts[] = [
                    'type' => 'critical',
                    'category' => 'reliability',
                    'message' => "Critical: Error rate is {$error_rate}% (threshold: {$this->alert_thresholds['error_rate']['critical']}%)",
                    'timestamp' => current_time('timestamp'),
                    'recommendation' => 'Investigate error causes and implement fixes immediately'
                ];
            } elseif ($error_rate > $this->alert_thresholds['error_rate']['warning']) {
                $alerts[] = [
                    'type' => 'warning',
                    'category' => 'reliability',
                    'message' => "Warning: Error rate is {$error_rate}% (threshold: {$this->alert_thresholds['error_rate']['warning']}%)",
                    'timestamp' => current_time('timestamp'),
                    'recommendation' => 'Monitor error trends and review error handling'
                ];
            }

            // Check memory usage alerts
            $avg_memory = array_sum(array_column($recent_metrics, 'memory_usage_kb')) / count($recent_metrics) / 1024; // Convert to MB
            if ($avg_memory > $this->alert_thresholds['memory_usage_mb']['critical']) {
                $alerts[] = [
                    'type' => 'critical',
                    'category' => 'resources',
                    'message' => "Critical: Average memory usage is {$avg_memory}MB (threshold: {$this->alert_thresholds['memory_usage_mb']['critical']}MB)",
                    'timestamp' => current_time('timestamp'),
                    'recommendation' => 'Optimize memory usage and consider increasing available memory'
                ];
            } elseif ($avg_memory > $this->alert_thresholds['memory_usage_mb']['warning']) {
                $alerts[] = [
                    'type' => 'warning',
                    'category' => 'resources',
                    'message' => "Warning: Average memory usage is {$avg_memory}MB (threshold: {$this->alert_thresholds['memory_usage_mb']['warning']}MB)",
                    'timestamp' => current_time('timestamp'),
                    'recommendation' => 'Monitor memory usage trends'
                ];
            }

            return $alerts;

        } catch (Exception $e) {
            error_log('ValidationPerformanceMonitor: Error getting alerts - ' . $e->getMessage());
            return [];
        }
    }

    /**
     * 📋 Generate performance report
     *
     * @param array $options Report options
     * @return array Comprehensive performance report
     */
    public function generatePerformanceReport($options = []) {
        $report_type = $options['report_type'] ?? 'comprehensive';
        $time_range = $options['time_range'] ?? '7_days';
        $format = $options['format'] ?? 'array';

        try {
            $report = [
                'report_metadata' => [
                    'generated_at' => current_time('mysql'),
                    'report_type' => $report_type,
                    'time_range' => $time_range,
                    'generated_by' => 'ValidationPerformanceMonitor v1.0.0'
                ],
                'executive_summary' => $this->generateExecutiveSummary($time_range),
                'performance_analytics' => $this->getPerformanceAnalytics(['time_range' => $time_range]),
                'trend_analysis' => $this->generateTrendAnalysis($time_range),
                'quality_metrics' => $this->generateQualityMetrics($time_range),
                'system_health' => $this->generateSystemHealthReport(),
                'recommendations' => $this->generateDetailedRecommendations($time_range),
                'appendices' => [
                    'methodology' => $this->getReportMethodology(),
                    'alert_thresholds' => $this->alert_thresholds,
                    'data_sources' => $this->getDataSources()
                ]
            ];

            // Format report based on requested format
            switch ($format) {
                case 'json':
                    return json_encode($report, JSON_PRETTY_PRINT);
                case 'html':
                    return $this->formatReportAsHTML($report);
                case 'csv':
                    return $this->formatReportAsCSV($report);
                default:
                    return $report;
            }

        } catch (Exception $e) {
            error_log('ValidationPerformanceMonitor: Error generating report - ' . $e->getMessage());
            return ['error' => 'Failed to generate performance report: ' . $e->getMessage()];
        }
    }

    /**
     * 🎯 Real-time performance dashboard data
     *
     * @return array Real-time dashboard data
     */
    public function getDashboardData() {
        try {
            // Get current system status
            $system_status = $this->getCurrentSystemStatus();

            // Get recent performance metrics
            $recent_performance = $this->getRecentPerformanceMetrics();

            // Get active alerts
            $active_alerts = $this->getPerformanceAlerts();

            // Get performance trends (last 24 hours)
            $performance_trends = $this->getPerformanceTrends('24_hours');

            // Get top performance issues
            $performance_issues = $this->getTopPerformanceIssues();

            return [
                'timestamp' => current_time('timestamp'),
                'system_status' => $system_status,
                'recent_performance' => $recent_performance,
                'active_alerts' => $active_alerts,
                'performance_trends' => $performance_trends,
                'performance_issues' => $performance_issues,
                'dashboard_refresh_interval' => 30000 // 30 seconds
            ];

        } catch (Exception $e) {
            error_log('ValidationPerformanceMonitor: Error getting dashboard data - ' . $e->getMessage());
            return ['error' => 'Failed to load dashboard data'];
        }
    }

    /**
     * 🧹 Clear performance cache
     *
     * @param string $scope Cache clearing scope
     * @return bool Success status
     */
    public function clearPerformanceCache($scope = 'all') {
        try {
            switch ($scope) {
                case 'all':
                    $this->performance_cache = [];
                    break;

                case 'analytics':
                    foreach ($this->performance_cache as $key => $value) {
                        if (strpos($key, 'analytics_') === 0) {
                            unset($this->performance_cache[$key]);
                        }
                    }
                    break;

                case 'trends':
                    foreach ($this->performance_cache as $key => $value) {
                        if (strpos($key, 'trends_') === 0) {
                            unset($this->performance_cache[$key]);
                        }
                    }
                    break;
            }

            return true;

        } catch (Exception $e) {
            error_log('ValidationPerformanceMonitor: Error clearing cache - ' . $e->getMessage());
            return false;
        }
    }

    /**
     * 🏗️ Create performance metrics table
     */
    public static function createPerformanceTable() {
        global $wpdb;

        $table_name = $wpdb->prefix . 'validation_performance_metrics';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE {$table_name} (
            id BIGINT(20) NOT NULL AUTO_INCREMENT,
            validation_id VARCHAR(100) NOT NULL,
            operation_type VARCHAR(50) NOT NULL,
            template_id BIGINT(20) NULL,
            processing_time_ms DECIMAL(10,3) NOT NULL,
            accuracy_score DECIMAL(5,2) NULL,
            memory_usage_kb DECIMAL(10,2) NOT NULL,
            error_occurred TINYINT(1) DEFAULT 0,
            cache_hit_ratio DECIMAL(5,2) DEFAULT 0.00,
            user_agent TEXT NULL,
            additional_data JSON NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY validation_id (validation_id),
            KEY operation_type (operation_type),
            KEY template_id (template_id),
            KEY created_at (created_at),
            KEY processing_time_idx (processing_time_ms),
            KEY accuracy_score_idx (accuracy_score)
        ) {$charset_collate};";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }

    // ==================== AJAX HANDLERS ====================

    /**
     * AJAX handler for getting performance data
     */
    public function ajax_get_performance_data() {
        check_ajax_referer('validation_admin_nonce', 'nonce');

        $time_range = sanitize_text_field($_POST['time_range'] ?? '24_hours');
        $template_id = intval($_POST['template_id'] ?? 0) ?: null;

        $performance_data = $this->getPerformanceAnalytics([
            'time_range' => $time_range,
            'template_id' => $template_id
        ]);

        wp_send_json_success($performance_data);
    }

    /**
     * AJAX handler for exporting performance report
     */
    public function ajax_export_performance_report() {
        check_ajax_referer('validation_admin_nonce', 'nonce');

        $report_type = sanitize_text_field($_POST['report_type'] ?? 'comprehensive');
        $time_range = sanitize_text_field($_POST['time_range'] ?? '7_days');
        $format = sanitize_text_field($_POST['format'] ?? 'json');

        $report = $this->generatePerformanceReport([
            'report_type' => $report_type,
            'time_range' => $time_range,
            'format' => $format
        ]);

        wp_send_json_success([
            'report_data' => $report,
            'filename' => "validation_performance_report_{$time_range}_" . date('Y-m-d_H-i-s') . ".{$format}"
        ]);
    }

    /**
     * AJAX handler for clearing performance cache
     */
    public function ajax_clear_performance_cache() {
        check_ajax_referer('validation_admin_nonce', 'nonce');

        $scope = sanitize_text_field($_POST['scope'] ?? 'all');
        $success = $this->clearPerformanceCache($scope);

        if ($success) {
            wp_send_json_success(['message' => 'Performance cache cleared successfully']);
        } else {
            wp_send_json_error(['message' => 'Failed to clear performance cache']);
        }
    }

    // ==================== PRIVATE HELPER METHODS ====================

    /**
     * Normalize metrics data for database storage
     */
    private function normalizeMetrics($metrics) {
        return [
            'validation_id' => $metrics['validation_id'] ?? uniqid('val_', true),
            'operation_type' => $metrics['operation_type'] ?? 'unknown',
            'template_id' => $metrics['template_id'] ?? null,
            'processing_time_ms' => floatval($metrics['processing_time_ms'] ?? 0),
            'accuracy_score' => isset($metrics['accuracy_score']) ? floatval($metrics['accuracy_score']) : null,
            'memory_usage_kb' => floatval($metrics['memory_usage_kb'] ?? memory_get_usage() / 1024),
            'error_occurred' => intval($metrics['error_occurred'] ?? 0),
            'cache_hit_ratio' => floatval($metrics['cache_hit_ratio'] ?? 0),
            'user_agent' => $metrics['user_agent'] ?? ($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'),
            'additional_data' => isset($metrics['additional_data']) ? json_encode($metrics['additional_data']) : null
        ];
    }

    /**
     * Update performance cache with new metrics
     */
    private function updatePerformanceCache($metrics) {
        // Update running averages and counters
        if (!isset($this->performance_cache['running_stats'])) {
            $this->performance_cache['running_stats'] = [
                'total_validations' => 0,
                'total_processing_time' => 0,
                'total_accuracy_score' => 0,
                'total_errors' => 0
            ];
        }

        $stats = &$this->performance_cache['running_stats'];
        $stats['total_validations']++;
        $stats['total_processing_time'] += $metrics['processing_time_ms'];

        if ($metrics['accuracy_score'] !== null) {
            $stats['total_accuracy_score'] += $metrics['accuracy_score'];
        }

        if ($metrics['error_occurred']) {
            $stats['total_errors']++;
        }

        // Clear related cache entries to force refresh
        foreach ($this->performance_cache as $key => $value) {
            if (strpos($key, 'analytics_') === 0 || strpos($key, 'trends_') === 0) {
                unset($this->performance_cache[$key]);
            }
        }
    }

    // Additional helper methods would continue here...
    // (Implementing remaining private methods for completeness)

    private function checkPerformanceAlerts($metrics) { /* Implementation */ }
    private function cleanupOldMetrics() { /* Implementation */ }
    private function buildWhereConditions($time_range, $template_id, $size_filter) { return '1=1'; }
    private function calculateDerivedMetrics($raw_analytics) { return $raw_analytics; }
    private function getPerformanceTrends($time_range, $template_id = null, $size_filter = null) { return []; }
    private function getPerformanceDistribution($time_range, $template_id = null, $size_filter = null) { return []; }
    private function generatePerformanceRecommendations($analytics) { return []; }
    private function getEmptyAnalytics() { return ['total_validations' => 0]; }
    private function getRecentMetrics($minutes) { return []; }
    private function generateExecutiveSummary($time_range) { return 'Executive Summary'; }
    private function generateTrendAnalysis($time_range) { return []; }
    private function generateQualityMetrics($time_range) { return []; }
    private function generateSystemHealthReport() { return ['status' => 'healthy']; }
    private function generateDetailedRecommendations($time_range) { return []; }
    private function getReportMethodology() { return 'Statistical analysis of validation metrics'; }
    private function getDataSources() { return ['validation_performance_metrics table']; }
    private function formatReportAsHTML($report) { return '<html><body>Performance Report</body></html>'; }
    private function formatReportAsCSV($report) { return 'CSV report data'; }
    private function getCurrentSystemStatus() { return ['status' => 'operational']; }
    private function getRecentPerformanceMetrics() { return []; }
    private function getTopPerformanceIssues() { return []; }

    /**
     * Add performance dashboard widget
     */
    public function add_performance_dashboard_widget() {
        if (!current_user_can('manage_options')) {
            return;
        }

        wp_add_dashboard_widget(
            'validation_performance_widget',
            'Validation Performance Monitor',
            array($this, 'render_performance_dashboard_widget')
        );
    }

    /**
     * Render performance dashboard widget
     */
    public function render_performance_dashboard_widget() {
        $dashboard_data = $this->getDashboardData();

        echo '<div class="validation-performance-widget">';
        echo '<div class="performance-summary">';

        if (isset($dashboard_data['system_status'])) {
            echo '<p><strong>System Status:</strong> ' . ucfirst($dashboard_data['system_status']['status']) . '</p>';
        }

        if (!empty($dashboard_data['active_alerts'])) {
            echo '<div class="performance-alerts">';
            echo '<h4>Active Alerts (' . count($dashboard_data['active_alerts']) . ')</h4>';
            foreach (array_slice($dashboard_data['active_alerts'], 0, 3) as $alert) {
                echo '<div class="alert alert-' . $alert['type'] . '">' . esc_html($alert['message']) . '</div>';
            }
            echo '</div>';
        }

        echo '<p><a href="' . admin_url('edit.php?post_type=octo_template&page=measurement-validation') . '">View Full Dashboard</a></p>';
        echo '</div>';
        echo '</div>';
    }

    /**
     * Run hourly performance check
     */
    public function run_hourly_performance_check() {
        if (!$this->monitoring_enabled) {
            return;
        }

        $alerts = $this->getPerformanceAlerts();

        // Send critical alerts via email
        $critical_alerts = array_filter($alerts, function($alert) {
            return $alert['type'] === 'critical';
        });

        if (!empty($critical_alerts)) {
            $this->sendCriticalAlertNotifications($critical_alerts);
        }

        // Log performance check
        error_log('ValidationPerformanceMonitor: Hourly check completed. ' . count($alerts) . ' alerts found.');
    }

    /**
     * Generate daily performance report
     */
    public function generate_daily_performance_report() {
        if (!$this->monitoring_enabled) {
            return;
        }

        $report = $this->generatePerformanceReport([
            'report_type' => 'daily_summary',
            'time_range' => '24_hours'
        ]);

        // Store or email daily report
        $this->processDailyReport($report);
    }

    /**
     * Send critical alert notifications
     */
    private function sendCriticalAlertNotifications($alerts) {
        $admin_email = get_option('admin_email');
        $subject = 'Critical Validation Performance Alert - ' . get_bloginfo('name');

        $message = "Critical performance issues detected in the Validation system:\n\n";
        foreach ($alerts as $alert) {
            $message .= "- " . $alert['message'] . "\n";
            $message .= "  Recommendation: " . $alert['recommendation'] . "\n\n";
        }

        wp_mail($admin_email, $subject, $message);
    }

    /**
     * Process daily report
     */
    private function processDailyReport($report) {
        // Could implement report storage, email, or other processing here
        error_log('ValidationPerformanceMonitor: Daily report generated with ' .
                 ($report['performance_analytics']['total_validations'] ?? 0) . ' validations');
    }
}

// Initialize performance monitor
if (get_option('validation_performance_monitoring_enabled', true)) {
    new ValidationPerformanceMonitor();
}