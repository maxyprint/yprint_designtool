<?php
/**
 * Test Measurement Fix
 * Überprüft, ob die Messungs-Funktionalität nach den Korrekturen funktioniert
 */

echo "=== Testing Measurement Fix ===\n\n";

// Test 1: Überprüfe JavaScript-Datei
$js_file = 'admin/js/template-measurements.js';
if (file_exists($js_file)) {
    echo "✓ JavaScript file exists: {$js_file}\n";
    
    $js_content = file_get_contents($js_file);
    
    // Überprüfe wichtige Funktionen
    $functions_to_check = [
        'createMeasurementElement',
        'deleteMeasurement', 
        'updateCalculations',
        'getViewMeasurements',
        'updateCalculationDisplay',
        'resetMeasurementUI',
        'startMeasurement',
        'drawPoint',
        'drawMeasurementLine'
    ];
    
    foreach ($functions_to_check as $function) {
        if (strpos($js_content, $function) !== false) {
            echo "✓ Function found: {$function}\n";
        } else {
            echo "✗ Function missing: {$function}\n";
        }
    }
    
    // Überprüfe CSS-Selektoren
    $selectors_to_check = [
        '.measurement-image[data-view-id=',
        '.visual-measurement-container',
        '.measurements-list',
        '.measurement-overlay',
        '.add-measurement-btn'
    ];
    
    echo "\nChecking CSS selectors:\n";
    foreach ($selectors_to_check as $selector) {
        if (strpos($js_content, $selector) !== false) {
            echo "✓ Selector found: {$selector}\n";
        } else {
            echo "✗ Selector missing: {$selector}\n";
        }
    }
    
} else {
    echo "✗ JavaScript file not found: {$js_file}\n";
}

// Test 2: Überprüfe Template-Datei
$template_file = 'admin/class-octo-print-designer-template.php';
if (file_exists($template_file)) {
    echo "\n✓ Template file exists: {$template_file}\n";
    
    $template_content = file_get_contents($template_file);
    
    // Überprüfe wichtige Funktionen
    $php_functions_to_check = [
        'validate_measurement_points',
        'calculate_pixel_distance',
        'calculate_auto_print_dimensions',
        'process_measurement_data',
        'get_measurement_types'
    ];
    
    foreach ($php_functions_to_check as $function) {
        if (strpos($template_content, $function) !== false) {
            echo "✓ PHP function found: {$function}\n";
        } else {
            echo "✗ PHP function missing: {$function}\n";
        }
    }
    
    // Überprüfe HTML-Struktur
    $html_elements_to_check = [
        'visual-measurement-container',
        'measurement-image-wrapper',
        'measurement-overlay',
        'measurements-list',
        'real-distance-input',
        'measurement-type-select'
    ];
    
    echo "\nChecking HTML elements:\n";
    foreach ($html_elements_to_check as $element) {
        if (strpos($template_content, $element) !== false) {
            echo "✓ HTML element found: {$element}\n";
        } else {
            echo "✗ HTML element missing: {$element}\n";
        }
    }
    
} else {
    echo "✗ Template file not found: {$template_file}\n";
}

// Test 3: Simuliere Messungs-Workflow
echo "\n=== Simulating Measurement Workflow ===\n";

// Simulierte Messungsdaten
$test_measurement = [
    'type' => 'chest',
    'pixel_distance' => 245.67,
    'real_distance_cm' => 50.0,
    'color' => '#ff4444',
    'points' => [
        ['x' => 100, 'y' => 150],
        ['x' => 345, 'y' => 150]
    ]
];

echo "Test measurement data:\n";
echo "- Type: {$test_measurement['type']}\n";
echo "- Pixel distance: {$test_measurement['pixel_distance']} px\n";
echo "- Real distance: {$test_measurement['real_distance_cm']} cm\n";
echo "- Color: {$test_measurement['color']}\n";
echo "- Points: (" . $test_measurement['points'][0]['x'] . "," . $test_measurement['points'][0]['y'] . ") to (" . $test_measurement['points'][1]['x'] . "," . $test_measurement['points'][1]['y'] . ")\n";

// Berechne Skalierungsfaktor
$scale_factor = $test_measurement['real_distance_cm'] / ($test_measurement['pixel_distance'] / 10);
echo "- Calculated scale factor: " . number_format($scale_factor, 3) . " mm/px\n";

// Simuliere Print-Area-Berechnung
$canvas_width = 800;
$canvas_height = 600;
$print_width_mm = round($canvas_width * $scale_factor, 1);
$print_height_mm = round($canvas_height * $scale_factor, 1);

echo "\nPrint area calculation:\n";
echo "- Canvas: {$canvas_width} × {$canvas_height} px\n";
echo "- Print area: {$print_width_mm} × {$print_height_mm} mm\n";

// Simuliere API-Koordinaten
$test_position = ['x' => 100, 'y' => 150];
$offset_x_mm = round($test_position['x'] * $scale_factor, 1);
$offset_y_mm = round($test_position['y'] * $scale_factor, 1);

echo "\nAPI coordinate conversion:\n";
echo "- Canvas position: (" . $test_position['x'] . ", " . $test_position['y'] . ") px\n";
echo "- API offset: ({$offset_x_mm}, {$offset_y_mm}) mm\n";

echo "\n=== Test Complete ===\n";
echo "If all checks passed, the measurement system should work correctly.\n";
echo "Key fixes applied:\n";
echo "- Fixed CSS selectors in JavaScript functions\n";
echo "- Corrected DOM element traversal\n";
echo "- Improved error handling\n";
echo "- Enhanced measurement element creation\n";
?> 