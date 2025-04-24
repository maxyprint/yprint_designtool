<?php
/**
 * AJAX-Handler für Import-Funktionen
 * 
 * Verarbeitet AJAX-Anfragen für das Importieren von Bildern im Design-Tool
 */

// Sicherheitscheck: Direkten Zugriff auf diese Datei verhindern
if (!defined('ABSPATH')) {
    exit;
}

class YPrint_ImporterAjax {
    /**
     * Konstruktor
     */
    public function __construct() {
        // AJAX-Aktionen registrieren
        add_action('wp_ajax_yprint_import_image', array($this, 'ajax_import_image'));
        add_action('wp_ajax_nopriv_yprint_import_image', array($this, 'ajax_import_image'));
        
        add_action('wp_ajax_yprint_import_from_media', array($this, 'ajax_import_from_media'));
        add_action('wp_ajax_nopriv_yprint_import_from_media', array($this, 'ajax_import_from_media'));
        
        add_action('wp_ajax_yprint_import_from_url', array($this, 'ajax_import_from_url'));
        add_action('wp_ajax_nopriv_yprint_import_from_url', array($this, 'ajax_import_from_url'));
    }
    
    /**
     * AJAX-Handler für den Import eines hochgeladenen Bildes
     */
    public function ajax_import_image() {
        // Nonce-Überprüfung
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // Überprüfen, ob eine Datei hochgeladen wurde
        if (empty($_FILES['import_image'])) {
            wp_send_json_error(__('Keine Datei hochgeladen.', 'yprint-designtool'));
            return;
        }
        
        $file = $_FILES['import_image'];
        
        // Importer abrufen
        $importer = YPrint_Importer::get_instance();
        
        // Bild importieren
        $result = $importer->import_uploaded_image($file);
        
        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
            return;
        }
        
        // Erfolgreiche Antwort senden
        wp_send_json_success(array(
            'image' => $result,
            'message' => __('Bild erfolgreich importiert.', 'yprint-designtool')
        ));
    }
    
    /**
     * AJAX-Handler für den Import eines Bildes aus der Mediathek
     */
    public function ajax_import_from_media() {
        // Nonce-Überprüfung
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // Überprüfen, ob eine Attachment-ID angegeben wurde
        if (empty($_POST['attachment_id'])) {
            wp_send_json_error(__('Keine Attachment-ID angegeben.', 'yprint-designtool'));
            return;
        }
        
        $attachment_id = intval($_POST['attachment_id']);
        
        // Attachment-Datei abrufen
        $file_path = get_attached_file($attachment_id);
        
        if (!$file_path || !file_exists($file_path)) {
            wp_send_json_error(__('Datei nicht gefunden.', 'yprint-designtool'));
            return;
        }
        
        // Importer abrufen
        $importer = YPrint_Importer::get_instance();
        
        // Bild importieren
        $result = $importer->import_image($file_path);
        
        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
            return;
        }
        
        // Titel und Beschreibung aus dem Attachment übernehmen
        $attachment = get_post($attachment_id);
        if ($attachment) {
            $result['title'] = $attachment->post_title;
            $result['description'] = $attachment->post_content;
            $result['alt_text'] = get_post_meta($attachment_id, '_wp_attachment_image_alt', true);
        }
        
        // Erfolgreiche Antwort senden
        wp_send_json_success(array(
            'image' => $result,
            'message' => __('Bild erfolgreich aus der Mediathek importiert.', 'yprint-designtool')
        ));
    }
    
    /**
     * AJAX-Handler für den Import eines Bildes von einer URL
     */
    public function ajax_import_from_url() {
        // Nonce-Überprüfung
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // Überprüfen, ob eine URL angegeben wurde
        if (empty($_POST['image_url'])) {
            wp_send_json_error(__('Keine Bild-URL angegeben.', 'yprint-designtool'));
            return;
        }
        
        $image_url = esc_url_raw($_POST['image_url']);
        
        // Temporären Dateinamen erstellen
        $temp_file = download_url($image_url);
        
        if (is_wp_error($temp_file)) {
            wp_send_json_error(__('Fehler beim Herunterladen des Bildes: ', 'yprint-designtool') . $temp_file->get_error_message());
            return;
        }
        
        // Importer abrufen
        $importer = YPrint_Importer::get_instance();
        
        // Bild importieren
        $result = $importer->import_image($temp_file);
        
        // Temporäre Datei löschen, da sie bereits in das Design-Tool-Verzeichnis kopiert wurde
        @unlink($temp_file);
        
        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
            return;
        }
        
        // Erfolgreiche Antwort senden
        wp_send_json_success(array(
            'image' => $result,
            'message' => __('Bild erfolgreich von URL importiert.', 'yprint-designtool')
        ));
    }
}