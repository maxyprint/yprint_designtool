<?php
/**
 * AGENT 4: WordPress Plugin Activation Status Checker
 * Critical WordPress environment verification tool
 */

// Allow direct access for testing
define('WP_USE_THEMES', false);

// Try to locate WordPress (common paths for Local by Flywheel)
$wp_config_paths = [
    '/Users/maxschwarz/Local Sites/test-site/app/public/wp-config.php',
    '/Users/maxschwarz/Desktop/Local Sites/test-site/app/public/wp-config.php',
    './wp-config.php',
    '../wp-config.php',
    '../../wp-config.php',
    '../../../wp-config.php'
];

$wp_found = false;
foreach ($wp_config_paths as $wp_config_path) {
    if (file_exists($wp_config_path)) {
        echo "🎯 WordPress found at: $wp_config_path\n";
        require_once $wp_config_path;
        $wp_found = true;
        break;
    }
}

if (!$wp_found) {
    echo "❌ WordPress not found. Standalone analysis:\n\n";
    echo "🔍 PLUGIN STRUCTURE ANALYSIS:\n";
    echo "================================\n\n";

    // Check plugin main file
    $main_file = __DIR__ . '/octo-print-designer.php';
    if (file_exists($main_file)) {
        echo "✅ Main plugin file exists: octo-print-designer.php\n";

        // Check plugin header
        $content = file_get_contents($main_file);
        if (preg_match('/Plugin Name:\s*(.+)/', $content, $matches)) {
            echo "✅ Plugin Name: " . trim($matches[1]) . "\n";
        }
        if (preg_match('/Version:\s*(.+)/', $content, $matches)) {
            echo "✅ Plugin Version: " . trim($matches[1]) . "\n";
        }

        // Check if plugin initialization functions exist
        if (strpos($content, 'run_octo_print_designer()') !== false) {
            echo "✅ Plugin initialization function found\n";
        }

        if (strpos($content, 'register_activation_hook') !== false) {
            echo "✅ Activation hook registered\n";
        }

    } else {
        echo "❌ Main plugin file not found\n";
    }

    // Check critical class files
    $critical_files = [
        'includes/class-octo-print-designer.php' => 'Main plugin class',
        'includes/class-octo-print-designer-loader.php' => 'Hook loader',
        'public/class-octo-print-designer-public.php' => 'Public scripts',
        'admin/class-octo-print-designer-settings.php' => 'Settings class',
        'includes/class-octo-print-designer-wc-integration.php' => 'WooCommerce integration'
    ];

    echo "\n📁 CRITICAL FILES CHECK:\n";
    echo "========================\n";

    foreach ($critical_files as $file => $description) {
        $path = __DIR__ . '/' . $file;
        if (file_exists($path)) {
            echo "✅ $description: $file\n";
        } else {
            echo "❌ $description: $file MISSING\n";
        }
    }

    // Check PNG system files
    echo "\n🖨️ PNG SYSTEM FILES CHECK:\n";
    echo "===========================\n";

    $png_files = [
        'public/js/high-dpi-png-export-engine.js' => 'PNG Export Engine',
        'public/js/png-only-system-integration.js' => 'PNG Integration',
        'public/js/async-png-upload-system.js' => 'Async PNG Upload',
        'includes/class-png-storage-handler.php' => 'PNG Storage Handler'
    ];

    foreach ($png_files as $file => $description) {
        $path = __DIR__ . '/' . $file;
        if (file_exists($path)) {
            echo "✅ $description: $file\n";
        } else {
            echo "❌ $description: $file MISSING\n";
        }
    }

    echo "\n📊 ANALYSIS SUMMARY:\n";
    echo "===================\n";
    echo "WordPress Environment: NOT CONNECTED\n";
    echo "Plugin Files Status: Check individual files above\n";
    echo "Recommendation: Ensure WordPress is running and plugin is activated\n";

    exit;
}

// WordPress found - proceed with real checks
echo "\n🚀 AGENT 4: WordPress Plugin Activation Validation\n";
echo "==================================================\n\n";

require_once ABSPATH . 'wp-admin/includes/plugin.php';

// Check plugin activation status
$plugin_file = 'yprint_designtool/octo-print-designer.php';
$is_active = is_plugin_active($plugin_file);

echo "🔍 PLUGIN ACTIVATION STATUS:\n";
echo "============================\n";
echo "Plugin File: $plugin_file\n";
echo "Status: " . ($is_active ? "✅ ACTIVE" : "❌ INACTIVE") . "\n";

