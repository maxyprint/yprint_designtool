<?php
/**
 * ✅ FINALE KORREKTUREN FÜR ECHTE DATENQUELLEN
 * Diese Datei enthält die korrigierten Methoden für die YPrint Debug-Funktion
 */

// 1. KORRIGIERTE get_template_image_url METHODE (Zeile 2417-2456)
private function get_template_image_url($template_data, $view_name) {
    $upload_dir = wp_upload_dir();
    
    // 1. Template-ID aus template_data verwenden
    if (!empty($template_data['id'])) {
        $template_id = $template_data['id'];
        $template_image_path = get_post_meta($template_id, '_template_image_path', true);
        
        if (!empty($template_image_path)) {
            $template_image_url = $upload_dir['baseurl'] . '/templates/' . $template_image_path;
            $template_image_file = $upload_dir['basedir'] . '/templates/' . $template_image_path;
            
            if (file_exists($template_image_file)) {
                return $template_image_url;
            }
        }
    }
    
    // 2. Versuche Template-spezifisches Bild zu finden
    if (!empty($template_data['image_path'])) {
        $template_image_path = $template_data['image_path'];
        $template_image_url = $upload_dir['baseurl'] . '/templates/' . $template_image_path;
        
        // Prüfe ob Datei existiert
        $template_image_file = $upload_dir['basedir'] . '/templates/' . $template_image_path;
        if (file_exists($template_image_file)) {
            return $template_image_url;
        }
    }
    
    // 3. Versuche View-spezifisches Bild basierend auf View-Name
    $view_image_mapping = array(
        'shirt_front_template' => 'shirt_front_template.jpg',
        'shirt_back_template' => 'shirt_back_template.jpg',
        'shirt_left_template' => 'shirt_left_template.jpg',
        'shirt_right_template' => 'shirt_right_template.jpg'
    );
    
    if (isset($view_image_mapping[$view_name])) {
        $image_filename = $view_image_mapping[$view_name];
        $template_image_url = $upload_dir['baseurl'] . '/templates/' . $image_filename;
        $template_image_file = $upload_dir['basedir'] . '/templates/' . $image_filename;
        
        if (file_exists($template_image_file)) {
            return $template_image_url;
        }
    }
    
    // 4. Finaler Fallback: Platzhalter-Bild
    return $this->generate_placeholder_image($view_name, $template_data);
}

// 2. KORRIGIERTE get_reference_measurement_data METHODE (Zeile 2461-2483)
private function get_reference_measurement_data($template_data, $selected_size, $view_id = null) {
    $template_id = $template_data['id'] ?? null;
    
    if (!$template_id) {
        return $this->get_fallback_measurement_data($selected_size);
    }
    
    // 1. Lade Template-Messungen aus _template_measurements_table
    $template_measurements = get_post_meta($template_id, '_template_measurements_table', true);
    if (empty($template_measurements)) {
        $template_measurements = get_post_meta($template_id, '_template_product_dimensions', true);
    }
    
    // 2. Lade View-spezifische Konfiguration aus _template_view_print_areas
    $view_print_areas = get_post_meta($template_id, '_template_view_print_areas', true);
    
    // 3. Extrahiere Referenzmessung für die spezifische View
    $reference_measurement = null;
    if (!empty($view_print_areas) && isset($view_print_areas[$view_id]['measurements'])) {
        $measurements = $view_print_areas[$view_id]['measurements'];
        foreach ($measurements as $measurement) {
            if (isset($measurement['type']) && $measurement['type'] === 'chest') {
                $reference_measurement = $measurement;
                break;
            }
        }
    }
    
    // 4. Verwende echte Daten oder Fallback
    if ($reference_measurement) {
        $pixel_start = $reference_measurement['points'][0] ?? array('x' => 120, 'y' => 180);
        $pixel_end = $reference_measurement['points'][1] ?? array('x' => 320, 'y' => 180);
        $pixel_distance = $reference_measurement['pixel_distance'] ?? 200.0;
        
        // Berechne echte physische Distanz basierend auf Größe
        $real_distance_cm = $this->calculate_real_distance_for_size($template_measurements, $selected_size, 'chest');
        
        return array(
            'measurement_type' => $reference_measurement['type'] ?? 'chest',
            'real_distance_cm' => $real_distance_cm,
            'pixel_distance' => $pixel_distance,
            'pixel_start' => $pixel_start,
            'pixel_end' => $pixel_end,
            'measurement_text' => "Brust: {$real_distance_cm} cm (Größe {$selected_size})",
            'size_scale_factors' => $reference_measurement['size_scale_factors'] ?? array()
        );
    }
    
    return $this->get_fallback_measurement_data($selected_size);
}

