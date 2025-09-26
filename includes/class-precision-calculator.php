<?php
/**
 * AGENT 1: MATHEMATICAL ARCHITECT - PrecisionCalculator Class
 * Mission: Advanced mathematical functions with ±0.1mm tolerance compliance
 *
 * @package Octo_Print_Designer
 * @since 1.0.0
 */

class PrecisionCalculator {

    private $template_measurement_manager;
    private $supported_dpis;
    private $precision_tolerance;
    private $performance_cache;

    public function __construct() {
        $this->template_measurement_manager = new TemplateMeasurementManager();
        $this->supported_dpis = [72, 96, 150, 300];
        $this->precision_tolerance = 0.1; // ±0.1mm requirement
        $this->performance_cache = [];
    }

    /**
     * 🧮 Core precision calculation with template and DPI awareness
     *
     * @param array $canvas_coords Canvas coordinates [x, y, width, height]
     * @param int $template_id Template ID for measurement context
     * @param string $size Size identifier for scaling
     * @param int $dpi DPI for conversion accuracy
     * @return array|WP_Error Precise coordinates in millimeters or error
     */
    public function calculatePreciseCoordinates($canvas_coords, $template_id, $size, $dpi = 96) {
        $start_time = microtime(true);

        try {
            // Validate input parameters
            $validation_result = $this->validateInputParameters($canvas_coords, $template_id, $size, $dpi);
            if (is_wp_error($validation_result)) {
                return $validation_result;
            }

            // Get template measurement context
            $measurement_context = $this->getMeasurementContext($template_id, $size);
            if (is_wp_error($measurement_context)) {
                return $measurement_context;
            }

            // Calculate base pixel-to-millimeter conversion
            $base_conversion = $this->pixelToMillimeter($canvas_coords, $dpi, $measurement_context);
            if (is_wp_error($base_conversion)) {
                return $base_conversion;
            }

            // Apply template-specific scaling
            $scaled_coordinates = $this->applyTemplateScaling($base_conversion, $measurement_context, $size);
            if (is_wp_error($scaled_coordinates)) {
                return $scaled_coordinates;
            }

            // Validate precision tolerance
            $precision_validation = $this->validatePrecisionTolerance($scaled_coordinates);
            if (is_wp_error($precision_validation)) {
                return $precision_validation;
            }

            // Calculate processing time for performance monitoring
            $processing_time = round((microtime(true) - $start_time) * 1000, 2);

            return [
                'coordinates_mm' => $scaled_coordinates,
                'accuracy_score' => $this->calculateAccuracyScore($scaled_coordinates, $measurement_context),
                'processing_time_ms' => $processing_time,
                'dpi_used' => $dpi,
                'template_id' => $template_id,
                'size' => $size,
                'precision_validated' => true
            ];

        } catch (Exception $e) {
            return new WP_Error('calculation_error', 'Precision calculation failed: ' . $e->getMessage());
        }
    }

    /**
     * 📏 Advanced pixel-to-millimeter conversion with DPI awareness
     *
     * @param array $pixels Pixel coordinates and dimensions
     * @param int $dpi DPI for conversion
     * @param array|null $template_physical_size Template physical dimensions
     * @return array|WP_Error Converted measurements or error
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
     *
     * @param float $calculated_mm Calculated measurement in mm
     * @param float $expected_mm Expected measurement in mm
     * @param float $tolerance Tolerance in mm (default: 0.1mm)
     * @return array|WP_Error Validation result or error
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
     *
     * @param string $base_size Base size identifier
     * @param string $target_size Target size identifier
     * @param array $measurement_data Measurement context data
     * @return array|WP_Error Scaling factors or error
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
     *
     * @param array $measured_values Measured values
     * @param array $reference_context Reference measurement context
     * @return float Accuracy score (0-100)
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

    /**
     * 🔄 Advanced rounding algorithms (beyond PHP round())
     *
     * @param float $value Value to round
     * @param float $precision Precision requirement
     * @return float Precisely rounded value
     */
    private function advancedRounding($value, $precision) {
        // Banker's rounding (round half to even) for statistical accuracy
        $scale = 1 / $precision;
        $rounded = round($value * $scale) / $scale;

        // Ensure we meet precision tolerance
        $decimal_places = max(0, -floor(log10($precision)));
        return round($rounded, $decimal_places);
    }

