<?php
/**
 * Script to check measurement storage in database
 * Run this to verify if measurements are actually being saved
 */

// WordPress Database Connection
$host = 'localhost';
$dbname = 'dbs13227305';
$username = 'your_username';
$password = 'your_password';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "🔍 Checking measurement storage for Template 3657\n\n";
    
    // 1. Check if template exists
    echo "📋 1. Checking if template 3657 exists:\n";
    $stmt = $pdo->query("SELECT ID, post_title, post_type FROM deo6_posts WHERE ID = 3657");
    $template = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($template) {
        echo "✅ Template found: {$template['post_title']} (Type: {$template['post_type']})\n\n";
    } else {
        echo "❌ Template 3657 not found!\n";
        echo "Available design templates:\n";
        $stmt = $pdo->query("SELECT ID, post_title FROM deo6_posts WHERE post_type = 'design_template' ORDER BY ID");
        $templates = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($templates as $t) {
            echo "- ID {$t['ID']}: {$t['post_title']}\n";
        }
        echo "\n";
        exit;
    }
    
    // 2. Check all template-related meta data
    echo "📊 2. All template meta data for template 3657:\n";
    $stmt = $pdo->query("SELECT meta_key, meta_value FROM deo6_postmeta WHERE post_id = 3657 AND meta_key LIKE '%template%'");
    $meta_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($meta_data)) {
        echo "❌ No template meta data found!\n\n";
    } else {
        foreach ($meta_data as $meta) {
            echo "✅ {$meta['meta_key']}: ";
            if (strlen($meta['meta_value']) > 200) {
                echo substr($meta['meta_value'], 0, 200) . "...\n";
            } else {
                echo $meta['meta_value'] . "\n";
            }
        }
        echo "\n";
    }
    
    // 3. Specifically check view print areas (where measurements should be)
    echo "📐 3. View Print Areas (Visual Measurements):\n";
    $stmt = $pdo->query("SELECT meta_value FROM deo6_postmeta WHERE post_id = 3657 AND meta_key = '_template_view_print_areas'");
    $view_data = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($view_data && !empty($view_data['meta_value'])) {
        echo "✅ View print areas data found:\n";
        $view_array = unserialize($view_data['meta_value']);
        
        if (is_array($view_array)) {
            foreach ($view_array as $view_id => $view_config) {
                echo "   View ID: $view_id\n";
                
                if (isset($view_config['measurements']) && is_array($view_config['measurements'])) {
                    echo "   📏 Measurements: " . count($view_config['measurements']) . " found\n";
                    foreach ($view_config['measurements'] as $index => $measurement) {
                        echo "      - Index $index: {$measurement['measurement_type']} ({$measurement['pixel_distance']} px)\n";
                        if (isset($measurement['size_scale_factors'])) {
                            echo "        Scale factors: " . implode(', ', array_map(function($size, $factor) {
                                return "$size: $factor mm/px";
                            }, array_keys($measurement['size_scale_factors']), $measurement['size_scale_factors'])) . "\n";
                        }
                    }
                } else {
                    echo "   ❌ No measurements found for this view\n";
                }
                echo "\n";
            }
        } else {
            echo "❌ View data is not a valid array\n";
        }
    } else {
        echo "❌ No view print areas data found!\n";
    }
    
    // 4. Check product dimensions
    echo "📏 4. Product Dimensions:\n";
    $stmt = $pdo->query("SELECT meta_value FROM deo6_postmeta WHERE post_id = 3657 AND meta_key = '_template_product_dimensions'");
    $product_data = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($product_data && !empty($product_data['meta_value'])) {
        echo "✅ Product dimensions found:\n";
        $product_array = unserialize($product_data['meta_value']);
        
        if (is_array($product_array)) {
            foreach ($product_array as $size_id => $dimensions) {
                echo "   Size $size_id:\n";
                foreach ($dimensions as $measurement => $value) {
                    echo "      - $measurement: $value cm\n";
                }
            }
        }
    } else {
        echo "❌ No product dimensions found!\n";
    }
    
    // 5. Check recent AJAX activity
    echo "\n🔍 5. Recent AJAX activity (checking error logs):\n";
    $stmt = $pdo->query("SELECT * FROM deo6_options WHERE option_name LIKE '%error%' OR option_name LIKE '%log%' ORDER BY option_id DESC LIMIT 5");
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($logs)) {
        echo "No recent error logs found\n";
    } else {
        foreach ($logs as $log) {
            echo "Log: {$log['option_name']} - {$log['option_value']}\n";
        }
    }
    
    echo "\n💡 DIAGNOSIS:\n";
    echo "If you see measurements in the frontend but not in the database,\n";
    echo "it means the AJAX save functionality is not working properly.\n";
    echo "The measurements are only stored temporarily in the browser.\n\n";
    
    echo "🔧 NEXT STEPS:\n";
    echo "1. Check if the AJAX handler is properly registered\n";
    echo "2. Verify the nonce validation is working\n";
    echo "3. Check browser console for AJAX errors\n";
    echo "4. Test the save_measurement_to_database AJAX endpoint\n";
    
} catch (PDOException $e) {
    echo "❌ Database connection error: " . $e->getMessage() . "\n";
    echo "\n💡 Please update the database connection details at the top of this script\n";
}
?> 