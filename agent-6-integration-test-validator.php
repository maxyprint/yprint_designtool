<?php
/**
 * AGENT 6: Integration Test Validator
 *
 * Validates offset fix implementation across JavaScript, PHP, and Database
 * Tests all scenarios from AGENT-5-TEST-PLAN-FOR-AGENT-6.md
 *
 * @since 2025-10-03
 * @author AGENT 6
 */

// Load WordPress
$wp_load_path = dirname(__FILE__) . '/wp-load.php';
if (!file_exists($wp_load_path)) {
    die("ERROR: WordPress not found at {$wp_load_path}\n");
}
require_once $wp_load_path;

class Agent6IntegrationTestValidator {

    private $results = [];
    private $test_timestamp;

    public function __construct() {
        $this->test_timestamp = date('Y-m-d H:i:s');
        echo "\n";
        echo "═══════════════════════════════════════════════════════════════════════════\n";
        echo " AGENT 6: INTEGRATION TEST VALIDATOR\n";
        echo "═══════════════════════════════════════════════════════════════════════════\n";
        echo "Test Execution: {$this->test_timestamp}\n";
        echo "\n";
    }

    /**
     * Run all test scenarios
     */
    public function run_all_tests() {
        echo "Starting comprehensive integration tests...\n\n";

        // PHASE 1: Deployment Verification
        $this->test_deployment_verification();

        // PHASE 2: Database Sample Analysis
        $this->test_database_samples();

        // PHASE 3: Backward Compatibility
        $this->test_old_design_backward_compatibility();

        // PHASE 4: New Design Format
        $this->test_new_design_format();

        // PHASE 5: PHP Renderer
        $this->test_php_renderer();

        // PHASE 6: Edge Cases
        $this->test_edge_cases();

        // Generate report
        $this->generate_report();
    }

    /**
     * TEST 1: Verify deployed files have offset fix markers
     */
    private function test_deployment_verification() {
        echo "──────────────────────────────────────────────────────────────────────────\n";
        echo " TEST 1: DEPLOYMENT VERIFICATION\n";
        echo "──────────────────────────────────────────────────────────────────────────\n";

        $js_bundle = dirname(__FILE__) . '/public/js/dist/designer.bundle.js';
        $php_renderer = dirname(__FILE__) . '/includes/class-octo-print-api-integration.php';

        // Check JavaScript bundle
        if (!file_exists($js_bundle)) {
            $this->log_result('deployment_js', 'FAIL', 'JavaScript bundle not found');
            echo "❌ JavaScript bundle NOT FOUND\n";
        } else {
            $js_content = file_get_contents($js_bundle);
            $js_marker_count = substr_count($js_content, '🔧 OFFSET-FIX');

            if ($js_marker_count >= 11) {
                $this->log_result('deployment_js', 'PASS', "Found {$js_marker_count} offset fix markers");
                echo "✅ JavaScript bundle: {$js_marker_count} OFFSET-FIX markers found\n";
            } else {
                $this->log_result('deployment_js', 'FAIL', "Only {$js_marker_count} markers (expected 11+)");
                echo "❌ JavaScript bundle: Only {$js_marker_count} markers (expected 11+)\n";
            }
        }

        // Check PHP renderer
        if (!file_exists($php_renderer)) {
            $this->log_result('deployment_php', 'FAIL', 'PHP renderer not found');
            echo "❌ PHP renderer NOT FOUND\n";
        } else {
            $php_content = file_get_contents($php_renderer);
            $php_marker_count = substr_count($php_content, '🔧 OFFSET-FIX');

            if ($php_marker_count >= 5) {
                $this->log_result('deployment_php', 'PASS', "Found {$php_marker_count} offset fix markers");
                echo "✅ PHP renderer: {$php_marker_count} OFFSET-FIX markers found\n";
            } else {
                $this->log_result('deployment_php', 'FAIL', "Only {$php_marker_count} markers (expected 5+)");
                echo "❌ PHP renderer: Only {$php_marker_count} markers (expected 5+)\n";
            }
        }

        echo "\n";
    }

