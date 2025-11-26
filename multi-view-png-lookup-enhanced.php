<?php
/**
 * 🎯 MULTI-VIEW PNG LOOKUP ENHANCED
 *
 * Enhanced version of PNG matching that supports multiple views per design
 * Returns ALL view-specific PNGs for a design, properly labeled by view
 *
 * FEATURES:
 * - View-specific PNG lookup
 * - Backward compatibility with single-PNG designs
 * - Proper view identification (Front, Back, etc.)
 * - Precision scoring maintained
 */

/**
 * Enhanced multi-view PNG lookup function
 * Replaces get_precise_png_for_order_item() to support multiple views
 */
function get_multi_view_pngs_for_order_item($design_id, $order_id, $item_id, $design) {
    global $wpdb;

    error_log("🎯 [MULTI-VIEW PNG] Starting multi-view PNG lookup for Design {$design_id}, Order {$order_id}, Item {$item_id}");

    $png_results = array();
    $png_table = $wpdb->prefix . 'yprint_design_pngs';

    // Check if table has view_id column (multi-view support)
    $table_columns = $wpdb->get_col("DESCRIBE {$png_table}");
    $has_view_support = in_array('view_id', $table_columns) && in_array('view_name', $table_columns);

    if ($has_view_support) {
        error_log("✅ [MULTI-VIEW PNG] Table supports multi-view (view_id column exists)");

        // METHOD 1: Multi-view order-specific PNGs
        $order_specific_pngs = $wpdb->get_results($wpdb->prepare(
            "SELECT design_id, print_png, generated_at, save_type, order_id, template_id, metadata_json, view_id, view_name
             FROM {$png_table}
             WHERE design_id = %s AND order_id = %s
             ORDER BY view_name ASC, generated_at DESC",
            $design_id,
            $order_id
        ), ARRAY_A);

        if (!empty($order_specific_pngs)) {
            foreach ($order_specific_pngs as $png_record) {
                $view_label = $png_record['view_name'] ?: ($png_record['view_id'] ? "View {$png_record['view_id']}" : 'Main');
                error_log("🎯 [MULTI-VIEW PNG] Found order-specific PNG: Design {$design_id}, View: {$view_label}");

                // Generate temporary URL for this PNG
                $temp_url = generate_temp_png_url($png_record['print_png'], $design_id, $order_id . '_' . ($png_record['view_id'] ?: 'main'));

                $png_results[] = array(
                    'design_id' => $design_id,
                    'design_name' => $design['name'] ?: 'Design #' . $design_id,
                    'print_file_url' => $temp_url,
                    'print_file_path' => 'database_stored',
                    'item_name' => "Order-specific {$view_label}: " . ($design['name'] ?: 'Design #' . $design_id),
                    'source' => 'order_specific_multiview',
                    'generated_at' => $png_record['generated_at'],
                    'save_type' => $png_record['save_type'],
                    'view_id' => $png_record['view_id'],
                    'view_name' => $view_label,
                    'precision_score' => 100 // Highest priority
                );
            }
        }

        // METHOD 2: Multi-view design-specific PNGs (if no order-specific found)
        if (empty($png_results)) {
            $design_pngs = $wpdb->get_results($wpdb->prepare(
                "SELECT design_id, print_png, generated_at, save_type, template_id, view_id, view_name
                 FROM {$png_table}
                 WHERE design_id = %s AND (order_id IS NULL OR order_id = '')
                 ORDER BY view_name ASC, generated_at DESC",
                $design_id
            ), ARRAY_A);

            if (!empty($design_pngs)) {
                foreach ($design_pngs as $png_record) {
                    $view_label = $png_record['view_name'] ?: ($png_record['view_id'] ? "View {$png_record['view_id']}" : 'Main');
                    error_log("🎯 [MULTI-VIEW PNG] Found design-specific PNG: Design {$design_id}, View: {$view_label}");

                    $temp_url = generate_temp_png_url($png_record['print_png'], $design_id, 'generic_' . ($png_record['view_id'] ?: 'main'));

                    $png_results[] = array(
                        'design_id' => $design_id,
                        'design_name' => $design['name'] ?: 'Design #' . $design_id,
                        'print_file_url' => $temp_url,
                        'print_file_path' => 'database_stored',
                        'item_name' => "Design {$view_label}: " . ($design['name'] ?: 'Design #' . $design_id),
                        'source' => 'design_specific_multiview',
                        'generated_at' => $png_record['generated_at'],
                        'save_type' => $png_record['save_type'],
                        'view_id' => $png_record['view_id'],
                        'view_name' => $view_label,
                        'precision_score' => 80
                    );
                }
            }
        }

    } else {
        error_log("⚠️ [MULTI-VIEW PNG] Table doesn't support multi-view yet - falling back to legacy mode");

        // Fallback to original single-PNG lookup for backward compatibility
        $legacy_pngs = $wpdb->get_results($wpdb->prepare(
            "SELECT design_id, print_png, generated_at, save_type, order_id, template_id
             FROM {$png_table}
             WHERE design_id = %s
             ORDER BY generated_at DESC
             LIMIT 1",
            $design_id
        ), ARRAY_A);

        if (!empty($legacy_pngs)) {
            foreach ($legacy_pngs as $png_record) {
                error_log("🎯 [MULTI-VIEW PNG] Found legacy PNG for Design {$design_id}");

                $temp_url = generate_temp_png_url($png_record['print_png'], $design_id, 'legacy');

                $png_results[] = array(
                    'design_id' => $design_id,
                    'design_name' => $design['name'] ?: 'Design #' . $design_id,
                    'print_file_url' => $temp_url,
                    'print_file_path' => 'database_stored',
                    'item_name' => "Legacy: " . ($design['name'] ?: 'Design #' . $design_id),
                    'source' => 'legacy_single',
                    'generated_at' => $png_record['generated_at'],
                    'save_type' => $png_record['save_type'],
                    'view_id' => null,
                    'view_name' => 'Single View',
                    'precision_score' => 50
                );
            }
        }
    }

    // METHOD 3: Fallback to old file-based method if no database results
    if (empty($png_results)) {
        if (!empty($design['print_file_url']) && !empty($design['print_file_path'])) {
            error_log("🎯 [MULTI-VIEW PNG] Falling back to file-based method for Design {$design_id}");

            $png_results[] = array(
                'design_id' => $design_id,
                'design_name' => $design['name'] ?: 'Design #' . $design_id,
                'print_file_url' => $design['print_file_url'],
                'print_file_path' => $design['print_file_path'],
                'item_name' => "File-based: " . ($design['name'] ?: 'Design #' . $design_id),
                'source' => 'legacy_file',
                'generated_at' => 'unknown',
                'save_type' => 'legacy',
                'view_id' => null,
                'view_name' => 'File-based',
                'precision_score' => 25
            );
        }
    }

    // Sort by precision score (highest first), then by view_name for consistent ordering
    usort($png_results, function($a, $b) {
        if ($a['precision_score'] !== $b['precision_score']) {
            return $b['precision_score'] - $a['precision_score'];
        }
        return strcmp($a['view_name'] ?? '', $b['view_name'] ?? '');
    });

    $view_count = count($png_results);
    $view_names = array_map(function($png) { return $png['view_name']; }, $png_results);

    error_log("🎯 [MULTI-VIEW PNG] Final result for Design {$design_id}: {$view_count} PNG(s) found - Views: " . implode(', ', $view_names));

    return $png_results;
}

