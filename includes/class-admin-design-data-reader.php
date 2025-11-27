<?php
/**
 * 🎯 ADMIN DESIGN DATA READER
 *
 * Backend-spezifische Design Data Extraction für Admin Kontext
 * Löst das Problem: Admin kann keine Design Data aus Database extrahieren
 *
 * FEATURES:
 * - Direct Database Query für Design Data
 * - Multi-View aware Data Parsing
 * - Backward Compatibility für Legacy Designs
 * - JSON Design Data Processing
 * - View-specific Element Extraction
 */

class AdminDesignDataReader {

    private $wpdb;

    public function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;
    }

    /**
     * Extract design data from database for admin context
     * Replaces frontend generateDesignData() function
     */
    public function extractDesignDataFromDatabase($design_id) {
        error_log("🎯 [ADMIN READER] Starting design data extraction for Design {$design_id}");

        if (!$design_id) {
            error_log("❌ [ADMIN READER] No design ID provided");
            return [
                'success' => false,
                'error' => 'No design ID provided',
                'data' => null
            ];
        }

        try {
            // Step 1: Query design data from database
            $design_record = $this->getDesignRecord($design_id);
            if (!$design_record) {
                error_log("❌ [ADMIN READER] Design {$design_id} not found in database");
                return [
                    'success' => false,
                    'error' => 'Design not found',
                    'data' => null
                ];
            }

            error_log("✅ [ADMIN READER] Design record found for {$design_id}");

            // Step 2: Parse JSON design data
            $parsed_data = $this->parseDesignData($design_record);
            if (!$parsed_data) {
                error_log("⚠️ [ADMIN READER] No parseable design data found for {$design_id}");
                return [
                    'success' => true,
                    'has_design_data' => false,
                    'data_size' => 0,
                    'data' => null,
                    'message' => 'Design exists but has no design data'
                ];
            }

            // Step 3: Extract elements and views
            $extracted_data = $this->extractElements($parsed_data, $design_id);

            error_log("✅ [ADMIN READER] Design data successfully extracted for {$design_id}");
            error_log("📊 [ADMIN READER] Found " . count($extracted_data['elements']) . " design elements");

            return [
                'success' => true,
                'has_design_data' => true,
                'data_size' => strlen(json_encode($extracted_data)),
                'data' => $extracted_data,
                'design_info' => [
                    'id' => $design_record->id,
                    'name' => $design_record->name,
                    'created' => $design_record->created_at,
                    'template_id' => $design_record->template_id
                ]
            ];

        } catch (Exception $e) {
            error_log("❌ [ADMIN READER] Error extracting design data: " . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Error extracting design data: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Get design record from database
     */
    private function getDesignRecord($design_id) {
        $table_name = $this->wpdb->prefix . 'octo_user_designs';

        $query = $this->wpdb->prepare(
            "SELECT id, name, design_data, created_at, template_id FROM {$table_name} WHERE id = %d",
            $design_id
        );

        return $this->wpdb->get_row($query);
    }

    /**
     * Parse JSON design data from database field
     */
    private function parseDesignData($design_record) {
        if (empty($design_record->design_data)) {
            return null;
        }

        // Try to parse JSON design data
        $design_data = json_decode($design_record->design_data, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("⚠️ [ADMIN READER] Invalid JSON in design_data for Design {$design_record->id}");
            return null;
        }

        return $design_data;
    }

    /**
     * Extract design elements from parsed data
     * Multi-view aware extraction
     */
    private function extractElements($design_data, $design_id) {
        $elements = [];
        $views = [];
        $measurements = [];

        // Extract elements - handle different data structures
        if (isset($design_data['elements']) && is_array($design_data['elements'])) {
            // Standard elements structure
            $elements = $this->processElements($design_data['elements']);

        } elseif (isset($design_data['views']) && is_array($design_data['views'])) {
            // Multi-view structure
            foreach ($design_data['views'] as $view_id => $view_data) {
                if (isset($view_data['elements'])) {
                    $view_elements = $this->processElements($view_data['elements']);
                    $elements = array_merge($elements, $view_elements);

                    $views[$view_id] = [
                        'id' => $view_id,
                        'name' => $view_data['name'] ?? "View {$view_id}",
                        'elements' => $view_elements,
                        'element_count' => count($view_elements)
                    ];
                }
            }

        } elseif (is_array($design_data)) {
            // Direct array of elements
            $elements = $this->processElements($design_data);
        }

        // Extract measurements if available
        if (isset($design_data['measurements'])) {
            $measurements = $design_data['measurements'];
        }

        return [
            'elements' => $elements,
            'views' => $views,
            'measurements' => $measurements,
            'metadata' => [
                'total_elements' => count($elements),
                'view_count' => count($views),
                'has_multi_view' => count($views) > 1,
                'extracted_at' => current_time('mysql')
            ]
        ];
    }

    /**
     * Process individual design elements
     */
    private function processElements($elements_data) {
        $processed = [];

        if (!is_array($elements_data)) {
            return $processed;
        }

        foreach ($elements_data as $element) {
            if (!is_array($element)) {
                continue;
            }

            // Standard element processing
            $processed_element = [
                'type' => $element['type'] ?? 'unknown',
                'id' => $element['id'] ?? uniqid(),
                'position' => [
                    'left' => $element['left'] ?? 0,
                    'top' => $element['top'] ?? 0
                ],
                'size' => [
                    'width' => $element['width'] ?? 0,
                    'height' => $element['height'] ?? 0
                ],
                'properties' => []
            ];

            // Type-specific processing
            switch ($processed_element['type']) {
                case 'text':
                case 'i-text':
                    $processed_element['properties']['text'] = $element['text'] ?? '';
                    $processed_element['properties']['font_family'] = $element['fontFamily'] ?? 'Arial';
                    $processed_element['properties']['font_size'] = $element['fontSize'] ?? 12;
                    $processed_element['properties']['color'] = $element['fill'] ?? '#000000';
                    break;

                case 'image':
                    $processed_element['properties']['src'] = $element['src'] ?? '';
                    $processed_element['properties']['scale_x'] = $element['scaleX'] ?? 1;
                    $processed_element['properties']['scale_y'] = $element['scaleY'] ?? 1;
                    break;

                default:
                    // Generic properties
                    $processed_element['properties'] = array_diff_key($element, [
                        'type' => '', 'id' => '', 'left' => '', 'top' => '',
                        'width' => '', 'height' => ''
                    ]);
                    break;
            }

            $processed[] = $processed_element;
        }

        return $processed;
    }

    /**
     * Get multi-view PNG data for admin display
     * Integrates with existing multi-view PNG system
     */
    public function getMultiViewPNGsForDesign($design_id, $order_id = null) {
        error_log("🎯 [ADMIN READER] Getting multi-view PNGs for Design {$design_id}");

        // Check if WooCommerce integration class is available
        $wc_integration = null;

        // Try singleton access first
        if (class_exists('Octo_Print_Designer_WC_Integration')) {
            $wc_integration = Octo_Print_Designer_WC_Integration::get_instance();
        }

        if ($wc_integration && method_exists($wc_integration, 'get_multi_view_pngs_for_order_item')) {
            // Get design record for the WC integration
            $design_record = $this->getDesignRecord($design_id);
            if ($design_record) {
                $design_array = [
                    'id' => $design_record->id,
                    'name' => $design_record->name,
                    'design_data' => $design_record->design_data,
                    'template_id' => $design_record->template_id
                ];

                // Use reflection to access the private method
                try {
                    $reflection = new ReflectionClass($wc_integration);
                    $method = $reflection->getMethod('get_multi_view_pngs_for_order_item');
                    $method->setAccessible(true);

                    $result = $method->invokeArgs($wc_integration, [
                        $design_id,
                        $order_id,
                        null, // item_id
                        $design_array
                    ]);

                    error_log("✅ [ADMIN READER] Used WC integration multi-view lookup: " . count($result) . " PNG(s)");
                    return $result;

                } catch (ReflectionException $e) {
                    error_log("⚠️ [ADMIN READER] Reflection failed: " . $e->getMessage());
                }
            }
        }

        // Fallback: Direct database query
        error_log("🔄 [ADMIN READER] Using direct database query fallback");
        return $this->getMultiViewPNGsDirect($design_id, $order_id);
    }

    /**
     * Direct multi-view PNG lookup for admin
     * Enhanced with better error handling and table detection
     */
    private function getMultiViewPNGsDirect($design_id, $order_id = null) {
        $png_table = $this->wpdb->prefix . 'yprint_design_pngs';

        // Check if table exists first
        $table_exists = $this->wpdb->get_var($this->wpdb->prepare("SHOW TABLES LIKE %s", $png_table));
        if (!$table_exists) {
            error_log("❌ [ADMIN READER] PNG table {$png_table} does not exist");
            return [];
        }

        // Check if table has multi-view support
        $table_columns = $this->wpdb->get_col("DESCRIBE {$png_table}");
        $has_view_support = in_array('view_id', $table_columns) && in_array('view_name', $table_columns);

        if (!$has_view_support) {
            error_log("⚠️ [ADMIN READER] Table {$png_table} doesn't support multi-view yet");

            // Fallback to legacy single PNG lookup
            $legacy_results = $this->wpdb->get_results($this->wpdb->prepare(
                "SELECT design_id, generated_at, save_type, LENGTH(print_png) as png_size
                 FROM {$png_table}
                 WHERE design_id = %s" . ($order_id ? " AND order_id = %s" : ""),
                $order_id ? [$design_id, $order_id] : [$design_id]
            ), ARRAY_A);

            return array_map(function($row) {
                return [
                    'design_id' => $row['design_id'],
                    'view_id' => null,
                    'view_name' => 'Main',
                    'generated_at' => $row['generated_at'],
                    'save_type' => $row['save_type'],
                    'png_size' => $row['png_size'],
                    'source' => 'legacy_database_direct'
                ];
            }, $legacy_results);
        }

        // Multi-view PNG query with order-specific and design-specific fallback
        $queries = [];

        if ($order_id) {
            // Order-specific PNGs first
            $queries[] = [
                'sql' => $this->wpdb->prepare(
                    "SELECT design_id, view_id, view_name, generated_at, save_type, order_id, LENGTH(print_png) as png_size
                     FROM {$png_table}
                     WHERE design_id = %s AND order_id = %s
                     ORDER BY view_name ASC, generated_at DESC",
                    $design_id, $order_id
                ),
                'priority' => 100,
                'source' => 'order_specific_direct'
            ];
        }

        // Design-specific PNGs (no order restriction)
        $queries[] = [
            'sql' => $this->wpdb->prepare(
                "SELECT design_id, view_id, view_name, generated_at, save_type, order_id, LENGTH(print_png) as png_size
                 FROM {$png_table}
                 WHERE design_id = %s AND (order_id IS NULL OR order_id = '')
                 ORDER BY view_name ASC, generated_at DESC",
                $design_id
            ),
            'priority' => 80,
            'source' => 'design_specific_direct'
        ];

        $all_results = [];
        foreach ($queries as $query_info) {
            $results = $this->wpdb->get_results($query_info['sql'], ARRAY_A);

            if (!empty($results)) {
                error_log("🎯 [ADMIN READER] Found " . count($results) . " PNG(s) via {$query_info['source']} for Design {$design_id}");

                foreach ($results as $row) {
                    $all_results[] = [
                        'design_id' => $row['design_id'],
                        'view_id' => $row['view_id'],
                        'view_name' => $row['view_name'] ?: ($row['view_id'] ? "View {$row['view_id']}" : 'Main'),
                        'generated_at' => $row['generated_at'],
                        'save_type' => $row['save_type'],
                        'png_size' => $row['png_size'],
                        'source' => $query_info['source'],
                        'precision_score' => $query_info['priority']
                    ];
                }

                // If we found order-specific PNGs, prioritize them
                if ($query_info['priority'] === 100 && !empty($results)) {
                    break;
                }
            }
        }

        error_log("🎯 [ADMIN READER] Total multi-view PNGs found: " . count($all_results) . " for Design {$design_id}");
        return $all_results;
    }

    /**
     * Debug function for admin
     */
    public function getDebugInfo($design_id) {
        $design_record = $this->getDesignRecord($design_id);
        $png_info = $this->getMultiViewPNGsForDesign($design_id);

        return [
            'design_exists' => !!$design_record,
            'design_data_size' => $design_record ? strlen($design_record->design_data) : 0,
            'png_count' => count($png_info),
            'png_views' => array_column($png_info, 'view_name'),
            'timestamp' => current_time('mysql')
        ];
    }
}

// Make available globally for admin usage
if (is_admin()) {
    global $admin_design_data_reader;
    $admin_design_data_reader = new AdminDesignDataReader();
}

?>