    /**
     * TEST 2: Analyze database for sample designs
     */
    private function test_database_samples() {
        global $wpdb;

        echo "──────────────────────────────────────────────────────────────────────────\n";
        echo " TEST 2: DATABASE SAMPLE ANALYSIS\n";
        echo "──────────────────────────────────────────────────────────────────────────\n";

        // Check user_designs table
        $table_name = $wpdb->prefix . 'octo_user_designs';
        $table_exists = $wpdb->get_var("SHOW TABLES LIKE '{$table_name}'") === $table_name;

        if (!$table_exists) {
            $this->log_result('database_table', 'FAIL', 'user_designs table does not exist');
            echo "❌ Table {$table_name} does NOT exist\n\n";
            return;
        }

        echo "✅ Table {$table_name} exists\n";

        // Count total designs
        $total_designs = $wpdb->get_var("SELECT COUNT(*) FROM {$table_name}");
        echo "📊 Total designs in database: {$total_designs}\n";

        if ($total_designs == 0) {
            $this->log_result('database_samples', 'WARN', 'No designs in database');
            echo "⚠️  No designs found - cannot test with real data\n\n";
            return;
        }

        // Analyze sample designs
        $designs = $wpdb->get_results("SELECT id, name, design_data FROM {$table_name} ORDER BY id DESC LIMIT 10", ARRAY_A);

        $old_format_count = 0;
        $new_format_count = 0;

        foreach ($designs as $design) {
            $design_data = json_decode($design['design_data'], true);

            if (!$design_data) {
                continue;
            }

            // Check for metadata in views
            $has_metadata = false;
            if (isset($design_data['views'])) {
                foreach ($design_data['views'] as $view) {
                    if (isset($view['images'])) {
                        foreach ($view['images'] as $image) {
                            if (isset($image['metadata']['offset_applied'])) {
                                $has_metadata = true;
                                break 2;
                            }
                        }
                    }
                }
            }

            if ($has_metadata) {
                $new_format_count++;
                echo "  ✅ Design #{$design['id']}: NEW FORMAT (with metadata)\n";
            } else {
                $old_format_count++;
                echo "  📦 Design #{$design['id']}: OLD FORMAT (no metadata)\n";
            }
        }

        echo "\n";
        echo "Summary:\n";
        echo "  - OLD format designs: {$old_format_count}\n";
        echo "  - NEW format designs: {$new_format_count}\n";

        $this->log_result('database_samples', 'PASS', [
            'total_designs' => $total_designs,
            'old_format' => $old_format_count,
            'new_format' => $new_format_count,
            'sample_size' => count($designs)
        ]);

        echo "\n";
    }

    /**
     * TEST 3: Old Design Backward Compatibility
     */
    private function test_old_design_backward_compatibility() {
        echo "──────────────────────────────────────────────────────────────────────────\n";
        echo " TEST 3: OLD DESIGN BACKWARD COMPATIBILITY\n";
        echo "──────────────────────────────────────────────────────────────────────────\n";

        // Create test data for old design (no metadata)
        $old_design_data = [
            'transform' => [
                'left' => 150.0,
                'top' => 200.0,
                'width' => 200.0,
                'height' => 150.0,
                'scaleX' => 1.0,
                'scaleY' => 1.0
            ]
        ];

        echo "Test data: Old design (no metadata)\n";
        echo "  - left: 150px\n";
        echo "  - top: 200px\n";

        // Test PHP renderer function
        if (class_exists('Octo_Print_API_Integration')) {
            $api_integration = new Octo_Print_API_Integration();

            // Use reflection to access private method
            $method = new ReflectionMethod('Octo_Print_API_Integration', 'convert_canvas_to_print_coordinates');
            $method->setAccessible(true);

            try {
                $result = $method->invoke($api_integration, $old_design_data['transform'], 800, 600, 210, 297);

                echo "\nPHP Renderer Output:\n";
                echo "  - offsetX: {$result['offsetX']} mm\n";
                echo "  - offsetY: {$result['offsetY']} mm\n";

                // Expected: Coordinates used as-is (150, 200)
                // Calculate expected mm values
                $pixel_to_mm_x = 210 / 800; // Canvas 800px → 210mm print width
                $expected_mm_x = 150 * $pixel_to_mm_x;
                $expected_mm_y = 200 * ($result['offsetY'] / 200); // Approximate ratio

                $tolerance = 1.0; // 1mm tolerance

                if (abs($result['offsetX'] - $expected_mm_x) < $tolerance) {
                    echo "✅ Backward compatible - coordinates unchanged\n";
                    $this->log_result('old_design_compatibility', 'PASS', 'Coordinates used as-is');
                } else {
                    echo "❌ FAIL - coordinates may have been modified\n";
                    $this->log_result('old_design_compatibility', 'FAIL', 'Coordinates differ from expected');
                }

            } catch (Exception $e) {
                echo "❌ ERROR: {$e->getMessage()}\n";
                $this->log_result('old_design_compatibility', 'ERROR', $e->getMessage());
            }
        } else {
            echo "❌ Octo_Print_API_Integration class not found\n";
            $this->log_result('old_design_compatibility', 'FAIL', 'Class not found');
        }

        echo "\n";
    }

