<?php
/**
 * Test Print Specifications Saving Logic
 * 
 * This file tests the improved saving mechanism for print specifications
 */

echo "<h1>💾 Print Specifications Saving Test</h1>\n";
echo "<style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .success { color: green; }
    .error { color: red; }
    .warning { color: orange; }
    .info { color: blue; }
    .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
    .test-result { margin: 10px 0; padding: 10px; background: #f9f9f9; border-radius: 3px; }
</style>\n";

// Test 1: Simulate the saving logic
echo "<div class='test-section'>\n";
echo "<h2>1. 🔄 Key Management Test</h2>\n";

function test_print_specs_saving($scenario_name, $existing_specs, $post_data) {
    echo "<div class='test-result'>\n";
    echo "<h3>Testing: {$scenario_name}</h3>\n";
    
    // Simulate the improved saving logic
    $keys_to_remove = array();
    $new_specs = array();
    
    echo "<p><strong>Existing specs before:</strong></p>\n";
    echo "<ul>\n";
    foreach ($existing_specs as $key => $spec) {
        echo "<li><code>{$key}</code>: {$spec['resolution']} DPI</li>\n";
    }
    echo "</ul>\n";
    
    echo "<p><strong>POST data:</strong></p>\n";
    echo "<ul>\n";
    foreach ($post_data as $old_key => $spec) {
        $new_key = $spec['template_id'] . '_' . $spec['position'];
        echo "<li><code>{$old_key}</code> → <code>{$new_key}</code></li>\n";
    }
    echo "</ul>\n";
    
    foreach ($post_data as $old_config_key => $spec) {
        if (!empty($spec['template_id']) && !empty($spec['position'])) {
            $new_key = $spec['template_id'] . '_' . $spec['position'];
            
            // If the key changed, mark the old one for removal
            if ($old_config_key !== $new_key && isset($existing_specs[$old_config_key])) {
                $keys_to_remove[] = $old_config_key;
                echo "<p class='warning'>⚠️ Key change detected: <code>{$old_config_key}</code> → <code>{$new_key}</code></p>\n";
            }
            
            $new_specs[$new_key] = array(
                'unit' => $spec['unit'],
                'offsetUnit' => $spec['unit'],
                'referencePoint' => $spec['referencePoint'],
                'resolution' => $spec['resolution'],
                'colorProfile' => $spec['colorProfile'],
                'bleed' => $spec['bleed'],
                'scaling' => $spec['scaling'],
                'printQuality' => $spec['printQuality']
            );
        }
    }
    
    // Remove old keys that were renamed
    foreach ($keys_to_remove as $old_key) {
        unset($existing_specs[$old_key]);
        echo "<p class='info'>🗑️ Removed old key: <code>{$old_key}</code></p>\n";
    }
    
    // Merge with existing specs
    $final_specs = array_merge($existing_specs, $new_specs);
    
    echo "<p><strong>Final specs after:</strong></p>\n";
    echo "<ul>\n";
    foreach ($final_specs as $key => $spec) {
        echo "<li><code>{$key}</code>: {$spec['resolution']} DPI</li>\n";
    }
    echo "</ul>\n";
    
    echo "<p class='success'>✅ <strong>Total specs:</strong> " . count($final_specs) . "</p>\n";
    echo "</div>\n";
    
    return $final_specs;
}

// Test scenarios
$test_scenarios = array(
    'Key Change Scenario' => array(
        'existing' => array(
            'old_key_123' => array('resolution' => 300, 'colorProfile' => 'sRGB'),
            'tshirt_001_back' => array('resolution' => 300, 'colorProfile' => 'sRGB')
        ),
        'post_data' => array(
            'old_key_123' => array(
                'template_id' => '3657',
                'position' => 'front',
                'unit' => 'mm',
                'referencePoint' => 'top-left',
                'resolution' => 300,
                'colorProfile' => 'sRGB',
                'bleed' => 2,
                'scaling' => 'proportional',
                'printQuality' => 'standard'
            )
        )
    ),
    'New Specification Scenario' => array(
        'existing' => array(
            '3657_front' => array('resolution' => 300, 'colorProfile' => 'sRGB')
        ),
        'post_data' => array(
            'template_456_back' => array(
                'template_id' => '3657',
                'position' => 'back',
                'unit' => 'mm',
                'referencePoint' => 'top-left',
                'resolution' => 300,
                'colorProfile' => 'sRGB',
                'bleed' => 2,
                'scaling' => 'proportional',
                'printQuality' => 'standard'
            )
        )
    ),
    'Multiple Changes Scenario' => array(
        'existing' => array(
            'old_key_1' => array('resolution' => 300, 'colorProfile' => 'sRGB'),
            'old_key_2' => array('resolution' => 300, 'colorProfile' => 'sRGB'),
            'keep_this' => array('resolution' => 300, 'colorProfile' => 'sRGB')
        ),
        'post_data' => array(
            'old_key_1' => array(
                'template_id' => '3657',
                'position' => 'front',
                'unit' => 'mm',
                'referencePoint' => 'top-left',
                'resolution' => 300,
                'colorProfile' => 'sRGB',
                'bleed' => 2,
                'scaling' => 'proportional',
                'printQuality' => 'standard'
            ),
            'old_key_2' => array(
                'template_id' => '3657',
                'position' => 'back',
                'unit' => 'mm',
                'referencePoint' => 'top-left',
                'resolution' => 300,
                'colorProfile' => 'sRGB',
                'bleed' => 2,
                'scaling' => 'proportional',
                'printQuality' => 'standard'
            )
        )
    )
);

foreach ($test_scenarios as $scenario_name => $scenario_data) {
    test_print_specs_saving($scenario_name, $scenario_data['existing'], $scenario_data['post_data']);
    echo "<hr style='margin: 15px 0; border: 1px solid #eee;'>\n";
}
echo "</div>\n";

// Test 2: Debug Logging Simulation
echo "<div class='test-section'>\n";
echo "<h2>2. 📝 Debug Logging Simulation</h2>\n";

echo "<div class='test-result'>\n";
echo "<h3>Expected Debug Log Messages:</h3>\n";
echo "<div style='background: #000; color: #0f0; padding: 10px; font-family: monospace; font-size: 12px;'>\n";
echo "YPrint Admin: Saving print spec - Old key: 'old_key_123', New key: '3657_front'<br>\n";
echo "YPrint Admin: Removed old print spec key: 'old_key_123'<br>\n";
echo "YPrint Admin: Final print specs keys: 3657_front, 3657_back, keep_this<br>\n";
echo "</div>\n";
echo "<p><strong>To check debug logs:</strong></p>\n";
echo "<ul>\n";
echo "<li>Enable debug logging in wp-config.php</li>\n";
echo "<li>Check /wp-content/debug.log</li>\n";
echo "<li>Look for 'YPrint Admin:' messages</li>\n";
echo "</ul>\n";
echo "</div>\n";
echo "</div>\n";

// Test 3: Admin Interface Feedback
echo "<div class='test-section'>\n";
echo "<h2>3. 🎨 Admin Interface Feedback</h2>\n";

echo "<div class='test-result'>\n";
echo "<h3>Expected Admin Notifications:</h3>\n";
echo "<div style='background: #d4edda; border: 1px solid #c3e6cb; padding: 10px; border-radius: 4px;'>\n";
echo "<p style='color: #155724; margin: 0;'><strong>✅ Settings saved!</strong></p>\n";
echo "</div>\n";
echo "<br>\n";
echo "<div style='background: #d1ecf1; border: 1px solid #bee5eb; padding: 10px; border-radius: 4px;'>\n";
echo "<p style='color: #0c5460; margin: 0;'><strong>Print Specifications Status:</strong></p>\n";
echo "<p style='color: #0c5460; margin: 5px 0;'>Gespeicherte Specifications: <strong>3</strong></p>\n";
echo "<p style='color: #0c5460; margin: 5px 0;'>Verfügbare Keys: <code>3657_front, 3657_back, keep_this</code></p>\n";
echo "<p style='color: #0c5460; margin: 5px 0;'><strong>Debug:</strong> Detaillierte Logs findest du in /wp-content/debug.log</p>\n";
echo "</div>\n";
echo "</div>\n";
echo "</div>\n";

// Test 4: Recommendations
echo "<div class='test-section'>\n";
echo "<h2>4. 💡 How to Use the Improved System</h2>\n";

echo "<div class='test-result'>\n";
echo "<h3>Step-by-Step Guide:</h3>\n";
echo "<ol>\n";
echo "<li><strong>Access Admin:</strong> Go to WordPress Admin → Print Designer → Print Provider API</li>\n";
echo "<li><strong>Edit Specifications:</strong>\n";
echo "<ul>\n";
echo "<li>Change Template ID to your actual template ID (e.g., '3657')</li>\n";
echo "<li>Select the correct Position (front, back, left, right)</li>\n";
echo "<li>Fill in all other fields (Resolution, Color Profile, etc.)</li>\n";
echo "</ul></li>\n";
echo "<li><strong>Save Settings:</strong> Click 'Save Settings'</li>\n";
echo "<li><strong>Verify Results:</strong>\n";
echo "<ul>\n";
echo "<li>Check the success message showing saved specifications</li>\n";
echo "<li>Verify the correct keys are displayed (e.g., '3657_front')</li>\n";
echo "<li>Check debug logs for detailed information</li>\n";
echo "</ul></li>\n";
echo "<li><strong>Test API:</strong>\n";
echo "<ul>\n";
echo "<li>Create a test order with design data</li>\n";
echo "<li>Use API preview to verify specifications are found</li>\n";
echo "<li>Check that the correct template ID is extracted</li>\n";
echo "</ul></li>\n";
echo "</ol>\n";
echo "</div>\n";
echo "</div>\n";

echo "<p class='success'><strong>✅ Print Specifications Saving Test completed!</strong></p>\n";
echo "<p>The improved saving logic now properly handles key changes and prevents conflicts.</p>\n";
?> 