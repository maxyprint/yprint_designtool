<?php
/**
 * Test file for the new measurement system with size-specific scale factors
 */

// Simulate WordPress environment
define('ABSPATH', dirname(__FILE__) . '/');

// Test the new measurement system
echo "=== YPrint Measurement System Test ===\n\n";

// Test 1: AJAX Handler
echo "1. Testing AJAX Handler...\n";
$_POST = array(
    'action' => 'get_available_measurement_types',
    'nonce' => wp_create_nonce('template_measurements_nonce'),
    'template_id' => '1'
);

// Include the template class
require_once ABSPATH . 'admin/class-octo-print-designer-template.php';

try {
    // Test the static method
    $result = Octo_Print_Designer_Template::ajax_get_available_measurement_types_static();
    echo "✅ AJAX handler test passed\n";
    echo "Result: " . json_encode($result, JSON_PRETTY_PRINT) . "\n\n";
} catch (Exception $e) {
    echo "❌ AJAX handler test failed: " . $e->getMessage() . "\n\n";
}

// Test 2: Measurement Processing
echo "2. Testing Measurement Processing...\n";

// Mock product dimensions
$product_dimensions = array(
    'S' => array(
        'chest' => 54,
        'height_from_shoulder' => 65,
        'length' => 70
    ),
    'M' => array(
        'chest' => 58,
        'height_from_shoulder' => 67,
        'length' => 72
    ),
    'L' => array(
        'chest' => 62,
        'height_from_shoulder' => 69,
        'length' => 74
    ),
    'XL' => array(
        'chest' => 66,
        'height_from_shoulder' => 71,
        'length' => 76
    )
);

// Mock measurement data
$measurement_data = array(
    'view_189542' => array(
        'measurements' => array(
            '0' => array(
                'type' => 'chest',
                'measurement_type' => 'chest',
                'pixel_distance' => 150,
                'color' => '#ff4444',
                'points' => array(
                    array('x' => 100, 'y' => 100),
                    array('x' => 250, 'y' => 100)
                )
            )
        )
    )
);

// Test the processing
$template = new Octo_Print_Designer_Template();
$processed_data = $template->process_measurement_data($measurement_data, $product_dimensions);

echo "✅ Measurement processing test passed\n";
echo "Processed data: " . json_encode($processed_data, JSON_PRETTY_PRINT) . "\n\n";

// Test 3: Scale Factor Calculation
echo "3. Testing Scale Factor Calculation...\n";

if (isset($processed_data['view_189542']['measurements']['0'])) {
    $measurement = $processed_data['view_189542']['measurements']['0'];
    $size_factors = $measurement['size_scale_factors'];
    
    echo "Size-specific scale factors:\n";
    foreach ($size_factors as $size => $factor) {
        $expected_cm = $product_dimensions[$size]['chest'];
        $calculated_cm = ($measurement['pixel_distance'] / 10) * $factor;
        echo "  $size: $factor mm/px (Expected: {$expected_cm}cm, Calculated: " . round($calculated_cm, 1) . "cm)\n";
    }
    echo "✅ Scale factor calculation test passed\n\n";
} else {
    echo "❌ Scale factor calculation test failed - no measurement data found\n\n";
}

// Test 4: Print Area Calculation
echo "4. Testing Print Area Calculation...\n";

try {
    $print_areas = $template->calculate_auto_print_dimensions($processed_data, $product_dimensions);
    echo "✅ Print area calculation test passed\n";
    echo "Print areas: " . json_encode($print_areas, JSON_PRETTY_PRINT) . "\n\n";
} catch (Exception $e) {
    echo "❌ Print area calculation test failed: " . $e->getMessage() . "\n\n";
}

// Test 5: Validation
echo "5. Testing Validation...\n";

// Test duplicate measurement types
$duplicate_data = array(
    'view_189542' => array(
        'measurements' => array(
            '0' => array(
                'type' => 'chest',
                'measurement_type' => 'chest',
                'pixel_distance' => 150,
                'color' => '#ff4444',
                'points' => array(
                    array('x' => 100, 'y' => 100),
                    array('x' => 250, 'y' => 100)
                )
            ),
            '1' => array(
                'type' => 'chest', // Duplicate type
                'measurement_type' => 'chest',
                'pixel_distance' => 160,
                'color' => '#44ff44',
                'points' => array(
                    array('x' => 110, 'y' => 110),
                    array('x' => 270, 'y' => 110)
                )
            )
        )
    )
);

$processed_duplicate = $template->process_measurement_data($duplicate_data, $product_dimensions);
$chest_measurements = 0;
foreach ($processed_duplicate['view_189542']['measurements'] as $measurement) {
    if ($measurement['type'] === 'chest') {
        $chest_measurements++;
    }
}

echo "Chest measurements found: $chest_measurements\n";
if ($chest_measurements === 1) {
    echo "✅ Duplicate prevention test passed\n\n";
} else {
    echo "❌ Duplicate prevention test failed\n\n";
}

echo "=== Test Complete ===\n";
?> 