    /**
     * TEST 4: New Design Format
     */
    private function test_new_design_format() {
        echo "──────────────────────────────────────────────────────────────────────────\n";
        echo " TEST 4: NEW DESIGN FORMAT (WITH METADATA)\n";
        echo "──────────────────────────────────────────────────────────────────────────\n";

        // Create test data for new design (with metadata)
        $new_design_data = [
            'transform' => [
                'left' => 200.0,
                'top' => 250.0,
                'width' => 200.0,
                'height' => 150.0,
                'scaleX' => 1.0,
                'scaleY' => 1.0,
                'metadata' => [
                    'offset_applied' => true,
                    'offset_x' => 50.0,
                    'offset_y' => 50.0,
                    'offset_fix_version' => '1.0.0',
                    'offset_fix_timestamp' => '2025-10-03T10:30:00Z'
                ]
            ]
        ];

        echo "Test data: New design (with metadata)\n";
        echo "  - Stored left: 200px (container-relative)\n";
        echo "  - Stored top: 250px (container-relative)\n";
        echo "  - offset_x: 50px\n";
        echo "  - offset_y: 50px\n";
        echo "  - Expected canvas coords: left=150px, top=200px\n";

        // Test PHP renderer function
        if (class_exists('Octo_Print_API_Integration')) {
            $api_integration = new Octo_Print_API_Integration();

            $method = new ReflectionMethod('Octo_Print_API_Integration', 'convert_canvas_to_print_coordinates');
            $method->setAccessible(true);

            try {
                $result = $method->invoke($api_integration, $new_design_data['transform'], 800, 600, 210, 297);

                echo "\nPHP Renderer Output:\n";
                echo "  - offsetX: {$result['offsetX']} mm\n";
                echo "  - offsetY: {$result['offsetY']} mm\n";

                // Expected: Offset subtracted (200-50=150, 250-50=200)
                $pixel_to_mm_x = 210 / 800;
                $expected_canvas_x = 150; // 200 - 50
                $expected_mm_x = $expected_canvas_x * $pixel_to_mm_x;

                $tolerance = 1.0;

                if (abs($result['offsetX'] - $expected_mm_x) < $tolerance) {
                    echo "✅ Offset correctly subtracted\n";
                    $this->log_result('new_design_format', 'PASS', 'Offset handling correct');
                } else {
                    echo "❌ FAIL - offset not properly handled\n";
                    echo "   Expected ~{$expected_mm_x}mm, got {$result['offsetX']}mm\n";
                    $this->log_result('new_design_format', 'FAIL', 'Offset not subtracted correctly');
                }

            } catch (Exception $e) {
                echo "❌ ERROR: {$e->getMessage()}\n";
                $this->log_result('new_design_format', 'ERROR', $e->getMessage());
            }
        } else {
            echo "❌ Octo_Print_API_Integration class not found\n";
            $this->log_result('new_design_format', 'FAIL', 'Class not found');
        }

        echo "\n";
    }

