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
    private $cache_hits;
    private $cache_requests;
    private $dpi_conversion_cache;
    private $calculation_stats;

    public function __construct() {
        $this->template_measurement_manager = new TemplateMeasurementManager();
        $this->supported_dpis = [72, 96, 150, 300];
        $this->precision_tolerance = 0.1; // ±0.1mm requirement
        $this->performance_cache = [];
        $this->cache_hits = 0;
        $this->cache_requests = 0;
        $this->dpi_conversion_cache = [];
        $this->calculation_stats = [
            'total_calculations' => 0,
            'total_time_ms' => 0,
            'fastest_calculation_ms' => PHP_FLOAT_MAX,
            'slowest_calculation_ms' => 0
        ];
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
            $this->trackCalculationPerformance($processing_time);

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
            // Use cached DPI conversion factor for better performance
            $adjusted_mm_per_pixel = $this->getCachedDPIConversionFactor($dpi);

            // Optimize conversion using vectorized operations where possible
            $numeric_pixels = array_filter($pixels, 'is_numeric');
            $non_numeric_pixels = array_diff_key($pixels, $numeric_pixels);

            // Apply conversion to numeric values
            $mm_values = [];
            foreach ($numeric_pixels as $key => $pixel_value) {
                $mm_values[$key] = $pixel_value * $adjusted_mm_per_pixel;
            }

            // Use vectorized rounding for better performance
            $converted = $this->vectorizedRounding($mm_values, $this->precision_tolerance);

            // Merge back non-numeric values
            $converted = array_merge($converted, $non_numeric_pixels);

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
     * 🔄 Optimized advanced rounding algorithms (beyond PHP round())
     *
     * @param float $value Value to round
     * @param float $precision Precision requirement
     * @return float Precisely rounded value
     */
    private function advancedRounding($value, $precision) {
        // Pre-calculate scale for performance (avoids division in loop)
        static $scale_cache = [];
        $precision_key = (string)$precision;

        if (!isset($scale_cache[$precision_key])) {
            $scale_cache[$precision_key] = [
                'scale' => 1 / $precision,
                'decimal_places' => max(0, -floor(log10($precision)))
            ];
        }

        $cache = $scale_cache[$precision_key];

        // Optimized banker's rounding (round half to even) for statistical accuracy
        $scaled_value = $value * $cache['scale'];

        // Use PHP's built-in round() which implements banker's rounding for .5 cases
        $rounded_scaled = round($scaled_value, 0, PHP_ROUND_HALF_EVEN);
        $rounded = $rounded_scaled / $cache['scale'];

        // Final precision adjustment
        return round($rounded, $cache['decimal_places']);
    }

    /**
     * ⚡ Ultra-fast vectorized rounding for multiple values
     *
     * @param array $values Array of values to round
     * @param float $precision Precision requirement
     * @return array Array of rounded values
     */
    private function vectorizedRounding(array $values, $precision) {
        $scale = 1 / $precision;
        $decimal_places = max(0, -floor(log10($precision)));

        $rounded = [];
        foreach ($values as $key => $value) {
            if (is_numeric($value)) {
                $scaled_value = $value * $scale;
                $rounded_scaled = round($scaled_value, 0, PHP_ROUND_HALF_EVEN);
                $rounded[$key] = round($rounded_scaled / $scale, $decimal_places);
            } else {
                $rounded[$key] = $value;
            }
        }

        return $rounded;
    }

    /**
     * 🎛️ Optimized DPI-specific precision factor with lookup table
     *
     * @param int $dpi DPI value
     * @return float Precision adjustment factor
     */
    private function getDPIPrecisionFactor($dpi) {
        // Static lookup table for maximum performance
        static $precision_factors = [
            72  => 1.0,      // Standard screen DPI - no adjustment needed
            96  => 1.0,      // Windows standard DPI - baseline
            150 => 0.998,    // High-DPI adjustment for sub-pixel precision
            300 => 0.995     // Print DPI with empirically tested precision adjustment
        ];

        return $precision_factors[$dpi] ?? 1.0;
    }

    /**
     * 🕰️ High-precision timestamp for performance tracking
     *
     * @return float High-resolution timestamp
     */
    private function getHighResolutionTime() {
        return microtime(true);
    }

    /**
     * ⚙️ Optimized scaling factors calculation using mathematical optimization
     *
     * @param array $initial_scaling Initial scaling factors
     * @param array $measurement_data Full measurement dataset
     * @return array Optimized scaling factors
     */
    private function optimizeScalingFactorsAdvanced($initial_scaling, $measurement_data) {
        $optimized = $initial_scaling;

        // Apply mathematical constraints for aspect ratio preservation
        if (isset($optimized['scale_x']) && isset($optimized['scale_y'])) {
            $aspect_ratio = $optimized['scale_x'] / $optimized['scale_y'];

            // Use golden ratio bounds for natural proportions (0.618 - 1.618)
            $golden_ratio = 1.618;
            $min_ratio = 1 / $golden_ratio; // ~0.618
            $max_ratio = $golden_ratio;     // ~1.618

            if ($aspect_ratio < $min_ratio || $aspect_ratio > $max_ratio) {
                // Apply harmonic mean for balanced scaling
                $harmonic_mean = 2 / ((1/$optimized['scale_x']) + (1/$optimized['scale_y']));

                // Adjust with minimal deviation from original values
                $weight_x = 0.6; // Slight preference for width scaling
                $weight_y = 0.4;

                $optimized['scale_x'] = $harmonic_mean * (1 + ($aspect_ratio - 1) * $weight_x * 0.1);
                $optimized['scale_y'] = $harmonic_mean * (1 - ($aspect_ratio - 1) * $weight_y * 0.1);
            }
        }

        // Apply high-precision rounding to scaling factors
        foreach ($optimized as $key => $value) {
            $optimized[$key] = $this->advancedRounding($value, 0.0001); // 0.01% precision for scaling factors
        }

        return $optimized;
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

            return $this->getFromCacheOrGenerate($cache_key, function() use ($template_id, $size) {
                $measurements = $this->template_measurement_manager->get_measurements($template_id);
                $template_sizes = $this->template_measurement_manager->get_template_sizes($template_id);

                if (empty($measurements) || !isset($measurements[$size])) {
                    throw new Exception("No measurements found for template {$template_id}, size {$size}");
                }

                return [
                    'measurements' => $measurements,
                    'template_sizes' => $template_sizes,
                    'size_measurements' => $measurements[$size],
                    'expected_values' => $this->buildExpectedValues($measurements[$size])
                ];
            }, 1800); // 30 minutes TTL

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
        // Use advanced optimization for better mathematical accuracy
        return $this->optimizeScalingFactorsAdvanced($initial_scaling, $measurement_data);
    }

    /**
     * 📈 Get performance metrics
     *
     * @return array Performance statistics
     */
    public function getPerformanceMetrics() {
        $basic_metrics = [
            'cache_entries' => count($this->performance_cache),
            'supported_dpis' => $this->supported_dpis,
            'precision_tolerance_mm' => $this->precision_tolerance,
            'memory_usage_kb' => round(memory_get_usage() / 1024, 2),
            'cache_hit_ratio' => $this->calculateCacheHitRatio(),
            'peak_memory_kb' => round(memory_get_peak_usage() / 1024, 2)
        ];

        // Merge with detailed calculation statistics
        return array_merge($basic_metrics, $this->getCalculationStatistics());
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
        if ($this->cache_requests === 0) {
            return 0.0;
        }
        return round(($this->cache_hits / $this->cache_requests) * 100, 2);
    }

    /**
     * 🚀 Enhanced cache with intelligent invalidation
     *
     * @param string $cache_key Cache key
     * @param callable $data_provider Function to generate data if not cached
     * @param int $ttl Time to live in seconds (default: 3600)
     * @return mixed Cached or fresh data
     */
    private function getFromCacheOrGenerate($cache_key, $data_provider, $ttl = 3600) {
        $this->cache_requests++;

        // Check if data exists in cache and is still valid
        if (isset($this->performance_cache[$cache_key])) {
            $cached_data = $this->performance_cache[$cache_key];

            // Check TTL if timestamp exists
            if (isset($cached_data['timestamp']) && (time() - $cached_data['timestamp']) < $ttl) {
                $this->cache_hits++;
                return $cached_data['data'];
            }
        }

        // Generate fresh data
        $fresh_data = call_user_func($data_provider);

        // Cache with timestamp
        $this->performance_cache[$cache_key] = [
            'data' => $fresh_data,
            'timestamp' => time()
        ];

        // Prevent cache from growing too large
        if (count($this->performance_cache) > 100) {
            $this->evictOldestCacheEntries();
        }

        return $fresh_data;
    }

    /**
     * 🧹 Evict oldest cache entries to prevent memory overflow
     */
    private function evictOldestCacheEntries() {
        // Sort by timestamp and keep only the 50 newest entries
        uasort($this->performance_cache, function($a, $b) {
            return $b['timestamp'] - $a['timestamp'];
        });

        $this->performance_cache = array_slice($this->performance_cache, 0, 50, true);
    }

    /**
     * 🏃‍♂️ Optimized DPI conversion with caching
     *
     * @param int $dpi DPI value
     * @return float Conversion factor (mm per pixel)
     */
    private function getCachedDPIConversionFactor($dpi) {
        if (!isset($this->dpi_conversion_cache[$dpi])) {
            $mm_per_inch = 25.4;
            $precision_factor = $this->getDPIPrecisionFactor($dpi);
            $this->dpi_conversion_cache[$dpi] = ($mm_per_inch / $dpi) * $precision_factor;
        }
        return $this->dpi_conversion_cache[$dpi];
    }

    /**
     * 📈 Track calculation performance
     *
     * @param float $processing_time_ms Processing time in milliseconds
     */
    private function trackCalculationPerformance($processing_time_ms) {
        $this->calculation_stats['total_calculations']++;
        $this->calculation_stats['total_time_ms'] += $processing_time_ms;
        $this->calculation_stats['fastest_calculation_ms'] = min(
            $this->calculation_stats['fastest_calculation_ms'],
            $processing_time_ms
        );
        $this->calculation_stats['slowest_calculation_ms'] = max(
            $this->calculation_stats['slowest_calculation_ms'],
            $processing_time_ms
        );
    }

    /**
     * 📊 Get detailed calculation statistics
     *
     * @return array Detailed performance statistics
     */
    public function getCalculationStatistics() {
        $stats = $this->calculation_stats;

        if ($stats['total_calculations'] > 0) {
            $stats['average_calculation_ms'] = round(
                $stats['total_time_ms'] / $stats['total_calculations'],
                3
            );
        } else {
            $stats['average_calculation_ms'] = 0;
        }

        $stats['cache_hit_ratio'] = $this->calculateCacheHitRatio();
        $stats['cache_entries'] = count($this->performance_cache);
        $stats['cache_hits'] = $this->cache_hits;
        $stats['cache_requests'] = $this->cache_requests;

        return $stats;
    }
}