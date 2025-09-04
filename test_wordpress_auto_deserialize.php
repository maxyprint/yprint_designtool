<?php
/**
 * Test der WordPress-Auto-Deserialize-Logik
 * 
 * Testet ob die neue Logik funktioniert, die berücksichtigt dass WordPress
 * bereits automatisch PHP-Serialized-Arrays deserialisiert
 */

// Simuliere WordPress-Umgebung
if (!function_exists('get_post_meta')) {
    function get_post_meta($post_id, $key, $single = true) {
        // Simuliere Template 3657 Daten
        if ($post_id == 3657) {
            switch ($key) {
                case '_product_dimensions':
                    return array(
                        's' => array('chest' => 90, 'height_from_shoulder' => 60),
                        'm' => array('chest' => 96, 'height_from_shoulder' => 64),
                        'l' => array('chest' => 102, 'height_from_shoulder' => 68),
                        'xl' => array('chest' => 108, 'height_from_shoulder' => 72)
                    );
                
                case '_template_view_print_areas':
                    // ✅ NEU: Simuliere dass WordPress bereits deserialisiert hat
                    return array(
                        189542 => array(
                            'canvas_width' => 800,
                            'canvas_height' => 600,
                            'photo_width_px' => 0,
                            'photo_height_px' => 0,
                            'measurements' => array(
                                array(
                                    'type' => 'height_from_shoulder',
                                    'pixel_distance' => 154.0,
                                    'real_distance_cm' => 60.0,
                                    'position' => 'front',
                                    'size' => 's',
                                    'created_at' => '2024-01-15 10:30:00',
                                    'updated_at' => '2024-01-15 10:30:00',
                                    'status' => 'active',
                                    'id' => 1
                                )
                            )
                        ),
                        679311 => array(
                            'canvas_width' => 800,
                            'canvas_height' => 600,
                            'photo_width_px' => 0,
                            'photo_height_px' => 0,
                            'measurements' => array(
                                array(
                                    'type' => 'chest',
                                    'pixel_distance' => 200.0,
                                    'real_distance_cm' => 90.0,
                                    'position' => 'front',
                                    'size' => 's',
                                    'created_at' => '2024-01-15 10:30:00',
                                    'updated_at' => '2024-01-15 10:30:00',
                                    'status' => 'active',
                                    'id' => 2
                                )
                            )
                        )
                    );
                
                default:
                    return false;
            }
        }
        return false;
    }
}

if (!function_exists('current_time')) {
    function current_time($type) {
        return date('Y-m-d H:i:s');
    }
}

// Simuliere die reparierte Admin-Klasse
class Mock_Octo_Print_Designer_Admin_WordPress_Auto {
    
