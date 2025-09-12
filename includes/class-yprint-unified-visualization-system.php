<?php
/**
 * YPrint Unified Visualization System - Einheitliches Visualisierungssystem
 * 
 * Dieses System löst die fundamentalen architektonischen Probleme der Visualisierung:
 * 1. Einheitliches Koordinatensystem für beide Ansichten
 * 2. Korrekte Skalierung basierend auf echten Produktdimensionen
 * 3. Gegenseitige Validierung zwischen Referenzmessung und Druckplatzierung
 * 4. Konsistente Einheitenumrechnung (mm, cm, px)
 */
class YPrint_Unified_Visualization_System {
    
    /**
     * Hauptfunktion: Erstelle einheitliche Visualisierung mit korrekter Skalierung
     */
    public static function create_unified_visualization($template_id, $template_image_url, $order_id) {
        // 1. LADE ALLE BENÖTIGTEN DATEN
        $data = self::load_all_visualization_data($template_id, $order_id);
        
        if (!$data['success']) {
            return self::create_error_visualization($data['error']);
        }
        
        // 2. ERSTELLE EINHEITLICHES KOORDINATENSYSTEM
        $unified_coordinates = self::create_unified_coordinate_system($data);
        
        // 3. VALIDIERE KONSISTENZ
        $validation = self::validate_consistency($unified_coordinates);
        
        // 4. ERSTELLE VISUALISIERUNG
        return self::render_unified_visualization($data, $unified_coordinates, $validation);
    }
    
    /**
     * Lade alle benötigten Daten für die Visualisierung
     */
    private static function load_all_visualization_data($template_id, $order_id) {
        $data = array(
            'success' => false,
            'template_id' => $template_id,
            'order_id' => $order_id
        );
        
        try {
            // Order-Daten
            $order = wc_get_order($order_id);
            if (!$order) {
                throw new Exception('Order nicht gefunden');
            }
            
            $order_size = 'M'; // Fallback
            foreach ($order->get_items() as $item) {
                $item_size = $item->get_meta('_yprint_size');
                if ($item_size) {
                    $order_size = $item_size;
                    break;
                }
            }
            $data['order_size'] = $order_size;
            
            // Template-Bild
            $data['template_image_url'] = self::get_template_image_url($template_id);
            if (!$data['template_image_url']) {
                throw new Exception('Template-Bild nicht gefunden');
            }
            
            // Template-Dimensionen
            $data['template_dimensions'] = self::get_template_dimensions($template_id);
            
            // Produktdimensionen
            $data['product_dimensions'] = self::get_product_dimensions($template_id);
            
            // Referenzmessungen
            $data['reference_measurements'] = self::get_reference_measurements($template_id);
            
            // Finale Druckkoordinaten
            $data['final_coordinates'] = self::get_final_coordinates($order_id);
            
            $data['success'] = true;
            
        } catch (Exception $e) {
            $data['error'] = $e->getMessage();
            error_log("YPrint Unified Visualization Error: " . $e->getMessage());
        }
        
        return $data;
    }
    
