<?php
/**
 * AJAX-Handler für SVG-Operationen
 *
 * @package YPrint_DesignTool
 * @subpackage SVGHandler
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Registriert AJAX-Handler für SVG-Operationen
 */
function yprint_register_svg_ajax_handlers() {
    // Für eingeloggte Benutzer
    add_action('wp_ajax_yprint_optimize_svg', 'yprint_ajax_optimize_svg');
    add_action('wp_ajax_yprint_save_svg_to_media', 'yprint_ajax_save_svg_to_media');
    
    // Für alle Benutzer (eingeloggt oder nicht)
    add_action('wp_ajax_yprint_download_svg', 'yprint_ajax_download_svg');
    add_action('wp_ajax_nopriv_yprint_download_svg', 'yprint_ajax_download_svg');
}
add_action('init', 'yprint_register_svg_ajax_handlers');

/**
 * AJAX-Handler zum Optimieren einer SVG-Datei
 */
function yprint_ajax_optimize_svg() {
    // Sicherheitscheck
    check_ajax_referer('yprint-designtool-nonce', 'nonce');
    
    // SVG-Daten prüfen
    if (empty($_POST['svg_content'])) {
        wp_send_json_error(array('message' => __('Kein SVG-Inhalt gefunden.', 'yprint-designtool')));
        return;
    }
    
    $svg_content = stripslashes($_POST['svg_content']);
    
    // SVG-Handler initialisieren
    $svg_handler = YPrint_SVG_Handler::get_instance();
    
    // Optimierungsoptionen
    $options = array(
        'remove_comments' => !empty($_POST['remove_comments']),
        'remove_empty_groups' => !empty($_POST['remove_empty_groups']),
        'remove_metadata' => !empty($_POST['remove_metadata']),
        'remove_xml_declaration' => !empty($_POST['remove_xml_declaration']),
        'round_precision' => isset($_POST['round_precision']) ? intval($_POST['round_precision']) : 2
    );
    
    // SVG optimieren
    $optimized_svg = $svg_handler->optimize_svg($svg_content, $options);
    
    if ($optimized_svg === false) {
        wp_send_json_error(array('message' => __('Fehler beim Optimieren der SVG-Datei.', 'yprint-designtool')));
        return;
    }
    
    // Originalgröße und optimierte Größe berechnen
    $original_size = strlen($svg_content);
    $optimized_size = strlen($optimized_svg);
    $reduction = $original_size > 0 ? round(100 - ($optimized_size / $original_size * 100), 1) : 0;
    
    // Erfolg zurückmelden
    wp_send_json_success(array(
        'svg_content' => $optimized_svg,
        'original_size' => $original_size,
        'optimized_size' => $optimized_size,
        'reduction' => $reduction . '%'
    ));
}

/**
 * AJAX-Handler zum Speichern einer SVG-Datei in der Medienbibliothek
 */
function yprint_ajax_save_svg_to_media() {
    // Sicherheitscheck
    check_ajax_referer('yprint-designtool-nonce', 'nonce');
    
    if (!current_user_can('upload_files')) {
        wp_send_json_error(array('message' => __('Keine Berechtigung zum Hochladen von Dateien.', 'yprint-designtool')));
        return;
    }
    
    // SVG-Daten prüfen
    if (empty($_POST['svg_content'])) {
        wp_send_json_error(array('message' => __('Kein SVG-Inhalt gefunden.', 'yprint-designtool')));
        return;
    }
    
    $svg_content = stripslashes($_POST['svg_content']);
    $filename = isset($_POST['filename']) ? sanitize_file_name($_POST['filename']) : 'design.svg';
    $title = isset($_POST['title']) ? sanitize_text_field($_POST['title']) : '';
    
    // SVG-Handler initialisieren
    $svg_handler = YPrint_SVG_Handler::get_instance();
    
    // Attachment-Daten
    $attachment_data = array();
    if (!empty($title)) {
        $attachment_data['post_title'] = $title;
    }
    
    // SVG in Medienbibliothek speichern
    $result = $svg_handler->save_to_media_library($svg_content, $filename, $attachment_data);
    
    if (is_wp_error($result)) {
        wp_send_json_error(array('message' => $result->get_error_message()));
        return;
    }
    
    // Erfolg zurückmelden
    wp_send_json_success(array(
        'attachment_id' => $result,
        'attachment_url' => wp_get_attachment_url($result),
        'admin_url' => admin_url('post.php?post=' . $result . '&action=edit')
    ));
}

