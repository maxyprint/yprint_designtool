<?php
/**
 * YPrint Linear API - Vereinfachtes Sizing-System
 * 
 * Eliminiert komplexe Workflow-Schritte und fatale Rückkonvertierungen
 * durch direkte, lineare Berechnungen basierend auf physischen Faktoren.
 * 
 * @package YPrint
 * @since 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class Octo_Print_Designer_Linear_API {
    
    /**
     * ✅ VEREINFACHT: Eine einzige Methode für finale Koordinaten
     * 
     * @param int $design_id Design-ID
     * @param string $ordered_size Bestellgröße (S, M, L, XL)
     * @return array|false Berechnete Koordinaten oder false bei Fehler
     */
    public function calculate_design_coordinates_for_size($design_id, $ordered_size) {
        error_log("YPrint LINEAR: 🎯 Berechne Koordinaten für Design {$design_id}, Größe {$ordered_size}");
        
        // Design-Daten laden
        $design_elements = get_post_meta($design_id, '_design_elements', true);
        $template_id = get_post_meta($design_id, '_design_template_id', true);
        
        if (empty($design_elements)) {
            error_log("YPrint LINEAR: ❌ Keine Design-Elemente gefunden für Design {$design_id}");
            return false;
        }
        
        // ✅ VEREINFACHT: Eine Methode für finale Koordinaten
        $final_coordinates = $this->calculate_final_coordinates_simple(
            $design_elements, 
            $ordered_size, 
            $template_id
        );
        
        if (empty($final_coordinates)) {
            error_log("YPrint LINEAR: ❌ Koordinatenberechnung fehlgeschlagen für Design {$design_id}");
            return false;
        }
        
        // Erfolgreiches Ergebnis loggen
        $element_count = count($final_coordinates);
        $first_element = reset($final_coordinates);
        error_log("YPrint LINEAR: ✅ {$element_count} Elemente berechnet - Erstes Element: x={$first_element['x']}mm, y={$first_element['y']}mm");
        
        return $final_coordinates;
    }
    
    /**
     * ✅ LINEARE Berechnung: Faktor × Größe = Millimeter
     * 
     * @param array $elements Design-Elemente mit physischen Faktoren
     * @param string $ordered_size Bestellgröße
     * @param int $template_id Template-ID
     * @return array Berechnete Koordinaten
     */
    private function calculate_final_coordinates_simple($elements, $ordered_size, $template_id) {
        // Größentabelle laden
        $size_measurements = $this->get_standard_size_measurements();
        $ordered_size_cm = $size_measurements[$ordered_size] ?? 51;  // Fallback zu M
        $results = array();
        
        foreach ($elements as $element_id => $element) {
            // Prüfe ob Element bereits neue Struktur hat
            if (isset($element['x_physical_factor']) && isset($element['y_physical_factor'])) {
                // ✅ NEUE STRUKTUR: Direkte physische Faktoren
                $results[$element_id] = array(
                    'x' => round($element['x_physical_factor'] * $ordered_size_cm * 10, 2),
                    'y' => round($element['y_physical_factor'] * $ordered_size_cm * 10, 2),
                    'width' => round($element['width_physical_factor'] * $ordered_size_cm * 10, 2),
                    'height' => round($element['height_physical_factor'] * $ordered_size_cm * 10, 2),
                    'content' => $element['content'] ?? '',
                    'element_type' => $element['element_type'] ?? 'text',
                    'font_size_mm' => round($element['font_size_physical_factor'] * $ordered_size_cm * 10, 2),
                    
                    // Berechnungsmetadata
                    'physical_factor_x' => $element['x_physical_factor'],
                    'physical_factor_y' => $element['y_physical_factor'],
                    'ordered_size_cm' => $ordered_size_cm,
                    'calculation' => "Linear: {$element['x_physical_factor']} × {$ordered_size_cm}cm × 10"
                );
            } else if (isset($element['position_x_factor']) && isset($element['position_y_factor'])) {
                // ✅ MIGRATION: Alte relative Faktoren zu physischen Faktoren
                $results[$element_id] = array(
                    'x' => round($element['position_x_factor'] * $ordered_size_cm * 10, 2),
                    'y' => round($element['position_y_factor'] * $ordered_size_cm * 10, 2),
                    'width' => round(($element['width_factor'] ?? 0.5) * $ordered_size_cm * 10, 2),
                    'height' => round(($element['height_factor'] ?? 0.3) * $ordered_size_cm * 10, 2),
                    'content' => $element['content'] ?? '',
                    'element_type' => $element['element_type'] ?? 'text',
                    'font_size_mm' => round(($element['font_size_factor'] ?? 0.1) * $ordered_size_cm * 10, 2),
                    
                    // Berechnungsmetadata
                    'physical_factor_x' => $element['position_x_factor'],
                    'physical_factor_y' => $element['position_y_factor'],
                    'ordered_size_cm' => $ordered_size_cm,
                    'calculation' => "Migration: {$element['position_x_factor']} × {$ordered_size_cm}cm × 10",
                    'migration_source' => 'relative_factors'
                );
            } else {
                error_log("YPrint LINEAR: ⚠️ Element {$element_id} hat keine gültigen Faktoren - überspringe");
                continue;
            }
        }
        
        return $results;
    }
    
    /**
     * ✅ Konsistente Größentabelle (Brustweite in cm)
     * Größe M als feste Referenz
     * 
     * @return array Größentabelle
     */
    private function get_standard_size_measurements() {
        return array(
            'S' => 49,   // 96% von M
            'M' => 51,   // Referenz-Basis
            'L' => 53,   // 104% von M  
            'XL' => 55   // 108% von M
        );
    }
    
    /**
     * ✅ VEREINFACHT: Referenzmessung mit Größe M als fester Basis
     * 
     * @param int $template_id Template-ID
     * @param string $view_id View-ID
     * @param array $measurement_data Messungsdaten
     * @return bool Erfolg
     */
    public static function save_reference_measurement_linear($template_id, $view_id, $measurement_data) {
        error_log("YPrint LINEAR: 🎯 Speichere Referenzmaß für View {$view_id} (Größe M als Basis)");
        
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
        
        // ✅ VEREINFACHT: Größe M als feste Referenz
        $reference_measurement = array(
            'measurement_type' => $measurement_data['measurement_type'] ?? $measurement_data['type'],
            'pixel_distance' => floatval($measurement_data['pixel_distance']),
            'physical_size_cm' => 51.0,  // FESTE Referenz: Größe M
            'reference_size' => 'M',     // Konsistente Basis
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
            'template_id' => $template_id,
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
            error_log("YPrint LINEAR: ✅ Referenzmessung gespeichert - {$measurement_data['pixel_distance']}px = 51cm (Größe M)");
            return true;
        } else {
            error_log("YPrint LINEAR: ❌ Fehler beim Speichern der Referenzmessung");
            return false;
        }
    }
    
    /**
     * ✅ VEREINFACHT: Element-Speicherung als direkte physische Faktoren
     * 
     * @param int $design_id Design-ID
     * @param array $elements Element-Daten
     * @param array $design_views View-Daten
     * @return bool Erfolg
     */
    public function add_design_elements_linear($design_id, $elements, $design_views) {
        error_log("YPrint LINEAR: 🎯 Speichere Design-Elemente als physische Faktoren");
        
        $design_elements = array();
        
        foreach ($elements as $element_id => $element_data) {
            $view_data = $design_views[$element_data['view_id']] ?? null;
            if (!$view_data || !isset($view_data['reference_measurement'])) {
                error_log("YPrint LINEAR: ⚠️ Keine Referenzmessung für View {$element_data['view_id']} - überspringe Element {$element_id}");
                continue;
            }
            
            $reference_distance = $view_data['reference_measurement']['pixel_distance'];
            
            // ✅ VEREINFACHT: Direkte physische Faktoren (keine Canvas-Normalisierung)
            $physical_element = array(
                'x_physical_factor' => $element_data['x'] / $reference_distance,
                'y_physical_factor' => $element_data['y'] / $reference_distance,
                'width_physical_factor' => $element_data['width'] / $reference_distance,
                'height_physical_factor' => $element_data['height'] / $reference_distance,
                
                // Basis-Eigenschaften
                'content' => $element_data['content'] ?? '',
                'element_type' => $element_data['type'] ?? 'text',
                'font_size_physical_factor' => ($element_data['font_size'] ?? 16) / $reference_distance,
                
                // Referenz-Kontext (für Validierung)
                'reference_measurement_type' => $view_data['reference_measurement']['measurement_type'],
                'reference_pixel_distance' => $reference_distance,
                'template_view_id' => $element_data['view_id'],
                
                // Transform-Eigenschaften
                'scale_x' => $element_data['scaleX'] ?? 1.0,
                'scale_y' => $element_data['scaleY'] ?? 1.0,
                'rotation' => $element_data['rotation'] ?? 0,
                
                // Metadata
                'created_at' => current_time('mysql'),
                'system_version' => 'linear_v1'
            );
            
            $design_elements[$element_id] = $physical_element;
            error_log("YPrint LINEAR: ✅ Element {$element_id} - Physische Faktoren: x={$physical_element['x_physical_factor']}, y={$physical_element['y_physical_factor']}");
        }
        
        // Speichere alle Elemente
        $result = update_post_meta($design_id, '_design_elements', $design_elements);
        
        if ($result) {
            error_log("YPrint LINEAR: ✅ " . count($design_elements) . " Elemente als physische Faktoren gespeichert");
            return true;
        } else {
            error_log("YPrint LINEAR: ❌ Fehler beim Speichern der Design-Elemente");
            return false;
        }
    }
    
    /**
     * ✅ Migration für bestehende Daten
     * 
     * @return int Anzahl migrierter Designs
     */
    public function migrate_to_linear_system() {
        error_log("YPrint LINEAR: 🚀 Starte Migration zu linearem System");
        
        // Alle Design-Posts finden
        $design_posts = get_posts(array(
            'post_type' => 'octo_design',
            'post_status' => 'any',
            'numberposts' => -1,
            'meta_key' => '_design_elements'
        ));
        
        $migrated_count = 0;
        
        foreach ($design_posts as $design_post) {
            $design_id = $design_post->ID;
            $elements = get_post_meta($design_id, '_design_elements', true);
            
            if (empty($elements)) {
                continue;
            }
            
            // Prüfe ob bereits migriert
            if (isset(reset($elements)['x_physical_factor'])) {
                error_log("YPrint LINEAR: Design {$design_id} bereits migriert - überspringe");
                continue;
            }
            
            // Migriere Elemente zu physischen Faktoren
            $migrated_elements = $this->convert_elements_to_physical_factors($elements, $design_id);
            
            if (!empty($migrated_elements)) {
                update_post_meta($design_id, '_design_elements', $migrated_elements);
                update_post_meta($design_id, '_linear_system_migrated', current_time('mysql'));
                $migrated_count++;
                
                error_log("YPrint LINEAR: ✅ Design {$design_id} erfolgreich migriert - " . count($migrated_elements) . " Elemente");
            }
        }
        
        error_log("YPrint LINEAR: ✅ Migration abgeschlossen - {$migrated_count} Designs migriert");
        return $migrated_count;
    }
    
    /**
     * Konvertiere alte Element-Struktur zu neuen physischen Faktoren
     * 
     * @param array $old_elements Alte Element-Struktur
     * @param int $design_id Design-ID
     * @return array|false Migrierte Elemente oder false bei Fehler
     */
    private function convert_elements_to_physical_factors($old_elements, $design_id) {
        $template_id = get_post_meta($design_id, '_design_template_id', true);
        if (!$template_id) {
            return false;
        }
        
        // Template-Referenzmessung laden
        $reference_measurements = get_post_meta($template_id, '_template_view_print_areas', true);
        if (empty($reference_measurements)) {
            return false;
        }
        
        // Finde erste verfügbare Referenzmessung
        $reference_pixel_distance = 154.0; // Fallback
        foreach ($reference_measurements as $view_data) {
            if (isset($view_data['measurements']['reference_measurement']['pixel_distance'])) {
                $reference_pixel_distance = $view_data['measurements']['reference_measurement']['pixel_distance'];
                break;
            }
        }
        
        $migrated_elements = array();
        
        foreach ($old_elements as $element_id => $element_data) {
            // Konvertiere alte Struktur zu neuen physischen Faktoren
            if (isset($element_data['position_x_factor']) && isset($element_data['position_y_factor'])) {
                // Schon relative Faktoren vorhanden
                $migrated_elements[$element_id] = array(
                    'x_physical_factor' => $element_data['position_x_factor'],
                    'y_physical_factor' => $element_data['position_y_factor'],
                    'width_physical_factor' => $element_data['width_factor'] ?? 0.5,
                    'height_physical_factor' => $element_data['height_factor'] ?? 0.3,
                    'font_size_physical_factor' => $element_data['font_size_factor'] ?? 0.1,
                    
                    'content' => $element_data['content'] ?? '',
                    'element_type' => $element_data['element_type'] ?? 'text',
                    'reference_measurement_type' => 'chest',
                    'reference_pixel_distance' => $reference_pixel_distance,
                    'template_view_id' => $element_data['template_view_id'] ?? null,
                    
                    'scale_x' => 1.0,
                    'scale_y' => 1.0, 
                    'rotation' => 0,
                    
                    'migration_source' => 'relative_factors',
                    'migrated_at' => current_time('mysql'),
                    'system_version' => 'linear_v1'
                );
            }
        }
        
        return $migrated_elements;
    }
}
