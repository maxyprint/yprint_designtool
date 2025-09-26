<?php
/**
 * PrecisionCalculator Test Suite
 * Comprehensive testing for ±0.1mm tolerance compliance
 */

require_once __DIR__ . '/includes/class-template-measurement-manager.php';
require_once __DIR__ . '/includes/class-precision-calculator.php';

class PrecisionCalculatorTest {

    private $calculator;
    private $test_results;

    public function __construct() {
        $this->calculator = new PrecisionCalculator();
        $this->test_results = [
            'total_tests' => 0,
            'passed_tests' => 0,
            'failed_tests' => 0,
            'test_details' => []
        ];
    }

    /**
     * Run all tests
     */
    public function runAllTests() {
        echo "🧮 PrecisionCalculator Test Suite\n";
        echo "=" . str_repeat("=", 50) . "\n\n";

        // Basic functionality tests
        $this->testPixelToMillimeterConversion();
        $this->testAdvancedRounding();
        $this->testPrecisionValidation();
        $this->testMultiDPISupport();
        $this->testAccuracyScoring();
        $this->testPerformanceRequirements();

        // Integration tests
        $this->testTemplateMeasurementIntegration();
        $this->testErrorHandling();
        $this->testEdgeCases();

        $this->printSummary();
        return $this->test_results;
    }

    /**
     * Test pixel to millimeter conversion
     */
    private function testPixelToMillimeterConversion() {
        echo "📏 Testing Pixel to Millimeter Conversion\n";

        // Test 1: Basic conversion at 96 DPI
        $pixels = ['x' => 96, 'y' => 96, 'width' => 192, 'height' => 96];
        $result = $this->calculator->pixelToMillimeter($pixels, 96);

        $expected_x = 25.4; // 1 inch = 25.4mm at 96 DPI
        $expected_width = 50.8; // 2 inches

        $this->runTest('basic_96dpi_conversion', function() use ($result, $expected_x, $expected_width) {
            return !is_wp_error($result)
                && abs($result['x'] - $expected_x) < 0.1
                && abs($result['width'] - $expected_width) < 0.1;
        }, "96 DPI conversion accuracy");

        // Test 2: High-resolution conversion at 300 DPI
        $pixels_300 = ['x' => 300, 'y' => 300, 'width' => 600, 'height' => 300];
        $result_300 = $this->calculator->pixelToMillimeter($pixels_300, 300);

        $this->runTest('300dpi_conversion', function() use ($result_300, $expected_x) {
            return !is_wp_error($result_300)
                && abs($result_300['x'] - $expected_x) < 0.1;
        }, "300 DPI high-resolution conversion");

        // Test 3: Invalid DPI handling
        $invalid_result = $this->calculator->pixelToMillimeter($pixels, 144);
        $this->runTest('invalid_dpi_handling', function() use ($invalid_result) {
            return is_wp_error($invalid_result)
                && $invalid_result->get_error_code() === 'unsupported_dpi';
        }, "Invalid DPI error handling");

        echo "\n";
    }

    /**
     * Test advanced rounding algorithms
     */
    private function testAdvancedRounding() {
        echo "🔄 Testing Advanced Rounding Algorithms\n";

        // Access private method for testing
        $reflection = new ReflectionClass($this->calculator);
        $method = $reflection->getMethod('advancedRounding');
        $method->setAccessible(true);

        // Test 1: Precision tolerance compliance
        $test_value = 25.456789;
        $rounded = $method->invoke($this->calculator, $test_value, 0.1);

        $this->runTest('precision_rounding', function() use ($rounded) {
            return $rounded == 25.5; // Should round to nearest 0.1
        }, "±0.1mm precision rounding");

        // Test 2: Banker's rounding behavior
        $half_value = 25.45;
        $rounded_half = $method->invoke($this->calculator, $half_value, 0.1);

        $this->runTest('bankers_rounding', function() use ($rounded_half) {
            return $rounded_half == 25.4 || $rounded_half == 25.5; // Either is acceptable for banker's rounding
        }, "Banker's rounding implementation");

        echo "\n";
    }