    /**
     * Erstelle einheitliches Koordinatensystem
     */
    private static function create_unified_coordinate_system($data) {
        $coordinates = array();
        
        // 1. BASIS-KOORDINATENSYSTEM: Template-Bild als Referenz
        $template_width_px = $data['template_dimensions']['width'] ?? 800;
        $template_height_px = $data['template_dimensions']['height'] ?? 600;
        
        // 2. PRODUKT-DIMENSIONEN IN MM (KORRIGIERT)
        $order_size = $data['order_size'];
        $all_product_dimensions = $data['product_dimensions'];
        
        // Stellen Sie sicher, dass die Dimensionen für die bestellte Größe existieren.
        // Wenn nicht, verwenden Sie einen Fallback (z.B. Größe 'M') oder die erste verfügbare Größe.
        if (isset($all_product_dimensions[$order_size])) {
            $size_specific_dimensions = $all_product_dimensions[$order_size];
            error_log("YPrint Unified: ✅ Verwende Dimensionen für Größe {$order_size}");
        } else {
            // Fallback-Logik: Versuche 'M' oder nimm die erste Größe im Array
            $size_specific_dimensions = $all_product_dimensions['m'] ?? reset($all_product_dimensions);
            if (!$size_specific_dimensions) {
                // Absoluter Notfall-Fallback, falls gar keine Dimensionen gespeichert sind.
                $size_specific_dimensions = ['chest' => 50, 'height_from_shoulder' => 68];
                error_log("YPrint Unified: ⚠️ Verwende Notfall-Fallback-Dimensionen");
            } else {
                error_log("YPrint Unified: ⚠️ Größe {$order_size} nicht gefunden, verwende Fallback");
            }
        }
        
        // Verwenden Sie die größenspezifischen Maße für die Berechnung.
        // Konvertieren Sie die in cm gespeicherten Werte in mm.
        $product_width_mm = ($size_specific_dimensions['chest'] ?? 50) * 10;
        $product_height_mm = ($size_specific_dimensions['height_from_shoulder'] ?? 68) * 10;
        
        error_log("YPrint Unified: 📏 Produktdimensionen für Größe {$order_size}:");
        error_log("  Chest: " . ($size_specific_dimensions['chest'] ?? 50) . "cm = {$product_width_mm}mm");
        error_log("  Height from Shoulder: " . ($size_specific_dimensions['height_from_shoulder'] ?? 68) . "cm = {$product_height_mm}mm");
        
        // 3. SKALIERUNGSFAKTOREN (KORRIGIERT)
        $scale_mm_to_px_x = $template_width_px / $product_width_mm;
        $scale_mm_to_px_y = $template_height_px / $product_height_mm;
        
        // Verwende den kleineren Faktor für konsistente Skalierung
        $scale_mm_to_px = min($scale_mm_to_px_x, $scale_mm_to_px_y);
        
        error_log("YPrint Unified: 🎯 Skalierungsberechnung:");
        error_log("  Template: {$template_width_px}×{$template_height_px}px");
        error_log("  Produkt: {$product_width_mm}×{$product_height_mm}mm");
        error_log("  Skalierung X: " . round($scale_mm_to_px_x, 6) . " px/mm");
        error_log("  Skalierung Y: " . round($scale_mm_to_px_y, 6) . " px/mm");
        error_log("  Finale Skalierung: " . round($scale_mm_to_px, 6) . " px/mm");
        
        $coordinates['template'] = array(
            'width_px' => $template_width_px,
            'height_px' => $template_height_px,
            'scale_mm_to_px' => $scale_mm_to_px
        );
        
        $coordinates['product'] = array(
            'width_mm' => $product_width_mm,
            'height_mm' => $product_height_mm,
            'order_size' => $order_size
        );
        
        // 4. REFERENZMESSUNGEN TRANSFORMIEREN (KORRIGIERT)
        if (!empty($data['reference_measurements'])) {
            $ref = $data['reference_measurements'];
            $ref_pixel_distance = $ref['pixel_distance'] ?? 0;
            $ref_physical_cm = $ref['physical_size_cm'] ?? 0;
            
            // Berechne Referenz-Skalierungsfaktor
            $ref_scale_cm_to_px = $ref_pixel_distance / $ref_physical_cm;
            
            error_log("YPrint Unified: 📏 Referenzmessungen:");
            error_log("  Pixel Distance: {$ref_pixel_distance}px");
            error_log("  Physical Size: {$ref_physical_cm}cm");
            error_log("  Referenz-Skalierung: " . round($ref_scale_cm_to_px, 6) . " px/cm");
            error_log("  Referenz-Skalierung (mm): " . round($ref_scale_cm_to_px * 10, 6) . " px/mm");
            
            $coordinates['reference'] = array(
                'pixel_distance' => $ref_pixel_distance,
                'physical_cm' => $ref_physical_cm,
                'scale_cm_to_px' => $ref_scale_cm_to_px,
                'points' => $ref['reference_points'] ?? array()
            );
        }
        
        // 5. FINALE DRUCKKOORDINATEN TRANSFORMIEREN (KORRIGIERT)
        if (!empty($data['final_coordinates'])) {
            $final = $data['final_coordinates'];
            
            // Transformiere mm-Koordinaten zu px-Koordinaten
            $final_x_px = ($final['x_mm'] ?? 0) * $scale_mm_to_px;
            $final_y_px = ($final['y_mm'] ?? 0) * $scale_mm_to_px;
            $final_width_px = ($final['width_mm'] ?? 0) * $scale_mm_to_px;
            $final_height_px = ($final['height_mm'] ?? 0) * $scale_mm_to_px;
            
            error_log("YPrint Unified: 🎯 Finale Druckkoordinaten:");
            error_log("  Original (mm): x=" . ($final['x_mm'] ?? 0) . ", y=" . ($final['y_mm'] ?? 0) . ", w=" . ($final['width_mm'] ?? 0) . ", h=" . ($final['height_mm'] ?? 0));
            error_log("  Transformiert (px): x=" . round($final_x_px, 2) . ", y=" . round($final_y_px, 2) . ", w=" . round($final_width_px, 2) . ", h=" . round($final_height_px, 2));
            error_log("  Skalierungsfaktor: " . round($scale_mm_to_px, 6) . " px/mm");
            
            $coordinates['final'] = array(
                'x_mm' => $final['x_mm'] ?? 0,
                'y_mm' => $final['y_mm'] ?? 0,
                'width_mm' => $final['width_mm'] ?? 0,
                'height_mm' => $final['height_mm'] ?? 0,
                'x_px' => $final_x_px,
                'y_px' => $final_y_px,
                'width_px' => $final_width_px,
                'height_px' => $final_height_px
            );
        }
        
        return $coordinates;
    }
    
