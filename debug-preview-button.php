<?php
/**
 * 🔧 DIAGNOSTIC: Debug "View Design Preview" Button Issue
 *
 * This script helps diagnose why the "View Design Preview" button is disabled (ausgegraut)
 * by checking what data is actually stored in WooCommerce orders.
 */

// Prevent direct access
if (!defined('WPINC')) {
    define('WPINC', true);
}

// Load WordPress
require_once(dirname(__FILE__) . '/../../../wp-load.php');

echo "<h2>🔧 Debug: View Design Preview Button</h2>";
echo "<p>This diagnostic checks why the 'View Design Preview' button might be disabled.</p>";

// Get recent WooCommerce orders
$orders = wc_get_orders(array(
    'limit' => 10,
    'status' => array('wc-processing', 'wc-completed', 'wc-on-hold'),
    'orderby' => 'date',
    'order' => 'DESC',
));

echo "<h3>📊 Recent Orders Analysis</h3>";

if (empty($orders)) {
    echo "<p><strong>❌ No orders found.</strong> Create a test order with a design to continue testing.</p>";
    exit;
}

foreach ($orders as $order) {
    $order_id = $order->get_id();
    echo "<div style='border: 1px solid #ccc; margin: 10px 0; padding: 15px; background: #f9f9f9;'>";
    echo "<h4>Order #{$order_id} - " . $order->get_date_created()->format('Y-m-d H:i:s') . "</h4>";

    // Check for _design_data in order meta
    $stored_design_data = get_post_meta($order_id, '_design_data', true);

    echo "<div><strong>Order Meta '_design_data':</strong> ";
    if ($stored_design_data) {
        echo "✅ FOUND (" . strlen($stored_design_data) . " characters)";
        echo "<br><small>Data preview: " . substr($stored_design_data, 0, 100) . "...</small>";
    } else {
        echo "❌ NOT FOUND";
    }
    echo "</div>";

    // Check order items for design data
    $items_with_design = 0;
    $items_with_design_id = 0;

    foreach ($order->get_items() as $item_id => $item) {
        $item_design_data = $item->get_meta('_design_data');
        $item_design_id = $item->get_meta('design_id');

        if ($item_design_data) {
            $items_with_design++;
        }
        if ($item_design_id) {
            $items_with_design_id++;
        }
    }

    echo "<div><strong>Order Items with '_design_data':</strong> {$items_with_design} items</div>";
    echo "<div><strong>Order Items with 'design_id':</strong> {$items_with_design_id} items</div>";

    // Check if button would be enabled
    $button_enabled = !empty($stored_design_data);
    echo "<div><strong>Preview Button Status:</strong> " . ($button_enabled ? "✅ ENABLED" : "❌ DISABLED") . "</div>";

    // Check for designs in database
    if ($items_with_design_id > 0) {
        global $wpdb;
        $design_table = $wpdb->prefix . 'octo_user_designs';

        foreach ($order->get_items() as $item_id => $item) {
            $design_id = $item->get_meta('design_id');
            if ($design_id) {
                $print_file_data = $wpdb->get_row($wpdb->prepare(
                    "SELECT name, print_file_path, print_file_url FROM {$design_table} WHERE id = %d",
                    $design_id
                ));

                echo "<div><strong>Design ID {$design_id}:</strong> ";
                if ($print_file_data && $print_file_data->print_file_url) {
                    echo "✅ PNG FILE EXISTS - " . basename($print_file_data->print_file_url);
                } else {
                    echo "❌ NO PNG FILE";
                }
                echo "</div>";
            }
        }
    }

    echo "</div>";
}

echo "<h3>🔧 Troubleshooting Recommendations</h3>";
echo "<ul>";
echo "<li>If <strong>Order Meta '_design_data'</strong> is missing → Check if designs are being saved correctly to cart and order</li>";
echo "<li>If <strong>Order Items with 'design_id'</strong> is 0 → Check if design IDs are being stored in order items</li>";
echo "<li>If <strong>PNG FILE EXISTS</strong> is ❌ → Check if PNG generation is working (action 'save_design_png')</li>";
echo "<li>If everything looks good but button is still disabled → Check JavaScript/CSS conflicts</li>";
echo "</ul>";

echo "<h3>🛠️ Quick Fixes</h3>";
echo "<p><strong>To manually enable preview for an order:</strong></p>";
echo "<pre>update_post_meta({ORDER_ID}, '_design_data', '{\"test\": \"data\"}');</pre>";

?>