<?php
/**
 * Test Print Specifications Integration
 * 
 * This file tests the print specifications integration with the API
 * and validates the configuration.
 */

// Load WordPress
require_once('wp-load.php');

// Check if we're in a WordPress environment
if (!function_exists('get_option')) {
    die('This script must be run in a WordPress environment.');
}

echo "<h1>Print Specifications Integration Test</h1>\n";

// Test 1: Check if print specifications are configured
echo "<h2>1. Print Specifications Configuration</h2>\n";
$print_specs = get_option('octo_allesklardruck_print_specifications', array());

if (empty($print_specs)) {
    echo "<p style='color: orange;'>⚠️ No print specifications configured. Using defaults.</p>\n";
} else {
    echo "<p style='color: green;'>✅ Print specifications found: " . count($print_specs) . " configurations</p>\n";
    
    foreach ($print_specs as $config_key => $specs) {
        echo "<div style='margin: 10px 0; padding: 10px; border: 1px solid #ddd; background: #f9f9f9;'>\n";
        echo "<strong>Configuration: {$config_key}</strong><br>\n";
        echo "Unit: {$specs['unit']}<br>\n";
        echo "Reference Point: {$specs['referencePoint']}<br>\n";
        echo "Resolution: {$specs['resolution']} DPI<br>\n";
        echo "Color Profile: {$specs['colorProfile']}<br>\n";
        echo "Bleed: {$specs['bleed']}mm<br>\n";
        echo "Scaling: {$specs['scaling']}<br>\n";
        echo "Print Quality: {$specs['printQuality']}<br>\n";
        echo "</div>\n";
    }
}

// Test 2: Validate print specifications
echo "<h2>2. Print Specifications Validation</h2>\n";

if (!empty($print_specs)) {
    foreach ($print_specs as $config_key => $specs) {
        echo "<h3>Validating: {$config_key}</h3>\n";
        
        $errors = array();
        
        // Check required fields
        $required_fields = array('unit', 'offsetUnit', 'referencePoint', 'resolution', 'colorProfile', 'bleed', 'scaling', 'printQuality');
        foreach ($required_fields as $field) {
            if (!isset($specs[$field]) || empty($specs[$field])) {
                $errors[] = "Missing required field: {$field}";
            }
        }
        
        // Validate specific fields
        if (isset($specs['unit']) && !in_array($specs['unit'], array('mm', 'cm', 'px'))) {
            $errors[] = "Invalid unit: {$specs['unit']}";
        }
        
        if (isset($specs['referencePoint']) && !in_array($specs['referencePoint'], array('top-left', 'center', 'top-center'))) {
            $errors[] = "Invalid reference point: {$specs['referencePoint']}";
        }
        
        if (isset($specs['resolution']) && ($specs['resolution'] < 72 || $specs['resolution'] > 600)) {
            $errors[] = "Invalid resolution: {$specs['resolution']} DPI (must be 72-600)";
        }
        
        if (isset($specs['bleed']) && ($specs['bleed'] < 0 || $specs['bleed'] > 10)) {
            $errors[] = "Invalid bleed: {$specs['bleed']}mm (must be 0-10)";
        }
        
        if (empty($errors)) {
            echo "<p style='color: green;'>✅ Valid</p>\n";
        } else {
            echo "<p style='color: red;'>❌ Validation errors:</p>\n";
            echo "<ul>\n";
            foreach ($errors as $error) {
                echo "<li style='color: red;'>{$error}</li>\n";
            }
            echo "</ul>\n";
        }
    }
} else {
    echo "<p style='color: orange;'>⚠️ No specifications to validate</p>\n";
}

// Test 3: Test API Integration
echo "<h2>3. API Integration Test</h2>\n";

// Check if API integration class exists
if (class_exists('Octo_Print_API_Integration')) {
    echo "<p style='color: green;'>✅ API Integration class found</p>\n";
    
    try {
        $api_integration = Octo_Print_API_Integration::get_instance();
        
        // Test print specifications retrieval
        $test_specs = $api_integration->get_print_specifications('test_template', null, 'front');
        echo "<p>Test specifications retrieved: " . json_encode($test_specs) . "</p>\n";
        
    } catch (Exception $e) {
        echo "<p style='color: red;'>❌ Error testing API integration: " . $e->getMessage() . "</p>\n";
    }
} else {
    echo "<p style='color: red;'>❌ API Integration class not found</p>\n";
}

// Test 4: Check API credentials
echo "<h2>4. API Credentials Check</h2>\n";

$app_id = get_option('octo_allesklardruck_app_id', '');
$api_key = get_option('octo_allesklardruck_api_key', '');

if (!empty($app_id) && !empty($api_key)) {
    echo "<p style='color: green;'>✅ API credentials configured</p>\n";
} else {
    echo "<p style='color: orange;'>⚠️ API credentials not configured</p>\n";
    if (empty($app_id)) {
        echo "<p style='color: red;'>❌ App ID missing</p>\n";
    }
    if (empty($api_key)) {
        echo "<p style='color: red;'>❌ API Key missing</p>\n";
    }
}

// Test 5: Check admin settings
echo "<h2>5. Admin Settings Check</h2>\n";

$sender_name = get_option('octo_allesklardruck_sender_name', '');
$sender_street = get_option('octo_allesklardruck_sender_street', '');
$sender_city = get_option('octo_allesklardruck_sender_city', '');

if (!empty($sender_name) && !empty($sender_street) && !empty($sender_city)) {
    echo "<p style='color: green;'>✅ Sender information configured</p>\n";
} else {
    echo "<p style='color: orange;'>⚠️ Sender information incomplete</p>\n";
}

echo "<h2>Test Summary</h2>\n";
echo "<p>This test verifies that print specifications are properly integrated with the API system.</p>\n";
echo "<p>To configure print specifications, go to: WordPress Admin → Print Designer → Print Provider API</p>\n";
?> 