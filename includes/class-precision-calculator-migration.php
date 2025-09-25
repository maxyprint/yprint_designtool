<?php
/**
 * PrecisionCalculator Migration Script
 *
 * AGENT 2: PRECISIONCALCULATOR CLASS ARCHITECT
 * Migration Support für bestehende Reference Line Daten
 *
 * Features:
 * - Legacy Reference Lines Migration
 * - Measurement Assignments Upgrade
 * - Data Integrity Validation
 * - Rollback Support
 *
 * @package    Octo_Print_Designer
 * @subpackage Octo_Print_Designer/includes
 * @version    2.1.0
 * @since      1.0.0
 */

class PrecisionCalculatorMigration {

    const MIGRATION_VERSION = '2.1.0';
    const BACKUP_PREFIX = '_precision_backup_';

    private $wpdb;
    private $precision_calculator;
    private $migration_log = array();

    /**
     * Constructor
     */
    public function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;

        if (class_exists('PrecisionCalculator')) {
            $this->precision_calculator = new PrecisionCalculator();
        }
    }

    /**
     * MAIN MIGRATION: Migrate all existing data to new PrecisionCalculator format
     *
     * @param array $template_ids Optional array of specific template IDs to migrate
     * @return array Migration results
     */
    public function migrateAllData($template_ids = null) {
        $migration_start = microtime(true);

        $this->log('Migration started', 'info');

        $results = array(
            'migration_version' => self::MIGRATION_VERSION,
            'start_time' => $migration_start,
            'template_results' => array(),
            'summary' => array(
                'total_templates' => 0,
                'successful_migrations' => 0,
                'failed_migrations' => 0,
                'total_reference_lines_migrated' => 0,
                'total_assignments_migrated' => 0
            ),
            'errors' => array(),
            'warnings' => array()
        );

        try {
            // Get templates to migrate
            if ($template_ids === null) {
                $template_ids = $this->findTemplatesWithReferenceLines();
            }

            $results['summary']['total_templates'] = count($template_ids);

            foreach ($template_ids as $template_id) {
                $this->log("Starting migration for template: {$template_id}", 'info');

                $template_result = $this->migrateTemplate($template_id);

                $results['template_results'][$template_id] = $template_result;

                if (isset($template_result['error'])) {
                    $results['summary']['failed_migrations']++;
                    $results['errors'][] = "Template {$template_id}: " . $template_result['error'];
                } else {
                    $results['summary']['successful_migrations']++;
                    $results['summary']['total_reference_lines_migrated'] += $template_result['migrated_reference_lines'];
                    $results['summary']['total_assignments_migrated'] += $template_result['migrated_assignments'];
                }

                if (!empty($template_result['warnings'])) {
                    $results['warnings'] = array_merge($results['warnings'], $template_result['warnings']);
                }
            }

            $results['total_time'] = microtime(true) - $migration_start;
            $results['success_rate'] = $results['summary']['total_templates'] > 0 ?
                ($results['summary']['successful_migrations'] / $results['summary']['total_templates']) * 100 : 0;

            $this->log('Migration completed successfully', 'info');

        } catch (Exception $e) {
            $results['fatal_error'] = $e->getMessage();
            $this->log('Migration failed: ' . $e->getMessage(), 'error');
        }

        $results['migration_log'] = $this->migration_log;

        return $results;
    }

    /**
     * TEMPLATE MIGRATION: Migrate single template
     *
     * @param int $template_id Template post ID
     * @return array Template migration results
     */
    public function migrateTemplate($template_id) {
        $template_start = microtime(true);

        $result = array(
            'template_id' => $template_id,
            'start_time' => $template_start,
            'migrated_reference_lines' => 0,
            'migrated_assignments' => 0,
            'backup_created' => false,
            'warnings' => array(),
            'migration_steps' => array()
        );

        try {
            // Step 1: Create backup of existing data
            $result['migration_steps']['backup'] = $this->createDataBackup($template_id);
            $result['backup_created'] = $result['migration_steps']['backup']['success'];

            // Step 2: Migrate legacy reference lines
            $result['migration_steps']['reference_lines'] = $this->migrateLegacyReferenceLines($template_id);
            $result['migrated_reference_lines'] = $result['migration_steps']['reference_lines']['migrated_count'];

            // Step 3: Migrate measurement assignments
            $result['migration_steps']['assignments'] = $this->migrateMeasurementAssignments($template_id);
            $result['migrated_assignments'] = $result['migration_steps']['assignments']['migrated_count'];

            // Step 4: Validate migrated data
            $result['migration_steps']['validation'] = $this->validateMigratedTemplate($template_id);

            // Step 5: Update bridge integration data
            $result['migration_steps']['bridge_integration'] = $this->updateBridgeIntegration($template_id);

            // Collect warnings from all steps
            foreach ($result['migration_steps'] as $step) {
                if (isset($step['warnings'])) {
                    $result['warnings'] = array_merge($result['warnings'], $step['warnings']);
                }
            }

            $result['total_time'] = microtime(true) - $template_start;
            $result['status'] = 'success';

            $this->log("Template {$template_id} migrated successfully", 'info');

        } catch (Exception $e) {
            $result['error'] = $e->getMessage();
            $result['status'] = 'failed';

            // Attempt rollback if backup exists
            if ($result['backup_created']) {
                $rollback_result = $this->rollbackTemplate($template_id);
                $result['rollback_attempted'] = true;
                $result['rollback_successful'] = $rollback_result['success'];
            }

            $this->log("Template {$template_id} migration failed: " . $e->getMessage(), 'error');
        }

        return $result;
    }

    /**
     * CREATE DATA BACKUP: Backup existing template data
     *
     * @param int $template_id Template post ID
     * @return array Backup results
     */
    private function createDataBackup($template_id) {
        try {
            $backup_timestamp = current_time('timestamp');

            $backup_data = array(
                'template_id' => $template_id,
                'backup_timestamp' => $backup_timestamp,
                'migration_version' => self::MIGRATION_VERSION,
                'original_data' => array()
            );

            // Backup legacy reference lines
            $legacy_references = get_post_meta($template_id, '_reference_lines_data', true);
            if ($legacy_references) {
                $backup_data['original_data']['legacy_reference_lines'] = $legacy_references;
            }

            // Backup multi-view reference lines
            $multi_view_references = get_post_meta($template_id, '_multi_view_reference_lines_data', true);
            if ($multi_view_references) {
                $backup_data['original_data']['multi_view_reference_lines'] = $multi_view_references;
            }

            // Backup measurement assignments
            $assignments = get_post_meta($template_id, '_measurement_assignments', true);
            if ($assignments) {
                $backup_data['original_data']['measurement_assignments'] = $assignments;
            }

            // Backup template measurements
            $template_measurements = get_post_meta($template_id, '_template_measurements', true);
            if ($template_measurements) {
                $backup_data['original_data']['template_measurements'] = $template_measurements;
            }

            // Store backup
            $backup_key = self::BACKUP_PREFIX . $backup_timestamp;
            $backup_result = update_post_meta($template_id, $backup_key, $backup_data);

            if ($backup_result === false) {
                throw new Exception('Failed to create backup');
            }

            return array(
                'success' => true,
                'backup_key' => $backup_key,
                'backup_timestamp' => $backup_timestamp,
                'backed_up_items' => count($backup_data['original_data'])
            );

        } catch (Exception $e) {
            return array(
                'success' => false,
                'error' => $e->getMessage()
            );
        }
    }

    /**
     * MIGRATE LEGACY REFERENCE LINES: Convert old single-view format to multi-view
     *
     * @param int $template_id Template post ID
     * @return array Migration results
     */
    private function migrateLegacyReferenceLines($template_id) {
        try {
            // Load legacy reference lines
            $legacy_references = get_post_meta($template_id, '_reference_lines_data', true);

            if (!is_array($legacy_references) || empty($legacy_references)) {
                return array(
                    'migrated_count' => 0,
                    'status' => 'no_legacy_data',
                    'message' => 'No legacy reference lines found'
                );
            }

            // Load existing multi-view data
            $multi_view_data = get_post_meta($template_id, '_multi_view_reference_lines_data', true);
            if (!is_array($multi_view_data)) {
                $multi_view_data = array();
            }

            $migrated_count = 0;
            $warnings = array();

            // Convert legacy lines to multi-view format
            foreach ($legacy_references as $legacy_line) {
                if (!$this->validateLegacyReferenceLine($legacy_line)) {
                    $warnings[] = 'Invalid legacy reference line skipped: ' .
                                 json_encode($legacy_line);
                    continue;
                }

                // Convert to new format
                $new_line = $this->convertLegacyToMultiView($legacy_line);

                // Add to default view (assume 'main' view for legacy data)
                if (!isset($multi_view_data['main'])) {
                    $multi_view_data['main'] = array();
                }

                // Check for duplicates
                if (!$this->isDuplicateReferenceLine($new_line, $multi_view_data['main'])) {
                    $multi_view_data['main'][] = $new_line;
                    $migrated_count++;
                } else {
                    $warnings[] = 'Duplicate reference line skipped: ' . $new_line['measurement_key'];
                }
            }

            // Save migrated data
            if ($migrated_count > 0) {
                $save_result = update_post_meta($template_id, '_multi_view_reference_lines_data', $multi_view_data);

                if ($save_result === false) {
                    throw new Exception('Failed to save migrated reference lines');
                }

                // Mark legacy data as migrated (don't delete for rollback purposes)
                update_post_meta($template_id, '_legacy_references_migrated', current_time('mysql'));
            }

            return array(
                'migrated_count' => $migrated_count,
                'total_legacy_lines' => count($legacy_references),
                'warnings' => $warnings,
                'status' => 'success'
            );

        } catch (Exception $e) {
            return array(
                'migrated_count' => 0,
                'error' => $e->getMessage(),
                'status' => 'failed'
            );
        }
    }

    /**
     * MIGRATE MEASUREMENT ASSIGNMENTS: Upgrade to new format
     *
     * @param int $template_id Template post ID
     * @return array Migration results
     */
    private function migrateMeasurementAssignments($template_id) {
        try {
            $assignments = get_post_meta($template_id, '_measurement_assignments', true);

            if (!is_array($assignments) || empty($assignments)) {
                return array(
                    'migrated_count' => 0,
                    'status' => 'no_assignments',
                    'message' => 'No measurement assignments found'
                );
            }

            $migrated_count = 0;
            $warnings = array();

            foreach ($assignments as $key => &$assignment) {
                // Upgrade assignment to new format
                $upgraded = $this->upgradeAssignmentFormat($assignment);

                if ($upgraded['success']) {
                    $assignment = $upgraded['assignment'];
                    $migrated_count++;
                } else {
                    $warnings[] = "Failed to upgrade assignment {$key}: " . $upgraded['error'];
                }
            }

            // Save upgraded assignments
            if ($migrated_count > 0) {
                $save_result = update_post_meta($template_id, '_measurement_assignments', $assignments);

                if ($save_result === false) {
                    throw new Exception('Failed to save migrated assignments');
                }

                // Update migration timestamp
                update_post_meta($template_id, '_assignments_migrated', current_time('mysql'));
            }

            return array(
                'migrated_count' => $migrated_count,
                'total_assignments' => count($assignments),
                'warnings' => $warnings,
                'status' => 'success'
            );

        } catch (Exception $e) {
            return array(
                'migrated_count' => 0,
                'error' => $e->getMessage(),
                'status' => 'failed'
            );
        }
    }

    /**
     * VALIDATE MIGRATED TEMPLATE: Check data integrity after migration
     *
     * @param int $template_id Template post ID
     * @return array Validation results
     */
    private function validateMigratedTemplate($template_id) {
        try {
            $validation_results = array(
                'reference_lines_valid' => false,
                'assignments_valid' => false,
                'bridge_integration_valid' => false,
                'issues' => array(),
                'warnings' => array()
            );

            // Validate reference lines
            $multi_view_data = get_post_meta($template_id, '_multi_view_reference_lines_data', true);
            if (is_array($multi_view_data) && !empty($multi_view_data)) {
                $reference_validation = $this->validateMultiViewReferenceLines($multi_view_data);
                $validation_results['reference_lines_valid'] = $reference_validation['valid'];

                if (!$reference_validation['valid']) {
                    $validation_results['issues'] = array_merge(
                        $validation_results['issues'],
                        $reference_validation['errors']
                    );
                }
            } else {
                $validation_results['warnings'][] = 'No multi-view reference lines found after migration';
            }

            // Validate assignments
            $assignments = get_post_meta($template_id, '_measurement_assignments', true);
            if (is_array($assignments) && !empty($assignments)) {
                $assignment_validation = $this->validateMeasurementAssignments($assignments);
                $validation_results['assignments_valid'] = $assignment_validation['valid'];

                if (!$assignment_validation['valid']) {
                    $validation_results['issues'] = array_merge(
                        $validation_results['issues'],
                        $assignment_validation['errors']
                    );
                }
            } else {
                $validation_results['warnings'][] = 'No measurement assignments found';
            }

            // Validate bridge integration
            if ($this->precision_calculator) {
                $bridge_status = $this->precision_calculator->processBridgeData($template_id, array(
                    'assignments' => $assignments ?: array(),
                    'reference_mappings' => array(),
                    'precision_requirements' => array()
                ));

                $validation_results['bridge_integration_valid'] = !isset($bridge_status['error']);
                $validation_results['integration_score'] = $bridge_status['integration_score'] ?? 0;

                if (isset($bridge_status['error'])) {
                    $validation_results['issues'][] = 'Bridge integration validation failed: ' . $bridge_status['error'];
                }
            }

            $validation_results['overall_valid'] =
                $validation_results['reference_lines_valid'] &&
                $validation_results['assignments_valid'] &&
                $validation_results['bridge_integration_valid'];

            return $validation_results;

        } catch (Exception $e) {
            return array(
                'error' => $e->getMessage(),
                'overall_valid' => false
            );
        }
    }

    /**
     * UPDATE BRIDGE INTEGRATION: Set up enhanced bridge integration
     *
     * @param int $template_id Template post ID
     * @return array Update results
     */
    private function updateBridgeIntegration($template_id) {
        try {
            // Update bridge version metadata
            update_post_meta($template_id, '_bridge_version', self::MIGRATION_VERSION);
            update_post_meta($template_id, '_precision_calculator_enabled', true);
            update_post_meta($template_id, '_migration_completed', current_time('mysql'));

            // Calculate and store integration score
            if ($this->precision_calculator) {
                $precision_metrics = $this->precision_calculator->calculatePrecisionMetrics($template_id);

                if (!isset($precision_metrics['error'])) {
                    update_post_meta($template_id, '_precision_metrics', $precision_metrics);
                    update_post_meta($template_id, '_last_precision_calculation', current_time('mysql'));
                }
            }

            return array(
                'success' => true,
                'bridge_version' => self::MIGRATION_VERSION,
                'precision_enabled' => true
            );

        } catch (Exception $e) {
            return array(
                'success' => false,
                'error' => $e->getMessage()
            );
        }
    }

    /**
     * ROLLBACK TEMPLATE: Restore template from backup
     *
     * @param int $template_id Template post ID
     * @return array Rollback results
     */
    public function rollbackTemplate($template_id) {
        try {
            // Find latest backup
            $backup_key = $this->findLatestBackup($template_id);

            if (!$backup_key) {
                throw new Exception('No backup found for template');
            }

            $backup_data = get_post_meta($template_id, $backup_key, true);

            if (!is_array($backup_data) || !isset($backup_data['original_data'])) {
                throw new Exception('Invalid backup data structure');
            }

            // Restore original data
            $restored_count = 0;
            foreach ($backup_data['original_data'] as $meta_key => $meta_value) {
                $restore_key = '_' . str_replace('_', '', $meta_key);

                if (update_post_meta($template_id, $restore_key, $meta_value) !== false) {
                    $restored_count++;
                }
            }

            // Remove migration markers
            delete_post_meta($template_id, '_legacy_references_migrated');
            delete_post_meta($template_id, '_assignments_migrated');
            delete_post_meta($template_id, '_bridge_version');
            delete_post_meta($template_id, '_precision_calculator_enabled');
            delete_post_meta($template_id, '_migration_completed');

            return array(
                'success' => true,
                'backup_key' => $backup_key,
                'restored_items' => $restored_count
            );

        } catch (Exception $e) {
            return array(
                'success' => false,
                'error' => $e->getMessage()
            );
        }
    }

    // PRIVATE HELPER METHODS

    private function findTemplatesWithReferenceLines() {
        $templates = $this->wpdb->get_col("
            SELECT DISTINCT post_id
            FROM {$this->wpdb->postmeta}
            WHERE meta_key IN ('_reference_lines_data', '_multi_view_reference_lines_data', '_measurement_assignments')
            AND meta_value != ''
        ");

        return array_map('intval', $templates);
    }

    private function validateLegacyReferenceLine($line) {
        $required_fields = array('measurement_key', 'label', 'lengthPx', 'start', 'end');

        foreach ($required_fields as $field) {
            if (!isset($line[$field])) {
                return false;
            }
        }

        return is_numeric($line['lengthPx']) && $line['lengthPx'] > 0;
    }

    private function convertLegacyToMultiView($legacy_line) {
        $new_line = array(
            'measurement_key' => $legacy_line['measurement_key'],
            'label' => $legacy_line['label'],
            'lengthPx' => $legacy_line['lengthPx'],
            'start' => $legacy_line['start'],
            'end' => $legacy_line['end'],
            'view_id' => 'main',
            'view_name' => 'Main View',
            'linked_to_measurements' => true,
            'primary_reference' => false,
            'measurement_category' => $this->determineMeasurementCategory($legacy_line['measurement_key']),
            'precision_level' => 3, // Default precision level
            'bridge_version' => self::MIGRATION_VERSION,
            'created_timestamp' => current_time('timestamp'),
            'migration_source' => 'legacy_reference_line'
        );

        // Copy additional fields if they exist
        $optional_fields = array('description', 'color', 'style');
        foreach ($optional_fields as $field) {
            if (isset($legacy_line[$field])) {
                $new_line[$field] = $legacy_line[$field];
            }
        }

        return $new_line;
    }

    private function isDuplicateReferenceLine($new_line, $existing_lines) {
        foreach ($existing_lines as $existing_line) {
            if ($existing_line['measurement_key'] === $new_line['measurement_key']) {
                return true;
            }
        }
        return false;
    }

    private function upgradeAssignmentFormat($assignment) {
        try {
            // Check if already in new format
            if (isset($assignment['bridge_version']) && $assignment['bridge_version'] === self::MIGRATION_VERSION) {
                return array('success' => true, 'assignment' => $assignment);
            }

            $upgraded = $assignment;

            // Add missing fields with defaults
            $upgraded['bridge_version'] = self::MIGRATION_VERSION;
            $upgraded['coordinate_system'] = 'enhanced_multi_transform';
            $upgraded['updated_at'] = current_time('mysql');

            if (!isset($upgraded['created_at'])) {
                $upgraded['created_at'] = current_time('mysql');
            }

            if (!isset($upgraded['precision_level'])) {
                $upgraded['precision_level'] = $this->determinePrecisionLevel($assignment['measurement_key'] ?? 'unknown');
            }

            if (!isset($upgraded['measurement_category'])) {
                $upgraded['measurement_category'] = $this->determineMeasurementCategory($assignment['measurement_key'] ?? 'unknown');
            }

            if (!isset($upgraded['transformation_quality'])) {
                $upgraded['transformation_quality'] = 85; // Default quality score
            }

            return array('success' => true, 'assignment' => $upgraded);

        } catch (Exception $e) {
            return array('success' => false, 'error' => $e->getMessage());
        }
    }

    private function determineMeasurementCategory($measurement_key) {
        $categories = array(
            'A' => 'horizontal', // Chest
            'B' => 'horizontal', // Hem Width
            'C' => 'vertical',   // Height from Shoulder
            'D' => 'horizontal', // Shoulder Width
            'E' => 'vertical',   // Sleeve Length
            'F' => 'vertical',   // Back Length
            'G' => 'horizontal', // Neck Opening
            'H' => 'horizontal', // Biceps
            'J' => 'detail'      // Details
        );

        return isset($categories[$measurement_key]) ? $categories[$measurement_key] : 'horizontal';
    }

    private function determinePrecisionLevel($measurement_key) {
        $precision_levels = array(
            'A' => 5, // Primary measurement - highest precision
            'C' => 5, // Primary measurement - highest precision
            'D' => 4, // Important secondary
            'B' => 3, // Standard
            'E' => 3, // Standard
            'F' => 3, // Standard
            'G' => 2, // Detail
            'H' => 2, // Detail
            'J' => 2  // Detail
        );

        return isset($precision_levels[$measurement_key]) ? $precision_levels[$measurement_key] : 3;
    }

    private function validateMultiViewReferenceLines($multi_view_data) {
        $errors = array();

        foreach ($multi_view_data as $view_id => $view_lines) {
            if (!is_array($view_lines)) {
                $errors[] = "Invalid view data structure for view: {$view_id}";
                continue;
            }

            foreach ($view_lines as $line) {
                if (!$this->validateLegacyReferenceLine($line)) {
                    $errors[] = "Invalid reference line in view {$view_id}: " . json_encode($line);
                }
            }
        }

        return array(
            'valid' => empty($errors),
            'errors' => $errors
        );
    }

    private function validateMeasurementAssignments($assignments) {
        $errors = array();

        foreach ($assignments as $key => $assignment) {
            if (!is_array($assignment)) {
                $errors[] = "Invalid assignment structure for key: {$key}";
                continue;
            }

            $required_fields = array('measurement_key', 'bridge_version');
            foreach ($required_fields as $field) {
                if (!isset($assignment[$field])) {
                    $errors[] = "Missing required field '{$field}' in assignment: {$key}";
                }
            }
        }

        return array(
            'valid' => empty($errors),
            'errors' => $errors
        );
    }

    private function findLatestBackup($template_id) {
        $backups = $this->wpdb->get_results($this->wpdb->prepare("
            SELECT meta_key, meta_value
            FROM {$this->wpdb->postmeta}
            WHERE post_id = %d
            AND meta_key LIKE %s
            ORDER BY meta_key DESC
            LIMIT 1
        ", $template_id, self::BACKUP_PREFIX . '%'));

        return !empty($backups) ? $backups[0]->meta_key : null;
    }

    private function log($message, $level = 'info') {
        $this->migration_log[] = array(
            'timestamp' => current_time('mysql'),
            'level' => $level,
            'message' => $message
        );

        // Also log to WordPress error log for debugging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("[PrecisionCalculatorMigration {$level}] {$message}");
        }
    }

    /**
     * Get migration log
     */
    public function getMigrationLog() {
        return $this->migration_log;
    }

    /**
     * Clear migration log
     */
    public function clearLog() {
        $this->migration_log = array();
    }
}