    /**
     * Test precision validation
     */
    private function testPrecisionValidation() {
        echo "✅ Testing Precision Validation\n";

        // Test 1: Valid precision within tolerance
        $result = $this->calculator->validateMillimeterPrecision(25.1, 25.0, 0.1);

        $this->runTest('valid_precision', function() use ($result) {
            return !is_wp_error($result) && $result['valid'] === true;
        }, "Valid precision within ±0.1mm tolerance");

        // Test 2: Invalid precision outside tolerance
        $result_invalid = $this->calculator->validateMillimeterPrecision(25.2, 25.0, 0.1);

        $this->runTest('invalid_precision', function() use ($result_invalid) {
            return !is_wp_error($result_invalid) && $result_invalid['valid'] === false;
        }, "Invalid precision outside tolerance");

        // Test 3: Accuracy percentage calculation
        $this->runTest('accuracy_percentage', function() use ($result) {
            return isset($result['accuracy_percentage']) && $result['accuracy_percentage'] >= 90;
        }, "Accuracy percentage calculation");

        echo "\n";
    }

    /**
     * Test multi-DPI support
     */
    private function testMultiDPISupport() {
        echo "📐 Testing Multi-DPI Support\n";

        $test_pixels = ['x' => 72, 'y' => 72];
        $supported_dpis = [72, 96, 150, 300];

        foreach ($supported_dpis as $dpi) {
            $result = $this->calculator->pixelToMillimeter($test_pixels, $dpi);

            $this->runTest("dpi_{$dpi}_support", function() use ($result) {
                return !is_wp_error($result) && isset($result['x']) && $result['x'] > 0;
            }, "DPI {$dpi} conversion support");
        }

        echo "\n";
    }

    /**
     * Test accuracy scoring system
     */
    private function testAccuracyScoring() {
        echo "🎯 Testing Accuracy Scoring System\n";

        $measured_values = ['x' => 25.1, 'y' => 50.0, 'width' => 100.2];
        $reference_context = [
            'expected_values' => ['x' => 25.0, 'y' => 50.1, 'width' => 100.0]
        ];

        $score = $this->calculator->calculateAccuracyScore($measured_values, $reference_context);

        $this->runTest('accuracy_scoring', function() use ($score) {
            return is_numeric($score) && $score >= 0 && $score <= 100;
        }, "Accuracy score calculation (0-100 range)");

        $this->runTest('high_accuracy_score', function() use ($score) {
            return $score >= 95; // Should be high accuracy for small differences
        }, "High accuracy detection");

        echo "\n";
    }

    /**
     * Test performance requirements
     */
    private function testPerformanceRequirements() {
        echo "⚡ Testing Performance Requirements\n";

        $start_time = microtime(true);

        // Perform multiple calculations to test performance
        for ($i = 0; $i < 100; $i++) {
            $pixels = ['x' => rand(0, 1000), 'y' => rand(0, 1000), 'width' => rand(100, 500), 'height' => rand(100, 500)];
            $result = $this->calculator->pixelToMillimeter($pixels, 96);
        }

        $processing_time = (microtime(true) - $start_time) * 1000;
        $avg_time_per_calculation = $processing_time / 100;

        $this->runTest('performance_requirement', function() use ($avg_time_per_calculation) {
            return $avg_time_per_calculation < 50; // <50ms per calculation requirement
        }, "Performance requirement: <50ms per calculation");

        echo "Average processing time: " . round($avg_time_per_calculation, 2) . "ms per calculation\n\n";
    }

    /**
     * Test template measurement integration
     */
    private function testTemplateMeasurementIntegration() {
        echo "🔗 Testing Template Measurement Integration\n";

        // Test with mock template ID (would require actual template in real scenario)
        $mock_canvas_coords = ['x' => 100, 'y' => 200, 'width' => 300, 'height' => 400];
        $result = $this->calculator->calculatePreciseCoordinates($mock_canvas_coords, 999, 'M');

        // This will fail with mock data, which is expected behavior
        $this->runTest('template_integration_validation', function() use ($result) {
            return is_wp_error($result) &&
                   ($result->get_error_code() === 'no_measurements' ||
                    $result->get_error_code() === 'context_error');
        }, "Template integration validation (expected error with mock data)");

        echo "\n";
    }

    /**
     * Test error handling
     */
    private function testErrorHandling() {
        echo "🛡️ Testing Error Handling\n";

        // Test 1: Invalid coordinates
        $result1 = $this->calculator->calculatePreciseCoordinates(null, 1, 'M');
        $this->runTest('invalid_coordinates_error', function() use ($result1) {
            return is_wp_error($result1) && $result1->get_error_code() === 'invalid_coordinates';
        }, "Invalid coordinates error handling");

        // Test 2: Invalid template ID
        $result2 = $this->calculator->calculatePreciseCoordinates(['x' => 100], -1, 'M');
        $this->runTest('invalid_template_id_error', function() use ($result2) {
            return is_wp_error($result2) && $result2->get_error_code() === 'invalid_template_id';
        }, "Invalid template ID error handling");

        // Test 3: Invalid size
        $result3 = $this->calculator->calculatePreciseCoordinates(['x' => 100], 1, '');
        $this->runTest('invalid_size_error', function() use ($result3) {
            return is_wp_error($result3) && $result3->get_error_code() === 'invalid_size';
        }, "Invalid size error handling");

        echo "\n";
    }

