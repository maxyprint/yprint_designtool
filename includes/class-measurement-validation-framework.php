<?php
/**
 * 🧠 AGENT 5 DELIVERABLE: Measurement Validation Framework
 * Agent: ValidationExpert
 * Mission: Implement comprehensive data validation for measurement system
 *
 * @package Octo_Print_Designer
 * @since 1.0.0
 */

class MeasurementValidationFramework {

    private $measurement_manager;

    public function __construct() {
        $this->measurement_manager = new TemplateMeasurementManager();
    }

    /**
     * 🧪 AGENT 5: Complete validation suite for measurement system
     *
     * @param int $template_id Template post ID
     * @return array Validation results with precision checks
     */
    public function validate_complete_system($template_id) {
        $validation_results = [
            'status' => 'success',
            'precision_check' => true,
            'template_sync_check' => true,
            'data_integrity_check' => true,
            'errors' => [],
            'warnings' => [],
            'precision_tolerance' => 0.1 // ±0.1cm requirement
        ];

        try {
            // 1. Template Sizes synchronization validation
            $sync_result = $this->validate_template_sizes_sync($template_id);
            if (!$sync_result['valid']) {
                $validation_results['template_sync_check'] = false;
                $validation_results['errors'] = array_merge($validation_results['errors'], $sync_result['errors']);
            }

            // 2. Measurement precision validation
            $precision_result = $this->validate_measurement_precision($template_id);
            if (!$precision_result['valid']) {
                $validation_results['precision_check'] = false;
                $validation_results['errors'] = array_merge($validation_results['errors'], $precision_result['errors']);
            }

            // 3. Data integrity validation
            $integrity_result = $this->validate_data_integrity($template_id);
            if (!$integrity_result['valid']) {
                $validation_results['data_integrity_check'] = false;
                $validation_results['errors'] = array_merge($validation_results['errors'], $integrity_result['errors']);
            }

            // 4. Range validation
            $range_result = $this->validate_measurement_ranges($template_id);
            if (!$range_result['valid']) {
                $validation_results['warnings'] = array_merge($validation_results['warnings'], $range_result['warnings']);
            }

            // Overall status
            if (!empty($validation_results['errors'])) {
                $validation_results['status'] = 'failed';
            } elseif (!empty($validation_results['warnings'])) {
                $validation_results['status'] = 'warning';
            }

        } catch (Exception $e) {
            $validation_results['status'] = 'error';
            $validation_results['errors'][] = 'Validation framework error: ' . $e->getMessage();
        }

        return $validation_results;
    }

    /**
     * 🔗 Validate Template Sizes synchronization
     */
    private function validate_template_sizes_sync($template_id) {
        $result = ['valid' => true, 'errors' => []];

        try {
            // Get Template Sizes from meta field
            $template_sizes = $this->measurement_manager->get_template_sizes($template_id);
            if (empty($template_sizes)) {
                $result['valid'] = false;
                $result['errors'][] = 'No Template Sizes defined in _template_sizes meta field';
                return $result;
            }

            // Get measurements from database
            $measurements = $this->measurement_manager->get_measurements($template_id);

            // Check if all Template Sizes have measurements
            $template_size_ids = array_column($template_sizes, 'id');
            $measurement_size_keys = array_keys($measurements);

            $missing_sizes = array_diff($template_size_ids, $measurement_size_keys);
            if (!empty($missing_sizes)) {
                $result['valid'] = false;
                $result['errors'][] = 'Missing measurements for Template Sizes: ' . implode(', ', $missing_sizes);
            }

            // Check for orphaned measurements (size_key not in Template Sizes)
            $orphaned_sizes = array_diff($measurement_size_keys, $template_size_ids);
            if (!empty($orphaned_sizes)) {
                $result['valid'] = false;
                $result['errors'][] = 'Orphaned measurements for non-existent sizes: ' . implode(', ', $orphaned_sizes);
            }

        } catch (Exception $e) {
            $result['valid'] = false;
            $result['errors'][] = 'Template Sizes sync validation error: ' . $e->getMessage();
        }

        return $result;
    }

    /**
     * 📏 Validate measurement precision (±0.1cm tolerance)
     */
    private function validate_measurement_precision($template_id) {
        $result = ['valid' => true, 'errors' => []];

        try {
            $measurements = $this->measurement_manager->get_measurements($template_id);

            foreach ($measurements as $size_key => $size_measurements) {
                foreach ($size_measurements as $measurement_key => $data) {
                    $value_cm = $data['value_cm'];

                    // Check decimal precision (should be to 1 decimal place for 0.1cm precision)
                    if (round($value_cm, 1) !== $value_cm) {
                        $result['errors'][] = "Precision error for {$size_key}.{$measurement_key}: {$value_cm}cm exceeds ±0.1cm tolerance";
                        $result['valid'] = false;
                    }

                    // Check for unrealistic values
                    if ($value_cm <= 0 || $value_cm > 1000) {
                        $result['errors'][] = "Invalid measurement value for {$size_key}.{$measurement_key}: {$value_cm}cm";
                        $result['valid'] = false;
                    }
                }
            }

        } catch (Exception $e) {
            $result['valid'] = false;
            $result['errors'][] = 'Precision validation error: ' . $e->getMessage();
        }

        return $result;
    }