    /**
     * Validiere Konsistenz zwischen Referenzmessung und Druckplatzierung
     */
    private static function validate_consistency($coordinates) {
        $validation = array(
            'is_consistent' => false,
            'issues' => array(),
            'scale_ratio' => 0,
            'reference_ratio' => 0
        );
        
        if (isset($coordinates['template']['scale_mm_to_px']) && isset($coordinates['reference']['scale_cm_to_px'])) {
            // Vergleiche Skalierungsfaktoren
            $template_scale = $coordinates['template']['scale_mm_to_px'];
            $reference_scale = $coordinates['reference']['scale_cm_to_px'] * 10; // cm zu mm
            
            $scale_ratio = $template_scale / $reference_scale;
            $validation['scale_ratio'] = $scale_ratio;
            $validation['reference_ratio'] = $reference_scale;
            
            // Konsistenz-Toleranz: ±20%
            if ($scale_ratio >= 0.8 && $scale_ratio <= 1.2) {
                $validation['is_consistent'] = true;
            } else {
                $validation['issues'][] = "Skalierungsfaktoren unterscheiden sich um " . round(($scale_ratio - 1) * 100, 1) . "%";
            }
        }
        
        // Prüfe auf realistische Werte
        if (isset($coordinates['final']['width_px']) && $coordinates['final']['width_px'] > 0) {
            $final_width_px = $coordinates['final']['width_px'];
            $template_width_px = $coordinates['template']['width_px'];
            
            if ($final_width_px > $template_width_px) {
                $validation['issues'][] = "Druckbreite ({$final_width_px}px) überschreitet Template-Breite ({$template_width_px}px)";
            }
        }
        
        return $validation;
    }
    
    /**
     * Rendere die einheitliche Visualisierung
     */
    private static function render_unified_visualization($data, $coordinates, $validation) {
        $html = '<div style="display: flex; gap: 20px; margin: 20px 0; background: #f8f9fa; padding: 20px; border-radius: 8px;">';
        
        // LINKS: Template-Referenzbild mit korrekter Referenzlinie
        $html .= self::render_template_reference($data, $coordinates);
        
        // RECHTS: Finale Druckplatzierung mit korrekter Skalierung
        $html .= self::render_final_placement($data, $coordinates);
        
        $html .= '</div>';
        
        // VALIDIERUNG
        $html .= self::render_validation_info($validation, $coordinates);
        
        return $html;
    }
    
    /**
     * Rendere Template-Referenzbild
     */
    private static function render_template_reference($data, $coordinates) {
        $html = '<div style="flex: 1; text-align: center;">';
        $html .= '<h4 style="margin: 0 0 10px 0; color: #dc3545;">📏 Template-Referenzbild</h4>';
        $html .= '<div style="position: relative; width: 400px; height: 500px; margin: 0 auto; border: 2px solid #ddd; border-radius: 8px; overflow: hidden;">';
        $html .= '<img src="' . esc_attr($data['template_image_url']) . '" style="width: 100%; height: 100%; object-fit: contain;" alt="Template Bild">';
        
        // Referenzlinie mit korrekter Skalierung
        if (isset($coordinates['reference']['points']) && count($coordinates['reference']['points']) >= 2) {
            $points = $coordinates['reference']['points'];
            $start = $points[0];
            $end = $points[1];
            
            // Skaliere auf 400px Breite
            $scale_factor = 400 / $coordinates['template']['width_px'];
            $start_x = $start['x'] * $scale_factor;
            $start_y = $start['y'] * $scale_factor;
            $end_x = $end['x'] * $scale_factor;
            $end_y = $end['y'] * $scale_factor;
            
            $html .= '<svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;">';
            $html .= '<line x1="' . $start_x . '" y1="' . $start_y . '" x2="' . $end_x . '" y2="' . $end_y . '" stroke="#dc3545" stroke-width="3" stroke-dasharray="5,5"/>';
            $html .= '<text x="' . (($start_x + $end_x) / 2) . '" y="' . (min($start_y, $end_y) - 10) . '" text-anchor="middle" fill="#dc3545" font-size="12" font-weight="bold">';
            $html .= $coordinates['reference']['physical_cm'] . 'cm';
            $html .= '</text>';
            $html .= '</svg>';
        }
        
        $html .= '</div>';
        $html .= '<p style="margin: 10px 0 0 0; font-size: 12px; color: #6c757d;">';
        $html .= '<strong>Größe:</strong> ' . esc_html($coordinates['product']['order_size']) . ' | ';
        $html .= '<strong>Referenz:</strong> ' . $coordinates['reference']['physical_cm'] . 'cm';
        $html .= '</p>';
        $html .= '</div>';
        
        return $html;
    }
    
