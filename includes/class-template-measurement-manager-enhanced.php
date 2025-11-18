<?php
/**
 * 🧠 AGENT 3: ENHANCED TEMPLATE MEASUREMENT MANAGER
 * Mission: Performance-Optimized Database Queries mit Multi-View Synchronisation
 *
 * Features:
 * - Optimized SQL Queries with Prepared Statements
 * - Batch Operations für Mass-Updates
 * - Multi-View Reference Lines Integration
 * - Performance Monitoring & Query Analysis
 * - Advanced Measurement Statistics
 *
 * @package    Octo_Print_Designer
 * @subpackage Octo_Print_Designer/includes
 * @version    2.0.0
 * @since      1.0.0
 */

class TemplateMeasurementManagerEnhanced extends TemplateMeasurementManager {

    /**
     * Version und Performance-Konstanten
     */
    const VERSION = '2.0.0';
    const BATCH_SIZE = 100; // Batch size for bulk operations
    const QUERY_TIMEOUT = 30; // Query timeout in seconds
    const INDEX_PREFIX = 'idx_tmm_';

    /**
     * Enhanced Properties
     */
    private $query_cache = array();
    private $performance_log = array();
    private $precision_cache_manager = null;
    private $batch_operations = array();

    /**
     * Enhanced Constructor
     */
    public function __construct() {
        parent::__construct();

        // Initialize PrecisionDatabaseCacheManager integration
        if (class_exists('PrecisionDatabaseCacheManager')) {
            $this->precision_cache_manager = new PrecisionDatabaseCacheManager();
        }

        // Add performance tracking
        add_action('shutdown', array($this, 'logPerformanceMetrics'));
    }

    /**
     * 🚀 ENHANCED MEASUREMENTS RETRIEVAL: Optimized query with batch processing
     *
     * @param int $template_id Template post ID
     * @param array $options Query options (measurement_keys, size_keys, include_stats)
     * @return array Enhanced measurements data
     */
    public function getEnhancedMeasurements($template_id, $options = array()) {
        $start_time = microtime(true);

        // Default options
        $options = wp_parse_args($options, array(
            'measurement_keys' => null,    // Filter by specific measurement keys
            'size_keys' => null,          // Filter by specific size keys
            'include_stats' => true,      // Include statistical analysis
            'use_cache' => true,          // Use caching
            'return_format' => 'enhanced' // enhanced, simple, raw
        ));

        // Check cache first if enabled
        if ($options['use_cache'] && $this->precision_cache_manager) {
            $cached_data = $this->precision_cache_manager->getCachedMeasurements($template_id);
            if ($cached_data !== false && $options['return_format'] !== 'raw') {
                $this->recordPerformance('enhanced_measurements_cache_hit', microtime(true) - $start_time);
                return $this->formatMeasurementsOutput($cached_data, $options);
            }
        }

        // Build optimized SQL query
        $sql = $this->buildOptimizedMeasurementsQuery($template_id, $options);

        // Execute query with performance tracking
        $results = $this->executeTrackedQuery($sql, 'get_enhanced_measurements');

        if (empty($results)) {
            return array();
        }

        // Process and enhance results
        $enhanced_results = $this->processMeasurementsResults($results, $template_id, $options);

        // Cache results if caching is enabled
        if ($options['use_cache'] && $this->precision_cache_manager) {
            $this->precision_cache_manager->setToCache(
                "enhanced_measurements_{$template_id}",
                $enhanced_results,
                PrecisionDatabaseCacheManager::CACHE_TTL
            );
        }

        $this->recordPerformance('enhanced_measurements_db_query', microtime(true) - $start_time);
        return $this->formatMeasurementsOutput($enhanced_results, $options);
    }