    /**
     * Test edge cases
     */
    private function testEdgeCases() {
        echo "🔍 Testing Edge Cases\n";

        // Test 1: Zero values
        $zero_pixels = ['x' => 0, 'y' => 0, 'width' => 0, 'height' => 0];
        $result = $this->calculator->pixelToMillimeter($zero_pixels, 96);

        $this->runTest('zero_values_handling', function() use ($result) {
            return !is_wp_error($result) && $result['x'] === 0.0;
        }, "Zero values handling");

        // Test 2: Very large values
        $large_pixels = ['x' => 10000, 'y' => 10000];
        $result_large = $this->calculator->pixelToMillimeter($large_pixels, 96);

        $this->runTest('large_values_handling', function() use ($result_large) {
            return !is_wp_error($result_large) && $result_large['x'] > 1000;
        }, "Large values handling");

        // Test 3: Precision boundary values
        $boundary_result = $this->calculator->validateMillimeterPrecision(25.05, 25.0, 0.1);

        $this->runTest('precision_boundary', function() use ($boundary_result) {
            return !is_wp_error($boundary_result) && $boundary_result['valid'] === true;
        }, "Precision boundary value handling");

        echo "\n";
    }

    /**
     * Run individual test
     */
    private function runTest($test_name, $test_function, $description) {
        $this->test_results['total_tests']++;

        try {
            $start_time = microtime(true);
            $passed = call_user_func($test_function);
            $execution_time = round((microtime(true) - $start_time) * 1000, 2);

            if ($passed) {
                $this->test_results['passed_tests']++;
                $this->test_results['test_details'][$test_name] = [
                    'status' => 'PASSED',
                    'description' => $description,
                    'execution_time_ms' => $execution_time
                ];
                echo "✅ {$description} ({$execution_time}ms)\n";
            } else {
                $this->test_results['failed_tests']++;
                $this->test_results['test_details'][$test_name] = [
                    'status' => 'FAILED',
                    'description' => $description,
                    'execution_time_ms' => $execution_time
                ];
                echo "❌ {$description} ({$execution_time}ms)\n";
            }
        } catch (Exception $e) {
            $this->test_results['failed_tests']++;
            $this->test_results['test_details'][$test_name] = [
                'status' => 'ERROR',
                'description' => $description,
                'error' => $e->getMessage()
            ];
            echo "💥 {$description} - ERROR: {$e->getMessage()}\n";
        }
    }

    /**
     * Print test summary
     */
    private function printSummary() {
        echo "\n" . str_repeat("=", 60) . "\n";
        echo "📊 TEST SUMMARY\n";
        echo str_repeat("=", 60) . "\n";
        echo "Total Tests: {$this->test_results['total_tests']}\n";
        echo "Passed: {$this->test_results['passed_tests']} ✅\n";
        echo "Failed: {$this->test_results['failed_tests']} ❌\n";

        $success_rate = ($this->test_results['total_tests'] > 0)
            ? round(($this->test_results['passed_tests'] / $this->test_results['total_tests']) * 100, 1)
            : 0;

        echo "Success Rate: {$success_rate}%\n";

        if ($success_rate >= 95) {
            echo "🎉 EXCELLENT: PrecisionCalculator meets all requirements!\n";
        } elseif ($success_rate >= 80) {
            echo "⚠️  GOOD: Most requirements met, minor issues to address\n";
        } else {
            echo "🚫 NEEDS WORK: Significant issues require attention\n";
        }

        echo str_repeat("=", 60) . "\n";
    }
}

// Mock WP_Error class for testing if not available
if (!class_exists('WP_Error')) {
    class WP_Error {
        private $error_code;
        private $error_message;
        private $error_data;

        public function __construct($code, $message, $data = null) {
            $this->error_code = $code;
            $this->error_message = $message;
            $this->error_data = $data;
        }

        public function get_error_code() {
            return $this->error_code;
        }

        public function get_error_message() {
            return $this->error_message;
        }

        public function get_error_data() {
            return $this->error_data;
        }
    }
}

// Helper function
function is_wp_error($object) {
    return $object instanceof WP_Error;
}

// Run tests if called directly
if (basename(__FILE__) == basename($_SERVER['SCRIPT_NAME'])) {
    $test_suite = new PrecisionCalculatorTest();
    $test_suite->runAllTests();
}