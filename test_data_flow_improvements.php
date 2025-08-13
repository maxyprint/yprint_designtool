<?php
/**
 * Test Data Flow Improvements
 * 
 * Tests the enhanced data flow in the API integration
 * 
 * @since 1.0.9
 */

// Load WordPress
require_once('../../../wp-load.php');

// Ensure we're in admin context
if (!current_user_can('manage_options')) {
    die('Insufficient permissions');
}

echo "<h1>YPrint Data Flow Improvements Test</h1>\n";

// Test 1: Template ID Extraction
echo "<h2>Test 1: Template ID Extraction</h2>\n";

$api_integration = Octo_Print_API_Integration::get_instance();

// Create a mock order item for testing
$mock_item = new stdClass();
$mock_item->get_meta = function($key) {
    $test_data = array(
        '_template_id' => 'test_template_123',
        '_design_data' => json_encode(array('templateId' => 'design_template_456')),
        '_yprint_design_id' => '789',
        '_db_processed_views' => json_encode(array(
            'view1' => array(
                'view_name' => 'front',
                'template_id' => 'processed_template_789',
                'images' => array()
            )
        )),
        '_design_product_images' => json_encode(array(
            array('template_id' => 'product_template_999')
        ))
    );
    return $test_data[$key] ?? null;
};

// Test template ID extraction
$template_id = $api_integration->extract_template_id($mock_item);
echo "Extracted Template ID: " . ($template_id ?: 'null') . "\n";

// Test 2: Enhanced get_design_meta
echo "<h2>Test 2: Enhanced get_design_meta</h2>\n";

$mock_item->get_meta = function($key) {
    $test_data = array(
        '_size_name' => 'L',
        'yprint_size_name' => 'M',
        '_yprint_size_name' => 'XL',
        '_db_size_name' => 'S'
    );
    return $test_data[$key] ?? null;
};

// Test size name extraction
$size_name = $api_integration->get_design_meta($mock_item, 'size_name');
echo "Extracted Size Name: " . ($size_name ?: 'null') . "\n";

// Test 3: Enhanced parse_view_images
echo "<h2>Test 3: Enhanced parse_view_images</h2>\n";

$test_images = array(
    array(
        'url' => 'https://example.com/test.jpg',
        'filename' => 'test.jpg',
        'transform' => array(
            'width' => 500,
            'height' => 600,
            'left' => 100,
            'top' => 200,
            'scaleX' => 1.2,
            'scaleY' => 1.1,
            'angle' => 45,
            'opacity' => 0.8
        )
    )
);

$parsed_images = $api_integration->parse_view_images($test_images, array(), $mock_item);
echo "Parsed Images Count: " . count($parsed_images) . "\n";

if (!empty($parsed_images)) {
    $first_image = $parsed_images[0];
    echo "Image URL: " . $first_image['url'] . "\n";
    echo "Final Width (px): " . $first_image['final_width_px'] . "\n";
    echo "Final Height (px): " . $first_image['final_height_px'] . "\n";
    echo "Rotation: " . $first_image['rotation'] . "\n";
    echo "Opacity: " . $first_image['opacity'] . "\n";
}

// Test 4: Complete Data Flow
echo "<h2>Test 4: Complete Data Flow</h2>\n";

// Create a complete mock design item
$mock_design_item = array(
    'template_id' => 'test_template_123',
    'product_id' => 123,
    'variation_id' => 456,
    'size_name' => 'L',
    'design_color' => 'black',
    'quantity' => 1,
    'name' => 'Test Product',
    'design_views' => array(
        array(
            'view_name' => 'front',
            'view_id' => 'view1',
            'variation_id' => 'var1',
            'view_key' => 'front_view',
            'images' => $parsed_images
        )
    )
);

echo "Mock Design Item Structure:\n";
echo "- Template ID: " . $mock_design_item['template_id'] . "\n";
echo "- Size Name: " . $mock_design_item['size_name'] . "\n";
echo "- Views Count: " . count($mock_design_item['design_views']) . "\n";
echo "- First View Name: " . $mock_design_item['design_views'][0]['view_name'] . "\n";
echo "- Images in First View: " . count($mock_design_item['design_views'][0]['images']) . "\n";

// Test 5: API Format Conversion
echo "<h2>Test 5: API Format Conversion</h2>\n";

try {
    $api_positions = $api_integration->convert_item_to_api_format($mock_design_item);
    
    if (is_wp_error($api_positions)) {
        echo "Error: " . $api_positions->get_error_message() . "\n";
    } else {
        echo "API Positions Count: " . count($api_positions) . "\n";
        
        if (!empty($api_positions)) {
            $first_position = $api_positions[0];
            echo "Print Method: " . $first_position['printMethod'] . "\n";
            echo "Size: " . $first_position['size'] . "\n";
            echo "Print Positions Count: " . count($first_position['printPositions']) . "\n";
            
            if (!empty($first_position['printPositions'])) {
                $first_print_pos = $first_position['printPositions'][0];
                echo "Position: " . $first_print_pos['position'] . "\n";
                echo "Width (mm): " . $first_print_pos['width'] . "\n";
                echo "Height (mm): " . $first_print_pos['height'] . "\n";
                echo "Print File: " . $first_print_pos['printFile'] . "\n";
            }
        }
    }
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}

echo "<h2>Test Complete</h2>\n";
echo "All data flow improvements have been tested.\n";
?> 