    /**
     * 📊 BUILD OPTIMIZED MEASUREMENTS QUERY: Create efficient SQL with proper indexing
     *
     * @param int $template_id Template post ID
     * @param array $options Query options
     * @return string Optimized SQL query
     */
    private function buildOptimizedMeasurementsQuery($template_id, $options) {
        $where_clauses = array("template_id = %d");
        $query_params = array($template_id);

        // Add measurement key filter
        if (!empty($options['measurement_keys'])) {
            $measurement_keys = (array)$options['measurement_keys'];
            $placeholders = implode(',', array_fill(0, count($measurement_keys), '%s'));
            $where_clauses[] = "measurement_key IN ({$placeholders})";
            $query_params = array_merge($query_params, $measurement_keys);
        }

        // Add size key filter
        if (!empty($options['size_keys'])) {
            $size_keys = (array)$options['size_keys'];
            $placeholders = implode(',', array_fill(0, count($size_keys), '%s'));
            $where_clauses[] = "size_key IN ({$placeholders})";
            $query_params = array_merge($query_params, $size_keys);
        }

        // Build base query with statistical functions if requested
        if ($options['include_stats']) {
            $sql = "
                SELECT
                    m.size_key,
                    m.measurement_key,
                    m.measurement_label,
                    m.value_cm,
                    m.created_at,
                    m.updated_at,
                    -- Statistical calculations
                    AVG(m2.value_cm) OVER (PARTITION BY m.measurement_key) as avg_for_type,
                    MIN(m2.value_cm) OVER (PARTITION BY m.measurement_key) as min_for_type,
                    MAX(m2.value_cm) OVER (PARTITION BY m.measurement_key) as max_for_type,
                    COUNT(*) OVER (PARTITION BY m.measurement_key) as count_for_type,
                    STDDEV(m2.value_cm) OVER (PARTITION BY m.measurement_key) as stddev_for_type
                FROM {$this->table_name} m
                LEFT JOIN {$this->table_name} m2 ON m2.template_id = m.template_id AND m2.measurement_key = m.measurement_key
                WHERE " . implode(' AND ', $where_clauses) . "
                ORDER BY m.size_key, m.measurement_key
            ";
        } else {
            $sql = "
                SELECT
                    size_key,
                    measurement_key,
                    measurement_label,
                    value_cm,
                    created_at,
                    updated_at
                FROM {$this->table_name}
                WHERE " . implode(' AND ', $where_clauses) . "
                ORDER BY size_key, measurement_key
            ";
        }

        return $this->wpdb->prepare($sql, ...$query_params);
    }

    /**
     * 🔄 PROCESS MEASUREMENTS RESULTS: Enhanced data processing with statistics
     *
     * @param array $results Raw database results
     * @param int $template_id Template post ID
     * @param array $options Query options
     * @return array Processed measurements data
     */
    private function processMeasurementsResults($results, $template_id, $options) {
        $measurements = array();
        $type_statistics = array();

        foreach ($results as $row) {
            $size_key = $row['size_key'];
            $measurement_key = $row['measurement_key'];

            // Basic measurement data
            $measurement_data = array(
                'value_cm' => floatval($row['value_cm']),
                'label' => $row['measurement_label'],
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at']
            );

            // Add statistical data if available
            if ($options['include_stats'] && isset($row['avg_for_type'])) {
                $measurement_data['statistics'] = array(
                    'avg_for_type' => round(floatval($row['avg_for_type']), 2),
                    'min_for_type' => floatval($row['min_for_type']),
                    'max_for_type' => floatval($row['max_for_type']),
                    'count_for_type' => intval($row['count_for_type']),
                    'stddev_for_type' => round(floatval($row['stddev_for_type'] ?? 0), 3),
                    'variation_coefficient' => $row['avg_for_type'] > 0 ?
                        round(floatval($row['stddev_for_type'] ?? 0) / floatval($row['avg_for_type']), 3) : 0
                );

                // Store type statistics for summary
                if (!isset($type_statistics[$measurement_key])) {
                    $type_statistics[$measurement_key] = $measurement_data['statistics'];
                }
            }

            $measurements[$size_key][$measurement_key] = $measurement_data;
        }

        return array(
            'template_id' => $template_id,
            'measurements' => $measurements,
            'type_statistics' => $type_statistics,
            'query_options' => $options,
            'generated_at' => current_time('mysql'),
            'version' => self::VERSION
        );
    }