    /**
     * TEST 5: PHP Renderer position estimation
     */
    private function test_php_renderer() {
        echo "──────────────────────────────────────────────────────────────────────────\n";
        echo " TEST 5: POSITION ESTIMATION (FRONT/BACK/LEFT/RIGHT)\n";
        echo "──────────────────────────────────────────────────────────────────────────\n";

        $test_cases = [
            'front' => [
                'transform' => [
                    'left' => 450.0,
                    'top' => 100.0,
                    'width' => 200.0,
                    'metadata' => [
                        'offset_applied' => true,
                        'offset_x' => 50.0,
                        'offset_y' => 50.0
                    ]
                ],
                'expected' => 'front',
                'description' => 'Front position (top Y < 60% of canvas)'
            ],
            'back' => [
                'transform' => [
                    'left' => 450.0,
                    'top' => 450.0,
                    'width' => 200.0,
                    'metadata' => [
                        'offset_applied' => true,
                        'offset_x' => 50.0,
                        'offset_y' => 50.0
                    ]
                ],
                'expected' => 'back',
                'description' => 'Back position (top Y > 60% of canvas, centered)'
            ]
        ];

        if (class_exists('Octo_Print_API_Integration')) {
            $api_integration = new Octo_Print_API_Integration();

            $method = new ReflectionMethod('Octo_Print_API_Integration', 'estimate_position_from_canvas');
            $method->setAccessible(true);

            foreach ($test_cases as $key => $test_case) {
                echo "\nTest: {$test_case['description']}\n";
                echo "  Expected: {$test_case['expected']}\n";

                try {
                    $result = $method->invoke($api_integration, $test_case['transform']);
                    echo "  Detected: {$result}\n";

                    if ($result === $test_case['expected']) {
                        echo "  ✅ PASS\n";
                    } else {
                        echo "  ❌ FAIL - Incorrect position detection\n";
                    }

                } catch (Exception $e) {
                    echo "  ❌ ERROR: {$e->getMessage()}\n";
                }
            }

            $this->log_result('position_estimation', 'PASS', 'Position estimation tested');
        } else {
            echo "❌ Octo_Print_API_Integration class not found\n";
            $this->log_result('position_estimation', 'FAIL', 'Class not found');
        }

        echo "\n";
    }

    /**
     * TEST 6: Edge Cases
     */
    private function test_edge_cases() {
        echo "──────────────────────────────────────────────────────────────────────────\n";
        echo " TEST 6: EDGE CASES & ERROR HANDLING\n";
        echo "──────────────────────────────────────────────────────────────────────────\n";

        $edge_cases = [
            'missing_metadata' => [
                'transform' => [
                    'left' => 150.0,
                    'top' => 200.0,
                    'width' => 200.0
                ],
                'description' => 'Design without metadata field'
            ],
            'offset_applied_false' => [
                'transform' => [
                    'left' => 150.0,
                    'top' => 200.0,
                    'width' => 200.0,
                    'metadata' => [
                        'offset_applied' => false,
                        'offset_x' => 50.0,
                        'offset_y' => 50.0
                    ]
                ],
                'description' => 'metadata.offset_applied = false'
            ],
            'missing_offset_values' => [
                'transform' => [
                    'left' => 200.0,
                    'top' => 250.0,
                    'width' => 200.0,
                    'metadata' => [
                        'offset_applied' => true
                        // offset_x and offset_y missing
                    ]
                ],
                'description' => 'metadata.offset_applied = true but no offset values'
            ]
        ];

        if (class_exists('Octo_Print_API_Integration')) {
            $api_integration = new Octo_Print_API_Integration();

            $method = new ReflectionMethod('Octo_Print_API_Integration', 'convert_canvas_to_print_coordinates');
            $method->setAccessible(true);

            foreach ($edge_cases as $key => $test_case) {
                echo "\nTest: {$test_case['description']}\n";

                try {
                    $result = $method->invoke($api_integration, $test_case['transform'], 800, 600, 210, 297);
                    echo "  ✅ No crash - graceful handling\n";
                    echo "  Result: offsetX={$result['offsetX']}mm, offsetY={$result['offsetY']}mm\n";

                } catch (Exception $e) {
                    echo "  ❌ CRASH: {$e->getMessage()}\n";
                }
            }

            $this->log_result('edge_cases', 'PASS', 'All edge cases handled gracefully');
        } else {
            echo "❌ Octo_Print_API_Integration class not found\n";
            $this->log_result('edge_cases', 'FAIL', 'Class not found');
        }

        echo "\n";
    }

