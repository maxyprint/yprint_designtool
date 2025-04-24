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
 * Registriert AJAX-Handler für Export-Funktionen
 */
function yprint_designtool_register_export_handlers() {
    add_action('wp_ajax_yprint_designtool_export_svg', 'yprint_designtool_ajax_export_svg');
    add_action('wp_ajax_nopriv_yprint_designtool_export_svg', 'yprint_designtool_ajax_export_svg');
    
    add_action('wp_ajax_yprint_designtool_export_png', 'yprint_designtool_ajax_export_png');
    add_action('wp_ajax_nopriv_yprint_designtool_export_png', 'yprint_designtool_ajax_export_png');
    
    add_action('wp_ajax_yprint_designtool_save_to_media', 'yprint_designtool_ajax_save_to_media');
    add_action('wp_ajax_nopriv_yprint_designtool_save_to_media', 'yprint_designtool_ajax_save_to_media');
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
    
    // Zunächst SVG speichern (als Fallback)
    $svg_path = $export_dir . '/' . $unique_id . '-temp.svg';
    file_put_contents($svg_path, $svg_content);
    
    // Versuchen, SVG in PNG zu konvertieren, wenn möglich
    $png_generated = false;
    
    // Methode 1: Imagick verwenden, wenn verfügbar
    if (extension_loaded('imagick') && class_exists('Imagick')) {
        try {
            $imagick = new Imagick();
            $imagick->readImageBlob($svg_content);
            $imagick->setImageFormat('png');
            $imagick->resizeImage($width, $height, Imagick::FILTER_LANCZOS, 1);
            $imagick->writeImage($export_path);
            $png_generated = true;
        } catch (Exception $e) {
            // Fehlgeschlagen, Fallback verwenden
        }
    }
    
    // Methode 2: Inkscape CLI verwenden, wenn verfügbar
    if (!$png_generated && yprint_designtool_check_potrace()) {
        // Pfad zu Inkscape bestimmen
        $inkscape_path = '';
        
        // Bekannte Inkscape-Pfade überprüfen
        $inkscape_paths = array(
            '/usr/bin/inkscape',
            '/usr/local/bin/inkscape',
            '/opt/homebrew/bin/inkscape',
            'C:\\Program Files\\Inkscape\\bin\\inkscape.exe',
            'C:\\Program Files (x86)\\Inkscape\\bin\\inkscape.exe'
        );
        
        foreach ($inkscape_paths as $path) {
            if (file_exists($path)) {
                $inkscape_path = $path;
                break;
            }
        }
        
        // Wenn Inkscape gefunden wurde, SVG in PNG konvertieren
        if (!empty($inkscape_path) && function_exists('exec')) {
            $command = escapeshellcmd(
                '"' . $inkscape_path . '" ' .
                '--export-filename="' . $export_path . '" ' .
                '--export-width=' . $width . ' ' .
                '--export-height=' . $height . ' ' .
                '"' . $svg_path . '"'
            );
            
            exec($command, $output, $return_var);
            
            if ($return_var === 0) {
                $png_generated = true;
            }
        }
    }
    
    // URL zur exportierten Datei
    if ($png_generated) {
        $export_url = $upload_dir['baseurl'] . '/yprint-designtool/exports/' . $export_filename;
    } else {
        // Fallback: SVG-URL zurückgeben
        $export_url = $upload_dir['baseurl'] . '/yprint-designtool/exports/' . $unique_id . '-temp.svg';
    }
    
    // Erfolgsantwort
    wp_send_json_success(array(
        'url' => $export_url,
        'filename' => $png_generated ? $filename : str_replace('.png', '.svg', $filename),
        'svg_url' => $upload_dir['baseurl'] . '/yprint-designtool/exports/' . $unique_id . '-temp.svg',
        'client_side' => !$png_generated // Hinweis, dass Client-seitiger Export erforderlich ist
    ));
}

/**
 * AJAX-Handler zum Speichern in der Mediathek
 */
function yprint_designtool_ajax_save_to_media() {
    // Sicherheitscheck
    check_ajax_referer('yprint-designtool-nonce', 'nonce');
    
    // Nur für angemeldete Benutzer erlauben
    if (!is_user_logged_in()) {
        wp_send_json_error(array('message' => __('Du musst angemeldet sein, um diese Aktion auszuführen.', 'yprint-designtool')));
        return;
    }
    
    // Prüfen, ob der Benutzer Dateien hochladen darf
    if (!current_user_can('upload_files')) {
        wp_send_json_error(array('message' => __('Du hast keine Berechtigung, Dateien hochzuladen.', 'yprint-designtool')));
        return;
    }
    
    // SVG-Inhalt aus dem Request
    $svg_content = isset($_POST['svg_content']) ? stripslashes($_POST['svg_content']) : '';
    $filename = isset($_POST['filename']) ? sanitize_file_name($_POST['filename']) : 'design.svg';
    $title = isset($_POST['title']) ? sanitize_text_field($_POST['title']) : '';
    
    if (empty($svg_content)) {
        wp_send_json_error(array('message' => __('Kein Inhalt gefunden', 'yprint-designtool')));
        return;
    }
    
    // SVG validieren und bereinigen
    $svg_content = yprint_designtool_sanitize_svg($svg_content);
    
    // Dateierweiterung sicherstellen
    if (!preg_match('/\.svg$/i', $filename)) {
        $filename .= '.svg';
    }
    
    // In temporäre Datei speichern
    $upload_dir = wp_upload_dir();
    $temp_file = $upload_dir['basedir'] . '/yprint-designtool/temp/' . uniqid() . '-' . $filename;
    
    file_put_contents($temp_file, $svg_content);
    
    // Titel generieren
    if (empty($title)) {
        $title = preg_replace('/\.[^.]+$/', '', $filename);
    }
    
    // Medienbibliothek-Metadaten
    $attachment = array(
        'post_mime_type' => 'image/svg+xml',
        'post_title' => $title,
        'post_content' => '',
        'post_status' => 'inherit'
    );
    
    // Datei in die Medienbibliothek einfügen
    $attachment_id = wp_insert_attachment($attachment, $temp_file);
    
    if (is_wp_error($attachment_id)) {
        @unlink($temp_file);
        wp_send_json_error(array('message' => $attachment_id->get_error_message()));
        return;
    }
    
    // Metadaten generieren
    require_once(ABSPATH . 'wp-admin/includes/image.php');
    $attachment_data = wp_generate_attachment_metadata($attachment_id, $temp_file);
    wp_update_attachment_metadata($attachment_id, $attachment_data);
    
    // Temporäre Datei löschen (wird bereits in die Medienbibliothek kopiert)
    @unlink($temp_file);
    
    // Erfolgsantwort
    wp_send_json_success(array(
        'attachment_id' => $attachment_id,
        'attachment_url' => wp_get_attachment_url($attachment_id),
        'edit_url' => admin_url('post.php?post=' . $attachment_id . '&action=edit')
    ));
}