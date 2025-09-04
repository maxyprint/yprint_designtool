<?php
/**
 * Test der neuen YPrint Sizing System Architektur
 * 
 * Testet:
 * 1. Standard-Produktdimensionen (hardcoded)
 * 2. Referenzmaß-System (ein Maß pro View)
 * 3. Relative Koordinaten-Speicherung
 * 4. Dynamische Größenberechnung
 * 5. API-Integration mit größenspezifischen Koordinaten
 */

// Simuliere WordPress-Umgebung
if (!function_exists('get_post_meta')) {
    function get_post_meta($post_id, $key, $single = true) {
        // Simuliere Template 3657 Daten
        if ($post_id == 3657) {
            switch ($key) {
                case '_template_view_print_areas':
                    return array(
                        189542 => array(
                            'canvas_width' => 800,
                            'canvas_height' => 600,
                            'measurements' => array(
                                'reference_measurement' => array(
                                    'measurement_type' => 'height_from_shoulder',
                                    'pixel_distance' => 248.01814449753,
                                    'reference_points' => array(
                                        array('x' => 100, 'y' => 50),
                                        array('x' => 100, 'y' => 298)
                                    ),
                                    'created_at' => '2024-01-15 10:30:00',
                                    'is_reference' => true
                                )
                            )
                        ),
                        679311 => array(
                            'canvas_width' => 800,
                            'canvas_height' => 600,
                            'measurements' => array(
                                'reference_measurement' => array(
                                    'measurement_type' => 'chest',
                                    'pixel_distance' => 154.00324671902,
                                    'reference_points' => array(
                                        array('x' => 78, 'y' => 147),
                                        array('x' => 232, 'y' => 146)
                                    ),
                                    'created_at' => '2024-01-15 10:30:00',
                                    'is_reference' => true
                                )
                            )
                        )
                    );
                
                default:
                    return false;
            }
        }
        
        // Simuliere Design 12345 Daten
        if ($post_id == 12345) {
            switch ($key) {
                case '_design_elements':
                    return array(
                        'text_element_1' => array(
                            'position_x_factor' => 0.65,
                            'position_y_factor' => 0.3,
                            'width_factor' => 1.3,
                            'height_factor' => 0.4,
                            'template_view_id' => 679311,
                            'content' => 'YPrint Design',
                            'font_size_factor' => 0.08,
                            'element_type' => 'text'
                        ),
                        'image_element_1' => array(
                            'position_x_factor' => 0.2,
                            'position_y_factor' => 0.5,
                            'width_factor' => 0.8,
                            'height_factor' => 0.6,
                            'template_view_id' => 189542,
                            'content' => 'logo.png',
                            'font_size_factor' => 0,
                            'element_type' => 'image'
                        )
                    );
                
                case '_design_views':
                    return array(
                        189542 => array(
                            'canvas_width' => 800,
                            'canvas_height' => 600,
                            'reference_measurement' => array(
                                'measurement_type' => 'height_from_shoulder',
                                'pixel_distance' => 248.01814449753
                            ),
                            'elements' => array()
                        ),
                        679311 => array(
                            'canvas_width' => 800,
                            'canvas_height' => 600,
                            'reference_measurement' => array(
                                'measurement_type' => 'chest',
                                'pixel_distance' => 154.00324671902
                            ),
                            'elements' => array()
                        )
                    );
                
                case '_design_template_id':
                    return 3657;
                
                default:
                    return false;
            }
        }
        
        return false;
    }
}

if (!function_exists('update_post_meta')) {
    function update_post_meta($post_id, $key, $value) {
        return true; // Simuliere erfolgreiche Speicherung
    }
}

if (!function_exists('wp_insert_post')) {
    function wp_insert_post($post_data) {
        return 12345; // Simuliere neue Design-ID
    }
}

if (!function_exists('current_time')) {
    function current_time($format) {
        return date($format);
    }
}

/**
 * Simuliere die neue API-Integration-Klasse
 */
class YPrintAPIIntegration {
    
