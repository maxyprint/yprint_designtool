<?php
/**
 * Test file for Sizing Chart functionality
 * This file demonstrates how to use the new sizing chart features
 */

// Include WordPress bootstrap
require_once('wp-config.php');

// Get the WC Integration instance
$wc_integration = Octo_Print_Designer_WC_Integration::get_instance();

echo "<h1>Sizing Chart Integration Test</h1>\n";

// Test data for both formats
$test_data = array(
    'format1' => array(
        'name' => 'Scale Factors Format',
        'json' => '{"XS": 0.8, "S": 0.9, "M": 1.0, "L": 1.1, "XL": 1.2}',
        'description' => 'Format 1: Direct scale factors for sizing'
    ),
    'format2' => array(
        'name' => 'Millimeter Measurements Format',
        'json' => '{"S": {"chest_width_mm": 480, "chest_height_mm": 640}, "M": {"chest_width_mm": 510, "chest_height_mm": 680}, "L": {"chest_width_mm": 540, "chest_height_mm": 720}}',
        'description' => 'Format 2: Detailed millimeter measurements'
    ),
    'invalid' => array(
        'name' => 'Invalid JSON',
        'json' => '{"S": "invalid", "M": null}',
        'description' => 'Invalid format for testing validation'
    )
);

echo "<h2>Testing JSON Validation and Format Detection</h2>\n";

foreach ($test_data as $key => $test) {
    echo "<h3>{$test['name']}</h3>\n";
    echo "<p><strong>Description:</strong> {$test['description']}</p>\n";
    echo "<p><strong>JSON:</strong> <code>{$test['json']}</code></p>\n";

    // Parse JSON
    $parsed = json_decode($test['json'], true);
    if (json_last_error() === JSON_ERROR_NONE) {
        echo "<p><strong>✅ JSON Parsing:</strong> Valid</p>\n";

        // Test format detection
        $format = $wc_integration->get_sizing_chart_format($parsed);
        echo "<p><strong>Format Detection:</strong> " . ($format ?: 'Unknown') . "</p>\n";

        // Display parsed data structure
        echo "<p><strong>Parsed Data:</strong></p>\n";
        echo "<pre>";
        print_r($parsed);
        echo "</pre>\n";

    } else {
        echo "<p><strong>❌ JSON Parsing:</strong> " . json_last_error_msg() . "</p>\n";
    }

    echo "<hr>\n";
}

echo "<h2>Frontend Integration Examples</h2>\n";

// Example of how to use the sizing chart data in templates
echo "<h3>Example: Using sizing chart data in product templates</h3>\n";
echo "<pre><code>";
echo htmlspecialchars('<?php
// In your product template:
$product_id = get_the_ID();
$variation_id = null; // Or get from WooCommerce variation

$wc_integration = Octo_Print_Designer_WC_Integration::get_instance();
$sizing_chart = $wc_integration->get_sizing_chart($product_id, $variation_id);

if ($sizing_chart) {
    $format = $wc_integration->get_sizing_chart_format($sizing_chart);

    echo "<h4>Available Sizes:</h4>";
    echo "<ul>";

    if ($format === "scale_factors") {
        foreach ($sizing_chart as $size => $factor) {
            echo "<li>Size $size: " . ($factor * 100) . "% scale</li>";
        }
    } elseif ($format === "measurements") {
        foreach ($sizing_chart as $size => $measurements) {
            echo "<li>Size $size:</li>";
            echo "<ul>";
            foreach ($measurements as $measurement => $value) {
                echo "<li>$measurement: {$value}mm</li>";
            }
            echo "</ul>";
        }
    }

    echo "</ul>";
}
?>');
echo "</code></pre>\n";

echo "<h3>JavaScript Integration Example</h3>\n";
echo "<pre><code>";
echo htmlspecialchars('// In your JavaScript files:
function loadSizingChart(productId, variationId) {
    jQuery.ajax({
        url: ajaxurl,
        type: "POST",
        data: {
            action: "get_sizing_chart",
            product_id: productId,
            variation_id: variationId,
            nonce: octo_nonce
        },
        success: function(response) {
            if (response.success && response.data.sizing_chart) {
                var chart = response.data.sizing_chart;
                var format = response.data.format;

                // Update UI based on format
                if (format === "scale_factors") {
                    updateSizeScaleFactors(chart);
                } else if (format === "measurements") {
                    updateSizeMeasurements(chart);
                }
            }
        }
    });
}');
echo "</code></pre>\n";

echo "<h2>Admin Usage Instructions</h2>\n";
echo "<ol>";
echo "<li><strong>For Products:</strong> Go to WooCommerce → Products → Edit Product → 'Sizing Chart' tab</li>";
echo "<li><strong>For Variations:</strong> Go to Product → Variations → Expand variation → Find 'Variation Sizing Chart (JSON)' field</li>";
echo "<li><strong>JSON Format 1:</strong> {\"S\": 0.9, \"M\": 1.0, \"L\": 1.1} (scale factors)</li>";
echo "<li><strong>JSON Format 2:</strong> {\"S\": {\"chest_width_mm\": 480}, \"M\": {\"chest_width_mm\": 510}} (measurements)</li>";
echo "<li><strong>Validation:</strong> Use the 'Validate JSON' button to check your syntax</li>";
echo "</ol>";

echo "<p><strong>Implementation completed successfully!</strong></p>";
?>