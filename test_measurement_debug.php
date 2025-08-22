<?php
/**
 * Test file to debug measurement system AJAX issues
 */

// Simulate WordPress environment
define('ABSPATH', dirname(__FILE__) . '/');
require_once ABSPATH . 'wp-config.php';

// Test AJAX handler directly
if (isset($_POST['action']) && $_POST['action'] === 'get_available_measurement_types') {
    echo "=== AJAX Debug Test ===\n";
    echo "POST data received:\n";
    print_r($_POST);
    
    echo "\n=== Nonce Check ===\n";
    if (isset($_POST['nonce'])) {
        $nonce_valid = wp_verify_nonce($_POST['nonce'], 'template_measurements_nonce');
        echo "Nonce valid: " . ($nonce_valid ? 'YES' : 'NO') . "\n";
        echo "Nonce value: " . $_POST['nonce'] . "\n";
    } else {
        echo "No nonce provided\n";
    }
    
    echo "\n=== Template ID ===\n";
    if (isset($_POST['template_id'])) {
        echo "Template ID: " . $_POST['template_id'] . "\n";
        echo "Template ID type: " . gettype($_POST['template_id']) . "\n";
        echo "Template ID valid: " . (intval($_POST['template_id']) > 0 ? 'YES' : 'NO') . "\n";
    } else {
        echo "No template_id provided\n";
    }
    
    // Test the actual handler
    echo "\n=== Testing Handler ===\n";
    try {
        // Include the template class
        require_once ABSPATH . 'admin/class-octo-print-designer-template.php';
        
        // Call the static method
        $result = Octo_Print_Designer_Template::ajax_get_available_measurement_types_static();
        echo "Handler result: ";
        print_r($result);
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
    
    exit;
}

// Test nonce generation
echo "=== Nonce Generation Test ===\n";
$nonce = wp_create_nonce('template_measurements_nonce');
echo "Generated nonce: " . $nonce . "\n";
echo "Nonce valid: " . (wp_verify_nonce($nonce, 'template_measurements_nonce') ? 'YES' : 'NO') . "\n";

// Test template ID extraction
echo "\n=== Template ID Extraction Test ===\n";
$test_urls = [
    'https://example.com/wp-admin/post.php?post=123&action=edit',
    'https://example.com/wp-admin/post.php?action=edit&post=456',
    'https://example.com/wp-admin/post.php?action=edit',
    'https://example.com/wp-admin/post.php'
];

foreach ($test_urls as $url) {
    $url_parts = parse_url($url);
    parse_str($url_parts['query'] ?? '', $query_params);
    $template_id = $query_params['post'] ?? 0;
    echo "URL: $url\n";
    echo "  Template ID: $template_id\n";
}

echo "\n=== Test Complete ===\n";
?> 