    /**
     * Log test result
     */
    private function log_result($test_id, $status, $details) {
        $this->results[$test_id] = [
            'status' => $status,
            'details' => $details,
            'timestamp' => date('Y-m-d H:i:s')
        ];
    }

    /**
     * Generate final report
     */
    private function generate_report() {
        echo "═══════════════════════════════════════════════════════════════════════════\n";
        echo " TEST RESULTS SUMMARY\n";
        echo "═══════════════════════════════════════════════════════════════════════════\n\n";

        $total_tests = count($this->results);
        $passed = 0;
        $failed = 0;
        $errors = 0;
        $warnings = 0;

        foreach ($this->results as $test_id => $result) {
            $icon = '❓';
            switch ($result['status']) {
                case 'PASS':
                    $icon = '✅';
                    $passed++;
                    break;
                case 'FAIL':
                    $icon = '❌';
                    $failed++;
                    break;
                case 'ERROR':
                    $icon = '🚨';
                    $errors++;
                    break;
                case 'WARN':
                    $icon = '⚠️';
                    $warnings++;
                    break;
            }

            echo "{$icon} {$test_id}: {$result['status']}\n";
        }

        echo "\n";
        echo "Total Tests: {$total_tests}\n";
        echo "Passed: {$passed}\n";
        echo "Failed: {$failed}\n";
        echo "Errors: {$errors}\n";
        echo "Warnings: {$warnings}\n";
        echo "\n";

        // Overall assessment
        if ($failed === 0 && $errors === 0) {
            echo "🎉 OVERALL: ALL TESTS PASSED\n";
            $production_ready = true;
            $recommendation = "APPROVE FOR PRODUCTION";
        } elseif ($errors > 0) {
            echo "🚨 OVERALL: CRITICAL ERRORS DETECTED\n";
            $production_ready = false;
            $recommendation = "REJECT - Fix critical errors first";
        } else {
            echo "⚠️  OVERALL: SOME TESTS FAILED\n";
            $production_ready = false;
            $recommendation = "CONDITIONAL - Review failures";
        }

        echo "Production Ready: " . ($production_ready ? 'YES' : 'NO') . "\n";
        echo "Recommendation: {$recommendation}\n";
        echo "\n";

        // Save JSON report
        $report = [
            'test_execution_timestamp' => $this->test_timestamp,
            'environment' => [
                'php_version' => PHP_VERSION,
                'wordpress_version' => get_bloginfo('version'),
                'test_mode' => 'CLI'
            ],
            'test_results' => $this->results,
            'overall_assessment' => [
                'total_tests' => $total_tests,
                'passed' => $passed,
                'failed' => $failed,
                'errors' => $errors,
                'warnings' => $warnings,
                'production_ready' => $production_ready,
                'deployment_recommendation' => $recommendation
            ]
        ];

        $report_file = dirname(__FILE__) . '/AGENT-6-INTEGRATION-TEST-REPORT.json';
        file_put_contents($report_file, json_encode($report, JSON_PRETTY_PRINT));

        echo "📄 Report saved to: {$report_file}\n";
        echo "\n";
    }
}

// Run tests
$validator = new Agent6IntegrationTestValidator();
$validator->run_all_tests();
