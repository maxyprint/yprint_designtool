<?php
/**
 * Importer-Klasse für YPrint DesignTool
 * 
 * Verwaltet den Import und die Verarbeitung von Bildern für das Design-Tool
 */

// Sicherheitscheck: Direkten Zugriff auf diese Datei verhindern
if (!defined('ABSPATH')) {
    exit;
}

class YPrint_Importer {
    /**
     * Singleton-Instanz
     */
    private static $instance = null;
    
    /**
     * Erlaubte Bild-MIME-Typen
     */
    private $allowed_mime_types = array(
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/webp',
        'image/svg+xml'
    );
    
    /**
     * Konstruktor
     */
    private function __construct() {
        // Hooks und Filter registrieren
    }
    
    /**
     * Singleton-Instanz abrufen
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Importiert ein Bild aus einer Datei
     * 
     * @param string $file_path Pfad zur Bilddatei
     * @param bool $copy_to_temp Ob die Datei in ein temporäres Verzeichnis kopiert werden soll
     * @return array|WP_Error Bild-Daten oder Fehler
     */
    public function import_image($file_path, $copy_to_temp = true) {
        // Prüfen, ob die Datei existiert
        if (!file_exists($file_path)) {
            return new WP_Error('file_not_found', __('Die angegebene Datei existiert nicht.', 'yprint-designtool'));
        }
        
        // MIME-Typ der Datei prüfen
        $mime_type = $this->get_mime_type($file_path);
        
        if (!in_array($mime_type, $this->allowed_mime_types)) {
            return new WP_Error('invalid_mime_type', __('Ungültiger Dateityp. Erlaubt sind: JPEG, PNG, GIF, BMP, WebP und SVG.', 'yprint-designtool'));
        }
        
        // Dateigröße prüfen
        $max_size = $this->get_max_upload_size();
        $file_size = filesize($file_path);
        
        if ($file_size > $max_size) {
            return new WP_Error(
                'file_too_large', 
                sprintf(
                    __('Die Datei ist zu groß. Maximale Größe: %s MB.', 'yprint-designtool'),
                    number_format($max_size / (1024 * 1024), 1)
                )
            );
        }
        
        // Bei Bedarf in temporäres Verzeichnis kopieren
        $temp_file = $file_path;
        
        if ($copy_to_temp) {
            $temp_file = $this->copy_to_temp_directory($file_path);
            
            if (is_wp_error($temp_file)) {
                return $temp_file;
            }
        }
        
        // Bild-Dimensionen ermitteln
        $dimensions = $this->get_image_dimensions($temp_file, $mime_type);
        
        if (is_wp_error($dimensions)) {
            if ($copy_to_temp) {
                @unlink($temp_file);
            }
            return $dimensions;
        }
        
        // URL für vorübergehenden Zugriff erstellen
        $upload_dir = wp_upload_dir();
        $file_url = str_replace($upload_dir['basedir'], $upload_dir['baseurl'], $temp_file);
        
        // Bild-Daten zurückgeben
        return array(
            'id' => uniqid('img_'),
            'file_path' => $temp_file,
            'file_url' => $file_url,
            'file_name' => basename($file_path),
            'mime_type' => $mime_type,
            'width' => $dimensions['width'],
            'height' => $dimensions['height'],
            'is_svg' => $mime_type === 'image/svg+xml'
        );
    }
    
    /**
     * Importiert ein Bild aus einer hochgeladenen Datei ($_FILES)
     * 
     * @param array $file Datei-Array aus $_FILES
     * @return array|WP_Error Bild-Daten oder Fehler
     */
    public function import_uploaded_image($file) {
        // Prüfen, ob die Datei gültig ist
        if (!isset($file['tmp_name']) || !isset($file['name']) || !isset($file['type'])) {
            return new WP_Error('invalid_file', __('Ungültige Datei.', 'yprint-designtool'));
        }
        
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return new WP_Error('upload_error', __('Fehler beim Hochladen der Datei: ' . $file['error'], 'yprint-designtool'));
        }
        
        // MIME-Typ der Datei prüfen
        if (!in_array($file['type'], $this->allowed_mime_types)) {
            return new WP_Error('invalid_mime_type', __('Ungültiger Dateityp. Erlaubt sind: JPEG, PNG, GIF, BMP, WebP und SVG.', 'yprint-designtool'));
        }
        
