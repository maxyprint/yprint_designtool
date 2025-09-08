<?php
/**
 * YPrint Dynamisches Referenzlinien-System
 * 
 * Berechnet und zeigt Referenzlinien für Template-Views basierend auf:
 * - Template-Basis-Dimensionen (154.003px = 62cm chest, 248.018px = 70cm height)
 * - Produktgrößen-Tabelle (S=47, M=50, L=53, XL=56 cm)
 * - WooCommerce Bestellgröße (dynamisch)
 * - Responsive Canvas-Anpassung
 */
class YPrint_Reference_Line_System {
    
    /**
     * Hauptfunktion: Berechne und zeige Referenzlinien für eine View
     */
    public static function render_reference_lines($template_id, $view_id, $order_size = 'l', $current_canvas_width = 800, $current_canvas_height = 600) {
        // 1. LADE ALLE BENÖTIGTEN DATEN
        $debug_info = array();
        $debug_info[] = "=== YPRINT REFERENZLINIEN-SYSTEM ===";
        $debug_info[] = "Template: {$template_id}, View: {$view_id}, Bestellgröße: {$order_size}";
        $debug_info[] = "Aktueller Canvas: {$current_canvas_width}x{$current_canvas_height}px";
        $debug_info[] = "";
        
        // Template-Referenzmessungen laden
        $template_measurements = get_post_meta($template_id, '_template_view_print_areas', true);
        if (empty($template_measurements[$view_id]['measurements'])) {
            $debug_info[] = "❌ FEHLER: Keine Referenzmessungen für View {$view_id} gefunden!";
            return self::output_debug_and_error($debug_info);
        }
        
        // Produktdimensionen laden 
        $product_dimensions = get_post_meta($template_id, '_template_product_dimensions', true);
        if (empty($product_dimensions)) {
            $debug_info[] = "❌ FEHLER: Keine Produktdimensionen gefunden!";
            return self::output_debug_and_error($debug_info);
        }
        
        $debug_info[] = "✅ Daten erfolgreich geladen";
        $debug_info[] = "";
        
        // 2. ANALYSIERE REFERENZMESSUNGEN
        $view_data = $template_measurements[$view_id];
        $original_canvas_width = $view_data['canvas_width'] ?? 800;
        $original_canvas_height = $view_data['canvas_height'] ?? 600;
        
        $debug_info[] = "📐 TEMPLATE-BASIS-DIMENSIONEN:";
        $debug_info[] = "Original Canvas: {$original_canvas_width}x{$original_canvas_height}px";
        
        $reference_measurement = null;
        $measurement_type = '';
        
        foreach ($view_data['measurements'] as $measurement) {
            if (!empty($measurement['pixel_distance']) && !empty($measurement['measurement_type'])) {
                $reference_measurement = $measurement;
                $measurement_type = $measurement['measurement_type'];
                break;
            }
        }
        
        if (!$reference_measurement) {
            $debug_info[] = "❌ FEHLER: Keine gültige Referenzmessung gefunden!";
            return self::output_debug_and_error($debug_info);
        }
        
        $template_pixel_distance = $reference_measurement['pixel_distance'];
        $debug_info[] = "Referenzmessung: {$measurement_type}";
        $debug_info[] = "Template Pixel-Distanz: {$template_pixel_distance}px";
        
        // 3. BESTIMME TEMPLATE-BASIS-GRÖSSE
        // Template zeigt Größe M (50cm chest) basierend auf den physischen Basis-Dimensionen
        $template_physical_width = get_post_meta($template_id, '_template_physical_width_cm', true) ?: 62;
        $template_shows_size = self::determine_template_size($template_physical_width, $product_dimensions, $measurement_type);
        
        $debug_info[] = "Template zeigt Größe: {$template_shows_size}";
        $debug_info[] = "Template physische Dimension: {$template_physical_width}cm";
        $debug_info[] = "";
        
        // 4. BERECHNE SKALIERUNGSFAKTOR FÜR BESTELLGRÖSSE
        if (!isset($product_dimensions[$order_size][$measurement_type])) {
            $debug_info[] = "❌ FEHLER: Größe '{$order_size}' oder Messung '{$measurement_type}' nicht in Produktdimensionen gefunden!";
            return self::output_debug_and_error($debug_info);
        }
        
        $order_size_physical = $product_dimensions[$order_size][$measurement_type];
        $template_size_physical = $product_dimensions[$template_shows_size][$measurement_type];
        
        $size_scale_factor = $order_size_physical / $template_size_physical;
        
        $debug_info[] = "🎯 GRÖSSENSKALIERUNG:";
        $debug_info[] = "Template Größe '{$template_shows_size}': {$template_size_physical}cm";
        $debug_info[] = "Bestellte Größe '{$order_size}': {$order_size_physical}cm";
        $debug_info[] = "Skalierungsfaktor: {$order_size_physical} ÷ {$template_size_physical} = " . round($size_scale_factor, 4);
        $debug_info[] = "";
        
        // 5. BERECHNE CANVAS-SKALIERUNG
        $canvas_scale_x = $current_canvas_width / $original_canvas_width;
        $canvas_scale_y = $current_canvas_height / $original_canvas_height;
        
        $debug_info[] = "📱 CANVAS-SKALIERUNG:";
        $debug_info[] = "X-Faktor: {$current_canvas_width} ÷ {$original_canvas_width} = " . round($canvas_scale_x, 4);
        $debug_info[] = "Y-Faktor: {$current_canvas_height} ÷ {$original_canvas_height} = " . round($canvas_scale_y, 4);
        $debug_info[] = "";
        
        // 6. BERECHNE FINALE REFERENZLINIE
        $start_point = $reference_measurement['points'][0];
        $end_point = $reference_measurement['points'][1];
        
        // Originale Koordinaten
        $orig_x1 = $start_point['x'];
        $orig_y1 = $start_point['y'];
        $orig_x2 = $end_point['x'];
        $orig_y2 = $end_point['y'];
        
        // Skalierte Koordinaten für aktuellen Canvas
        $scaled_x1 = $orig_x1 * $canvas_scale_x;
        $scaled_y1 = $orig_y1 * $canvas_scale_y;
        $scaled_x2 = $orig_x2 * $canvas_scale_x;
        $scaled_y2 = $orig_y2 * $canvas_scale_y;
        
        // Finale physische Distanz
        $final_pixel_distance = $template_pixel_distance * $canvas_scale_x;
        $final_physical_distance = $order_size_physical;
        
        $debug_info[] = "📏 FINALE REFERENZLINIE:";
        $debug_info[] = "Original Koordinaten: ({$orig_x1},{$orig_y1}) → ({$orig_x2},{$orig_y2})";
        $debug_info[] = "Skalierte Koordinaten: (" . round($scaled_x1,1) . "," . round($scaled_y1,1) . ") → (" . round($scaled_x2,1) . "," . round($scaled_y2,1) . ")";
        $debug_info[] = "Pixel-Distanz: " . round($final_pixel_distance, 2) . "px";
        $debug_info[] = "Physische Distanz: {$final_physical_distance}cm";
        $debug_info[] = "Pixel-zu-cm Faktor: " . round($final_physical_distance / $final_pixel_distance, 6) . " cm/px";
        $debug_info[] = "";
        
        // 7. ERSTELLE HTML-OUTPUT
        $html = '<div class="yprint-reference-lines-container">';
        $html .= '<svg class="yprint-reference-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 10;">';
        $html .= '<line x1="' . $scaled_x1 . '" y1="' . $scaled_y1 . '" x2="' . $scaled_x2 . '" y2="' . $scaled_y2 . '" ';
        $html .= 'stroke="#ff4444" stroke-width="2" stroke-dasharray="5,5" />';
        $html .= '<circle cx="' . $scaled_x1 . '" cy="' . $scaled_y1 . '" r="4" fill="#ff4444" />';
        $html .= '<circle cx="' . $scaled_x2 . '" cy="' . $scaled_y2 . '" r="4" fill="#ff4444" />';
        
        // Label mit Distanz-Info
        $label_x = ($scaled_x1 + $scaled_x2) / 2;
        $label_y = ($scaled_y1 + $scaled_y2) / 2 - 15;
        $html .= '<text x="' . $label_x . '" y="' . $label_y . '" fill="#ff4444" font-family="Arial" font-size="12" text-anchor="middle">';
        $html .= $final_physical_distance . 'cm (' . strtoupper($measurement_type) . ')';
        $html .= '</text>';
        $html .= '</svg>';
        $html .= '</div>';
        
        // 8. DEBUG-AUSGABE
        $debug_info[] = "🎨 DARSTELLUNG:";
        $debug_info[] = "Linie: Rot gestrichelt, 2px breit";
        $debug_info[] = "Punkte: Rote Kreise mit 4px Radius";
        $debug_info[] = "Label: '{$final_physical_distance}cm (" . strtoupper($measurement_type) . ")'";
        $debug_info[] = "SVG-Overlay: Absolut positioniert, 100% Größe";
        
        return array(
            'html' => $html,
            'debug' => $debug_info,
            'data' => array(
                'coordinates' => array($scaled_x1, $scaled_y1, $scaled_x2, $scaled_y2),
                'physical_distance' => $final_physical_distance,
                'pixel_distance' => $final_pixel_distance,
                'scale_factor' => $size_scale_factor,
                'measurement_type' => $measurement_type
            )
        );
    }
    
