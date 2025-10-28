<?php
/**
 * 🖼️ PNG STORAGE AJAX HANDLER
 * WordPress AJAX handler for yprint_store_png action
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Register AJAX handlers
add_action('wp_ajax_yprint_store_png', 'yprint_store_png_handler');
add_action('wp_ajax_nopriv_yprint_store_png', 'yprint_store_png_handler');

function yprint_store_png_handler() {
    error_log('🖼️ PNG STORAGE: Handler reached - START VALIDATION');

    // Security nonce check (optional for testing)
    if (isset($_POST['nonce']) && !wp_verify_nonce($_POST['nonce'], 'yprint_nonce')) {
        error_log('❌ PNG STORAGE: Security nonce verification failed');
        wp_send_json_error('Security check failed');
        return;
    }

    // Basic parameter validation
    if (!isset($_POST['design_id']) || empty($_POST['design_id'])) {
        error_log('❌ PNG STORAGE: Missing design_id parameter');
        wp_send_json_error('Missing design_id parameter');
        return;
    }

    if (!isset($_POST['print_png']) || empty($_POST['print_png'])) {
        error_log('❌ PNG STORAGE: Missing print_png parameter');
        wp_send_json_error('Missing print_png parameter');
        return;
    }

    $design_id = sanitize_text_field($_POST['design_id']);
    $print_png = $_POST['print_png']; // Don't sanitize base64 data
    $save_type = isset($_POST['save_type']) ? sanitize_text_field($_POST['save_type']) : 'unknown';
    $order_id = isset($_POST['order_id']) ? sanitize_text_field($_POST['order_id']) : null;

    error_log("🖼️ PNG STORAGE: About to save PNG file...");
    error_log("   Design ID: {$design_id}");
    error_log("   Save Type: {$save_type}");
    error_log("   PNG Size: " . strlen($print_png) . " characters");
    error_log("   PNG Size MB: " . round(strlen($print_png) / 1024 / 1024, 2));

    global $wpdb;

    // Prepare data for storage
    $png_data = array(
        'design_id' => $design_id,
        'print_png' => $print_png,
        'save_type' => $save_type,
        'order_id' => $order_id,
        'generated_at' => current_time('mysql'),
        'template_id' => isset($_POST['template_id']) ? sanitize_text_field($_POST['template_id']) : 'unknown',
        'print_area_px' => isset($_POST['print_area_px']) ? sanitize_text_field($_POST['print_area_px']) : '{}',
        'print_area_mm' => isset($_POST['print_area_mm']) ? sanitize_text_field($_POST['print_area_mm']) : '{}',
        'metadata' => isset($_POST['metadata']) ? sanitize_text_field($_POST['metadata']) : '{}'
    );

    $table_name = $wpdb->prefix . 'yprint_design_pngs';

    // Check if table exists
    $table_exists = $wpdb->get_var("SHOW TABLES LIKE '{$table_name}'");

    if (!$table_exists) {
        error_log("❌ PNG STORAGE: Table does not exist: {$table_name}");

        // Try to create table
        $sql = "CREATE TABLE {$table_name} (
            id int(11) NOT NULL AUTO_INCREMENT,
            design_id varchar(255) NOT NULL,
            print_png LONGTEXT NOT NULL,
            save_type varchar(100) DEFAULT 'unknown',
            order_id varchar(255) DEFAULT NULL,
            generated_at datetime DEFAULT CURRENT_TIMESTAMP,
            template_id varchar(100) DEFAULT 'unknown',
            print_area_px TEXT DEFAULT '{}',
            print_area_mm TEXT DEFAULT '{}',
            metadata TEXT DEFAULT '{}',
            PRIMARY KEY (id),
            KEY design_id (design_id),
            KEY save_type (save_type),
            KEY generated_at (generated_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);

        error_log("✅ PNG STORAGE: Table created: {$table_name}");
    }

    // Insert PNG data
    error_log('💾 PNG STORAGE: Attempting database insert...');

    $result = $wpdb->insert(
        $table_name,
        $png_data,
        array(
            '%s', // design_id
            '%s', // print_png (LONGTEXT)
            '%s', // save_type
            '%s', // order_id
            '%s', // generated_at
            '%s', // template_id
            '%s', // print_area_px
            '%s', // print_area_mm
            '%s'  // metadata
        )
    );

    if ($result === false) {
        $error = $wpdb->last_error;
        error_log("❌ PNG STORAGE: Database insert failed: {$error}");

        // Check for specific MySQL errors
        if (strpos($error, 'Data too long') !== false) {
            error_log("❌ PNG STORAGE: Data too long - PNG size exceeds column limit");
            wp_send_json_error('PNG data too large for database storage');
        } elseif (strpos($error, 'max_allowed_packet') !== false) {
            error_log("❌ PNG STORAGE: max_allowed_packet exceeded");
            wp_send_json_error('PNG data exceeds MySQL packet size limit');
        } else {
            wp_send_json_error('Database insert failed: ' . $error);
        }
        return;
    }

    $insert_id = $wpdb->insert_id;
    error_log("✅ PNG STORAGE: Successfully stored PNG with ID: {$insert_id}");

    // Generate PNG URL (placeholder for now)
    $png_url = home_url("/wp-content/uploads/yprint_pngs/{$design_id}.png");

    $response_data = array(
        'design_id' => $design_id,
        'png_id' => $insert_id,
        'png_url' => $png_url,
        'save_type' => $save_type,
        'order_id' => $order_id,
        'storage_method' => 'database',
        'png_size_chars' => strlen($print_png),
        'png_size_mb' => round(strlen($print_png) / 1024 / 1024, 2),
        'generated_at' => $png_data['generated_at']
    );

    error_log("🎉 PNG STORAGE: Complete success! Response: " . json_encode($response_data));

    wp_send_json_success($response_data);
}

// Auto-load this handler
if (function_exists('add_action')) {
    error_log('✅ PNG STORAGE HANDLER: Loaded and registered');
} else {
    error_log('❌ PNG STORAGE HANDLER: WordPress not available');
}
?>