/**
 * AJAX-Handler zum Herunterladen einer SVG-Datei
 */
function yprint_ajax_download_svg() {
    // Sicherheitscheck
    check_ajax_referer('yprint-designtool-nonce', 'nonce');
    
    // SVG-Daten prüfen
    if (empty($_POST['svg_content'])) {
        wp_send_json_error(array('message' => __('Kein SVG-Inhalt gefunden.', 'yprint-designtool')));
        return;
    }
    
    $svg_content = stripslashes($_POST['svg_content']);
    $filename = isset($_POST['filename']) ? sanitize_file_name($_POST['filename']) : 'design.svg';
    
    // SVG-Handler initialisieren
    $svg_handler = YPrint_SVG_Handler::get_instance();
    
    // Stelle sicher, dass der Dateiname auf .svg endet
    if (pathinfo($filename, PATHINFO_EXTENSION) !== 'svg') {
        $filename .= '.svg';
    }
    
    // Sanitiere den SVG-Inhalt
    $svg_content = $svg_handler->sanitize_svg($svg_content);
    if (!$svg_content) {
        wp_send_json_error(array('message' => __('Ungültiges SVG-Format', 'yprint-designtool')));
        return;
    }
    
    // Temporäres Verzeichnis erstellen
    $upload_dir = wp_upload_dir();
    $temp_dir = $upload_dir['basedir'] . '/yprint-designtool/temp';
    
    // Verzeichnis erstellen, falls nicht vorhanden
    if (!file_exists($temp_dir)) {
        wp_mkdir_p($temp_dir);
        // .htaccess zum Schutz erstellen
        file_put_contents($temp_dir . '/.htaccess', "Options -Indexes\n");
    }
    
    // Temporäre Datei erstellen
    $temp_file = $temp_dir . '/' . 'download_' . md5(uniqid()) . '.svg';
    
    if (file_put_contents($temp_file, $svg_content) === false) {
        wp_send_json_error(array('message' => __('Fehler beim Erstellen der temporären Datei.', 'yprint-designtool')));
        return;
    }
    
    // URL zur temporären Datei erstellen
    $file_url = $upload_dir['baseurl'] . '/yprint-designtool/temp/' . basename($temp_file);
    
    // Erfolg zurückmelden
    wp_send_json_success(array(
        'file_url' => $file_url,
        'filename' => $filename
    ));
}

/**
 * Temporäre SVG-Dateien bereinigen
 * 
 * Wird durch einen geplanten Cron-Job aufgerufen
 */
function yprint_cleanup_temporary_svg_files() {
    $upload_dir = wp_upload_dir();
    $temp_dir = $upload_dir['basedir'] . '/yprint-designtool/temp';
    
    if (!file_exists($temp_dir) || !is_dir($temp_dir)) {
        return;
    }
    
    // Dateien finden, die älter als 1 Stunde sind
    $files = glob($temp_dir . '/download_*.svg');
    $current_time = time();
    
    foreach ($files as $file) {
        // .htaccess Datei überspringen
        if (basename($file) === '.htaccess') {
            continue;
        }
        
        $file_time = filemtime($file);
        if (($current_time - $file_time) > 3600) { // 3600 Sekunden = 1 Stunde
            @unlink($file);
        }
    }
}
add_action('yprint_cleanup_temp_files', 'yprint_cleanup_temporary_svg_files');

/**
 * Einmaliger Cron-Job zum Bereinigen temporärer Dateien
 */
function yprint_setup_svg_cleanup_cron() {
    if (!wp_next_scheduled('yprint_cleanup_temp_files')) {
        wp_schedule_event(time(), 'hourly', 'yprint_cleanup_temp_files');
    }
}
register_activation_hook(YPRINT_DESIGNTOOL_PLUGIN_BASENAME, 'yprint_setup_svg_cleanup_cron');

/**
 * Cron-Job beim Deaktivieren des Plugins entfernen
 */
function yprint_remove_svg_cleanup_cron() {
    wp_clear_scheduled_hook('yprint_cleanup_temp_files');
}
register_deactivation_hook(YPRINT_DESIGNTOOL_PLUGIN_BASENAME, 'yprint_remove_svg_cleanup_cron');