<?php
/**
 * 🤖 AGENT 5: PERFORMANCE OPTIMIZATION DATABASE SETUP
 * Database Migration für Background Processing Support
 *
 * Mission: Setup Database Tables für Performance Optimization Features
 *
 * Features:
 * - Background Task Queue Table
 * - Performance Metrics Storage
 * - Cache Statistics Tracking
 * - Error Logging for Background Tasks
 *
 * @package    Octo_Print_Designer
 * @subpackage Octo_Print_Designer/includes
 * @version    1.0.0
 * @performance Database Support Layer
 */

class PerformanceOptimizationDatabaseSetup {

    /**
     * Version and Constants
     */
    const VERSION = '1.0.0';
    const DB_VERSION_OPTION = 'precision_performance_db_version';

    /**
     * Instance variables
     */
    private $wpdb;

    /**
     * Constructor
     */
    public function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;
    }

    /**
     * 🚀 SETUP DATABASE TABLES: Create all performance optimization tables
     */
    public function setupDatabaseTables() {
        $current_version = get_option(self::DB_VERSION_OPTION, '0.0.0');

        if (version_compare($current_version, self::VERSION, '<')) {
            $this->createBackgroundTasksTable();
            $this->createPerformanceMetricsTable();
            $this->createCacheStatisticsTable();
            $this->createErrorLogTable();

            // Update version
            update_option(self::DB_VERSION_OPTION, self::VERSION);

            $this->log('Performance optimization database tables created/updated to version ' . self::VERSION);
        }
    }

    /**
     * 📋 CREATE BACKGROUND TASKS TABLE: Queue management for background processing
     */
    private function createBackgroundTasksTable() {
        $table_name = $this->wpdb->prefix . 'precision_background_tasks';

        $charset_collate = $this->wpdb->get_charset_collate();

        $sql = "CREATE TABLE {$table_name} (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            task_id varchar(100) NOT NULL,
            type varchar(50) NOT NULL,
            status varchar(20) DEFAULT 'queued',
            priority int(5) DEFAULT 10,
            data longtext,
            result longtext,
            error_message text,
            attempts int(3) DEFAULT 0,
            max_attempts int(3) DEFAULT 3,
            created_at datetime NOT NULL,
            updated_at datetime,
            started_at datetime,
            completed_at datetime,
            failed_at datetime,
            PRIMARY KEY (id),
            UNIQUE KEY task_id (task_id),
            KEY status_priority (status, priority),
            KEY type_status (type, status),
            KEY created_at (created_at)
        ) {$charset_collate};";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }

    /**
     * 📊 CREATE PERFORMANCE METRICS TABLE: Track system performance over time
     */
    private function createPerformanceMetricsTable() {
        $table_name = $this->wpdb->prefix . 'precision_performance_metrics';

        $charset_collate = $this->wpdb->get_charset_collate();

        $sql = "CREATE TABLE {$table_name} (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            metric_type varchar(50) NOT NULL,
            metric_name varchar(100) NOT NULL,
            metric_value decimal(10,4),
            metric_unit varchar(20) DEFAULT 'ms',
            template_id bigint(20),
            measurement_key varchar(50),
            additional_data longtext,
            recorded_at datetime NOT NULL,
            PRIMARY KEY (id),
            KEY metric_type_name (metric_type, metric_name),
            KEY template_id (template_id),
            KEY recorded_at (recorded_at)
        ) {$charset_collate};";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }

    /**
     * 💾 CREATE CACHE STATISTICS TABLE: Monitor cache performance
     */
    private function createCacheStatisticsTable() {
        $table_name = $this->wpdb->prefix . 'precision_cache_statistics';

        $charset_collate = $this->wpdb->get_charset_collate();

        $sql = "CREATE TABLE {$table_name} (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            cache_key varchar(255) NOT NULL,
            cache_type varchar(50) NOT NULL DEFAULT 'redis',
            operation varchar(20) NOT NULL,
            hit_miss varchar(10) NOT NULL,
            execution_time decimal(8,4),
            data_size int(10),
            ttl int(10),
            recorded_at datetime NOT NULL,
            PRIMARY KEY (id),
            KEY cache_key (cache_key),
            KEY cache_type_operation (cache_type, operation),
            KEY hit_miss (hit_miss),
            KEY recorded_at (recorded_at)
        ) {$charset_collate};";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }

    /**
     * 🚨 CREATE ERROR LOG TABLE: Track background processing errors
     */
    private function createErrorLogTable() {
        $table_name = $this->wpdb->prefix . 'precision_error_log';

        $charset_collate = $this->wpdb->get_charset_collate();

        $sql = "CREATE TABLE {$table_name} (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            error_type varchar(50) NOT NULL,
            error_code varchar(20),
            error_message text NOT NULL,
            stack_trace longtext,
            context_data longtext,
            task_id varchar(100),
            template_id bigint(20),
            user_id bigint(20),
            severity varchar(20) DEFAULT 'error',
            resolved tinyint(1) DEFAULT 0,
            occurred_at datetime NOT NULL,
            resolved_at datetime,
            PRIMARY KEY (id),
            KEY error_type (error_type),
            KEY task_id (task_id),
            KEY template_id (template_id),
            KEY severity (severity),
            KEY resolved (resolved),
            KEY occurred_at (occurred_at)
        ) {$charset_collate};";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }

    /**
     * 📈 RECORD PERFORMANCE METRIC: Store performance measurement
     */
    public function recordPerformanceMetric($type, $name, $value, $unit = 'ms', $template_id = null, $measurement_key = null, $additional_data = null) {
        $table_name = $this->wpdb->prefix . 'precision_performance_metrics';

        return $this->wpdb->insert(
            $table_name,
            array(
                'metric_type' => $type,
                'metric_name' => $name,
                'metric_value' => $value,
                'metric_unit' => $unit,
                'template_id' => $template_id,
                'measurement_key' => $measurement_key,
                'additional_data' => maybe_serialize($additional_data),
                'recorded_at' => current_time('mysql')
            ),
            array('%s', '%s', '%f', '%s', '%d', '%s', '%s', '%s')
        );
    }

    /**
     * 💾 RECORD CACHE STATISTIC: Store cache operation result
     */
    public function recordCacheStatistic($cache_key, $cache_type, $operation, $hit_miss, $execution_time = 0, $data_size = 0, $ttl = 0) {
        $table_name = $this->wpdb->prefix . 'precision_cache_statistics';

        return $this->wpdb->insert(
            $table_name,
            array(
                'cache_key' => $cache_key,
                'cache_type' => $cache_type,
                'operation' => $operation,
                'hit_miss' => $hit_miss,
                'execution_time' => $execution_time,
                'data_size' => $data_size,
                'ttl' => $ttl,
                'recorded_at' => current_time('mysql')
            ),
            array('%s', '%s', '%s', '%s', '%f', '%d', '%d', '%s')
        );
    }

    /**
     * 🚨 RECORD ERROR: Store error information
     */
    public function recordError($error_type, $error_message, $error_code = null, $stack_trace = null, $context_data = null, $task_id = null, $template_id = null, $severity = 'error') {
        $table_name = $this->wpdb->prefix . 'precision_error_log';

        return $this->wpdb->insert(
            $table_name,
            array(
                'error_type' => $error_type,
                'error_code' => $error_code,
                'error_message' => $error_message,
                'stack_trace' => $stack_trace,
                'context_data' => maybe_serialize($context_data),
                'task_id' => $task_id,
                'template_id' => $template_id,
                'user_id' => get_current_user_id(),
                'severity' => $severity,
                'occurred_at' => current_time('mysql')
            ),
            array('%s', '%s', '%s', '%s', '%s', '%s', '%d', '%d', '%s', '%s')
        );
    }

    /**
     * 📊 GET PERFORMANCE ANALYTICS: Retrieve performance data
     */
    public function getPerformanceAnalytics($start_date = null, $end_date = null, $metric_type = null) {
        $table_name = $this->wpdb->prefix . 'precision_performance_metrics';

        $where_conditions = array();
        $where_values = array();

        if ($start_date) {
            $where_conditions[] = 'recorded_at >= %s';
            $where_values[] = $start_date;
        }

        if ($end_date) {
            $where_conditions[] = 'recorded_at <= %s';
            $where_values[] = $end_date;
        }

        if ($metric_type) {
            $where_conditions[] = 'metric_type = %s';
            $where_values[] = $metric_type;
        }

        $where_clause = !empty($where_conditions) ? 'WHERE ' . implode(' AND ', $where_conditions) : '';

        $query = "
            SELECT
                metric_type,
                metric_name,
                COUNT(*) as measurement_count,
                AVG(metric_value) as avg_value,
                MIN(metric_value) as min_value,
                MAX(metric_value) as max_value,
                STDDEV(metric_value) as std_deviation
            FROM {$table_name}
            {$where_clause}
            GROUP BY metric_type, metric_name
            ORDER BY metric_type, avg_value DESC
        ";

        if (!empty($where_values)) {
            $query = $this->wpdb->prepare($query, $where_values);
        }

        return $this->wpdb->get_results($query);
    }

    /**
     * 💾 GET CACHE ANALYTICS: Retrieve cache performance data
     */
    public function getCacheAnalytics($start_date = null, $end_date = null) {
        $table_name = $this->wpdb->prefix . 'precision_cache_statistics';

        $where_conditions = array();
        $where_values = array();

        if ($start_date) {
            $where_conditions[] = 'recorded_at >= %s';
            $where_values[] = $start_date;
        }

        if ($end_date) {
            $where_conditions[] = 'recorded_at <= %s';
            $where_values[] = $end_date;
        }

        $where_clause = !empty($where_conditions) ? 'WHERE ' . implode(' AND ', $where_conditions) : '';

        $query = "
            SELECT
                cache_type,
                operation,
                COUNT(*) as total_operations,
                SUM(CASE WHEN hit_miss = 'hit' THEN 1 ELSE 0 END) as cache_hits,
                SUM(CASE WHEN hit_miss = 'miss' THEN 1 ELSE 0 END) as cache_misses,
                AVG(execution_time) as avg_execution_time,
                AVG(data_size) as avg_data_size
            FROM {$table_name}
            {$where_clause}
            GROUP BY cache_type, operation
            ORDER BY cache_type, total_operations DESC
        ";

        if (!empty($where_values)) {
            $query = $this->wpdb->prepare($query, $where_values);
        }

        $results = $this->wpdb->get_results($query);

        // Calculate hit rates
        foreach ($results as $result) {
            $result->hit_rate = $result->total_operations > 0 ?
                round(($result->cache_hits / $result->total_operations) * 100, 2) : 0;
        }

        return $results;
    }

    /**
     * 🚨 GET ERROR SUMMARY: Retrieve error statistics
     */
    public function getErrorSummary($start_date = null, $end_date = null) {
        $table_name = $this->wpdb->prefix . 'precision_error_log';

        $where_conditions = array();
        $where_values = array();

        if ($start_date) {
            $where_conditions[] = 'occurred_at >= %s';
            $where_values[] = $start_date;
        }

        if ($end_date) {
            $where_conditions[] = 'occurred_at <= %s';
            $where_values[] = $end_date;
        }

        $where_clause = !empty($where_conditions) ? 'WHERE ' . implode(' AND ', $where_conditions) : '';

        $query = "
            SELECT
                error_type,
                severity,
                COUNT(*) as error_count,
                SUM(CASE WHEN resolved = 1 THEN 1 ELSE 0 END) as resolved_count,
                MAX(occurred_at) as last_occurrence
            FROM {$table_name}
            {$where_clause}
            GROUP BY error_type, severity
            ORDER BY error_count DESC
        ";

        if (!empty($where_values)) {
            $query = $this->wpdb->prepare($query, $where_values);
        }

        return $this->wpdb->get_results($query);
    }

    /**
     * 🧹 CLEANUP OLD DATA: Remove old performance data to manage database size
     */
    public function cleanupOldData($days_to_keep = 30) {
        $cutoff_date = date('Y-m-d H:i:s', strtotime("-{$days_to_keep} days"));

        $tables = array(
            $this->wpdb->prefix . 'precision_performance_metrics',
            $this->wpdb->prefix . 'precision_cache_statistics',
            $this->wpdb->prefix . 'precision_error_log'
        );

        $deleted_rows = 0;

        foreach ($tables as $table) {
            $date_column = ($table === $this->wpdb->prefix . 'precision_error_log') ? 'occurred_at' : 'recorded_at';

            $result = $this->wpdb->query(
                $this->wpdb->prepare(
                    "DELETE FROM {$table} WHERE {$date_column} < %s",
                    $cutoff_date
                )
            );

            if ($result !== false) {
                $deleted_rows += $result;
            }
        }

        // Cleanup completed background tasks older than cutoff
        $tasks_table = $this->wpdb->prefix . 'precision_background_tasks';
        $result = $this->wpdb->query(
            $this->wpdb->prepare(
                "DELETE FROM {$tasks_table} WHERE status IN ('completed', 'failed', 'cancelled') AND updated_at < %s",
                $cutoff_date
            )
        );

        if ($result !== false) {
            $deleted_rows += $result;
        }

        $this->log("Cleanup completed: {$deleted_rows} old records removed");

        return $deleted_rows;
    }

    /**
     * 📋 GET DATABASE STATUS: Check database health and usage
     */
    public function getDatabaseStatus() {
        $tables = array(
            'precision_background_tasks' => 'Background Tasks',
            'precision_performance_metrics' => 'Performance Metrics',
            'precision_cache_statistics' => 'Cache Statistics',
            'precision_error_log' => 'Error Log'
        );

        $status = array();

        foreach ($tables as $table_suffix => $table_label) {
            $table_name = $this->wpdb->prefix . $table_suffix;

            // Check if table exists
            $table_exists = $this->wpdb->get_var(
                $this->wpdb->prepare(
                    "SHOW TABLES LIKE %s",
                    $table_name
                )
            ) === $table_name;

            if ($table_exists) {
                // Get row count
                $row_count = $this->wpdb->get_var("SELECT COUNT(*) FROM {$table_name}");

                // Get table size
                $table_status = $this->wpdb->get_row(
                    $this->wpdb->prepare(
                        "SELECT
                            ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'size_mb'
                        FROM information_schema.TABLES
                        WHERE table_schema = %s AND table_name = %s",
                        DB_NAME,
                        $table_name
                    )
                );

                $status[$table_suffix] = array(
                    'label' => $table_label,
                    'exists' => true,
                    'row_count' => (int) $row_count,
                    'size_mb' => $table_status ? (float) $table_status->size_mb : 0
                );
            } else {
                $status[$table_suffix] = array(
                    'label' => $table_label,
                    'exists' => false,
                    'row_count' => 0,
                    'size_mb' => 0
                );
            }
        }

        return $status;
    }

    /**
     * 🔧 OPTIMIZE TABLES: Run database optimization
     */
    public function optimizeTables() {
        $tables = array(
            $this->wpdb->prefix . 'precision_background_tasks',
            $this->wpdb->prefix . 'precision_performance_metrics',
            $this->wpdb->prefix . 'precision_cache_statistics',
            $this->wpdb->prefix . 'precision_error_log'
        );

        $optimized = 0;

        foreach ($tables as $table) {
            $result = $this->wpdb->query("OPTIMIZE TABLE {$table}");
            if ($result !== false) {
                $optimized++;
            }
        }

        $this->log("Database optimization completed: {$optimized} tables optimized");

        return $optimized;
    }

    /**
     * Logging method
     */
    private function log($message) {
        error_log('[PerformanceOptimizationDatabaseSetup] ' . $message);
    }
}

// Auto-setup during plugin activation
register_activation_hook(__FILE__, function() {
    $db_setup = new PerformanceOptimizationDatabaseSetup();
    $db_setup->setupDatabaseTables();
});