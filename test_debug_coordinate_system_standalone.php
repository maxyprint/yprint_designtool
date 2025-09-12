<?php
/**
 * 🔧 DEBUG-ENHANCED Koordinaten-Transformation Test (Standalone)
 * 
 * Diese Datei implementiert die vollständig instrumentierte Debug-Version
 * der Koordinaten-Transformation mit detailliertem Logging und visuellen Debug-Overlays.
 * Läuft ohne WordPress-Abhängigkeiten.
 */

echo "🔧 DEBUG-ENHANCED KOORDINATEN-TRANSFORMATION TEST (STANDALONE)\n";
echo "===============================================================\n\n";

// Simulierte Test-Daten (basierend auf Order #5371)
$real_coordinates = array(
    array(
        'x_mm' => 50.0,
        'y_mm' => 100.0,
        'width_mm' => 200.0,
        'height_mm' => 150.0,
        'x_px' => 80,
        'y_px' => 88,
        'url' => 'https://example.com/design1.png'
    ),
    array(
        'x_mm' => 250.0,
        'y_mm' => 200.0,
        'width_mm' => 150.0,
        'height_mm' => 100.0,
        'x_px' => 400,
        'y_px' => 176,
        'url' => 'https://example.com/design2.png'
    )
);

$template_image_url = 'https://example.com/template.jpg';

echo "📊 TEST-DATEN:\n";
echo "  Real Coordinates Count: " . count($real_coordinates) . "\n";
echo "  Template Image URL: " . ($template_image_url ? 'SIMULIERT' : 'FEHLT') . "\n\n";

// Simuliere Koordinaten-Daten
$coordinates = array(
    'template' => array(
        'width_px' => 800,
        'height_px' => 600
    ),
    'product' => array(
        'width_mm' => 500,  // 50cm in mm
        'height_mm' => 680, // 68cm in mm
        'order_size' => 'M'
    ),
    'reference' => array(
        'points' => array(
            array('x' => 136, 'y' => 6),
            array('x' => 135, 'y' => 286)
        ),
        'physical_cm' => 68
    )
);

echo "🎯 KOORDINATEN-SIMULATION:\n";
echo "  Template: {$coordinates['template']['width_px']}x{$coordinates['template']['height_px']}px\n";
echo "  Produkt: {$coordinates['product']['width_mm']}x{$coordinates['product']['height_mm']}mm\n";
echo "  Referenz: ({$coordinates['reference']['points'][0]['x']},{$coordinates['reference']['points'][0]['y']}) → ({$coordinates['reference']['points'][1]['x']},{$coordinates['reference']['points'][1]['y']})\n\n";

/**
 * 🔧 DEBUG-ENHANCED: Vollständig instrumentierte Koordinaten-Transformation
 */
