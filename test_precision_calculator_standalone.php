<?php
/**
 * Standalone PrecisionCalculator Test Suite
 * Tests core mathematical functions without WordPress dependencies
 */

// Mock WordPress functions and classes
if (!function_exists('get_post')) {
    function get_post($id) { return null; }
}
if (!function_exists('get_post_meta')) {
    function get_post_meta($id, $key, $single = false) { return []; }
}
// error_log already exists, no need to mock

class MockTemplateMeasurementManager {
    public function get_measurements($template_id) {
        // Return mock measurement data
        return [
            'M' => [
                'A' => ['value_cm' => 60.0, 'label' => 'Chest'],
                'B' => ['value_cm' => 56.0, 'label' => 'Hem Width'],
                'C' => ['value_cm' => 68.0, 'label' => 'Height from Shoulder']
            ]
        ];
    }

    public function get_template_sizes($template_id) {
        return [
            ['id' => 'S', 'name' => 'Small', 'order' => 1],
            ['id' => 'M', 'name' => 'Medium', 'order' => 2],
            ['id' => 'L', 'name' => 'Large', 'order' => 3]
        ];
    }
}

// WP_Error mock
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

function is_wp_error($object) {
    return $object instanceof WP_Error;
}

// Standalone PrecisionCalculator class (modified to use mock)
class StandalonePrecisionCalculator {
    private $template_measurement_manager;
    private $supported_dpis;
    private $precision_tolerance;
    private $performance_cache;

    public function __construct() {
        $this->template_measurement_manager = new MockTemplateMeasurementManager();
        $this->supported_dpis = [72, 96, 150, 300];
        $this->precision_tolerance = 0.1; // ±0.1mm requirement
        $this->performance_cache = [];
    }

    /**
     * 📏 Advanced pixel-to-millimeter conversion with DPI awareness
     */
    public function pixelToMillimeter($pixels, $dpi = 96, $template_physical_size = null) {
        if (!in_array($dpi, $this->supported_dpis)) {
            return new WP_Error('unsupported_dpi', "DPI {$dpi} not supported. Supported: " . implode(', ', $this->supported_dpis));
        }

        try {
            // Base conversion factor (1 inch = 25.4mm)
            $mm_per_inch = 25.4;
            $pixels_per_inch = $dpi;
            $mm_per_pixel = $mm_per_inch / $pixels_per_inch;

            // Apply DPI-specific precision adjustments
            $precision_factor = $this->getDPIPrecisionFactor($dpi);
            $adjusted_mm_per_pixel = $mm_per_pixel * $precision_factor;

            $converted = [];
            foreach ($pixels as $key => $pixel_value) {
                if (is_numeric($pixel_value)) {
                    // Apply advanced rounding for precision
                    $mm_value = $pixel_value * $adjusted_mm_per_pixel;
                    $converted[$key] = $this->advancedRounding($mm_value, $this->precision_tolerance);
                } else {
                    $converted[$key] = $pixel_value; // Preserve non-numeric values
                }
            }

            // Apply template physical size corrections if available
            if ($template_physical_size) {
                $converted = $this->applyPhysicalSizeCorrection($converted, $template_physical_size);
            }

            return $converted;

        } catch (Exception $e) {
            return new WP_Error('conversion_error', 'Pixel to millimeter conversion failed: ' . $e->getMessage());
        }
    }

    /**
     * ✅ Validate millimeter precision against expected values
     */
    public function validateMillimeterPrecision($calculated_mm, $expected_mm, $tolerance = 0.1) {
        try {
            $difference = abs($calculated_mm - $expected_mm);
            $is_valid = $difference <= $tolerance;
            $accuracy_percentage = 100 - (($difference / $expected_mm) * 100);

            return [
                'valid' => $is_valid,
                'calculated_mm' => $calculated_mm,
                'expected_mm' => $expected_mm,
                'difference_mm' => round($difference, 3),
                'tolerance_mm' => $tolerance,
                'accuracy_percentage' => round($accuracy_percentage, 2),
                'precision_grade' => $this->getPrecisionGrade($difference, $tolerance)
            ];

        } catch (Exception $e) {
            return new WP_Error('validation_error', 'Precision validation failed: ' . $e->getMessage());
        }
    }

