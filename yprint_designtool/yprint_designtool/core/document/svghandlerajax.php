<?php
/**
 * AJAX-Handler für SVG-Operationen
 * 
 * Verarbeitet AJAX-Anfragen für das Speichern und Manipulieren von SVG-Dateien
 */

// Sicherheitscheck: Direkten Zugriff auf diese Datei verhindern
if (!defined('ABSPATH')) {
    exit;
}

class YPrint_SVGHandlerAjax {
    /**
     * Konstruktor
     */
    public function __construct() {
        // AJAX-Aktionen registrieren
        add_action('wp_ajax_yprint_save_svg_to_media', array($this, 'ajax_save_svg_to_media'));
        add_action('wp_ajax_nopriv_yprint_save_svg_to_media', array($this, 'ajax_save_svg_to_media'));
        
        add_action('wp_ajax_yprint_download_svg', array($this, 'ajax_download_svg'));
        add_action('wp_ajax_nopriv_yprint_download_svg', array($this, 'ajax_download_svg'));
        
        add_action('wp_ajax_yprint_load_svg', array($this, 'ajax_load_svg'));
        add_action('wp_ajax_nopriv_yprint_load_svg', array($this, 'ajax_load_svg'));
        
        add_action('wp_ajax_yprint_change_svg_color', array($this, 'ajax_change_svg_color'));
        add_action('wp_ajax_nopriv_yprint_change_svg_color', array($this, 'ajax_change_svg_color'));
        
        add_action('wp_ajax_yprint_magic_wand', array($this, 'ajax_magic_wand'));
        add_action('wp_ajax_nopriv_yprint_magic_wand', array($this, 'ajax_magic_wand'));
    }
    
    /**
     * AJAX-Handler zum Speichern des SVG in der Mediathek
     */
    public function ajax_save_svg_to_media() {
        // Nonce-Überprüfung
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // SVG-Inhalt überprüfen
        if (empty($_POST['svg_content'])) {
            wp_send_json_error(__('Kein SVG-Inhalt vorhanden.', 'yprint-designtool'));
            return;
        }
        
        $svg_content = wp_unslash($_POST['svg_content']);
        $filename = isset($_POST['filename']) ? sanitize_file_name($_POST['filename']) : 'designtool-export.svg';
        
        // Titel für das Attachment erzeugen
        $title = '';
        if ($filename) {
            $title = preg_replace('/\.[^/.]+$/', "", $filename); // Dateiendung entfernen
        } else {
            $title = __('Design Tool Export', 'yprint-designtool');
        }
        
        // SVG-Handler abrufen
        $svg_handler = YPrint_SVGHandler::get_instance();
        
        // Zusätzliche Daten für den Anhang
        $attachment_data = array(
            'post_title' => $title,
            'post_excerpt' => isset($_POST['caption']) ? sanitize_text_field($_POST['caption']) : '',
            'post_content' => isset($_POST['description']) ? wp_kses_post($_POST['description']) : '',
        );
        
        // SVG in Mediathek speichern
        $attachment_id = $svg_handler->save_to_media_library($svg_content, $filename, $attachment_data);
        
        if (is_wp_error($attachment_id)) {
            wp_send_json_error($attachment_id->get_error_message());
            return;
        }
        
        // Erfolgreiche Antwort senden
        wp_send_json_success(array(
            'attachment_id' => $attachment_id,
            'attachment_url' => wp_get_attachment_url($attachment_id),
            'message' => __('SVG erfolgreich in Mediathek gespeichert.', 'yprint-designtool')
        ));
    }
    
    /**
     * AJAX-Handler zum Erstellen eines Download-Links für SVG
     */
    public function ajax_download_svg() {
        // Nonce-Überprüfung
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // SVG-Inhalt überprüfen
        if (empty($_POST['svg_content'])) {
            wp_send_json_error(__('Kein SVG-Inhalt vorhanden.', 'yprint-designtool'));
            return;
        }
        
        $svg_content = wp_unslash($_POST['svg_content']);
        $filename = isset($_POST['filename']) ? sanitize_file_name($_POST['filename']) : 'designtool-export.svg';
        
        // SVG-Handler abrufen
        $svg_handler = YPrint_SVGHandler::get_instance();
        
        // Download-Link erstellen
        $download_url = $svg_handler->create_download_link($svg_content, $filename);
        
        if (empty($download_url)) {
            wp_send_json_error(__('Fehler beim Erstellen des Download-Links.', 'yprint-designtool'));
            return;
        }
        
        // Erfolgreiche Antwort senden
        wp_send_json_success(array(
            'download_url' => $download_url,
            'message' => __('Download-Link erstellt.', 'yprint-designtool')
        ));
    }
    