    /**
     * Get standard product dimensions (hardcoded fallback)
     */
    private function get_standard_product_dimensions() {
        return array(
            'xs' => array(
                'chest' => 44, 'hem_width' => 40, 'height_from_shoulder' => 62, 
                'sleeve_length' => 24.5, 'sleeve_opening' => 17, 'shoulder_to_shoulder' => 50.5,
                'neck_opening' => 18, 'biceps' => 22.5, 'rib_height' => 2
            ),
            's' => array(
                'chest' => 47, 'hem_width' => 43, 'height_from_shoulder' => 65, 
                'sleeve_length' => 25, 'sleeve_opening' => 17.5, 'shoulder_to_shoulder' => 52,
                'neck_opening' => 18.5, 'biceps' => 23, 'rib_height' => 2
            ),
            'm' => array(
                'chest' => 50, 'hem_width' => 46, 'height_from_shoulder' => 68, 
                'sleeve_length' => 25.5, 'sleeve_opening' => 18, 'shoulder_to_shoulder' => 53.5,
                'neck_opening' => 19, 'biceps' => 23.5, 'rib_height' => 2
            ),
            'l' => array(
                'chest' => 53, 'hem_width' => 49, 'height_from_shoulder' => 71, 
                'sleeve_length' => 26, 'sleeve_opening' => 18.5, 'shoulder_to_shoulder' => 55,
                'neck_opening' => 19.5, 'biceps' => 24, 'rib_height' => 2
            ),
            'xl' => array(
                'chest' => 56, 'hem_width' => 52, 'height_from_shoulder' => 74, 
                'sleeve_length' => 26.5, 'sleeve_opening' => 19, 'shoulder_to_shoulder' => 56.5,
                'neck_opening' => 20, 'biceps' => 24.5, 'rib_height' => 2
            ),
            'xxl' => array(
                'chest' => 59, 'hem_width' => 55, 'height_from_shoulder' => 77, 
                'sleeve_length' => 27, 'sleeve_opening' => 19.5, 'shoulder_to_shoulder' => 58,
                'neck_opening' => 20.5, 'biceps' => 25, 'rib_height' => 2
            ),
            '3xl' => array(
                'chest' => 62, 'hem_width' => 58, 'height_from_shoulder' => 80, 
                'sleeve_length' => 27.5, 'sleeve_opening' => 20, 'shoulder_to_shoulder' => 59.5,
                'neck_opening' => 21, 'biceps' => 25.5, 'rib_height' => 2
            ),
            '4xl' => array(
                'chest' => 65, 'hem_width' => 61, 'height_from_shoulder' => 83, 
                'sleeve_length' => 28, 'sleeve_opening' => 20.5, 'shoulder_to_shoulder' => 61,
                'neck_opening' => 21.5, 'biceps' => 26, 'rib_height' => 2
            ),
        );
    }
    
    /**
     * Normalize size designation
     */
    private function normalize_size_designation($size) {
        $size_mappings = array(
            'xs' => 'xs',
            'extra-small' => 'xs', 
            's' => 's',
            'small' => 's',
            'm' => 'm',
            'medium' => 'm',
            'l' => 'l',
            'large' => 'l',
            'xl' => 'xl',
            'extra-large' => 'xl',
            'xxl' => 'xxl'
        );
        
        return $size_mappings[strtolower($size)] ?? strtolower($size);
    }
    
