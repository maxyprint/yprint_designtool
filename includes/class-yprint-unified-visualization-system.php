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
        try {
            error_log("YPrint Unified: 🚀 Starte einheitliche Visualisierung für Template {$template_id}, Order {$order_id}");
            
            // 1. LADE ALLE BENÖTIGTEN DATEN
            $data = self::load_all_visualization_data($template_id, $order_id);
            
            if (!$data['success']) {
                error_log("YPrint Unified: ❌ Fehler beim Laden der Daten: " . $data['error']);
                return self::create_error_visualization($data['error']);
            }
            
            error_log("YPrint Unified: ✅ Daten erfolgreich geladen");
            
            // 2. ERSTELLE EINHEITLICHES KOORDINATENSYSTEM
            $unified_coordinates = self::create_unified_coordinate_system($data);
            
            if (empty($unified_coordinates)) {
                error_log("YPrint Unified: ❌ Fehler beim Erstellen des Koordinatensystems");
                return self::create_error_visualization('Fehler beim Erstellen des Koordinatensystems');
            }
            
            error_log("YPrint Unified: ✅ Koordinatensystem erfolgreich erstellt");
            
            // 3. VALIDIERE KONSISTENZ
            $validation = self::validate_consistency($unified_coordinates);
            
            error_log("YPrint Unified: ✅ Konsistenz validiert: " . ($validation['is_consistent'] ? 'KONSISTENT' : 'INKONSISTENT'));
            
            // 4. ERSTELLE VISUALISIERUNG
            $result = self::render_unified_visualization($data, $unified_coordinates, $validation);
            
            error_log("YPrint Unified: ✅ Visualisierung erfolgreich erstellt");
            return $result;
            
        } catch (Exception $e) {
            error_log("YPrint Unified: ❌ FATALER FEHLER: " . $e->getMessage());
            error_log("YPrint Unified: ❌ Stack Trace: " . $e->getTraceAsString());
            return self::create_error_visualization('Fataler Fehler: ' . $e->getMessage());
        } catch (Error $e) {
            error_log("YPrint Unified: ❌ PHP-FEHLER: " . $e->getMessage());
            error_log("YPrint Unified: ❌ Stack Trace: " . $e->getTraceAsString());
            return self::create_error_visualization('PHP-Fehler: ' . $e->getMessage());
        }
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
            error_log("YPrint Unified: 📊 Lade Visualisierungsdaten für Template {$template_id}, Order {$order_id}");
            
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
            error_log("YPrint Unified: ✅ Order-Größe: {$order_size}");
            
            // Template-Bild
            $data['template_image_url'] = self::get_template_image_url($template_id);
            if (!$data['template_image_url']) {
                throw new Exception('Template-Bild nicht gefunden');
            }
            error_log("YPrint Unified: ✅ Template-Bild gefunden");
            
            // Template-Dimensionen
            $data['template_dimensions'] = self::get_template_dimensions($template_id);
            error_log("YPrint Unified: ✅ Template-Dimensionen geladen");
            
            // Produktdimensionen
            $data['product_dimensions'] = self::get_product_dimensions($template_id);
            error_log("YPrint Unified: ✅ Produktdimensionen geladen");
            
            // Referenzmessungen
            $data['reference_measurements'] = self::get_reference_measurements($template_id);
            if ($data['reference_measurements']) {
                error_log("YPrint Unified: ✅ Referenzmessungen gefunden");
            } else {
                error_log("YPrint Unified: ⚠️ Keine Referenzmessungen gefunden");
            }
            
            // Finale Druckkoordinaten
            $data['final_coordinates'] = self::get_final_coordinates($order_id);
            if ($data['final_coordinates']) {
                error_log("YPrint Unified: ✅ Finale Druckkoordinaten gefunden");
            } else {
                error_log("YPrint Unified: ⚠️ Keine finalen Druckkoordinaten gefunden");
            }
            
            $data['success'] = true;
            error_log("YPrint Unified: ✅ Alle Visualisierungsdaten erfolgreich geladen");
            
        } catch (Exception $e) {
            $data['error'] = $e->getMessage();
            error_log("YPrint Unified: ❌ Exception beim Laden der Daten: " . $e->getMessage());
            error_log("YPrint Unified: ❌ Stack Trace: " . $e->getTraceAsString());
        } catch (Error $e) {
            $data['error'] = 'PHP-Fehler: ' . $e->getMessage();
            error_log("YPrint Unified: ❌ PHP-Fehler beim Laden der Daten: " . $e->getMessage());
            error_log("YPrint Unified: ❌ Stack Trace: " . $e->getTraceAsString());
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
            $ref_physical_cm = $ref['physical_size_cm'] ?? $ref['real_distance_cm'] ?? 0;
            
            // Berechne Referenz-Skalierungsfaktor
            if ($ref_physical_cm > 0) {
                $ref_scale_cm_to_px = $ref_pixel_distance / $ref_physical_cm;
            } else {
                $ref_scale_cm_to_px = 0;
                error_log("YPrint Unified: ⚠️ Referenz-Physical-Size ist 0, verwende Fallback");
            }
            
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
        } else {
            // Fallback für fehlende Referenzmessung
            error_log("YPrint Unified: ⚠️ Keine Referenzmessung gefunden, verwende Fallback");
            $coordinates['reference'] = array(
                'pixel_distance' => 200, // Standard-Pixel-Distanz
                'physical_cm' => 50,     // Standard-Physical-Size (Größe M)
                'scale_cm_to_px' => 4,   // Standard-Skalierung (200px / 50cm)
                'points' => array(
                    array('x' => 200, 'y' => 300),
                    array('x' => 400, 'y' => 300)
                )
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
        } else {
            // Fallback für fehlende finale Koordinaten
            error_log("YPrint Unified: ⚠️ Keine finalen Druckkoordinaten gefunden, verwende Fallback");
            $coordinates['final'] = array(
                'x_mm' => 50,   // Standard X-Position
                'y_mm' => 50,   // Standard Y-Position
                'width_mm' => 200,  // Standard-Breite
                'height_mm' => 250, // Standard-Höhe
                'x_px' => 50 * $scale_mm_to_px,
                'y_px' => 50 * $scale_mm_to_px,
                'width_px' => 200 * $scale_mm_to_px,
                'height_px' => 250 * $scale_mm_to_px
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
        error_log("YPrint Unified: 🔍 Suche Referenzmessungen für Template {$template_id}");
        
        $view_print_areas = get_post_meta($template_id, '_template_view_print_areas', true);
        
        if (empty($view_print_areas) || !is_array($view_print_areas)) {
            error_log("YPrint Unified: ❌ Keine _template_view_print_areas gefunden");
            return null;
        }
        
        error_log("YPrint Unified: 📊 Gefundene View-IDs: " . implode(', ', array_keys($view_print_areas)));
        
        // ✅ NEU: Detaillierte Analyse der Datenstruktur
        error_log("YPrint Unified: 🔍 Detaillierte Datenstruktur-Analyse:");
        foreach ($view_print_areas as $view_id => $view_data) {
            error_log("YPrint Unified: 📋 View {$view_id}:");
            error_log("  - Datentyp: " . gettype($view_data));
            if (is_array($view_data)) {
                error_log("  - Array-Keys: " . implode(', ', array_keys($view_data)));
                if (isset($view_data['measurements'])) {
                    error_log("  - Measurements-Datentyp: " . gettype($view_data['measurements']));
                    if (is_array($view_data['measurements'])) {
                        error_log("  - Measurements-Keys: " . implode(', ', array_keys($view_data['measurements'])));
                        foreach ($view_data['measurements'] as $measurement_key => $measurement) {
                            error_log("  - Measurement {$measurement_key}: " . gettype($measurement));
                            if (is_array($measurement)) {
                                error_log("    - Keys: " . implode(', ', array_keys($measurement)));
                            }
                        }
                    }
                }
            }
        }
        
        // Durchsuche alle Views nach Referenzmessungen
        foreach ($view_print_areas as $view_id => $view_data) {
            error_log("YPrint Unified: 🔍 Prüfe View {$view_id}");
            
            // ✅ SICHERHEIT: Prüfe ob $view_data ein Array ist
            if (!is_array($view_data)) {
                error_log("YPrint Unified: ⚠️ View {$view_id} ist kein Array: " . gettype($view_data));
                continue;
            }
            
            // ✅ SICHERHEIT: Prüfe ob measurements existiert und ein Array ist
            if (!isset($view_data['measurements']) || !is_array($view_data['measurements'])) {
                error_log("YPrint Unified: ⚠️ View {$view_id} hat keine measurements oder ist kein Array");
                continue;
            }
            
            error_log("YPrint Unified: 📊 View {$view_id} hat " . count($view_data['measurements']) . " measurements");
            
            // Methode 1: Suche nach 'reference_measurement' Key
            if (isset($view_data['measurements']['reference_measurement'])) {
                $ref_measurement = $view_data['measurements']['reference_measurement'];
                // ✅ SICHERHEIT: Prüfe ob reference_measurement ein Array ist
                if (!is_array($ref_measurement)) {
                    error_log("YPrint Unified: ⚠️ reference_measurement in View {$view_id} ist kein Array: " . gettype($ref_measurement));
                    continue;
                }
                error_log("YPrint Unified: ✅ Referenzmessung gefunden in View {$view_id} (reference_measurement key)");
                error_log("  Type: " . ($ref_measurement['measurement_type'] ?? 'unknown'));
                error_log("  Pixel Distance: " . ($ref_measurement['pixel_distance'] ?? 'unknown'));
                error_log("  Physical Size: " . ($ref_measurement['physical_size_cm'] ?? 'unknown') . " cm");
                return $ref_measurement;
            }
            
            // Methode 2: Suche nach Messungen mit 'is_reference' = true
            foreach ($view_data['measurements'] as $measurement_key => $measurement) {
                // ✅ SICHERHEIT: Prüfe ob measurement ein Array ist
                if (!is_array($measurement)) {
                    error_log("YPrint Unified: ⚠️ Measurement {$measurement_key} in View {$view_id} ist kein Array: " . gettype($measurement));
                    continue;
                }
                
                if (isset($measurement['is_reference']) && $measurement['is_reference'] === true) {
                    error_log("YPrint Unified: ✅ Referenzmessung gefunden in View {$view_id} (is_reference = true)");
                    error_log("  Type: " . ($measurement['measurement_type'] ?? 'unknown'));
                    error_log("  Pixel Distance: " . ($measurement['pixel_distance'] ?? 'unknown'));
                    error_log("  Physical Size: " . ($measurement['physical_size_cm'] ?? 'unknown') . " cm");
                    return $measurement;
                }
            }
            
            // Methode 3: Suche nach Messungen mit 'type' = 'chest' oder 'height_from_shoulder'
            foreach ($view_data['measurements'] as $measurement_key => $measurement) {
                // ✅ SICHERHEIT: Prüfe ob measurement ein Array ist
                if (!is_array($measurement)) {
                    error_log("YPrint Unified: ⚠️ Measurement {$measurement_key} in View {$view_id} ist kein Array: " . gettype($measurement));
                    continue;
                }
                
                if (isset($measurement['type']) && in_array($measurement['type'], ['chest', 'height_from_shoulder', 'chest_width'])) {
                    error_log("YPrint Unified: ✅ Referenzmessung gefunden in View {$view_id} (type: " . $measurement['type'] . ")");
                    error_log("  Type: " . ($measurement['type'] ?? 'unknown'));
                    error_log("  Pixel Distance: " . ($measurement['pixel_distance'] ?? 'unknown'));
                    error_log("  Physical Size: " . ($measurement['physical_size_cm'] ?? $measurement['real_distance_cm'] ?? 'unknown') . " cm");
                    return $measurement;
                }
            }
            
            // ✅ NEU: Methode 4: Suche nach ANY Messung mit pixel_distance und physical_size_cm
            foreach ($view_data['measurements'] as $measurement_key => $measurement) {
                // ✅ SICHERHEIT: Prüfe ob measurement ein Array ist
                if (!is_array($measurement)) {
                    continue;
                }
                
                // Prüfe ob es eine gültige Messung mit den notwendigen Daten ist
                if (isset($measurement['pixel_distance']) && isset($measurement['physical_size_cm'])) {
                    error_log("YPrint Unified: ✅ Referenzmessung gefunden in View {$view_id} (any measurement with pixel_distance and physical_size_cm)");
                    error_log("  Type: " . ($measurement['type'] ?? $measurement['measurement_type'] ?? 'unknown'));
                    error_log("  Pixel Distance: " . ($measurement['pixel_distance'] ?? 'unknown'));
                    error_log("  Physical Size: " . ($measurement['physical_size_cm'] ?? 'unknown') . " cm");
                    return $measurement;
                }
                
                // Alternative: Prüfe auf real_distance_cm
                if (isset($measurement['pixel_distance']) && isset($measurement['real_distance_cm'])) {
                    error_log("YPrint Unified: ✅ Referenzmessung gefunden in View {$view_id} (any measurement with pixel_distance and real_distance_cm)");
                    error_log("  Type: " . ($measurement['type'] ?? $measurement['measurement_type'] ?? 'unknown'));
                    error_log("  Pixel Distance: " . ($measurement['pixel_distance'] ?? 'unknown'));
                    error_log("  Physical Size: " . ($measurement['real_distance_cm'] ?? 'unknown') . " cm");
                    return $measurement;
                }
            }
        }
        
        error_log("YPrint Unified: ❌ Keine Referenzmessung in allen Views gefunden");
        return null;
    }
    
    private static function get_final_coordinates($order_id) {
        error_log("YPrint Unified: 🔍 Suche finale Druckkoordinaten für Order {$order_id}");
        
        // Methode 1: Workflow-Daten (Schritt 6)
        $workflow_data = get_post_meta($order_id, '_yprint_workflow_data', true);
        if (!empty($workflow_data)) {
            error_log("YPrint Unified: 📊 Workflow-Daten gefunden");
            
            // Prüfe Schritt 6
            if (isset($workflow_data['step6']['final_coordinates'])) {
                $coords = $workflow_data['step6']['final_coordinates'];
                error_log("YPrint Unified: ✅ Finale Koordinaten aus Schritt 6 gefunden");
                error_log("  X: " . ($coords['x_mm'] ?? 'unknown') . " mm");
                error_log("  Y: " . ($coords['y_mm'] ?? 'unknown') . " mm");
                error_log("  Width: " . ($coords['width_mm'] ?? 'unknown') . " mm");
                error_log("  Height: " . ($coords['height_mm'] ?? 'unknown') . " mm");
                return $coords;
            }
            
            // Prüfe Schritt 5 als Fallback
            if (isset($workflow_data['step5']['output']['final_coordinates'])) {
                $coords = $workflow_data['step5']['output']['final_coordinates'];
                error_log("YPrint Unified: ✅ Finale Koordinaten aus Schritt 5 gefunden");
                error_log("  X: " . ($coords['x_mm'] ?? 'unknown') . " mm");
                error_log("  Y: " . ($coords['y_mm'] ?? 'unknown') . " mm");
                error_log("  Width: " . ($coords['width_mm'] ?? 'unknown') . " mm");
                error_log("  Height: " . ($coords['height_mm'] ?? 'unknown') . " mm");
                return $coords;
            }
        }
        
        // Methode 2: Direkte Meta-Felder
        $final_coordinates = get_post_meta($order_id, '_yprint_final_coordinates', true);
        if (!empty($final_coordinates)) {
            error_log("YPrint Unified: ✅ Finale Koordinaten aus _yprint_final_coordinates gefunden");
            error_log("  X: " . ($final_coordinates['x_mm'] ?? 'unknown') . " mm");
            error_log("  Y: " . ($final_coordinates['y_mm'] ?? 'unknown') . " mm");
            error_log("  Width: " . ($final_coordinates['width_mm'] ?? 'unknown') . " mm");
            error_log("  Height: " . ($final_coordinates['height_mm'] ?? 'unknown') . " mm");
            return $final_coordinates;
        }
        
        // Methode 3: Order Items
        $order = wc_get_order($order_id);
        if ($order) {
            foreach ($order->get_items() as $item) {
                $item_coords = $item->get_meta('_yprint_final_coordinates');
                if (!empty($item_coords)) {
                    error_log("YPrint Unified: ✅ Finale Koordinaten aus Order Item gefunden");
                    return $item_coords;
                }
            }
        }
        
        error_log("YPrint Unified: ❌ Keine finalen Druckkoordinaten gefunden");
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
