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

    public function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name = $wpdb->prefix . 'template_measurements';
    }

    /**
     * 🎯 DYNAMIC SIZES: Get template sizes from _template_sizes meta field
     *
     * @param int $template_id Template post ID
     * @return array Array of size objects [{'id': 'L', 'name': 'Large', 'order': 3}]
     */
    public function get_template_sizes($template_id) {
        $sizes = get_post_meta($template_id, '_template_sizes', true);

        if (!is_array($sizes)) {
            return [];
        }

        // Sort by order field
        usort($sizes, function($a, $b) {
            return ($a['order'] ?? 0) - ($b['order'] ?? 0);
        });

        return $sizes;
    }

    /**
     * 🔍 Get all measurements for a specific template
     * Returns measurements organized by size_key and measurement_key
     *
     * @param int $template_id Template post ID
     * @return array Multi-dimensional array [size_key][measurement_key] = value_cm
     */
    public function get_measurements($template_id) {
        $results = $this->wpdb->get_results(
            $this->wpdb->prepare(
                "SELECT size_key, measurement_key, measurement_label, value_cm
                FROM {$this->table_name}
                WHERE template_id = %d
                ORDER BY size_key, measurement_key",
                $template_id
            ),
            ARRAY_A
        );

        $measurements = [];
        foreach ($results as $row) {
            $measurements[$row['size_key']][$row['measurement_key']] = [
                'value_cm' => floatval($row['value_cm']),
                'label' => $row['measurement_label']
            ];
        }

        return $measurements;
    }

    /**
     * 🎯 Get specific measurement for size/type combination
     *
     * @param int $template_id Template post ID
     * @param string $size_key Size identifier (from _template_sizes.id)
     * @param string $measurement_key Measurement type (A, B, C, etc.)
     * @return float|null Measurement value in cm, null if not found
     */
    public function get_specific_measurement($template_id, $size_key, $measurement_key) {
        $result = $this->wpdb->get_var(
            $this->wpdb->prepare(
                "SELECT value_cm FROM {$this->table_name}
                WHERE template_id = %d AND size_key = %s AND measurement_key = %s",
                $template_id, $size_key, $measurement_key
            )
        );

        return $result ? floatval($result) : null;
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

        // Start transaction
        $this->wpdb->query('START TRANSACTION');

        try {
            // Delete existing measurements for this template
            $this->wpdb->delete($this->table_name, ['template_id' => $template_id], ['%d']);

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
                        throw new Exception("Failed to insert measurement: {$size_key}.{$measurement_key}");
                    }
                }
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
}