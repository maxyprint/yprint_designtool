<?php
/**
 * 🧠 AGENT 3: PRECISION DATABASE CACHE MANAGER
 * Mission: High-Performance Database Integration mit Redis/Memory Caching
 *
 * Features:
 * - Redis/Memory Caching für häufige Berechnungen
 * - Optimierte Database Queries für PrecisionCalculator
 * - Multi-View Database Synchronisation
 * - Performance Monitoring & Metrics
 * - Cache Invalidation Strategies
 *
 * @package    Octo_Print_Designer
 * @subpackage Octo_Print_Designer/includes
 * @version    1.0.0
 * @since      1.0.0
 */

class PrecisionDatabaseCacheManager {

    /**
     * Version und Cache-Konstanten
     */
    const VERSION = '1.0.0';
    const CACHE_GROUP = 'precision_calculator';
    const CACHE_TTL = 3600; // 1 hour default
    const CACHE_TTL_LONG = 86400; // 24 hours for stable data
    const REDIS_PREFIX = 'yprint_precision:';

    /**
     * Instance variables
     */
    private $wpdb;
    private $template_measurement_manager;
    private $redis_connection = null;
    private $cache_stats = array();
    private $use_redis = false;
    private $fallback_cache = array();
    private $performance_metrics = array();

    /**
     * Constructor - Initialize Cache Manager
     */
    public function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;

        // Initialize TemplateMeasurementManager
        if (class_exists('TemplateMeasurementManager')) {
            $this->template_measurement_manager = new TemplateMeasurementManager();
        } else {
            throw new Exception('TemplateMeasurementManager class is required for PrecisionDatabaseCacheManager');
        }

        // Initialize Redis if available
        $this->initializeRedis();