    /**
     * Rendere finale Druckplatzierung
     */
    private static function render_final_placement($data, $coordinates) {
        $html = '<div style="flex: 1; text-align: center;">';
        $html .= '<h4 style="margin: 0 0 10px 0; color: #28a745;">🎯 Finale Druckplatzierung</h4>';
        $html .= '<div style="position: relative; width: 400px; height: 500px; margin: 0 auto; border: 2px solid #ddd; border-radius: 8px; overflow: hidden; background: #f8f9fa;">';
        
        // Produkt-Outline
        $product_width_px = $coordinates['product']['width_mm'] * $coordinates['template']['scale_mm_to_px'];
        $product_height_px = $coordinates['product']['height_mm'] * $coordinates['template']['scale_mm_to_px'];
        
        // Skaliere auf 400px Breite
        $scale_factor = 400 / $coordinates['template']['width_px'];
        $scaled_product_width = $product_width_px * $scale_factor;
        $scaled_product_height = $product_height_px * $scale_factor;
        
        // Zentriere das Produkt
        $product_x = (400 - $scaled_product_width) / 2;
        $product_y = (500 - $scaled_product_height) / 2;
        
        $html .= '<rect x="' . $product_x . '" y="' . $product_y . '" width="' . $scaled_product_width . '" height="' . $scaled_product_height . '" fill="none" stroke="#6c757d" stroke-width="2" stroke-dasharray="3,3"/>';
        
        // Druckbereich
        if (isset($coordinates['final'])) {
            $final_x = $coordinates['final']['x_px'] * $scale_factor;
            $final_y = $coordinates['final']['y_px'] * $scale_factor;
            $final_width = $coordinates['final']['width_px'] * $scale_factor;
            $final_height = $coordinates['final']['height_px'] * $scale_factor;
            
            $html .= '<rect x="' . $final_x . '" y="' . $final_y . '" width="' . $final_width . '" height="' . $final_height . '" fill="rgba(40, 167, 69, 0.3)" stroke="#28a745" stroke-width="2"/>';
            $html .= '<text x="' . ($final_x + $final_width / 2) . '" y="' . ($final_y + $final_height / 2) . '" text-anchor="middle" fill="#28a745" font-size="12" font-weight="bold">';
            $html .= $coordinates['final']['width_mm'] . '×' . $coordinates['final']['height_mm'] . 'mm';
            $html .= '</text>';
        }
        
        $html .= '</div>';
        $html .= '<p style="margin: 10px 0 0 0; font-size: 12px; color: #6c757d;">';
        $html .= '<strong>Produkt:</strong> ' . $coordinates['product']['width_mm'] . '×' . $coordinates['product']['height_mm'] . 'mm | ';
        $html .= '<strong>Druck:</strong> ' . $coordinates['final']['width_mm'] . '×' . $coordinates['final']['height_mm'] . 'mm';
        $html .= '</p>';
        $html .= '</div>';
        
        return $html;
    }
    