/**
 * Enhanced temporary PNG URL generator with view context
 */
function generate_temp_png_url($png_binary_data, $design_id, $order_context) {
    // Create temporary file
    $upload_dir = wp_upload_dir();
    $temp_dir = $upload_dir['basedir'] . '/yprint-temp-pngs/';

    if (!file_exists($temp_dir)) {
        wp_mkdir_p($temp_dir);
    }

    $temp_filename = sprintf(
        'temp_png_%s_%s_%s.png',
        $design_id,
        $order_context,
        uniqid()
    );

    $temp_path = $temp_dir . $temp_filename;
    $temp_url = $upload_dir['baseurl'] . '/yprint-temp-pngs/' . $temp_filename;

    // Write PNG binary data to temporary file
    if (file_put_contents($temp_path, $png_binary_data)) {
        error_log("🎯 [MULTI-VIEW PNG TEMP] Created temporary PNG: {$temp_url}");
        return $temp_url;
    }

    error_log("❌ [MULTI-VIEW PNG TEMP] Failed to create temporary PNG for Design {$design_id}");
    return null;
}

/**
 * Replacement code for WooCommerce integration ajax_refresh_print_data()
 * Use this in place of the original PNG lookup logic
 */
function replacement_multiview_png_lookup_code() {
    return '
    // 🎯 MULTI-VIEW FIX: Use enhanced multi-view PNG lookup
    $multiview_pngs = get_multi_view_pngs_for_order_item($design_id, $order_id, $item_id, $design);

    if (!empty($multiview_pngs)) {
        foreach ($multiview_pngs as $png_info) {
            $png_files_found[] = $png_info;
            $debug_info[] = sprintf(
                "Design %s (%s): ✅ PNG found (%s) - %s",
                $design_id,
                $png_info["view_name"],
                $png_info["source"],
                basename($png_info["print_file_url"])
            );
            error_log(sprintf(
                "✅ [MULTI-VIEW PNG] Design %s (%s): Found %s PNG at %s (score: %d)",
                $design_id,
                $png_info["view_name"],
                $png_info["source"],
                $png_info["print_file_url"],
                $png_info["precision_score"]
            ));
        }
    } else {
        $debug_info[] = "Design {$design_id}: ❌ No PNG files found with multi-view matching";
        error_log("❌ [MULTI-VIEW PNG] Design {$design_id}: No PNG files found with any method");
    }
    ';
}

/**
 * SUMMARY OF MULTI-VIEW ENHANCEMENT:
 *
 * ✅ MULTI-VIEW SUPPORT: Returns separate PNGs for Front, Back, etc.
 * ✅ VIEW IDENTIFICATION: Each PNG labeled with view name
 * ✅ BACKWARD COMPATIBILITY: Works with existing single-PNG designs
 * ✅ PRECISION SCORING: Maintains priority system
 * ✅ PROPER ORDERING: Results sorted by score and view name
 *
 * RESULT STRUCTURE:
 * - Multi-view design: [
 *     {view_name: "Front", precision_score: 100, ...},
 *     {view_name: "Back", precision_score: 100, ...}
 *   ]
 * - Legacy design: [
 *     {view_name: "Single View", precision_score: 50, ...}
 *   ]
 */
?>