<?php
/**
 * 🧑‍💻 AGENT 3: Template Measurement Manager
 * Agent: PHPDeveloper
 * Mission: CRUD operations with dynamic Template Sizes integration
 *
 * @package Octo_Print_Designer
 * @since 1.0.0
 */

class TemplateMeasurementManager {

    private $table_name;
    private $wpdb;
    private $query_cache;
    private $cache_ttl;
    private $query_performance_log;

    public function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name = $wpdb->prefix . 'template_measurements';
        $this->query_cache = [];
        $this->cache_ttl = 1800; // 30 minutes cache TTL
        $this->query_performance_log = [];
    }

    /**
     * 🎯 DYNAMIC SIZES: Get template sizes from _template_sizes meta field (OPTIMIZED)
     *
     * @param int $template_id Template post ID
     * @return array Array of size objects [{'id': 'L', 'name': 'Large', 'order': 3}]
     */
    public function get_template_sizes($template_id) {
        $cache_key = "template_sizes_{$template_id}";

        // Check cache first
        if (isset($this->query_cache[$cache_key])) {
            $cached_data = $this->query_cache[$cache_key];
            if ((time() - $cached_data['timestamp']) < $this->cache_ttl) {
                return $cached_data['data'];
            }
        }

        $start_time = microtime(true);

        $sizes = get_post_meta($template_id, '_template_sizes', true);

        if (!is_array($sizes)) {
            $sizes = [];
        } else {
            // Optimized sort with error handling
            usort($sizes, function($a, $b) {
                $order_a = isset($a['order']) ? (int)$a['order'] : 0;
                $order_b = isset($b['order']) ? (int)$b['order'] : 0;
                return $order_a - $order_b;
            });
        }

        $query_time = round((microtime(true) - $start_time) * 1000, 2);
        $this->logQueryPerformance('get_template_sizes', $query_time, count($sizes));

        // Cache the result
        $this->query_cache[$cache_key] = [
            'data' => $sizes,
            'timestamp' => time()
        ];

        return $sizes;
    }

    /**
     * 🔍 Get all measurements for a specific template (OPTIMIZED)
     * Returns measurements organized by size_key and measurement_key with caching
     *
     * @param int $template_id Template post ID
     * @return array Multi-dimensional array [size_key][measurement_key] = value_cm
     */
    public function get_measurements($template_id) {
        $cache_key = "measurements_{$template_id}";

        // Check cache first
        if (isset($this->query_cache[$cache_key])) {
            $cached_data = $this->query_cache[$cache_key];
            if ((time() - $cached_data['timestamp']) < $this->cache_ttl) {
                return $cached_data['data'];
            }
        }

        $start_time = microtime(true);

        // Optimized query with specific column ordering for better performance
        $results = $this->wpdb->get_results(
            $this->wpdb->prepare(
                "SELECT size_key, measurement_key, measurement_label, value_cm
                FROM {$this->table_name}
                WHERE template_id = %d
                ORDER BY size_key ASC, measurement_key ASC",
                $template_id
            ),
            ARRAY_A
        );

        $query_time = round((microtime(true) - $start_time) * 1000, 2);
        $this->logQueryPerformance('get_measurements', $query_time, count($results));

        $measurements = [];
        foreach ($results as $row) {
            $measurements[$row['size_key']][$row['measurement_key']] = [
                'value_cm' => (float)$row['value_cm'], // Optimized type casting
                'label' => $row['measurement_label']
            ];
        }

        // Cache the result
        $this->query_cache[$cache_key] = [
            'data' => $measurements,
            'timestamp' => time()
        ];

        return $measurements;
    }

    /**
     * 🎯 Get specific measurement for size/type combination (OPTIMIZED)
     *
     * @param int $template_id Template post ID
     * @param string $size_key Size identifier (from _template_sizes.id)
     * @param string $measurement_key Measurement type (A, B, C, etc.)
     * @return float|null Measurement value in cm, null if not found
     */
    public function get_specific_measurement($template_id, $size_key, $measurement_key) {
        $cache_key = "specific_{$template_id}_{$size_key}_{$measurement_key}";

        // Check cache first
        if (isset($this->query_cache[$cache_key])) {
            $cached_data = $this->query_cache[$cache_key];
            if ((time() - $cached_data['timestamp']) < $this->cache_ttl) {
                return $cached_data['data'];
            }
        }

        $start_time = microtime(true);

        // Optimized query with LIMIT 1 for faster execution
        $result = $this->wpdb->get_var(
            $this->wpdb->prepare(
                "SELECT value_cm FROM {$this->table_name}
                WHERE template_id = %d AND size_key = %s AND measurement_key = %s
                LIMIT 1",
                $template_id, $size_key, $measurement_key
            )
        );

        $query_time = round((microtime(true) - $start_time) * 1000, 2);
        $this->logQueryPerformance('get_specific_measurement', $query_time, $result ? 1 : 0);

        $value = $result ? (float)$result : null;

        // Cache the result
        $this->query_cache[$cache_key] = [
            'data' => $value,
            'timestamp' => time()
        ];

        return $value;
    }

    /**
     * 💾 Save measurements for a template with DYNAMIC size synchronization
     * Automatically syncs with _template_sizes meta field
     *
     * @param int $template_id Template post ID
     * @param array $measurements_data Multi-dimensional array [size_key][measurement_key] = value_cm
     * @return bool Success status
     */
    public function save_measurements($template_id, $measurements_data) {
        // Validate template exists
        if (!get_post($template_id)) {
            return false;
        }

        // Get current template sizes for validation
        $template_sizes = $this->get_template_sizes($template_id);
        $valid_size_keys = array_column($template_sizes, 'id');

        if (empty($valid_size_keys)) {
            error_log('TemplateMeasurementManager: No valid size keys found for template ' . $template_id);
            return false;
        }

        // Start transaction
        $this->wpdb->query('START TRANSACTION');

        try {
            // Delete existing measurements for this template
            $this->wpdb->delete($this->table_name, ['template_id' => $template_id], ['%d']);

            $insert_count = 0;

            // Insert new measurements
            foreach ($measurements_data as $size_key => $measurements) {
                // Skip invalid size keys (not in _template_sizes)
                if (!in_array($size_key, $valid_size_keys)) {
                    error_log("TemplateMeasurementManager: Invalid size_key '{$size_key}' for template {$template_id}");
                    continue;
                }

                foreach ($measurements as $measurement_key => $data) {
                    $value_cm = is_array($data) ? $data['value_cm'] : $data;
                    $label = is_array($data) ? $data['label'] : $this->get_measurement_label($measurement_key);

                    $insert_result = $this->wpdb->insert(
                        $this->table_name,
                        [
                            'template_id' => $template_id,
                            'size_key' => $size_key,
                            'measurement_key' => $measurement_key,
                            'measurement_label' => $label,
                            'value_cm' => floatval($value_cm)
                        ],
                        ['%d', '%s', '%s', '%s', '%f']
                    );

                    if ($insert_result === false) {
                        throw new Exception("Failed to insert measurement: {$size_key}.{$measurement_key}. Error: " . $this->wpdb->last_error);
                    }

                    $insert_count++;
                }
            }

            if ($insert_count === 0) {
                throw new Exception("No valid measurements to insert");
            }

            $this->wpdb->query('COMMIT');
            return true;

        } catch (Exception $e) {
            $this->wpdb->query('ROLLBACK');
            error_log('TemplateMeasurementManager Error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * 🔄 SYNC: Auto-populate measurements when template sizes change
     * Called when _template_sizes meta field is updated
     *
     * @param int $template_id Template post ID
     * @param array $new_sizes New template sizes array
     * @return bool Success status
     */
    public function sync_with_template_sizes($template_id, $new_sizes = null) {
        if ($new_sizes === null) {
            $new_sizes = $this->get_template_sizes($template_id);
        }

        $new_size_keys = array_column($new_sizes, 'id');
        $existing_measurements = $this->get_measurements($template_id);

        // Remove measurements for deleted sizes
        foreach ($existing_measurements as $size_key => $measurements) {
            if (!in_array($size_key, $new_size_keys)) {
                $this->wpdb->delete(
                    $this->table_name,
                    ['template_id' => $template_id, 'size_key' => $size_key],
                    ['%d', '%s']
                );
            }
        }

        // Add default measurements for new sizes
        $default_measurements = $this->get_default_measurements();
        foreach ($new_size_keys as $size_key) {
            if (!isset($existing_measurements[$size_key])) {
                $this->populate_default_measurements($template_id, $size_key, $default_measurements);
            }
        }

        return true;
    }

    /**
     * 📏 Get measurement label for display
     *
     * @param string $measurement_key Measurement key (A, B, C, etc.)
     * @return string Human-readable label
     */
    private function get_measurement_label($measurement_key) {
        $labels = [
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

        return $labels[$measurement_key] ?? $measurement_key;
    }

    /**
     * 🎯 Get default measurements for auto-population
     * Can be customized per template type in the future
     *
     * @return array Default measurement values
     */
    private function get_default_measurements() {
        return [
            'A' => 60.0,  // Chest
            'B' => 56.0,  // Hem Width
            'C' => 68.0,  // Height from Shoulder
            'D' => 26.5,  // Sleeve Length
            'E' => 19.0,  // Sleeve Opening
            'F' => 54.5,  // Shoulder to Shoulder
            'G' => 20.0,  // Neck Opening
            'H' => 24.5,  // Biceps
            'J' => 2.0    // Rib Height
        ];
    }

    /**
     * 🌱 Populate default measurements for a new size
     *
     * @param int $template_id Template post ID
     * @param string $size_key Size identifier
     * @param array $base_measurements Base measurement values
     */
    private function populate_default_measurements($template_id, $size_key, $base_measurements) {
        // Apply size-based scaling (basic implementation)
        $size_multipliers = [
            'XS' => 0.9,
            'S' => 0.95,
            'M' => 1.0,
            'L' => 1.05,
            'XL' => 1.1,
            'XXL' => 1.15,
            '3XL' => 1.2
        ];

        $multiplier = $size_multipliers[$size_key] ?? 1.0;

        foreach ($base_measurements as $measurement_key => $base_value) {
            $scaled_value = round($base_value * $multiplier, 1);

            $this->wpdb->insert(
                $this->table_name,
                [
                    'template_id' => $template_id,
                    'size_key' => $size_key,
                    'measurement_key' => $measurement_key,
                    'measurement_label' => $this->get_measurement_label($measurement_key),
                    'value_cm' => $scaled_value
                ],
                ['%d', '%s', '%s', '%s', '%f']
            );
        }
    }

    /**
     * 🧪 Validate measurement data
     *
     * @param array $measurements_data Measurement data to validate
     * @return array Array of validation errors (empty if valid)
     */
    public function validate_measurements($measurements_data) {
        $errors = [];

        foreach ($measurements_data as $size_key => $measurements) {
            if (!is_string($size_key) || empty($size_key)) {
                $errors[] = "Invalid size_key: {$size_key}";
                continue;
            }

            foreach ($measurements as $measurement_key => $value) {
                $actual_value = is_array($value) ? $value['value_cm'] : $value;

                if (!is_numeric($actual_value) || $actual_value <= 0) {
                    $errors[] = "Invalid measurement value for {$size_key}.{$measurement_key}: {$actual_value}";
                }

                if ($actual_value > 1000) { // Sanity check - no garment should be > 10m
                    $errors[] = "Measurement value too large for {$size_key}.{$measurement_key}: {$actual_value}cm";
                }
            }
        }

        return $errors;
    }

    /**
     * 🛠️ Create table on plugin activation
     */
    public static function create_table() {
        global $wpdb;

        $table_name = $wpdb->prefix . 'template_measurements';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE {$table_name} (
            id BIGINT(20) NOT NULL AUTO_INCREMENT,
            template_id BIGINT(20) NOT NULL,
            size_key VARCHAR(50) NOT NULL,
            measurement_key VARCHAR(50) NOT NULL,
            measurement_label VARCHAR(255) NOT NULL,
            value_cm DECIMAL(10,2) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY template_size_measurement (template_id, size_key, measurement_key),
            KEY template_id (template_id),
            KEY size_key (size_key),
            KEY measurement_key (measurement_key),
            KEY template_size_combo (template_id, size_key)
        ) {$charset_collate};";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }

    /**
     * 📊 Log query performance for monitoring
     *
     * @param string $query_type Type of query executed
     * @param float $execution_time_ms Execution time in milliseconds
     * @param int $result_count Number of results returned
     */
    private function logQueryPerformance($query_type, $execution_time_ms, $result_count) {
        $this->query_performance_log[] = [
            'query_type' => $query_type,
            'execution_time_ms' => $execution_time_ms,
            'result_count' => $result_count,
            'timestamp' => microtime(true),
            'memory_usage_kb' => round(memory_get_usage() / 1024, 2)
        ];

        // Keep only the last 100 performance entries to prevent memory bloat
        if (count($this->query_performance_log) > 100) {
            $this->query_performance_log = array_slice($this->query_performance_log, -100);
        }

        // Log slow queries for debugging
        if ($execution_time_ms > 25) { // Log queries slower than 25ms
            error_log("TemplateMeasurementManager: Slow query detected - {$query_type}: {$execution_time_ms}ms, {$result_count} results");
        }
    }

    /**
     * 📈 Get database performance statistics
     *
     * @return array Performance analytics
     */
    public function getDatabasePerformanceStats() {
        if (empty($this->query_performance_log)) {
            return [
                'total_queries' => 0,
                'average_execution_time_ms' => 0,
                'cache_hit_ratio' => 0,
                'slow_queries_count' => 0
            ];
        }

        $total_queries = count($this->query_performance_log);
        $total_time = array_sum(array_column($this->query_performance_log, 'execution_time_ms'));
        $average_time = round($total_time / $total_queries, 2);
        $slow_queries = array_filter($this->query_performance_log, function($log) {
            return $log['execution_time_ms'] > 25;
        });

        // Calculate cache statistics
        $cache_entries = count($this->query_cache);
        $valid_cache_entries = 0;
        foreach ($this->query_cache as $cached_data) {
            if ((time() - $cached_data['timestamp']) < $this->cache_ttl) {
                $valid_cache_entries++;
            }
        }

        return [
            'total_queries' => $total_queries,
            'average_execution_time_ms' => $average_time,
            'fastest_query_ms' => min(array_column($this->query_performance_log, 'execution_time_ms')),
            'slowest_query_ms' => max(array_column($this->query_performance_log, 'execution_time_ms')),
            'slow_queries_count' => count($slow_queries),
            'cache_entries_total' => $cache_entries,
            'cache_entries_valid' => $valid_cache_entries,
            'cache_efficiency' => $cache_entries > 0 ? round(($valid_cache_entries / $cache_entries) * 100, 2) : 0,
            'memory_usage_current_kb' => round(memory_get_usage() / 1024, 2),
            'cache_ttl_seconds' => $this->cache_ttl
        ];
    }

    /**
     * 🧹 Clear query cache and performance logs
     *
     * @param bool $clear_performance_log Also clear performance logs
     */
    public function clearQueryCache($clear_performance_log = false) {
        $this->query_cache = [];

        if ($clear_performance_log) {
            $this->query_performance_log = [];
        }

        return true;
    }

    /**
     * ⚡ Bulk get measurements for multiple templates (OPTIMIZED)
     *
     * @param array $template_ids Array of template IDs
     * @return array Multi-dimensional array [template_id][size_key][measurement_key] = value_cm
     */
    public function get_bulk_measurements($template_ids) {
        if (empty($template_ids) || !is_array($template_ids)) {
            return [];
        }

        $template_ids = array_map('intval', $template_ids); // Sanitize input
        $placeholders = implode(',', array_fill(0, count($template_ids), '%d'));

        $start_time = microtime(true);

        // Single optimized query instead of multiple queries
        $results = $this->wpdb->get_results(
            $this->wpdb->prepare(
                "SELECT template_id, size_key, measurement_key, measurement_label, value_cm
                FROM {$this->table_name}
                WHERE template_id IN ($placeholders)
                ORDER BY template_id ASC, size_key ASC, measurement_key ASC",
                ...$template_ids
            ),
            ARRAY_A
        );

        $query_time = round((microtime(true) - $start_time) * 1000, 2);
        $this->logQueryPerformance('get_bulk_measurements', $query_time, count($results));

        $measurements = [];
        foreach ($results as $row) {
            $template_id = (int)$row['template_id'];
            $measurements[$template_id][$row['size_key']][$row['measurement_key']] = [
                'value_cm' => (float)$row['value_cm'],
                'label' => $row['measurement_label']
            ];
        }

        return $measurements;
    }

    /**
     * 🔍 Get measurements with performance analysis
     *
     * @param int $template_id Template post ID
     * @param bool $include_performance_data Include performance metrics in response
     * @return array Measurements with optional performance data
     */
    public function get_measurements_with_performance($template_id, $include_performance_data = false) {
        $start_total_time = microtime(true);

        $measurements = $this->get_measurements($template_id);

        if (!$include_performance_data) {
            return $measurements;
        }

        $total_time = round((microtime(true) - $start_total_time) * 1000, 2);

        return [
            'measurements' => $measurements,
            'performance' => [
                'execution_time_ms' => $total_time,
                'measurement_count' => $this->countMeasurements($measurements),
                'cache_status' => isset($this->query_cache["measurements_{$template_id}"]) ? 'hit' : 'miss',
                'memory_usage_kb' => round(memory_get_usage() / 1024, 2)
            ]
        ];
    }

    /**
     * 📏 Count total measurements in result set
     *
     * @param array $measurements Measurements array
     * @return int Total count of measurements
     */
    private function countMeasurements($measurements) {
        $count = 0;
        foreach ($measurements as $size_measurements) {
            $count += count($size_measurements);
        }
        return $count;
    }

    /**
     * 🏗️ Create optimized database indexes for performance
     */
    public static function create_performance_indexes() {
        global $wpdb;

        $table_name = $wpdb->prefix . 'template_measurements';

        // Create composite indexes for common query patterns
        $indexes = [
            "CREATE INDEX IF NOT EXISTS idx_template_size_perf ON {$table_name} (template_id, size_key)",
            "CREATE INDEX IF NOT EXISTS idx_template_measurement_perf ON {$table_name} (template_id, measurement_key)",
            "CREATE INDEX IF NOT EXISTS idx_full_lookup_perf ON {$table_name} (template_id, size_key, measurement_key)"
        ];

        foreach ($indexes as $index_sql) {
            $wpdb->query($index_sql);
        }
    }
}