    /**
     * Rendere Validierungsinformationen
     */
    private static function render_validation_info($validation, $coordinates) {
        $html = '<div style="margin: 20px 0; padding: 15px; border-radius: 8px; ';
        $html .= $validation['is_consistent'] ? 'background: #d4edda; border-left: 4px solid #28a745;' : 'background: #f8d7da; border-left: 4px solid #dc3545;';
        $html .= '">';
        
        $html .= '<h4 style="margin: 0 0 10px 0; color: ' . ($validation['is_consistent'] ? '#155724' : '#721c24') . ';">';
        $html .= $validation['is_consistent'] ? '✅ Konsistente Visualisierung' : '⚠️ Inkonsistente Visualisierung';
        $html .= '</h4>';
        
        if (!empty($validation['issues'])) {
            $html .= '<ul style="margin: 0; padding-left: 20px;">';
            foreach ($validation['issues'] as $issue) {
                $html .= '<li style="color: #721c24; margin: 5px 0;">' . esc_html($issue) . '</li>';
            }
            $html .= '</ul>';
        }
        
        $html .= '<div style="margin: 10px 0; font-size: 12px; color: #6c757d;">';
        $html .= '<strong>Skalierungsverhältnis:</strong> ' . round($validation['scale_ratio'], 3) . ' | ';
        $html .= '<strong>Referenz-Skalierung:</strong> ' . round($validation['reference_ratio'], 3) . ' px/mm';
        $html .= '</div>';
        
        $html .= '</div>';
        
        return $html;
    }
    
    /**
     * Hilfsfunktionen für Datenladen
     */
    private static function get_template_image_url($template_id) {
        // Versuche verschiedene Meta-Keys
        $possible_keys = array('_template_variations', '_template_image_path', '_template_image_id');
        
        foreach ($possible_keys as $key) {
            $data = get_post_meta($template_id, $key, true);
            if (!empty($data)) {
                if ($key === '_template_variations' && is_array($data)) {
                    foreach ($data as $variation) {
                        if (isset($variation['views']) && is_array($variation['views'])) {
                            foreach ($variation['views'] as $view) {
                                if (isset($view['image']) && is_numeric($view['image'])) {
                                    $url = wp_get_attachment_url($view['image']);
                                    if ($url) return $url;
                                }
                            }
                        }
                    }
                } elseif ($key === '_template_image_path' && is_string($data)) {
                    return plugin_dir_url(__FILE__) . 'public/img/' . $data;
                } elseif ($key === '_template_image_id' && is_numeric($data)) {
                    $url = wp_get_attachment_url($data);
                    if ($url) return $url;
                }
            }
        }
        
        return null;
    }
    
    private static function get_template_dimensions($template_id) {
        $view_print_areas = get_post_meta($template_id, '_template_view_print_areas', true);
        if (!empty($view_print_areas)) {
            foreach ($view_print_areas as $view_data) {
                if (isset($view_data['canvas_width']) && isset($view_data['canvas_height'])) {
                    return array(
                        'width' => $view_data['canvas_width'],
                        'height' => $view_data['canvas_height']
                    );
                }
            }
        }
        
        return array('width' => 800, 'height' => 600); // Fallback
    }
    
    private static function get_product_dimensions($template_id) {
        $product_dimensions = get_post_meta($template_id, '_template_product_dimensions', true);
        if (empty($product_dimensions)) {
            // Fallback-Dimensionen
            return array(
                's' => array('chest' => 47, 'height_from_shoulder' => 60),
                'm' => array('chest' => 50, 'height_from_shoulder' => 64),
                'l' => array('chest' => 53, 'height_from_shoulder' => 68),
                'xl' => array('chest' => 56, 'height_from_shoulder' => 72)
            );
        }
        
        return $product_dimensions;
    }
    
    private static function get_reference_measurements($template_id) {
        $view_print_areas = get_post_meta($template_id, '_template_view_print_areas', true);
        if (!empty($view_print_areas)) {
            foreach ($view_print_areas as $view_data) {
                if (isset($view_data['measurements']['reference_measurement'])) {
                    return $view_data['measurements']['reference_measurement'];
                }
            }
        }
        
        return null;
    }
    
    private static function get_final_coordinates($order_id) {
        // Versuche verschiedene Quellen
        $workflow_data = get_post_meta($order_id, '_yprint_workflow_data', true);
        if (!empty($workflow_data) && isset($workflow_data['step6']['final_coordinates'])) {
            return $workflow_data['step6']['final_coordinates'];
        }
        
        $final_coordinates = get_post_meta($order_id, '_yprint_final_coordinates', true);
        if (!empty($final_coordinates)) {
            return $final_coordinates;
        }
        
        return null;
    }
    
    private static function create_error_visualization($error) {
        return '<div style="padding: 20px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; color: #721c24;">';
        $html .= '<h4>❌ Visualisierungsfehler</h4>';
        $html .= '<p>' . esc_html($error) . '</p>';
        $html .= '</div>';
    }
}
?>
