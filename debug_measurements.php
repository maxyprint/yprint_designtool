<?php
/**
 * Debug script to check stored measurements
 * Run this in WordPress admin to see what's in the database
 */

// Simuliere WordPress-Umgebung
if (!defined('ABSPATH')) {
    define('ABSPATH', dirname(__FILE__) . '/');
}

echo "=== YPrint Measurements Debug ===\n\n";

// Template ID aus den Logs
$template_id = 3657;

echo "Checking template ID: $template_id\n\n";

// Lade alle relevanten Meta-Daten
$product_dimensions = get_post_meta($template_id, '_template_product_dimensions', true);
$view_print_areas = get_post_meta($template_id, '_template_view_print_areas', true);
$template_variations = get_post_meta($template_id, '_template_variations', true);

echo "1. Product Dimensions:\n";
if ($product_dimensions && is_array($product_dimensions)) {
    foreach ($product_dimensions as $size_id => $dimensions) {
        echo "  $size_id: " . json_encode($dimensions) . "\n";
    }
} else {
    echo "  No product dimensions found\n";
}

echo "\n2. View Print Areas:\n";
if ($view_print_areas && is_array($view_print_areas)) {
    foreach ($view_print_areas as $view_id => $config) {
        echo "  View $view_id:\n";
        echo "    Canvas: " . ($config['canvas_width'] ?? 'N/A') . "x" . ($config['canvas_height'] ?? 'N/A') . "\n";
        
        if (isset($config['measurements']) && is_array($config['measurements'])) {
            echo "    Measurements (" . count($config['measurements']) . "):\n";
            foreach ($config['measurements'] as $index => $measurement) {
                echo "      [$index] " . json_encode($measurement) . "\n";
            }
        } else {
            echo "    No measurements found\n";
        }
    }
} else {
    echo "  No view print areas found\n";
}

echo "\n3. Template Variations:\n";
if ($template_variations && is_array($template_variations)) {
    foreach ($template_variations as $var_id => $variation) {
        echo "  Variation $var_id: " . ($variation['name'] ?? 'Unnamed') . "\n";
        if (isset($variation['views'])) {
            foreach ($variation['views'] as $view_id => $view) {
                echo "    View $view_id: " . ($view['name'] ?? 'Unnamed') . "\n";
            }
        }
    }
} else {
    echo "  No template variations found\n";
}

echo "\n4. Raw Meta Data:\n";
$all_meta = get_post_meta($template_id);
foreach ($all_meta as $key => $values) {
    if (strpos($key, '_template_') === 0) {
        echo "  $key: " . json_encode($values) . "\n";
    }
}

echo "\n=== Debug Complete ===\n";
?> 