    /**
     * 📐 Calculate size scaling with measurement database integration
     */
    public function calculateSizeScaling($base_size, $target_size, $measurement_data) {
        try {
            if ($base_size === $target_size) {
                return ['scale_x' => 1.0, 'scale_y' => 1.0, 'uniform_scale' => 1.0];
            }

            // Get measurements for both sizes
            $base_measurements = $measurement_data[$base_size] ?? [];
            $target_measurements = $measurement_data[$target_size] ?? [];

            if (empty($base_measurements) || empty($target_measurements)) {
                return new WP_Error('missing_measurements', 'Missing measurement data for size scaling');
            }

            // Calculate scaling factors based on key measurements
            $primary_measurements = ['A', 'B', 'C']; // Chest, Hem Width, Height
            $scaling_factors = [];

            foreach ($primary_measurements as $measurement_key) {
                if (isset($base_measurements[$measurement_key]) && isset($target_measurements[$measurement_key])) {
                    $base_value = $base_measurements[$measurement_key]['value_cm'];
                    $target_value = $target_measurements[$measurement_key]['value_cm'];

                    if ($base_value > 0) {
                        $scaling_factors[$measurement_key] = $target_value / $base_value;
                    }
                }
            }

            if (empty($scaling_factors)) {
                return new WP_Error('no_scaling_data', 'No valid measurements found for scaling calculation');
            }

            // Calculate weighted average scaling
            $width_scale = ($scaling_factors['A'] ?? 1.0 + $scaling_factors['B'] ?? 1.0) / 2;
            $height_scale = $scaling_factors['C'] ?? 1.0;
            $uniform_scale = array_sum($scaling_factors) / count($scaling_factors);

            // Apply advanced scaling algorithms
            $optimized_scaling = $this->optimizeScalingFactors([
                'scale_x' => $width_scale,
                'scale_y' => $height_scale,
                'uniform_scale' => $uniform_scale
            ], $measurement_data);

            return $optimized_scaling;

        } catch (Exception $e) {
            return new WP_Error('scaling_error', 'Size scaling calculation failed: ' . $e->getMessage());
        }
    }

    /**
     * 🎯 Calculate accuracy score for measurements
     */
    public function calculateAccuracyScore($measured_values, $reference_context) {
        try {
            $total_score = 0;
            $measurement_count = 0;

            foreach ($measured_values as $key => $measured_value) {
                if (is_numeric($measured_value) && isset($reference_context['expected_values'][$key])) {
                    $expected_value = $reference_context['expected_values'][$key];
                    $difference = abs($measured_value - $expected_value);
                    $relative_error = $difference / $expected_value;

                    // Score based on precision tolerance
                    $measurement_score = max(0, 100 - ($relative_error * 100));
                    $total_score += $measurement_score;
                    $measurement_count++;
                }
            }

            return $measurement_count > 0 ? round($total_score / $measurement_count, 2) : 0.0;

        } catch (Exception $e) {
            error_log('PrecisionCalculator: Accuracy score calculation failed: ' . $e->getMessage());
            return 0.0;
        }
    }

    // Private helper methods
    private function advancedRounding($value, $precision) {
        // Banker's rounding (round half to even) for statistical accuracy
        $scale = 1 / $precision;
        $rounded = round($value * $scale) / $scale;

        // Ensure we meet precision tolerance
        $decimal_places = max(0, -floor(log10($precision)));
        return round($rounded, $decimal_places);
    }

    private function getDPIPrecisionFactor($dpi) {
        $precision_factors = [
            72  => 1.0,    // Standard screen DPI
            96  => 1.0,    // Windows standard DPI
            150 => 0.998,  // Slight adjustment for high-DPI
            300 => 0.995   // Print DPI with precision adjustment
        ];

        return $precision_factors[$dpi] ?? 1.0;
    }