    /**
     * Bestimme welche Größe das Template zeigt (basierend auf physischen Basis-Dimensionen)
     */
    private static function determine_template_size($template_physical_width, $product_dimensions, $measurement_type) {
        foreach ($product_dimensions as $size => $measurements) {
            if (isset($measurements[$measurement_type]) && 
                abs($measurements[$measurement_type] - $template_physical_width) < 2) {
                return $size;
            }
        }
        return 'm'; // Fallback auf Größe M
    }
    
    /**
     * Ausgabe bei Fehlern
     */
    private static function output_debug_and_error($debug_info) {
        return array(
            'html' => '<div style="color: red; padding: 10px; border: 1px solid red;">REFERENZLINIEN-FEHLER: Siehe Debug-Info</div>',
            'debug' => $debug_info,
            'data' => null
        );
    }
}

/**
 * VERWENDUNG - Füge in deine Template-Rendering-Funktion ein:
 */
function yprint_render_template_with_reference_lines($template_id, $view_id, $order_size = 'l') {
    // Hole aktuelle Canvas-Dimensionen (angepasst an Viewport)
    $current_canvas_width = 800;  // Dynamisch aus Frontend ermitteln
    $current_canvas_height = 600; // Dynamisch aus Frontend ermitteln
    
    // Berechne Referenzlinien
    $reference_result = YPrint_Reference_Line_System::render_reference_lines(
        $template_id, 
        $view_id, 
        $order_size,
        $current_canvas_width,
        $current_canvas_height
    );
    
    // Template-Bild anzeigen
    echo '<div style="position: relative;">';
    echo '<img src="' . wp_get_attachment_url(3723) . '" style="width: 100%; height: auto;" />';
    
    // Referenzlinien-Overlay
    echo $reference_result['html'];
    
    echo '</div>';
    
    // Debug-Ausgabe (für Entwicklung)
    if (defined('WP_DEBUG') && WP_DEBUG) {
        echo '<div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-left: 4px solid #0073aa;">';
        echo '<h4>🔍 Debug-Informationen:</h4>';
        echo '<pre style="white-space: pre-line; font-family: monospace; font-size: 12px;">';
        echo implode("\n", $reference_result['debug']);
        echo '</pre>';
        echo '</div>';
    }
}

/**
 * AJAX-Handler für dynamische Größenänderung
 */
add_action('wp_ajax_yprint_update_reference_lines', 'yprint_ajax_update_reference_lines');
function yprint_ajax_update_reference_lines() {
    $template_id = intval($_POST['template_id']);
    $view_id = sanitize_text_field($_POST['view_id']);
    $order_size = sanitize_text_field($_POST['order_size']);
    $canvas_width = intval($_POST['canvas_width']);
    $canvas_height = intval($_POST['canvas_height']);
    
    $result = YPrint_Reference_Line_System::render_reference_lines(
        $template_id, $view_id, $order_size, $canvas_width, $canvas_height
    );
    
    wp_send_json_success($result);
}