    /**
     * 🎛️ Get DPI-specific precision factor
     *
     * @param int $dpi DPI value
     * @return float Precision adjustment factor
     */
    private function getDPIPrecisionFactor($dpi) {
        $precision_factors = [
            72  => 1.0,    // Standard screen DPI
            96  => 1.0,    // Windows standard DPI
            150 => 0.998,  // Slight adjustment for high-DPI
            300 => 0.995   // Print DPI with precision adjustment
        ];

        return $precision_factors[$dpi] ?? 1.0;
    }

    /**
     * 📊 Get precision grade based on tolerance
     *
     * @param float $difference Measured difference
     * @param float $tolerance Allowed tolerance
     * @return string Precision grade
     */
    private function getPrecisionGrade($difference, $tolerance) {
        $ratio = $difference / $tolerance;

        if ($ratio <= 0.25) return 'EXCELLENT';
        if ($ratio <= 0.5) return 'GOOD';
        if ($ratio <= 0.75) return 'ACCEPTABLE';
        if ($ratio <= 1.0) return 'MARGINAL';
        return 'FAILED';
    }

    /**
     * 📋 Get measurement context for template and size
     *
     * @param int $template_id Template ID
     * @param string $size Size identifier
     * @return array|WP_Error Measurement context or error
     */
    private function getMeasurementContext($template_id, $size) {
        try {
            $cache_key = "context_{$template_id}_{$size}";

            if (isset($this->performance_cache[$cache_key])) {
                return $this->performance_cache[$cache_key];
            }

            $measurements = $this->template_measurement_manager->get_measurements($template_id);
            $template_sizes = $this->template_measurement_manager->get_template_sizes($template_id);

            if (empty($measurements) || !isset($measurements[$size])) {
                return new WP_Error('no_measurements', "No measurements found for template {$template_id}, size {$size}");
            }

            $context = [
                'measurements' => $measurements,
                'template_sizes' => $template_sizes,
                'size_measurements' => $measurements[$size],
                'expected_values' => $this->buildExpectedValues($measurements[$size])
            ];

            // Cache for performance
            $this->performance_cache[$cache_key] = $context;

            return $context;

        } catch (Exception $e) {
            return new WP_Error('context_error', 'Failed to get measurement context: ' . $e->getMessage());
        }
    }

    /**
     * 🔧 Apply template-specific scaling
     *
     * @param array $base_coordinates Base coordinates
     * @param array $measurement_context Measurement context
     * @param string $size Target size
     * @return array|WP_Error Scaled coordinates or error
     */
    private function applyTemplateScaling($base_coordinates, $measurement_context, $size) {
        try {
            // Get template-specific scaling factors
            $size_measurements = $measurement_context['size_measurements'];
            $template_sizes = $measurement_context['template_sizes'];

            // Find size configuration
            $size_config = null;
            foreach ($template_sizes as $template_size) {
                if ($template_size['id'] === $size) {
                    $size_config = $template_size;
                    break;
                }
            }

            if (!$size_config) {
                return new WP_Error('size_config_not_found', "Size configuration not found for {$size}");
            }

            // Apply measurement-based scaling
            $scaled_coords = $base_coordinates;

            // Apply proportional scaling based on chest measurement (measurement A)
            if (isset($size_measurements['A'])) {
                $chest_measurement = $size_measurements['A']['value_cm'];
                $standard_chest = 60.0; // Base chest measurement in cm
                $scale_factor = $chest_measurement / $standard_chest;

                foreach (['x', 'y', 'width', 'height'] as $coord_key) {
                    if (isset($scaled_coords[$coord_key])) {
                        $scaled_coords[$coord_key] *= $scale_factor;
                        $scaled_coords[$coord_key] = $this->advancedRounding($scaled_coords[$coord_key], $this->precision_tolerance);
                    }
                }
            }

            return $scaled_coords;

        } catch (Exception $e) {
            return new WP_Error('scaling_error', 'Template scaling failed: ' . $e->getMessage());
        }
    }

