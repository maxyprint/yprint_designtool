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
    public static function render_reference_lines($template_id, $view_id, $order_size = 'l', $current_canvas_width = 800, $current_canvas_height = 600, $actual_image_width = null, $actual_image_height = null) {
        // 1. LADE ALLE BENÖTIGTEN DATEN
        $debug_info = array();
        $debug_info[] = "=== YPRINT REFERENZLINIEN-SYSTEM ===";
        $debug_info[] = "Template: {$template_id}, View: {$view_id}, Bestellgröße: {$order_size}";
        $debug_info[] = "Aktueller Canvas: {$current_canvas_width}x{$current_canvas_height}px";
        $debug_info[] = "";
        
        // Template-Referenzmessungen laden
        $template_measurements = get_post_meta($template_id, '_template_view_print_areas', true);
        $debug_info[] = "📊 GELADENE DATEN:";
        $debug_info[] = "_template_view_print_areas: " . (empty($template_measurements) ? 'LEER' : 'GEFUNDEN');
        if (!empty($template_measurements)) {
            $debug_info[] = "Verfügbare View-IDs: " . implode(', ', array_keys($template_measurements));
            if (isset($template_measurements[$view_id])) {
                $debug_info[] = "View {$view_id} gefunden: " . (empty($template_measurements[$view_id]['measurements']) ? 'KEINE MESSUNGEN' : count($template_measurements[$view_id]['measurements']) . ' Messungen');
            } else {
                $debug_info[] = "View {$view_id} NICHT gefunden!";
            }
        }
        
        if (empty($template_measurements[$view_id]['measurements'])) {
            $debug_info[] = "❌ FEHLER: Keine Referenzmessungen für View {$view_id} gefunden!";
            return self::output_debug_and_error($debug_info);
        }
        
        // Produktdimensionen laden 
        $product_dimensions = get_post_meta($template_id, '_template_product_dimensions', true);
        $debug_info[] = "_template_product_dimensions: " . (empty($product_dimensions) ? 'LEER' : 'GEFUNDEN');
        if (!empty($product_dimensions)) {
            $debug_info[] = "Verfügbare Größen: " . implode(', ', array_keys($product_dimensions));
            if (isset($product_dimensions[$order_size])) {
                $debug_info[] = "Größe {$order_size} gefunden: " . count($product_dimensions[$order_size]) . ' Messwerte';
            } else {
                $debug_info[] = "Größe {$order_size} NICHT gefunden!";
            }
        }
        
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
        // ✅ FIX: Normalisiere Größe zu Kleinbuchstaben
        $normalized_order_size = strtolower($order_size);
        $debug_info[] = "Größen-Normalisierung: '{$order_size}' → '{$normalized_order_size}'";
        
        if (!isset($product_dimensions[$normalized_order_size][$measurement_type])) {
            $debug_info[] = "❌ FEHLER: Größe '{$normalized_order_size}' oder Messung '{$measurement_type}' nicht in Produktdimensionen gefunden!";
            $debug_info[] = "Verfügbare Messungen für Größe '{$normalized_order_size}': " . (isset($product_dimensions[$normalized_order_size]) ? implode(', ', array_keys($product_dimensions[$normalized_order_size])) : 'KEINE');
            return self::output_debug_and_error($debug_info);
        }
        
        $order_size_physical = $product_dimensions[$normalized_order_size][$measurement_type];
        $template_size_physical = $product_dimensions[$template_shows_size][$measurement_type];
        
        $size_scale_factor = $order_size_physical / $template_size_physical;
        
        $debug_info[] = "🎯 GRÖSSENSKALIERUNG:";
        $debug_info[] = "Template Größe '{$template_shows_size}': {$template_size_physical}cm";
        $debug_info[] = "Bestellte Größe '{$normalized_order_size}': {$order_size_physical}cm";
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
        
        // ✅ SafeZone aus Template-Daten oder Standard-Werte
        $safe_zone = array(
            'left' => 49.625,
            'top' => 45.4,
            'width' => 218,
            'height' => 339
        );
        
        $debug_info[] = "🎯 Referenzlinien-Transformation:";
        $debug_info[] = "Template-Punkte: ({$start_point['x']},{$start_point['y']}) → ({$end_point['x']},{$end_point['y']})";
        $debug_info[] = "SafeZone: left={$safe_zone['left']}, top={$safe_zone['top']}, width={$safe_zone['width']}, height={$safe_zone['height']}";
        $debug_info[] = "Display-Canvas: {$current_canvas_width}x{$current_canvas_height}";
        
        // Template-Punkte sind SafeZone-relativ gespeichert - direkt zu Display transformieren
        $display_scale_x = $current_canvas_width / $safe_zone['width'];
        $display_scale_y = $current_canvas_height / $safe_zone['height'];
        
        $orig_x1 = $start_point['x'] * $display_scale_x;
        $orig_y1 = $start_point['y'] * $display_scale_y;
        $orig_x2 = $end_point['x'] * $display_scale_x;  
        $orig_y2 = $end_point['y'] * $display_scale_y;
        
        $debug_info[] = "Transformierte Display-Koordinaten:";
        $debug_info[] = "Point1: ({$orig_x1},{$orig_y1})";
        $debug_info[] = "Point2: ({$orig_x2},{$orig_y2})";
        
        // ✅ FIX: SafeZone-basierte Koordinaten-Transformation (bereits oben implementiert)
        $debug_info[] = "🎯 SAFE ZONE ANALYSE:";
        if ($safe_zone) {
            $debug_info[] = "SafeZone gefunden: left={$safe_zone['left']}, top={$safe_zone['top']}, width={$safe_zone['width']}, height={$safe_zone['height']}";
        } else {
            $debug_info[] = "❌ Keine SafeZone gefunden - verwende Fallback-Skalierung";
        }
        
        // ✅ AUTOMATISCHE BILD-ERKENNUNG: Verwende echte Bild-Dimensionen
        // Das System verwendet jetzt die echten Bild-Dimensionen für pixelgenaue Berechnung
        if ($actual_image_width && $actual_image_height) {
            $template_image_width = $actual_image_width;   // Echte Bild-Breite
            $template_image_height = $actual_image_height; // Echte Bild-Höhe
            $debug_info[] = "🎯 ECHTE BILD-DIMENSIONEN: {$template_image_width}x{$template_image_height}px";
        } else {
            // Fallback: Verwende Canvas-Dimensionen
            $template_image_width = $current_canvas_width;
            $template_image_height = $current_canvas_height;
            $debug_info[] = "⚠️ FALLBACK: Verwende Canvas-Dimensionen {$template_image_width}x{$template_image_height}px";
        }
        
        if ($safe_zone) {
            // ✅ PIXELGENAUE SKALIERUNG: Template-Koordinaten auf echte Bild-Dimensionen
            // Berechne Skalierung von Template-Basis auf echte Bild-Dimensionen
            $image_scale_x = $template_image_width / $original_canvas_width;
            $image_scale_y = $template_image_height / $original_canvas_height;
            
            $scaled_x1 = $orig_x1 * $image_scale_x;
            $scaled_y1 = $orig_y1 * $image_scale_y;
            $scaled_x2 = $orig_x2 * $image_scale_x;
            $scaled_y2 = $orig_y2 * $image_scale_y;
            
            $debug_info[] = "🎯 PIXELGENAUE Skalierung: Template ({$original_canvas_width}x{$original_canvas_height}) → Bild ({$template_image_width}x{$template_image_height})";
            $debug_info[] = "🎯 Bild-Skalierungsfaktoren: {$image_scale_x} x {$image_scale_y}";
            
            // ✅ FIX: Koordinaten auf sichtbaren Bereich begrenzen (aber mit Debug-Info)
            // Begrenze Koordinaten auf sichtbaren Canvas-Bereich
            $original_scaled_x1 = $scaled_x1;
            $original_scaled_y1 = $scaled_y1;
            $original_scaled_x2 = $scaled_x2;
            $original_scaled_y2 = $scaled_y2;
            
            $scaled_x1 = max(0, min($template_image_width, $scaled_x1));
            $scaled_y1 = max(0, min($template_image_height, $scaled_y1));
            $scaled_x2 = max(0, min($template_image_width, $scaled_x2));
            $scaled_y2 = max(0, min($template_image_height, $scaled_y2));
            
            $debug_info[] = "🔍 PIXELGENAUE Koordinaten-Debug:";
            $debug_info[] = "Original Template: ({$orig_x1},{$orig_y1}) → ({$orig_x2},{$orig_y2})";
            $debug_info[] = "Bild-Skalierungsfaktoren: {$image_scale_x} x {$image_scale_y}";
            $debug_info[] = "Skaliert (unclipped): ({$original_scaled_x1},{$original_scaled_y1}) → ({$original_scaled_x2},{$original_scaled_y2})";
            $debug_info[] = "Skaliert (clipped): ({$scaled_x1},{$scaled_y1}) → ({$scaled_x2},{$scaled_y2})";
            $debug_info[] = "Bild-Grenzen: 0,0 → {$template_image_width},{$template_image_height}";
            
            $debug_info[] = "Koordinaten nach Transformation: (" . round($scaled_x1,1) . "," . round($scaled_y1,1) . ") → (" . round($scaled_x2,1) . "," . round($scaled_y2,1) . ")";
            
            $debug_info[] = "SafeZone-Info: left={$safe_zone['left']}, top={$safe_zone['top']}, width={$safe_zone['width']}, height={$safe_zone['height']}";
        } else {
            // ✅ PIXELGENAUER FALLBACK: Verwende Bild-Skalierungsfaktoren
            $image_scale_x = $template_image_width / $original_canvas_width;
            $image_scale_y = $template_image_height / $original_canvas_height;
            
            $scaled_x1 = $orig_x1 * $image_scale_x;
            $scaled_y1 = $orig_y1 * $image_scale_y;
            $scaled_x2 = $orig_x2 * $image_scale_x;
            $scaled_y2 = $orig_y2 * $image_scale_y;
            
            $debug_info[] = "🎯 PIXELGENAUER Fallback: Bild-Skalierungsfaktoren verwendet";
            $debug_info[] = "🎯 Fallback-Skalierung: Template ({$original_canvas_width}x{$original_canvas_height}) → Bild ({$template_image_width}x{$template_image_height})";
        }
        
        // ✅ PIXELGENAUE Finale physische Distanz
        $image_scale_x = $template_image_width / $original_canvas_width;
        $final_pixel_distance = $template_pixel_distance * $image_scale_x; // Verwende Bild-Skalierungsfaktor
        $final_physical_distance = $order_size_physical;
        
        $debug_info[] = "📏 PIXELGENAUE FINALE REFERENZLINIE:";
        $debug_info[] = "Original Koordinaten: ({$orig_x1},{$orig_y1}) → ({$orig_x2},{$orig_y2})";
        $debug_info[] = "Echte Bild-Größe: {$template_image_width}x{$template_image_height}px";
        $debug_info[] = "Pixelgenau skalierte Koordinaten: (" . round($scaled_x1,1) . "," . round($scaled_y1,1) . ") → (" . round($scaled_x2,1) . "," . round($scaled_y2,1) . ")";
        $debug_info[] = "Pixelgenaue Pixel-Distanz: " . round($final_pixel_distance, 2) . "px";
        $debug_info[] = "Physische Distanz: {$final_physical_distance}cm";
        $debug_info[] = "Pixelgenauer Pixel-zu-cm Faktor: " . round($final_physical_distance / $final_pixel_distance, 6) . " cm/px";
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
        $debug_html = '<div style="margin-top: 10px; padding: 10px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; font-size: 11px;">
            <h4 style="margin: 0 0 5px 0; color: #856404;">🔍 Debug-Informationen:</h4>
            <pre style="white-space: pre-line; font-family: monospace; font-size: 10px; margin: 0; overflow-x: auto;">';
        $debug_html .= implode("\n", $debug_info);
        $debug_html .= '</pre></div>';
        
        return array(
            'html' => '<div style="color: red; padding: 10px; border: 1px solid red;">REFERENZLINIEN-FEHLER: Siehe Debug-Info</div>' . $debug_html,
            'debug' => $debug_info,
            'data' => null
        );
    }
}

/**
 * VERWENDUNG - Füge in deine Template-Rendering-Funktion ein:
 */
function yprint_render_template_with_reference_lines($template_id, $view_id, $order_size = 'l', $actual_image_width = null, $actual_image_height = null) {
    // Hole aktuelle Canvas-Dimensionen (angepasst an Viewport)
    $current_canvas_width = 800;  // Dynamisch aus Frontend ermitteln
    $current_canvas_height = 600; // Dynamisch aus Frontend ermitteln
    
    // Berechne Referenzlinien mit echten Bild-Dimensionen
    $reference_result = YPrint_Reference_Line_System::render_reference_lines(
        $template_id, 
        $view_id, 
        $order_size,
        $current_canvas_width,
        $current_canvas_height,
        $actual_image_width,    // Echte Bild-Breite
        $actual_image_height    // Echte Bild-Höhe
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
