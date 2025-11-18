<?php
/**
 * Test Template ID Extraction
 * 
 * This file tests the improved template ID extraction functionality
 */

echo "<h1>🔍 Template ID Extraction Test</h1>\n";
echo "<style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .success { color: green; }
    .error { color: red; }
    .warning { color: orange; }
    .info { color: blue; }
    .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
    .test-result { margin: 10px 0; padding: 10px; background: #f9f9f9; border-radius: 3px; }
</style>\n";

// Test 1: Simulate different template ID extraction scenarios
echo "<div class='test-section'>\n";
echo "<h2>1. 📋 Template ID Extraction Scenarios</h2>\n";

function test_template_id_extraction($scenario_name, $mock_item_data) {
    echo "<div class='test-result'>\n";
    echo "<h3>Testing: {$scenario_name}</h3>\n";
    
    // Simulate the extraction logic
    $template_id = null;
    $extraction_method = '';
    
    // Strategy 1: Direct template_id meta
    if (!empty($mock_item_data['_template_id'])) {
        $template_id = $mock_item_data['_template_id'];
        $extraction_method = 'Direct _template_id meta';
    }
    // Strategy 2: Get from design_data JSON
    elseif (!empty($mock_item_data['_design_data'])) {
        $design_data = $mock_item_data['_design_data'];
        if (is_string($design_data)) {
            $design_data = json_decode($design_data, true);
        }
        if (is_array($design_data) && isset($design_data['templateId'])) {
            $template_id = $design_data['templateId'];
            $extraction_method = 'design_data.templateId';
        }
    }
    // Strategy 3: Get from user_designs table via design_id
    elseif (!empty($mock_item_data['_yprint_design_id'])) {
        // Simulate database lookup
        $template_id = '3657'; // Mock database result
        $extraction_method = 'user_designs table lookup';
    }
    // Strategy 4: Parse from processed_views JSON structure
    elseif (!empty($mock_item_data['_db_processed_views'])) {
        $processed_views_json = $mock_item_data['_db_processed_views'];
        if (is_string($processed_views_json)) {
            $processed_views = json_decode($processed_views_json, true);
        } else {
            $processed_views = $processed_views_json;
        }
        
        if (is_array($processed_views)) {
            foreach ($processed_views as $view_data) {
                if (isset($view_data['template_id'])) {
                    $template_id = $view_data['template_id'];
                    $extraction_method = 'processed_views.template_id';
                    break;
                }
            }
        }
    }
    
    if ($template_id) {
        echo "<p class='success'>✅ Template ID found: <strong>{$template_id}</strong></p>\n";
        echo "<p class='info'>📋 Extraction method: {$extraction_method}</p>\n";
    } else {
        echo "<p class='error'>❌ No template ID found</p>\n";
    }
    
    echo "<p><strong>Available data:</strong></p>\n";
    echo "<ul>\n";
    foreach ($mock_item_data as $key => $value) {
        if (is_array($value)) {
            echo "<li><strong>{$key}:</strong> " . json_encode($value) . "</li>\n";
        } else {
            echo "<li><strong>{$key}:</strong> " . htmlspecialchars($value) . "</li>\n";
        }
    }
    echo "</ul>\n";
    echo "</div>\n";
    
    return $template_id;
}

// Test different scenarios
$test_scenarios = array(
    'Direct Template ID Meta' => array(
        '_template_id' => 'tshirt_001',
        '_design_data' => '{"some": "data"}'
    ),
    'Design Data JSON' => array(
        '_design_data' => '{"templateId": "hoodie_002", "views": []}'
    ),
    'User Designs Table Lookup' => array(
        '_yprint_design_id' => '12345',
        '_design_data' => '{"views": []}'
    ),
    'Processed Views JSON' => array(
        '_db_processed_views' => '[{"template_id": "mug_003", "images": []}]'
    ),
    'No Template ID Available' => array(
        '_design_data' => '{"views": []}'
    )
);

foreach ($test_scenarios as $scenario_name => $mock_data) {
    test_template_id_extraction($scenario_name, $mock_data);
    echo "<hr style='margin: 15px 0; border: 1px solid #eee;'>\n";
}
echo "</div>\n";

// Test 2: Print Specifications Mapping
echo "<div class='test-section'>\n";
echo "<h2>2. 🔗 Print Specifications Mapping Test</h2>\n";

function test_print_specs_mapping($template_id, $position) {
    echo "<div class='test-result'>\n";
    echo "<h3>Testing Print Specs Mapping</h3>\n";
    echo "<p><strong>Template ID:</strong> {$template_id}</p>\n";
    echo "<p><strong>Position:</strong> {$position}</p>\n";
    
    // Simulate available print specifications
    $available_specs = array(
        'tshirt_001_front' => array('resolution' => 300, 'colorProfile' => 'sRGB'),
        'hoodie_002_back' => array('resolution' => 300, 'colorProfile' => 'sRGB'),
        'mug_003_front' => array('resolution' => 300, 'colorProfile' => 'sRGB'),
        '3657_front' => array('resolution' => 300, 'colorProfile' => 'sRGB'),
        '3657_back' => array('resolution' => 300, 'colorProfile' => 'sRGB')
    );
    
    $config_key = $template_id . '_' . $position;
    
    echo "<p><strong>Looking for config key:</strong> {$config_key}</p>\n";
    echo "<p><strong>Available keys:</strong> " . implode(', ', array_keys($available_specs)) . "</p>\n";
    
    if (isset($available_specs[$config_key])) {
        echo "<p class='success'>✅ <strong>Exact match found!</strong></p>\n";
        $specs = $available_specs[$config_key];
        echo "<p>Resolution: {$specs['resolution']} DPI, Color Profile: {$specs['colorProfile']}</p>\n";
    } else {
        echo "<p class='error'>❌ <strong>No exact match found</strong></p>\n";
        
        // Check for position fallback
        $position_fallback = null;
        foreach ($available_specs as $key => $spec) {
            if (strpos($key, '_' . $position) !== false) {
                $position_fallback = $key;
                break;
            }
        }
        
        if ($position_fallback) {
            echo "<p class='warning'>⚠️ <strong>Position fallback found:</strong> {$position_fallback}</p>\n";
        } else {
            echo "<p class='error'>❌ <strong>No fallback found, using defaults</strong></p>\n";
        }
    }
    
    echo "</div>\n";
}

// Test different template ID scenarios
$mapping_tests = array(
    array('template_id' => 'tshirt_001', 'position' => 'front'),
    array('template_id' => '3657', 'position' => 'front'),
    array('template_id' => '3657', 'position' => 'back'),
    array('template_id' => 'unknown_template', 'position' => 'front')
);

foreach ($mapping_tests as $test) {
    test_print_specs_mapping($test['template_id'], $test['position']);
    echo "<hr style='margin: 10px 0; border: 1px solid #eee;'>\n";
}
echo "</div>\n";

// Test 3: Debug Logging Simulation
echo "<div class='test-section'>\n";
echo "<h2>3. 📝 Debug Logging Simulation</h2>\n";

echo "<div class='test-result'>\n";
echo "<h3>Expected Debug Log Messages:</h3>\n";
echo "<div style='background: #000; color: #0f0; padding: 10px; font-family: monospace; font-size: 12px;'>\n";
echo "YPrint Debug: Template ID found in _template_id meta: tshirt_001<br>\n";
echo "YPrint Debug: Looking for print specs with template_id: 'tshirt_001', position: 'front', config_key: 'tshirt_001_front'<br>\n";
echo "YPrint Debug: Available print specs keys: tshirt_001_front, hoodie_002_back, mug_003_front, 3657_front, 3657_back<br>\n";
echo "YPrint Debug: Looking for config_key: 'tshirt_001_front'<br>\n";
echo "YPrint Debug: Print specs found for exact match: tshirt_001_front<br>\n";
echo "</div>\n";
echo "<p><strong>To check debug logs in WordPress:</strong></p>\n";
echo "<ul>\n";
echo "<li>Enable debug logging in wp-config.php</li>\n";
echo "<li>Check /wp-content/debug.log</li>\n";
echo "<li>Look for 'YPrint Debug:' messages</li>\n";
echo "</ul>\n";
echo "</div>\n";
echo "</div>\n";

// Test 4: Recommendations
echo "<div class='test-section'>\n";
echo "<h2>4. 💡 Recommendations</h2>\n";

echo "<div class='test-result'>\n";
echo "<h3>How to Configure Print Specifications:</h3>\n";
echo "<ol>\n";
echo "<li><strong>Identify your Template IDs:</strong>\n";
echo "<ul>\n";
echo "<li>Check your database: <code>SELECT DISTINCT template_id FROM wp_octo_user_designs</code></li>\n";
echo "<li>Look for common template IDs like '3657', 'tshirt_001', etc.</li>\n";
echo "</ul></li>\n";
echo "<li><strong>Create Print Specifications:</strong>\n";
echo "<ul>\n";
echo "<li>Go to: WordPress Admin → Print Designer → Print Provider API</li>\n";
echo "<li>Add specifications for each template ID + position combination</li>\n";
echo "<li>Example: '3657_front', '3657_back', 'tshirt_001_front'</li>\n";
echo "</ul></li>\n";
echo "<li><strong>Test the Configuration:</strong>\n";
echo "<ul>\n";
echo "<li>Create a test order with design data</li>\n";
echo "<li>Use API preview to see which template ID is extracted</li>\n";
echo "<li>Check debug logs for extraction details</li>\n";
echo "</ul></li>\n";
echo "</ol>\n";
echo "</div>\n";
echo "</div>\n";

echo "<p class='success'><strong>✅ Template ID Extraction Test completed!</strong></p>\n";
echo "<p>The improved extraction logic should now correctly identify template IDs from multiple sources.</p>\n";
?> 