        // Initialize cache stats
        $this->cache_stats = array(
            'hits' => 0,
            'misses' => 0,
            'redis_hits' => 0,
            'memory_hits' => 0,
            'database_queries' => 0
        );
    }

    /**
     * 🔴 REDIS INITIALIZATION: Setup Redis connection if available
     */
    private function initializeRedis() {
        if (class_exists('Redis') && defined('REDIS_HOST')) {
            try {
                $this->redis_connection = new Redis();
                $host = defined('REDIS_HOST') ? REDIS_HOST : '127.0.0.1';
                $port = defined('REDIS_PORT') ? REDIS_PORT : 6379;
                $password = defined('REDIS_PASSWORD') ? REDIS_PASSWORD : null;

                if ($this->redis_connection->connect($host, $port, 2.5)) {
                    if ($password) {
                        $this->redis_connection->auth($password);
                    }
                    $this->redis_connection->select(0);
                    $this->use_redis = true;
                    error_log('PrecisionDatabaseCacheManager: Redis connection established');
                } else {
                    error_log('PrecisionDatabaseCacheManager: Redis connection failed');
                }
            } catch (Exception $e) {
                error_log('PrecisionDatabaseCacheManager: Redis initialization error - ' . $e->getMessage());
                $this->redis_connection = null;
            }
        }
    }

    /**
     * 🤖 AGENT 5: ENHANCED CALCULATION RESULT CACHING
     * Extended caching for complex calculation results from PrecisionCalculator
     */
    public function cacheCalculationResult($cache_key, $result, $ttl = null) {
        $ttl = $ttl ?: self::CACHE_TTL;
        $cache_data = array(
            'result' => $result,
            'timestamp' => time(),
            'ttl' => $ttl,
            'version' => self::VERSION,
            'agent' => 'AGENT_5_PERFORMANCE'
        );

        if ($this->use_redis && $this->redis_connection) {
            try {
                $redis_key = self::REDIS_PREFIX . 'calc:' . $cache_key;
                $serialized_data = json_encode($cache_data);
                $this->redis_connection->setex($redis_key, $ttl, $serialized_data);
                $this->cache_stats['redis_sets']++;
                return true;
            } catch (Exception $e) {
                error_log('Redis cache set failed: ' . $e->getMessage());
            }
        }

        // Fallback to memory cache
        $this->fallback_cache[$cache_key] = $cache_data;
        return true;
    }

    /**
     * Get cached calculation result with performance optimization
     */
    public function getCachedCalculationResult($cache_key) {
        // Try Redis first
        if ($this->use_redis && $this->redis_connection) {
            try {
                $redis_key = self::REDIS_PREFIX . 'calc:' . $cache_key;
                $cached_data = $this->redis_connection->get($redis_key);

                if ($cached_data !== false) {
                    $data = json_decode($cached_data, true);
                    if ($data && isset($data['result'])) {
                        $this->cache_stats['redis_hits']++;
                        return $data['result'];
                    }
                }
            } catch (Exception $e) {
                error_log('Redis cache get failed: ' . $e->getMessage());
            }
        }

        // Fallback to memory cache
        if (isset($this->fallback_cache[$cache_key])) {
            $data = $this->fallback_cache[$cache_key];
            if (time() - $data['timestamp'] < $data['ttl']) {
                $this->cache_stats['memory_hits']++;
                return $data['result'];
            } else {
                unset($this->fallback_cache[$cache_key]);
            }
        }

        $this->cache_stats['misses']++;
        return null;
    }

    /**
     * 📊 BATCH CALCULATION CACHING: Store multiple calculation results efficiently
     */
    public function batchCacheCalculations($results, $base_key_prefix = 'batch') {
        $cached_count = 0;

        foreach ($results as $key => $result) {
            $cache_key = $base_key_prefix . ':' . $key;
            if ($this->cacheCalculationResult($cache_key, $result)) {
                $cached_count++;
            }
        }

        return $cached_count;
    }

    /**
     * 🧹 CACHE INVALIDATION: Smart cache cleanup for calculation results
     */
    public function invalidateCalculationCache($template_id = null, $pattern = null) {
        $invalidated_count = 0;

        if ($this->use_redis && $this->redis_connection) {
            try {
                $search_pattern = self::REDIS_PREFIX . 'calc:';
                if ($template_id) {
                    $search_pattern .= '*template_' . $template_id . '*';
                } elseif ($pattern) {
                    $search_pattern .= '*' . $pattern . '*';
                } else {
                    $search_pattern .= '*';
                }

                $keys = $this->redis_connection->keys($search_pattern);
                if (!empty($keys)) {
                    $invalidated_count = $this->redis_connection->del($keys);
                }
            } catch (Exception $e) {
                error_log('Redis cache invalidation failed: ' . $e->getMessage());
            }
        }

        // Clean memory cache
        foreach (array_keys($this->fallback_cache) as $key) {
            if (!$template_id && !$pattern) {
                unset($this->fallback_cache[$key]);
                $invalidated_count++;
            } elseif ($template_id && strpos($key, 'template_' . $template_id) !== false) {
                unset($this->fallback_cache[$key]);
                $invalidated_count++;
            } elseif ($pattern && strpos($key, $pattern) !== false) {
                unset($this->fallback_cache[$key]);
                $invalidated_count++;
            }
        }

        return $invalidated_count;
    }

    /**
     * 🎯 CACHED MEASUREMENT RETRIEVAL: Get measurements with caching
     *
     * @param int $template_id Template post ID
     * @param bool $force_refresh Force cache refresh
     * @return array Cached measurements data
     */
    public function getCachedMeasurements($template_id, $force_refresh = false) {
        $start_time = microtime(true);
        $cache_key = $this->generateCacheKey('measurements', $template_id);

        // Check cache first unless forcing refresh
        if (!$force_refresh) {
            $cached_data = $this->getFromCache($cache_key);
            if ($cached_data !== false) {
                $this->recordMetric('cache_hit', microtime(true) - $start_time);
                return $cached_data;
            }
        }

        // Cache miss - fetch from database
        $this->cache_stats['database_queries']++;
        $measurements = $this->template_measurement_manager->get_measurements($template_id);

        // Enhance data with additional metadata
        $enhanced_measurements = $this->enhanceMeasurementData($template_id, $measurements);

        // Cache the result
        $this->setToCache($cache_key, $enhanced_measurements, self::CACHE_TTL);

        $this->recordMetric('cache_miss', microtime(true) - $start_time);
        return $enhanced_measurements;
    }

    /**
     * 🎯 CACHED MEASUREMENT TYPES: Get measurement types with caching
     *
     * @param int $template_id Template post ID
     * @param bool $force_refresh Force cache refresh
     * @return array Cached measurement types data
     */
    public function getCachedMeasurementTypes($template_id, $force_refresh = false) {
        $start_time = microtime(true);
        $cache_key = $this->generateCacheKey('measurement_types', $template_id);

        // Check cache first unless forcing refresh
        if (!$force_refresh) {
            $cached_data = $this->getFromCache($cache_key);
            if ($cached_data !== false) {
                $this->recordMetric('cache_hit', microtime(true) - $start_time);
                return $cached_data;
            }
        }

        // Cache miss - fetch from database
        $this->cache_stats['database_queries']++;
        $measurement_types = $this->template_measurement_manager->get_measurement_types($template_id);

        // Enhanced with precision calculator compatibility
        $enhanced_types = $this->enhanceMeasurementTypes($template_id, $measurement_types);

        // Cache the result with longer TTL (measurement types change less frequently)
        $this->setToCache($cache_key, $enhanced_types, self::CACHE_TTL_LONG);

        $this->recordMetric('cache_miss', microtime(true) - $start_time);
        return $enhanced_types;
    }

    /**
     * 🎯 CACHED PRECISION METRICS: Get precision calculation results with caching
     *
     * @param int $template_id Template post ID
     * @param string $measurement_key Specific measurement key
     * @param array $reference_lines Reference lines data
     * @param bool $force_refresh Force cache refresh
     * @return array Cached precision metrics
     */
    public function getCachedPrecisionMetrics($template_id, $measurement_key, $reference_lines, $force_refresh = false) {
        $start_time = microtime(true);

        // Generate cache key including reference lines hash
        $reference_hash = md5(serialize($reference_lines));
        $cache_key = $this->generateCacheKey('precision_metrics', $template_id, $measurement_key, $reference_hash);

        // Check cache first unless forcing refresh
        if (!$force_refresh) {
            $cached_data = $this->getFromCache($cache_key);
            if ($cached_data !== false) {
                $this->recordMetric('precision_cache_hit', microtime(true) - $start_time);
                return $cached_data;
            }
        }

        // Cache miss - calculate precision metrics
        $precision_metrics = $this->calculatePrecisionMetrics($template_id, $measurement_key, $reference_lines);

        // Cache with shorter TTL (precision calculations depend on reference lines)
        $this->setToCache($cache_key, $precision_metrics, 1800); // 30 minutes

        $this->recordMetric('precision_cache_miss', microtime(true) - $start_time);
        return $precision_metrics;
    }

    /**
     * 📊 ENHANCED MEASUREMENT DATA: Add metadata for PrecisionCalculator integration
     *
     * @param int $template_id Template post ID
     * @param array $measurements Raw measurements data
     * @return array Enhanced measurements with metadata
     */
    private function enhanceMeasurementData($template_id, $measurements) {
        $enhanced = array(
            'template_id' => $template_id,
            'measurements' => $measurements,
            'meta' => array(
                'total_sizes' => count($measurements),
                'measurement_types' => array(),
                'last_updated' => current_time('mysql'),
                'cache_version' => self::VERSION
            )
        );

        // Calculate measurement type statistics
        $type_stats = array();
        foreach ($measurements as $size_key => $size_measurements) {
            foreach ($size_measurements as $measurement_key => $measurement_data) {
                if (!isset($type_stats[$measurement_key])) {
                    $type_stats[$measurement_key] = array(
                        'count' => 0,
                        'sizes' => array(),
                        'min_value' => PHP_FLOAT_MAX,
                        'max_value' => PHP_FLOAT_MIN,
                        'values' => array()
                    );
                }

                $value = $measurement_data['value_cm'];
                $type_stats[$measurement_key]['count']++;
                $type_stats[$measurement_key]['sizes'][] = $size_key;
                $type_stats[$measurement_key]['min_value'] = min($type_stats[$measurement_key]['min_value'], $value);
                $type_stats[$measurement_key]['max_value'] = max($type_stats[$measurement_key]['max_value'], $value);
                $type_stats[$measurement_key]['values'][] = $value;
            }
        }

        $enhanced['meta']['measurement_types'] = $type_stats;
        return $enhanced;
    }

    /**
     * 🔧 ENHANCE MEASUREMENT TYPES: Add PrecisionCalculator compatibility data
     *
     * @param int $template_id Template post ID
     * @param array $measurement_types Raw measurement types
     * @return array Enhanced measurement types
     */
    private function enhanceMeasurementTypes($template_id, $measurement_types) {
        $enhanced = array();

        foreach ($measurement_types as $key => $type_data) {
            $enhanced[$key] = $type_data;

            // Add PrecisionCalculator specific enhancements
            $enhanced[$key]['precision_ready'] = true;
            $enhanced[$key]['cache_key'] = $this->generateCacheKey('type', $template_id, $key);
            $enhanced[$key]['calculation_complexity'] = $this->assessCalculationComplexity($type_data);

            // Add measurement variation analysis
            if (isset($type_data['min_value'], $type_data['max_value'])) {
                $range = $type_data['max_value'] - $type_data['min_value'];
                $enhanced[$key]['variation_range'] = $range;
                $enhanced[$key]['variation_percentage'] = $type_data['avg_value'] > 0 ?
                    round(($range / $type_data['avg_value']) * 100, 2) : 0;
            }
        }

        return $enhanced;
    }

    /**
     * 🧮 CALCULATE PRECISION METRICS: Perform precision calculations for caching
     *
     * @param int $template_id Template post ID
     * @param string $measurement_key Measurement key
     * @param array $reference_lines Reference lines data
     * @return array Precision metrics
     */
    private function calculatePrecisionMetrics($template_id, $measurement_key, $reference_lines) {
        // This would integrate with PrecisionCalculator class
        $metrics = array(
            'template_id' => $template_id,
            'measurement_key' => $measurement_key,
            'precision_score' => 0.0,
            'accuracy_rating' => 'pending',
            'reference_line_count' => count($reference_lines),
            'calculated_at' => microtime(true),
            'cache_version' => self::VERSION
        );

        // Basic precision calculation logic
        if (!empty($reference_lines)) {
            $total_precision = 0;
            $line_count = 0;

            foreach ($reference_lines as $view_key => $view_lines) {
                if (is_array($view_lines)) {
                    foreach ($view_lines as $line) {
                        if (isset($line['measurement_key']) && $line['measurement_key'] === $measurement_key) {
                            // Calculate precision based on line properties
                            $precision = $this->calculateLinePrecision($line);
                            $total_precision += $precision;
                            $line_count++;
                        }
                    }
                }
            }

            if ($line_count > 0) {
                $metrics['precision_score'] = $total_precision / $line_count;
                $metrics['accuracy_rating'] = $this->classifyAccuracy($metrics['precision_score']);
            }
        }

        return $metrics;
    }

    /**
     * 📏 CALCULATE LINE PRECISION: Assess precision of individual reference line
     *
     * @param array $line Reference line data
     * @return float Precision score (0-100)
     */
    private function calculateLinePrecision($line) {
        // Basic precision calculation based on line properties
        $base_precision = 75.0; // Starting precision

        // Adjust based on line length (longer lines generally more precise)
        if (isset($line['lengthPx'])) {
            $length_factor = min(1.25, $line['lengthPx'] / 100); // Cap at 25% bonus
            $base_precision *= $length_factor;
        }

        // Adjust based on line position accuracy
        if (isset($line['start'], $line['end'])) {
            $position_accuracy = $this->assessPositionAccuracy($line['start'], $line['end']);
            $base_precision += $position_accuracy;
        }

        return min(100.0, max(0.0, $base_precision));
    }

    /**
     * 🎯 ASSESS POSITION ACCURACY: Evaluate position accuracy of line endpoints
     *
     * @param array $start Start coordinates
     * @param array $end End coordinates
     * @return float Accuracy bonus (-10 to +10)
     */
    private function assessPositionAccuracy($start, $end) {
        $accuracy_bonus = 0;

        // Check if coordinates are integers (pixel-perfect positioning)
        if (isset($start['x'], $start['y'], $end['x'], $end['y'])) {
            $start_precise = (float)$start['x'] == (int)$start['x'] && (float)$start['y'] == (int)$start['y'];
            $end_precise = (float)$end['x'] == (int)$end['x'] && (float)$end['y'] == (int)$end['y'];

            if ($start_precise && $end_precise) {
                $accuracy_bonus += 5; // Pixel-perfect bonus
            }
        }

        return $accuracy_bonus;
    }

    /**
     * 📊 CLASSIFY ACCURACY: Convert precision score to rating
     *
     * @param float $precision_score Precision score (0-100)
     * @return string Accuracy rating
     */
    private function classifyAccuracy($precision_score) {
        if ($precision_score >= 95) return 'excellent';
        if ($precision_score >= 85) return 'very_good';
        if ($precision_score >= 75) return 'good';
        if ($precision_score >= 65) return 'acceptable';
        if ($precision_score >= 50) return 'poor';
        return 'unacceptable';
    }

    /**
     * 🔍 ASSESS CALCULATION COMPLEXITY: Determine calculation complexity for caching strategy
     *
     * @param array $type_data Measurement type data
     * @return string Complexity level (low, medium, high, extreme)
     */
    private function assessCalculationComplexity($type_data) {
        $complexity_score = 0;

        // Base complexity on size count
        if (isset($type_data['size_count'])) {
            $complexity_score += min(30, $type_data['size_count'] * 3);
        }

        // Add complexity for value range
        if (isset($type_data['min_value'], $type_data['max_value'], $type_data['avg_value'])) {
            $variation = ($type_data['max_value'] - $type_data['min_value']) / max(1, $type_data['avg_value']);
            $complexity_score += min(25, $variation * 50);
        }

        // Classify complexity
        if ($complexity_score >= 70) return 'extreme';
        if ($complexity_score >= 50) return 'high';
        if ($complexity_score >= 25) return 'medium';
        return 'low';
    }

    /**
     * 🗂️ CACHE MANAGEMENT: Get data from cache (Redis or Memory)
     *
     * @param string $cache_key Cache key
     * @return mixed Cached data or false
     */
    private function getFromCache($cache_key) {
        // Try Redis first if available
        if ($this->use_redis && $this->redis_connection) {
            try {
                $redis_key = self::REDIS_PREFIX . $cache_key;
                $cached_data = $this->redis_connection->get($redis_key);

                if ($cached_data !== false) {
                    $this->cache_stats['redis_hits']++;
                    $this->cache_stats['hits']++;
                    return json_decode($cached_data, true);
                }
            } catch (Exception $e) {
                error_log('Redis cache get error: ' . $e->getMessage());
            }
        }

        // Fallback to memory cache
        if (isset($this->fallback_cache[$cache_key])) {
            $cache_entry = $this->fallback_cache[$cache_key];

            // Check expiration
            if ($cache_entry['expires'] > time()) {
                $this->cache_stats['memory_hits']++;
                $this->cache_stats['hits']++;
                return $cache_entry['data'];
            } else {
                unset($this->fallback_cache[$cache_key]);
            }
        }

        $this->cache_stats['misses']++;
        return false;
    }

    /**
     * 💾 CACHE STORAGE: Set data to cache (Redis or Memory)
     *
     * @param string $cache_key Cache key
     * @param mixed $data Data to cache
     * @param int $ttl Time to live in seconds
     */
    private function setToCache($cache_key, $data, $ttl) {
        // Store in Redis if available
        if ($this->use_redis && $this->redis_connection) {
            try {
                $redis_key = self::REDIS_PREFIX . $cache_key;
                $this->redis_connection->setex($redis_key, $ttl, json_encode($data));
            } catch (Exception $e) {
                error_log('Redis cache set error: ' . $e->getMessage());
            }
        }

        // Always store in memory cache as fallback
        $this->fallback_cache[$cache_key] = array(
            'data' => $data,
            'expires' => time() + $ttl
        );

        // Limit memory cache size (keep latest 100 entries)
        if (count($this->fallback_cache) > 100) {
            $this->fallback_cache = array_slice($this->fallback_cache, -100, 100, true);
        }
    }

    /**
     * 🔑 GENERATE CACHE KEY: Create unique cache key for data
     *
     * @param string $type Cache type
     * @param mixed ...$identifiers Additional identifiers
     * @return string Cache key
     */
    private function generateCacheKey($type, ...$identifiers) {
        $key_parts = array($type);
        foreach ($identifiers as $identifier) {
            if (is_array($identifier) || is_object($identifier)) {
                $key_parts[] = md5(serialize($identifier));
            } else {
                $key_parts[] = (string)$identifier;
            }
        }

        return implode('_', $key_parts);
    }

    /**
     * 🗑️ CACHE INVALIDATION: Clear cached data for template
     *
     * @param int $template_id Template post ID
     * @param string $type Specific cache type to clear (optional)
     */
    public function invalidateTemplateCache($template_id, $type = null) {
        $patterns = array();

        if ($type) {
            $patterns[] = $this->generateCacheKey($type, $template_id) . '*';
        } else {
            // Clear all cache types for this template
            $cache_types = array('measurements', 'measurement_types', 'precision_metrics');
            foreach ($cache_types as $cache_type) {
                $patterns[] = $this->generateCacheKey($cache_type, $template_id) . '*';
            }
        }

        // Clear from Redis
        if ($this->use_redis && $this->redis_connection) {
            foreach ($patterns as $pattern) {
                try {
                    $redis_pattern = self::REDIS_PREFIX . $pattern;
                    $keys = $this->redis_connection->keys($redis_pattern);
                    if (!empty($keys)) {
                        $this->redis_connection->del($keys);
                    }
                } catch (Exception $e) {
                    error_log('Redis cache invalidation error: ' . $e->getMessage());
                }
            }
        }

        // Clear from memory cache
        foreach ($this->fallback_cache as $key => $cache_entry) {
            foreach ($patterns as $pattern) {
                if (fnmatch(str_replace('*', '', $pattern), $key)) {
                    unset($this->fallback_cache[$key]);
                    break;
                }
            }
        }
    }

    /**
     * 📊 PERFORMANCE METRICS: Record performance metrics
     *
     * @param string $operation Operation name
     * @param float $duration Duration in seconds
     */
    private function recordMetric($operation, $duration) {
        if (!isset($this->performance_metrics[$operation])) {
            $this->performance_metrics[$operation] = array(
                'count' => 0,
                'total_time' => 0.0,
                'avg_time' => 0.0,
                'min_time' => PHP_FLOAT_MAX,
                'max_time' => 0.0
            );
        }

        $metrics = &$this->performance_metrics[$operation];
        $metrics['count']++;
        $metrics['total_time'] += $duration;
        $metrics['avg_time'] = $metrics['total_time'] / $metrics['count'];
        $metrics['min_time'] = min($metrics['min_time'], $duration);
        $metrics['max_time'] = max($metrics['max_time'], $duration);
    }

    /**
     * 📈 GET CACHE STATISTICS: Return cache performance statistics
     *
     * @return array Cache statistics
     */
    public function getCacheStatistics() {
        $hit_rate = $this->cache_stats['hits'] + $this->cache_stats['misses'] > 0 ?
            ($this->cache_stats['hits'] / ($this->cache_stats['hits'] + $this->cache_stats['misses'])) * 100 : 0;

        return array(
            'cache_stats' => $this->cache_stats,
            'hit_rate' => round($hit_rate, 2),
            'redis_enabled' => $this->use_redis,
            'memory_cache_size' => count($this->fallback_cache),
            'performance_metrics' => $this->performance_metrics
        );
    }

    /**
     * 🔄 SYNC DATABASE: Enhanced multi-view database synchronization
     *
     * @param int $template_id Template post ID
     * @param array $reference_lines_data Multi-view reference lines data
     * @return bool Success status
     */
    public function syncMultiViewDatabase($template_id, $reference_lines_data) {
        try {
            // Invalidate existing cache
            $this->invalidateTemplateCache($template_id);

            // Update multi-view reference lines
            $result = update_post_meta($template_id, '_multi_view_reference_lines_data', $reference_lines_data);

            if ($result !== false) {
                // Trigger measurement synchronization with TemplateMeasurementManager
                if ($this->template_measurement_manager) {
                    $this->template_measurement_manager->sync_with_template_sizes($template_id);
                }

                // Pre-cache frequently accessed data
                $this->preCacheTemplateData($template_id);

                return true;
            }

            return false;
        } catch (Exception $e) {
            error_log('Multi-view database sync error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * ⚡ PRE-CACHE TEMPLATE DATA: Pre-load frequently accessed data
     *
     * @param int $template_id Template post ID
     */
    private function preCacheTemplateData($template_id) {
        // Pre-cache measurements
        $this->getCachedMeasurements($template_id, true);

        // Pre-cache measurement types
        $this->getCachedMeasurementTypes($template_id, true);

        error_log("Pre-cached data for template {$template_id}");
    }

    /**
     * 🏁 DESTRUCTOR: Cleanup connections
     */
    public function __destruct() {
        if ($this->redis_connection) {
            try {
                $this->redis_connection->close();
            } catch (Exception $e) {
                // Silent fail on cleanup
            }
        }
    }
}