<?php
/**
 * Test AJAX handler registration - muss in WordPress Umgebung ausgeführt werden
 */

// Simuliere AJAX Request
$_POST = array(
    'action' => 'get_available_measurement_types',
    'nonce' => '813d90d822', // Aus den Logs
    'template_id' => '3657'
);

$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['CONTENT_TYPE'] = 'application/x-www-form-urlencoded';

echo "=== AJAX Handler Test ===\n";
echo "Testing WordPress AJAX action: get_available_measurement_types\n";
echo "Template ID: " . $_POST['template_id'] . "\n";
echo "Nonce: " . $_POST['nonce'] . "\n\n";

// Prüfe verfügbare AJAX Actions
global $wp_filter;

echo "Registered AJAX actions:\n";
if (isset($wp_filter['wp_ajax_get_available_measurement_types'])) {
    echo "✅ wp_ajax_get_available_measurement_types is registered\n";
    $callbacks = $wp_filter['wp_ajax_get_available_measurement_types']->callbacks;
    foreach ($callbacks as $priority => $functions) {
        foreach ($functions as $function) {
            echo "  - Priority $priority: " . print_r($function['function'], true) . "\n";
        }
    }
} else {
    echo "❌ wp_ajax_get_available_measurement_types is NOT registered\n";
}

if (isset($wp_filter['wp_ajax_nopriv_get_available_measurement_types'])) {
    echo "✅ wp_ajax_nopriv_get_available_measurement_types is registered\n";
} else {
    echo "❌ wp_ajax_nopriv_get_available_measurement_types is NOT registered\n";
}

echo "\nTesting class existence:\n";
if (class_exists('Octo_Print_Designer_Template')) {
    echo "✅ Octo_Print_Designer_Template class exists\n";
    
    if (method_exists('Octo_Print_Designer_Template', 'ajax_get_available_measurement_types_static')) {
        echo "✅ ajax_get_available_measurement_types_static method exists\n";
    } else {
        echo "❌ ajax_get_available_measurement_types_static method NOT found\n";
    }
} else {
    echo "❌ Octo_Print_Designer_Template class NOT found\n";
}

echo "\nTest complete.\n";
?>