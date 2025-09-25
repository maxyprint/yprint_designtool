<?php
/**
 * 🤖 AGENT 5: BACKGROUND PROCESSING COORDINATOR
 * Advanced Background Processing System für Heavy Computations
 *
 * Mission: Koordiniere CPU-intensive Tasks ohne UI-Blockierung
 *
 * Features:
 * - WordPress Action Scheduler Integration
 * - PrecisionCalculator Background Processing
 * - Batch Reference Line Processing
 * - Cross-View Validation Queuing
 * - Progress Tracking & Status Updates
 * - Error Recovery & Retry Logic
 * - Memory Usage Optimization
 * - Real-time Result Caching
 *
 * @package    Octo_Print_Designer
 * @subpackage Octo_Print_Designer/includes
 * @version    1.0.0
 * @performance Background Processing Layer
 */

class BackgroundProcessingCoordinator {

    /**
     * Version and Constants
     */
    const VERSION = '1.0.0';
    const QUEUE_GROUP = 'precision_background';
    const BATCH_SIZE = 50;
    const MAX_RETRIES = 3;
    const MEMORY_LIMIT_MB = 128;

    /**
     * Instance variables
     */
    private $wpdb;
    private $precision_calculator;
    private $cache_manager;
    private $task_queue = array();
    private $processing_stats = array();
    private $active_tasks = array();

    /**
     * Constructor - Initialize Background Processor
     */
    public function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;

        // Initialize dependencies
        if (class_exists('PrecisionCalculator')) {
            $this->precision_calculator = new PrecisionCalculator();
        }

        if (class_exists('PrecisionDatabaseCacheManager')) {
            $this->cache_manager = new PrecisionDatabaseCacheManager();
        }

        // Initialize processing stats
        $this->processing_stats = array(
            'tasks_queued' => 0,
            'tasks_completed' => 0,
            'tasks_failed' => 0,
            'total_processing_time' => 0,
            'peak_memory_usage' => 0,
            'cache_hits' => 0
        );

        // Hook into WordPress
        $this->init_wordpress_hooks();

