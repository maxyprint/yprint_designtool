<?php
/**
 * Test der reparierten generate_size_scale_factors Funktion
 * 
 * Testet ob die Funktion jetzt korrekt Skalierungsfaktoren generiert
 */

// Simuliere WordPress-Umgebung
if (!function_exists('get_post_meta')) {
    function get_post_meta($post_id, $key, $single = true) {
        // Simuliere Template 3657 Daten
        if ($post_id == 3657 && $key == '_template_view_print_areas') {
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
        }
        
        if ($post_id == 3657 && $key == '_product_dimensions') {
            return array(
                's' => array('chest' => 90, 'height_from_shoulder' => 60),
                'm' => array('chest' => 96, 'height_from_shoulder' => 64),
                'l' => array('chest' => 102, 'height_from_shoulder' => 68),
                'xl' => array('chest' => 108, 'height_from_shoulder' => 72)
            );
        }
        
        return false;
    }
}

if (!function_exists('error_log')) {
    function error_log($message) {
        echo "LOG: " . $message . "\n";
    }
}

if (!function_exists('current_time')) {
    function current_time($type = 'mysql') {
        return date('Y-m-d H:i:s');
    }
}

// Simuliere die reparierte generate_size_scale_factors Funktion
class Mock_Octo_Print_API_Integration {
    
    public function generate_size_scale_factors($template_id, $size_name) {
        error_log("YPrint Debug: 🎯 generate_size_scale_factors() aufgerufen - Template: {$template_id}, Größe: {$size_name}");
        
        // ✅ REPARIERT: Lade Template-Messungen aus der korrekten Datenquelle (wp_postmeta)
        $template_measurements = get_post_meta($template_id, '_template_view_print_areas', true);
        error_log("YPrint Debug: 🎯 Template-Messungen aus _template_view_print_areas geladen: " . (is_array($template_measurements) ? count($template_measurements) : 'Nicht-Array'));
        
        if (empty($template_measurements) || !is_array($template_measurements)) {
            error_log("YPrint Debug: ❌ Keine Template-Messungen in _template_view_print_areas gefunden");
            return $this->generate_fallback_scale_factors($template_id, $size_name);
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
        
        error_log("YPrint Debug: 🎯 Messungen aus Views extrahiert: " . count($measurements));
        
        if (empty($measurements)) {
            error_log("YPrint Debug: ⚠️ Keine Messungen in Views gefunden, verwende Fallback");
            return $this->generate_fallback_scale_factors($template_id, $size_name);
        }
        
        // ✅ REPARIERT: Generiere Skalierungsfaktoren mit korrigierter Datenstruktur
        $scale_factors = array();
        foreach ($measurements as $measurement) {
            // ✅ NEU: Korrekte Datenstruktur aus _template_view_print_areas
            $measurement_type = $measurement['type'] ?? $measurement['measurement_type'] ?? 'unknown';
            $template_pixel_distance = floatval($measurement['pixel_distance'] ?? 0);
            $template_real_distance_cm = floatval($measurement['real_distance_cm'] ?? 0);
            
            error_log("YPrint Debug: 🔍 Verarbeite Messung: {$measurement_type} - {$template_pixel_distance}px = {$template_real_distance_cm}cm");
            
            if ($template_pixel_distance <= 0 || $template_real_distance_cm <= 0) {
                error_log("YPrint Debug: ⚠️ Überspringe ungültige Messung: {$measurement_type}");
                continue;
            }
            
            // ✅ NEU: Verbesserte Skalierungsfaktor-Berechnung
            $size_specific_factor = $this->calculate_enhanced_size_scale_factor(
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
                    'calculation_method' => 'enhanced_template_measurements',
                    'debug_info' => array(
                        'measurement_type' => $measurement_type,
                        'calculation_timestamp' => current_time('mysql')
                    )
                );
                
                error_log("YPrint Debug: 🎯 Skalierungsfaktor für {$measurement_type}: {$size_specific_factor}x");
            } else {
                error_log("YPrint Debug: ⚠️ Kein gültiger Skalierungsfaktor für {$measurement_type}");
            }
        }
        
        error_log("YPrint Debug: ✅ Erfolgreich " . count($scale_factors) . " Skalierungsfaktoren generiert");
        error_log("YPrint Debug: 📊 Verfügbare Faktoren: " . implode(', ', array_keys($scale_factors)));
        
        if (empty($scale_factors)) {
            error_log("YPrint Debug: ⚠️ Keine gültigen Skalierungsfaktoren generiert, verwende Fallback");
            return $this->generate_fallback_scale_factors($template_id, $size_name);
        }
        
        return $scale_factors;
    }
    
