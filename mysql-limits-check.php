<?php
/**
 * 🔍 MYSQL LIMITS DIAGNOSTIC TOOL
 * Checks critical MySQL configuration for PNG storage
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    define('ABSPATH', dirname(dirname(dirname(dirname(__FILE__)))) . '/');
}

// Load WordPress
require_once(ABSPATH . 'wp-config.php');

echo "🔍 MYSQL LIMITS DIAGNOSTIC\n";
echo "========================\n\n";

global $wpdb;

if (!$wpdb) {
    echo "❌ ERROR: WordPress database connection not available\n";
    exit;
}

try {
    // 1. Check max_allowed_packet (global and session)
    echo "1️⃣ MAX_ALLOWED_PACKET ANALYSIS:\n";

    $global_result = $wpdb->get_row("SELECT @@global.max_allowed_packet AS value");
    $session_result = $wpdb->get_row("SELECT @@session.max_allowed_packet AS value");

    if ($global_result) {
        $global_mb = round($global_result->value / 1024 / 1024, 2);
        echo "   Global max_allowed_packet: " . number_format($global_result->value) . " bytes ({$global_mb} MB)\n";
    }

    if ($session_result) {
        $session_mb = round($session_result->value / 1024 / 1024, 2);
        echo "   Session max_allowed_packet: " . number_format($session_result->value) . " bytes ({$session_mb} MB)\n";
    }

    // 2. Check other relevant limits
    echo "\n2️⃣ OTHER MYSQL LIMITS:\n";

    $limits = [
        'max_packet_size' => 'Maximum packet size',
        'net_buffer_length' => 'Network buffer length',
        'bulk_insert_buffer_size' => 'Bulk insert buffer size'
    ];

    foreach ($limits as $var => $desc) {
        $result = $wpdb->get_row("SELECT @@global.{$var} AS value");
        if ($result) {
            $mb = round($result->value / 1024 / 1024, 2);
            echo "   {$desc}: " . number_format($result->value) . " bytes ({$mb} MB)\n";
        }
    }

    // 3. Estimate PNG size
    echo "\n3️⃣ PNG SIZE ESTIMATION:\n";

    // Typical PNG base64 sizes
    $png_sizes = [
        '1312x840 at 300 DPI' => 5 * 1024 * 1024,  // ~5MB for high-res
        '1312x840 at 150 DPI' => 2 * 1024 * 1024,  // ~2MB for medium-res
        'Base64 overhead (33%)' => 0.33  // Base64 adds ~33% size
    ];

    foreach ($png_sizes as $desc => $size) {
        if (is_float($size)) {
            echo "   {$desc}: {$size}x multiplier\n";
        } else {
            $mb = round($size / 1024 / 1024, 2);
            $base64_size = $size * 1.33;
            $base64_mb = round($base64_size / 1024 / 1024, 2);
            echo "   {$desc}: {$mb} MB raw, {$base64_mb} MB base64\n";
        }
    }

    // 4. Database connection info
    echo "\n4️⃣ DATABASE CONNECTION INFO:\n";

    $version = $wpdb->get_var("SELECT VERSION()");
    echo "   MySQL Version: {$version}\n";

    $connection = $wpdb->get_row("SELECT CONNECTION_ID() as id, USER() as user, DATABASE() as db");
    if ($connection) {
        echo "   Connection ID: {$connection->id}\n";
        echo "   User: {$connection->user}\n";
        echo "   Database: {$connection->db}\n";
    }

    // 5. Test table structure
    echo "\n5️⃣ PNG STORAGE TABLE ANALYSIS:\n";

    $table_name = $wpdb->prefix . 'yprint_design_pngs';

    $table_exists = $wpdb->get_var("SHOW TABLES LIKE '{$table_name}'");
    if ($table_exists) {
        echo "   Table exists: ✅ {$table_name}\n";

        $columns = $wpdb->get_results("DESCRIBE {$table_name}");
        foreach ($columns as $column) {
            if (strpos($column->Field, 'png') !== false) {
                echo "   PNG Column: {$column->Field} ({$column->Type})\n";

                // Check if LONGTEXT (max ~4GB) or TEXT (max ~64KB)
                if (strtoupper($column->Type) === 'LONGTEXT') {
                    echo "     ✅ LONGTEXT can handle large PNGs (up to ~4GB)\n";
                } elseif (strtoupper($column->Type) === 'TEXT') {
                    echo "     ⚠️  TEXT limited to ~64KB - too small for PNGs!\n";
                } elseif (strtoupper($column->Type) === 'MEDIUMTEXT') {
                    echo "     ⚠️  MEDIUMTEXT limited to ~16MB - might be tight\n";
                }
            }
        }
    } else {
        echo "   Table missing: ❌ {$table_name}\n";
    }

    // 6. Recommendations
    echo "\n6️⃣ RECOMMENDATIONS:\n";

    $global_bytes = $global_result->value ?? 0;
    $recommended_min = 10 * 1024 * 1024; // 10MB minimum

    if ($global_bytes < $recommended_min) {
        echo "   ❌ max_allowed_packet too small for PNG storage\n";
        echo "   📝 Recommended: Increase to at least 10MB\n";
        echo "   💻 Command: SET GLOBAL max_allowed_packet=10485760;\n";
    } else {
        echo "   ✅ max_allowed_packet sufficient for PNG storage\n";
    }

    echo "\n🔍 DIAGNOSTIC COMPLETE\n";

} catch (Exception $e) {
    echo "❌ ERROR during diagnostic: " . $e->getMessage() . "\n";
}
?>