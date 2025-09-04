<?php
/**
 * YPrint Datenbank-Abstimmung Debug - PHP Version
 * 
 * Analysiert warum die reparierte Funktion keine Daten in der Datenbank findet
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

// Debug-Funktion für die Datenbank-Abstimmung
function debug_database_mismatch($template_id) {
    echo "=== YPRINT DATENBANK-ABSTIMMUNG DEBUG ===\n";
    echo "Template ID: {$template_id}\n\n";
    
    // 1. PRÜFE TEMPLATE-EXISTENZ UND POST-TYPE
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
    
    // 2. PRÜFE ALLE META-DATEN FÜR TEMPLATE 3657
    echo "📊 SCHRITT 2: Alle Meta-Daten für Template {$template_id}\n";
    echo "----------------------------------------\n";
    
    $meta_keys_to_check = array(
        '_product_dimensions',
        '_template_product_dimensions', 
        '_template_view_print_areas'
    );
    
    foreach ($meta_keys_to_check as $meta_key) {
        $meta_value = get_post_meta($template_id, $meta_key, true);
        
        echo "Meta-Key: {$meta_key}\n";
        if ($meta_value === false) {
            echo "   Status: ❌ Nicht gefunden\n";
        } elseif (empty($meta_value)) {
            echo "   Status: ⚠️ Leer (NULL, '', [], {})\n";
        } elseif (is_array($meta_value)) {
            echo "   Status: ✅ Array mit " . count($meta_value) . " Elementen\n";
            echo "   Inhalt: " . json_encode($meta_value) . "\n";
        } else {
            echo "   Status: ⚠️ Unbekannter Typ: " . gettype($meta_value) . "\n";
            echo "   Inhalt: " . substr($meta_value, 0, 100) . "...\n";
        }
        echo "\n";
    }
    
    // 3. DETAILLIERTE ANALYSE DER PRODUKTDIMENSIONEN
    echo "📏 SCHRITT 3: Produktdimensionen-Analyse\n";
    echo "----------------------------------------\n";
    
    $product_dimensions = get_post_meta($template_id, '_product_dimensions', true);
    if (empty($product_dimensions)) {
        echo "❌ Keine Produktdimensionen in _product_dimensions gefunden\n";
        
        // Versuche alternativen Meta-Key
        $product_dimensions = get_post_meta($template_id, '_template_product_dimensions', true);
        if (empty($product_dimensions)) {
            echo "❌ Auch _template_product_dimensions nicht gefunden\n";
        } else {
            echo "✅ Produktdimensionen aus _template_product_dimensions gefunden\n";
        }
    } else {
        echo "✅ Produktdimensionen aus _product_dimensions gefunden\n";
    }
    
    if (!empty($product_dimensions) && is_array($product_dimensions)) {
        echo "   Verfügbare Größen: " . implode(', ', array_keys($product_dimensions)) . "\n";
        foreach ($product_dimensions as $size => $dimensions) {
            echo "   {$size}: " . json_encode($dimensions) . "\n";
        }
    }
    echo "\n";
    
    // 4. DETAILLIERTE ANALYSE DER TEMPLATE-MESSUNGEN
    echo "🎯 SCHRITT 4: Template-Messungen-Analyse\n";
    echo "----------------------------------------\n";
    
    $template_measurements = get_post_meta($template_id, '_template_view_print_areas', true);
    if (empty($template_measurements)) {
        echo "❌ Keine Template-Messungen in _template_view_print_areas gefunden!\n";
        return;
    }
    
    if (!is_array($template_measurements)) {
        echo "❌ _template_view_print_areas ist kein Array!\n";
        echo "   Typ: " . gettype($template_measurements) . "\n";
        return;
    }
    
    echo "✅ Template-Messungen gefunden:\n";
    echo "   Anzahl Views: " . count($template_measurements) . "\n";
    echo "   View-IDs: " . implode(', ', array_keys($template_measurements)) . "\n\n";
    
    foreach ($template_measurements as $view_id => $view_data) {
        echo "   View {$view_id}:\n";
        
        if (!is_array($view_data)) {
            echo "     ❌ View-Daten sind kein Array!\n";
            continue;
        }
        
        if (!isset($view_data['measurements'])) {
            echo "     ❌ Kein 'measurements' Feld gefunden!\n";
            echo "     Verfügbare Felder: " . implode(', ', array_keys($view_data)) . "\n";
            continue;
        }
        
        if (!is_array($view_data['measurements'])) {
            echo "     ❌ 'measurements' ist kein Array!\n";
            continue;
        }
        
        $measurement_count = count($view_data['measurements']);
        echo "     ✅ {$measurement_count} Messungen gefunden\n";
        
        foreach ($view_data['measurements'] as $index => $measurement) {
            echo "       Messung {$index}:\n";
            
            if (!is_array($measurement)) {
                echo "         ❌ Messung ist kein Array!\n";
                continue;
            }
            
            echo "         Verfügbare Felder: " . implode(', ', array_keys($measurement)) . "\n";
            
            // Prüfe spezifische Felder
            $type = $measurement['type'] ?? 'NULL';
            $measurement_type = $measurement['measurement_type'] ?? 'NULL';
            $pixel_distance = $measurement['pixel_distance'] ?? 'NULL';
            $real_distance_cm = $measurement['real_distance_cm'] ?? 'NULL';
            
            echo "         type: {$type}\n";
            echo "         measurement_type: {$measurement_type}\n";
            echo "         pixel_distance: {$pixel_distance}\n";
            echo "         real_distance_cm: {$real_distance_cm}\n";
            
            // Prüfe ob die Felder gültige Werte haben
            $has_valid_data = ($type !== 'NULL' && $pixel_distance !== 'NULL' && $real_distance_cm !== 'NULL');
            echo "         Gültige Daten: " . ($has_valid_data ? '✅ Ja' : '❌ Nein') . "\n";
        }
    }
    echo "\n";
    
    // 5. ANALYSE WARUM DIE REPARIERTE FUNKTION KEINE DATEN FINDET
    echo "🔍 SCHRITT 5: Analyse warum reparierte Funktion keine Daten findet\n";
    echo "----------------------------------------\n";
    
    // Simuliere die reparierte Funktion
    echo "🧪 Simuliere reparierte generate_size_scale_factors Funktion:\n";
    
    $template_measurements = get_post_meta($template_id, '_template_view_print_areas', true);
    echo "   📊 Template-Messungen geladen: " . (is_array($template_measurements) ? count($template_measurements) : 'Nicht-Array') . "\n";
    
    if (empty($template_measurements) || !is_array($template_measurements)) {
        echo "   ❌ Keine Template-Messungen gefunden\n";
        echo "   🔍 Mögliche Ursachen:\n";
        echo "      - Meta-Key '_template_view_print_areas' existiert nicht\n";
        echo "      - Meta-Value ist leer oder NULL\n";
        echo "      - Meta-Value ist kein Array\n";
        return;
    }
    
    // Extrahiere alle Messungen aus allen Views
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
        echo "   ❌ Keine Messungen in Views gefunden\n";
        echo "   🔍 Mögliche Ursachen:\n";
        echo "      - Views haben kein 'measurements' Feld\n";
        echo "      - 'measurements' Feld ist leer\n";
        echo "      - 'measurements' Feld ist kein Array\n";
        return;
    }
    
    // Analysiere jede Messung
    echo "   🔍 Analysiere einzelne Messungen:\n";
    foreach ($measurements as $index => $measurement) {
        echo "     Messung {$index}:\n";
        
        if (!is_array($measurement)) {
            echo "       ❌ Ist kein Array\n";
            continue;
        }
        
        // Prüfe die Felder die die Funktion braucht
        $measurement_type = $measurement['type'] ?? $measurement['measurement_type'] ?? 'NULL';
        $template_pixel_distance = floatval($measurement['pixel_distance'] ?? 0);
        $template_real_distance_cm = floatval($measurement['real_distance_cm'] ?? 0);
        
        echo "       measurement_type: {$measurement_type}\n";
        echo "       pixel_distance: {$template_pixel_distance}\n";
        echo "       real_distance_cm: {$template_real_distance_cm}\n";
        
        // Prüfe ob die Messung gültig ist
        if ($template_pixel_distance <= 0 || $template_real_distance_cm <= 0) {
            echo "       ❌ Ungültige Messung (pixel_distance <= 0 oder real_distance_cm <= 0)\n";
        } else {
            echo "       ✅ Gültige Messung\n";
        }
    }
    
    echo "\n";
    
    // 6. ZUSAMMENFASSUNG UND LÖSUNGSVORSCHLÄGE
    echo "🎯 SCHRITT 6: Zusammenfassung und Lösungsvorschläge\n";
    echo "----------------------------------------\n";
    
    $product_dimensions = get_post_meta($template_id, '_product_dimensions', true);
    $template_measurements = get_post_meta($template_id, '_template_view_print_areas', true);
    
    $has_product_dimensions = !empty($product_dimensions) && is_array($product_dimensions);
    $has_template_measurements = !empty($template_measurements) && is_array($template_measurements);
    
    echo "📊 Status der kritischen Daten:\n";
    echo "   Produktdimensionen: " . ($has_product_dimensions ? '✅ Vorhanden' : '❌ Fehlen') . "\n";
    echo "   Template-Messungen: " . ($has_template_measurements ? '✅ Vorhanden' : '❌ Fehlen') . "\n";
    
    if (!$has_product_dimensions) {
        echo "\n🔧 Lösungsvorschlag für fehlende Produktdimensionen:\n";
        echo "   - Prüfe ob Meta-Key '_product_dimensions' existiert\n";
        echo "   - Prüfe ob Meta-Key '_template_product_dimensions' existiert\n";
        echo "   - Stelle sicher dass die Daten als Array gespeichert sind\n";
    }
    
    if (!$has_template_measurements) {
        echo "\n🔧 Lösungsvorschlag für fehlende Template-Messungen:\n";
        echo "   - Prüfe ob Meta-Key '_template_view_print_areas' existiert\n";
        echo "   - Stelle sicher dass die Daten als Array gespeichert sind\n";
        echo "   - Prüfe ob die View-Struktur korrekt ist\n";
    }
    
    if ($has_product_dimensions && $has_template_measurements) {
        echo "\n✅ Alle kritischen Daten sind vorhanden!\n";
        echo "🔍 Das Problem liegt wahrscheinlich in der Datenstruktur oder den Feldnamen.\n";
    }
}

// Führe den Debug aus
debug_database_mismatch(3657);

echo "\n🎯 DATENBANK-ABSTIMMUNG DEBUG ABGESCHLOSSEN!\n";
?>
