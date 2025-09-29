<?php
/**
 * WooCommerce Hook Integration Diagnostics
 * Tests if the woocommerce_admin_order_data_after_order_details hook is properly firing
 */

// Simulate WordPress environment
define('WP_USE_THEMES', false);
require_once($_SERVER['DOCUMENT_ROOT'] . '/wp-load.php');

echo "🧪 WOOCOMMERCE HOOK INTEGRATION DIAGNOSTICS\n";
echo "==========================================\n\n";

// 1. Check if WooCommerce is active
echo "1. WOOCOMMERCE STATUS:\n";
if (class_exists('WooCommerce')) {
    echo "   ✅ WooCommerce is active\n";
    global $woocommerce;
    echo "   📊 Version: " . $woocommerce->version . "\n";
} else {
    echo "   ❌ WooCommerce is NOT active\n";
    exit("CRITICAL: WooCommerce must be active for hook to work\n");
}

// 2. Check if our plugin is loaded
echo "\n2. PLUGIN STATUS:\n";
if (class_exists('Octo_Print_Designer_WC_Integration')) {
    echo "   ✅ Octo_Print_Designer_WC_Integration class exists\n";

    // Check if the instance exists
    $wc_integration = Octo_Print_Designer_WC_Integration::get_instance();
    if ($wc_integration) {
        echo "   ✅ WC Integration instance created successfully\n";
    } else {
        echo "   ❌ WC Integration instance creation failed\n";
    }
} else {
    echo "   ❌ Octo_Print_Designer_WC_Integration class NOT found\n";
    exit("CRITICAL: Plugin class not loaded\n");
}

// 3. Check if the hook is registered
echo "\n3. HOOK REGISTRATION CHECK:\n";
global $wp_filter;

$hook_name = 'woocommerce_admin_order_data_after_order_details';
if (isset($wp_filter[$hook_name])) {
    echo "   ✅ Hook '$hook_name' is registered\n";

    // Check if our callback is attached
    $callbacks = $wp_filter[$hook_name]->callbacks;
    $found_our_callback = false;

    foreach ($callbacks as $priority => $priority_callbacks) {
        foreach ($priority_callbacks as $callback_id => $callback_data) {
            $callback = $callback_data['function'];

            // Check if this is our callback
            if (is_array($callback) &&
                is_object($callback[0]) &&
                get_class($callback[0]) === 'Octo_Print_Designer_WC_Integration' &&
                $callback[1] === 'add_design_preview_button') {

                echo "   ✅ Our callback 'add_design_preview_button' is attached at priority $priority\n";
                $found_our_callback = true;
            }
        }
    }

    if (!$found_our_callback) {
        echo "   ❌ Our callback 'add_design_preview_button' is NOT attached to this hook\n";
    }

    // List all callbacks for debugging
    echo "   📋 All callbacks registered to this hook:\n";
    foreach ($callbacks as $priority => $priority_callbacks) {
        foreach ($priority_callbacks as $callback_id => $callback_data) {
            $callback = $callback_data['function'];
            if (is_array($callback)) {
                $class_name = is_object($callback[0]) ? get_class($callback[0]) : $callback[0];
                echo "      - Priority $priority: {$class_name}::{$callback[1]}\n";
            } elseif (is_string($callback)) {
                echo "      - Priority $priority: $callback\n";
            } else {
                echo "      - Priority $priority: " . gettype($callback) . "\n";
            }
        }
    }
} else {
    echo "   ❌ Hook '$hook_name' is NOT registered\n";

    // Check if it's a valid WooCommerce hook
    if (function_exists('wc_get_template')) {
        echo "   🔍 This should be a valid WooCommerce admin hook\n";
        echo "   💡 The hook might not exist in your WooCommerce version\n";
    }
}

