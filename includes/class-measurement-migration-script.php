<?php
/**
 * 🧠 AGENT 4 DELIVERABLE: Measurement Data Migration Script
 * Agent: DataMigrator
 * Mission: Convert existing JSON measurement data to dynamic wp_template_measurements table
 *
 * @package Octo_Print_Designer
 * @since 1.0.0
 */

class MeasurementMigrationScript {

    private $wpdb;
    private $measurement_manager;

    public function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->measurement_manager = new TemplateMeasurementManager();
    }

    /**
     * 🔄 AGENT 4: Execute complete migration from JSON to dynamic table
     *
     * @return array Migration results with validation
     */
    public function execute_migration() {
        $results = [
            'status' => 'success',
            'migrated_templates' => 0,
            'migrated_measurements' => 0,
            'errors' => [],
            'rollback_data' => []
        ];

        try {
            // Find all templates with measurement data
            $templates_with_measurements = $this->find_templates_with_measurements();

            foreach ($templates_with_measurements as $template_id => $json_data) {
                $migration_result = $this->migrate_template_measurements($template_id, $json_data);

                if ($migration_result['success']) {
                    $results['migrated_templates']++;
                    $results['migrated_measurements'] += $migration_result['measurement_count'];
                    $results['rollback_data'][$template_id] = $json_data;
                } else {
                    $results['errors'][] = "Template {$template_id}: " . $migration_result['error'];
                }
            }

        } catch (Exception $e) {
            $results['status'] = 'error';
            $results['errors'][] = $e->getMessage();
        }

        return $results;
    }

    /**
     * 🔍 Find templates with existing measurement data
     */
    private function find_templates_with_measurements() {
        $results = $this->wpdb->get_results(
            "SELECT post_id, meta_value
             FROM {$this->wpdb->postmeta}
             WHERE meta_key IN ('_measurement_data', '_size_data', '_template_measurements')
             AND meta_value LIKE '%measurement%'",
            ARRAY_A
        );

        $templates = [];
        foreach ($results as $row) {
            $templates[$row['post_id']] = json_decode($row['meta_value'], true);
        }

        return $templates;
    }

    /**
     * 🔄 Migrate single template measurements
     */
    private function migrate_template_measurements($template_id, $json_data) {
        try {
            // Get template sizes for validation
            $template_sizes = $this->measurement_manager->get_template_sizes($template_id);
            if (empty($template_sizes)) {
                return ['success' => false, 'error' => 'No Template Sizes defined'];
            }

            // Map JSON data to dynamic measurement structure
            $measurements_data = $this->map_json_to_dynamic_measurements($json_data, $template_sizes);

            // Validate and save measurements
            $validation_errors = $this->measurement_manager->validate_measurements($measurements_data);
            if (!empty($validation_errors)) {
                return ['success' => false, 'error' => implode(', ', $validation_errors)];
            }

            $save_result = $this->measurement_manager->save_measurements($template_id, $measurements_data);

            return [
                'success' => $save_result,
                'measurement_count' => count($measurements_data),
                'error' => $save_result ? null : 'Save operation failed'
            ];

        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * 🗺️ Map hardcoded S/M/L/XL JSON to dynamic Template Sizes format
     */
    private function map_json_to_dynamic_measurements($json_data, $template_sizes) {
        $measurements_data = [];

        // Create size mapping: hardcoded -> Template Sizes ID
        $size_mapping = $this->create_size_mapping($template_sizes);

        // Process JSON measurement data
        foreach ($json_data as $size_key => $measurements) {
            // Map hardcoded size to Template Sizes ID
            $dynamic_size_key = $size_mapping[$size_key] ?? $size_key;

            if (!empty($measurements) && is_array($measurements)) {
                foreach ($measurements as $measurement_key => $value) {
                    $measurements_data[$dynamic_size_key][$measurement_key] = floatval($value);
                }
            }
        }

        return $measurements_data;
    }

    /**
     * 🗺️ Create mapping from hardcoded sizes to Template Sizes IDs
     */
    private function create_size_mapping($template_sizes) {
        $mapping = [];

        // Default mappings for common hardcoded sizes
        $default_mappings = [
            'S' => 'S', 'M' => 'M', 'L' => 'L', 'XL' => 'XL',
            'XS' => 'XS', 'XXL' => 'XXL', '2XL' => '2XL', '3XL' => '3XL'
        ];

        // Map to actual Template Sizes IDs
        foreach ($template_sizes as $size) {
            $size_id = $size['id'];
            $mapping[$size_id] = $size_id; // Direct mapping

            // Also map common variations
            foreach ($default_mappings as $hardcoded => $target) {
                if ($size_id === $target) {
                    $mapping[$hardcoded] = $size_id;
                }
            }
        }

        return $mapping;
    }

    /**
     * 🔄 Rollback migration (restore JSON data)
     */
    public function rollback_migration($rollback_data) {
        $results = ['success' => true, 'restored_templates' => 0, 'errors' => []];

        foreach ($rollback_data as $template_id => $json_data) {
            try {
                // Delete measurements from table
                $this->wpdb->delete(
                    $this->wpdb->prefix . 'template_measurements',
                    ['template_id' => $template_id],
                    ['%d']
                );

                // Restore JSON meta data
                update_post_meta($template_id, '_measurement_data', $json_data);
                $results['restored_templates']++;

            } catch (Exception $e) {
                $results['errors'][] = "Template {$template_id}: " . $e->getMessage();
            }
        }

        return $results;
    }
}