function create_debug_coordinate_transformer($data, $coordinates, $real_coordinates) {
    // Debug-Log-Struktur
    $debug = array(
        'input_data' => array(),
        'calculations' => array(),
        'transformations' => array(),
        'final_values' => array()
    );
    
    // SCHRITT 1: Input-Daten sammeln
    $editor_canvas_width = 656;  // Default
    $editor_canvas_height = 420;
    $template_width = $coordinates['template']['width_px'];
    $template_height = $coordinates['template']['height_px'];
    $container_width = 400;
    $container_height = 500;
    $product_width_mm = $coordinates['product']['width_mm'];
    $product_height_mm = $coordinates['product']['height_mm'];
    
    $debug['input_data'] = array(
        'editor_canvas' => "{$editor_canvas_width}x{$editor_canvas_height}px",
        'template_size' => "{$template_width}x{$template_height}px", 
        'container_size' => "{$container_width}x{$container_height}px",
        'product_size' => "{$product_width_mm}x{$product_height_mm}mm",
        'reference_points' => $coordinates['reference']['points'] ?? 'FEHLT',
        'real_coordinates_count' => is_array($real_coordinates) ? count($real_coordinates) : 0
    );
    
    // SCHRITT 2: Template-Container-Skalierung
    $scale_x = $container_width / $template_width;
    $scale_y = $container_height / $template_height;
    $template_scale = min($scale_x, $scale_y);
    $scaled_template_width = $template_width * $template_scale;
    $scaled_template_height = $template_height * $template_scale;
    $template_offset_x = ($container_width - $scaled_template_width) / 2;
    $template_offset_y = ($container_height - $scaled_template_height) / 2;
    
    $debug['calculations']['template_scaling'] = array(
        'scale_x' => $scale_x,
        'scale_y' => $scale_y,
        'chosen_scale' => $template_scale,
        'scaled_template' => "{$scaled_template_width}x{$scaled_template_height}px",
        'offsets' => "x={$template_offset_x}px, y={$template_offset_y}px"
    );
    
    // SCHRITT 3: Referenzlinie-Transformation (falls vorhanden)
    if (isset($coordinates['reference']['points']) && count($coordinates['reference']['points']) >= 2) {
        $ref_points = $coordinates['reference']['points'];
        $ref_start_template_x = $ref_points[0]['x'];
        $ref_start_template_y = $ref_points[0]['y'];
        $ref_end_template_x = $ref_points[1]['x'];
        $ref_end_template_y = $ref_points[1]['y'];
        
        // Template → Container
        $ref_start_container_x = $template_offset_x + ($ref_start_template_x * $template_scale);
        $ref_start_container_y = $template_offset_y + ($ref_start_template_y * $template_scale);
        $ref_end_container_x = $template_offset_x + ($ref_end_template_x * $template_scale);
        $ref_end_container_y = $template_offset_y + ($ref_end_template_y * $template_scale);
        
        $ref_length_template = sqrt(pow($ref_end_template_x - $ref_start_template_x, 2) + pow($ref_end_template_y - $ref_start_template_y, 2));
        $ref_length_container = sqrt(pow($ref_end_container_x - $ref_start_container_x, 2) + pow($ref_end_container_y - $ref_start_container_y, 2));
        
        $debug['transformations']['reference_line'] = array(
            'template_start' => "({$ref_start_template_x}, {$ref_start_template_y})",
            'template_end' => "({$ref_end_template_x}, {$ref_end_template_y})",
            'template_length' => "{$ref_length_template}px",
            'container_start' => "({$ref_start_container_x}, {$ref_start_container_y})",
            'container_end' => "({$ref_end_container_x}, {$ref_end_container_y})",
            'container_length' => "{$ref_length_container}px",
            'physical_cm' => $coordinates['reference']['physical_cm'] ?? 'FEHLT'
        );
    }
    
    // SCHRITT 4: Design-Element-Transformationen
    if (!empty($real_coordinates) && is_array($real_coordinates)) {
        foreach ($real_coordinates as $index => $element) {
            $elem_debug = array();
            
            // Input-Werte
            $x_mm = $element['x_mm'] ?? 0;
            $y_mm = $element['y_mm'] ?? 0;
            $width_mm = $element['width_mm'] ?? 0;
            $height_mm = $element['height_mm'] ?? 0;
            $x_px_original = $element['x_px'] ?? 0;
            $y_px_original = $element['y_px'] ?? 0;
            
            $elem_debug['input'] = array(
                'mm_coordinates' => "({$x_mm}, {$y_mm}) {$width_mm}x{$height_mm}mm",
                'original_px' => "({$x_px_original}, {$y_px_original})",
                'url' => $element['url'] ?? 'FEHLT'
            );
            
            // MM zu Template-Pixel (über Produktdimensionen)
            $x_template_via_mm = ($x_mm / $product_width_mm) * $template_width;
            $y_template_via_mm = ($y_mm / $product_height_mm) * $template_height;
            $width_template_via_mm = ($width_mm / $product_width_mm) * $template_width;
            $height_template_via_mm = ($height_mm / $product_height_mm) * $template_height;
            
            $elem_debug['mm_to_template'] = array(
                'calculation' => "({$x_mm}/{$product_width_mm}) * {$template_width} = {$x_template_via_mm}",
                'template_coords' => "({$x_template_via_mm}, {$y_template_via_mm}) {$width_template_via_mm}x{$height_template_via_mm}px"
            );
            
            // Template zu Container
            $x_final = $template_offset_x + ($x_template_via_mm * $template_scale);
            $y_final = $template_offset_y + ($y_template_via_mm * $template_scale);
            $width_final = $width_template_via_mm * $template_scale;
            $height_final = $height_template_via_mm * $template_scale;
            
            $elem_debug['template_to_container'] = array(
                'calculation' => "{$template_offset_x} + ({$x_template_via_mm} * {$template_scale}) = {$x_final}",
                'container_coords' => "({$x_final}, {$y_final}) {$width_final}x{$height_final}px"
            );
            
            // Alternative: Direkte Pixel-Transformation (zum Vergleich)
            $x_direct = $template_offset_x + ($x_px_original * $template_scale);
            $y_direct = $template_offset_y + ($y_px_original * $template_scale);
            
            $elem_debug['direct_pixel_transform'] = array(
                'calculation' => "{$template_offset_x} + ({$x_px_original} * {$template_scale}) = {$x_direct}",
                'direct_coords' => "({$x_direct}, {$y_direct})",
                'difference_to_mm_method' => "x_diff=" . ($x_final - $x_direct) . ", y_diff=" . ($y_final - $y_direct)
            );
            
            $debug['transformations']['elements'][$index] = $elem_debug;
        }
    }
    
    // DEBUG-OUTPUT
    echo "🔧 DEBUG COORDINATE TRANSFORM:\n";
    echo "=====================================\n";
    echo "INPUT DATA: " . print_r($debug['input_data'], true) . "\n";
    echo "CALCULATIONS: " . print_r($debug['calculations'], true) . "\n";
    echo "TRANSFORMATIONS: " . print_r($debug['transformations'], true) . "\n";
    echo "=====================================\n\n";
    
    return array_merge($debug, array(
        'template_scale' => $template_scale,
        'template_offset_x' => $template_offset_x,
        'template_offset_y' => $template_offset_y,
        'product_width_mm' => $product_width_mm,
        'product_height_mm' => $product_height_mm
    ));
}

