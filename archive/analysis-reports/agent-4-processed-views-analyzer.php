<?php
/**
 * Agent 4: Database View Data Analyst
 * Analyze _db_processed_views data structure for order 5382
 */

// Ensure this is run in WordPress context
if (!defined('ABSPATH')) {
    // Try to load WordPress
    $wp_load_paths = [
        '../../../wp-load.php',
        '../../wp-load.php',
        '../wp-load.php',
        'wp-load.php'
    ];

    foreach ($wp_load_paths as $path) {
        if (file_exists($path)) {
            require_once($path);
            break;
        }
    }

    if (!defined('ABSPATH')) {
        die('❌ WordPress not found. Please run this script from within WordPress or adjust the path.');
    }
}

// Get order 5382
$order = wc_get_order(5382);
if (!$order) {
    echo json_encode(['error' => 'Order not found'], JSON_PRETTY_PRINT);
    exit;
}

// Get processed views data
$processed_views = $order->get_meta('_db_processed_views', true);
if (empty($processed_views)) {
    echo json_encode(['error' => 'No processed views data found'], JSON_PRETTY_PRINT);
    exit;
}

// Decode if string
if (is_string($processed_views)) {
    $processed_views = json_decode($processed_views, true);
}

// Get template ID
$template_id = null;
foreach ($order->get_items() as $item) {
    $template_id = $item->get_meta('_yprint_template_id');
    if ($template_id) break;
}

// Output structure
$result = [
    'agent_id' => 4,
    'order_id' => 5382,
    'template_id' => $template_id,
    'processed_views_structure' => $processed_views,
    'analysis' => [
        'view_count' => count($processed_views),
        'first_view_name' => $processed_views[0]['view_name'] ?? 'N/A',
        'first_view_id' => $processed_views[0]['view_id'] ?? 'N/A',
        'images_count' => count($processed_views[0]['images'] ?? []),
    ]
];

// Analyze coordinate format for ALL images
if (isset($processed_views[0]['images'])) {
    $result['images_analysis'] = [];

    foreach ($processed_views[0]['images'] as $idx => $image) {
        $result['images_analysis'][] = [
            'image_index' => $idx,
            'has_transform_nested' => isset($image['transform']),
            'has_left_at_root' => isset($image['left']),
            'has_top_at_root' => isset($image['top']),
            'format_detected' => isset($image['transform']) ? 'LEGACY' : 'GOLDEN_STANDARD',
            'coordinates' => [
                'left' => $image['left'] ?? ($image['transform']['left'] ?? 'N/A'),
                'top' => $image['top'] ?? ($image['transform']['top'] ?? 'N/A'),
                'width' => $image['width'] ?? ($image['transform']['width'] ?? 'N/A'),
                'height' => $image['height'] ?? ($image['transform']['height'] ?? 'N/A'),
            ],
            'full_structure' => $image
        ];
    }
}

// Check if preview was generated from this data
$preview_meta = $order->get_meta('_design_preview_url', true);
$result['preview_info'] = [
    'preview_url' => $preview_meta,
    'contains_189542' => strpos($preview_meta, '189542') !== false
];

// Get yprint_print_data to see if coordinates match
$print_data = $order->get_meta('yprint_print_data', true);
if ($print_data && is_string($print_data)) {
    $print_data = json_decode($print_data, true);
}

if ($print_data && isset($print_data['objects'])) {
    $result['print_data_coordinates'] = [];
    foreach ($print_data['objects'] as $idx => $obj) {
        $result['print_data_coordinates'][] = [
            'object_index' => $idx,
            'left' => $obj['left'] ?? 'N/A',
            'top' => $obj['top'] ?? 'N/A',
            'width' => $obj['width'] ?? 'N/A',
            'height' => $obj['height'] ?? 'N/A',
        ];
    }
}

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