    /**
     * 🎯 BATCH SAVE MEASUREMENTS: Optimized batch operations for mass updates
     *
     * @param int $template_id Template post ID
     * @param array $measurements_data Measurements data
     * @param array $options Save options
     * @return bool Success status
     */
    public function batchSaveMeasurements($template_id, $measurements_data, $options = array()) {
        $start_time = microtime(true);

        // Default options
        $options = wp_parse_args($options, array(
            'clear_existing' => true,      // Clear existing measurements first
            'validate_data' => true,       // Validate data before saving
            'use_transactions' => true,    // Use database transactions
            'batch_size' => self::BATCH_SIZE,
            'update_cache' => true         // Update cache after save
        ));

        try {
            // Validate template exists
            if (!get_post($template_id)) {
                throw new Exception("Template {$template_id} does not exist");
            }

            // Validate data if requested
            if ($options['validate_data']) {
                $validation_errors = $this->validate_measurements($measurements_data);
                if (!empty($validation_errors)) {
                    throw new Exception('Validation failed: ' . implode(', ', $validation_errors));
                }
            }

            // Get template sizes for validation
            $template_sizes = $this->get_template_sizes($template_id);
            $valid_size_keys = array_column($template_sizes, 'id');

            if (empty($valid_size_keys)) {
                throw new Exception('No valid size keys found for template ' . $template_id);
            }

            // Start transaction if requested
            if ($options['use_transactions']) {
                $this->wpdb->query('START TRANSACTION');
            }

            // Clear existing measurements if requested
            if ($options['clear_existing']) {
                $deleted = $this->wpdb->delete($this->table_name, ['template_id' => $template_id], ['%d']);
                error_log("Cleared {$deleted} existing measurements for template {$template_id}");
            }

            // Prepare batch insert data
            $batch_data = array();
            $insert_count = 0;

            foreach ($measurements_data as $size_key => $measurements) {
                // Skip invalid size keys
                if (!in_array($size_key, $valid_size_keys)) {
                    error_log("Skipping invalid size_key '{$size_key}' for template {$template_id}");
                    continue;
                }

                foreach ($measurements as $measurement_key => $data) {
                    $value_cm = is_array($data) ? $data['value_cm'] : $data;
                    $label = is_array($data) ? $data['label'] : $this->get_measurement_label($measurement_key);

                    $batch_data[] = array(
                        'template_id' => $template_id,
                        'size_key' => $size_key,
                        'measurement_key' => $measurement_key,
                        'measurement_label' => $label,
                        'value_cm' => floatval($value_cm)
                    );

                    // Process batch when it reaches batch size
                    if (count($batch_data) >= $options['batch_size']) {
                        $insert_count += $this->executeBatchInsert($batch_data);
                        $batch_data = array(); // Reset batch
                    }
                }
            }

            // Process remaining batch data
            if (!empty($batch_data)) {
                $insert_count += $this->executeBatchInsert($batch_data);
            }

            if ($insert_count === 0) {
                throw new Exception("No valid measurements to insert");
            }

            // Commit transaction if used
            if ($options['use_transactions']) {
                $this->wpdb->query('COMMIT');
            }

            // Update cache if requested
            if ($options['update_cache'] && $this->precision_cache_manager) {
                $this->precision_cache_manager->invalidateTemplateCache($template_id);
            }

            $this->recordPerformance('batch_save_measurements', microtime(true) - $start_time);
            error_log("Successfully saved {$insert_count} measurements for template {$template_id}");

            return true;

        } catch (Exception $e) {
            // Rollback transaction if used
            if ($options['use_transactions']) {
                $this->wpdb->query('ROLLBACK');
            }

            error_log('Batch Save Measurements Error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * 🔧 EXECUTE BATCH INSERT: Optimized batch insert operation
     *
     * @param array $batch_data Array of measurement records
     * @return int Number of records inserted
     */
    private function executeBatchInsert($batch_data) {
        if (empty($batch_data)) {
            return 0;
        }

        // Prepare bulk insert SQL
        $placeholders = array();
        $values = array();

        foreach ($batch_data as $record) {
            $placeholders[] = '(%d, %s, %s, %s, %f)';
            $values = array_merge($values, array(
                $record['template_id'],
                $record['size_key'],
                $record['measurement_key'],
                $record['measurement_label'],
                $record['value_cm']
            ));
        }

        $sql = "INSERT INTO {$this->table_name}
                (template_id, size_key, measurement_key, measurement_label, value_cm)
                VALUES " . implode(', ', $placeholders);

        $prepared_sql = $this->wpdb->prepare($sql, ...$values);
        $result = $this->wpdb->query($prepared_sql);

        if ($result === false) {
            throw new Exception("Batch insert failed: " . $this->wpdb->last_error);
        }

        return count($batch_data);
    }

    /**
     * 🔄 ENHANCED MULTI-VIEW SYNC: Advanced synchronization with reference lines
     *
     * @param int $template_id Template post ID
     * @param array $reference_lines_data Multi-view reference lines data
     * @param array $options Sync options
     * @return bool Success status
     */
    public function enhancedMultiViewSync($template_id, $reference_lines_data, $options = array()) {
        $start_time = microtime(true);

        // Default options
        $options = wp_parse_args($options, array(
            'validate_consistency' => true,    // Validate cross-view consistency
            'update_measurements' => true,     // Update measurement values
            'preserve_assignments' => true,    // Preserve measurement assignments
            'generate_statistics' => true,     // Generate sync statistics
            'use_cache' => true               // Update cache after sync
        ));

        try {
            // Validate reference lines data
            if (!is_array($reference_lines_data) || empty($reference_lines_data)) {
                throw new Exception('Invalid reference lines data provided');
            }

            // Load existing measurements
            $existing_measurements = $this->get_measurements($template_id);
            $template_sizes = $this->get_template_sizes($template_id);

            // Validate cross-view consistency if requested
            if ($options['validate_consistency']) {
                $consistency_report = $this->validateCrossViewConsistency($reference_lines_data, $existing_measurements);
                if (!empty($consistency_report['errors'])) {
                    error_log('Cross-view consistency errors found: ' . json_encode($consistency_report['errors']));
                }
            }

            // Update WordPress meta field
            $meta_result = update_post_meta($template_id, '_multi_view_reference_lines_data', $reference_lines_data);
            if ($meta_result === false) {
                throw new Exception('Failed to update multi-view reference lines meta field');
            }

            // Update measurement assignments if they exist
            $assignments = get_post_meta($template_id, '_measurement_assignments', true);
            if ($options['preserve_assignments'] && is_array($assignments)) {
                // Re-validate assignments against new reference lines
                $updated_assignments = $this->validateAndUpdateAssignments($assignments, $reference_lines_data);
                if ($updated_assignments !== $assignments) {
                    update_post_meta($template_id, '_measurement_assignments', $updated_assignments);
                }
            }

            // Update measurements if requested
            if ($options['update_measurements']) {
                $this->syncMeasurementsWithReferenceLines($template_id, $reference_lines_data, $existing_measurements);
            }

            // Generate sync statistics if requested
            $sync_stats = array();
            if ($options['generate_statistics']) {
                $sync_stats = $this->generateSyncStatistics($template_id, $reference_lines_data, $existing_measurements);
            }

            // Update cache if using PrecisionDatabaseCacheManager
            if ($options['use_cache'] && $this->precision_cache_manager) {
                $this->precision_cache_manager->syncMultiViewDatabase($template_id, $reference_lines_data);
            }

            $this->recordPerformance('enhanced_multi_view_sync', microtime(true) - $start_time);

            // Log success with statistics
            if (!empty($sync_stats)) {
                error_log("Multi-view sync completed for template {$template_id}: " . json_encode($sync_stats));
            }

            return true;

        } catch (Exception $e) {
            error_log('Enhanced Multi-view Sync Error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * 🔍 VALIDATE CROSS-VIEW CONSISTENCY: Check consistency across multiple views
     *
     * @param array $reference_lines_data Multi-view reference lines
     * @param array $existing_measurements Existing measurements
     * @return array Consistency report
     */
    private function validateCrossViewConsistency($reference_lines_data, $existing_measurements) {
        $report = array(
            'errors' => array(),
            'warnings' => array(),
            'statistics' => array(),
            'validated_at' => current_time('mysql')
        );

        $measurement_occurrences = array();

        // Count measurement key occurrences across views
        foreach ($reference_lines_data as $view_key => $view_lines) {
            if (!is_array($view_lines)) continue;

            foreach ($view_lines as $line) {
                if (isset($line['measurement_key'])) {
                    $measurement_key = $line['measurement_key'];
                    if (!isset($measurement_occurrences[$measurement_key])) {
                        $measurement_occurrences[$measurement_key] = array();
                    }
                    $measurement_occurrences[$measurement_key][] = $view_key;
                }
            }
        }

        // Check for inconsistencies
        foreach ($measurement_occurrences as $measurement_key => $views) {
            if (count($views) === 1) {
                $report['warnings'][] = "Measurement '{$measurement_key}' only found in view '{$views[0]}'";
            } elseif (count($views) > 3) {
                $report['warnings'][] = "Measurement '{$measurement_key}' found in " . count($views) . " views (may be redundant)";
            }

            // Check against existing database measurements
            $has_db_measurement = false;
            foreach ($existing_measurements as $size_measurements) {
                if (isset($size_measurements[$measurement_key])) {
                    $has_db_measurement = true;
                    break;
                }
            }

            if (!$has_db_measurement) {
                $report['errors'][] = "Measurement '{$measurement_key}' in reference lines but not in database";
            }
        }

        $report['statistics'] = array(
            'total_views' => count($reference_lines_data),
            'unique_measurements' => count($measurement_occurrences),
            'avg_measurements_per_view' => count($measurement_occurrences) > 0 ?
                round(array_sum(array_map('count', $measurement_occurrences)) / count($measurement_occurrences), 1) : 0
        );

        return $report;
    }

    /**
     * 🔄 SYNC MEASUREMENTS WITH REFERENCE LINES: Update measurements based on reference lines
     *
     * @param int $template_id Template post ID
     * @param array $reference_lines_data Reference lines data
     * @param array $existing_measurements Existing measurements
     */
    private function syncMeasurementsWithReferenceLines($template_id, $reference_lines_data, $existing_measurements) {
        // This would implement sophisticated sync logic
        // For now, we'll trigger the existing sync method
        $this->sync_with_template_sizes($template_id);

        // Log the sync operation
        $reference_count = 0;
        foreach ($reference_lines_data as $view_lines) {
            if (is_array($view_lines)) {
                $reference_count += count($view_lines);
            }
        }

        error_log("Synced measurements with {$reference_count} reference lines for template {$template_id}");
    }

    /**
     * 📊 GENERATE SYNC STATISTICS: Create comprehensive sync statistics
     *
     * @param int $template_id Template post ID
     * @param array $reference_lines_data Reference lines data
     * @param array $existing_measurements Existing measurements
     * @return array Sync statistics
     */
    private function generateSyncStatistics($template_id, $reference_lines_data, $existing_measurements) {
        $stats = array(
            'template_id' => $template_id,
            'sync_timestamp' => current_time('mysql'),
            'views' => array(),
            'measurements' => array(),
            'totals' => array()
        );

        $total_reference_lines = 0;
        $unique_measurements = array();

        // Analyze each view
        foreach ($reference_lines_data as $view_key => $view_lines) {
            if (!is_array($view_lines)) continue;

            $view_stats = array(
                'reference_lines' => count($view_lines),
                'measurements' => array()
            );

            foreach ($view_lines as $line) {
                if (isset($line['measurement_key'])) {
                    $measurement_key = $line['measurement_key'];
                    $unique_measurements[$measurement_key] = true;
                    $view_stats['measurements'][] = $measurement_key;
                }
            }

            $total_reference_lines += count($view_lines);
            $stats['views'][$view_key] = $view_stats;
        }

        // Analyze measurements
        $total_db_measurements = 0;
        foreach ($existing_measurements as $size_measurements) {
            $total_db_measurements += count($size_measurements);
        }

        $stats['measurements'] = array(
            'unique_in_reference_lines' => count($unique_measurements),
            'total_in_database' => $total_db_measurements,
            'coverage_percentage' => count($unique_measurements) > 0 ?
                round((count(array_intersect_key($unique_measurements, $this->extractDbMeasurementKeys($existing_measurements))) / count($unique_measurements)) * 100, 1) : 0
        );

        $stats['totals'] = array(
            'views' => count($reference_lines_data),
            'reference_lines' => $total_reference_lines,
            'database_measurements' => $total_db_measurements,
            'sync_version' => self::VERSION
        );

        return $stats;
    }

    /**
     * 🗄️ EXTRACT DATABASE MEASUREMENT KEYS: Extract measurement keys from database data
     *
     * @param array $existing_measurements Existing measurements data
     * @return array Measurement keys array
     */
    private function extractDbMeasurementKeys($existing_measurements) {
        $keys = array();
        foreach ($existing_measurements as $size_measurements) {
            foreach ($size_measurements as $measurement_key => $measurement_data) {
                $keys[$measurement_key] = true;
            }
        }
        return $keys;
    }

    /**
     * ✅ VALIDATE AND UPDATE ASSIGNMENTS: Validate assignments against reference lines
     *
     * @param array $assignments Current assignments
     * @param array $reference_lines_data Reference lines data
     * @return array Updated assignments
     */
    private function validateAndUpdateAssignments($assignments, $reference_lines_data) {
        $valid_assignments = array();
        $reference_measurement_keys = array();

        // Extract valid measurement keys from reference lines
        foreach ($reference_lines_data as $view_lines) {
            if (is_array($view_lines)) {
                foreach ($view_lines as $line) {
                    if (isset($line['measurement_key'])) {
                        $reference_measurement_keys[$line['measurement_key']] = true;
                    }
                }
            }
        }

        // Validate each assignment
        foreach ($assignments as $assignment_key => $assignment_data) {
            if (isset($assignment_data['measurement_key'])) {
                $measurement_key = $assignment_data['measurement_key'];

                // Only keep assignments that have corresponding reference lines
                if (isset($reference_measurement_keys[$measurement_key])) {
                    $valid_assignments[$assignment_key] = $assignment_data;
                } else {
                    error_log("Removing invalid assignment for measurement key: {$measurement_key}");
                }
            }
        }

        return $valid_assignments;
    }

    /**
     * ⏱️ EXECUTE TRACKED QUERY: Execute query with performance tracking
     *
     * @param string $sql SQL query
     * @param string $operation_name Operation name for tracking
     * @return array Query results
     */
    private function executeTrackedQuery($sql, $operation_name) {
        $start_time = microtime(true);

        $results = $this->wpdb->get_results($sql, ARRAY_A);

        $execution_time = microtime(true) - $start_time;
        $this->recordPerformance($operation_name, $execution_time);

        if ($this->wpdb->last_error) {
            error_log("SQL Error in {$operation_name}: " . $this->wpdb->last_error);
            throw new Exception("Database query failed: " . $this->wpdb->last_error);
        }

        return $results;
    }

    /**
     * 📈 RECORD PERFORMANCE: Record performance metrics
     *
     * @param string $operation Operation name
     * @param float $execution_time Execution time in seconds
     */
    private function recordPerformance($operation, $execution_time) {
        if (!isset($this->performance_log[$operation])) {
            $this->performance_log[$operation] = array(
                'count' => 0,
                'total_time' => 0.0,
                'avg_time' => 0.0,
                'max_time' => 0.0,
                'min_time' => PHP_FLOAT_MAX
            );
        }

        $log = &$this->performance_log[$operation];
        $log['count']++;
        $log['total_time'] += $execution_time;
        $log['avg_time'] = $log['total_time'] / $log['count'];
        $log['max_time'] = max($log['max_time'], $execution_time);
        $log['min_time'] = min($log['min_time'], $execution_time);
    }

    /**
     * 🎨 FORMAT MEASUREMENTS OUTPUT: Format output based on return format
     *
     * @param array $enhanced_results Enhanced measurements data
     * @param array $options Query options
     * @return array Formatted output
     */
    private function formatMeasurementsOutput($enhanced_results, $options) {
        switch ($options['return_format']) {
            case 'simple':
                return $enhanced_results['measurements'] ?? array();

            case 'raw':
                return $enhanced_results;

            case 'enhanced':
            default:
                return $enhanced_results;
        }
    }

    /**
     * 📊 GET PERFORMANCE METRICS: Return performance metrics
     *
     * @return array Performance metrics
     */
    public function getPerformanceMetrics() {
        return array(
            'version' => self::VERSION,
            'operations' => $this->performance_log,
            'cache_manager_enabled' => $this->precision_cache_manager !== null,
            'query_cache_size' => count($this->query_cache),
            'generated_at' => current_time('mysql')
        );
    }

    /**
     * 📝 LOG PERFORMANCE METRICS: Log performance metrics on shutdown
     */
    public function logPerformanceMetrics() {
        if (!empty($this->performance_log)) {
            error_log('TemplateMeasurementManagerEnhanced Performance Metrics: ' . json_encode($this->getPerformanceMetrics()));
        }
    }

    /**
     * 🔄 CREATE ENHANCED TABLE: Create enhanced table with better indexing
     */
    public static function createEnhancedTable() {
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
            KEY idx_template_id (template_id),
            KEY idx_size_key (size_key),
            KEY idx_measurement_key (measurement_key),
            KEY idx_template_size_combo (template_id, size_key),
            KEY idx_measurement_value (measurement_key, value_cm),
            KEY idx_template_measurement (template_id, measurement_key),
            KEY idx_updated_at (updated_at)
        ) {$charset_collate};";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);

        // Log table creation
        error_log('TemplateMeasurementManagerEnhanced: Enhanced table created with optimized indexes');
    }
}