// 3. NEUE calculate_real_distance_for_size METHODE (nach Zeile 2483)
private function calculate_real_distance_for_size($template_measurements, $selected_size, $measurement_type) {
    if (empty($template_measurements)) {
        return $this->get_fallback_measurement_data($selected_size)['real_distance_cm'];
    }
    
    // Struktur 1: _template_measurements_table
    if (isset($template_measurements[$measurement_type][$selected_size])) {
        return floatval($template_measurements[$measurement_type][$selected_size]);
    }
    
    // Struktur 2: _template_product_dimensions
    if (isset($template_measurements[$selected_size][$measurement_type])) {
        return floatval($template_measurements[$selected_size][$measurement_type]);
    }
    
    // Fallback
    return $this->get_fallback_measurement_data($selected_size)['real_distance_cm'];
}

// 4. NEUE get_fallback_measurement_data METHODE (nach Zeile 2483)
private function get_fallback_measurement_data($selected_size) {
    $chest_measurements = array('S' => 48, 'M' => 52, 'L' => 56, 'XL' => 60);
    $chest_cm = $chest_measurements[$selected_size] ?? 56;
    
    return array(
        'measurement_type' => 'chest',
        'real_distance_cm' => $chest_cm,
        'pixel_distance' => 200.0,
        'pixel_start' => array('x' => 120, 'y' => 180),
        'pixel_end' => array('x' => 320, 'y' => 180),
        'measurement_text' => "Brust: {$chest_cm} cm (Größe {$selected_size})",
        'size_scale_factors' => array()
    );
}

// 5. KORRIGIERTE generate_placeholder_image METHODE (Zeile 2488-2504)
private function generate_placeholder_image($view_name, $template_data = null) {
    $template_id = $template_data['id'] ?? 'N/A';
    $template_name = $template_data['name'] ?? 'Unbekannt';
    
    return 'data:image/svg+xml;base64,' . base64_encode(
        '<svg width="400" height="500" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="500" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2"/>
            <rect x="50" y="50" width="300" height="400" fill="#ffffff" stroke="#6c757d" stroke-width="2" rx="10"/>
            <text x="200" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#dc3545">
                Template Bild nicht gefunden
            </text>
            <text x="200" y="200" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#6c757d">
                ' . esc_attr($view_name) . '
            </text>
            <text x="200" y="220" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#6c757d">
                Template ID: ' . esc_attr($template_id) . '
            </text>
            <text x="200" y="240" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#6c757d">
                ' . esc_attr($template_name) . '
            </text>
            <text x="200" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#6c757d">
                Bitte Template-Bild hochladen:
            </text>
            <text x="200" y="300" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#6c757d">
                /wp-content/uploads/templates/
            </text>
            <text x="200" y="320" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#6c757d">
                ' . esc_attr($view_name) . '.jpg
            </text>
        </svg>'
    );
}

// 6. KORRIGIERTE generate_visual_previews_for_view METHODE (Zeile 2384)
// Erweitere die Methodensignatur um $view_key:
private function generate_visual_previews_for_view($template_data, $step5_result, $step8_result, $view_name, $selected_size, $view_key = null) {
    $previews = array();
    
    // Template-Bild-URL ermitteln - echte Template-Bilder verwenden
    $template_image_url = $this->get_template_image_url($template_data, $view_name);
    
    // Referenzmessung Bild mit echtem Template-Bild
    $reference_data = $this->get_reference_measurement_data($template_data, $selected_size, $view_key);
    $reference_image = $this->generate_reference_measurement_image($template_image_url, $reference_data, $view_name, $selected_size);
    $previews['reference_measurement_image'] = array(
        'url' => $reference_image,
        'description' => "Referenzmessung für {$view_name} - Größe {$selected_size}",
        'measurements_shown' => $reference_data['measurement_text'],
        'type' => 'reference',
        'template_image_url' => $template_image_url
    );
    
    // Finale Platzierung Bild mit echtem Template-Bild
    $placement_image = $this->generate_final_placement_image($template_image_url, $step8_result['final_api_data'], $view_name, $selected_size);
    $previews['final_placement_image'] = array(
        'url' => $placement_image,
        'description' => "Finale Druckplatzierung für {$view_name}",
        'coordinates_shown' => $step8_result['final_api_data'],
        'type' => 'placement',
        'template_image_url' => $template_image_url
    );
    
    return $previews;
}

// 7. KORRIGIERTER AUFRUF in process_complete_workflow_for_view (Zeile 2120-2126)
// Erweitere den Aufruf um $view_key:
// $visual_previews = $this->generate_visual_previews_for_view(
//     $template_data,
//     $step5_result,
//     $step8_result,
//     $view_name,
//     $selected_size,
//     $view_key
// );

?>