/**
 * 🔧 DEBUG-ENHANCED: Template-Referenz mit vollständiger Debug-Information
 */
function render_template_reference($data, $coordinates, $transformer) {
    $html = '<div style="flex: 1; text-align: center;">';
    $html .= '<h4 style="margin: 0 0 10px 0; color: #dc3545;">📏 Template-Referenzbild</h4>';
    
    // DEBUG-INFO-BOX
    $html .= '<div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin-bottom: 10px; font-size: 11px; text-align: left;">';
    $html .= '<strong>Debug Referenzlinie:</strong><br>';
    if (isset($transformer['transformations']['reference_line'])) {
        $ref_debug = $transformer['transformations']['reference_line'];
        $html .= 'Template: ' . $ref_debug['template_start'] . ' → ' . $ref_debug['template_end'] . ' (Länge: ' . $ref_debug['template_length'] . ')<br>';
        $html .= 'Container: ' . $ref_debug['container_start'] . ' → ' . $ref_debug['container_end'] . ' (Länge: ' . $ref_debug['container_length'] . ')<br>';
        $html .= 'Physisch: ' . $ref_debug['physical_cm'] . '<br>';
        $html .= 'Template-Scale: ' . $transformer['template_scale'] . ', Offset: (' . $transformer['template_offset_x'] . ', ' . $transformer['template_offset_y'] . ')';
    } else {
        $html .= 'KEINE REFERENZPUNKTE GEFUNDEN';
    }
    $html .= '</div>';
    
    $html .= '<div style="position: relative; width: 400px; height: 500px; margin: 0 auto; border: 2px solid #ddd; border-radius: 8px; overflow: hidden; background: #f8f9fa;">';
    
    // Template-Bild
    if (!empty($data['template_image_url'])) {
        $img_width = 800 * $transformer['template_scale'];
        $img_height = 600 * $transformer['template_scale'];
        
        $html .= '<img src="' . htmlspecialchars($data['template_image_url']) . '" style="position: absolute; left: ' . $transformer['template_offset_x'] . 'px; top: ' . $transformer['template_offset_y'] . 'px; width: ' . $img_width . 'px; height: ' . $img_height . 'px; object-fit: contain;" alt="Template">';
        
        // DEBUG: Template-Outline anzeigen
        $html .= '<div style="position: absolute; left: ' . $transformer['template_offset_x'] . 'px; top: ' . $transformer['template_offset_y'] . 'px; width: ' . $img_width . 'px; height: ' . $img_height . 'px; border: 1px dashed #007bff; pointer-events: none;"></div>';
    }
    
    // Referenzlinie mit Debug-Informationen
    if (isset($transformer['transformations']['reference_line'])) {
        $ref_debug = $transformer['transformations']['reference_line'];
        
        // Extrahiere Koordinaten aus Debug-Strings
        preg_match('/\(([^,]+),\s*([^)]+)\)/', $ref_debug['container_start'], $start_matches);
        preg_match('/\(([^,]+),\s*([^)]+)\)/', $ref_debug['container_end'], $end_matches);
        
        if ($start_matches && $end_matches) {
            $start_x = floatval($start_matches[1]);
            $start_y = floatval($start_matches[2]);
            $end_x = floatval($end_matches[1]);
            $end_y = floatval($end_matches[2]);
            
            $html .= '<svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;">';
            $html .= '<line x1="' . $start_x . '" y1="' . $start_y . '" x2="' . $end_x . '" y2="' . $end_y . '" stroke="#dc3545" stroke-width="4" stroke-dasharray="8,4"/>';
            $html .= '<circle cx="' . $start_x . '" cy="' . $start_y . '" r="6" fill="#dc3545"/>';
            $html .= '<circle cx="' . $end_x . '" cy="' . $end_y . '" r="6" fill="#dc3545"/>';
            
            // Debug-Koordinaten als Text
            $html .= '<text x="' . ($start_x + 10) . '" y="' . ($start_y - 10) . '" fill="#dc3545" font-size="10">Start: (' . round($start_x) . ',' . round($start_y) . ')</text>';
            $html .= '<text x="' . ($end_x + 10) . '" y="' . ($end_y + 15) . '" fill="#dc3545" font-size="10">End: (' . round($end_x) . ',' . round($end_y) . ')</text>';
            
            $html .= '</svg>';
        }
    }
    
    $html .= '</div>';
    $html .= '<p style="margin: 10px 0 0 0; font-size: 12px; color: #6c757d;">';
    $html .= '<strong>Größe:</strong> ' . $coordinates['product']['order_size'] . ' | <strong>Referenz:</strong> ' . ($coordinates['reference']['physical_cm'] ?? 'N/A') . 'cm';
    $html .= '</p></div>';
    
    return $html;
}

