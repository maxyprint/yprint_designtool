<?php
/**
 * AJAX-Handler für Export-Funktionen
 * 
 * Verarbeitet AJAX-Anfragen für das Exportieren von Designs in verschiedenen Formaten
 */

// Sicherheitscheck: Direkten Zugriff auf diese Datei verhindern
if (!defined('ABSPATH')) {
    exit;
}

class YPrint_ExporterAjax {
    /**
     * Konstruktor
     */
    public function __construct() {
        // AJAX-Aktionen registrieren
        add_action('wp_ajax_yprint_export_as_svg', array($this, 'ajax_export_as_svg'));
        add_action('wp_ajax_nopriv_yprint_export_as_svg', array($this, 'ajax_export_as_svg'));
        
        add_action('wp_ajax_yprint_export_as_png', array($this, 'ajax_export_as_png'));
        add_action('wp_ajax_nopriv_yprint_export_as_png', array($this, 'ajax_export_as_png'));
        
        add_action('wp_ajax_yprint_export_as_pdf', array($this, 'ajax_export_as_pdf'));
        add_action('wp_ajax_nopriv_yprint_export_as_pdf', array($this, 'ajax_export_as_pdf'));
    }
    
    /**
     * AJAX-Handler für den Export als SVG
     */
    public function ajax_export_as_svg() {
        // Nonce-Überprüfung
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // Design-Daten überprüfen
        if (empty($_POST['design_data'])) {
            wp_send_json_error(__('Keine Design-Daten vorhanden.', 'yprint-designtool'));
            return;
        }
        
        $design_data = json_decode(wp_unslash($_POST['design_data']), true);
        
        if (empty($design_data)) {
            wp_send_json_error(__('Ungültige Design-Daten.', 'yprint-designtool'));
            return;
        }
        
        $filename = isset($_POST['filename']) ? sanitize_file_name($_POST['filename']) : 'designtool-export.svg';
        
        // Exporter abrufen
        $exporter = YPrint_Exporter::get_instance();
        
        // Design als SVG exportieren
        $svg_content = $exporter->export_as_svg($design_data);
        
        if (empty($svg_content)) {
            wp_send_json_error(__('Fehler beim Exportieren als SVG.', 'yprint-designtool'));
            return;
        }
        
        // Download-URL erstellen
        // Temporäre Datei erstellen
        $upload_dir = wp_upload_dir();
        $temp_dir = $upload_dir['basedir'] . '/yprint-designtool/temp';
        
        if (!file_exists($temp_dir)) {
            wp_mkdir_p($temp_dir);
        }
        
        // Timestamp für eindeutigen Dateinamen
        $timestamp = time();
        $temp_file = $temp_dir . '/' . $timestamp . '-' . $filename;
        
        // SVG-Inhalt in temporäre Datei schreiben
        $result = file_put_contents($temp_file, $svg_content);
        
        if ($result === false) {
            wp_send_json_error(__('Fehler beim Speichern der SVG-Datei.', 'yprint-designtool'));
            return;
        }
        
        // URL zur temporären Datei erstellen
        $file_url = $upload_dir['baseurl'] . '/yprint-designtool/temp/' . $timestamp . '-' . $filename;
        
        // Erfolgreiche Antwort senden
        wp_send_json_success(array(
            'download_url' => $file_url,
            'svg_content' => $svg_content,
            'message' => __('SVG erfolgreich exportiert.', 'yprint-designtool')
        ));
    }
    
    /**
     * AJAX-Handler für den Export als PNG
     */
    public function ajax_export_as_png() {
        // Nonce-Überprüfung
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // Design-Daten überprüfen
        if (empty($_POST['design_data'])) {
            wp_send_json_error(__('Keine Design-Daten vorhanden.', 'yprint-designtool'));
            return;
        }
        
        $design_data = json_decode(wp_unslash($_POST['design_data']), true);
        
        if (empty($design_data)) {
            wp_send_json_error(__('Ungültige Design-Daten.', 'yprint-designtool'));
            return;
        }
        
        $filename = isset($_POST['filename']) ? sanitize_file_name($_POST['filename']) : 'designtool-export.png';
        $dpi = isset($_POST['dpi']) ? intval($_POST['dpi']) : 300;
        
        // Exporter abrufen
        $exporter = YPrint_Exporter::get_instance();
        
        // Design als PNG exportieren
        $result = $exporter->export_as_png($design_data, $dpi);
        
        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
            return;
        }
        
        // Download-URL erstellen
        $download_url = $exporter->create_download_url($result, $filename);
        
        if (empty($download_url)) {
            wp_send_json_error(__('Fehler beim Erstellen des Download-Links.', 'yprint-designtool'));
            return;
        }
        
        // Temporäre Datei löschen (original wurde bereits nach downloads/ kopiert)
        @unlink($result);
        
        // Erfolgreiche Antwort senden
        wp_send_json_success(array(
            'download_url' => $download_url,
            'message' => __('PNG erfolgreich exportiert.', 'yprint-designtool')
        ));
    }
    
    /**
     * AJAX-Handler für den Export als PDF
     */
    public function ajax_export_as_pdf() {
        // Nonce-Überprüfung
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // Design-Daten überprüfen
        if (empty($_POST['design_data'])) {
            wp_send_json_error(__('Keine Design-Daten vorhanden.', 'yprint-designtool'));
            return;
        }
        
        $design_data = json_decode(wp_unslash($_POST['design_data']), true);
        
        if (empty($design_data)) {
            wp_send_json_error(__('Ungültige Design-Daten.', 'yprint-designtool'));
            return;
        }
        
        $filename = isset($_POST['filename']) ? sanitize_file_name($_POST['filename']) : 'designtool-export.pdf';
        
        // Exporter abrufen
        $exporter = YPrint_Exporter::get_instance();
        
        // Design als PDF exportieren
        $result = $exporter->export_as_pdf($design_data);
        
        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
            return;
        }
        
        // Download-URL erstellen
        $download_url = $exporter->create_download_url($result, $filename);
        
        if (empty($download_url)) {
            wp_send_json_error(__('Fehler beim Erstellen des Download-Links.', 'yprint-designtool'));
            return;
        }
        
        // Temporäre Datei löschen (original wurde bereits nach downloads/ kopiert)
        @unlink($result);
        
        // Erfolgreiche Antwort senden
        wp_send_json_success(array(
            'download_url' => $download_url,
            'message' => __('PDF erfolgreich exportiert.', 'yprint-designtool')
        ));
    }
}