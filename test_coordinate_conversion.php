<?php
/**
 * Test Coordinate Conversion for AllesKlarDruck API
 * 
 * This file tests the canvas-to-print coordinate conversion
 * to ensure offsetX and offsetY are calculated correctly
 */

// Load WordPress
require_once('wp-load.php');

// Get API integration instance
$api_integration = Octo_Print_API_Integration::get_instance();

// Test data - simulate canvas transform data
$test_transform_data = array(
    'left' => 100,  // 100px from left
    'top' => 150    // 150px from top
);

$template_id = 'tshirt_001';
$position = 'front';

echo "=== Testing Coordinate Conversion ===\n\n";

// Test 1: Front position with standard canvas
echo "Test 1: Front position (800x600 canvas, 200x250mm print area)\n";
$result = $api_integration->convert_canvas_to_print_coordinates($test_transform_data, $template_id, 'front');
echo "Input: left={$test_transform_data['left']}px, top={$test_transform_data['top']}px\n";
echo "Output: offsetX={$result['offset_x_mm']}mm, offsetY={$result['offset_y_mm']}mm\n";
echo "Expected: offsetX=25.0mm, offsetY=62.5mm\n\n";

// Test 2: Left sleeve position with smaller canvas
echo "Test 2: Left sleeve position (400x300 canvas, 80x100mm print area)\n";
$result = $api_integration->convert_canvas_to_print_coordinates($test_transform_data, $template_id, 'left');
echo "Input: left={$test_transform_data['left']}px, top={$test_transform_data['top']}px\n";
echo "Output: offsetX={$result['offset_x_mm']}mm, offsetY={$result['offset_y_mm']}mm\n";
echo "Expected: offsetX=20.0mm, offsetY=50.0mm\n\n";

// Test 3: Edge case - position at canvas edge
echo "Test 3: Edge case - position at canvas edge\n";
$edge_transform_data = array(
    'left' => 800,  // At right edge
    'top' => 600    // At bottom edge
);
$result = $api_integration->convert_canvas_to_print_coordinates($edge_transform_data, $template_id, 'front');
echo "Input: left={$edge_transform_data['left']}px, top={$edge_transform_data['top']}px\n";
echo "Output: offsetX={$result['offset_x_mm']}mm, offsetY={$result['offset_y_mm']}mm\n";
echo "Expected: offsetX=200.0mm, offsetY=250.0mm (clamped to print area)\n\n";

// Test 4: Negative coordinates (should be clamped to 0)
echo "Test 4: Negative coordinates (should be clamped to 0)\n";
$negative_transform_data = array(
    'left' => -50,  // Negative
    'top' => -30    // Negative
);
$result = $api_integration->convert_canvas_to_print_coordinates($negative_transform_data, $template_id, 'front');
echo "Input: left={$negative_transform_data['left']}px, top={$negative_transform_data['top']}px\n";
echo "Output: offsetX={$result['offset_x_mm']}mm, offsetY={$result['offset_y_mm']}mm\n";
echo "Expected: offsetX=0.0mm, offsetY=0.0mm (clamped to 0)\n\n";

// Test 5: Missing transform data (should default to 0)
echo "Test 5: Missing transform data (should default to 0)\n";
$empty_transform_data = array();
$result = $api_integration->convert_canvas_to_print_coordinates($empty_transform_data, $template_id, 'front');
echo "Input: empty transform data\n";
echo "Output: offsetX={$result['offset_x_mm']}mm, offsetY={$result['offset_y_mm']}mm\n";
echo "Expected: offsetX=0.0mm, offsetY=0.0mm\n\n";

echo "=== Coordinate Conversion Tests Complete ===\n";

// Test complete API payload generation
echo "\n=== Testing Complete API Payload Generation ===\n";

// Simulate a design item with transform data
$test_design_item = array(
    'template_id' => 'tshirt_001',
    'product_id' => 123,
    'variation_id' => 0,
    'design_color' => 'white',
    'size_name' => 'M',
    'quantity' => 1,
    'name' => 'Test T-Shirt',
    'design_views' => array(
        array(
            'view_name' => 'front',
            'view_id' => 'front_001',
            'images' => array(
                array(
                    'url' => 'https://example.com/test-image.png',
                    'transform_data' => array(
                        'left' => 100,
                        'top' => 150
                    ),
                    'original_width_px' => 200,
                    'original_height_px' => 150,
                    'scale_x' => 1.5,
                    'scale_y' => 1.2
                )
            )
        )
    )
);

echo "Testing complete API payload generation with coordinate conversion...\n";
$api_payload = $api_integration->convert_item_to_api_format($test_design_item);

if (is_wp_error($api_payload)) {
    echo "Error: " . $api_payload->get_error_message() . "\n";
} else {
    echo "Success! Generated API payload with coordinate conversion:\n";
    echo json_encode($api_payload, JSON_PRETTY_PRINT) . "\n";
}

echo "\n=== All Tests Complete ===\n"; 