    /**
     * AJAX-Handler zum Laden eines SVG aus der Mediathek
     */
    public function ajax_load_svg() {
        // Nonce-Überprüfung
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // Attachment-ID überprüfen
        if (empty($_POST['attachment_id'])) {
            wp_send_json_error(__('Keine Attachment-ID angegeben.', 'yprint-designtool'));
            return;
        }
        
        $attachment_id = intval($_POST['attachment_id']);
        
        // Attachment-Datei abrufen
        $file_path = get_attached_file($attachment_id);
        
        if (!$file_path || !file_exists($file_path)) {
            wp_send_json_error(__('SVG-Datei nicht gefunden.', 'yprint-designtool'));
            return;
        }
        
        // SVG-Inhalt lesen
        $svg_content = file_get_contents($file_path);
        
        if (empty($svg_content)) {
            wp_send_json_error(__('SVG-Inhalt konnte nicht gelesen werden.', 'yprint-designtool'));
            return;
        }
        
        // Erfolgreiche Antwort senden
        wp_send_json_success(array(
            'svg_content' => $svg_content,
            'filename' => basename($file_path),
            'message' => __('SVG erfolgreich geladen.', 'yprint-designtool')
        ));
    }
    
    /**
     * AJAX-Handler zum Ändern der Farbe eines SVG-Pfades
     */
    public function ajax_change_svg_color() {
        // Nonce-Überprüfung
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // Parameter überprüfen
        if (empty($_POST['svg_content']) || empty($_POST['path_id']) || empty($_POST['new_color'])) {
            wp_send_json_error(__('Fehlende Parameter.', 'yprint-designtool'));
            return;
        }
        
        $svg_content = wp_unslash($_POST['svg_content']);
        $path_id = sanitize_text_field($_POST['path_id']);
        $new_color = sanitize_text_field($_POST['new_color']);
        
        // SVG-Handler abrufen
        $svg_handler = YPrint_SVGHandler::get_instance();
        
        // Farbe ändern
        $modified_svg = $svg_handler->change_path_color($svg_content, $path_id, $new_color);
        
        if (empty($modified_svg)) {
            wp_send_json_error(__('Fehler beim Ändern der Farbe.', 'yprint-designtool'));
            return;
        }
        
        // Erfolgreiche Antwort senden
        wp_send_json_success(array(
            'svg_content' => $modified_svg,
            'message' => __('Farbe erfolgreich geändert.', 'yprint-designtool')
        ));
    }
    
    /**
     * AJAX-Handler für die Zauberstab-Funktion
     */
    public function ajax_magic_wand() {
        // Nonce-Überprüfung
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // Parameter überprüfen
        if (empty($_POST['svg_content']) || empty($_POST['target_color']) || empty($_POST['new_color'])) {
            wp_send_json_error(__('Fehlende Parameter.', 'yprint-designtool'));
            return;
        }
        
        $svg_content = wp_unslash($_POST['svg_content']);
        $target_color = sanitize_text_field($_POST['target_color']);
        $new_color = sanitize_text_field($_POST['new_color']);
        $tolerance = isset($_POST['tolerance']) ? floatval($_POST['tolerance']) : 0.1;
        
        // Toleranz begrenzen
        $tolerance = max(0.0, min(1.0, $tolerance));
        
        // SVG-Handler abrufen
        $svg_handler = YPrint_SVGHandler::get_instance();
        
        // Zauberstab-Funktion anwenden
        $modified_svg = $svg_handler->magic_wand($svg_content, $target_color, $new_color, $tolerance);
        
        if (empty($modified_svg)) {
            wp_send_json_error(__('Fehler bei der Zauberstab-Funktion.', 'yprint-designtool'));
            return;
        }
        
        // Erfolgreiche Antwort senden
        wp_send_json_success(array(
            'svg_content' => $modified_svg,
            'message' => __('Zauberstab-Funktion erfolgreich angewendet.', 'yprint-designtool')
        ));
    }
}