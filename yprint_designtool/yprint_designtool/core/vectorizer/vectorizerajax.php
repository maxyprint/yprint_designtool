<?php
/**
 * AJAX-Handler für die Vektorisierungs-Funktionen
 * 
 * Verarbeitet AJAX-Anfragen für die Vektorisierung von Bildern
 */

// Sicherheitscheck: Direkten Zugriff auf diese Datei verhindern
if (!defined('ABSPATH')) {
    exit;
}

class YPrint_VectorizerAjax {
    /**
     * Konstruktor
     */
    public function __construct() {
        // AJAX-Aktionen registrieren
        add_action('wp_ajax_yprint_vectorize_image', array($this, 'ajax_vectorize_image'));
        add_action('wp_ajax_nopriv_yprint_vectorize_image', array($this, 'ajax_vectorize_image'));
    }
    
    /**
     * AJAX-Handler für die Bildvektorisierung
     */
    public function ajax_vectorize_image() {
        // Nonce-Überprüfung
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // Überprüfen, ob eine Datei hochgeladen wurde
        if (empty($_FILES['vectorize_image'])) {
            wp_send_json_error(__('Keine Datei hochgeladen.', 'yprint-designtool'));
            return;
        }
        
        $file = $_FILES['vectorize_image'];
        
        // Überprüfen, ob die Datei gültig ist
        if ($file['error'] !== UPLOAD_ERR_OK) {
            wp_send_json_error(__('Fehler beim Hochladen der Datei: ' . $file['error'], 'yprint-designtool'));
            return;
        }
        
        // Überprüfen, ob der Dateityp akzeptiert wird
        $allowed_types = array('image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp');
        if (!in_array($file['type'], $allowed_types)) {
            wp_send_json_error(__('Ungültiger Dateityp. Bitte lade ein JPEG-, PNG-, GIF-, BMP- oder WebP-Bild hoch.', 'yprint-designtool'));
            return;
        }
        
        // Maximale Dateigröße prüfen
        $max_size = $this->get_max_upload_size();
        if ($file['size'] > $max_size) {
            wp_send_json_error(sprintf(
                __('Die Datei ist zu groß. Maximale Größe: %s MB.', 'yprint-designtool'),
                number_format($max_size / (1024 * 1024), 1)
            ));
            return;
        }
        
        // Datei temporär speichern
        $upload_dir = wp_upload_dir();
        $temp_dir = $upload_dir['basedir'] . '/yprint-designtool/temp';
        
        if (!file_exists($temp_dir)) {
            wp_mkdir_p($temp_dir);
        }
        
        $temp_file = $temp_dir . '/' . sanitize_file_name($file['name']);
        move_uploaded_file($file['tmp_name'], $temp_file);
        
        // Vektorisierungsoptionen
        $options = array(
            'detail_level' => isset($_POST['detail_level']) ? sanitize_text_field($_POST['detail_level']) : 'medium',
            'color_type' => isset($_POST['color_type']) ? sanitize_text_field($_POST['color_type']) : 'mono',
            'colors' => isset($_POST['colors']) ? intval($_POST['colors']) : 8,
            'invert' => isset($_POST['invert']) ? (bool) $_POST['invert'] : false,
            'remove_background' => isset($_POST['remove_background']) ? (bool) $_POST['remove_background'] : true,
        );
        
        // Vektorisierer abrufen
        $vectorizer = YPrint_Vectorizer::get_instance();
        
        // Bild vektorisieren
        try {
            $result = $vectorizer->vectorize_image($temp_file, $options);
            
            // Temporäre Datei löschen
            @unlink($temp_file);
            
            if (is_wp_error($result)) {
                wp_send_json_error($result->get_error_message());
                return;
            }
            
            // Transient für späteren Zugriff speichern
            $transient_key = 'yprint_vector_' . md5(time() . rand());
            set_transient($transient_key, $result, HOUR_IN_SECONDS);
            
            // Erfolgreiche Antwort senden
            wp_send_json_success(array(
                'svg' => $result,
                'transient_key' => $transient_key,
                'message' => __('Vektorisierung erfolgreich!', 'yprint-designtool')
            ));
        } catch (Exception $e) {
            // Temporäre Datei löschen
            @unlink($temp_file);
            
            // Fehler zurückgeben
            wp_send_json_error(__('Fehler bei der Vektorisierung: ', 'yprint-designtool') . $e->getMessage());
        }
    }
    
    /**
     * Gibt die maximale Upload-Größe zurück
     * 
     * @return int Maximale Größe in Bytes
     */
    private function get_max_upload_size() {
        $options = get_option('yprint_designtool_options', array());
        $max_size_mb = isset($options['max_upload_size']) ? (int) $options['max_upload_size'] : 5;
        
        // Sicherstellen, dass die Größe zwischen 1 und 20 MB liegt
        $max_size_mb = max(1, min(20, $max_size_mb));
        
        // In Bytes umrechnen
        return $max_size_mb * 1024 * 1024;
    }
}