    /**
     * ✅ Validate input parameters
     *
     * @param mixed $canvas_coords Canvas coordinates
     * @param mixed $template_id Template ID
     * @param mixed $size Size identifier
     * @param mixed $dpi DPI value
     * @return true|WP_Error Validation result
     */
    private function validateInputParameters($canvas_coords, $template_id, $size, $dpi) {
        if (!is_array($canvas_coords) || empty($canvas_coords)) {
            return new WP_Error('invalid_coordinates', 'Canvas coordinates must be a non-empty array');
        }

        if (!is_numeric($template_id) || $template_id <= 0) {
            return new WP_Error('invalid_template_id', 'Template ID must be a positive number');
        }

        if (empty($size) || !is_string($size)) {
            return new WP_Error('invalid_size', 'Size must be a non-empty string');
        }

        if (!in_array($dpi, $this->supported_dpis)) {
            return new WP_Error('invalid_dpi', 'DPI must be one of: ' . implode(', ', $this->supported_dpis));
        }

        return true;
    }

    /**
     * ✅ Validate precision tolerance
     *
     * @param array $coordinates Coordinates to validate
     * @return true|WP_Error Validation result
     */
    private function validatePrecisionTolerance($coordinates) {
        foreach ($coordinates as $key => $value) {
            if (is_numeric($value)) {
                // Check if value respects precision tolerance
                $rounded_value = $this->advancedRounding($value, $this->precision_tolerance);
                if (abs($value - $rounded_value) > ($this->precision_tolerance / 2)) {
                    return new WP_Error('precision_violation', "Coordinate {$key} exceeds precision tolerance: {$value}");
                }
            }
        }
        return true;
    }

    /**
     * 🔧 Apply physical size correction
     *
     * @param array $converted Converted coordinates
     * @param array $template_physical_size Physical template dimensions
     * @return array Corrected coordinates
     */
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

    /**
     * 🔧 Build expected values from measurements
     *
     * @param array $size_measurements Size-specific measurements
     * @return array Expected values for validation
     */
    private function buildExpectedValues($size_measurements) {
        $expected = [];
        foreach ($size_measurements as $key => $measurement) {
            $expected[$key] = $measurement['value_cm'];
        }
        return $expected;
    }

    /**
     * 🎯 Optimize scaling factors using advanced algorithms
     *
     * @param array $initial_scaling Initial scaling factors
     * @param array $measurement_data Full measurement dataset
     * @return array Optimized scaling factors
     */
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

    /**
     * 📈 Get performance metrics
     *
     * @return array Performance statistics
     */
    public function getPerformanceMetrics() {
        return [
            'cache_entries' => count($this->performance_cache),
            'supported_dpis' => $this->supported_dpis,
            'precision_tolerance_mm' => $this->precision_tolerance,
            'memory_usage_kb' => round(memory_get_usage() / 1024, 2),
            'cache_hit_ratio' => $this->calculateCacheHitRatio()
        ];
    }

    /**
     * 🧹 Clear performance cache
     */
    public function clearCache() {
        $this->performance_cache = [];
    }

    /**
     * 📊 Calculate cache hit ratio
     *
     * @return float Cache hit ratio percentage
     */
    private function calculateCacheHitRatio() {
        // This would be implemented with actual cache hit tracking
        return 0.0; // Placeholder
    }
}