/**
 * 🔧 DEBUG-ENHANCED: Design-Element-Rendering mit vollständiger Debug-Information
 */
function render_final_placement($data, $coordinates, $transformer, $real_coordinates) {
    $html = '<div style="flex: 1; text-align: center;">';
    $html .= '<h4 style="margin: 0 0 10px 0; color: #28a745;">🎯 Finale Druckplatzierung</h4>';
    
    // DEBUG-INFO für jedes Element
    if (isset($transformer['transformations']['elements'])) {
        foreach ($transformer['transformations']['elements'] as $index => $elem_debug) {
            $html .= '<div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 8px; margin-bottom: 5px; font-size: 10px; text-align: left;">';
            $html .= '<strong>Element ' . ($index + 1) . ':</strong><br>';
            $html .= 'Input MM: ' . $elem_debug['input']['mm_coordinates'] . '<br>';
            $html .= 'MM→Template: ' . $elem_debug['mm_to_template']['template_coords'] . '<br>';
            $html .= 'Template→Container: ' . $elem_debug['template_to_container']['container_coords'] . '<br>';
            $html .= 'Direct Pixel: ' . $elem_debug['direct_pixel_transform']['direct_coords'] . '<br>';
            $html .= 'Difference: ' . $elem_debug['direct_pixel_transform']['difference_to_mm_method'];
            $html .= '</div>';
        }
    }
    
    $html .= '<div style="position: relative; width: 400px; height: 500px; margin: 0 auto; border: 2px solid #ddd; border-radius: 8px; overflow: hidden; background: #f8f9fa;">';
    
    // Template-Bild (identisch zur Referenz)
    if (!empty($data['template_image_url'])) {
        $img_width = 800 * $transformer['template_scale'];
        $img_height = 600 * $transformer['template_scale'];
        
        $html .= '<img src="' . htmlspecialchars($data['template_image_url']) . '" style="position: absolute; left: ' . $transformer['template_offset_x'] . 'px; top: ' . $transformer['template_offset_y'] . 'px; width: ' . $img_width . 'px; height: ' . $img_height . 'px; object-fit: contain;" alt="Template">';
        
        // DEBUG: Template-Outline
        $html .= '<div style="position: absolute; left: ' . $transformer['template_offset_x'] . 'px; top: ' . $transformer['template_offset_y'] . 'px; width: ' . $img_width . 'px; height: ' . $img_height . 'px; border: 1px dashed #007bff; pointer-events: none;"></div>';
    }
    
    // Design-Elemente mit Debug-Vergleich
    if (!empty($real_coordinates) && is_array($real_coordinates)) {
        $colors = ['#dc3545', '#28a745'];
        
        foreach ($real_coordinates as $index => $element) {
            if (isset($transformer['transformations']['elements'][$index])) {
                $elem_debug = $transformer['transformations']['elements'][$index];
                
                // Extrahiere finale Koordinaten
                preg_match('/\(([^,]+),\s*([^)]+)\)\s*([^x]+)x([^p]+)px/', $elem_debug['template_to_container']['container_coords'], $matches);
                
                if ($matches && count($matches) >= 5) {
                    $x_final = floatval($matches[1]);
                    $y_final = floatval($matches[2]);
                    $width_final = floatval($matches[3]);
                    $height_final = floatval($matches[4]);
                    
                    $color = $colors[$index % count($colors)];
                    $design_url = $element['url'] ?? '';
                    
                    // Design-Bild
                    if (!empty($design_url)) {
                        $html .= '<img src="' . htmlspecialchars($design_url) . '" style="position: absolute; left: ' . $x_final . 'px; top: ' . $y_final . 'px; width: ' . $width_final . 'px; height: ' . $height_final . 'px; object-fit: contain; border: 2px solid ' . $color . '; opacity: 0.8;" alt="Design ' . ($index + 1) . '">';
                    }
                    
                    // Debug-Koordinaten als Overlay
                    $html .= '<div style="position: absolute; left: ' . ($x_final - 2) . 'px; top: ' . ($y_final - 25) . 'px; background: ' . $color . '; color: white; padding: 2px 5px; font-size: 9px; border-radius: 2px;">(' . round($x_final) . ',' . round($y_final) . ') ' . round($width_final) . 'x' . round($height_final) . '</div>';
                }
            }
        }
    }
    
    $html .= '</div>';
    $html .= '<p style="margin: 10px 0 0 0; font-size: 12px; color: #6c757d;">Siehe Debug-Logs im Browser Console für detaillierte Berechnungen</p>';
    $html .= '</div>';
    
    return $html;
}