if (!$is_active) {
    echo "\n🚨 CRITICAL ISSUE: Plugin is NOT ACTIVE!\n";
    echo "This explains why PNG scripts aren't loading.\n\n";

    echo "📋 ACTIVATION STEPS:\n";
    echo "1. Go to WordPress Admin → Plugins\n";
    echo "2. Find 'Octonove Print Designner'\n";
    echo "3. Click 'Activate'\n\n";

    // Check if plugin exists in plugins directory
    $plugin_path = WP_PLUGIN_DIR . '/' . dirname($plugin_file);
    if (is_dir($plugin_path)) {
        echo "✅ Plugin directory exists: $plugin_path\n";
    } else {
        echo "❌ Plugin directory missing: $plugin_path\n";
    }

} else {
    echo "✅ Plugin is active - investigating further...\n\n";

    // Check if plugin classes are loaded
    echo "🔍 CLASS LOADING STATUS:\n";
    echo "========================\n";

    $classes_to_check = [
        'Octo_Print_Designer' => 'Main plugin class',
        'Octo_Print_Designer_Public' => 'Public frontend class',
        'Octo_Print_Designer_WC_Integration' => 'WooCommerce integration',
        'Octo_Print_Designer_Settings' => 'Settings class',
        'Octo_Print_Designer_Loader' => 'Hook loader class'
    ];

    foreach ($classes_to_check as $class => $description) {
        if (class_exists($class)) {
            echo "✅ $description: $class\n";
        } else {
            echo "❌ $description: $class NOT LOADED\n";
        }
    }

    // Check if hooks are registered
    echo "\n📌 WORDPRESS HOOKS STATUS:\n";
    echo "===========================\n";

    global $wp_filter;

    $hooks_to_check = [
        'wp_enqueue_scripts' => 'Script enqueueing',
        'init' => 'Plugin initialization',
        'wp_head' => 'Head section scripts'
    ];

    foreach ($hooks_to_check as $hook => $description) {
        if (isset($wp_filter[$hook])) {
            $callbacks = count($wp_filter[$hook]->callbacks);
            echo "✅ $description ($hook): $callbacks callbacks registered\n";

            // Check for our plugin's callbacks
            foreach ($wp_filter[$hook]->callbacks as $priority => $callbacks_array) {
                foreach ($callbacks_array as $callback_info) {
                    if (is_array($callback_info['function']) &&
                        is_object($callback_info['function'][0]) &&
                        strpos(get_class($callback_info['function'][0]), 'Octo_Print_Designer') !== false) {
                        echo "  🎯 Our plugin callback found: " . get_class($callback_info['function'][0]) . "->" . $callback_info['function'][1] . "\n";
                    }
                }
            }
        } else {
            echo "❌ $description ($hook): No callbacks registered\n";
        }
    }

    // Test script enqueueing
    echo "\n📜 SCRIPT ENQUEUEING TEST:\n";
    echo "==========================\n";

    // Force trigger wp_enqueue_scripts action
    ob_start();
    do_action('wp_enqueue_scripts');
    ob_end_clean();

    // Check if PNG scripts are registered/enqueued
    global $wp_scripts;

    $png_scripts = [
        'yprint-high-dpi-export',
        'yprint-png-integration',
        'yprint-save-only-png'
    ];

    foreach ($png_scripts as $script) {
        if (isset($wp_scripts->registered[$script])) {
            echo "✅ $script: Registered\n";

            if (in_array($script, $wp_scripts->queue)) {
                echo "  🎯 Status: ENQUEUED (will load)\n";
            } else {
                echo "  ⚠️ Status: Registered but not enqueued\n";
            }
        } else {
            echo "❌ $script: Not registered\n";
        }
    }
}

// Check WordPress environment
echo "\n🌐 WORDPRESS ENVIRONMENT:\n";
echo "==========================\n";
echo "WordPress Version: " . get_bloginfo('version') . "\n";
echo "Site URL: " . get_site_url() . "\n";
echo "Plugin Directory: " . WP_PLUGIN_DIR . "\n";
echo "Debug Mode: " . (WP_DEBUG ? "ON" : "OFF") . "\n";

// Check if this is the right page context
echo "\n📄 PAGE CONTEXT CHECK:\n";
echo "=======================\n";

if (function_exists('is_woocommerce')) {
    echo "WooCommerce: " . (is_woocommerce() ? "✅ Available" : "❌ Not available") . "\n";
} else {
    echo "WooCommerce: ❌ Function not available\n";
}

echo "Current URL: " . (isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : 'CLI') . "\n";

echo "\n🏁 AGENT 4 VALIDATION COMPLETE\n";
echo "===============================\n";

if (!$is_active) {
    echo "🚨 PRIMARY ISSUE: Plugin is not activated in WordPress\n";
    echo "🎯 SOLUTION: Activate the plugin in WordPress admin\n";
} else {
    echo "🔍 Plugin is active. If PNG scripts still don't load:\n";
    echo "1. Check if you're on a WooCommerce page (product/shop)\n";
    echo "2. Verify no JavaScript errors in browser console\n";
    echo "3. Check if wp_enqueue_scripts hook is firing on frontend\n";
}
?>