    /**
     * 🔒 Validate data integrity
     */
    private function validate_data_integrity($template_id) {
        $result = ['valid' => true, 'errors' => []];

        try {
            // Check template exists
            $template = get_post($template_id);
            if (!$template) {
                $result['valid'] = false;
                $result['errors'][] = "Template {$template_id} does not exist";
                return $result;
            }

            // Check database table exists
            global $wpdb;
            $table_name = $wpdb->prefix . 'template_measurements';
            $table_exists = $wpdb->get_var("SHOW TABLES LIKE '{$table_name}'");

            if (!$table_exists) {
                $result['valid'] = false;
                $result['errors'][] = 'Measurement database table does not exist';
                return $result;
            }

            // Check for duplicate measurements (should be prevented by UNIQUE constraint)
            $duplicates = $wpdb->get_results($wpdb->prepare(
                "SELECT template_id, size_key, measurement_key, COUNT(*) as count
                FROM {$table_name}
                WHERE template_id = %d
                GROUP BY template_id, size_key, measurement_key
                HAVING count > 1",
                $template_id
            ));

            if (!empty($duplicates)) {
                $result['valid'] = false;
                foreach ($duplicates as $dup) {
                    $result['errors'][] = "Duplicate measurement: {$dup->size_key}.{$dup->measurement_key} ({$dup->count} entries)";
                }
            }

        } catch (Exception $e) {
            $result['valid'] = false;
            $result['errors'][] = 'Data integrity validation error: ' . $e->getMessage();
        }

        return $result;
    }

    /**
     * 📊 Validate measurement ranges (warnings for unusual values)
     */
    private function validate_measurement_ranges($template_id) {
        $result = ['valid' => true, 'warnings' => []];

        // Expected ranges for clothing measurements (in cm)
        $expected_ranges = [
            'A' => ['min' => 30, 'max' => 150], // Chest
            'B' => ['min' => 30, 'max' => 150], // Hem Width
            'C' => ['min' => 40, 'max' => 100], // Height from Shoulder
            'D' => ['min' => 15, 'max' => 80],  // Sleeve Length
            'E' => ['min' => 10, 'max' => 50],  // Sleeve Opening
            'F' => ['min' => 30, 'max' => 70],  // Shoulder to Shoulder
            'G' => ['min' => 15, 'max' => 35],  // Neck Opening
            'H' => ['min' => 15, 'max' => 50],  // Biceps
            'J' => ['min' => 1, 'max' => 10]    // Rib Height
        ];

        try {
            $measurements = $this->measurement_manager->get_measurements($template_id);

            foreach ($measurements as $size_key => $size_measurements) {
                foreach ($size_measurements as $measurement_key => $data) {
                    $value_cm = $data['value_cm'];

                    if (isset($expected_ranges[$measurement_key])) {
                        $range = $expected_ranges[$measurement_key];

                        if ($value_cm < $range['min'] || $value_cm > $range['max']) {
                            $result['warnings'][] = "Unusual value for {$size_key}.{$measurement_key}: {$value_cm}cm (expected {$range['min']}-{$range['max']}cm)";
                        }
                    }
                }
            }

        } catch (Exception $e) {
            $result['warnings'][] = 'Range validation error: ' . $e->getMessage();
        }

        return $result;
    }

    /**
     * 🧪 Automated testing suite
     */
    public function run_automated_tests() {
        $test_results = [
            'total_tests' => 0,
            'passed_tests' => 0,
            'failed_tests' => 0,
            'test_details' => []
        ];

        // Test 1: Table creation
        $test_results = $this->run_test('table_creation', function() {
            TemplateMeasurementManager::create_table();
            global $wpdb;
            $table_exists = $wpdb->get_var("SHOW TABLES LIKE '{$wpdb->prefix}template_measurements'");
            return !empty($table_exists);
        }, $test_results);

        // Test 2: Measurement save/retrieve
        $test_results = $this->run_test('save_retrieve', function() {
            $manager = new TemplateMeasurementManager();
            $test_data = ['M' => ['A' => 60.5, 'B' => 55.0]];
            $save_result = $manager->save_measurements(1, $test_data);
            $retrieved = $manager->get_measurements(1);
            return $save_result && !empty($retrieved);
        }, $test_results);

        // Add more tests as needed...

        return $test_results;
    }

    /**
     * 🧪 Helper method to run individual tests
     */
    private function run_test($test_name, $test_function, $results) {
        $results['total_tests']++;

        try {
            $passed = call_user_func($test_function);
            if ($passed) {
                $results['passed_tests']++;
                $results['test_details'][$test_name] = 'PASSED';
            } else {
                $results['failed_tests']++;
                $results['test_details'][$test_name] = 'FAILED';
            }
        } catch (Exception $e) {
            $results['failed_tests']++;
            $results['test_details'][$test_name] = 'ERROR: ' . $e->getMessage();
        }

        return $results;
    }
}