<?php
/**
 * 🔍 MYSQL DIAGNOSTIC AJAX HANDLER
 * WordPress AJAX handler for MySQL limits checking
 */

// Add AJAX handlers
add_action('wp_ajax_yprint_mysql_diagnostic', 'yprint_mysql_diagnostic_handler');
add_action('wp_ajax_nopriv_yprint_mysql_diagnostic', 'yprint_mysql_diagnostic_handler');

function yprint_mysql_diagnostic_handler() {
    // Verify nonce (optional for diagnostic)
    // if (!wp_verify_nonce($_POST['nonce'], 'yprint_nonce')) {
    //     wp_die('Security check failed');
    // }

    global $wpdb;

    $diagnostic_data = array();
    $recommendations = array();

    try {
        // 1. Check max_allowed_packet
        $max_packet_result = $wpdb->get_row("SELECT @@global.max_allowed_packet AS value");
        if ($max_packet_result) {
            $diagnostic_data['max_allowed_packet'] = (int) $max_packet_result->value;
            $mb = round($max_packet_result->value / 1024 / 1024, 2);
            $diagnostic_data['max_allowed_packet_mb'] = $mb;

            // Check if sufficient
            $min_recommended = 10 * 1024 * 1024; // 10MB
            if ($max_packet_result->value < $min_recommended) {
                $recommendations[] = "❌ max_allowed_packet too small ({$mb} MB). Increase to 10+ MB";
                $diagnostic_data['max_packet_sufficient'] = false;
            } else {
                $recommendations[] = "✅ max_allowed_packet sufficient ({$mb} MB)";
                $diagnostic_data['max_packet_sufficient'] = true;
            }
        }

        // 2. Get MySQL version
        $version = $wpdb->get_var("SELECT VERSION()");
        if ($version) {
            $diagnostic_data['mysql_version'] = $version;
        }

        // 3. Check PNG table structure
        $table_name = $wpdb->prefix . 'yprint_design_pngs';
        $table_exists = $wpdb->get_var("SHOW TABLES LIKE '{$table_name}'");

        $diagnostic_data['table_info'] = array();

        if ($table_exists) {
            $diagnostic_data['table_info']['table_exists'] = true;
            $diagnostic_data['table_info']['table_name'] = $table_name;

            // Check column types
            $columns = $wpdb->get_results("DESCRIBE {$table_name}");
            foreach ($columns as $column) {
                if (strpos($column->Field, 'png') !== false) {
                    $diagnostic_data['table_info'][$column->Field] = $column->Type;

                    // Analyze column capacity
                    $type = strtoupper($column->Type);
                    if ($type === 'LONGTEXT') {
                        $recommendations[] = "✅ {$column->Field} uses LONGTEXT (up to ~4GB)";
                    } elseif ($type === 'TEXT') {
                        $recommendations[] = "❌ {$column->Field} uses TEXT (~64KB limit) - too small for PNGs!";
                    } elseif ($type === 'MEDIUMTEXT') {
                        $recommendations[] = "⚠️ {$column->Field} uses MEDIUMTEXT (~16MB) - might be tight";
                    }
                }
            }
        } else {
            $diagnostic_data['table_info']['table_exists'] = false;
            $recommendations[] = "❌ PNG storage table not found: {$table_name}";
        }

        // 4. Check other relevant MySQL settings
        $other_settings = array(
            'net_buffer_length' => 'Network buffer length',
            'bulk_insert_buffer_size' => 'Bulk insert buffer size'
        );

        foreach ($other_settings as $setting => $description) {
            $result = $wpdb->get_row("SELECT @@global.{$setting} AS value");
            if ($result) {
                $diagnostic_data[$setting] = (int) $result->value;
                $mb = round($result->value / 1024 / 1024, 2);
                $diagnostic_data[$setting . '_mb'] = $mb;
            }
        }

        // 5. Estimate typical PNG sizes
        $diagnostic_data['png_size_estimates'] = array(
            'high_res_png_raw' => 5 * 1024 * 1024,  // 5MB
            'high_res_png_base64' => 6.65 * 1024 * 1024,  // 5MB * 1.33
            'medium_res_png_raw' => 2 * 1024 * 1024,  // 2MB
            'medium_res_png_base64' => 2.66 * 1024 * 1024   // 2MB * 1.33
        );

        // 6. Connection info
        $connection = $wpdb->get_row("SELECT CONNECTION_ID() as id, USER() as user, DATABASE() as db");
        if ($connection) {
            $diagnostic_data['connection_info'] = array(
                'connection_id' => $connection->id,
                'user' => $connection->user,
                'database' => $connection->db
            );
        }

        $diagnostic_data['recommendations'] = $recommendations;
        $diagnostic_data['timestamp'] = current_time('mysql');

        // Log the diagnostic for debugging
        error_log('🔍 MYSQL DIAGNOSTIC: ' . json_encode($diagnostic_data));

        wp_send_json_success($diagnostic_data);

    } catch (Exception $e) {
        error_log('❌ MYSQL DIAGNOSTIC ERROR: ' . $e->getMessage());
        wp_send_json_error(array(
            'message' => 'MySQL diagnostic failed: ' . $e->getMessage(),
            'timestamp' => current_time('mysql')
        ));
    }
}

// Load the handler
yprint_mysql_diagnostic_handler();
?>