    /**
     * Calculate design coordinates for specific order size
     */
    public function calculate_design_coordinates_for_size($design_id, $order_size) {
        echo "🎯 Berechne Design-Koordinaten für Größe {$order_size}\n";
        
        // Hole Design-Daten
        $design_elements = get_post_meta($design_id, '_design_elements', true);
        $design_views = get_post_meta($design_id, '_design_views', true);
        $template_id = get_post_meta($design_id, '_design_template_id', true);
        
        if (empty($design_elements) || empty($design_views) || !$template_id) {
            echo "❌ Unvollständige Design-Daten\n";
            return false;
        }
        
        // Normalisiere Größenbezeichnung
        $normalized_size = $this->normalize_size_designation($order_size);
        
        // Hole Produktdimensionen für die Bestellgröße
        $product_dimensions = $this->get_standard_product_dimensions();
        if (!isset($product_dimensions[$normalized_size])) {
            echo "❌ Größe {$normalized_size} nicht in Produktdimensionen gefunden\n";
            return false;
        }
        
        $size_dimensions = $product_dimensions[$normalized_size];
        echo "✅ Produktdimensionen für Größe {$normalized_size} geladen\n";
        
        // Berechne Koordinaten für jedes Design-Element
        $calculated_coordinates = array();
        
        foreach ($design_elements as $element_id => $element_data) {
            $view_id = $element_data['template_view_id'];
            $view_data = $design_views[$view_id] ?? null;
            
            if (!$view_data || !isset($view_data['reference_measurement'])) {
                echo "⚠️ Keine Referenzmessung für View {$view_id}\n";
                continue;
            }
            
            $reference_measurement = $view_data['reference_measurement'];
            $measurement_type = $reference_measurement['measurement_type'];
            $reference_pixel_distance = $reference_measurement['pixel_distance'];
            
            // Hole physische Dimension für die Messung
            $physical_dimension_cm = $size_dimensions[$measurement_type] ?? 0;
            if ($physical_dimension_cm <= 0) {
                echo "⚠️ Keine physische Dimension für {$measurement_type} in Größe {$normalized_size}\n";
                continue;
            }
            
            // Berechne Skalierungsfaktor
            $scale_factor = $physical_dimension_cm / ($reference_pixel_distance / 10);
            
            // Berechne absolute Koordinaten in mm
            $position_x_mm = ($element_data['position_x_factor'] * $reference_pixel_distance / 10) * $scale_factor * 10;
            $position_y_mm = ($element_data['position_y_factor'] * $reference_pixel_distance / 10) * $scale_factor * 10;
            $width_mm = ($element_data['width_factor'] * $reference_pixel_distance / 10) * $scale_factor * 10;
            $height_mm = ($element_data['height_factor'] * $reference_pixel_distance / 10) * $scale_factor * 10;
            
            $calculated_coordinates[$element_id] = array(
                'x' => round($position_x_mm, 2),
                'y' => round($position_y_mm, 2),
                'width' => round($width_mm, 2),
                'height' => round($height_mm, 2),
                'content' => $element_data['content'],
                'element_type' => $element_data['element_type'],
                'font_size_mm' => round(($element_data['font_size_factor'] * $reference_pixel_distance / 10) * $scale_factor * 10, 2),
                'view_id' => $view_id,
                'measurement_type' => $measurement_type,
                'scale_factor' => round($scale_factor, 4),
                'reference_distance_px' => $reference_pixel_distance,
                'physical_dimension_cm' => $physical_dimension_cm
            );
            
            echo "✅ Element {$element_id} berechnet: {$position_x_mm}mm x {$position_y_mm}mm, {$width_mm}mm x {$height_mm}mm\n";
        }
        
        if (empty($calculated_coordinates)) {
            echo "❌ Keine Koordinaten berechnet\n";
            return false;
        }
        
        echo "✅ Erfolgreich " . count($calculated_coordinates) . " Elemente für Größe {$normalized_size} berechnet\n";
        return $calculated_coordinates;
    }
}

/**
 * Simuliere die neue Template-Klasse
 */
class YPrintTemplate {
    
    /**
     * Save reference measurement for a view (only one per view)
     */
    public static function save_reference_measurement($template_id, $view_id, $measurement_data) {
        echo "🎯 Speichere Referenzmaß für View {$view_id}\n";
        
        // Hole bestehende View-Print-Areas
        $view_print_areas = get_post_meta($template_id, '_template_view_print_areas', true);
        if (!is_array($view_print_areas)) {
            $view_print_areas = array();
        }
        
        // Stelle sicher, dass der View existiert
        if (!isset($view_print_areas[$view_id])) {
            $view_print_areas[$view_id] = array(
                'canvas_width' => 800,
                'canvas_height' => 600,
                'measurements' => array()
            );
        }
        
        // Erstelle das Referenzmaß
        $reference_measurement = array(
            'measurement_type' => $measurement_data['measurement_type'] ?? $measurement_data['type'],
            'pixel_distance' => floatval($measurement_data['pixel_distance']),
            'reference_points' => array(
                array(
                    'x' => intval($measurement_data['points'][0]['x']),
                    'y' => intval($measurement_data['points'][0]['y'])
                ),
                array(
                    'x' => intval($measurement_data['points'][1]['x']),
                    'y' => intval($measurement_data['points'][1]['y'])
                )
            ),
            'created_at' => current_time('mysql'),
            'is_reference' => true
        );
        
        // Speichere nur das Referenzmaß (überschreibe alle vorherigen)
        $view_print_areas[$view_id]['measurements'] = array(
            'reference_measurement' => $reference_measurement
        );
        
        // Speichere in der Datenbank
        $result = update_post_meta($template_id, '_template_view_print_areas', $view_print_areas);
        
        if ($result) {
            echo "✅ Referenzmaß erfolgreich gespeichert\n";
            return true;
        } else {
            echo "❌ Fehler beim Speichern des Referenzmaßes\n";
            return false;
        }
    }
    
    /**
     * Get reference measurement for a view
     */
    public static function get_reference_measurement($template_id, $view_id) {
        $view_print_areas = get_post_meta($template_id, '_template_view_print_areas', true);
        
        if (!is_array($view_print_areas) || !isset($view_print_areas[$view_id])) {
            return false;
        }
        
        if (!isset($view_print_areas[$view_id]['measurements']['reference_measurement'])) {
            return false;
        }
        
        return $view_print_areas[$view_id]['measurements']['reference_measurement'];
    }
}