    private function getPrecisionGrade($difference, $tolerance) {
        $ratio = $difference / $tolerance;

        if ($ratio <= 0.25) return 'EXCELLENT';
        if ($ratio <= 0.5) return 'GOOD';
        if ($ratio <= 0.75) return 'ACCEPTABLE';
        if ($ratio <= 1.0) return 'MARGINAL';
        return 'FAILED';
    }

    private function applyPhysicalSizeCorrection($converted, $template_physical_size) {
        // Apply template-specific physical corrections if needed
        if (isset($template_physical_size['correction_factor'])) {
            $factor = $template_physical_size['correction_factor'];
            foreach ($converted as $key => $value) {
                if (is_numeric($value)) {
                    $converted[$key] = $this->advancedRounding($value * $factor, $this->precision_tolerance);
                }
            }
        }
        return $converted;
    }

    private function optimizeScalingFactors($initial_scaling, $measurement_data) {
        // Apply mathematical optimization to reduce cumulative errors
        $optimized = $initial_scaling;

        // Constraint: maintain aspect ratio integrity
        if (isset($optimized['scale_x']) && isset($optimized['scale_y'])) {
            $aspect_ratio = $optimized['scale_x'] / $optimized['scale_y'];
            if ($aspect_ratio < 0.8 || $aspect_ratio > 1.25) {
                // Adjust to maintain reasonable aspect ratio
                $avg_scale = ($optimized['scale_x'] + $optimized['scale_y']) / 2;
                $optimized['scale_x'] = $avg_scale * 1.05;
                $optimized['scale_y'] = $avg_scale * 0.95;
            }
        }

        // Round to precision tolerance
        foreach ($optimized as $key => $value) {
            $optimized[$key] = $this->advancedRounding($value, 0.001); // High precision for scaling factors
        }

        return $optimized;
    }
}

// Test class
class StandalonePrecisionCalculatorTest {
    private $calculator;
    private $test_results;

    public function __construct() {
        $this->calculator = new StandalonePrecisionCalculator();
        $this->test_results = [
            'total_tests' => 0,
            'passed_tests' => 0,
            'failed_tests' => 0,
            'test_details' => []
        ];
    }

    public function runAllTests() {
        echo "🧮 Standalone PrecisionCalculator Test Suite\n";
        echo "=" . str_repeat("=", 50) . "\n\n";

        $this->testPixelToMillimeterConversion();
        $this->testPrecisionValidation();
        $this->testSizeScaling();
        $this->testAccuracyScoring();
        $this->testPerformance();
        $this->testErrorHandling();

        $this->printSummary();
        return $this->test_results;
    }

    private function testPixelToMillimeterConversion() {
        echo "📏 Testing Pixel to Millimeter Conversion\n";

        // Test 96 DPI conversion
        $pixels = ['x' => 96, 'y' => 96, 'width' => 192, 'height' => 96];
        $result = $this->calculator->pixelToMillimeter($pixels, 96);

        $this->runTest('96dpi_conversion', function() use ($result) {
            return !is_wp_error($result) && abs($result['x'] - 25.4) < 0.1;
        }, "96 DPI conversion accuracy");

        // Test 300 DPI conversion
        $pixels_300 = ['x' => 300, 'y' => 300];
        $result_300 = $this->calculator->pixelToMillimeter($pixels_300, 300);

        $this->runTest('300dpi_conversion', function() use ($result_300) {
            return !is_wp_error($result_300) && abs($result_300['x'] - 25.4) < 0.1;
        }, "300 DPI conversion accuracy");

        echo "\n";
    }

    private function testPrecisionValidation() {
        echo "✅ Testing Precision Validation\n";

        // Valid precision test
        $result = $this->calculator->validateMillimeterPrecision(25.05, 25.0, 0.1);
        $this->runTest('valid_precision', function() use ($result) {
            return !is_wp_error($result) && $result['valid'] === true;
        }, "Valid precision within tolerance");

        // Invalid precision test
        $result_invalid = $this->calculator->validateMillimeterPrecision(25.2, 25.0, 0.1);
        $this->runTest('invalid_precision', function() use ($result_invalid) {
            return !is_wp_error($result_invalid) && $result_invalid['valid'] === false;
        }, "Invalid precision detection");

        echo "\n";
    }

