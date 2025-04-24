<?php
/**
 * Export-Funktionen für das YPrint DesignTool
 *
 * @package YPrint_DesignTool
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Registriert AJAX-Handlers für Export-Funktionen
 */
function yprint_designtool_register_export_handlers() {
    add_action('wp_ajax_yprint_designtool_export_svg', 'yprint_designtool_ajax_export_svg');
    add_action('wp_ajax_nopriv_yprint_designtool_export_svg', 'yprint_designtool_ajax_export_svg');
    
    add_action('wp_ajax_yprint_designtool_export_png', 'yprint_designtool_ajax_export_png');
    add_action('wp_ajax_nopriv_yprint_designtool_export_png', 'yprint_designtool_ajax_export_png');
}
add_action('init', 'yprint_designtool_register_export_handlers');

/**
 * AJAX-Handler für SVG-Export
 */
function yprint_designtool_ajax_export_svg() {
    // Sicherheitscheck
    check_ajax_referer('yprint-designtool-nonce', 'nonce');
    
    // SVG-Inhalt aus dem Request
    $svg_content = isset($_POST['svg_content']) ? stripslashes($_POST['svg_content']) : '';
    $filename = isset($_POST['filename']) ? sanitize_file_name($_POST['filename']) : 'design.svg';
    
    if (empty($svg_content)) {
        wp_send_json_error(array('message' => __('Kein SVG-Inhalt gefunden', 'yprint-designtool')));
        return;
    }
    
    // SVG validieren und bereinigen
    $svg_content = yprint_designtool_sanitize_svg($svg_content);
    
    // Temporären Speicherort erstellen
    $upload_dir = wp_upload_dir();
    $export_dir = $upload_dir['basedir'] . '/yprint-designtool/exports';
    
    // Verzeichnis erstellen, falls es nicht existiert
    if (!file_exists($export_dir)) {
        wp_mkdir_p($export_dir);
    }
    
    // Eindeutigen Dateinamen generieren
    $unique_id = uniqid();
    $export_filename = $unique_id . '-' . $filename;
    $export_path = $export_dir . '/' . $export_filename;
    
    // SVG in Datei speichern
    file_put_contents($export_path, $svg_content);
    
    // URL zur exportierten Datei
    $export_url = $upload_dir['baseurl'] . '/yprint-designtool/exports/' . $export_filename;
    
    // Erfolgsantwort
    wp_send_json_success(array(
        'url' => $export_url,
        'filename' => $filename
    ));
}

/**
 * AJAX-Handler für PNG-Export
 */
function yprint_designtool_ajax_export_png() {
    // Sicherheitscheck
    check_ajax_referer('yprint-designtool-nonce', 'nonce');
    
    // SVG-Inhalt aus dem Request
    $svg_content = isset($_POST['svg_content']) ? stripslashes($_POST['svg_content']) : '';
    $width = isset($_POST['width']) ? intval($_POST['width']) : 800;
    $height = isset($_POST['height']) ? intval($_POST['height']) : 600;
    $filename = isset($_POST['filename']) ? sanitize_file_name($_POST['filename']) : 'design.png';
    
    if (empty($svg_content)) {
        wp_send_json_error(array('message' => __('Kein SVG-Inhalt gefunden', 'yprint-designtool')));
        return;
    }
    
    // Temporären Speicherort erstellen
    $upload_dir = wp_upload_dir();
    $export_dir = $upload_dir['basedir'] . '/yprint-designtool/exports';
    
    // Verzeichnis erstellen, falls es nicht existiert
    if (!file_exists($export_dir)) {
        wp_mkdir_p($export_dir);
    }
    
    // Eindeutigen Dateinamen generieren
    $unique_id = uniqid();
    $export_filename = $unique_id . '-' . $filename;
    $export_path = $export_dir . '/' . $export_filename;
    
    // SVG nach PNG konvertieren
    // Da direkte Konvertierung in PHP komplex ist, verwenden wir einen Client-seitigen Ansatz
    // Für fortgeschrittene Konvertierung kann später eine Bibliothek wie Imagick oder ein externer Service verwendet werden
    
    // Vorläufig: Nur SVG speichern und Client-seitigen Export anbieten
    $svg_path = $export_dir . '/' . $unique_id . '-temp.svg';
    file_put_contents($svg_path, $svg_content);
    
    // URL zur exportierten Datei (SVG als Fallback)
    $export_url = $upload_dir['baseurl'] . '/yprint-designtool/exports/' . $unique_id . '-temp.svg';
    
    // Erfolgsantwort mit Hinweis auf Client-seitige Konvertierung
    wp_send_json_success(array(
        'url' => $export_url,
        'filename' => $filename,
        'svg_url' => $export_url,
        'client_side' => true // Hinweis, dass Client-seitiger Export erforderlich ist
    ));
}

/**
 * Bereinigt SVG-Inhalte zur Sicherheit
 * 
 * @param string $svg_content SVG-Inhalt
 * @return string Bereinigter SVG-Inhalt
 */
function yprint_designtool_sanitize_svg($svg_content) {
    // Einfache Bereinigung - in einer späteren Phase ausbauen!
    
    // Entferne alle script-Tags
    $svg_content = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $svg_content);
    
    // Entferne alle onclick-, onload- und ähnliche Event-Handler
    $svg_content = preg_replace('/\bon\w+\s*=\s*(["\'])[^"\']*\1/i', '', $svg_content);
    
    // Entferne alle href-Attribute, die auf JavaScript verweisen
    $svg_content = preg_replace('/href\s*=\s*(["\'])javascript:.*?\1/i', 'href="javascript:void(0)"', $svg_content);
    
    return $svg_content;
}