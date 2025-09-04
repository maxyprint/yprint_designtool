<?php
/**
 * YPrint Skalierungsfaktoren Debug - PHP Version
 * 
 * Analysiert die Datenstruktur um zu verstehen warum Skalierungsfaktoren leer bleiben
 */

// Simuliere WordPress-Umgebung
if (!function_exists('get_post_meta')) {
    function get_post_meta($post_id, $key, $single = true) {
        // Simuliere Template 3657 Daten basierend auf dem Test-Output
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
                    return array(
                        '189542' => array(
                            'measurements' => array(
                                array(
                                    'type' => 'height_from_shoulder',
                                    'pixel_distance' => 154.0,
                                    'real_distance_cm' => 60.0
                                )
                            )
                        ),
                        '679311' => array(
                            'measurements' => array(
                                array(
                                    'type' => 'chest',
                                    'pixel_distance' => 200.0,
                                    'real_distance_cm' => 90.0
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

if (!function_exists('get_post')) {
    function get_post($post_id) {
        if ($post_id == 3657) {
            return (object) array(
                'ID' => 3657,
                'post_title' => 'Shirt SS25',
                'post_type' => 'design_template',
                'post_status' => 'publish'
            );
        }
        return false;
    }
}

// Debug-Funktion für die Datenstruktur
function debug_template_data_structure($template_id) {
    echo "=== YPRINT TEMPLATE DATENSTRUKTUR DEBUG ===\n";
    echo "Template ID: {$template_id}\n\n";
    
    // 1. PRÜFE TEMPLATE-EXISTENZ
    echo "📋 SCHRITT 1: Template-Daten abrufen\n";
    echo "----------------------------------------\n";
    $template = get_post($template_id);
    if ($template) {
        echo "✅ Template gefunden: {$template->post_title}\n";
        echo "   Post-Type: {$template->post_type}\n";
        echo "   Status: {$template->post_status}\n";
    } else {
        echo "❌ Template nicht gefunden!\n";
        return;
    }
    echo "\n";
    
    // 2. PRÜFE PRODUKTDIMENSIONEN
    echo "📏 SCHRITT 2: Produktdimensionen abrufen\n";
    echo "----------------------------------------\n";
    $product_dimensions = get_post_meta($template_id, '_product_dimensions', true);
    if (empty($product_dimensions) || !is_array($product_dimensions)) {
        echo "❌ Keine Produktdimensionen gefunden!\n";
        echo "   Fallback: Verwende Standard-Dimensionen\n";
        
        // Versuche alternativen Meta-Key
        $product_dimensions = get_post_meta($template_id, '_template_product_dimensions', true);
        if (empty($product_dimensions) || !is_array($product_dimensions)) {
            echo "❌ Auch _template_product_dimensions nicht gefunden\n";
            return;
        } else {
            echo "✅ Produktdimensionen aus _template_product_dimensions geladen\n";
        }
    } else {
        echo "✅ Produktdimensionen aus _product_dimensions geladen\n";
    }
    
    if (!empty($product_dimensions)) {
        foreach ($product_dimensions as $size => $dimensions) {
            echo "   {$size}: " . json_encode($dimensions) . "\n";
        }
    }
    echo "\n";
    
    // 3. PRÜFE TEMPLATE-VIEW-PRINT-AREAS
    echo "🎯 SCHRITT 3: Template-Messungen abrufen\n";
    echo "----------------------------------------\n";
    $template_measurements = get_post_meta($template_id, '_template_view_print_areas', true);
    if (empty($template_measurements) || !is_array($template_measurements)) {
        echo "❌ Keine Template-Messungen in _template_view_print_areas gefunden!\n";
        return;
    }
    
    echo "✅ Template-Messungen gefunden:\n";
    foreach ($template_measurements as $view_id => $view_data) {
        $measurement_count = isset($view_data['measurements']) ? count($view_data['measurements']) : 0;
        echo "   View {$view_id}: {$measurement_count} Messungen\n";
        
        if (isset($view_data['measurements']) && is_array($view_data['measurements'])) {
            foreach ($view_data['measurements'] as $index => $measurement) {
                echo "     Messung {$index}: " . ($measurement['type'] ?? 'unknown') . "\n";
                
                // Debug: Zeige alle verfügbaren Felder
                echo "       Verfügbare Felder: " . implode(', ', array_keys($measurement)) . "\n";
                echo "       type: " . ($measurement['type'] ?? 'NULL') . "\n";
                echo "       measurement_type: " . ($measurement['measurement_type'] ?? 'NULL') . "\n";
                echo "       pixel_distance: " . ($measurement['pixel_distance'] ?? 'NULL') . "\n";
                echo "       real_distance_cm: " . ($measurement['real_distance_cm'] ?? 'NULL') . "\n";
                
                // Teste die reparierte Funktion
                echo "       Skalierungsfaktoren: ";
                $scale_factors = test_generate_size_scale_factors($template_id, 's', $measurement);
                if (!empty($scale_factors)) {
                    echo json_encode($scale_factors) . "\n";
                } else {
                    echo "[] (leer)\n";
                }
            }
        }
    }
    echo "\n";
    
    // 4. DETAILLIERTE DATENSTRUKTUR-ANALYSE
    echo "🔍 SCHRITT 4: Detaillierte Datenstruktur-Analyse\n";
    echo "----------------------------------------\n";
    echo "Template-Messungen Struktur:\n";
    echo json_encode($template_measurements, JSON_PRETTY_PRINT);
    echo "\n\n";
    
    // 5. TESTE DIE REPARIERTE FUNKTION
    echo "🧪 SCHRITT 5: Teste reparierte generate_size_scale_factors Funktion\n";
    echo "----------------------------------------\n";
    $scale_factors = test_generate_size_scale_factors($template_id, 's');
    
    if (!empty($scale_factors)) {
        echo "✅ Funktion funktioniert! Skalierungsfaktoren generiert:\n";
        foreach ($scale_factors as $measurement_type => $factor_data) {
            echo "   {$measurement_type}: {$factor_data['size_specific_factor']}x\n";
        }
    } else {
        echo "❌ Funktion funktioniert NICHT! Keine Skalierungsfaktoren generiert\n";
    }
}

// Teste die reparierte Funktion
function test_generate_size_scale_factors($template_id, $size_name, $specific_measurement = null) {
    echo "   🧪 Teste generate_size_scale_factors() für Template {$template_id}, Größe {$size_name}\n";
    
    // ✅ REPARIERT: Lade Template-Messungen aus der korrekten Datenquelle (wp_postmeta)
    $template_measurements = get_post_meta($template_id, '_template_view_print_areas', true);
    echo "   📊 Template-Messungen geladen: " . (is_array($template_measurements) ? count($template_measurements) : 'Nicht-Array') . "\n";
    
    if (empty($template_measurements) || !is_array($template_measurements)) {
        echo "   ❌ Keine Template-Messungen gefunden\n";
        return array();
    }
    
    // ✅ NEU: Extrahiere alle Messungen aus allen Views
    $measurements = array();
    foreach ($template_measurements as $view_id => $view_data) {
        if (isset($view_data['measurements']) && is_array($view_data['measurements'])) {
            foreach ($view_data['measurements'] as $measurement) {
                $measurements[] = $measurement;
            }
        }
    }
    
    echo "   📊 Messungen aus Views extrahiert: " . count($measurements) . "\n";
    
    if (empty($measurements)) {
        echo "   ⚠️ Keine Messungen in Views gefunden\n";
        return array();
    }
    
    // ✅ REPARIERT: Generiere Skalierungsfaktoren mit korrigierter Datenstruktur
    $scale_factors = array();
    foreach ($measurements as $measurement) {
        // ✅ NEU: Korrekte Datenstruktur aus _template_view_print_areas
        $measurement_type = $measurement['type'] ?? $measurement['measurement_type'] ?? 'unknown';
        $template_pixel_distance = floatval($measurement['pixel_distance'] ?? 0);
        $template_real_distance_cm = floatval($measurement['real_distance_cm'] ?? 0);
        
        echo "   🔍 Verarbeite Messung: {$measurement_type} - {$template_pixel_distance}px = {$template_real_distance_cm}cm\n";
        
        if ($template_pixel_distance <= 0 || $template_real_distance_cm <= 0) {
            echo "   ⚠️ Überspringe ungültige Messung: {$measurement_type}\n";
            continue;
        }
        
        // ✅ NEU: Verbesserte Skalierungsfaktor-Berechnung
        $size_specific_factor = calculate_enhanced_size_scale_factor(
            $measurement_type,
            $template_real_distance_cm,
            $template_id,
            $size_name
        );
        
        if ($size_specific_factor > 0) {
            $scale_factors[$measurement_type] = array(
                'template_pixel_distance' => $template_pixel_distance,
                'template_real_distance_cm' => $template_real_distance_cm,
                'size_specific_factor' => $size_specific_factor,
                'size_name' => $size_name,
                'calculation_method' => 'enhanced_template_measurements'
            );
            
            echo "   🎯 Skalierungsfaktor für {$measurement_type}: {$size_specific_factor}x\n";
        } else {
            echo "   ⚠️ Kein gültiger Skalierungsfaktor für {$measurement_type}\n";
        }
    }
    
    echo "   ✅ Erfolgreich " . count($scale_factors) . " Skalierungsfaktoren generiert\n";
    return $scale_factors;
}

// Hilfsfunktionen
function calculate_enhanced_size_scale_factor($measurement_type, $template_real_distance_cm, $template_id, $size_name) {
    $product_dimensions = get_post_meta($template_id, '_product_dimensions', true);
    
    if (empty($product_dimensions) || !isset($product_dimensions[$size_name])) {
        return 0;
    }
    
    $size_dimensions = $product_dimensions[$size_name];
    
    // Erweitertes Mapping von Messungstypen zu Produktdimensionen
    $measurement_dimension_mapping = array(
        'chest' => array('chest_circumference', 'chest_width', 'chest'),
        'height_from_shoulder' => array('height_from_shoulder', 'shoulder_height', 'body_height'),
        'waist' => array('waist_circumference', 'waist_width', 'waist'),
        'length' => array('length', 'body_length', 'shirt_length'),
        'shoulder' => array('shoulder_width', 'shoulder', 'shoulder_to_shoulder'),
        'sleeve' => array('sleeve_length', 'arm_length', 'sleeve'),
        'neck' => array('neck_circumference', 'neck', 'collar_size'),
        'hip' => array('hip_circumference', 'hip_width', 'hip'),
        'bicep' => array('bicep_circumference', 'bicep', 'arm_circumference')
    );
    
    $dimension_keys = $measurement_dimension_mapping[$measurement_type] ?? array();
    
    // Versuche alle möglichen Dimension-Schlüssel
    foreach ($dimension_keys as $dimension_key) {
        if (isset($size_dimensions[$dimension_key])) {
            $size_specific_dimension = floatval($size_dimensions[$dimension_key]);
            
            if ($size_specific_dimension > 0) {
                // Berechne Skalierungsfaktor: Neue Größe / Template-Größe
                $scale_factor = $size_specific_dimension / $template_real_distance_cm;
                
                // Begrenze den Skalierungsfaktor auf sinnvolle Werte (0.7 bis 1.5)
                $scale_factor = max(0.7, min(1.5, $scale_factor));
                
                echo "   📏 Enhanced scale factor for {$measurement_type}: {$template_real_distance_cm}cm → {$size_specific_dimension}cm = {$scale_factor}x\n";
                
                return $scale_factor;
            }
        }
    }
    
    // Fallback: Verwende Größen-basierte Schätzung
    echo "   ⚠️ No exact dimension match found for {$measurement_type}, using size-based estimation\n";
    return estimate_scale_factor_from_size($size_name);
}

function estimate_scale_factor_from_size($size_name) {
    $size_scale_map = array(
        'XS' => 0.85, 'S' => 0.90, 's' => 0.90,
        'M' => 1.00, 'm' => 1.00,
        'L' => 1.10, 'l' => 1.10,
        'XL' => 1.20, 'xl' => 1.20,
        'XXL' => 1.30
    );
    
    $estimated_factor = $size_scale_map[$size_name] ?? 1.0;
    echo "   📏 Estimated scale factor for size {$size_name}: {$estimated_factor}x\n";
    
    return $estimated_factor;
}

// Führe den Debug aus
debug_template_data_structure(3657);

echo "\n🎯 DEBUG ABGESCHLOSSEN!\n";
?>