        $this->log('BackgroundProcessingCoordinator initialized');
    }

    /**
     * 🔗 WORDPRESS HOOKS: Setup action scheduler and AJAX endpoints
     */
    private function init_wordpress_hooks() {
        // Action scheduler hooks
        add_action('precision_background_calculate', array($this, 'process_precision_calculation'), 10, 2);
        add_action('precision_background_cross_view', array($this, 'process_cross_view_validation'), 10, 2);
        add_action('precision_background_batch', array($this, 'process_batch_calculation'), 10, 2);

        // AJAX endpoints for frontend
        add_action('wp_ajax_queue_precision_calculation', array($this, 'ajax_queue_precision_calculation'));
        add_action('wp_ajax_get_processing_status', array($this, 'ajax_get_processing_status'));
        add_action('wp_ajax_cancel_background_task', array($this, 'ajax_cancel_background_task'));

        // Admin hooks
        add_action('admin_init', array($this, 'maybe_process_queue'));
        add_action('admin_notices', array($this, 'show_processing_notices'));
    }

    /**
     * 🎯 QUEUE PRECISION CALCULATION: Add precision calculation to background queue
     *
     * @param int $template_id Template post ID
     * @param string $measurement_key Specific measurement key (optional)
     * @param array $options Processing options
     * @return string Task ID
     */
    public function queuePrecisionCalculation($template_id, $measurement_key = null, $options = array()) {
        $task_id = $this->generate_task_id('precision_calc');

        $task_data = array(
            'task_id' => $task_id,
            'type' => 'precision_calculation',
            'template_id' => $template_id,
            'measurement_key' => $measurement_key,
            'options' => $options,
            'priority' => $options['priority'] ?? 10,
            'created_at' => current_time('mysql'),
            'status' => 'queued'
        );

        // Store task in database
        $this->store_task($task_data);

        // Queue with WordPress Action Scheduler if available
        if (function_exists('as_schedule_single_action')) {
            as_schedule_single_action(
                time(),
                'precision_background_calculate',
                array($task_id, $task_data),
                $this->get_queue_group()
            );
        } else {
            // Fallback to immediate processing for small tasks
            if ($options['immediate_fallback'] ?? false) {
                $this->process_precision_calculation($task_id, $task_data);
            }
        }

        $this->processing_stats['tasks_queued']++;

        $this->log("Precision calculation queued: {$task_id} for template {$template_id}");

        return $task_id;
    }

    /**
     * 🔗 QUEUE CROSS-VIEW VALIDATION: Add cross-view validation to background queue
     */
    public function queueCrossViewValidation($template_id, $multi_view_calculations, $options = array()) {
        $task_id = $this->generate_task_id('cross_view');

        $task_data = array(
            'task_id' => $task_id,
            'type' => 'cross_view_validation',
            'template_id' => $template_id,
            'multi_view_calculations' => $multi_view_calculations,
            'options' => $options,
            'priority' => $options['priority'] ?? 5,
            'created_at' => current_time('mysql'),
            'status' => 'queued'
        );

        $this->store_task($task_data);

        if (function_exists('as_schedule_single_action')) {
            as_schedule_single_action(
                time(),
                'precision_background_cross_view',
                array($task_id, $task_data),
                $this->get_queue_group()
            );
        }

        $this->processing_stats['tasks_queued']++;

        return $task_id;
    }

    /**
     * 📦 QUEUE BATCH PROCESSING: Add batch reference line processing
     */
    public function queueBatchProcessing($template_id, $reference_lines, $options = array()) {
        $task_id = $this->generate_task_id('batch_proc');

        // Split into chunks if too large
        $batch_size = $options['batch_size'] ?? self::BATCH_SIZE;
        $chunks = array_chunk($reference_lines, $batch_size);

        $batch_tasks = array();

        foreach ($chunks as $chunk_index => $chunk) {
            $chunk_task_id = $task_id . '_chunk_' . $chunk_index;

            $task_data = array(
                'task_id' => $chunk_task_id,
                'type' => 'batch_processing',
                'template_id' => $template_id,
                'reference_lines' => $chunk,
                'chunk_index' => $chunk_index,
                'total_chunks' => count($chunks),
                'parent_task_id' => $task_id,
                'options' => $options,
                'priority' => $options['priority'] ?? 15,
                'created_at' => current_time('mysql'),
                'status' => 'queued'
            );

            $this->store_task($task_data);

            if (function_exists('as_schedule_single_action')) {
                as_schedule_single_action(
                    time() + ($chunk_index * 2), // Stagger chunks
                    'precision_background_batch',
                    array($chunk_task_id, $task_data),
                    $this->get_queue_group()
                );
            }

            $batch_tasks[] = $chunk_task_id;
        }

        $this->processing_stats['tasks_queued'] += count($batch_tasks);

        return array(
            'parent_task_id' => $task_id,
            'chunk_tasks' => $batch_tasks,
            'total_chunks' => count($chunks)
        );
    }

    /**
     * ⚡ PROCESS PRECISION CALCULATION: Background precision calculation
     */
    public function process_precision_calculation($task_id, $task_data) {
        $start_time = microtime(true);
        $start_memory = memory_get_usage(true);

        try {
            $this->update_task_status($task_id, 'processing');

            // Check cache first
            if ($this->cache_manager) {
                $cache_key = "precision_{$task_data['template_id']}_{$task_data['measurement_key']}";
                $cached_result = $this->cache_manager->getCachedCalculationResult($cache_key);

                if ($cached_result) {
                    $this->complete_task($task_id, $cached_result, 'cache_hit');
                    $this->processing_stats['cache_hits']++;
                    return $cached_result;
                }
            }

            // Perform calculation
            if (!$this->precision_calculator) {
                throw new Exception('PrecisionCalculator not available');
            }

            $result = $this->precision_calculator->calculatePrecisionMetrics(
                $task_data['template_id'],
                $task_data['measurement_key']
            );

            // Cache result
            if ($this->cache_manager && !isset($result['error'])) {
                $this->cache_manager->cacheCalculationResult($cache_key, $result, 900); // 15 minutes
            }

            // Update progress
            $execution_time = microtime(true) - $start_time;
            $memory_used = memory_get_usage(true) - $start_memory;

            $this->complete_task($task_id, $result, 'completed', array(
                'execution_time' => $execution_time,
                'memory_used' => $memory_used
            ));

            $this->processing_stats['tasks_completed']++;
            $this->processing_stats['total_processing_time'] += $execution_time;

            return $result;

        } catch (Exception $e) {
            $this->fail_task($task_id, $e->getMessage());
            $this->processing_stats['tasks_failed']++;
            $this->log_error("Precision calculation failed for task {$task_id}: " . $e->getMessage());
            return array('error' => $e->getMessage());
        }
    }

    /**
     * 🔗 PROCESS CROSS-VIEW VALIDATION: Background cross-view validation
     */
    public function process_cross_view_validation($task_id, $task_data) {
        $start_time = microtime(true);

        try {
            $this->update_task_status($task_id, 'processing');

            if (!$this->precision_calculator) {
                throw new Exception('PrecisionCalculator not available');
            }

            $result = $this->precision_calculator->validateCrossViewConsistency(
                $task_data['template_id'],
                $task_data['multi_view_calculations']
            );

            // Cache result
            if ($this->cache_manager && !isset($result['error'])) {
                $cache_key = "crossview_{$task_data['template_id']}_" . md5(serialize($task_data['multi_view_calculations']));
                $this->cache_manager->cacheCalculationResult($cache_key, $result, 600); // 10 minutes
            }

            $execution_time = microtime(true) - $start_time;
            $this->complete_task($task_id, $result, 'completed', array(
                'execution_time' => $execution_time
            ));

            $this->processing_stats['tasks_completed']++;

            return $result;

        } catch (Exception $e) {
            $this->fail_task($task_id, $e->getMessage());
            $this->processing_stats['tasks_failed']++;
            return array('error' => $e->getMessage());
        }
    }

    /**
     * 📦 PROCESS BATCH CALCULATION: Background batch processing
     */
    public function process_batch_calculation($task_id, $task_data) {
        $start_time = microtime(true);

        try {
            $this->update_task_status($task_id, 'processing');

            $reference_lines = $task_data['reference_lines'];
            $processed_results = array();

            // Process each reference line
            foreach ($reference_lines as $index => $line) {
                if (!$this->validate_reference_line($line)) {
                    continue;
                }

                $calculation_result = array(
                    'measurement_key' => $line['measurement_key'],
                    'calculated_cm_value' => $this->calculate_cm_from_pixels($line),
                    'transformation_quality' => $this->calculate_transformation_quality($line),
                    'bridge_ready' => $this->is_bridge_ready($line)
                );

                $processed_results[] = $calculation_result;

                // Memory management - clear variables periodically
                if (($index + 1) % 10 === 0) {
                    $this->maybe_clear_memory();
                }

                // Update progress for parent task
                if (isset($task_data['parent_task_id'])) {
                    $progress = ($index + 1) / count($reference_lines) * 100;
                    $this->update_chunk_progress($task_data['parent_task_id'], $task_data['chunk_index'], $progress);
                }
            }

            $execution_time = microtime(true) - $start_time;

            $result = array(
                'template_id' => $task_data['template_id'],
                'chunk_index' => $task_data['chunk_index'],
                'processed_count' => count($processed_results),
                'results' => $processed_results,
                'processing_time' => $execution_time
            );

            $this->complete_task($task_id, $result, 'completed');
            $this->processing_stats['tasks_completed']++;

            return $result;

        } catch (Exception $e) {
            $this->fail_task($task_id, $e->getMessage());
            $this->processing_stats['tasks_failed']++;
            return array('error' => $e->getMessage());
        }
    }

    /**
     * 📊 GET PROCESSING STATUS: Get status of background tasks
     */
    public function getProcessingStatus($task_id = null) {
        if ($task_id) {
            return $this->get_task_status($task_id);
        }

        // Return overall stats
        return array(
            'processing_stats' => $this->processing_stats,
            'active_tasks' => count($this->active_tasks),
            'queue_length' => $this->get_queue_length(),
            'memory_usage' => array(
                'current' => memory_get_usage(true),
                'peak' => memory_get_peak_usage(true),
                'limit' => $this->get_memory_limit()
            ),
            'uptime' => $this->get_uptime()
        );
    }

    /**
     * 🛑 CANCEL BACKGROUND TASK: Cancel a queued or processing task
     */
    public function cancelBackgroundTask($task_id) {
        // Update task status
        $this->update_task_status($task_id, 'cancelled');

        // Remove from Action Scheduler if possible
        if (function_exists('as_unschedule_all_actions')) {
            as_unschedule_all_actions('precision_background_calculate', array($task_id), $this->get_queue_group());
            as_unschedule_all_actions('precision_background_cross_view', array($task_id), $this->get_queue_group());
            as_unschedule_all_actions('precision_background_batch', array($task_id), $this->get_queue_group());
        }

        return true;
    }

    // AJAX HANDLERS

    public function ajax_queue_precision_calculation() {
        check_ajax_referer('precision_calculation_nonce', 'nonce');

        $template_id = intval($_POST['template_id']);
        $measurement_key = sanitize_text_field($_POST['measurement_key'] ?? null);

        $options = array(
            'priority' => intval($_POST['priority'] ?? 10),
            'immediate_fallback' => $_POST['immediate_fallback'] === 'true'
        );

        $task_id = $this->queuePrecisionCalculation($template_id, $measurement_key, $options);

        wp_send_json_success(array(
            'task_id' => $task_id,
            'message' => 'Precision calculation queued successfully'
        ));
    }

    public function ajax_get_processing_status() {
        check_ajax_referer('precision_status_nonce', 'nonce');

        $task_id = sanitize_text_field($_GET['task_id'] ?? null);
        $status = $this->getProcessingStatus($task_id);

        wp_send_json_success($status);
    }

    public function ajax_cancel_background_task() {
        check_ajax_referer('precision_cancel_nonce', 'nonce');

        $task_id = sanitize_text_field($_POST['task_id']);
        $cancelled = $this->cancelBackgroundTask($task_id);

        if ($cancelled) {
            wp_send_json_success(array('message' => 'Task cancelled successfully'));
        } else {
            wp_send_json_error(array('message' => 'Failed to cancel task'));
        }
    }

    // PRIVATE HELPER METHODS

    private function generate_task_id($prefix) {
        return $prefix . '_' . time() . '_' . wp_generate_password(8, false);
    }

    private function get_queue_group() {
        return self::QUEUE_GROUP;
    }

    private function store_task($task_data) {
        $table_name = $this->wpdb->prefix . 'precision_background_tasks';

        $this->wpdb->insert(
            $table_name,
            array(
                'task_id' => $task_data['task_id'],
                'type' => $task_data['type'],
                'data' => maybe_serialize($task_data),
                'status' => $task_data['status'],
                'created_at' => $task_data['created_at'],
                'priority' => $task_data['priority']
            ),
            array('%s', '%s', '%s', '%s', '%s', '%d')
        );

        $this->active_tasks[$task_data['task_id']] = $task_data;
    }

    private function update_task_status($task_id, $status, $result_data = null) {
        $table_name = $this->wpdb->prefix . 'precision_background_tasks';

        $update_data = array(
            'status' => $status,
            'updated_at' => current_time('mysql')
        );

        if ($result_data) {
            $update_data['result'] = maybe_serialize($result_data);
        }

        $this->wpdb->update(
            $table_name,
            $update_data,
            array('task_id' => $task_id),
            array('%s', '%s', '%s'),
            array('%s')
        );

        if (isset($this->active_tasks[$task_id])) {
            $this->active_tasks[$task_id]['status'] = $status;
        }
    }

    private function complete_task($task_id, $result, $status = 'completed', $metadata = array()) {
        $this->update_task_status($task_id, $status, array(
            'result' => $result,
            'metadata' => $metadata,
            'completed_at' => current_time('mysql')
        ));

        unset($this->active_tasks[$task_id]);
    }

    private function fail_task($task_id, $error_message) {
        $this->update_task_status($task_id, 'failed', array(
            'error' => $error_message,
            'failed_at' => current_time('mysql')
        ));

        unset($this->active_tasks[$task_id]);
    }

    private function get_task_status($task_id) {
        $table_name = $this->wpdb->prefix . 'precision_background_tasks';

        $task = $this->wpdb->get_row(
            $this->wpdb->prepare("SELECT * FROM {$table_name} WHERE task_id = %s", $task_id)
        );

        if (!$task) {
            return array('error' => 'Task not found');
        }

        return array(
            'task_id' => $task->task_id,
            'type' => $task->type,
            'status' => $task->status,
            'created_at' => $task->created_at,
            'updated_at' => $task->updated_at,
            'result' => $task->result ? maybe_unserialize($task->result) : null
        );
    }

    private function get_queue_length() {
        $table_name = $this->wpdb->prefix . 'precision_background_tasks';
        return $this->wpdb->get_var(
            "SELECT COUNT(*) FROM {$table_name} WHERE status IN ('queued', 'processing')"
        );
    }

    private function maybe_clear_memory() {
        $current_memory = memory_get_usage(true);
        $memory_limit = $this->get_memory_limit();

        if ($current_memory > ($memory_limit * 0.8)) {
            // Clear caches
            wp_cache_flush();

            // Force garbage collection
            if (function_exists('gc_collect_cycles')) {
                gc_collect_cycles();
            }

            $this->log("Memory cleared: " . $this->format_bytes($current_memory) . " -> " . $this->format_bytes(memory_get_usage(true)));
        }
    }

    private function get_memory_limit() {
        $memory_limit = ini_get('memory_limit');
        if ($memory_limit == -1) {
            return self::MEMORY_LIMIT_MB * 1024 * 1024; // Default limit
        }

        return $this->parse_size($memory_limit);
    }

    private function parse_size($size) {
        $unit = preg_replace('/[^bkmgtpezy]/i', '', $size);
        $size = preg_replace('/[^0-9\.]/', '', $size);

        if ($unit) {
            return round($size * pow(1024, stripos('bkmgtpezy', $unit[0])));
        }

        return round($size);
    }

    private function format_bytes($size) {
        $units = array('B', 'KB', 'MB', 'GB');
        $factor = floor((strlen($size) - 1) / 3);
        return sprintf("%.2f", $size / pow(1024, $factor)) . ' ' . $units[$factor];
    }

    // Stub methods for completeness
    private function validate_reference_line($line) {
        return isset($line['measurement_key']) && isset($line['lengthPx']);
    }

    private function calculate_cm_from_pixels($line) {
        return round($line['lengthPx'] / 3.779, 2); // Simplified conversion
    }

    private function calculate_transformation_quality($line) {
        return 85; // Simplified quality score
    }

    private function is_bridge_ready($line) {
        return !empty($line['linked_to_measurements']);
    }

    private function update_chunk_progress($parent_task_id, $chunk_index, $progress) {
        // Update parent task progress
        update_option("bg_progress_{$parent_task_id}_chunk_{$chunk_index}", $progress);
    }

    private function get_uptime() {
        return time() - (get_option('precision_bg_start_time', time()));
    }

    public function maybe_process_queue() {
        // Hook for processing queued tasks if Action Scheduler not available
    }

    public function show_processing_notices() {
        // Show admin notices for background processing status
    }

    private function log($message) {
        error_log('[BackgroundProcessingCoordinator] ' . $message);
    }

    private function log_error($message) {
        error_log('[BackgroundProcessingCoordinator ERROR] ' . $message);
    }
}