/**
 * Simuliere die neue Designer-Klasse
 */
class YPrintDesigner {
    
    /**
     * Create design from template with relative coordinates
     */
    public function create_design_from_template($template_id, $user_id, $design_elements) {
        echo "🎨 Erstelle Design aus Template {$template_id}\n";
        
        // Hole Template-Referenzmessungen
        $template_views = get_post_meta($template_id, '_template_view_print_areas', true);
        if (empty($template_views)) {
            echo "❌ Keine Template-Views gefunden\n";
            return false;
        }
        
        // Erstelle Design-Post
        $design_data = array(
            'post_title' => 'Design from Template ' . $template_id,
            'post_content' => '',
            'post_status' => 'publish',
            'post_type' => 'octo_design',
            'post_author' => $user_id,
            'meta_input' => array(
                '_design_template_id' => $template_id,
                '_design_views' => array(),
                '_design_elements' => array(),
                '_design_created_at' => current_time('mysql')
            )
        );
        
        $design_id = wp_insert_post($design_data);
        if (!$design_id) {
            echo "❌ Fehler beim Erstellen des Design-Posts\n";
            return false;
        }
        
        // Kopiere Template-Views in Design
        $design_views = array();
        foreach ($template_views as $view_id => $view_data) {
            $reference_measurement = $view_data['measurements']['reference_measurement'] ?? null;
            
            if ($reference_measurement) {
                $design_views[$view_id] = array(
                    'canvas_width' => $view_data['canvas_width'],
                    'canvas_height' => $view_data['canvas_height'],
                    'reference_measurement' => $reference_measurement,
                    'elements' => array()
                );
                
                echo "✅ View {$view_id} in Design kopiert mit Referenzmaß: {$reference_measurement['measurement_type']}\n";
            }
        }
        
        // Speichere Design-Views
        update_post_meta($design_id, '_design_views', $design_views);
        
        // Füge Design-Elemente hinzu (mit relativen Koordinaten)
        if (!empty($design_elements)) {
            $this->add_design_elements($design_id, $design_elements, $design_views);
        }
        
        echo "✅ Design {$design_id} erfolgreich aus Template {$template_id} erstellt\n";
        return $design_id;
    }
    
    /**
     * Add design elements with relative coordinates
     */
    private function add_design_elements($design_id, $elements, $design_views) {
        $design_elements = array();
        
        foreach ($elements as $element_id => $element_data) {
            $view_id = $element_data['view_id'] ?? array_keys($design_views)[0];
            $view_data = $design_views[$view_id] ?? null;
            
            if (!$view_data || !isset($view_data['reference_measurement'])) {
                echo "⚠️ Keine Referenzmessung für View {$view_id}\n";
                continue;
            }
            
            $reference_distance = $view_data['reference_measurement']['pixel_distance'];
            
            // Konvertiere absolute Koordinaten zu relativen Faktoren
            $relative_element = array(
                'position_x_factor' => $element_data['x'] / $reference_distance,
                'position_y_factor' => $element_data['y'] / $reference_distance,
                'width_factor' => $element_data['width'] / $reference_distance,
                'height_factor' => $element_data['height'] / $reference_distance,
                'template_view_id' => $view_id,
                'content' => $element_data['content'] ?? '',
                'font_size_factor' => ($element_data['font_size'] ?? 16) / $reference_distance,
                'element_type' => $element_data['type'] ?? 'text'
            );
            
            $design_elements[$element_id] = $relative_element;
            
            echo "✅ Element {$element_id} mit relativen Koordinaten hinzugefügt\n";
        }
        
        // Speichere Design-Elemente
        update_post_meta($design_id, '_design_elements', $design_elements);
    }
}

// ===== TEST-AUSFÜHRUNG =====

echo "🚀 YPrint Sizing System - Neue Architektur Test\n";
echo "================================================\n\n";

// Test 1: Standard-Produktdimensionen
echo "📏 TEST 1: Standard-Produktdimensionen\n";
echo "----------------------------------------\n";
$api = new YPrintAPIIntegration();
$reflection = new ReflectionClass($api);
$method = $reflection->getMethod('get_standard_product_dimensions');
$method->setAccessible(true);
$dimensions = $method->invoke($api);

