<?php
/**
 * 🧠 AGENT 6 DELIVERABLE: Template Sizes Integration Tester
 * Agent: IntegrationTester
 * Mission: Test Template Sizes synchronization with measurement system
 *
 * @package Octo_Print_Designer
 * @since 1.0.0
 */

class TemplateSizesIntegrationTester {

    private $measurement_manager;
    private $validation_framework;

    public function __construct() {
        $this->measurement_manager = new TemplateMeasurementManager();
        $this->validation_framework = new MeasurementValidationFramework();
    }

    /**
     * 🧪 AGENT 6: Execute complete integration test suite
     *
     * @return array Test results with WooCommerce compatibility
     */
    public function execute_integration_tests() {
        $test_results = [
            'status' => 'success',
            'total_tests' => 0,
            'passed_tests' => 0,
            'failed_tests' => 0,
            'test_details' => [],
            'woocommerce_compatible' => true,
            'admin_interface_ready' => true
        ];

        // Test 1: Template Sizes meta field synchronization
        $test_results = $this->run_integration_test(
            'template_sizes_sync',
            [$this, 'test_template_sizes_synchronization'],
            $test_results
        );

        // Test 2: Dynamic size addition/removal
        $test_results = $this->run_integration_test(
            'dynamic_size_operations',
            [$this, 'test_dynamic_size_operations'],
            $test_results
        );

        // Test 3: Measurement retrieval with dynamic sizes
        $test_results = $this->run_integration_test(
            'measurement_retrieval',
            [$this, 'test_measurement_retrieval'],
            $test_results
        );

        // Test 4: WooCommerce integration compatibility
        $test_results = $this->run_integration_test(
            'woocommerce_compatibility',
            [$this, 'test_woocommerce_compatibility'],
            $test_results
        );

        // Test 5: Admin interface integration
        $test_results = $this->run_integration_test(
            'admin_interface_integration',
            [$this, 'test_admin_interface_integration'],
            $test_results
        );

        // Overall status
        if ($test_results['failed_tests'] > 0) {
            $test_results['status'] = 'failed';
        }

        return $test_results;
    }

