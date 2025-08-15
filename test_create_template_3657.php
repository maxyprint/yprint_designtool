<?php
/**
 * Test Create Template 3657
 * 
 * Erstellt die Template-Meta-Daten für Template 3657 direkt
 */

// WordPress laden
require_once('../../../wp-load.php');

// Sicherheitscheck
if (!current_user_can('manage_options')) {
    die('Unauthorized access');
}

echo "<h1>🔧 Create Template 3657 Meta Data</h1>";

// 1. Prüfe ob Template 3657 als WordPress-Post existiert
echo "<h2>1. WordPress Post Check</h2>";
$template_post = get_post(3657);
if ($template_post) {
    echo "✅ Template 3657 existiert bereits als WordPress-Post<br>";
    echo "Post Type: " . $template_post->post_type . "<br>";
    echo "Post Status: " . $template_post->post_status . "<br>";
    echo "Post Title: " . $template_post->post_title . "<br>";
} else {
    echo "❌ Template 3657 existiert NICHT als WordPress-Post - erstelle ihn<br>";
    
    // Erstelle Template-Post
    $post_data = array(
        'ID' => 3657,
        'post_title' => 'SS25 - Base Product',
        'post_type' => 'octo_template',
        'post_status' => 'publish',
        'post_content' => 'Template für SS25 Base Product'
    );
    
    $post_id = wp_insert_post($post_data);
    if (is_wp_error($post_id)) {
        echo "❌ Fehler beim Erstellen des Template-Posts: " . $post_id->get_error_message() . "<br>";
    } else {
        echo "✅ Template 3657 Post erstellt<br>";
    }
}

// 2. Erstelle View Print Areas (Front View 189542)
echo "<h2>2. Create View Print Areas</h2>";
$view_print_areas = array(
    189542 => array(
        'name' => 'Front View',
        'canvas_width' => 800,
        'canvas_height' => 600,
        'measurements' => array(
            3 => array(
                'type' => 'chest',
                'pixel_distance' => 141,
                'description' => 'Chest measurement'
            ),
            2 => array(
                'type' => 'height_from_shoulder',
                'pixel_distance' => 253,
                'description' => 'Height from shoulder'
            ),
            1 => array(
                'type' => 'hem_width',
                'pixel_distance' => 164,
                'description' => 'Hem width'
            )
        )
    )
);

$result = update_post_meta(3657, '_template_view_print_areas', $view_print_areas);
if ($result) {
    echo "✅ View Print Areas erstellt<br>";
    echo "<pre>" . print_r($view_print_areas, true) . "</pre>";
} else {
    echo "❌ Fehler beim Erstellen der View Print Areas<br>";
}

// 3. Erstelle Product Dimensions (Größe L)
echo "<h2>3. Create Product Dimensions</h2>";
$product_dimensions = array(
    'l' => array(
        'chest' => 62,
        'height_from_shoulder' => 70,
        'sleeve_length' => 27,
        'hem_width' => 58
    ),
    'm' => array(
        'chest' => 58,
        'height_from_shoulder' => 68,
        'sleeve_length' => 26,
        'hem_width' => 54
    ),
    's' => array(
        'chest' => 54,
        'height_from_shoulder' => 66,
        'sleeve_length' => 25,
        'hem_width' => 50
    )
);

$result = update_post_meta(3657, '_template_product_dimensions', $product_dimensions);
if ($result) {
    echo "✅ Product Dimensions erstellt<br>";
    echo "<pre>" . print_r($product_dimensions, true) . "</pre>";
} else {
    echo "❌ Fehler beim Erstellen der Product Dimensions<br>";
}

// 4. Teste die erstellten Meta-Daten
echo "<h2>4. Test Created Meta Data</h2>";
$test_view_print_areas = get_post_meta(3657, '_template_view_print_areas', true);
$test_product_dimensions = get_post_meta(3657, '_template_product_dimensions', true);

if ($test_view_print_areas && $test_product_dimensions) {
    echo "✅ Meta-Daten erfolgreich erstellt und abrufbar<br>";
    
    // Teste Front View (189542)
    if (isset($test_view_print_areas[189542])) {
        echo "✅ Front View (189542) gefunden<br>";
        $front_measurements = $test_view_print_areas[189542]['measurements'] ?? [];
        
        // Teste Chest-Messung
        if (isset($front_measurements[3]) && $front_measurements[3]['type'] === 'chest') {
            $chest_pixels = $front_measurements[3]['pixel_distance'];
            echo "✅ Chest-Messung gefunden: " . $chest_pixels . "px<br>";
            
            // Teste Größe L
            if (isset($test_product_dimensions['l'])) {
                $chest_cm = $test_product_dimensions['l']['chest'] ?? 0;
                echo "✅ Größe L Chest: " . $chest_cm . "cm<br>";
                
                if ($chest_pixels > 0 && $chest_cm > 0) {
                    $pixel_to_cm = $chest_cm / $chest_pixels;
                    echo "✅ Pixel-zu-cm-Faktor: " . $pixel_to_cm . " cm/px<br>";
                    
                    // Teste Design-Berechnung
                    $design_position_px = 329;
                    $design_size_px = 135;
                    $design_position_cm = $design_position_px * $pixel_to_cm;
                    $design_size_cm = $design_size_px * $pixel_to_cm;
                    
                    echo "✅ Design-Berechnung:<br>";
                    echo "Position: " . $design_position_px . "px = " . round($design_position_cm, 1) . "cm<br>";
                    echo "Größe: " . $design_size_px . "px = " . round($design_size_cm, 1) . "cm<br>";
                    
                    echo "<h3>🎯 ERWARTETE ERGEBNISSE</h3>";
                    echo "Design-Position: 14.5cm von links<br>";
                    echo "Design-Größe: 5.9cm breit<br>";
                    echo "Berechnung: 135px × 0.44 cm/px = 5.9cm<br>";
                }
            }
        }
    }
} else {
    echo "❌ Meta-Daten konnten nicht abgerufen werden<br>";
}

// 5. Teste Calculate Sizing Integration
echo "<h2>5. Test Calculate Sizing Integration</h2>";
echo "Die Template-Meta-Daten sind jetzt erstellt.<br>";
echo "Du kannst jetzt die Calculate Sizing Funktion testen.<br>";
echo "Erwartetes Ergebnis: Design-Größe 5.9cm statt 3.4cm<br>";

echo "<h3>🔧 NÄCHSTE SCHRITTE</h3>";
echo "1. Gehe zu einer Bestellung mit Design-Produkten<br>";
echo "2. Klicke auf 'Calculate Sizing'<br>";
echo "3. Überprüfe die Debug-Logs<br>";
echo "4. Validiere die berechneten Größen<br>";

?> 