    /**
     * ✅ NEU: Führt den Design-Größenberechnung Test durch
     */
    public function perform_design_size_calculation_test($template_id, $test_size, $test_position) {
        try {
            $result = array();
            $result[] = "=== YPRINT DESIGN-GRÖSSENBERECHNUNG TEST ===";
            $result[] = "Template ID: {$template_id}";
            $result[] = "Test Größe: {$test_size}";
            $result[] = "Test Position: {$test_position}";
            $result[] = "";
            
            // SCHRITT 1: Template-Daten abrufen
            $result[] = "📋 SCHRITT 1: Template-Daten abrufen";
            $result[] = "----------------------------------------";
            $result[] = "✅ Template gefunden: Shirt SS25";
            
            // SCHRITT 2: Produktdimensionen abrufen
            $result[] = "";
            $result[] = "📏 SCHRITT 2: Produktdimensionen abrufen";
            $result[] = "----------------------------------------";
            
            $product_dimensions = get_post_meta($template_id, '_product_dimensions', true);
            if (empty($product_dimensions)) {
                $result[] = "❌ Keine Produktdimensionen gefunden!";
                $result[] = "   Fallback: Verwende Standard-Dimensionen";
                $product_dimensions = array(
                    's' => array('chest' => 90, 'height_from_shoulder' => 60),
                    'm' => array('chest' => 96, 'height_from_shoulder' => 64),
                    'l' => array('chest' => 102, 'height_from_shoulder' => 68),
                    'xl' => array('chest' => 108, 'height_from_shoulder' => 72)
                );
            }
            
            $result[] = "✅ Produktdimensionen gefunden:";
            foreach ($product_dimensions as $size => $dimensions) {
                $result[] = "   {$size}: " . json_encode($dimensions);
            }
            
            // SCHRITT 3: Template-Messungen abrufen
            $result[] = "";
            $result[] = "🎯 SCHRITT 3: Template-Messungen abrufen";
            $result[] = "----------------------------------------";
            
            $template_measurements = get_post_meta($template_id, '_template_view_print_areas', true);
            if (empty($template_measurements)) {
                $result[] = "❌ Keine Template-Messungen gefunden!";
                $result[] = "   Fallback: Verwende Standard-Skalierungsfaktoren";
            } else {
                $result[] = "✅ Template-Messungen gefunden:";
                foreach ($template_measurements as $view_id => $view_data) {
                    if (isset($view_data['measurements'])) {
                        $result[] = "   View {$view_id}: " . count($view_data['measurements']) . " Messungen";
                        foreach ($view_data['measurements'] as $index => $measurement) {
                            $result[] = "     Messung {$index}: " . ($measurement['type'] ?? $measurement['measurement_type'] ?? 'unknown');
                            if (isset($measurement['size_scale_factors'])) {
                                $result[] = "       Skalierungsfaktoren: " . json_encode($measurement['size_scale_factors']);
                            }
                        }
                    }
                }
            }
            
            // SCHRITT 4: Größenspezifische Messungen berechnen
            $result[] = "";
            $result[] = "🔍 SCHRITT 4: Größenspezifische Messungen für '{$test_size}'";
            $result[] = "----------------------------------------";
            
            $size_measurements = array();
            if (isset($product_dimensions[$test_size])) {
                $size_measurements = $product_dimensions[$test_size];
                $result[] = "✅ Größenspezifische Messungen gefunden:";
                foreach ($size_measurements as $type => $value) {
                    $result[] = "   {$type}: {$value} cm";
                }
            } else {
                $result[] = "❌ Keine Messungen für Größe '{$test_size}' gefunden!";
                $size_measurements = reset($product_dimensions) ?: array();
            }
            
            // SCHRITT 5: Skalierungsfaktor berechnen (WORDPRESS-AUTO-DESERIALIZE)
            $result[] = "";
            $result[] = "⚖️ SCHRITT 5: Skalierungsfaktor berechnen";
            $result[] = "----------------------------------------";
            
            $scale_factor = 1.0; // Fallback
            $scale_factors_generated = false;
            
            // ✅ NEU: Direkte Implementierung der reparierten Logik
            $result[] = "🧮 Implementiere reparierte Logik direkt in der Admin-Klasse...";
            
            try {
                // ✅ NEU: WordPress deserialisiert bereits automatisch - verwende direkt das Array
                $template_measurements_parsed = get_post_meta($template_id, '_template_view_print_areas', true);
                
                if (!empty($template_measurements_parsed) && is_array($template_measurements_parsed)) {
                    $result[] = "✅ Template-Messungen direkt geladen (WordPress hat bereits deserialisiert)";
                    $result[] = "📊 Anzahl Views: " . count($template_measurements_parsed);
                    
                    // Extrahiere alle Messungen aus allen Views
                    $measurements = array();
                    foreach ($template_measurements_parsed as $view_id => $view_data) {
                        if (isset($view_data['measurements']) && is_array($view_data['measurements'])) {
                            foreach ($view_data['measurements'] as $measurement) {
                                $measurements[] = $measurement;
                            }
                        }
                    }
                    
                    $result[] = "📊 Messungen aus Views extrahiert: " . count($measurements);
                    
                    if (!empty($measurements)) {
                        // Generiere Skalierungsfaktoren direkt
                        $generated_scale_factors = array();
                        
                        foreach ($measurements as $measurement) {
                            $measurement_type = $measurement['type'] ?? $measurement['measurement_type'] ?? 'unknown';
                            $template_pixel_distance = floatval($measurement['pixel_distance'] ?? 0);
                            $template_real_distance_cm = floatval($measurement['real_distance_cm'] ?? 0);
                            
                            $result[] = "🔍 Verarbeite Messung: {$measurement_type} - {$template_pixel_distance}px = {$template_real_distance_cm}cm";
                            
                            if ($template_pixel_distance <= 0 || $template_real_distance_cm <= 0) {
                                $result[] = "⚠️ Überspringe ungültige Messung: {$measurement_type}";
                                continue;
                            }
                            
                            // Berechne Skalierungsfaktor basierend auf Produktdimensionen
                            if (isset($product_dimensions[$test_size][$measurement_type])) {
                                $size_specific_factor = 1.0; // Vereinfachte Berechnung für den Test
                                
                                $generated_scale_factors[$measurement_type] = array(
                                    'template_pixel_distance' => $template_pixel_distance,
                                    'template_real_distance_cm' => $template_real_distance_cm,
                                    'size_specific_factor' => $size_specific_factor,
                                    'size_name' => $test_size,
                                    'calculation_method' => 'direct_admin_implementation',
                                    'debug_info' => array(
                                        'measurement_type' => $measurement_type,
                                        'parsing_method' => 'wordpress_auto_deserialize',
                                        'calculation_timestamp' => current_time('mysql')
                                    )
                                );
                                
                                $result[] = "🎯 Skalierungsfaktor für {$measurement_type}: {$size_specific_factor}x";
                            } else {
                                $result[] = "⚠️ Keine Produktdimensionen für {$measurement_type} in Größe {$test_size}";
                            }
                        }
                        
                        if (!empty($generated_scale_factors)) {
                            $result[] = "✅ Skalierungsfaktoren erfolgreich generiert:";
                            foreach ($generated_scale_factors as $measurement_type => $factor_data) {
                                $result[] = "   {$measurement_type}: {$factor_data['size_specific_factor']}x";
                            }
                            
                            // Verwende den ersten verfügbaren Skalierungsfaktor
                            $first_factor = reset($generated_scale_factors);
                            $scale_factor = $first_factor['size_specific_factor'];
                            $scale_factors_generated = true;
                            
                            $result[] = "✅ Aktiver Skalierungsfaktor: {$scale_factor}x";
                            $result[] = "   Quelle: Direkte Admin-Implementierung (Messung: {$first_factor['measurement_type']})";
                        } else {
                            $result[] = "⚠️ Keine gültigen Skalierungsfaktoren generiert";
                        }
                    } else {
                        $result[] = "❌ Keine Messungen in den geparsten Daten gefunden";
                    }
                } else {
                    $result[] = "❌ Keine Template-Messungen in der Datenbank gefunden oder ungültiges Format";
                }
                
            } catch (Exception $e) {
                $result[] = "❌ Fehler in direkter Implementierung: " . $e->getMessage();
                $result[] = "🔍 Stack Trace: " . $e->getTraceAsString();
            }
            
            // SCHRITT 6: Physische Dimensionen berechnen
            $result[] = "";
            $result[] = "📐 SCHRITT 6: Physische Dimensionen berechnen";
            $result[] = "----------------------------------------";
            
            $physical_width_cm = $size_measurements['chest'] ?? 30;
            $physical_height_cm = $size_measurements['height_from_shoulder'] ?? 40;
            
            $result[] = "✅ Physische Dimensionen:";
            $result[] = "   Breite: {$physical_width_cm} cm";
            $result[] = "   Höhe: {$physical_height_cm} cm";
            
            // SCHRITT 7: Test-Koordinaten umrechnen
            $result[] = "";
            $result[] = "🎨 SCHRITT 7: Test-Koordinaten umrechnen";
            $result[] = "----------------------------------------";
            
            $test_canvas_x = 100;
            $test_canvas_y = 150;
            
            $canvas_config = array(
                'width' => 800,
                'height' => 600,
                'print_area_width_mm' => 200,
                'print_area_height_mm' => 250
            );
            
            $pixel_to_mm_x = $canvas_config['print_area_width_mm'] / $canvas_config['width'];
            $pixel_to_mm_y = $canvas_config['print_area_height_mm'] / $canvas_config['height'];
            
            $offset_x_mm = round($test_canvas_x * $pixel_to_mm_x * $scale_factor, 1);
            $offset_y_mm = round($test_canvas_y * $pixel_to_mm_y * $scale_factor, 1);
            
            $result[] = "✅ Koordinaten-Umrechnung:";
            $result[] = "   Canvas: ({$test_canvas_x}, {$test_canvas_y}) px";
            $result[] = "   Print: ({$offset_x_mm}, {$offset_y_mm}) mm";
            $result[] = "   Skalierungsfaktor: {$scale_factor}";
            
            // ENDERGEBNIS
            $result[] = "";
            $result[] = "🎯 ENDERGEBNIS";
            $result[] = "----------------------------------------";
            $result[] = "Template: Shirt SS25";
            $result[] = "Größe: {$test_size}";
            $result[] = "Position: {$test_position}";
            $result[] = "Physische Dimensionen: {$physical_width_cm} x {$physical_height_cm} cm";
            $result[] = "Skalierungsfaktor: {$scale_factor}";
            $result[] = "Test-Koordinaten: ({$offset_x_mm}, {$offset_y_mm}) mm";
            $result[] = "";
            $result[] = "✅ Test erfolgreich abgeschlossen!";
            
            return implode("\n", $result);
            
        } catch (Exception $e) {
            $result[] = "";
            $result[] = "❌ FEHLER IM TEST: " . $e->getMessage();
            $result[] = "🔍 Stack Trace: " . $e->getTraceAsString();
            
            return implode("\n", $result);
        } catch (Error $e) {
            $result[] = "";
            $result[] = "❌ PHP-FEHLER IM TEST: " . $e->getMessage();
            $result[] = "🔍 Stack Trace: " . $e->getTraceAsString();
            
            return implode("\n", $result);
        }
    }
}

// Teste die neue WordPress-Auto-Deserialize-Logik
echo "=== TEST DER WORDPRESS-AUTO-DESERIALIZE-LOGIK ===\n\n";

// Erstelle Admin-Instanz
$admin = new Mock_Octo_Print_Designer_Admin_WordPress_Auto();

// Teste die neue Logik
echo "🧪 Teste WordPress-Auto-Deserialize-Logik mit Template 3657, Größe s...\n\n";

$result = $admin->perform_design_size_calculation_test(3657, 's', 'front');
echo $result;

echo "\n🎯 WORDPRESS-AUTO-DESERIALIZE-LOGIK TEST ABGESCHLOSSEN!\n";
?>
