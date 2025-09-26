<?php
/**
 * 🎯 ISSUE #24 TEST RUNNER
 * Mission: Execute precision validation tests with comprehensive reporting
 *
 * @package OctoPrintDesigner\Tests
 * @since 1.0.0
 */

echo "🎯 ISSUE #24: PRECISION VALIDATION TEST RUNNER\n";
echo "=" . str_repeat("=", 50) . "\n";
echo "Testing ±0.1mm precision validation framework\n\n";

// Start performance tracking
$total_start_time = microtime(true);
$memory_start = memory_get_usage(true);

// Test configuration
$test_config = [
    'precision_tolerance' => 0.1, // ±0.1mm requirement
    'performance_limit_ms' => 100, // Per test limit
    'memory_limit_mb' => 50,
    'verbose_output' => true
];

// Mock WordPress functions if not available
if (!function_exists('is_wp_error')) {
    function is_wp_error($thing) { return false; }
}
if (!class_exists('WP_Error')) {
    class WP_Error {
        public function __construct($code = '', $message = '') {}
    }
}

// Load test classes
require_once 'tests/ReferenceCalculationTest.php';
require_once 'tests/ProductionPipelineTest.php';

/**
 * Test execution framework
 */
class Issue24TestRunner {

    private $results = [];
    private $config;

    public function __construct($config) {
        $this->config = $config;
    }

    public function runAllTests() {
        echo "🧪 Starting Issue #24 Precision Validation Tests\n\n";

        // Test Suite 1: Reference Calculation Tests
        $this->runTestSuite('ReferenceCalculationTest', [
            'test_millimeter_precision_chest_measurement',
            'test_size_scaling_accuracy',
            'test_reference_line_calculation_accuracy',
            'test_calculation_performance_under_load',
            'test_edge_case_validation'
        ]);

        // Test Suite 2: Production Pipeline Tests
        $this->runTestSuite('ProductionPipelineTest', [
            'test_end_to_end_precision_pipeline',
            'test_api_coordinate_precision_matching',
            'test_production_environment_simulation',
            'test_database_consistency_validation'
        ]);

        $this->generateSummaryReport();
    }

    private function runTestSuite($className, $methods) {
        echo "📋 Test Suite: {$className}\n";
        echo str_repeat("-", 40) . "\n";

        try {
            $testClass = new $className();
            $testClass->setUp();

            foreach ($methods as $method) {
                $this->runSingleTest($testClass, $method, $className);
            }

        } catch (Exception $e) {
            echo "❌ Test Suite {$className} failed to initialize: " . $e->getMessage() . "\n";
            $this->results[$className]['suite_error'] = $e->getMessage();
        }

        echo "\n";
    }

    private function runSingleTest($testInstance, $method, $className) {
        $start_time = microtime(true);
        $memory_before = memory_get_usage(true);

        echo "  🔍 {$method}... ";

        try {
            // Execute test method
            $testInstance->$method();

            $execution_time = (microtime(true) - $start_time) * 1000;
            $memory_used = memory_get_usage(true) - $memory_before;

            // Record success
            $this->results[$className][$method] = [
                'status' => 'PASSED',
                'execution_time_ms' => $execution_time,
                'memory_used_bytes' => $memory_used,
                'within_performance_limit' => $execution_time < $this->config['performance_limit_ms']
            ];

            echo sprintf("✅ PASSED (%.2fms, %.2fKB)\n", $execution_time, $memory_used / 1024);

        } catch (Exception $e) {
            $execution_time = (microtime(true) - $start_time) * 1000;

            $this->results[$className][$method] = [
                'status' => 'FAILED',
                'execution_time_ms' => $execution_time,
                'error_message' => $e->getMessage()
            ];

            echo sprintf("❌ FAILED (%.2fms): %s\n", $execution_time, $e->getMessage());
        }
    }

    private function generateSummaryReport() {
        $total_time = (microtime(true) - $GLOBALS['total_start_time']) * 1000;
        $memory_used = memory_get_usage(true) - $GLOBALS['memory_start'];

        echo "📊 ISSUE #24 PRECISION VALIDATION SUMMARY\n";
        echo "=" . str_repeat("=", 50) . "\n";

        $total_tests = 0;
        $passed_tests = 0;
        $failed_tests = 0;
        $performance_violations = 0;

        foreach ($this->results as $className => $tests) {
            if (isset($tests['suite_error'])) {
                echo "❌ {$className}: Suite initialization failed\n";
                continue;
            }

            echo "\n📋 {$className}:\n";

            foreach ($tests as $method => $result) {
                $total_tests++;

                if ($result['status'] === 'PASSED') {
                    $passed_tests++;
                    $status_icon = '✅';

                    if (!$result['within_performance_limit']) {
                        $performance_violations++;
                        $status_icon = '⚠️ ';
                    }
                } else {
                    $failed_tests++;
                    $status_icon = '❌';
                }

                echo sprintf("  %s %s (%.2fms)\n",
                    $status_icon, $method, $result['execution_time_ms']);

                if ($result['status'] === 'FAILED') {
                    echo "      Error: " . $result['error_message'] . "\n";
                }
            }
        }

        // Overall statistics
        echo "\n📈 OVERALL STATISTICS:\n";
        echo sprintf("  Total Tests: %d\n", $total_tests);
        echo sprintf("  Passed: %d (%.1f%%)\n", $passed_tests, ($passed_tests / $total_tests) * 100);
        echo sprintf("  Failed: %d (%.1f%%)\n", $failed_tests, ($failed_tests / $total_tests) * 100);
        echo sprintf("  Performance Violations: %d\n", $performance_violations);
        echo sprintf("  Total Execution Time: %.2fms\n", $total_time);
        echo sprintf("  Memory Usage: %.2fMB\n", $memory_used / 1024 / 1024);

        // Precision validation status
        echo "\n🎯 PRECISION VALIDATION STATUS:\n";
        if ($failed_tests === 0) {
            echo "✅ ALL PRECISION TESTS PASSED - ±0.1mm requirement validated\n";
            echo "✅ Issue #24 implementation is PRODUCTION READY\n";
        } else {
            echo "❌ PRECISION VALIDATION FAILED - Review failed tests above\n";
            echo "❌ Issue #24 requires fixes before production deployment\n";
        }

        if ($performance_violations > 0) {
            echo sprintf("⚠️  %d performance violations detected (>%dms)\n",
                $performance_violations, $this->config['performance_limit_ms']);
        }

        // Generate CI/CD compatible output
        $this->generateCiOutput($total_tests, $passed_tests, $failed_tests);

        // Exit with appropriate code
        exit($failed_tests > 0 ? 1 : 0);
    }

    private function generateCiOutput($total, $passed, $failed) {
        $success_rate = ($passed / $total) * 100;

        echo "\n🤖 CI/CD OUTPUT:\n";
        echo "ISSUE_24_TESTS_TOTAL={$total}\n";
        echo "ISSUE_24_TESTS_PASSED={$passed}\n";
        echo "ISSUE_24_TESTS_FAILED={$failed}\n";
        echo "ISSUE_24_SUCCESS_RATE={$success_rate}\n";
        echo "ISSUE_24_STATUS=" . ($failed === 0 ? 'PASSED' : 'FAILED') . "\n";
    }
}

// Execute tests
try {
    $runner = new Issue24TestRunner($test_config);
    $runner->runAllTests();
} catch (Exception $e) {
    echo "💥 CRITICAL ERROR: Test runner failed - " . $e->getMessage() . "\n";
    exit(1);
}
?>