// 4. Test if we can manually call the hook
echo "\n4. MANUAL HOOK EXECUTION TEST:\n";
if (function_exists('do_action')) {
    // Try to get Order 5374
    if (function_exists('wc_get_order')) {
        $order = wc_get_order(5374);
        if ($order && $order instanceof WC_Order) {
            echo "   ✅ Order 5374 found and is valid WC_Order\n";
            echo "   🧪 Attempting to manually trigger the hook...\n";

            // Capture output
            ob_start();
            do_action('woocommerce_admin_order_data_after_order_details', $order);
            $output = ob_get_clean();

            if (!empty($output)) {
                echo "   ✅ Hook fired and produced output (" . strlen($output) . " characters)\n";
                echo "   📄 Output preview (first 200 chars):\n";
                echo "   " . substr(strip_tags($output), 0, 200) . "...\n";
            } else {
                echo "   ❌ Hook fired but produced no output\n";
            }
        } else {
            echo "   ❌ Order 5374 not found or invalid\n";

            // Try to create a test order
            echo "   🧪 Creating a test order...\n";
            $test_order = wc_create_order();
            if ($test_order) {
                echo "   ✅ Test order created: #" . $test_order->get_id() . "\n";

                ob_start();
                do_action('woocommerce_admin_order_data_after_order_details', $test_order);
                $output = ob_get_clean();

                if (!empty($output)) {
                    echo "   ✅ Hook fired with test order and produced output\n";
                } else {
                    echo "   ❌ Hook fired with test order but produced no output\n";
                }
            } else {
                echo "   ❌ Failed to create test order\n";
            }
        }
    } else {
        echo "   ❌ wc_get_order() function not available\n";
    }
} else {
    echo "   ❌ do_action() function not available\n";
}

// 5. Check WooCommerce admin context
echo "\n5. WOOCOMMERCE ADMIN CONTEXT:\n";
if (is_admin()) {
    echo "   ✅ Currently in WordPress admin context\n";
} else {
    echo "   ⚠️ Not in WordPress admin context (hook only fires in admin)\n";
}

// Check if we're on the right page
global $pagenow, $post_type;
echo "   📍 Current page: " . ($pagenow ?: 'unknown') . "\n";
echo "   📍 Post type: " . ($post_type ?: 'unknown') . "\n";

// 6. Advanced debugging - Check if the method exists and is callable
echo "\n6. METHOD VALIDATION:\n";
$wc_integration = Octo_Print_Designer_WC_Integration::get_instance();
if (method_exists($wc_integration, 'add_design_preview_button')) {
    echo "   ✅ Method 'add_design_preview_button' exists\n";

    if (is_callable(array($wc_integration, 'add_design_preview_button'))) {
        echo "   ✅ Method is callable\n";
    } else {
        echo "   ❌ Method exists but is not callable\n";
    }
} else {
    echo "   ❌ Method 'add_design_preview_button' does not exist\n";
}

// 7. Check for conflicting plugins or themes
echo "\n7. POTENTIAL CONFLICTS:\n";
$active_plugins = get_option('active_plugins', array());
$woocommerce_related = array_filter($active_plugins, function($plugin) {
    return strpos(strtolower($plugin), 'woocommerce') !== false;
});

echo "   📋 WooCommerce-related active plugins:\n";
foreach ($woocommerce_related as $plugin) {
    echo "      - $plugin\n";
}

echo "\n🎯 SUMMARY:\n";
echo "===========\n";
if (class_exists('WooCommerce') && class_exists('Octo_Print_Designer_WC_Integration')) {
    if (isset($wp_filter[$hook_name])) {
        echo "✅ Hook system appears to be working correctly\n";
        echo "💡 If you don't see the button, check:\n";
        echo "   - Are you viewing Order 5374 in WooCommerce admin?\n";
        echo "   - Is the order page fully loaded?\n";
        echo "   - Check browser console for JavaScript errors\n";
        echo "   - Check WordPress debug.log for PHP errors\n";
    } else {
        echo "❌ Hook is not properly registered\n";
        echo "💡 This indicates the plugin hooks are not being initialized\n";
    }
} else {
    echo "❌ Core requirements not met (WooCommerce or Plugin not active)\n";
}

echo "\n🐛 DEBUGGING COMMANDS:\n";
echo "======================\n";
echo "1. Check WordPress debug log: tail -f /path/to/wp-content/debug.log\n";
echo "2. Enable WP_DEBUG in wp-config.php\n";
echo "3. Check browser console on Order 5374 page\n";
echo "4. Verify WooCommerce admin order page URL structure\n";

?>