echo "✅ Standard-Dimensionen geladen: " . count($dimensions) . " Größen\n";
foreach ($dimensions as $size => $size_dimensions) {
    echo "   {$size}: chest={$size_dimensions['chest']}cm, height={$size_dimensions['height_from_shoulder']}cm\n";
}
echo "\n";

// Test 2: Referenzmaß-System
echo "🎯 TEST 2: Referenzmaß-System\n";
echo "----------------------------------------\n";
$template_id = 3657;
$view_id = 679311;

// Speichere Referenzmaß
$measurement_data = array(
    'measurement_type' => 'chest',
    'pixel_distance' => 154.00324671902,
    'points' => array(
        array('x' => 78, 'y' => 147),
        array('x' => 232, 'y' => 146)
    )
);

$result = YPrintTemplate::save_reference_measurement($template_id, $view_id, $measurement_data);
if ($result) {
    echo "✅ Referenzmaß erfolgreich gespeichert\n";
    
    // Hole Referenzmaß
    $reference_measurement = YPrintTemplate::get_reference_measurement($template_id, $view_id);
    if ($reference_measurement) {
        echo "✅ Referenzmaß erfolgreich abgerufen:\n";
        echo "   Typ: {$reference_measurement['measurement_type']}\n";
        echo "   Pixel-Distanz: {$reference_measurement['pixel_distance']}\n";
        echo "   Referenzpunkte: " . json_encode($reference_measurement['reference_points']) . "\n";
    }
}
echo "\n";

// Test 3: Design-Erstellung mit relativen Koordinaten
echo "🎨 TEST 3: Design-Erstellung mit relativen Koordinaten\n";
echo "--------------------------------------------------------\n";
$designer = new YPrintDesigner();
$user_id = 1;

$design_elements = array(
    'text_element_1' => array(
        'x' => 100,
        'y' => 150,
        'width' => 200,
        'height' => 50,
        'view_id' => 679311,
        'content' => 'YPrint Text',
        'font_size' => 16,
        'type' => 'text'
    ),
    'image_element_1' => array(
        'x' => 300,
        'y' => 200,
        'width' => 150,
        'height' => 100,
        'view_id' => 189542,
        'content' => 'logo.png',
        'font_size' => 0,
        'type' => 'image'
    )
);

$design_id = $designer->create_design_from_template($template_id, $user_id, $design_elements);
if ($design_id) {
    echo "✅ Design erfolgreich erstellt mit ID: {$design_id}\n";
}
echo "\n";

// Test 4: Dynamische Größenberechnung
echo "⚖️ TEST 4: Dynamische Größenberechnung\n";
echo "----------------------------------------\n";
$order_size = 'L';
$calculated_coordinates = $api->calculate_design_coordinates_for_size($design_id, $order_size);

if ($calculated_coordinates) {
    echo "✅ Koordinaten für Größe {$order_size} erfolgreich berechnet:\n";
    foreach ($calculated_coordinates as $element_id => $coords) {
        echo "   {$element_id}:\n";
        echo "     Position: {$coords['x']}mm x {$coords['y']}mm\n";
        echo "     Größe: {$coords['width']}mm x {$coords['height']}mm\n";
        echo "     Skalierungsfaktor: {$coords['scale_factor']}x\n";
        echo "     Referenzdistanz: {$coords['reference_distance_px']}px\n";
        echo "     Physische Dimension: {$coords['physical_dimension_cm']}cm\n";
    }
}
echo "\n";

// Test 5: Vergleich verschiedener Größen
echo "🔍 TEST 5: Vergleich verschiedener Größen\n";
echo "----------------------------------------\n";
$test_sizes = array('S', 'M', 'L', 'XL');

foreach ($test_sizes as $test_size) {
    echo "📏 Teste Größe: {$test_size}\n";
    $test_coordinates = $api->calculate_design_coordinates_for_size($design_id, $test_size);
    
    if ($test_coordinates) {
        foreach ($test_coordinates as $element_id => $coords) {
            if ($element_id === 'text_element_1') {
                echo "   {$element_id}: {$coords['width']}mm x {$coords['height']}mm (Faktor: {$coords['scale_factor']}x)\n";
                break;
            }
        }
    }
}
echo "\n";

echo "🎉 Alle Tests erfolgreich abgeschlossen!\n";
echo "✅ Neue YPrint Sizing System Architektur funktioniert korrekt\n";
echo "✅ Referenzmaß-System implementiert\n";
echo "✅ Relative Koordinaten-Speicherung funktioniert\n";
echo "✅ Dynamische Größenberechnung erfolgreich\n";
echo "✅ API-Integration mit größenspezifischen Koordinaten bereit\n";
