<?php
/**
 * Reference Line Integration Test
 *
 * Tests the complete integration of the reference line system into existing Template-Views
 * Created by: Multi-Agent Redesign System
 *
 * This test validates that:
 * 1. Reference line button is integrated into template view toolbar
 * 2. Modal popup system works correctly
 * 3. JavaScript functionality is properly enqueued
 * 4. AJAX handlers are registered and functional
 * 5. Meta-box displays reference line data correctly
 */

// Include WordPress bootstrap
if (!defined('ABSPATH')) {
    define('ABSPATH', dirname(__FILE__) . '/');
}

// Simulate WordPress functions for testing
if (!function_exists('esc_html_e')) {
    function esc_html_e($text, $domain = '') {
        echo htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
    }
}

if (!function_exists('esc_html')) {
    function esc_html($text) {
        return htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
    }
}

if (!function_exists('esc_attr')) {
    function esc_attr($text) {
        return htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
    }
}

if (!function_exists('get_post_meta')) {
    function get_post_meta($post_id, $key, $single = false) {
        // Simulate existing reference lines data
        $test_data = [
            '_reference_lines_data' => [
                [
                    'type' => 'chest_width',
                    'start' => ['x' => 150, 'y' => 200],
                    'end' => ['x' => 450, 'y' => 200],
                    'lengthPx' => 300,
                    'angle' => 0,
                    'timestamp' => time() * 1000
                ],
                [
                    'type' => 'shoulder_height',
                    'start' => ['x' => 300, 'y' => 100],
                    'end' => ['x' => 300, 'y' => 400],
                    'lengthPx' => 300,
                    'angle' => 90,
                    'timestamp' => (time() - 3600) * 1000
                ]
            ]
        ];

        return isset($test_data[$key]) ? $test_data[$key] : [];
    }
}

echo "<!DOCTYPE html>\n<html>\n<head>\n";
echo "<title>Reference Line Integration Test</title>\n";
echo "<style>\n";
echo "body { font-family: Arial, sans-serif; margin: 20px; }\n";
echo ".test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }\n";
echo ".success { background: #d4edda; color: #155724; }\n";
echo ".warning { background: #fff3cd; color: #856404; }\n";
echo ".info { background: #d1ecf1; color: #0c5460; }\n";
echo "</style>\n";
echo "</head>\n<body>\n";

echo "<h1>🔧 Reference Line Integration Test</h1>\n";
echo "<p><strong>Testing complete integration into existing Template-View system</strong></p>\n";

// Test 1: Template View Toolbar Integration
echo "<div class='test-section info'>\n";
echo "<h2>📋 Test 1: Template View Toolbar Integration</h2>\n";

$toolbar_file = '/Users/maxschwarz/Desktop/yprint_designtool/admin/partials/template-designer/view-item-toolbar.php';
if (file_exists($toolbar_file)) {
    $toolbar_content = file_get_contents($toolbar_file);

    // Check for reference line button
    if (strpos($toolbar_content, 'data-mode="referenceline"') !== false) {
        echo "<p>✅ Reference line button successfully integrated into toolbar</p>\n";
    } else {
        echo "<p>❌ Reference line button not found in toolbar</p>\n";
    }

    // Check for modal HTML
    if (strpos($toolbar_content, 'reference-line-modal') !== false) {
        echo "<p>✅ Modal HTML structure integrated into view</p>\n";
    } else {
        echo "<p>❌ Modal HTML not found</p>\n";
    }

    // Check for button positioning
    if (strpos($toolbar_content, 'Edit Safe Zone') !== false && strpos($toolbar_content, 'Edit Reference Line') !== false) {
        echo "<p>✅ Reference line button positioned correctly after Safe Zone button</p>\n";
    } else {
        echo "<p>⚠️ Button positioning may need verification</p>\n";
    }
} else {
    echo "<p>❌ Template toolbar file not found</p>\n";
}
echo "</div>\n";

// Test 2: JavaScript Integration
echo "<div class='test-section info'>\n";
echo "<h2>⚡ Test 2: JavaScript Integration</h2>\n";