    private function calculate_enhanced_size_scale_factor($measurement_type, $template_real_distance_cm, $template_id, $size_name) {
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
                    
                    error_log("YPrint Debug: 📏 Enhanced scale factor for {$measurement_type}: {$template_real_distance_cm}cm → {$size_specific_dimension}cm = {$scale_factor}x");
                    
                    return $scale_factor;
                }
            }
        }
        
        // Fallback: Verwende Größen-basierte Schätzung
        error_log("YPrint Debug: ⚠️ No exact dimension match found for {$measurement_type}, using size-based estimation");
        return $this->estimate_scale_factor_from_size($size_name);
    }
    
    private function estimate_scale_factor_from_size($size_name) {
        $size_scale_map = array(
            'XS' => 0.85,
            'S' => 0.90,
            's' => 0.90,
            'M' => 1.00,
            'm' => 1.00,
            'L' => 1.10,
            'l' => 1.10,
            'XL' => 1.20,
            'xl' => 1.20,
            'XXL' => 1.30
        );
        
        $estimated_factor = $size_scale_map[$size_name] ?? 1.0;
        error_log("YPrint Debug: 📏 Estimated scale factor for size {$size_name}: {$estimated_factor}x");
        
        return $estimated_factor;
    }
    
    private function generate_fallback_scale_factors($template_id, $size_name) {
        error_log("YPrint Debug: 🔄 Verwende Fallback-Skalierungsfaktoren für Template {$template_id}, Größe {$size_name}");
        
        $product_dimensions = get_post_meta($template_id, '_product_dimensions', true);
        if (empty($product_dimensions) || !isset($product_dimensions[$size_name])) {
            return array();
        }
        
        $fallback_factors = array();
        $size_dimensions = $product_dimensions[$size_name];
        
        foreach ($size_dimensions as $dimension_type => $dimension_value) {
            $fallback_factors[$dimension_type] = $this->estimate_scale_factor_from_size($size_name);
        }
        
        error_log("YPrint Debug: 🔄 Fallback-Faktoren generiert: " . json_encode($fallback_factors));
        return $fallback_factors;
    }
}

// Teste die reparierte Funktion
echo "=== TEST DER REPARIERTEN generate_size_scale_factors FUNKTION ===\n\n";

$api_integration = new Mock_Octo_Print_API_Integration();

echo "🧪 Teste Template 3657, Größe 's':\n";
$scale_factors = $api_integration->generate_size_scale_factors(3657, 's');

echo "\n📊 ERGEBNIS:\n";
if (!empty($scale_factors)) {
    echo "✅ Skalierungsfaktoren erfolgreich generiert!\n";
    foreach ($scale_factors as $measurement_type => $factor_data) {
        echo "   {$measurement_type}: {$factor_data['size_specific_factor']}x\n";
        echo "     - Template: {$factor_data['template_pixel_distance']}px = {$factor_data['template_real_distance_cm']}cm\n";
        echo "     - Methode: {$factor_data['calculation_method']}\n";
    }
} else {
    echo "❌ Keine Skalierungsfaktoren generiert\n";
}

echo "\n🎯 TEST ABGESCHLOSSEN!\n";
?>
