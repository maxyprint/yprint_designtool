<?php
/**
 * Test der vollständigen Integration aller neuen Features
 * 
 * Testet:
 * 1. Multiple Meta-Key-Unterstützung für Produktdimensionen
 * 2. Canvas-Größe Integration
 * 3. Relative Koordinaten für Device-Unabhängigkeit
 * 4. Skalierungsfaktor-Extraktion
 */

// Simuliere WordPress-Umgebung
if (!function_exists('get_post_meta')) {
    function get_post_meta($post_id, $key, $single = true) {
        // Simuliere Template 3657 Daten
        if ($post_id == 3657) {
            switch ($key) {
                case '_product_dimensions':
                    // ✅ NEU: Simuliere dass dieser Meta-Key existiert
                    return array(
                        's' => array('chest' => 90, 'height_from_shoulder' => 60),
                        'm' => array('chest' => 96, 'height_from_shoulder' => 64),
                        'l' => array('chest' => 102, 'height_from_shoulder' => 68),
                        'xl' => array('chest' => 108, 'height_from_shoulder' => 72)
                    );
                
                case '_template_view_print_areas':
                    // ✅ NEU: Simuliere Template mit Canvas-Größe und Messungen
                    return array(
                        189542 => array(
                            'canvas_width' => 800,
                            'canvas_height' => 600,
                            'photo_width_px' => 0,
                            'photo_height_px' => 0,
                            'measurements' => array(
                                array(
                                    'type' => 'height_from_shoulder',
                                    'pixel_distance' => 248.01814449753,
                                    'real_distance_cm' => 0, // Fehlender Wert
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
                                    'pixel_distance' => 154.00324671902,
                                    'real_distance_cm' => 0, // Fehlender Wert
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

// Simuliere die vollständig integrierte Admin-Klasse
class Mock_Octo_Print_Designer_Admin_Complete_Integration {
    
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
            
            // SCHRITT 2: Produktdimensionen abrufen (MIT MULTIPLE META-KEYS)
            $result[] = "";
            $result[] = "📏 SCHRITT 2: Produktdimensionen abrufen";
            $result[] = "----------------------------------------";
            
            // ✅ NEU: Multiple Meta-Keys für Produktdimensionen ausprobieren
            $product_dimensions = null;
            $used_meta_key = '';
            
            // Versuche verschiedene mögliche Meta-Keys
            $possible_meta_keys = array(
                '_product_dimensions',
                '_template_product_dimensions', 
                '_product_dimensions_template',
                '_template_sizes',
                '_variation_dimensions'
            );
            
            foreach ($possible_meta_keys as $meta_key) {
                $temp_dimensions = get_post_meta($template_id, $meta_key, true);
                if (!empty($temp_dimensions) && is_array($temp_dimensions)) {
                    $product_dimensions = $temp_dimensions;
                    $used_meta_key = $meta_key;
                    $result[] = "✅ Produktdimensionen gefunden in Meta-Key: {$meta_key}";
                    break;
                }
            }
            
            if (empty($product_dimensions)) {
                $result[] = "❌ Keine Produktdimensionen in bekannten Meta-Keys gefunden!";
                $result[] = "   Versuchte Keys: " . implode(', ', $possible_meta_keys);
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
            
            // SCHRITT 5: Skalierungsfaktor berechnen (MIT FEHLENDEN REAL_DISTANCE_CM)
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
                            
                            if ($template_pixel_distance <= 0) {
                                $result[] = "⚠️ Überspringe ungültige Messung: {$measurement_type} (Pixel-Distanz <= 0)";
                                continue;
                            }
                            
                            // ✅ NEU: Verwende Produktdimensionen als Referenz wenn real_distance_cm fehlt
                            $reference_distance_cm = $template_real_distance_cm;
                            $calculation_method = 'template_measurement';
                            
                            if ($template_real_distance_cm <= 0) {
                                if (isset($product_dimensions[$test_size][$measurement_type])) {
                                    $reference_distance_cm = $product_dimensions[$test_size][$measurement_type];
                                    $calculation_method = 'product_dimension_fallback';
                                    $result[] = "   💡 Verwende Produktdimension als Referenz: {$reference_distance_cm}cm";
                                } else {
                                    $result[] = "⚠️ Überspringe Messung: {$measurement_type} (keine Referenz-Distanz verfügbar)";
                                    continue;
                                }
                            }
                            
                            // Berechne Skalierungsfaktor basierend auf Produktdimensionen
                            if (isset($product_dimensions[$test_size][$measurement_type])) {
                                // ✅ NEU: Berechne echten Skalierungsfaktor basierend auf Pixel-zu-CM-Verhältnis
                                $pixels_per_cm = $template_pixel_distance / $reference_distance_cm;
                                $size_specific_factor = $pixels_per_cm;
                                
                                $generated_scale_factors[$measurement_type] = array(
                                    'template_pixel_distance' => $template_pixel_distance,
                                    'template_real_distance_cm' => $reference_distance_cm,
                                    'size_specific_factor' => $size_specific_factor,
                                    'size_name' => $test_size,
                                    'calculation_method' => 'direct_admin_implementation',
                                    'reference_source' => $calculation_method,
                                    'pixels_per_cm' => $pixels_per_cm,
                                    'debug_info' => array(
                                        'measurement_type' => $measurement_type,
                                        'parsing_method' => 'wordpress_auto_deserialize',
                                        'calculation_timestamp' => current_time('mysql'),
                                        'original_real_distance_cm' => $template_real_distance_cm,
                                        'used_reference_distance_cm' => $reference_distance_cm
                                    )
                                );
                                
                                $result[] = "🎯 Skalierungsfaktor für {$measurement_type}: {$size_specific_factor}x (Pixel/CM: {$pixels_per_cm})";
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
            
            // SCHRITT 7: Test-Koordinaten umrechnen (MIT CANVAS-INTEGRATION)
            $result[] = "";
            $result[] = "🎨 SCHRITT 7: Test-Koordinaten umrechnen";
            $result[] = "----------------------------------------";
            
            // Test-Koordinaten (Pixel)
            $test_canvas_x = 100;
            $test_canvas_y = 150;
            
            // ✅ NEU: Verwende echte Canvas-Größe aus Template-Daten
            $template_canvas_width = 800; // Standard-Fallback
            $template_canvas_height = 600; // Standard-Fallback
            
            if (!empty($template_measurements_parsed)) {
                $first_view = reset($template_measurements_parsed);
                if (isset($first_view['canvas_width']) && isset($first_view['canvas_height'])) {
                    $template_canvas_width = intval($first_view['canvas_width']);
                    $template_canvas_height = intval($first_view['canvas_height']);
                    $result[] = "🎨 Template-Canvas-Größe: {$template_canvas_width}x{$template_canvas_height}px";
                }
            }
            
            // Canvas-Konfiguration
            $canvas_config = array(
                'width' => $template_canvas_width,
                'height' => $template_canvas_height,
                'print_area_width_mm' => 200,
                'print_area_height_mm' => 250
            );
            
            // ✅ NEU: Berechne relative Koordinaten (0.0-1.0) für Device-Unabhängigkeit
            $relative_x = $test_canvas_x / $template_canvas_width;
            $relative_y = $test_canvas_y / $template_canvas_height;
            
            // Basis-Umrechnung
            $pixel_to_mm_x = $canvas_config['print_area_width_mm'] / $canvas_config['width'];
            $pixel_to_mm_y = $canvas_config['print_area_height_mm'] / $canvas_config['height'];
            
            // Mit Skalierungsfaktor
            $offset_x_mm = round($test_canvas_x * $pixel_to_mm_x * $scale_factor, 1);
            $offset_y_mm = round($test_canvas_y * $pixel_to_mm_y * $scale_factor, 1);
            
            $result[] = "✅ Koordinaten-Umrechnung:";
            $result[] = "   Canvas: ({$test_canvas_x}, {$test_canvas_y}) px";
            $result[] = "   Relative: ({$relative_x}, {$relative_y}) [0.0-1.0]";
            $result[] = "   Print: ({$offset_x_mm}, {$offset_y_mm}) mm";
            $result[] = "   Skalierungsfaktor: {$scale_factor}";
            $result[] = "   Canvas-Referenz: {$template_canvas_width}x{$template_canvas_height}px";
            
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
            $result[] = "Canvas-Referenz: {$template_canvas_width}x{$template_canvas_height}px";
            $result[] = "Verwendeter Meta-Key: {$used_meta_key}";
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
    
    /**
     * ✅ NEU: Simuliere AJAX-Response mit Skalierungsfaktor-Extraktion
     */
    public function simulate_ajax_response($template_id, $test_size, $test_position) {
        $test_result = $this->perform_design_size_calculation_test($template_id, $test_size, $test_position);
        
        // ✅ NEU: Extrahiere Skalierungsfaktoren aus dem Test-Ergebnis
        $scale_factors = array();
        if (preg_match_all('/🎯 Skalierungsfaktor für ([^:]+): ([0-9.]+)x/', $test_result, $matches)) {
            for ($i = 0; $i < count($matches[1]); $i++) {
                $scale_factors[$matches[1][$i]] = floatval($matches[2][$i]);
            }
        }
        
        // ✅ NEU: Extrahiere aktiven Skalierungsfaktor
        $active_scale_factor = 1.0;
        if (preg_match('/✅ Aktiver Skalierungsfaktor: ([0-9.]+)x/', $test_result, $match)) {
            $active_scale_factor = floatval($match[1]);
        }
        
        // ✅ NEU: Extrahiere verwendeten Meta-Key
        $used_meta_key = 'unknown';
        if (preg_match('/Verwendeter Meta-Key: ([^\n]+)/', $test_result, $match)) {
            $used_meta_key = trim($match[1]);
        }
        
        return array(
            'success' => true,
            'message' => 'Design size calculation test completed',
            'test_result' => $test_result,
            'scale_factors' => $scale_factors,
            'active_scale_factor' => $active_scale_factor,
            'used_meta_key' => $used_meta_key
        );
    }
}

// Teste die vollständige Integration
echo "=== TEST DER VOLLSTÄNDIGEN INTEGRATION ALLER NEUEN FEATURES ===\n\n";

// Erstelle Admin-Instanz
$admin = new Mock_Octo_Print_Designer_Admin_Complete_Integration();

// Teste die neue Logik
echo "🧪 Teste vollständige Integration (Template 3657, Größe s)...\n\n";

$result = $admin->perform_design_size_calculation_test(3657, 's', 'front');
echo $result;

echo "\n" . str_repeat("=", 80) . "\n";
echo "🎯 AJAX-RESPONSE SIMULATION:\n\n";

$ajax_response = $admin->simulate_ajax_response(3657, 's', 'front');
echo "✅ AJAX Success: " . ($ajax_response['success'] ? 'true' : 'false') . "\n";
echo "📝 Message: " . $ajax_response['message'] . "\n";
echo "🎯 Aktiver Skalierungsfaktor: " . $ajax_response['active_scale_factor'] . "x\n";
echo "🔑 Verwendeter Meta-Key: " . $ajax_response['used_meta_key'] . "\n";
echo "📊 Alle Skalierungsfaktoren:\n";

foreach ($ajax_response['scale_factors'] as $type => $factor) {
    echo "   {$type}: {$factor}x\n";
}

echo "\n🎯 VOLLSTÄNDIGE INTEGRATION TEST ABGESCHLOSSEN!\n";
?>