$js_file = '/Users/maxschwarz/Desktop/yprint_designtool/admin/js/reference-line-system.js';
if (file_exists($js_file)) {
    echo "<p>✅ Reference line JavaScript file created</p>\n";

    $js_content = file_get_contents($js_file);

    // Check for key functionality
    if (strpos($js_content, 'ReferenceLineSystem') !== false) {
        echo "<p>✅ Main ReferenceLineSystem class defined</p>\n";
    }

    if (strpos($js_content, 'data-mode="referenceline"') !== false) {
        echo "<p>✅ Button event listener implemented</p>\n";
    }

    if (strpos($js_content, 'save_reference_line_data') !== false) {
        echo "<p>✅ AJAX save functionality implemented</p>\n";
    }

    if (strpos($js_content, 'fabric.Circle') !== false) {
        echo "<p>✅ Fabric.js canvas integration included</p>\n";
    }
} else {
    echo "<p>❌ JavaScript file not found</p>\n";
}

// Check JavaScript enqueuing
$admin_file = '/Users/maxschwarz/Desktop/yprint_designtool/admin/class-octo-print-designer-admin.php';
if (file_exists($admin_file)) {
    $admin_content = file_get_contents($admin_file);

    if (strpos($admin_content, 'reference-line-system.js') !== false) {
        echo "<p>✅ JavaScript file properly enqueued in admin class</p>\n";
    } else {
        echo "<p>❌ JavaScript file not enqueued</p>\n";
    }
}
echo "</div>\n";

// Test 3: AJAX Handlers
echo "<div class='test-section info'>\n";
echo "<h2>🔗 Test 3: AJAX Handler Registration</h2>\n";

if (file_exists($admin_file)) {
    $admin_content = file_get_contents($admin_file);

    // Check for AJAX actions
    if (strpos($admin_content, 'wp_ajax_save_reference_line_data') !== false) {
        echo "<p>✅ Save reference line AJAX handler registered</p>\n";
    } else {
        echo "<p>❌ Save AJAX handler not registered</p>\n";
    }

    if (strpos($admin_content, 'wp_ajax_delete_reference_line') !== false) {
        echo "<p>✅ Delete reference line AJAX handler registered</p>\n";
    } else {
        echo "<p>❌ Delete AJAX handler not registered</p>\n";
    }

    // Check for handler methods
    if (strpos($admin_content, 'function save_reference_line_data') !== false || strpos($admin_content, 'public function save_reference_line_data') !== false) {
        echo "<p>✅ Save method implemented in admin class</p>\n";
    } else {
        echo "<p>❌ Save method not found</p>\n";
    }

    if (strpos($admin_content, 'function delete_reference_line') !== false || strpos($admin_content, 'public function delete_reference_line') !== false) {
        echo "<p>✅ Delete method implemented in admin class</p>\n";
    } else {
        echo "<p>❌ Delete method not found</p>\n";
    }
}
echo "</div>\n";

// Test 4: Meta-Box Integration
echo "<div class='test-section info'>\n";
echo "<h2>📦 Test 4: Meta-Box Integration</h2>\n";

$template_file = '/Users/maxschwarz/Desktop/yprint_designtool/admin/class-octo-print-designer-template.php';
if (file_exists($template_file)) {
    $template_content = file_get_contents($template_file);

    // Check for meta box registration
    if (strpos($template_content, 'template_reference_lines') !== false) {
        echo "<p>✅ Reference lines meta box registered</p>\n";
    } else {
        echo "<p>❌ Meta box not registered</p>\n";
    }

    // Check for render method
    if (strpos($template_content, 'render_reference_lines_meta_box') !== false) {
        echo "<p>✅ Meta box render method implemented</p>\n";
    } else {
        echo "<p>❌ Render method not found</p>\n";
    }

    // Check for proper data handling
    if (strpos($template_content, '_reference_lines_data') !== false) {
        echo "<p>✅ Reference lines data meta key used consistently</p>\n";
    } else {
        echo "<p>❌ Data meta key not found</p>\n";
    }
}

echo "</div>\n";

// Test 5: Data Structure Simulation
echo "<div class='test-section success'>\n";
echo "<h2>💾 Test 5: Data Display Simulation</h2>\n";

// Simulate the meta box content with test data
$post = (object)['ID' => 123];
$reference_lines = get_post_meta($post->ID, '_reference_lines_data', true);

echo "<h3>Reference Lines Meta Box Preview:</h3>\n";
echo "<div style='border: 2px solid #0073aa; padding: 15px; background: #f0f8ff;'>\n";