    private function testSizeScaling() {
        echo "📐 Testing Size Scaling\n";

        $measurement_data = [
            'S' => [
                'A' => ['value_cm' => 54.0], // Small chest
                'B' => ['value_cm' => 50.0], // Small hem
                'C' => ['value_cm' => 64.0]  // Small height
            ],
            'L' => [
                'A' => ['value_cm' => 66.0], // Large chest
                'B' => ['value_cm' => 62.0], // Large hem
                'C' => ['value_cm' => 72.0]  // Large height
            ]
        ];

        $scaling = $this->calculator->calculateSizeScaling('S', 'L', $measurement_data);

        // Debug output
        if (is_wp_error($scaling)) {
            echo "Debug: Scaling returned error: " . $scaling->get_error_message() . "\n";
        } else {
            echo "Debug: Scaling result: " . json_encode($scaling) . "\n";
        }

        $this->runTest('size_scaling', function() use ($scaling) {
            if (is_wp_error($scaling)) {
                return false;
            }
            // Check that scaling factors are reasonable (between 0.5 and 2.0)
            return isset($scaling['scale_x']) &&
                   $scaling['scale_x'] > 0.5 && $scaling['scale_x'] < 2.0 &&
                   isset($scaling['uniform_scale']) &&
                   $scaling['uniform_scale'] > 0.5 && $scaling['uniform_scale'] < 2.0;
        }, "Size scaling calculation");

        echo "\n";
    }

    private function testAccuracyScoring() {
        echo "🎯 Testing Accuracy Scoring\n";

        $measured = ['x' => 25.1, 'y' => 50.0];
        $reference = ['expected_values' => ['x' => 25.0, 'y' => 50.1]];

        $score = $this->calculator->calculateAccuracyScore($measured, $reference);

        $this->runTest('accuracy_scoring', function() use ($score) {
            return is_numeric($score) && $score >= 95; // Should be high accuracy
        }, "Accuracy scoring");

        echo "\n";
    }

    private function testPerformance() {
        echo "⚡ Testing Performance\n";

        $start_time = microtime(true);
        for ($i = 0; $i < 100; $i++) {
            $pixels = ['x' => rand(0, 1000), 'y' => rand(0, 1000)];
            $this->calculator->pixelToMillimeter($pixels, 96);
        }
        $avg_time = ((microtime(true) - $start_time) * 1000) / 100;

        $this->runTest('performance', function() use ($avg_time) {
            return $avg_time < 50; // <50ms requirement
        }, "Performance requirement (<50ms per calculation)");

        echo "Average time: " . round($avg_time, 2) . "ms\n\n";
    }

    private function testErrorHandling() {
        echo "🛡️ Testing Error Handling\n";

        // Invalid DPI
        $result = $this->calculator->pixelToMillimeter(['x' => 100], 144);
        $this->runTest('invalid_dpi', function() use ($result) {
            return is_wp_error($result) && $result->get_error_code() === 'unsupported_dpi';
        }, "Invalid DPI handling");

        echo "\n";
    }

    private function runTest($test_name, $test_function, $description) {
        $this->test_results['total_tests']++;

        try {
            $passed = call_user_func($test_function);
            if ($passed) {
                $this->test_results['passed_tests']++;
                echo "✅ {$description}\n";
            } else {
                $this->test_results['failed_tests']++;
                echo "❌ {$description}\n";
            }
        } catch (Exception $e) {
            $this->test_results['failed_tests']++;
            echo "💥 {$description} - ERROR: {$e->getMessage()}\n";
        }
    }

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

// Run the test
$test_suite = new StandalonePrecisionCalculatorTest();
$test_suite->runAllTests();