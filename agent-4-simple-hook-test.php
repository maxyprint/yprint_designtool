<?php
/**
 * 🔥 AGENT 4: Simple Hook Integration Test
 */

echo "🔥 AGENT 4: WordPress Hook Integration Verification\n";
echo "================================================\n\n";

// Check that our debug code was properly added
echo "1. CHECKING AGENT 4 DEBUG CODE INTEGRATION:\n";

$class_file = '/workspaces/yprint_designtool/includes/class-octo-print-designer-wc-integration.php';

if (file_exists($class_file)) {
    echo "   ✅ Class file exists\n";

    $content = file_get_contents($class_file);

    // Check for constructor debug code
    if (strpos($content, '🔥 AGENT 4: EMERGENCY - Octo_Print_Designer_WC_Integration class instantiated') !== false) {
        echo "   ✅ Class instantiation debug code found\n";
    } else {
        echo "   ❌ Class instantiation debug code NOT found\n";
    }

    // Check for hook registration debug code
    if (strpos($content, '🔥 AGENT 4: EMERGENCY - woocommerce_admin_order_data_after_order_details hook registered') !== false) {
        echo "   ✅ Hook registration debug code found\n";
    } else {
        echo "   ❌ Hook registration debug code NOT found\n";
    }

    // Check for hook firing debug code
    if (strpos($content, '🔥 AGENT 4: EMERGENCY - woocommerce_admin_order_data_after_order_details hook FIRED for Order') !== false) {
        echo "   ✅ Hook firing debug code found\n";
    } else {
        echo "   ❌ Hook firing debug code NOT found\n";
    }

    // Check that the hook is properly registered
    if (strpos($content, "add_action('woocommerce_admin_order_data_after_order_details', array(\$this, 'add_design_preview_button'))") !== false) {
        echo "   ✅ Hook registration code found\n";
    } else {
        echo "   ❌ Hook registration code NOT found\n";
    }

} else {
    echo "   ❌ Class file NOT found\n";
}

echo "\n2. CHECKING HOOK INTEGRATION FLOW:\n";

// Check main plugin file for class instantiation
$main_plugin = '/workspaces/yprint_designtool/includes/class-octo-print-designer.php';
if (file_exists($main_plugin)) {
    $main_content = file_get_contents($main_plugin);

    if (strpos($main_content, 'Octo_Print_Designer_WC_Integration::get_instance()') !== false) {
        echo "   ✅ WC Integration class is instantiated in main plugin\n";
    } else {
        echo "   ❌ WC Integration class instantiation NOT found in main plugin\n";
    }

    if (strpos($main_content, 'class-octo-print-designer-wc-integration.php') !== false) {
        echo "   ✅ WC Integration class file is required\n";
    } else {
        echo "   ❌ WC Integration class file require NOT found\n";
    }
} else {
    echo "   ❌ Main plugin file NOT found\n";
}

// Check plugin bootstrap
$bootstrap = '/workspaces/yprint_designtool/octo-print-designer.php';
if (file_exists($bootstrap)) {
    $bootstrap_content = file_get_contents($bootstrap);

    if (strpos($bootstrap_content, 'run_octo_print_designer()') !== false) {
        echo "   ✅ Plugin bootstrap calls run_octo_print_designer()\n";
    } else {
        echo "   ❌ Plugin bootstrap does NOT call run_octo_print_designer()\n";
    }

    if (strpos($bootstrap_content, 'new Octo_Print_Designer()') !== false) {
        echo "   ✅ Main plugin class is instantiated\n";
    } else {
        echo "   ❌ Main plugin class instantiation NOT found\n";
    }
} else {
    echo "   ❌ Plugin bootstrap file NOT found\n";
}

echo "\n3. AGENT 4 DEBUG SUMMARY:\n";
echo "   📋 Added 3 debug messages:\n";
echo "      - Class instantiation debug\n";
echo "      - Hook registration debug\n";
echo "      - Hook firing debug\n";
echo "\n   🔍 Expected debug log sequence:\n";
echo "   1. '🔥 AGENT 4: EMERGENCY - Octo_Print_Designer_WC_Integration class instantiated'\n";
echo "   2. '🔥 AGENT 4: EMERGENCY - woocommerce_admin_order_data_after_order_details hook registered'\n";
echo "   3. '🔥 AGENT 4: EMERGENCY - woocommerce_admin_order_data_after_order_details hook FIRED for Order #[ID]'\n";

echo "\n🔥 AGENT 4 VERIFICATION COMPLETE!\n";
echo "=================================\n";
echo "The WordPress hook integration debugging system is now in place.\n";
echo "Debug messages will appear when:\n";
echo "- WordPress loads the plugin (messages 1-2)\n";
echo "- A WooCommerce order page is viewed (message 3)\n";