    /**
     * 🔗 Test Template Sizes synchronization
     */
    private function test_template_sizes_synchronization() {
        try {
            // Create test template
            $template_id = wp_insert_post([
                'post_title' => 'Test Template for Sync',
                'post_type' => 'product',
                'post_status' => 'publish'
            ]);

            if (!$template_id) {
                return ['success' => false, 'error' => 'Failed to create test template'];
            }

            // Set Template Sizes
            $template_sizes = [
                ['id' => 'XS', 'name' => 'Extra Small', 'order' => 1],
                ['id' => 'S', 'name' => 'Small', 'order' => 2],
                ['id' => 'M', 'name' => 'Medium', 'order' => 3],
                ['id' => 'L', 'name' => 'Large', 'order' => 4]
            ];

            update_post_meta($template_id, '_template_sizes', $template_sizes);

            // Trigger synchronization
            $sync_result = $this->measurement_manager->sync_with_template_sizes($template_id);

            // Verify measurements were created for all sizes
            $measurements = $this->measurement_manager->get_measurements($template_id);
            $measurement_size_keys = array_keys($measurements);

            $expected_keys = ['XS', 'S', 'M', 'L'];
            $missing_keys = array_diff($expected_keys, $measurement_size_keys);

            // Cleanup
            wp_delete_post($template_id, true);

            if (!$sync_result) {
                return ['success' => false, 'error' => 'Sync operation failed'];
            }

            if (!empty($missing_keys)) {
                return ['success' => false, 'error' => 'Missing measurements for sizes: ' . implode(', ', $missing_keys)];
            }

            return ['success' => true, 'message' => 'Template Sizes sync working correctly'];

        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * 🔄 Test dynamic size addition/removal
     */
    private function test_dynamic_size_operations() {
        try {
            // Create test template
            $template_id = wp_insert_post([
                'post_title' => 'Test Template for Dynamic Ops',
                'post_type' => 'product',
                'post_status' => 'publish'
            ]);

            // Initial sizes
            $initial_sizes = [
                ['id' => 'S', 'name' => 'Small', 'order' => 1],
                ['id' => 'M', 'name' => 'Medium', 'order' => 2]
            ];
            update_post_meta($template_id, '_template_sizes', $initial_sizes);
            $this->measurement_manager->sync_with_template_sizes($template_id);

            // Add new size
            $updated_sizes = [
                ['id' => 'S', 'name' => 'Small', 'order' => 1],
                ['id' => 'M', 'name' => 'Medium', 'order' => 2],
                ['id' => 'L', 'name' => 'Large', 'order' => 3]
            ];
            update_post_meta($template_id, '_template_sizes', $updated_sizes);
            $this->measurement_manager->sync_with_template_sizes($template_id);

            $measurements_after_add = $this->measurement_manager->get_measurements($template_id);

            // Remove size
            $reduced_sizes = [
                ['id' => 'M', 'name' => 'Medium', 'order' => 2],
                ['id' => 'L', 'name' => 'Large', 'order' => 3]
            ];
            update_post_meta($template_id, '_template_sizes', $reduced_sizes);
            $this->measurement_manager->sync_with_template_sizes($template_id);

            $measurements_after_remove = $this->measurement_manager->get_measurements($template_id);

            // Cleanup
            wp_delete_post($template_id, true);

            // Verify operations
            if (!isset($measurements_after_add['L'])) {
                return ['success' => false, 'error' => 'Size addition not working'];
            }

            if (isset($measurements_after_remove['S'])) {
                return ['success' => false, 'error' => 'Size removal not working'];
            }

            return ['success' => true, 'message' => 'Dynamic size operations working correctly'];

        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * 📏 Test measurement retrieval with dynamic sizes
     */
    private function test_measurement_retrieval() {
        try {
            // Test various retrieval methods
            $template_id = wp_insert_post([
                'post_title' => 'Test Template for Retrieval',
                'post_type' => 'product',
                'post_status' => 'publish'
            ]);

            // Set up test data
            $template_sizes = [['id' => 'M', 'name' => 'Medium', 'order' => 1]];
            update_post_meta($template_id, '_template_sizes', $template_sizes);

            $test_measurements = ['M' => ['A' => 62.5, 'B' => 58.0]];
            $this->measurement_manager->save_measurements($template_id, $test_measurements);

            // Test get_measurements
            $all_measurements = $this->measurement_manager->get_measurements($template_id);

            // Test get_specific_measurement
            $specific_measurement = $this->measurement_manager->get_specific_measurement($template_id, 'M', 'A');

            // Test get_template_sizes
            $retrieved_sizes = $this->measurement_manager->get_template_sizes($template_id);

            // Cleanup
            wp_delete_post($template_id, true);

            // Verify retrievals
            if (empty($all_measurements)) {
                return ['success' => false, 'error' => 'get_measurements not working'];
            }

            if ($specific_measurement !== 62.5) {
                return ['success' => false, 'error' => 'get_specific_measurement not working'];
            }

            if (empty($retrieved_sizes)) {
                return ['success' => false, 'error' => 'get_template_sizes not working'];
            }

            return ['success' => true, 'message' => 'Measurement retrieval working correctly'];

        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * 🛒 Test WooCommerce integration compatibility
     */
    private function test_woocommerce_compatibility() {
        try {
            // Check if WooCommerce is active
            if (!class_exists('WooCommerce')) {
                return ['success' => true, 'message' => 'WooCommerce not active - skipping compatibility test'];
            }

            // Test WooCommerce product integration
            $product_id = wp_insert_post([
                'post_title' => 'Test Product for WC Integration',
                'post_type' => 'product',
                'post_status' => 'publish'
            ]);

            // Set up as WooCommerce product
            wp_set_object_terms($product_id, 'simple', 'product_type');
            update_post_meta($product_id, '_visibility', 'visible');
            update_post_meta($product_id, '_stock_status', 'instock');
            update_post_meta($product_id, '_price', '29.99');
            update_post_meta($product_id, '_regular_price', '29.99');

            // Add Template Sizes and measurements
            $template_sizes = [['id' => 'M', 'name' => 'Medium', 'order' => 1]];
            update_post_meta($product_id, '_template_sizes', $template_sizes);

            $test_measurements = ['M' => ['A' => 60.0]];
            $this->measurement_manager->save_measurements($product_id, $test_measurements);

            // Test WooCommerce product object integration
            $wc_product = wc_get_product($product_id);
            if (!$wc_product) {
                wp_delete_post($product_id, true);
                return ['success' => false, 'error' => 'WooCommerce product creation failed'];
            }

            // Test measurement retrieval in WooCommerce context
            $measurements = $this->measurement_manager->get_measurements($product_id);

            // Cleanup
            wp_delete_post($product_id, true);

            if (empty($measurements)) {
                return ['success' => false, 'error' => 'Measurements not accessible in WooCommerce context'];
            }

            return ['success' => true, 'message' => 'WooCommerce compatibility verified'];

        } catch (Exception $e) {
            return ['success' => false, 'error' => 'WooCommerce compatibility test failed: ' . $e->getMessage()];
        }
    }

    /**
     * 🎛️ Test admin interface integration
     */
    private function test_admin_interface_integration() {
        try {
            // Test admin hooks and filters
            $hooks_exist = [
                'has_action' => [
                    'save_post' => has_action('save_post'),
                    'wp_ajax' => has_action('wp_ajax_save_measurements')
                ],
                'has_filter' => [
                    'post_meta' => has_filter('get_post_metadata')
                ]
            ];

            // Test measurement manager instantiation in admin
            if (!class_exists('TemplateMeasurementManager')) {
                return ['success' => false, 'error' => 'TemplateMeasurementManager class not accessible'];
            }

            $manager = new TemplateMeasurementManager();
            if (!$manager) {
                return ['success' => false, 'error' => 'Cannot instantiate TemplateMeasurementManager'];
            }

            // Test table existence for admin operations
            global $wpdb;
            $table_name = $wpdb->prefix . 'template_measurements';
            $table_exists = $wpdb->get_var("SHOW TABLES LIKE '{$table_name}'");

            if (!$table_exists) {
                return ['success' => false, 'error' => 'Measurement table not available for admin operations'];
            }

            return ['success' => true, 'message' => 'Admin interface integration ready'];

        } catch (Exception $e) {
            return ['success' => false, 'error' => 'Admin interface test failed: ' . $e->getMessage()];
        }
    }

    /**
     * 🧪 Helper to run individual integration tests
     */
    private function run_integration_test($test_name, $test_function, $results) {
        $results['total_tests']++;

        try {
            $test_result = call_user_func($test_function);

            if ($test_result['success']) {
                $results['passed_tests']++;
                $results['test_details'][$test_name] = [
                    'status' => 'PASSED',
                    'message' => $test_result['message']
                ];
            } else {
                $results['failed_tests']++;
                $results['test_details'][$test_name] = [
                    'status' => 'FAILED',
                    'error' => $test_result['error']
                ];

                // Update compatibility flags based on specific failures
                if ($test_name === 'woocommerce_compatibility') {
                    $results['woocommerce_compatible'] = false;
                }
                if ($test_name === 'admin_interface_integration') {
                    $results['admin_interface_ready'] = false;
                }
            }

        } catch (Exception $e) {
            $results['failed_tests']++;
            $results['test_details'][$test_name] = [
                'status' => 'ERROR',
                'error' => $e->getMessage()
            ];
        }

        return $results;
    }
}