// Test-Daten erstellen
$data = array(
    'order_id' => 5371,
    'template_id' => 3657,
    'template_image_url' => $template_image_url
);

echo "🎨 RENDERE DEBUG-ENHANCED VISUALISIERUNG:\n";
echo "==========================================\n\n";

// Erstelle Transformer
$transformer = create_debug_coordinate_transformer($data, $coordinates, $real_coordinates);

// Erstelle HTML-Output
$html = '<!DOCTYPE html><html><head><title>Debug-Enhanced Koordinaten-Transformation</title></head><body>';
$html .= '<h1>🔧 Debug-Enhanced Koordinaten-Transformation</h1>';
$html .= '<div style="display: flex; gap: 20px; margin: 20px 0;">';

// Links: Template-Referenz
$html .= render_template_reference($data, $coordinates, $transformer);

// Rechts: Finale Druckplatzierung
$html .= render_final_placement($data, $coordinates, $transformer, $real_coordinates);

$html .= '</div>';
$html .= '</body></html>';

// Speichere HTML-Datei
$html_file = 'debug_coordinate_visualization_standalone.html';
file_put_contents($html_file, $html);

echo "✅ DEBUG-ENHANCED VISUALISIERUNG ERSTELLT!\n";
echo "==========================================\n";
echo "📄 HTML-Datei: {$html_file}\n";
echo "🌐 Öffnen Sie die Datei im Browser, um die Debug-Informationen zu sehen\n\n";

echo "🔍 DEBUG-FEATURES:\n";
echo "==================\n";
echo "✅ Detaillierte Debug-Info-Boxen mit allen Berechnungsschritten\n";
echo "✅ Template-Outline zur Überprüfung der Positionierung\n";
echo "✅ Koordinaten-Labels direkt auf den Elementen\n";
echo "✅ Vergleich zwischen MM-basierter und direkter Pixel-Transformation\n";
echo "✅ Vollständige Log-Ausgabe in der Konsole\n\n";

echo "📊 ERWARTETE DEBUG-AUSGABEN:\n";
echo "============================\n";
echo "• Input-Daten: Editor-Canvas, Template-Größe, Container, Produktdimensionen\n";
echo "• Berechnungen: Skalierungsfaktoren, Offsets, Template-Positionierung\n";
echo "• Transformationen: Referenzlinie, Design-Elemente mit Schritt-für-Schritt-Mathematik\n";
echo "• Finale Werte: Alle transformierten Koordinaten mit Debug-Overlays\n\n";

echo "🎯 NÄCHSTE SCHRITTE:\n";
echo "====================\n";
echo "1. Öffnen Sie '{$html_file}' im Browser\n";
echo "2. Prüfen Sie die Debug-Info-Boxen für detaillierte Berechnungen\n";
echo "3. Vergleichen Sie die Koordinaten-Labels mit den erwarteten Werten\n";
echo "4. Identifizieren Sie Abweichungen in der Mathematik\n";
echo "5. Verwenden Sie die Log-Ausgaben für weitere Analyse\n\n";

echo "✅ DEBUG-ENHANCED KOORDINATEN-TRANSFORMATION TEST ABGESCHLOSSEN!\n";
echo "================================================================\n";
echo "Diese Implementierung zeigt Ihnen jeden Berechnungsschritt mit\n";
echo "mathematischen Formeln und visuellen Debug-Overlays!\n";
?>