        // Dateigröße prüfen
        $max_size = $this->get_max_upload_size();
        
        if ($file['size'] > $max_size) {
            return new WP_Error(
                'file_too_large', 
                sprintf(
                    __('Die Datei ist zu groß. Maximale Größe: %s MB.', 'yprint-designtool'),
                    number_format($max_size / (1024 * 1024), 1)
                )
            );
        }
        
        // In temporäres Verzeichnis kopieren
        $temp_file = $this->copy_to_temp_directory($file['tmp_name'], sanitize_file_name($file['name']));
        
        if (is_wp_error($temp_file)) {
            return $temp_file;
        }
        
        // Bild-Dimensionen ermitteln
        $dimensions = $this->get_image_dimensions($temp_file, $file['type']);
        
        if (is_wp_error($dimensions)) {
            @unlink($temp_file);
            return $dimensions;
        }
        
        // URL für vorübergehenden Zugriff erstellen
        $upload_dir = wp_upload_dir();
        $file_url = str_replace($upload_dir['basedir'], $upload_dir['baseurl'], $temp_file);
        
        // Bild-Daten zurückgeben
        return array(
            'id' => uniqid('img_'),
            'file_path' => $temp_file,
            'file_url' => $file_url,
            'file_name' => sanitize_file_name($file['name']),
            'mime_type' => $file['type'],
            'width' => $dimensions['width'],
            'height' => $dimensions['height'],
            'is_svg' => $file['type'] === 'image/svg+xml'
        );
    }
    
    /**
     * Kopiert eine Datei in ein temporäres Verzeichnis
     * 
     * @param string $file_path Pfad zur Datei
     * @param string $file_name Optional: Neuer Dateiname
     * @return string|WP_Error Pfad zur kopierten Datei oder Fehler
     */
    private function copy_to_temp_directory($file_path, $file_name = null) {
        // Temporäres Verzeichnis erstellen/prüfen
        $upload_dir = wp_upload_dir();
        $temp_dir = $upload_dir['basedir'] . '/yprint-designtool/temp';
        
        if (!file_exists($temp_dir)) {
            wp_mkdir_p($temp_dir);
        }
        
        // Dateinamen erstellen
        if ($file_name === null) {
            $file_name = uniqid() . '-' . basename($file_path);
        } else {
            $file_name = uniqid() . '-' . $file_name;
        }
        
        $temp_file = $temp_dir . '/' . $file_name;
        
        // Datei kopieren
        if (!copy($file_path, $temp_file)) {
            return new WP_Error('copy_failed', __('Fehler beim Kopieren der Datei.', 'yprint-designtool'));
        }
        
        return $temp_file;
    }
    
    /**
     * Ermittelt die Dimensionen eines Bildes
     * 
     * @param string $file_path Pfad zur Bilddatei
     * @param string $mime_type MIME-Typ der Datei
     * @return array|WP_Error Dimensionen als Array oder Fehler
     */
    private function get_image_dimensions($file_path, $mime_type) {
        if ($mime_type === 'image/svg+xml') {
            // SVG-Dimensionen aus der Datei auslesen
            $svg_dimensions = $this->get_svg_dimensions($file_path);
            
            if (is_wp_error($svg_dimensions)) {
                return $svg_dimensions;
            }
            
            return $svg_dimensions;
        } else {
            // Normales Bild
            $image_size = getimagesize($file_path);
            
            if ($image_size === false) {
                return new WP_Error('invalid_image', __('Ungültiges Bild oder Bild konnte nicht gelesen werden.', 'yprint-designtool'));
            }
            
            return array(
                'width' => $image_size[0],
                'height' => $image_size[1]
            );
        }
    }
    
    /**
     * Ermittelt die Dimensionen einer SVG-Datei
     * 
     * @param string $file_path Pfad zur SVG-Datei
     * @return array|WP_Error Dimensionen als Array oder Fehler
     */
    private function get_svg_dimensions($file_path) {
        // SVG-Inhalt lesen
        $svg_content = file_get_contents($file_path);
        
        if ($svg_content === false) {
            return new WP_Error('read_svg_failed', __('SVG-Datei konnte nicht gelesen werden.', 'yprint-designtool'));
        }
        
        // Mit SimpleXML parsen
        libxml_use_internal_errors(true);
        $svg = simplexml_load_string($svg_content);
        
        if ($svg === false) {
            return new WP_Error('invalid_svg', __('Ungültige SVG-Datei.', 'yprint-designtool'));
        }
        
        // Attribute prüfen
        $attributes = $svg->attributes();
        
        $width = isset($attributes->width) ? (string) $attributes->width : null;
        $height = isset($attributes->height) ? (string) $attributes->height : null;
        $viewBox = isset($attributes->viewBox) ? (string) $attributes->viewBox : null;
        
        // Wenn viewBox vorhanden ist, aber keine Breite/Höhe
        if (($width === null || $height === null) && $viewBox !== null) {
            $viewBoxParts = explode(' ', $viewBox);
            
            if (count($viewBoxParts) === 4) {
                if ($width === null) {
                    $width = $viewBoxParts[2];
                }
                
                if ($height === null) {
                    $height = $viewBoxParts[3];
                }
            }
        }
        
        // Default-Werte, falls keine Dimensionen gefunden wurden
        if ($width === null || $height === null) {
            $width = 300;
            $height = 300;
        }
        
        // Einheiten entfernen und in Zahlen umwandeln
        $width = $this->convert_dimension_to_pixels($width);
        $height = $this->convert_dimension_to_pixels($height);
        
        return array(
            'width' => $width,
            'height' => $height
        );
    }
    
    /**
     * Konvertiert eine Dimension mit Einheit in Pixel
     * 
     * @param string $dimension Dimension als String (z. B. "100px", "10cm", "50%")
     * @return float Dimension in Pixeln
     */
    private function convert_dimension_to_pixels($dimension) {
        // Wenn keine Einheit angegeben, als Pixel interpretieren
        if (is_numeric($dimension)) {
            return floatval($dimension);
        }
        
        // Zahl und Einheit extrahieren
        preg_match('/^([0-9.]+)([a-z%]*)$/', $dimension, $matches);
        
        if (count($matches) < 2) {
            return 300; // Default-Wert
        }
        
        $value = floatval($matches[1]);
        $unit = isset($matches[2]) ? $matches[2] : '';
        
        // Einheiten in Pixel umrechnen
        switch ($unit) {
            case 'px':
                return $value;
            case 'cm':
                return $value * 37.8; // 1cm = 37.8px
            case 'mm':
                return $value * 3.78; // 1mm = 3.78px
            case 'in':
                return $value * 96; // 1in = 96px
            case 'pt':
                return $value * 1.33; // 1pt = 1.33px
            case 'pc':
                return $value * 16; // 1pc = 16px
            case '%':
                return $value * 3; // % ist relativ, wir nehmen 300px als Basis
            default:
                return $value;
        }
    }
    
    /**
     * Ermittelt den MIME-Typ einer Datei
     * 
     * @param string $file_path Pfad zur Datei
     * @return string MIME-Typ
     */
    private function get_mime_type($file_path) {
        // Dateiendung abrufen
        $file_extension = strtolower(pathinfo($file_path, PATHINFO_EXTENSION));
        
        // MIME-Typ basierend auf der Dateiendung
        $mime_types = array(
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'bmp' => 'image/bmp',
            'webp' => 'image/webp',
            'svg' => 'image/svg+xml'
        );
        
        if (isset($mime_types[$file_extension])) {
            return $mime_types[$file_extension];
        }
        
        // Falls keine Übereinstimmung gefunden wird, MIME-Typ von PHP ermitteln lassen
        if (function_exists('mime_content_type')) {
            return mime_content_type($file_path);
        }
        
        // Standard-MIME-Typ zurückgeben
        return 'application/octet-stream';
    }
    
    /**
     * Bereinigt temporäre Dateien
     */
    public function cleanup_temp_files() {
        $upload_dir = wp_upload_dir();
        $temp_dir = $upload_dir['basedir'] . '/yprint-designtool/temp';
        
        if (!file_exists($temp_dir)) {
            return;
        }
        
        $files = glob($temp_dir . '/*');
        $now = time();
        
        foreach ($files as $file) {
            if (is_file($file)) {
                // Dateien löschen, die älter als eine Stunde sind
                if ($now - filemtime($file) >= 3600) {
                    @unlink($file);
                }
            }
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