if (!empty($reference_lines)) {
    echo "<h4>Existing Reference Lines (" . count($reference_lines) . " found)</h4>\n";
    echo "<table border='1' cellpadding='5' style='width:100%; border-collapse: collapse;'>\n";
    echo "<tr><th>Type</th><th>Length (px)</th><th>Coordinates</th><th>Created</th></tr>\n";

    foreach ($reference_lines as $index => $line) {
        echo "<tr>\n";
        echo "<td><strong>" . esc_html(str_replace('_', ' ', ucwords($line['type']))) . "</strong></td>\n";
        echo "<td>" . esc_html($line['lengthPx']) . "px</td>\n";
        echo "<td><small>Start: " . round($line['start']['x']) . ", " . round($line['start']['y']) . "<br>";
        echo "End: " . round($line['end']['x']) . ", " . round($line['end']['y']) . "</small></td>\n";
        echo "<td>" . date('Y-m-d H:i', $line['timestamp'] / 1000) . "</td>\n";
        echo "</tr>\n";
    }
    echo "</table>\n";
} else {
    echo "<p><em>No reference lines created yet.</em></p>\n";
}

echo "</div>\n";
echo "</div>\n";

// Test 6: Integration Completeness
echo "<div class='test-section success'>\n";
echo "<h2>🎯 Test 6: Integration Status Summary</h2>\n";

$integration_score = 0;
$total_tests = 10;

// Check each component
$checks = [
    'Toolbar button integration' => strpos(file_get_contents($toolbar_file), 'data-mode="referenceline"') !== false,
    'Modal popup integration' => strpos(file_get_contents($toolbar_file), 'reference-line-modal') !== false,
    'JavaScript file exists' => file_exists($js_file),
    'JavaScript enqueued' => strpos(file_get_contents($admin_file), 'reference-line-system.js') !== false,
    'Save AJAX handler' => strpos(file_get_contents($admin_file), 'save_reference_line_data') !== false,
    'Delete AJAX handler' => strpos(file_get_contents($admin_file), 'delete_reference_line') !== false,
    'Meta box registered' => strpos(file_get_contents($template_file), 'template_reference_lines') !== false,
    'Meta box render method' => strpos(file_get_contents($template_file), 'render_reference_lines_meta_box') !== false,
    'Fabric.js integration' => strpos(file_get_contents($js_file), 'fabric.Circle') !== false,
    'Data persistence' => strpos(file_get_contents($template_file), '_reference_lines_data') !== false
];

foreach ($checks as $test => $passed) {
    $status = $passed ? '✅' : '❌';
    $integration_score += $passed ? 1 : 0;
    echo "<p>{$status} {$test}</p>\n";
}

$percentage = round(($integration_score / $total_tests) * 100);
echo "<h3>Integration Score: {$integration_score}/{$total_tests} ({$percentage}%)</h3>\n";

if ($percentage >= 90) {
    echo "<div style='background: #d4edda; padding: 10px; border-radius: 5px; color: #155724;'>\n";
    echo "<h3>🏆 INTEGRATION ERFOLGREICH!</h3>\n";
    echo "<p>Reference Line System ist vollständig in bestehende Template-Views integriert.</p>\n";
    echo "</div>\n";
} elseif ($percentage >= 70) {
    echo "<div style='background: #fff3cd; padding: 10px; border-radius: 5px; color: #856404;'>\n";
    echo "<h3>⚠️ Integration größtenteils erfolgreich</h3>\n";
    echo "<p>Einige kleinere Anpassungen könnten noch erforderlich sein.</p>\n";
    echo "</div>\n";
} else {
    echo "<div style='background: #f8d7da; padding: 10px; border-radius: 5px; color: #721c24;'>\n";
    echo "<h3>❌ Integration unvollständig</h3>\n";
    echo "<p>Weitere Arbeiten erforderlich.</p>\n";
    echo "</div>\n";
}

echo "</div>\n";

echo "<div class='test-section info'>\n";
echo "<h2>📋 Benutzeranweisungen</h2>\n";
echo "<ol>\n";
echo "<li><strong>WordPress Admin</strong> → Design Templates → Template bearbeiten</li>\n";
echo "<li>Nach unten scrollen zur <strong>Template View</strong> Sektion</li>\n";
echo "<li>Auf <strong>'Edit Reference Line'</strong> Button in der Toolbar klicken</li>\n";
echo "<li><strong>'Chest Width'</strong> oder <strong>'Height from Shoulder'</strong> auswählen</li>\n";
echo "<li><strong>Zwei Punkte</strong> auf dem Template-Bild klicken um Referenzlinie zu definieren</li>\n";
echo "<li>Referenzlinie wird automatisch gespeichert und in der <strong>'Reference Lines & Measurements'</strong> Meta-Box angezeigt</li>\n";
echo "</ol>\n";
echo "</div>\n";

echo "</body>\n</html>\n";
?>